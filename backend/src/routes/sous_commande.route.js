import { Router } from "express";
import * as sous_commande from "../controlleurs/sous_commande.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes pour Dashboard Refuge
router.get("/refuge/all", protectRoute, sous_commande.getRefugeSousCommandesControlleur);
router.put("/:id/status", protectRoute, sous_commande.updateSousCommandeStatusControlleur);

// Routes spéciales de lecture protégées
router.get("/statut/:Statut", protectRoute, sous_commande.getStatutOfSousCommandeControlleur);
router.get("/refuge/:Refuge", protectRoute, sous_commande.getRefugeOfSousCommandeControlleur);
router.get("/commande/:Commande", protectRoute, sous_commande.getCommandeOfSousCommandeControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, sous_commande.createSousCommandeControlleur);
router.put("/:id", protectRoute, sous_commande.updateSousCommandeControlleur);
router.delete("/:id", protectRoute, sous_commande.deleteSousCommandeControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, sous_commande.getSousCommandeControlleur);
router.get("/", protectRoute, sous_commande.getAllSousCommandesControlleur);



export default router;