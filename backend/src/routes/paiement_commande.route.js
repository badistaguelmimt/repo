import { Router } from "express";
import * as paiement_commande from "../controlleurs/paiement_commande.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/statut/:Statut", protectRoute, paiement_commande.getStatutOfPaiementCommandeControlleur);
router.get("/commande/:Commande", protectRoute, paiement_commande.getCommandeOfPaiementCommandeControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, paiement_commande.createPaiementCommandeControlleur);
router.put("/:id", protectRoute, paiement_commande.updatePaiementCommandeControlleur);
router.delete("/:id", protectRoute, paiement_commande.deletePaiementCommandeControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, paiement_commande.getPaiementCommandeControlleur);
router.get("/", protectRoute, paiement_commande.getAllPaiementCommandesControlleur);



export default router;