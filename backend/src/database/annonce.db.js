import { db } from "../config/db.js";
import { Annonce } from "../modeles/annonce.model.js";

export const createAnnonce = async (annonce) => {
    const [result] = await db.query(
        `INSERT INTO annonce (IdUtilisateur, IdAnimal, TypeService, DateDebut, DateFin, PrixSouhaite, Statut, Notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            annonce.IdUtilisateur,
            annonce.IdAnimal,
            annonce.TypeService,
            annonce.DateDebut,
            annonce.DateFin,
            annonce.PrixSouhaite,
            annonce.Statut,
            annonce.Notes
        ]
    );

    return result.insertId;
}

export const getAllAnnonces = async () => {
  const [rows] = await db.query("SELECT * FROM annonce");
  return rows.map(row => new Annonce(row));
};

export const getAnnonceById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM annonce WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Annonce(rows[0]);
};

export const updateAnnonce = async (id, annonce) => {
  const [result] = await db.query(
    `UPDATE annonce SET 
      IdUtilisateur = ?, 
      IdAnimal = ?,
      TypeService = ?,
      DateDebut = ?,
      DateFin = ?,
      PrixSouhaite = ?,
      Statut = ?,
      Notes = ?
     WHERE Id = ?`,
    [
      annonce.IdUtilisateur,
      annonce.IdAnimal,
      annonce.TypeService,
      annonce.DateDebut,
      annonce.DateFin,
      annonce.PrixSouhaite,
      annonce.Statut,
      annonce.Notes,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteAnnonce = async (id) => {
  const [result] = await db.query(
    "DELETE FROM annonce WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

