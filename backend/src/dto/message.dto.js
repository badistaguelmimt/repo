// Les DTOs servent à transformer les objets bruts de la base de données
// en un format normalisé et stable pour le frontend.
// Cela évite d'exposer directement la structure interne de la BDD.

// Transforme un message brut (BDD) en objet standardisé pour le frontend
export const toMessageDTO = (message, options = {}) => {
    return {
        id: message.Id,
        conversationId: message.IdConversation || message.conversationId,
        senderId: message.SenderId || message.senderId,
        content: message.Contenu || message.content || message.message,
        createdAt: message.CreatedAt || message.createdAt || message.timestamp,
        senderName: options.senderName || null,
        senderAvatar: options.senderAvatar || null,
        readBy: options.readBy || [],
        readCount: options.readBy?.length || 0,
    };
};

export const toMessageDTOArray = (messages, options = {}) => {
    return messages.map((msg) => toMessageDTO(msg, options));
};

// Variante utilisée pour les messages déjà enrichis par une jointure SQL
// (le senderName et readBy sont directement dans l'objet message)
export const toMessageDTOPmo = (message) => {
    return {
        id: message.Id,
        conversationId: message.IdConversation || message.conversationId,
        senderId: message.SenderId || message.senderId,
        content: message.Contenu || message.content || message.message,
        createdAt: message.CreatedAt || message.createdAt || message.timestamp,
        senderName: message.senderName || message.SenderName || null,
        senderAvatar: message.senderAvatar || null,
        readBy: message.readBy || [],
        readCount: (message.readBy || []).length,
    };
};

export const toMessageDTOArrayPmo = (messages) => {
    if (!Array.isArray(messages)) return [];
    return messages.map((msg) => toMessageDTOPmo(msg));
};