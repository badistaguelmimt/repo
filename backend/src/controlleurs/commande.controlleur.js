import { createCommande, deleteCommande, getAllCommandes, getCommandeById, updateCommande } from "../database/commande.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createCommandeControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdUtilisateur, Statut } = req.body;

        if(!IdUtilisateur || !Statut ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createCommande({
            IdUtilisateur, 
            Statut
        })

        res.status(201).json({ message: "Commande crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateCommandeControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdUtilisateur, Statut } = req.body;
        const commande = await getCommandeById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvé" });
        }
        await updateCommande( id ,{
            IdUtilisateur, 
            Statut
        })
        
        res.status(200).json({ message: "Commande modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const commande = await getCommandeById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvé" });
        }
        await deleteCommande(id);
        res.status(200).json({ message: "Commande supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const commande = await getCommandeById(id);
        if(!commande){
            return res.status(404).json({message:"Commande non trouvé"})
        }
        res.status(200).json(commande);
        
    } catch (error) {
        console.error("Erreur lors de la obtention de la commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllCommandesControlleur(req,res) {
    try {
        const commandes = await getAllCommandes();
        res.status(200).json(commandes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des commandes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getUtilisateurOfCommandeControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Commande a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfCommandeControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Commande a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}