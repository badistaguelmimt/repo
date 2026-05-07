import { Router } from "express";
import * as ligne_panier from "../controlleurs/ligne_panier.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/produit/:Produit", protectRoute, ligne_panier.getProduitOfLignePanierControlleur);
router.get("/panier/:Panier", protectRoute, ligne_panier.getPanierOfLignePanierControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, ligne_panier.createLignePanierControlleur);
router.put("/:id", protectRoute, ligne_panier.updateLignePanierControlleur);
router.delete("/:id", protectRoute, ligne_panier.deleteLignePanierControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, ligne_panier.getLignePanierControlleur);
router.get("/", protectRoute, ligne_panier.getAllLignePaniersControlleur);



export default router;