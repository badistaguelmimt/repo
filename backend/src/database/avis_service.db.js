import { db } from "../config/db.js";
import { AvisService } from "../modeles/avis_service.model.js";

export const createAvisService = async (avis_service) => {
    const [result] = await db.query(
        `INSERT INTO avis_service (IdReservation, IdUtilisateur, Note, DateAvis, TypeAvis) 
        VALUES (?, ?, ?, ?, ?)`,
        [
            avis_service.IdReservation,
            avis_service.IdUtilisateur,
            avis_service.Note,
            avis_service.DateAvis,
            avis_service.TypeAvis
        ]
    );

    return result.insertId;
}

export const getAllAvisServices = async () => {
  const [rows] = await db.query("SELECT * FROM avis_service");
  return rows.map(row => new AvisService(row));
};

export const getAvisServiceById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM avis_service WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new AvisService(rows[0]);
};

export const updateAvisService = async (id, avis_service) => {
  const [result] = await db.query(
    `UPDATE avis_service SET 
      IdReservation = ?, 
      IdUtilisateur = ?,
      Note = ?,
      DateAvis =?,
      TypeAvis = ?
     WHERE Id = ?`,
    [
      avis_service.IdReservation,
      avis_service.IdUtilisateur,
      avis_service.Note,
      avis_service.DateAvis,
      avis_service.TypeAvis,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteAvisService = async (id) => {
  const [result] = await db.query(
    "DELETE FROM avis_service WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

