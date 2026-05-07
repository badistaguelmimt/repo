import { db } from "../config/db.js";
import { ProfilPrestataire } from "../modeles/profil_prestataire.model.js";

export const createProfilPrestataire = async (profil_prestataire) => {
    const [result] = await db.query(
        `INSERT INTO profil_prestataire (IdUtilisateur, Experience, TarifHoraire, ZoneIntervention, TypeService, Statut, Bio, NoteMoyenne) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            profil_prestataire.IdUtilisateur,
            profil_prestataire.Experience,
            profil_prestataire.TarifHoraire,
            profil_prestataire.ZoneIntervention,
            profil_prestataire.TypeService,
            profil_prestataire.Statut,
            profil_prestataire.Bio,
            profil_prestataire.NoteMoyenne
        ]
    );

    return result.insertId;
}

export const getAllProfilPrestataires = async () => {
  const [rows] = await db.query(`
    SELECT
      pp.*,
      CONCAT(u.Prenom, ' ', u.Nom) AS NomComplet,
      ts.Type                       AS TypeServiceLabel
    FROM profil_prestataire pp
    LEFT JOIN utilisateur   u  ON pp.IdUtilisateur = u.Id
    LEFT JOIN type_service  ts ON pp.TypeService   = ts.Id
  `);
  return rows.map(row => new ProfilPrestataire(row));
};

export const getProfilPrestataireById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM profil_prestataire WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new ProfilPrestataire(rows[0]);
};

export const updateProfilPrestataire = async (id, profil_prestataire) => {
  const [result] = await db.query(
    `UPDATE profil_prestataire SET 
      IdUtilisateur = ?, 
      Experience = ?,
      TarifHoraire = ?,
      ZoneIntervention = ?,
      TypeService = ?,
      Statut = ?,
      Bio = ?,
      NoteMoyenne = ?
     WHERE Id = ?`,
    [
      profil_prestataire.IdUtilisateur,
      profil_prestataire.Experience,
      profil_prestataire.TarifHoraire,
      profil_prestataire.ZoneIntervention,
      profil_prestataire.TypeService,
      profil_prestataire.Statut,
      profil_prestataire.Bio,
      profil_prestataire.NoteMoyenne,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteProfilPrestataire = async (id) => {
  const [result] = await db.query(
    "DELETE FROM profil_prestataire WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};


export const getProfilPrestataireByUtilisateurId = async (utilisateurId) => {
  const [rows] = await db.query(
    'SELECT * FROM profil_prestataire WHERE IdUtilisateur = ?',
    [utilisateurId]
  );

  if (!rows[0]) return null;
  return new ProfilPrestataire(rows[0]);
};
