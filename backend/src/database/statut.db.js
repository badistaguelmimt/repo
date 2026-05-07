import { db } from "../config/db.js";
import { Statut } from "../modeles/statut.model.js";

export const createStatut = async (statut) => {
    const [result] = await db.query(
        `INSERT INTO statut (Statut) 
        VALUES (?)`,
        [
            statut.Statut
        ]
    );

    return result.insertId;
}

export const getAllStatuts = async () => {
  const [rows] = await db.query("SELECT * FROM statut");
  return rows.map(row => new Statut(row));
};

export const getStatutById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM statut WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Statut(rows[0]);
};

export const updateStatut = async (id, statut) => {
  const [result] = await db.query(
    `UPDATE statut SET 
      Statut = ? 
     WHERE Id = ?`,
    [
      statut.Statut,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteStatut = async (id) => {
  const [result] = await db.query(
    "DELETE FROM statut WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

