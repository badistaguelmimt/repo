import { db } from "../config/db.js";
import { PaiementCommande } from "../modeles/paiement_commande.model.js";

export const createPaiementCommande = async (paiement_commande) => {
    const [result] = await db.query(
        `INSERT INTO paiement_commande (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount) 
        VALUES (?, ?, ?, ?, ?)`,
        [
            paiement_commande.IdCommande,
            paiement_commande.Montant,
            paiement_commande.Statut,
            paiement_commande.stripe_payment_intent_id,
            paiement_commande.applicationFeeAmount
        ]
    );

    return result.insertId;
}

export const getAllPaiementCommandes = async () => {
  const [rows] = await db.query("SELECT * FROM paiement_commande");
  return rows.map(row => new PaiementCommande(row));
};

export const getPaiementCommandeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM paiement_commande WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new PaiementCommande(rows[0]);
};

export const updatePaiementCommande = async (id, paiement_commande) => {
  const [result] = await db.query(
    `UPDATE paiement_commande SET 
      IdCommande = ?, 
      Montant = ?,
      Statut = ?,
      stripe_payment_intent_id = ?,
      applicationFeeAmount = ?
     WHERE Id = ?`,
    [
      paiement_commande.IdCommande,
      paiement_commande.Montant,
      paiement_commande.Statut,
      paiement_commande.stripe_payment_intent_id,
      paiement_commande.applicationFeeAmount,
      id
    ]
  );

  return result.affectedRows;
};

export const deletePaiementCommande = async (id) => {
  const [result] = await db.query(
    "DELETE FROM paiement_commande WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

