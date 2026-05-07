import { db } from "../config/db.js";
import { toMessageDTOArray } from "../dto/message.dto.js";
import { MessageRead } from "../modeles/message_read.model.js";

export const createMessageRead = async (message_read) => {
    const [result] = await db.query(
        `INSERT INTO message_read (IdMessage, IdUtilisateur, ReadAt)
         VALUES (?, ?, NOW())`,
        [message_read.IdMessage, message_read.IdUtilisateur]
    );
    return result.insertId;
};

export const getAllMessageReads = async () => {
    const [rows] = await db.query("SELECT * FROM message_read");
    return rows.map((row) => new MessageRead(row));
};

export const getMessageReadById = async (id) => {
    const [rows] = await db.query("SELECT * FROM message_read WHERE Id = ?", [id]);
    if (!rows[0]) return null;
    return new MessageRead(rows[0]);
};

export const updateMessageRead = async (id, message_read) => {
    const [result] = await db.query(
        `UPDATE message_read SET IdMessage = ?, IdUtilisateur = ? WHERE Id = ?`,
        [message_read.IdMessage, message_read.IdUtilisateur, id]
    );
    return result.affectedRows;
};

export const deleteMessageRead = async (id) => {
    const [result] = await db.query("DELETE FROM message_read WHERE Id = ?", [id]);
    return result.affectedRows;
};

export const getMessageReadsByMessageId = async (messageId) => {
    const [rows] = await db.query("SELECT * FROM message_read WHERE IdMessage = ?", [messageId]);
    return rows;
};

// Insère un message en base de données depuis Socket.IO, puis le retourne
// avec les informations de l'expéditeur pour pouvoir le diffuser immédiatement.
export const saveMessageFromSocket = async (messageData) => {
    const { IdConversation, SenderId, Contenu } = messageData;

    const [result] = await db.query(
        `INSERT INTO message (IdConversation, SenderId, Contenu, CreatedAt)
         VALUES (?, ?, ?, NOW())`,
        [IdConversation, SenderId, Contenu]
    );

    const messageId = result.insertId;

    const [rows] = await db.query(
        `SELECT m.*, u.Prenom, u.Nom
         FROM message m
         JOIN utilisateur u ON m.SenderId = u.Id
         WHERE m.Id = ?`,
        [messageId]
    );

    return rows[0];
};

// Récupère les messages d'une conversation avec l'historique de lecture.
// On fait deux requêtes séparées (messages + lectures) pour éviter un produit cartésien
// et on assemble le résultat côté JavaScript.
export const getMessagesByConversation = async (conversationId, limit = 50, offset = 0) => {
    const [messages] = await db.query(
        `SELECT
            m.Id,
            m.IdConversation,
            m.SenderId,
            m.Contenu,
            m.CreatedAt,
            u.Prenom AS senderPrenom,
            u.Nom    AS senderNom,
            u.Photo  AS senderAvatar,
            u.clerkId AS senderClerkId
         FROM message m
         JOIN utilisateur u ON m.SenderId = u.Id
         WHERE m.IdConversation = ?
         ORDER BY m.CreatedAt ASC
         LIMIT ? OFFSET ?`,
        [conversationId, limit, offset]
    );

    if (messages.length === 0) return [];

    // Récupère les entrées de lecture pour tous ces messages en une seule requête
    const messageIds = messages.map((m) => m.Id);
    const [reads] = await db.query(
        `SELECT IdMessage, IdUtilisateur FROM message_read WHERE IdMessage IN (?)`,
        [messageIds]
    );

    // Construit un index messageId → [userId, ...] pour un assemblage rapide
    const readByMap = {};
    reads.forEach((read) => {
        if (!readByMap[read.IdMessage]) readByMap[read.IdMessage] = [];
        readByMap[read.IdMessage].push(read.IdUtilisateur);
    });

    return messages.map((msg) => ({
        Id: msg.Id,
        IdConversation: msg.IdConversation,
        SenderId: msg.SenderId,
        Contenu: msg.Contenu,
        CreatedAt: msg.CreatedAt,
        senderName: `${msg.senderPrenom || ""} ${msg.senderNom || ""}`.trim(),
        senderAvatar: msg.senderAvatar,
        senderClerkId: msg.senderClerkId,
        readBy: readByMap[msg.Id] || [],
    }));
};

// Marque un message spécifique comme lu par un utilisateur.
// On n'insère rien si l'utilisateur est l'expéditeur (on ne peut pas lire son propre message)
// et on vérifie l'unicité pour éviter les doublons.
export const markMessageAsRead = async (messageId, userId, senderId = null) => {
    if (senderId && userId === senderId) {
        return { success: true, skipped: true };
    }

    const [existing] = await db.query(
        "SELECT Id FROM message_read WHERE IdMessage = ? AND IdUtilisateur = ?",
        [messageId, userId]
    );

    if (existing.length === 0) {
        await db.query(
            `INSERT INTO message_read (IdMessage, IdUtilisateur, ReadAt) VALUES (?, ?, NOW())`,
            [messageId, userId]
        );
    }

    return { success: true };
};

// Marque tous les messages non lus d'une conversation comme lus pour un utilisateur donné.
// Appelé quand l'utilisateur rejoint une room Socket.IO.
export const markConversationMessagesAsRead = async (conversationId, userId) => {
    const [messages] = await db.query(
        `SELECT Id FROM message WHERE IdConversation = ? AND SenderId != ?`,
        [conversationId, userId]
    );

    for (const message of messages) {
        await markMessageAsRead(message.Id, userId, message.SenderId);
    }

    return { success: true, count: messages.length };
};

// Compte les messages non lus pour un utilisateur, globalement ou par conversation.
// Utilisé pour afficher les badges de notification dans l'interface.
export const getUnreadCount = async (userId, conversationId = null) => {
    let query = `
        SELECT COUNT(*) AS count
        FROM message m
        LEFT JOIN message_read mr ON m.Id = mr.IdMessage AND mr.IdUtilisateur = ?
        WHERE m.SenderId != ? AND mr.Id IS NULL
    `;
    const params = [userId, userId];

    if (conversationId) {
        query += " AND m.IdConversation = ?";
        params.push(conversationId);
    }

    const [rows] = await db.query(query, params);
    return rows[0].count;
};