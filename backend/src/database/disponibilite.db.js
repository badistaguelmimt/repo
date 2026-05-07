import { db } from "../config/db.js";
import { Disponibilite } from "../modeles/disponibilite.model.js";

export const createDisponibilite = async (disponibilite) => {
    const [result] = await db.query(
        `INSERT INTO disponibilite (IdProfil, DateDebut, DateFin, Recurrence, Frequence, Disponibilite) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            disponibilite.IdProfil,
            disponibilite.DateDebut,
            disponibilite.DateFin,
            disponibilite.Recurrence,
            disponibilite.Frequence,
            disponibilite.Disponibilite
        ]
    );

    return result.insertId;
}

export const getAllDisponibilites = async () => {
  const [rows] = await db.query("SELECT * FROM disponibilite");
  return rows.map(row => new Disponibilite(row));
};

export const getDisponibiliteById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM disponibilite WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Disponibilite(rows[0]);
};

export const updateDisponibilite = async (id, disponibilite) => {
  const [result] = await db.query(
    `UPDATE disponibilite SET 
      IdProfil = ?, 
      DateDebut = ?,
      DateFin = ?,
      Recurrence = ?,
      Frequence = ?,
      Disponibilite = ?
     WHERE Id = ?`,
    [
      disponibilite.IdProfil,
      disponibilite.DateDebut,
      disponibilite.DateFin,
      disponibilite.Recurrence,
      disponibilite.Frequence,
      disponibilite.Disponibilite,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteDisponibilite = async (id) => {
  const [result] = await db.query(
    "DELETE FROM disponibilite WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

