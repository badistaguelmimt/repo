import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { getUtilisateurByClerkId } from "../database/utilisateur.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";
import {
    saveMessageFromSocket,
    getMessagesByConversation,
    markConversationMessagesAsRead,
    markMessageAsRead,
} from "../database/message_read.db.js";

let io;

/**
 * Convertit une ligne BDD (PascalCase) en DTO frontend (camelCase).
 * Le frontend attend : { id, conversationId, senderId, content, senderName, createdAt, readBy }
 */
const toMessageDTO = (row, readBy = []) => ({
    id:             row.Id             ?? row.id,
    conversationId: row.IdConversation ?? row.conversationId,
    senderId:       row.SenderId       ?? row.senderId,
    content:        row.Contenu        ?? row.content,
    senderName:     row.senderName ?? (`${row.Prenom ?? ""} ${row.Nom ?? ""}`.trim() || null),
    senderClerkId:  row.senderClerkId  ?? null,
    createdAt:      row.CreatedAt      ?? row.createdAt ?? new Date().toISOString(),
    readBy:         row.readBy         ?? readBy,
});

/**
 * Initialise Socket.io — aligné sur le contrat du frontend (useChat.js / ChatRoom.jsx).
 *
 * Événements acceptés (frontend → backend) :
 *   join_conversation({ conversationId }, callback) → callback({ success, history })
 *   send_message({ conversationId, content }, callback) → callback({ success, error? })
 *   mark_read({ conversationId, messageId })
 *   typing({ conversationId, isTyping })
 *
 * Événements émis (backend → frontend) :
 *   message_history(MessageDTO[])       — historique à l'ouverture
 *   new_message(MessageDTO)             — nouveau message temps réel
 *   messages_read({ userId })           — accusé de lecture
 *   user_typing({ userId, userName, isTyping, conversationId })
 *   user_joined / user_left
 */
