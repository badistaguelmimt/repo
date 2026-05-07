import { createLivraison, deleteLivraison, getAllLivraisons, getLivraisonById, updateLivraison } from "../database/livraison.db.js";
import { getSousCommandeById } from "../database/sous_commande.db.js";
import { getStatutById } from "../database/statut.db.js";

export async function createLivraisonControlleur(req,res) {
    try {
        const { IdSousCommande,Addresse,Statut,TrackingNumber,Telephone } = req.body;

        if(!IdSousCommande || !Statut && !TrackingNumber || !Telephone){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createLivraison({
            IdSousCommande,
            Addresse,
            Statut,
            TrackingNumber,
            Telephone 
        })

        res.status(201).json({ message: "Livraison crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la livraison:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateLivraisonControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdSousCommande,Addresse,Statut,TrackingNumber,Telephone } = req.body;
        const livraison = await getLivraisonById(id);
        if (!livraison) {
            return res.status(404).json({ message: "Livraison non trouvée" });
        }
        await updateLivraison( id ,{
            IdSousCommande,
            Addresse,
            Statut,
            TrackingNumber,
            Telephone
        })
        
        res.status(200).json({ message: "Livraison modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la livraison:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteLivraisonControlleur(req,res) {
    try {
        const { id } = req.params;
        const livraison = await getLivraisonById(id);
        if (!livraison) {
            return res.status(404).json({ message: "Livraison non trouvée" });
        }
        await deleteLivraison(id);
        res.status(200).json({ message: "Livraison supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la livraison:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getLivraisonControlleur(req,res) {
    try {
        const { id } = req.params;
        const livraison = await getLivraisonById(id);
        if(!livraison){
            return res.status(404).json({message:"Livraison non trouvée"})
        }
        res.status(200).json(livraison);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la livraison:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllLivraisonsControlleur(req,res) {
    try {
        const livraisons = await getAllLivraisons();
        res.status(200).json(livraisons);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des livraisons:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getSousCommandeOfLivraisonControlleur(req,res) {
    try {
        const { SousCommande } = req.params;
        const sous_commande = await getSousCommandeById(SousCommande);
        if (!sous_commande) {
            return res.status(404).json({ message: "Livraison a un sous_commande inexistant !(non trouvé)" });
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfLivraisonControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Livraison a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
