import { db } from "../config/db.js";

// ── Créer une réservation ─────────────────────────────────────────────────────
export const createReservation = async (data) => {
  const [result] = await db.query(
    `INSERT INTO reservation (IdUtilisateur, IdProfil, IdAnimal, IdAnnonce, TypeService, DateDebut, DateFin, Statut, PrixFinal, Notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.IdUtilisateur,
      data.IdProfil,
      data.IdAnimal ?? 0,
      data.IdAnnonce ?? 0,
      data.TypeService,
      data.DateDebut,
      data.DateFin,
      data.Statut,
      data.PrixFinal,
      data.Notes ?? null,
    ]
  );
  return result.insertId;
};

// ── Requête enrichie (commune) ────────────────────────────────────────────────
const ENRICHED_SELECT = `
  SELECT
    r.*,
    ts.Type              AS TypeServiceLabel,
    s.Statut             AS StatutLabel,
    u.Nom                AS UtilisateurNom,
    u.Prenom             AS UtilisateurPrenom,
    u.AddresseEmail      AS UtilisateurEmail,
    pp.TarifHoraire      AS PrestataireTarif,
    pp.ZoneIntervention  AS PrestataireZone,
    CONCAT(pu.Prenom, ' ', pu.Nom) AS PrestataireNom
  FROM reservation r
  LEFT JOIN type_service ts ON r.TypeService = ts.Id
  LEFT JOIN statut s        ON r.Statut = s.Id
  LEFT JOIN utilisateur u   ON r.IdUtilisateur = u.Id
  LEFT JOIN profil_prestataire pp ON r.IdProfil = pp.Id
  LEFT JOIN utilisateur pu  ON pp.IdUtilisateur = pu.Id
`;

// ── Toutes les réservations (Admin) ──────────────────────────────────────────
export const getAllReservations = async () => {
  const [rows] = await db.query(`${ENRICHED_SELECT} ORDER BY r.DateDebut DESC`);
  return rows;
};

// ── Une réservation par ID ────────────────────────────────────────────────────
export const getReservationById = async (id) => {
  const [rows] = await db.query(
    `${ENRICHED_SELECT} WHERE r.Id = ?`,
    [id]
  );
  return rows[0] ?? null;
};

// ── Réservations d'un utilisateur (côté client) ───────────────────────────────
export const getReservationsByUtilisateurId = async (userId) => {
  const [rows] = await db.query(
    `${ENRICHED_SELECT} WHERE r.IdUtilisateur = ? ORDER BY r.DateDebut DESC`,
    [userId]
  );
  return rows;
};

// ── Réservations pour un profil prestataire ───────────────────────────────────
export const getReservationsByProfilId = async (profilId) => {
  const [rows] = await db.query(
    `${ENRICHED_SELECT} WHERE r.IdProfil = ? ORDER BY r.DateDebut DESC`,
    [profilId]
  );
  return rows;
};

// ── Réservations d'un refuge (via possession de l'animal) ─────────────────────
export const getReservationsByRefugeId = async (refugeId) => {
  const [rows] = await db.query(
    `${ENRICHED_SELECT}
     JOIN possession p ON r.IdAnimal = p.IdAnimal
     WHERE p.IdRefuge = ?
     ORDER BY r.DateDebut DESC`,
    [refugeId]
  );
  return rows;
};

// ── Mettre à jour le statut seulement ────────────────────────────────────────
export const updateReservationStatut = async (id, statutId) => {
  const [result] = await db.query(
    `UPDATE reservation SET Statut = ? WHERE Id = ?`,
    [statutId, id]
  );
  return result.affectedRows;
};

// ── Mise à jour complète ──────────────────────────────────────────────────────
export const updateReservation = async (id, data) => {
  const [result] = await db.query(
    `UPDATE reservation SET
       IdUtilisateur = ?, IdProfil = ?, IdAnimal = ?, IdAnnonce = ?,
       TypeService = ?, DateDebut = ?, DateFin = ?,
       Statut = ?, PrixFinal = ?, Notes = ?
     WHERE Id = ?`,
    [
      data.IdUtilisateur, data.IdProfil, data.IdAnimal ?? 0, data.IdAnnonce ?? 0,
      data.TypeService, data.DateDebut, data.DateFin,
      data.Statut, data.PrixFinal, data.Notes ?? null,
      id,
    ]
  );
  return result.affectedRows;
};

// ── Supprimer ─────────────────────────────────────────────────────────────────
export const deleteReservation = async (id) => {
  const [result] = await db.query("DELETE FROM reservation WHERE Id = ?", [id]);
  return result.affectedRows;
};
