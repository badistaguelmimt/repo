import { Router } from "express";
import * as race from "../controlleurs/race.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes publiques - création et modification ouvertes aux utilisateurs connectés (Vision Wikipedia)
router.post("/", protectRoute, race.createRaceControlleur);
router.put("/:id", protectRoute, race.updateRaceControlleur);
router.delete("/:id", protectRoute, adminOnly, race.deleteRaceControlleur);

// Routes spéciales publiques
router.get("/espece/:Espece", race.getEspeceOfRaceControlleur);
router.get("/caracteristiques/:id", race.getCaracteristiquesOfRaceIdControlleur);

// Routes publiques - lecture des races
router.get("/:id", race.getRaceControlleur);
router.get("/", race.getAllRacesControlleur);

export default router;