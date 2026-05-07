import { Router } from "express";
import * as avis from "../controlleurs/avis.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/sous_commande/:SousCommande", avis.getSousCommandeOfAvisControlleur);
router.get("/produit/:Produit", avis.getProduitOfAvisControlleur);
router.get("/utilisateur/:Utilisateur", avis.getUtilisateurOfAvisControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, avis.createAvisControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, avis.updateAvisControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, avis.deleteAvisControlleur);

// Routes de lecture publiques
router.get("/:id", avis.getAvisControlleur);
router.get("/", avis.getAllAvissControlleur);



export default router;