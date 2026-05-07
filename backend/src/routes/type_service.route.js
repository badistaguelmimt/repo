import { Router } from "express";
import * as type_service from "../controlleurs/type_service.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression de types de services
router.post("/", protectRoute, adminOnly, type_service.createTypeServiceControlleur);
router.put("/:id", protectRoute, adminOnly, type_service.updateTypeServiceControlleur);
router.delete("/:id", protectRoute, adminOnly, type_service.deleteTypeServiceControlleur);

// Routes publiques - lecture des types de services
router.get("/:id", type_service.getTypeServiceControlleur);
router.get("/", type_service.getAllTypeServicesControlleur);

export default router;