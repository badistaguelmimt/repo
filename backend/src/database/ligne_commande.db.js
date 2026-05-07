import { db } from "../config/db.js";
import { LigneCommande } from "../modeles/ligne_commande.model.js";

export const createLigneCommande = async (ligne_commande) => {
    const [result] = await db.query(
        `INSERT INTO ligne_commande (IdSousCommande, IdProduit, Quantite) 
        VALUES (?, ?, ?)`,
        [
            ligne_commande.IdSousCommande,
            ligne_commande.IdProduit,
            ligne_commande.Quantite
        ]
    );

    return result.insertId;
}

export const getAllLigneCommandes = async () => {
  const [rows] = await db.query("SELECT * FROM ligne_commande");
  return rows.map(row => new LigneCommande(row));
};

export const getLigneCommandeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM ligne_commande WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new LigneCommande(rows[0]);
};

export const updateLigneCommande = async (id, ligne_commande) => {
  const [result] = await db.query(
    `UPDATE ligne_commande SET 
      IdSousCommande = ?, 
      IdProduit = ?,
      Quantite = ?
     WHERE Id = ?`,
    [
      ligne_commande.IdSousCommande,
      ligne_commande.IdProduit,
      ligne_commande.Quantite,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteLigneCommande = async (id) => {
  const [result] = await db.query(
    "DELETE FROM ligne_commande WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

