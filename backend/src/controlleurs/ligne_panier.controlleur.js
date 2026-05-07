import { createLignePanier, deleteLignePanier, getAllLignePaniers, getLignePanierById, updateLignePanier } from "../database/ligne_panier.db.js";
import { getPanierById } from "../database/panier.db.js";
import { getProduitById } from "../database/produit.db.js";

export async function createLignePanierControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdPanier, IdProduit,Quantite } = req.body;

        if(!IdPanier || !IdProduit || !Quantite ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createLignePanier({
            IdPanier, 
            IdProduit,
            Quantite
        })

        res.status(201).json({ message: "LignePanier crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la ligne_panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateLignePanierControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdPanier, IdProduit, Quantite } = req.body;
        const ligne_panier = await getLignePanierById(id);
        if (!ligne_panier) {
            return res.status(404).json({ message: "LignePanier non trouvé" });
        }
        await updateLignePanier( id ,{
            IdPanier, 
            IdProduit,
            Quantite
        })
        
        res.status(200).json({ message: "LignePanier modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la ligne_panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteLignePanierControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_panier = await getLignePanierById(id);
        if (!ligne_panier) {
            return res.status(404).json({ message: "LignePanier non trouvé" });
        }
        await deleteLignePanier(id);
        res.status(200).json({ message: "LignePanier supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la ligne_panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getLignePanierControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_panier = await getLignePanierById(id);
        if(!ligne_panier){
            return res.status(404).json({message:"LignePanier non trouvé"})
        }
        res.status(200).json(ligne_panier);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la ligne_panier:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllLignePaniersControlleur(req,res) {
    try {
        const ligne_paniers = await getAllLignePaniers();
        res.status(200).json(ligne_paniers);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des ligne_paniers:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getPanierOfLignePanierControlleur(req,res) {
    try {
        const { Panier } = req.params;
        const ligne_panier = await getPanierById(Panier);
        if (!ligne_panier) {
            return res.status(404).json({ message: "LignePanier a un ligne_panier inexistant !(non trouvé)" });
        }
        res.status(200).json(ligne_panier);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProduitOfLignePanierControlleur(req,res) {
    try {
        const { Produit } = req.params;
        const sous_commande = await getProduitById(Produit);
        if (!sous_commande) {
            return res.status(404).json({ message: "LignePanier a un sous_commande inexistant !(non trouvé)" });
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}