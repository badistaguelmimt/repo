import { Router } from "express";
import * as panier from "../controlleurs/panier.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - création, modification, suppression de paniers (utilisateurs authentifiés)
router.post("/", protectRoute, panier.createPanierControlleur);
router.put("/:id", protectRoute, panier.updatePanierControlleur);
router.delete("/:id", protectRoute, panier.deletePanierControlleur);

// Routes protégées - lecture des paniers
router.get("/:id", protectRoute, panier.getPanierControlleur);
router.get("/utilisateur/:Utilisateur", protectRoute, panier.getUtilisateurOfPanierControlleur);

// Route protégée - liste tous les paniers
router.get("/", protectRoute, panier.getAllPaniersControlleur);

export default router;