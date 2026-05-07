import { createPaiementService, deletePaiementService, getAllPaiementServices, getPaiementServiceById, updatePaiementService } from "../database/paiement_service.db.js";
import { getReservationById } from "../database/reservation.db.js";
import { getStatutById } from "../database/statut.db.js";

export async function createPaiementServiceControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdReservation, Montant,Statut,stripe_payment_intent_id,connectedAccountId,applicationFeeAmount } = req.body;

        if(!IdReservation || !Montant || !Statut || !stripe_payment_intent_id ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createPaiementService({
            IdReservation, 
            Montant,
            Statut,
            stripe_payment_intent_id,
            connectedAccountId,
            applicationFeeAmount
        })

        res.status(201).json({ message: "PaiementService crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updatePaiementServiceControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdReservation, Montant, Statut ,stripe_payment_intent_id ,connectedAccountId,applicationFeeAmount } = req.body;
        const paiement_commande = await getPaiementServiceById(id);
        if (!paiement_commande) {
            return res.status(404).json({ message: "PaiementService non trouvé" });
        }
        await updatePaiementService( id ,{
            IdReservation, 
            Montant,
            Statut,
            stripe_payment_intent_id,
            connectedAccountId,
            applicationFeeAmount
        })
        
        res.status(200).json({ message: "PaiementService modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deletePaiementServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const paiement_commande = await getPaiementServiceById(id);
        if (!paiement_commande) {
            return res.status(404).json({ message: "PaiementService non trouvé" });
        }
        await deletePaiementService(id);
        res.status(200).json({ message: "PaiementService supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getPaiementServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const paiement_commande = await getPaiementServiceById(id);
        if(!paiement_commande){
            return res.status(404).json({message:"PaiementService non trouvé"})
        }
        res.status(200).json(paiement_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllPaiementServicesControlleur(req,res) {
    try {
        const paiement_commandes = await getAllPaiementServices();
        res.status(200).json(paiement_commandes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des paiement_commandes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getStatutOfPaiementServiceControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "PaiementService a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getReservationOfPaiementServiceControlleur(req,res) {
    try {
        const { Reservation } = req.params;
        const reservation = await getReservationById(Reservation);
        if (!reservation) {
            return res.status(404).json({ message: "PaiementService a un reservation inexistant !(non trouvé)" });
        }
        res.status(200).json(reservation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// todo: ajouter les controlleurs , requetes et... pour le stripe_payment_intent_id  (ne foirez pas ca)