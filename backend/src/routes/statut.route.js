import { Router } from "express";
import * as statut from "../controlleurs/statut.contolleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression de statuts
router.post("/", protectRoute, adminOnly, statut.createStatutControlleur);
router.put("/:id", protectRoute, adminOnly, statut.updateStatutControlleur);
router.delete("/:id", protectRoute, adminOnly, statut.deleteStatutControlleur);

// Routes publiques - lecture des statuts
router.get("/:id", statut.getStatutControlleur);
router.get("/", statut.getAllStatutsControlleur);

export default router;