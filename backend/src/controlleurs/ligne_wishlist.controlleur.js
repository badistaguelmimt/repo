import { createLigneWishlist, deleteLigneWishlist, getAllLigneWishlists, getLigneWishlistById, updateLigneWishlist } from "../database/ligne_wishlist.db.js";
import { getProduitById } from "../database/produit.db.js";
import { getWishlistById } from "../database/wishlist.db.js";

export async function createLigneWishlistControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdWishlist, IdProduit,Quantite } = req.body;

        if(!IdWishlist || !IdProduit || !Quantite ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createLigneWishlist({
            IdWishlist, 
            IdProduit,
            Quantite
        })

        res.status(201).json({ message: "LigneWishlist crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la ligne_wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateLigneWishlistControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdWishlist, IdProduit, Quantite } = req.body;
        const ligne_wishlist = await getLigneWishlistById(id);
        if (!ligne_wishlist) {
            return res.status(404).json({ message: "LigneWishlist non trouvé" });
        }
        await updateLigneWishlist( id ,{
            IdWishlist, 
            IdProduit,
            Quantite
        })
        
        res.status(200).json({ message: "LigneWishlist modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la ligne_wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteLigneWishlistControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_wishlist = await getLigneWishlistById(id);
        if (!ligne_wishlist) {
            return res.status(404).json({ message: "LigneWishlist non trouvé" });
        }
        await deleteLigneWishlist(id);
        res.status(200).json({ message: "LigneWishlist supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la ligne_wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getLigneWishlistControlleur(req,res) {
    try {
        const { id } = req.params;
        const ligne_wishlist = await getLigneWishlistById(id);
        if(!ligne_wishlist){
            return res.status(404).json({message:"LigneWishlist non trouvé"})
        }
        res.status(200).json(ligne_wishlist);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la ligne_wishlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllLigneWishlistsControlleur(req,res) {
    try {
        const ligne_wishlists = await getAllLigneWishlists();
        res.status(200).json(ligne_wishlists);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des ligne_wishlists:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getWishlistOfLigneWishlistControlleur(req,res) {
    try {
        const { Wishlist } = req.params;
        const wishlist = await getWishlistById(Wishlist);
        if (!wishlist) {
            return res.status(404).json({ message: "LigneWishlist a un wishlist inexistant !(non trouvé)" });
        }
        res.status(200).json(wishlist);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProduitOfLigneWishlistControlleur(req,res) {
    try {
        const { Produit } = req.params;
        const produit = await getProduitById(Produit);
        if (!produit) {
            return res.status(404).json({ message: "LigneWishlist a un produit inexistant !(non trouvé)" });
        }
        res.status(200).json(produit);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}