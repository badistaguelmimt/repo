import { Router } from "express";
import * as ligne_wishlist from "../controlleurs/ligne_wishlist.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/produit/:Produit", protectRoute, ligne_wishlist.getProduitOfLigneWishlistControlleur);
router.get("/wishlist/:Wishlist", protectRoute, ligne_wishlist.getWishlistOfLigneWishlistControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, ligne_wishlist.createLigneWishlistControlleur);
router.put("/:id", protectRoute, ligne_wishlist.updateLigneWishlistControlleur);
router.delete("/:id", protectRoute, ligne_wishlist.deleteLigneWishlistControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, ligne_wishlist.getLigneWishlistControlleur);
router.get("/", protectRoute, ligne_wishlist.getAllLigneWishlistsControlleur);



export default router;