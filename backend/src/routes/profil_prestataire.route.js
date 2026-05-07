import { Router } from "express";
import * as profil_prestataire from "../controlleurs/profil_prestataire.controlleur.js"
import { protectRoute, prestataireOnly, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/statut/:Statut", profil_prestataire.getStatutOfProfilPrestataireControlleur);
router.get("/type_service/:TypeService", profil_prestataire.getTypeServiceOfProfilPrestataireControlleur);
router.get("/utilisateur/:Utilisateur", profil_prestataire.getUtilisateurOfProfilPrestataireControlleur);

// Routes protégées - réservées aux prestataires (création)
router.post("/", protectRoute, prestataireOnly, profil_prestataire.createProfilPrestataireControlleur);

// Routes protégées - modification/suppression (propriétaire ou admin)
router.put("/:id", protectRoute, prestataireOnly, isOwnerOrAdmin, profil_prestataire.updateProfilPrestataireControlleur);
router.delete("/:id", protectRoute, prestataireOnly, isOwnerOrAdmin, profil_prestataire.deleteProfilPrestataireControlleur);

// Routes de lecture publiques
router.get("/mine", protectRoute, profil_prestataire.getMyProfilPrestataireControlleur);
router.get("/mine/reservations", protectRoute, profil_prestataire.getMyReservationsAsPrestataire);
router.get("/:id", profil_prestataire.getProfilPrestataireControlleur);
router.get("/", profil_prestataire.getAllProfilPrestatairesControlleur);



export default router;