import { db } from "../config/db.js";
import { Commande } from "../modeles/commande.model.js";

export const createCommande = async (commande) => {
    const [result] = await db.query(
        `INSERT INTO commande (IdUtilisateur, Statut) 
        VALUES (?, ?)`,
        [
            commande.IdUtilisateur,
            commande.Statut
        ]
    );

    return result.insertId;
}

export const getAllCommandes = async () => {
  const [rows] = await db.query("SELECT * FROM commande");
  return rows.map(row => new Commande(row));
};

export const getCommandeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM commande WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Commande(rows[0]);
};

export const updateCommande = async (id, commande) => {
  const [result] = await db.query(
    `UPDATE commande SET 
      IdUtilisateur = ?, 
      Statut = ?
     WHERE Id = ?`,
    [
      commande.IdUtilisateur,
      commande.Statut,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteCommande = async (id) => {
  const [result] = await db.query(
    "DELETE FROM commande WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

