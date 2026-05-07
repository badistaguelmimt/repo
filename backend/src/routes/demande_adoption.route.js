import { Router } from "express";
import { protectRoute, hasAnyRole } from "../midleware/auth.midleware.js";
import {
  createDemandeControlleur,
  getMesDemandes,
  getDemandesRefuge,
  getDemandeByIdControlleur,
  updateStatutControlleur,
  deleteDemande,
} from "../controlleurs/demande_adoption.controlleur.js";

const router = Router();

// Utilisateur : soumettre une demande
router.post("/", protectRoute, createDemandeControlleur);

// Utilisateur : voir ses propres demandes
router.get("/mes-demandes", protectRoute, getMesDemandes);

// Refuge : voir toutes les demandes reçues
router.get(
  "/refuge",
  protectRoute,
  hasAnyRole(["Refuge", "Admin"]),
  getDemandesRefuge
);

// Lecture d'une demande (utilisateur concerné ou refuge)
router.get("/:id", protectRoute, getDemandeByIdControlleur);

// Refuge : accepter / refuser une demande
router.put(
  "/:id/statut",
  protectRoute,
  hasAnyRole(["Refuge", "Admin"]),
  updateStatutControlleur
);

// Utilisateur : annuler sa demande
router.delete("/:id", protectRoute, deleteDemande);

export default router;
