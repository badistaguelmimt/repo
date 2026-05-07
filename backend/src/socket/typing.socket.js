import { isUserInConversation } from "../database/conversation_participant.db.js";

// Stocke les timeouts par utilisateur/conversation pour auto-arrêter l'indicateur "en train d'écrire".
// Clé : `${userId}_${conversationId}`
const typingTimeouts = new Map();

const clearTypingTimeout = (userId, conversationId) => {
    const key = `${userId}_${conversationId}`;
    const existing = typingTimeouts.get(key);
    if (existing) {
        clearTimeout(existing);
        typingTimeouts.delete(key);
    }
};

// Si l'utilisateur s'arrête de taper sans envoyer d'événement explicite,
// on émet automatiquement isTyping: false après 13 secondes
const setTypingTimeout = (socket, userId, conversationId, userName) => {
    const key = `${userId}_${conversationId}`;
    const timeout = setTimeout(() => {
        socket.to(`conv_${conversationId}`).emit("user_typing", {
            userId,
            userName,
            isTyping: false,
            conversationId,
        });
        typingTimeouts.delete(key);
    }, 13000);
    typingTimeouts.set(key, timeout);
};

// Nettoie tous les timeouts d'un utilisateur quand il se déconnecte
export const clearAllUserTypingTimeouts = (userId) => {
    for (const [key, timeout] of typingTimeouts.entries()) {
        if (key.startsWith(`${userId}_`)) {
            clearTimeout(timeout);
            typingTimeouts.delete(key);
        }
    }
};

// Enregistre l'événement "typing" pour une socket donnée.
// Quand un utilisateur tape, on le diffuse aux autres membres de la conversation,
// avec un arrêt automatique si l'événement isTyping: false n'arrive pas.
export const setupTypingEvents = (socket) => {
    socket.on("typing", async (data) => {
        const { conversationId, isTyping } = data;

        if (!conversationId || typeof isTyping !== "boolean") return;

        try {
            const isMember = await isUserInConversation(conversationId, socket.user.Id);
            if (!isMember) return;

            const userId = socket.user.Id;
            const userName = `${socket.user.Prenom} ${socket.user.Nom}`.trim();

            if (isTyping) {
                clearTypingTimeout(userId, conversationId);

                socket.to(`conv_${conversationId}`).emit("user_typing", {
                    userId,
                    userName,
                    isTyping: true,
                    conversationId,
                });

                setTypingTimeout(socket, userId, conversationId, userName);
            } else {
                clearTypingTimeout(userId, conversationId);

                socket.to(`conv_${conversationId}`).emit("user_typing", {
                    userId,
                    userName,
                    isTyping: false,
                    conversationId,
                });
            }
        } catch (err) {
            console.error("Erreur événement typing :", err);
        }
    });
};