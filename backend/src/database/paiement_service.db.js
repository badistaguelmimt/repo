import { db } from "../config/db.js";
import { PaiementService } from "../modeles/paiement_service.model.js";

export const createPaiementService = async (paiement_service) => {
    const [result] = await db.query(
        `INSERT INTO paiement_service (IdReservation, Montant, Statut, stripe_payment_intent_id, connectedAccountId, applicationFeeAmount) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            paiement_service.IdReservation,
            paiement_service.Montant,
            paiement_service.Statut,
            paiement_service.stripe_payment_intent_id,
            paiement_service.connectedAccountId,
            paiement_service.applicationFeeAmount
        ]
    );

    return result.insertId;
}

export const getAllPaiementServices = async () => {
  const [rows] = await db.query("SELECT * FROM paiement_service");
  return rows.map(row => new PaiementService(row));
};

export const getPaiementServiceById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM paiement_service WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new PaiementService(rows[0]);
};

export const updatePaiementService = async (id, paiement_service) => {
  const [result] = await db.query(
    `UPDATE paiement_service SET 
      IdReservation = ?, 
      Montant = ?,
      Statut = ?,
      stripe_payment_intent_id = ?,
      connectedAccountId = ?,
      applicationFeeAmount = ?
     WHERE Id = ?`,
    [
      paiement_service.IdReservation,
      paiement_service.Montant,
      paiement_service.Statut,
      paiement_service.stripe_payment_intent_id,
      paiement_service.connectedAccountId,
      paiement_service.applicationFeeAmount,
      id
    ]
  );

  return result.affectedRows;
};

export const deletePaiementService = async (id) => {
  const [result] = await db.query(
    "DELETE FROM paiement_service WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

