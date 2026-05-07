import { isUserInConversation } from "../database/conversation_participant.db.js";
import {
    saveMessageFromSocket,
    getMessagesByConversation,
    markConversationMessagesAsRead,
} from "../database/message_read.db.js";
import { toMessageDTOArrayPmo, toMessageDTOPmo } from "../dto/message.dto.js";
import { socketAuth } from "../midleware/auth.midleware.js";
import { setupTypingEvents } from "./typing.socket.js";

// Configure tous les événements Socket.IO liés au chat.
// Cette fonction reçoit l'instance io et branche l'authentification,
// puis enregistre les handlers pour chaque événement métier.
export const setupChatSocket = (io) => {

    // Chaque connexion socket doit être authentifiée via un token Clerk
    io.use(socketAuth);

    io.on("connection", (socket) => {
        console.log(`Utilisateur ${socket.user.Id} (${socket.user.Prenom} ${socket.user.Nom}) connecté`);

        // Active les événements "en train d'écrire" pour cette socket
        setupTypingEvents(socket);

        // Un utilisateur rejoint une conversation : on vérifie qu'il en est membre,
        // on le fait entrer dans la "room" Socket.IO correspondante,
        // et on lui envoie l'historique des 50 derniers messages.
        socket.on("join_conversation", async (data, callback) => {
            const { conversationId } = data;

            try {
                const isMember = await isUserInConversation(conversationId, socket.user.Id);
                if (!isMember) {
                    return callback({ success: false, error: "Vous n'êtes pas membre de cette conversation" });
                }

                // Quitter la room précédente si l'utilisateur en avait une active
                if (socket.currentConversationId) {
                    socket.leave(`conv_${socket.currentConversationId}`);
                }

                socket.join(`conv_${conversationId}`);
                socket.currentConversationId = conversationId;

                // Charger l'historique et marquer les messages comme lus
                const history = await getMessagesByConversation(conversationId, 50, 0);
                await markConversationMessagesAsRead(conversationId, socket.user.Id);

                // Prévenir les autres membres que cet utilisateur a rejoint
                socket.to(`conv_${conversationId}`).emit("user_joined", {
                    userId: socket.user.Id,
                    userName: `${socket.user.Prenom} ${socket.user.Nom}`.trim(),
                    userAvatar: socket.user.Photo,
                });

                if (typeof callback === "function") {
                    callback({ success: true, history: toMessageDTOArrayPmo(history) });
                }
            } catch (err) {
                console.error("Erreur join_conversation :", err);
                if (typeof callback === "function") {
                    callback({ success: false, error: err.message });
                }
            }
        });

        // Envoi d'un message : sauvegardé en base, puis diffusé à toute la room
        socket.on("send_message", async (data, callback) => {
            const { conversationId, content } = data;

            if (!conversationId || !content?.trim()) {
                return callback({ success: false, error: "conversationId ou contenu manquant" });
            }

            try {
                const isMember = await isUserInConversation(conversationId, socket.user.Id);
                if (!isMember) {
                    return callback({ success: false, error: "Vous n'êtes pas membre de cette conversation" });
                }

                const savedMessage = await saveMessageFromSocket({
                    IdConversation: conversationId,
                    SenderId: socket.user.Id,
                    Contenu: content.trim(),
                });

                // On enrichit le message sauvegardé avec les infos de l'expéditeur
                // avant de le transformer en DTO (format attendu par le frontend)
                savedMessage.senderName = `${socket.user.Prenom} ${socket.user.Nom}`.trim();
                savedMessage.senderAvatar = socket.user.Photo;
                savedMessage.readBy = [];

                const messagePayload = toMessageDTOPmo(savedMessage);

                // Diffuser à tous les membres de la room, y compris l'expéditeur
                io.to(`conv_${conversationId}`).emit("new_message", messagePayload);

                if (typeof callback === "function") {
                    callback({ success: true, message: messagePayload });
                }
            } catch (err) {
                console.error("Erreur send_message :", err);
                if (typeof callback === "function") {
                    callback({ success: false, error: err.message });
                }
            }
        });

        // Marque tous les messages d'une conversation comme lus,
        // et notifie les autres membres pour qu'ils mettent à jour les indicateurs de lecture.
        socket.on("mark_read", async (data, callback) => {
            const { conversationId, messageId } = data;

            try {
                await markConversationMessagesAsRead(conversationId, socket.user.Id);

                socket.to(`conv_${conversationId}`).emit("messages_read", {
                    userId: socket.user.Id,
                    upToMessageId: messageId,
                });

                if (typeof callback === "function") {
                    callback({ success: true });
                }
            } catch (err) {
                console.error("Erreur mark_read :", err);
                if (typeof callback === "function") {
                    callback({ success: false, error: err.message });
                }
            }
        });

        // À la déconnexion, on prévient les autres membres de la room active
        socket.on("disconnect", () => {
            console.log(`Utilisateur ${socket.user.Id} déconnecté`);
            if (socket.currentConversationId) {
                socket.to(`conv_${socket.currentConversationId}`).emit("user_left", {
                    userId: socket.user.Id,
                    userName: `${socket.user.Prenom} ${socket.user.Nom}`.trim(),
                });
            }
        });
    });
};