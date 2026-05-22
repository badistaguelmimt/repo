import { Router } from "express";
import * as disponibilite from "../controlleurs/disponibilite.controlleur.js"
import { protectRoute, prestataireOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Route publique — lecture des disponibilités par profil prestataire (accès non authentifié OK)
router.get("/profil_prestataire/:Profil", disponibilite.getProfilOfDisponibiliteControlleur);

// Routes protégées - création, modification, suppression (prestataires seulement)
router.post("/", protectRoute, prestataireOnly, disponibilite.createDisponibiliteControlleur);
router.put("/:id", protectRoute, prestataireOnly, disponibilite.updateDisponibiliteControlleur);
router.delete("/:id", protectRoute, prestataireOnly, disponibilite.deleteDisponibiliteControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, disponibilite.getDisponibiliteControlleur);
router.get("/", protectRoute, disponibilite.getAllDisponibilitesControlleur);



export default router;