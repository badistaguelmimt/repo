import { Router } from "express";
import * as wishlist from "../controlleurs/wishlist.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/utilisateur/:Utilisateur", protectRoute, wishlist.getUtilisateurOfWishlistControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, wishlist.createWishlistControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, wishlist.updateWishlistControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, wishlist.deleteWishlistControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, wishlist.getWishlistControlleur);
router.get("/", protectRoute, wishlist.getAllWishlistsControlleur);



export default router;