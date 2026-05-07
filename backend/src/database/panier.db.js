import { db } from "../config/db.js";
import { Panier } from "../modeles/panier.model.js";

export const createPanier = async (panier) => {
    const [result] = await db.query(
        `INSERT INTO panier (IdUtilisateur) 
        VALUES (?)`,
        [
            panier.IdUtilisateur
        ]
    );

    return result.insertId;
}

export const getAllPaniers = async () => {
  const [rows] = await db.query("SELECT * FROM panier");
  return rows.map(row => new Panier(row));
};

export const getPanierById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM panier WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Panier(rows[0]);
};

export const updatePanier = async (id, panier) => {
  const [result] = await db.query(
    `UPDATE panier SET 
      IdUtilisateur = ? 
     WHERE Id = ?`,
    [
      panier.IdUtilisateur,
      id
    ]
  );

  return result.affectedRows;
};

export const deletePanier = async (id) => {
  const [result] = await db.query(
    "DELETE FROM panier WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

