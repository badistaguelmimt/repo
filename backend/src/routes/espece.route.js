import { Router } from "express";
import * as espece from "../controlleurs/espece.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression d'espèces
router.post("/", protectRoute, adminOnly, espece.createEspeceControlleur);
router.put("/:id", protectRoute, adminOnly, espece.updateEspeceControlleur);
router.delete("/:id", protectRoute, adminOnly, espece.deleteEspeceControlleur);

// Routes publiques - lecture des espèces
router.get("/:id", espece.getEspeceControlleur);
router.get("/", espece.getAllEspecesControlleur);

export default router;