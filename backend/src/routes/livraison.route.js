import { Router } from "express";
import * as livraison from "../controlleurs/livraison.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/statut/:Statut", protectRoute, livraison.getStatutOfLivraisonControlleur);
router.get("/sous_commande/:SousCommande", protectRoute, livraison.getSousCommandeOfLivraisonControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, livraison.createLivraisonControlleur);
router.put("/:id", protectRoute, livraison.updateLivraisonControlleur);
router.delete("/:id", protectRoute, livraison.deleteLivraisonControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, livraison.getLivraisonControlleur);
router.get("/", protectRoute, livraison.getAllLivraisonsControlleur);



export default router;