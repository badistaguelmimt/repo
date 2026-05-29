import { db } from "../config/db.js";
import { DemandeAdoption } from "../modeles/demande_adoption.model.js";

// ── Créer une demande d'adoption ─────────────────────────────────────────────
export const createDemandeAdoption = async (data) => {
  const [result] = await db.query(
    `INSERT INTO demande_adoption
      (IdAnimal, IdUtilisateur, IdRefuge, Statut, TypeLogement, Jardin,
       Animaux, Enfants, CommentaireDepart, Disponibilite, DateDemande)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.IdAnimal,
      data.IdUtilisateur,
      data.IdRefuge,
      data.Statut,          // FK vers table statut
      data.TypeLogement,
      data.Jardin ?? null,
      data.Animaux ?? null,
      data.Enfants ?? null,
      data.CommentaireDepart,
      data.Disponibilite ?? null,
    ]
  );
  return result.insertId;
};

// ── Toutes les demandes d'un refuge (pour le dashboard refuge) ───────────────
export const getDemandesByRefuge = async (idRefuge) => {
  const [rows] = await db.query(
    `SELECT da.*,
            a.Nom AS AnimalNom, a.Race AS AnimalRaceId,
            u.Nom AS UtilisateurNom, u.Prenom AS UtilisateurPrenom,
            u.AddresseEmail AS UtilisateurEmail,
            s.Statut AS StatutLabel
     FROM demande_adoption da
     JOIN animal a ON da.IdAnimal = a.Id
     JOIN utilisateur u ON da.IdUtilisateur = u.Id
     LEFT JOIN statut s ON da.Statut = s.Id
     WHERE da.IdRefuge = ?
     ORDER BY da.DateDemande DESC`,
    [idRefuge]
  );
  return rows;
};

// ── Toutes les demandes d'un utilisateur (dashboard user) ───────────────────
export const getDemandesByUtilisateur = async (idUtilisateur) => {
  const [rows] = await db.query(
    `SELECT da.*,
            a.Nom AS AnimalNom,
            r.Nom AS RefugeNom,
            s.Statut AS StatutLabel
     FROM demande_adoption da
     JOIN animal a ON da.IdAnimal = a.Id
     JOIN refuge r ON da.IdRefuge = r.Id
     LEFT JOIN statut s ON da.Statut = s.Id
     WHERE da.IdUtilisateur = ?
     ORDER BY da.DateDemande DESC`,
    [idUtilisateur]
  );
  return rows;
};

// ── Une demande par ID ────────────────────────────────────────────────────────
export const getDemandeById = async (id) => {
  const [rows] = await db.query(
    `SELECT da.*,
            a.Nom AS AnimalNom, a.Genre AS AnimalGenre,
            u.Nom AS UtilisateurNom, u.Prenom AS UtilisateurPrenom,
            u.AddresseEmail AS UtilisateurEmail,
            r.Nom AS RefugeNom,
            s.Statut AS StatutLabel
     FROM demande_adoption da
     JOIN animal a ON da.IdAnimal = a.Id
     JOIN utilisateur u ON da.IdUtilisateur = u.Id
     JOIN refuge r ON da.IdRefuge = r.Id
     LEFT JOIN statut s ON da.Statut = s.Id
     WHERE da.Id = ?`,
    [id]
  );
  return rows[0] ?? null;
};

// ── Mettre à jour le statut + commentaire de retour (refuge) ─────────────────
export const updateDemandeStatut = async (id, statutId, commentaireRetour) => {
  const [result] = await db.query(
    `UPDATE demande_adoption
     SET Statut = ?, CommentaireRetour = ?, DateRetours = NOW()
     WHERE Id = ?`,
    [statutId, commentaireRetour ?? null, id]
  );
  return result.affectedRows;
};

// ── Supprimer (annulation par l'utilisateur) ─────────────────────────────────
export const deleteDemandeAdoption = async (id) => {
  const [result] = await db.query(
    "DELETE FROM demande_adoption WHERE Id = ?",
    [id]
  );
  return result.affectedRows;
};

// ── Vérifier si une demande existe déjà pour un animal + utilisateur ─────────
export const demandeExisteDeja = async (idAnimal, idUtilisateur) => {
  const [rows] = await db.query(
    `SELECT Id FROM demande_adoption
     WHERE IdAnimal = ? AND IdUtilisateur = ?
     LIMIT 1`,
    [idAnimal, idUtilisateur]
  );
  return rows.length > 0;
};

// ── Toutes les demandes d'adoption (vue admin / liste globale) ───────────────
export const getAllDemandeAdoptions = async () => {
  const [rows] = await db.query("SELECT * FROM demande_adoption");
  return rows.map(row => new DemandeAdoption(row));
};

// ── Une demande par ID — retourne un objet modèle ────────────────────────────
export const getDemandeAdoptionById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_adoption WHERE Id = ?",
    [id]
  );
  if (!rows[0]) return null;
  return new DemandeAdoption(rows[0]);
};

// ── Demandes d'un refuge (liste simple sans JOIN) ────────────────────────────
export const getDemandeAdoptionByRefugeId = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_adoption WHERE IdRefuge = ?",
    [id]
  );
  return rows.map(row => new DemandeAdoption(row));
};

// ── Demandes d'un utilisateur (liste simple sans JOIN) ───────────────────────
export const getDemandeAdoptionByUtilisateurId = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM demande_adoption WHERE IdUtilisateur = ?",
    [id]
  );
  return rows.map(row => new DemandeAdoption(row));
};

// ── Mise à jour complète d'une demande d'adoption ────────────────────────────
export const updateDemandeAdoption = async (id, data) => {
  const [result] = await db.query(
    `UPDATE demande_adoption SET
      IdAnimal = ?,
      IdUtilisateur = ?,
      IdRefuge = ?,
      Statut = ?,
      TypeLogement = ?,
      Jardin = ?,
      Animaux = ?,
      Enfants = ?,
      CommentaireDepart = ?,
      Disponibilite = ?,
      CommentaireRetour = ?,
      DateDemande = ?,
      DateRetours = ?
     WHERE Id = ?`,
    [
      data.IdAnimal,
      data.IdUtilisateur,
      data.IdRefuge,
      data.Statut,
      data.TypeLogement,
      data.Jardin ?? null,
      data.Animaux ?? null,
      data.Enfants ?? null,
      data.CommentaireDepart,
      data.Disponibilite ?? null,
      data.CommentaireRetour ?? null,
      data.DateDemande,
      data.DateRetours ?? null,
      id
    ]
  );
  return result.affectedRows;
};
