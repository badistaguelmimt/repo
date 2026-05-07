import { Router } from "express";
import * as avis_service from "../controlleurs/avis_service.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/type_avis/:TypeService", avis_service.getTypeAvisOfAvisServiceControlleur);
router.get("/utilisateur/:Utilisateur", avis_service.getUtilisateurOfAvisServiceControlleur);
router.get("/reservation/:Reservation", avis_service.getReservationOfAvisServiceControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, avis_service.createAvisServiceControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, avis_service.updateAvisServiceControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, avis_service.deleteAvisServiceControlleur);

// Routes de lecture publiques
router.get("/:id", avis_service.getAvisServiceControlleur);
router.get("/", avis_service.getAllAvisServicesControlleur);



export default router;