import { Router } from "express";
import * as vaccin from "../controlleurs/vaccin.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression de vaccins
router.post("/", protectRoute, adminOnly, vaccin.createVaccinControlleur);
router.put("/:id", protectRoute, adminOnly, vaccin.updateVaccinControlleur);
router.delete("/:id", protectRoute, adminOnly, vaccin.deleteVaccinControlleur);

// Routes publiques - lecture des vaccins
router.get("/:id", vaccin.getVaccinControlleur);
router.get("/", vaccin.getAllVaccinsControlleur);

export default router;