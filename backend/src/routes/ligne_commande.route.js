import { Router } from "express";
import * as ligne_commande from "../controlleurs/ligne_commande.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/produit/:Produit", protectRoute, ligne_commande.getProduitOfLigneCommandeControlleur);
router.get("/sous_commande/:SousCommande", protectRoute, ligne_commande.getSousCommandeOfLigneCommandeControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, ligne_commande.createLigneCommandeControlleur);
router.put("/:id", protectRoute, ligne_commande.updateLigneCommandeControlleur);
router.delete("/:id", protectRoute, ligne_commande.deleteLigneCommandeControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, ligne_commande.getLigneCommandeControlleur);
router.get("/", protectRoute, ligne_commande.getAllLigneCommandesControlleur);



export default router;