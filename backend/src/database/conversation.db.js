import { db } from "../config/db.js";
import { Conversation } from "../modeles/conversation.model.js";

export const createConversation = async (conversation) => {
    const [result] = await db.query(
        `INSERT INTO conversation (Type, CreatedAt, CreatedBy) 
        VALUES (?, NOW(), ?)`,
        [
            conversation.Type,
            
            conversation.CreatedBy
        ]
    );

    return result.insertId;
}

export const getAllConversations = async () => {
  const [rows] = await db.query("SELECT * FROM conversation");
  return rows.map(row => new Conversation(row));
};

export const getConversationById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM conversation WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Conversation(rows[0]);
};

export const updateConversation = async (id, conversation) => {
  const [result] = await db.query(
    `UPDATE conversation SET 
      Type = ?, 
      CreatedAt = ?,
      CreatedBy = ?
     WHERE Id = ?`,
    [
      conversation.Type,
      conversation.CreatedAt,
      conversation.CreatedBy,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteConversation = async (id) => {
  const [result] = await db.query(
    "DELETE FROM conversation WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getConversationsByUtilisateurId = async (utilisateurId) => {
    const [rows] = await db.query(
        `SELECT
            c.Id,
            c.Type,
            c.CreatedAt,
            c.CreatedBy,
            -- Nom = prénoms+noms des AUTRES participants (pas l'utilisateur courant)
            GROUP_CONCAT(DISTINCT CONCAT(u.Prenom, ' ', u.Nom) SEPARATOR ', ') AS Nom,
            -- Aperçu du dernier message
            (
                SELECT m.Contenu
                FROM message m
                WHERE m.IdConversation = c.Id
                ORDER BY m.CreatedAt DESC
                LIMIT 1
            ) AS DernierMessage,
            -- Date du dernier message (pour tri)
            (
                SELECT m.CreatedAt
                FROM message m
                WHERE m.IdConversation = c.Id
                ORDER BY m.CreatedAt DESC
                LIMIT 1
            ) AS DernierMessageAt
        FROM conversation c
        -- L'utilisateur est participant
        JOIN conversation_participant cp  ON cp.IdConversation  = c.Id AND cp.IdUtilisateur = ?
        -- Les AUTRES participants
        JOIN conversation_participant cp2 ON cp2.IdConversation = c.Id AND cp2.IdUtilisateur != ?
        JOIN utilisateur u ON u.Id = cp2.IdUtilisateur
        GROUP BY c.Id
        ORDER BY DernierMessageAt DESC, c.CreatedAt DESC`,
        [utilisateurId, utilisateurId]
    );
    return rows.map(row => ({
        Id:              row.Id,
        Type:            row.Type,
        CreatedAt:       row.CreatedAt,
        CreatedBy:       row.CreatedBy,
        Nom:             row.Nom || `Conversation #${row.Id}`,
        DernierMessage:  row.DernierMessage ? String(row.DernierMessage).substring(0, 60) + (String(row.DernierMessage).length > 60 ? '…' : '') : null,
        DernierMessageAt: row.DernierMessageAt,
    }));
}

/**
 * Trouve ou crée une conversation directe entre deux utilisateurs.
 * Si une conversation 'direct' avec exactement ces deux participants existe déjà, la retourne.
 * Sinon, la crée et ajoute les deux participants.
 */
export const findOrCreateDirectConversation = async (userIdA, userIdB) => {
    // Chercher une conversation directe existante avec ces deux participants
    const [existing] = await db.query(
        `SELECT c.Id
         FROM conversation c
         JOIN conversation_participant cp1 ON cp1.IdConversation = c.Id AND cp1.IdUtilisateur = ?
         JOIN conversation_participant cp2 ON cp2.IdConversation = c.Id AND cp2.IdUtilisateur = ?
         WHERE c.Type = 'direct'
         LIMIT 1`,
        [userIdA, userIdB]
    );

    if (existing.length > 0) {
        return { conversationId: existing[0].Id, created: false };
    }

    // Créer la conversation
    const [result] = await db.query(
        `INSERT INTO conversation (Type, CreatedAt, CreatedBy) VALUES ('direct', NOW(), ?)`,
        [userIdA]
    );
    const conversationId = result.insertId;

    // Ajouter les deux participants (INSERT multi-ligne avec les valeurs littérales pour Statut)
    await db.query(
        `INSERT INTO conversation_participant (IdConversation, IdUtilisateur, Statut, Role, JoinedAt)
         VALUES (?, ?, 1, 'member', NOW())`,
        [conversationId, userIdA]
    );
    await db.query(
        `INSERT INTO conversation_participant (IdConversation, IdUtilisateur, Statut, Role, JoinedAt)
         VALUES (?, ?, 1, 'member', NOW())`,
        [conversationId, userIdB]
    );

    return { conversationId, created: true };
}