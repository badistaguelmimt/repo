import { getCommandeById } from "../database/commande.db.js";
import { createPaiementCommande, deletePaiementCommande, getAllPaiementCommandes, getPaiementCommandeById, updatePaiementCommande } from "../database/paiement_commande.db.js";
import { getStatutById } from "../database/statut.db.js";

export async function createPaiementCommandeControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdCommande, Montant,Statut,stripe_payment_intent_id,applicationFeeAmount } = req.body;

        if(!IdCommande || !Montant || !Statut || !stripe_payment_intent_id ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createPaiementCommande({
            IdCommande, 
            Montant,
            Statut,
            stripe_payment_intent_id,
            applicationFeeAmount
        })

        res.status(201).json({ message: "PaiementCommande crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updatePaiementCommandeControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdCommande, Montant, Statut ,stripe_payment_intent_id, applicationFeeAmount } = req.body;
        const paiement_commande = await getPaiementCommandeById(id);
        if (!paiement_commande) {
            return res.status(404).json({ message: "PaiementCommande non trouvé" });
        }
        await updatePaiementCommande( id ,{
            IdCommande, 
            Montant,
            Statut,
            stripe_payment_intent_id,
            applicationFeeAmount
        })
        
        res.status(200).json({ message: "PaiementCommande modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deletePaiementCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const paiement_commande = await getPaiementCommandeById(id);
        if (!paiement_commande) {
            return res.status(404).json({ message: "PaiementCommande non trouvé" });
        }
        await deletePaiementCommande(id);
        res.status(200).json({ message: "PaiementCommande supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getPaiementCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const paiement_commande = await getPaiementCommandeById(id);
        if(!paiement_commande){
            return res.status(404).json({message:"PaiementCommande non trouvé"})
        }
        res.status(200).json(paiement_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la paiement_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllPaiementCommandesControlleur(req,res) {
    try {
        const paiement_commandes = await getAllPaiementCommandes();
        res.status(200).json(paiement_commandes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des paiement_commandes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// request speciales

export async function getCommandeOfPaiementCommandeControlleur(req,res) {
    try {
        const { Commande } = req.params;
        const commande = await getCommandeById(Commande);
        if (!commande) {
            return res.status(404).json({ message: "PaiementCommande a un commande inexistant !(non trouvé)" });
        }
        res.status(200).json(commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfPaiementCommandeControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "PaiementCommande a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// todo: ajouter les controlleurs , requetes et... pour le stripe_payment_intent_id  (ne foirez pas ca)