import { createPanier, deletePanier, getAllPaniers, getPanierById, updatePanier } from "../database/panier.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createPanierControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdUtilisateur } = req.body;

        if(!IdUtilisateur ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createPanier({
            IdUtilisateur
        })

        res.status(201).json({ message: "Panier crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updatePanierControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdUtilisateur } = req.body;
        const panier = await getPanierById(id);
        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }
        await updatePanier( id ,{
            IdUtilisateur
        })
        
        res.status(200).json({ message: "Panier modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deletePanierControlleur(req,res) {
    try {
        const { id } = req.params;
        const panier = await getPanierById(id);
        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }
        await deletePanier(id);
        res.status(200).json({ message: "Panier supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getPanierControlleur(req,res) {
    try {
        const { id } = req.params;
        const panier = await getPanierById(id);
        if(!panier){
            return res.status(404).json({message:"Panier non trouvé"})
        }
        res.status(200).json(panier);
        
    } catch (error) {
        console.error("Erreur lors de la obtention de la panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllPaniersControlleur(req,res) {
    try {
        const paniers = await getAllPaniers();
        res.status(200).json(paniers);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des paniers:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getUtilisateurOfPanierControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Panier a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}