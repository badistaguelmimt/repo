import { createAvis, deleteAvis, getAllAviss, getAvisById, updateAvis } from "../database/avis.db.js";
import { getProduitById } from "../database/produit.db.js";
import { getSousCommandeById } from "../database/sous_commande.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createAvisControlleur(req,res) {
    try {
        const { IdUtilisateur,IdProduit,IdSousCommande,Note,Commentaire } = req.body;

        if (
            IdUtilisateur == null ||
            IdSousCommande == null ||
            Note == null ||
            !Commentaire
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const utilisateur = await getUtilisateurById(IdUtilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const produit = await getProduitById(IdProduit);
        if (!produit) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        const sousCommande = await getSousCommandeById(IdSousCommande);
        if (!sousCommande) {
            return res.status(404).json({ message: "Sous-commande introuvable" });
        }

        const requete = await createAvis({
            IdUtilisateur,
            IdProduit,
            IdSousCommande,
            Note,
            Commentaire 
        })

        res.status(201).json({ message: "Avis crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'avis:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateAvisControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdUtilisateur,IdProduit,IdSousCommande,Note,Commentaire } = req.body;
        const avis = await getAvisById(id);
        if (!avis) {
            return res.status(404).json({ message: "Avis non trouvé" });
        }

        if (
            IdUtilisateur == null ||
            IdProduit == null ||
            IdSousCommande == null ||
            Note == null ||
            !Commentaire
        ) {
            return res.status(400).json({ message: "Tous les champs sont requis pour modifier un avis" });
        }

        await updateAvis( id ,{
            IdUtilisateur,
            IdProduit,
            IdSousCommande,
            Note,
            Commentaire
        })
        
        res.status(200).json({ message: "Avis modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'avis:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAvisControlleur(req,res) {
    try {
        const { id } = req.params;
        const avis = await getAvisById(id);
        if (!avis) {
            return res.status(404).json({ message: "Avis non trouvé" });
        }
        await deleteAvis(id);
        res.status(200).json({ message: "Avis supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAvisControlleur(req,res) {
    try {
        const { id } = req.params;
        const avis = await getAvisById(id);
        if(!avis){
            return res.status(404).json({message:"Avis non trouvé"})
        }
        res.status(200).json(avis);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'avis:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAvissControlleur(req,res) {
    try {
        const aviss = await getAllAviss();
        res.status(200).json(aviss);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des aviss:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getUtilisateurOfAvisControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Avis a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProduitOfAvisControlleur(req,res) {
    try {
        const { Produit } = req.params;
        const utilisateur = await getProduitById(Produit);
        if (!utilisateur) {
            return res.status(404).json({ message: "Avis a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getSousCommandeOfAvisControlleur(req,res) {
    try {
        const { SousCommande } = req.params;
        const sous_commande = await getSousCommandeById(SousCommande);
        if (!sous_commande) {
            return res.status(404).json({ message: "Avis a un sous_commande inexistant !(non trouvé)" });
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}