import { Router } from "express";
import * as specification from "../controlleurs/specification.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/profil_prestataire/:ProfilPrestataire", specification.getProfilPrestataireOfSpecificationControlleur);
router.get("/espece/:Espece", specification.getEspeceOfSpecificationControlleur);

// Routes admin only - création, modification, suppression de spécifications
router.post("/", protectRoute, adminOnly, specification.createSpecificationControlleur);
router.put("/:id", protectRoute, adminOnly, specification.updateSpecificationControlleur);
router.delete("/:id", protectRoute, adminOnly, specification.deleteSpecificationControlleur);

// Routes de lecture publiques
router.get("/:id", specification.getSpecificationControlleur);
router.get("/", specification.getAllSpecificationsControlleur);



export default router;