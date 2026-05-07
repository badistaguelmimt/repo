import { db } from "../config/db.js";
import { LignePanier } from "../modeles/ligne_panier.model.js";

export const createLignePanier = async (ligne_panier) => {
  if (!Number.isInteger(ligne_panier.Quantite) || ligne_panier.Quantite <= 0) {
    throw new Error("Quantite must be a positive integer");
  }
    const [result] = await db.query(
        `INSERT INTO ligne_panier (IdPanier, IdProduit, Quantite) 
        VALUES (?, ?, ?)`,
        [
            ligne_panier.IdPanier,
            ligne_panier.IdProduit,
            ligne_panier.Quantite
        ]
    );

    return result.insertId;
}

export const getAllLignePaniers = async () => {
  const [rows] = await db.query("SELECT * FROM ligne_panier");
  return rows.map(row => new LignePanier(row));
};

export const getLignePanierById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM ligne_panier WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new LignePanier(rows[0]);
};

export const updateLignePanier = async (id, ligne_panier) => {
  if (!Number.isInteger(ligne_panier.Quantite) || ligne_panier.Quantite <= 0) {
    throw new Error("Quantite must be a positive integer");
  }
  const [result] = await db.query(
    `UPDATE ligne_panier SET 
      IdPanier = ?, 
      IdProduit = ?,
      Quantite = ?
     WHERE Id = ?`,
    [
      ligne_panier.IdPanier,
      ligne_panier.IdProduit,
      ligne_panier.Quantite,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteLignePanier = async (id) => {
  const [result] = await db.query(
    "DELETE FROM ligne_panier WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

