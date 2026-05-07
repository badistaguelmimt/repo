import { db } from "../config/db.js";
import { Livraison } from "../modeles/livraison.model.js";

export const createLivraison = async (livraison) => {
    const [result] = await db.query(
        `INSERT INTO livraison (IdSousCommande, Addresse, Statut, TrackingNumber, Transporteur) 
        VALUES (?, ?, ?, ?, ?)`,
        [
            livraison.IdSousCommande,
            livraison.Addresse,
            livraison.Statut,
            livraison.TrackingNumber,
            livraison.Transporteur
        ]
    );

    return result.insertId;
}

export const getAllLivraisons = async () => {
  const [rows] = await db.query("SELECT * FROM livraison");
  return rows.map(row => new Livraison(row));
};

export const getLivraisonById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM livraison WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Livraison(rows[0]);
};

export const updateLivraison = async (id, livraison) => {
  const [result] = await db.query(
    `UPDATE livraison SET 
      IdSousCommande = ?, 
      Addresse = ?,
      Statut = ?,
      TrackingNumber =?,
      Transporteur = ?
     WHERE Id = ?`,
    [
      livraison.IdSousCommande,
      livraison.Addresse,
      livraison.Statut,
      livraison.TrackingNumber,
      livraison.Transporteur,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteLivraison = async (id) => {
  const [result] = await db.query(
    "DELETE FROM livraison WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

