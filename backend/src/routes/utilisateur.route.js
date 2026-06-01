import { Router } from "express";

import * as utilisateur from "../controlleurs/utilisateur.controlleur.js"
import { protectRoute, adminOnly, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Plus besoin de /bootstrap, la synchro se fait via webhooks Clerk -> Inngest

// Route authentifiée — retourne l'utilisateur courant + ses rôles (remplace /bootstrap)
router.get("/me", protectRoute, utilisateur.getMeControlleur);

// Route admin only - liste tous les utilisateurs
router.get("/", protectRoute, adminOnly, utilisateur.getAllAccountsControlleur);
router.get("/admin/stats", protectRoute, adminOnly, utilisateur.getAdminStatsControlleur);
router.put("/:id/ban", protectRoute, adminOnly, utilisateur.banUtilisateurControlleur);

// Routes de lecture protégées (propriétaire ou admin)
router.get("/animaux/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurAnimalsByIdControlleur);
router.get("/refuges/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurRefugesByIdControlleur);
router.get("/roles/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurRolesByIdControlleur);
router.get("/clerk/:id", protectRoute, utilisateur.getUtilisateurByClerkIdControlleur);
router.get("/:id", protectRoute, isOwnerOrAdmin, utilisateur.getAccountControlleur);

// Routes protégées - gestion des animaux de l'utilisateur
// GET    /animaux/:utilisateurId              → liste les animaux de l'utilisateur
// POST   /animal/:utilisateurId/:animalId    → ajoute un animal à l'utilisateur
// DELETE /animal/:utilisateurId/:animalId    → retire un animal de l'utilisateur
// PUT    /animal/set/:utilisateurId/:animalId   → lie un animal à l'utilisateur (adoption acceptée)
// PUT    /animal/unset/:utilisateurId/:animalId → délie un animal de l'utilisateur (transfert refuge)
router.get("/animaux/:id", protectRoute, isOwnerOrAdmin, utilisateur.getUtilisateurAnimalsByIdControlleur);
router.post("/animal/:utilisateurId/:animalId", protectRoute, utilisateur.addAnimalToUtilisateurByIdsControlleur);
router.delete("/animal/:utilisateurId/:animalId", protectRoute, utilisateur.removeAnimalFromUtilisateurByIdsControlleur);
router.put("/animal/set/:utilisateurId/:animalId", protectRoute, utilisateur.setAnimalToUtilisateurByIdsControlleur);
router.put("/animal/unset/:utilisateurId/:animalId", protectRoute, utilisateur.unsetAnimalToUtilisateurByIdsControlleur);

// Routes protégées - gestion des refuges de l'utilisateur
router.delete("/refuge/:id", protectRoute, utilisateur.removeRefugeToUtilisateurByIdsControlleur);
router.post("/refuge/:id", protectRoute, utilisateur.addRefugeToUtilisateurByIdsControlleur);

// Routes admin only - gestion des rôles (admin uniquement)
// :utilisateurId = Id de l'utilisateur, :roleId = Id du rôle
router.delete("/role/:utilisateurId/:roleId", protectRoute, adminOnly, utilisateur.removeRoleToUtilisateurByIdsControlleur);
router.post("/role/:utilisateurId/:roleId", protectRoute, adminOnly, utilisateur.addRoleToUtilisateurByIdsControlleur);

// Routes protégées - modification du propre compte (propriétaire ou admin)
router.post("/", protectRoute, utilisateur.createAccountControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, utilisateur.updateAccountControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, utilisateur.deleteAccountControlleur);



export default router;
