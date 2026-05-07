import { Router } from "express";
import * as paiement_service from "../controlleurs/paiement_service.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/reservation/:Reservation", protectRoute, paiement_service.getReservationOfPaiementServiceControlleur);
router.get("/statut/:Statut", protectRoute, paiement_service.getStatutOfPaiementServiceControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, paiement_service.createPaiementServiceControlleur);
router.put("/:id", protectRoute, paiement_service.updatePaiementServiceControlleur);
router.delete("/:id", protectRoute, paiement_service.deletePaiementServiceControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, paiement_service.getPaiementServiceControlleur);
router.get("/", protectRoute, paiement_service.getAllPaiementServicesControlleur);



export default router;