export const initSocket = (server, { origin }) => {
    io = new Server(server, {
        cors: { origin, credentials: true },
    });

    // ── Middleware d'authentification JWT Clerk ───────────────────────────────
    // Le frontend envoie { auth: { token, userId } } (SocketContext.jsx)
    io.use(async (socket, next) => {
        try {
            const token  = socket.handshake.auth?.token;
            const userId = socket.handshake.auth?.userId;

            if (token) {
                // Mode sécurisé : vérification JWT
                const payload = await verifyToken(token, {
                    secretKey: process.env.CLERK_SECRET_KEY,
                });
                if (!payload?.sub) return next(new Error("Token invalide"));
                const user = await getUtilisateurByClerkId(payload.sub);
                if (!user) return next(new Error("Utilisateur introuvable"));
                socket.user = user;
                return next();
            }

            if (userId) {
                // Fallback : userId Clerk brut (compatibilité ascendante)
                const user = await getUtilisateurByClerkId(userId);
                if (!user) return next(new Error("Utilisateur introuvable"));
                socket.user = user;
                return next();
            }

            return next(new Error("Authentification manquante"));
        } catch (err) {
            console.error("[Socket] Auth failed:", err.message);
            next(new Error("Authentification échouée"));
        }
    });

    // ── Connexions ────────────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        console.log(`✅ [Socket] User ${socket.user.Id} connecté (${socket.id})`);

        // ── join_conversation ─────────────────────────────────────────────────
        // Frontend : socket.emit('join_conversation', { conversationId }, callback)
        // Callback attendu : { success: bool, history: MessageDTO[], error?: string }
        socket.on("join_conversation", async (data, callback) => {
            // Accepte { conversationId } ou un id brut (string/number)
            const conversationId = data?.conversationId ?? data;
            const ack = typeof callback === "function" ? callback : () => {};

            try {
                const isMember = await isUserInConversation(conversationId, socket.user.Id);
                if (!isMember) {
                    return ack({ success: false, error: "Accès non autorisé à cette conversation" });
                }

                // Quitter la room précédente
                if (socket.currentConversationId && socket.currentConversationId !== conversationId) {
                    socket.leave(`conv_${socket.currentConversationId}`);
                }

                socket.join(`conv_${conversationId}`);
                socket.currentConversationId = conversationId;

                // Récupérer l'historique et convertir en DTO frontend
                const rawHistory = await getMessagesByConversation(conversationId, 50);
                const history = rawHistory.map(row => toMessageDTO(row));

                // Marquer les messages de la conv comme lus
                await markConversationMessagesAsRead(conversationId, socket.user.Id);

                // Répondre via callback (pattern attendu par useChat.js)
                ack({ success: true, history });

                // Notifier les autres participants
                socket.to(`conv_${conversationId}`).emit("user_joined", {
                    userId:   socket.user.Id,
                    userName: `${socket.user.Prenom ?? ""} ${socket.user.Nom ?? ""}`.trim(),
                });

            } catch (error) {
                console.error("[Socket] join_conversation error:", error);
                ack({ success: false, error: "Impossible de rejoindre la conversation" });
            }
        });

        // ── send_message ──────────────────────────────────────────────────────
        // Frontend : socket.emit('send_message', { conversationId, content }, callback)
        // Callback attendu : { success: bool, error?: string }
        socket.on("send_message", async (data, callback) => {
            const ack = typeof callback === "function" ? callback : () => {};
            const { conversationId, content } = data ?? {};

            if (!conversationId || !content?.trim()) {
                return ack({ success: false, error: "Données manquantes (conversationId, content)" });
            }

            try {
                const isMember = await isUserInConversation(conversationId, socket.user.Id);
                if (!isMember) {
                    return ack({ success: false, error: "Accès non autorisé" });
                }

                // Sauvegarder en BDD
                const saved = await saveMessageFromSocket({
                    IdConversation: conversationId,
                    SenderId:       socket.user.Id,
                    Contenu:        content.trim(),
                });

                const payload = toMessageDTO(saved, []);

                // Confirmer l'envoi à l'expéditeur
                ack({ success: true, message: payload });

                // Diffuser aux autres participants
                io.to(`conv_${conversationId}`).emit("new_message", payload);

            } catch (error) {
                console.error("[Socket] send_message error:", error);
                ack({ success: false, error: "Échec de l'envoi du message" });
            }
        });

        // ── mark_read ─────────────────────────────────────────────────────────
        // Frontend : socket.emit('mark_read', { conversationId, messageId? })
        // Alias de mark_seen — notifie les autres avec 'messages_read'
        socket.on("mark_read", async ({ conversationId, messageId } = {}) => {
            try {
                if (messageId) {
                    await markMessageAsRead(messageId, socket.user.Id);
                } else if (conversationId) {
                    await markConversationMessagesAsRead(conversationId, socket.user.Id);
                }

                // Notifier les autres participants (nom de l'event attendu par le frontend)
                socket.to(`conv_${conversationId}`).emit("messages_read", {
                    userId: socket.user.Id,
                    messageId,
                });
            } catch (err) {
                console.error("[Socket] mark_read error:", err);
            }
        });

        // ── typing ────────────────────────────────────────────────────────────
        // Frontend : socket.emit('typing', { conversationId, isTyping: bool })
        // Diffuse aux autres participants : 'user_typing'
        socket.on("typing", ({ conversationId, isTyping } = {}) => {
            if (!conversationId) return;
            socket.to(`conv_${conversationId}`).emit("user_typing", {
                userId:         socket.user.Id,
                userName:       `${socket.user.Prenom ?? ""} ${socket.user.Nom ?? ""}`.trim(),
                isTyping:       Boolean(isTyping),
                conversationId,
            });
        });

        // ── disconnect ────────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            console.log(`🔌 [Socket] User ${socket.user?.Id} déconnecté`);

            if (socket.currentConversationId) {
                io.to(`conv_${socket.currentConversationId}`).emit("user_left", {
                    userId:   socket.user?.Id,
                    userName: `${socket.user?.Prenom ?? ""} ${socket.user?.Nom ?? ""}`.trim(),
                });
            }
        });
    });
};

/** Retourne l'instance Socket.io (pour diffusion depuis les contrôleurs). */
export const getIO = () => io;
