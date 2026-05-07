import { createLigneCommande, deleteLigneCommande, getAllLigneCommandes, getLigneCommandeById, updateLigneCommande } from "../database/ligne_commande.db.js";
import { getProduitById } from "../database/produit.db.js";
import { getSousCommandeById } from "../database/sous_commande.db.js";

export async function createLigneCommandeControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdSousCommande, IdProduit,Quantite } = req.body;

        if (
            IdSousCommande == null ||
            IdProduit == null ||
            !Number.isInteger(Quantite) ||
            Quantite <= 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createLigneCommande({
            IdSousCommande, 
            IdProduit,
            Quantite
        })

        res.status(201).json({ message: "LigneCommande crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateLigneCommandeControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdSousCommande, IdProduit, Quantite } = req.body;
        const ligne_commande = await getLigneCommandeById(id);
        if (!ligne_commande) {
            return res.status(404).json({ message: "LigneCommande non trouvée" });
        }

        if (
            IdSousCommande == null ||
            IdProduit == null ||
            !Number.isInteger(Quantite) ||
            Quantite <= 0
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        await updateLigneCommande( id ,{
            IdSousCommande, 
            IdProduit,
            Quantite
        })
        
        res.status(200).json({ message: "LigneCommande modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteLigneCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_commande = await getLigneCommandeById(id);
        if (!ligne_commande) {
            return res.status(404).json({ message: "LigneCommande non trouvée" });
        }
        await deleteLigneCommande(id);
        res.status(200).json({ message: "LigneCommande supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getLigneCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_commande = await getLigneCommandeById(id);
        if(!ligne_commande){
            return res.status(404).json({message:"LigneCommande non trouvée"})
        }
        res.status(200).json(ligne_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la ligne_commande:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllLigneCommandesControlleur(req,res) {
    try {
        const ligne_commandes = await getAllLigneCommandes();
        res.status(200).json(ligne_commandes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des ligne_commandes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getSousCommandeOfLigneCommandeControlleur(req,res) {
    try {
        const { SousCommande } = req.params;
        const sous_commande = await getSousCommandeById(SousCommande);
        if (!sous_commande) {
            return res.status(404).json({ message: "LigneCommande a un sous_commande inexistant !(non trouvé)" });
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProduitOfLigneCommandeControlleur(req,res) {
    try {
        const { Produit } = req.params;
        const produit = await getProduitById(Produit);
        if (!produit) {
            return res.status(404).json({ message: "LigneCommande a un produit inexistant !(non trouvé)" });
        }
        res.status(200).json(produit);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}