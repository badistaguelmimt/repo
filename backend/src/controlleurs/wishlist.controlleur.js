import { getUtilisateurById } from "../database/utilisateur.db.js";
import { createWishlist, deleteWishlist, getAllWishlists, getWishlistById, updateWishlist } from "../database/wishlist.db.js";

export async function createWishlistControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdUtilisateur } = req.body;

        if(!IdUtilisateur ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createWishlist({
            IdUtilisateur
        })

        res.status(201).json({ message: "Wishlist crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateWishlistControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdUtilisateur } = req.body;
        const wishlist = await getWishlistById(id);
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist non trouvé" });
        }
        await updateWishlist( id ,{
            IdUtilisateur
        })
        
        res.status(200).json({ message: "Wishlist modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteWishlistControlleur(req,res) {
    try {
        const { id } = req.params;
        const wishlist = await getWishlistById(id);
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist non trouvé" });
        }
        await deleteWishlist(id);
        res.status(200).json({ message: "Wishlist supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getWishlistControlleur(req,res) {
    try {
        const { id } = req.params;
        const wishlist = await getWishlistById(id);
        if(!wishlist){
            return res.status(404).json({message:"Wishlist non trouvé"})
        }
        res.status(200).json(wishlist);
        
    } catch (error) {
        console.error("Erreur lors de la obtention de la wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllWishlistsControlleur(req,res) {
    try {
        const wishlists = await getAllWishlists();
        res.status(200).json(wishlists);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des wishlists:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getUtilisateurOfWishlistControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Wishlist a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}