import { db } from "../config/db.js";
import { Materiaux } from "../modeles/materiaux.model.js";

export const createMateriaux = async (materiaux) => {
    const [result] = await db.query(
        `INSERT INTO materiaux (Nom, Description) 
        VALUES (?, ?)`,
        [
            materiaux.Nom,
            materiaux.Description
        ]
    );

    return result.insertId;
}

export const getAllMateriauxs = async () => {
  const [rows] = await db.query("SELECT * FROM materiaux");
  return rows.map(row => new Materiaux(row));
};

export const getMateriauxById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM materiaux WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Materiaux(rows[0]);
};

export const updateMateriaux = async (id, materiaux) => {
  const [result] = await db.query(
    `UPDATE materiaux SET 
      Nom = ?, 
      Description = ?
     WHERE Id = ?`,
    [
      materiaux.Nom,
      materiaux.Description,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteMateriaux = async (id) => {
  const [result] = await db.query(
    "DELETE FROM materiaux WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

