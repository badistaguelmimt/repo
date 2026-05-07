import { Router } from "express";
import {
  createReservationControlleur,
  getAllReservationsControlleur,
  getMyReservationsControlleur,
  getRefugeReservationsControlleur,
  getReservationControlleur,
  updateReservationControlleur,
  updateReservationStatusControlleur,
  deleteReservationControlleur,
  // Stubs legacy
  getAnimalOfReservationControlleur,
  getAnnonceOfReservationControlleur,
  getProfilPrestataireOfReservationControlleur,
  getStatutOfReservationControlleur,
  getTypeServiceOfReservationControlleur,
  getUtilisateurOfReservationControlleur,
} from "../controlleurs/reservation.controlleur.js";
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router();

// ── Routes Dashboard ──────────────────────────────────────────────────────────
router.get("/mine", protectRoute, getMyReservationsControlleur);
router.get("/refuge/all", protectRoute, getRefugeReservationsControlleur);

// ── CRUD authentifié ──────────────────────────────────────────────────────────
router.post("/", protectRoute, createReservationControlleur);
router.put("/:id/status", protectRoute, updateReservationStatusControlleur);
router.put("/:id", protectRoute, updateReservationControlleur);
router.delete("/:id", protectRoute, deleteReservationControlleur);
router.get("/:id", protectRoute, getReservationControlleur);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/", protectRoute, adminOnly, getAllReservationsControlleur);

// ── Legacy stubs ──────────────────────────────────────────────────────────────
router.get("/utilisateur/:Utilisateur", protectRoute, getUtilisateurOfReservationControlleur);
router.get("/type_service/:TypeService", getTypeServiceOfReservationControlleur);
router.get("/statut/:Statut", getStatutOfReservationControlleur);
router.get("/profil_prestataire/:ProfilPrestataire", getProfilPrestataireOfReservationControlleur);
router.get("/annonce/:Annonce", getAnnonceOfReservationControlleur);
router.get("/animal/:Animal", getAnimalOfReservationControlleur);

export default router;
