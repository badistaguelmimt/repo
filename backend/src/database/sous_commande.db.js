import { db } from "../config/db.js";
import { SousCommande } from "../modeles/sous_commande.model.js";

export const createSousCommande = async (sous_commande) => {
    const [result] = await db.query(
        `INSERT INTO sous_commande (IdCommande, IdRefuge, Statut, Total_prix, stripe_transfer_id, platformFee) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            sous_commande.IdCommande,
            sous_commande.IdRefuge,
            sous_commande.Statut,
            sous_commande.Total_prix,
            sous_commande.stripe_transfer_id,
            sous_commande.platformFee
        ]
    );

    return result.insertId;
}

export const getAllSousCommandes = async () => {
  const [rows] = await db.query("SELECT * FROM sous_commande");
  return rows.map(row => new SousCommande(row));
};

export const getSousCommandeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM sous_commande WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new SousCommande(rows[0]);
};

export const updateSousCommande = async (id, sous_commande) => {
  const [result] = await db.query(
    `UPDATE sous_commande SET 
      IdCommande = ?, 
      IdRefuge = ?,
      Statut = ?,
      Total_prix = ?,
      stripe_transfer_id = ?,
      platformFee = ?
     WHERE Id = ?`,
    [
      sous_commande.IdCommande,
      sous_commande.IdRefuge,
      sous_commande.Statut,
      sous_commande.Total_prix,
      sous_commande.stripe_transfer_id,
      sous_commande.platformFee,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteSousCommande = async (id) => {
  const [result] = await db.query(
    "DELETE FROM sous_commande WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};


export const getSousCommandesByRefugeId = async (refugeId) => {
  const [rows] = await db.query(
    "SELECT * FROM sous_commande WHERE IdRefuge = ?",
    [refugeId]
  );
  return rows.map(row => new SousCommande(row));
};

export const getLigneCommandesBySousCommandeId = async (sousCommandeId) => {
  const [rows] = await db.query(
    `SELECT lc.*, p.Nom as ProduitNom, p.Prix as ProduitPrix 
     FROM ligne_commande lc
     JOIN produit p ON lc.IdProduit = p.Id
     WHERE lc.IdSousCommande = ?`,
    [sousCommandeId]
  );
  return rows;
};
