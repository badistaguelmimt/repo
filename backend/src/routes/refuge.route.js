import { Router } from "express";
import * as refuge from "../controlleurs/refuge.controlleur.js"
import { protectRoute, refugeOnly, isOwnerOrAdmin, adminOnly, hasAnyRole } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - réservées aux refuges (création)
router.post("/", protectRoute, refugeOnly, refuge.createRefugeControlleur);

// Routes protégées - modification/suppression (propriétaire, refuge gestionnaire, ou admin)
router.put("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), refuge.updateRefugeControlleur);
router.delete("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), refuge.deleteRefugeControlleur);

// Routes Admin
router.put("/:id/verify", protectRoute, adminOnly, refuge.verifyRefugeControlleur);

// Routes protégées - gestion des animaux (refuge only)
router.put("/unset_animal/:id", protectRoute, refugeOnly, refuge.unsetAnimalToRefugeByIdsControlleur);
router.put("/set_animal/:id", protectRoute, refugeOnly, refuge.setAnimalToRefugeByIdsControlleur);
router.delete("/supprime_animal/:id", protectRoute, refugeOnly, refuge.removeAnimalFromRefugeByIdsControlleur);
router.post("/ajout_animal/:id", protectRoute, refugeOnly, refuge.addAnimalToRefugeByIdsControlleur);

// Routes de lecture publiques
router.get("/animaaux/:id", refuge.getRefugeAnimalsByIdControlleur);
router.get("/:id", refuge.getRefugeControlleur);
router.get("/", refuge.getAllRefugesControlleur);


export default router;