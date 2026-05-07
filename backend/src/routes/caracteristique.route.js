import { Router } from "express";
import * as caracteristique from "../controlleurs/caracteristique.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression d'espèces
router.post("/", protectRoute, adminOnly, caracteristique.createCaracteristiqueControlleur);
router.put("/:id", protectRoute, adminOnly, caracteristique.updateCaracteristiqueControlleur);
router.delete("/:id", protectRoute, adminOnly, caracteristique.deleteCaracteristiqueControlleur);

// Routes publiques - lecture des caracteristiques
router.get("/:id", caracteristique.getCaracteristiqueControlleur);
router.get("/", caracteristique.getAllCaracteristiquesControlleur);

export default router;