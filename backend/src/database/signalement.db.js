import { db } from "../config/db.js";

// ── Créer un signalement ──────────────────────────────────────────────────────
export const createSignalement = async (data) => {
  const [result] = await db.query(
    `INSERT INTO signalement (IdUtilisateur, TypeCible, IdCible, Statut, Raison, DateSignalement)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      data.IdUtilisateur,
      data.TypeCible,
      data.IdCible ?? 0,
      data.Statut,      // FK vers table statut (Id numérique)
      data.Raison,
    ]
  );
  return result.insertId;
};

// ── Tous les signalements (admin) — enrichis avec jointures ──────────────────
export const getAllSignalements = async () => {
  const [rows] = await db.query(`
    SELECT
      sig.*,
      u.Nom        AS UtilisateurNom,
      u.Prenom     AS UtilisateurPrenom,
      u.AddresseEmail AS UtilisateurEmail,
      s.Statut     AS StatutLabel
    FROM signalement sig
    LEFT JOIN utilisateur u ON sig.IdUtilisateur = u.Id
    LEFT JOIN statut s      ON sig.Statut         = s.Id
    ORDER BY sig.DateSignalement DESC
  `);
  return rows;
};

// ── Signalements par utilisateur ─────────────────────────────────────────────
export const getSignalementsByUtilisateur = async (idUtilisateur) => {
  const [rows] = await db.query(
    `SELECT sig.*, s.Statut AS StatutLabel
     FROM signalement sig
     LEFT JOIN statut s ON sig.Statut = s.Id
     WHERE sig.IdUtilisateur = ?
     ORDER BY sig.DateSignalement DESC`,
    [idUtilisateur]
  );
  return rows;
};

// ── Un signalement par ID ─────────────────────────────────────────────────────
export const getSignalementById = async (id) => {
  const [rows] = await db.query(
    `SELECT sig.*, u.Nom AS UtilisateurNom, u.Prenom AS UtilisateurPrenom,
            u.AddresseEmail AS UtilisateurEmail, s.Statut AS StatutLabel
     FROM signalement sig
     LEFT JOIN utilisateur u ON sig.IdUtilisateur = u.Id
     LEFT JOIN statut s      ON sig.Statut = s.Id
     WHERE sig.Id = ?`,
    [id]
  );
  return rows[0] ?? null;
};

// ── Mettre à jour le statut d'un signalement (Admin) ─────────────────────────
export const resolveSignalement = async (id, statutId) => {
  const [result] = await db.query(
    `UPDATE signalement SET Statut = ? WHERE Id = ?`,
    [statutId, id]
  );
  return result.affectedRows;
};

// ── Supprimer ─────────────────────────────────────────────────────────────────
export const deleteSignalement = async (id) => {
  const [result] = await db.query(
    "DELETE FROM signalement WHERE Id = ?",
    [id]
  );
  return result.affectedRows;
};
