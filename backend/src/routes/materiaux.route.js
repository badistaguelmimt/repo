import { Router } from "express";
import * as materiaux from "../controlleurs/materiaux.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression d'espèces
router.post("/", protectRoute, adminOnly, materiaux.createMateriauxControlleur);
router.put("/:id", protectRoute, adminOnly, materiaux.updateMateriauxControlleur);
router.delete("/:id", protectRoute, adminOnly, materiaux.deleteMateriauxControlleur);

// Routes publiques - lecture des espèces
router.get("/:id", materiaux.getMateriauxControlleur);
router.get("/", materiaux.getAllMateriauxsControlleur);

export default router;