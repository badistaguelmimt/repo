import { db } from "../config/db.js";
import { Espece } from "../modeles/espece.model.js";

export const createEspece = async (espece) => {
    const [result] = await db.query(
        `INSERT INTO espece (Nom, Description) 
        VALUES (?, ?)`,
        [
            espece.Nom,
            espece.Description
        ]
    );

    return result.insertId;
}

export const getAllEspeces = async () => {
  const [rows] = await db.query("SELECT * FROM espece");
  return rows.map(row => new Espece(row));
};

export const getEspeceById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM espece WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Espece(rows[0]);
};

export const updateEspece = async (id, espece) => {
  const [result] = await db.query(
    `UPDATE espece SET 
      Nom = ?, 
      Description = ?
     WHERE Id = ?`,
    [
      espece.Nom,
      espece.Description,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteEspece = async (id) => {
  const [result] = await db.query(
    "DELETE FROM espece WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

