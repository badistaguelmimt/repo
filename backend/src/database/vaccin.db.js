import { db } from "../config/db.js";
import { Vaccin } from "../modeles/vaccin.model.js";

export const createVaccin = async (vaccin) => {
    const [result] = await db.query(
        `INSERT INTO vaccins (Nom, Description) 
        VALUES (?, ?)`,
        [
            vaccin.Nom,
            vaccin.Description
        ]
    );

    return result.insertId;
}

export const getAllVaccins = async () => {
  const [rows] = await db.query("SELECT * FROM vaccins");
  return rows.map(row => new Vaccin(row));
};

export const getVaccinById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM vaccins WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Vaccin(rows[0]);
};

export const updateVaccin = async (id, vaccin) => {
  const [result] = await db.query(
    `UPDATE vaccins SET 
      Nom = ?, 
      Description = ?,
     WHERE Id = ?`,
    [
      vaccin.Nom,
      vaccin.Description,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteVaccin = async (id) => {
  const [result] = await db.query(
    "DELETE FROM vaccins WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

