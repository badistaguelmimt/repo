import { Router } from "express";
import * as role from "../controlleurs/role.controlleur.js"
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router()

// Routes admin only - création, modification, suppression de rôles
router.post("/", protectRoute, adminOnly, role.createRoleControlleur);
router.put("/:id", protectRoute, adminOnly, role.updateRoleControlleur);
router.delete("/:id", protectRoute, adminOnly, role.deleteRoleControlleur);

// Routes publiques - lecture des rôles
router.get("/:id", role.getRoleControlleur);
router.get("/", role.getAllRolesControlleur);

export default router;