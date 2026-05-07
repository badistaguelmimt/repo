import { db } from "../config/db.js";
import { ConversationParticipant } from "../modeles/conversation_participant.model.js";
import { Utilisateur } from "../modeles/utilisateur.model.js";

export const createConversationParticipant = async (conversation_participant) => {
    const [result] = await db.query(
        `INSERT INTO conversation_participant (IdConversation, IdUtilisateur, Statut, Role, JoinedAt) 
        VALUES (?, ?, ?, ?, NOW())`,
        [
            conversation_participant.IdConversation,
            conversation_participant.IdUtilisateur,
            conversation_participant.Statut,
            conversation_participant.Role
        ]
    );

    return result.insertId;
}

export const getAllConversationParticipants = async () => {
  const [rows] = await db.query("SELECT * FROM conversation_participant");
  return rows.map(row => new ConversationParticipant(row));
};

export const getConversationParticipantById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM conversation_participant WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new ConversationParticipant(rows[0]);
};

export const isUserInConversation = async (conversationId, utilisateurId) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM conversation_participant WHERE IdConversation = ? AND IdUtilisateur = ?",
      [conversationId, utilisateurId]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'appartenance à la conversation :", error);
    return false;
  }
};

export const updateConversationParticipant = async (id, conversation_participant) => {
  const [result] = await db.query(
    `UPDATE conversation_participant SET 
      IdConversation = ?, 
      IdUtilisateur = ?,
      Statut = ?,
      Role = ?
     WHERE Id = ?`,
    [
      conversation_participant.IdConversation,
      conversation_participant.IdUtilisateur,
      conversation_participant.Statut,
      conversation_participant.Role,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteConversationParticipant = async (id) => {
  const [result] = await db.query(
    "DELETE FROM conversation_participant WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getParticipantsByConversationId = async (conversationId) => {
    const [rows] = await db.query(
        `SELECT  u.*
         FROM conversation_participant cp
         JOIN utilisateur u ON cp.IdUtilisateur = u.Id
         WHERE cp.IdConversation = ?`,
        [conversationId]
    );
    return rows.map(row => new Utilisateur(row));
};
