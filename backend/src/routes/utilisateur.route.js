import { Router } from "express";

import * as utilisateur from "../controlleurs/utilisateur.controlleur.js"
import { protectRoute, adminOnly, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Bootstrap du compte backend a partir d'un utilisateur Clerk authentifie
// L'auth est validée dans le contrôleur via getAuth(req) (méthode recommandée Clerk v5+)
router.post("/bootstrap", utilisateur.bootstrapCurrentUtilisateurControlleur);

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
router.put("/animal/unset/:id", protectRoute, utilisateur.unsetAnimalToUtilisateurByIdsControlleur);
router.put("/animal/set/:id", protectRoute, utilisateur.setAnimalToUtilisateurByIdsControlleur);
router.delete("/animal/:id", protectRoute, utilisateur.removeAnimalFromUtilisateurByIdsControlleur);
router.post("/animal/:id", protectRoute, utilisateur.addAnimalToUtilisateurByIdsControlleur);

// Routes protégées - gestion des refuges de l'utilisateur
router.delete("/refuge/:id", protectRoute, utilisateur.removeRefugeToUtilisateurByIdsControlleur);
router.post("/refuge/:id", protectRoute, utilisateur.addRefugeToUtilisateurByIdsControlleur);

// Routes admin only - gestion des rôles (admin uniquement)
router.delete("/role/:id", protectRoute, adminOnly, utilisateur.removeRoleToUtilisateurByIdsControlleur);
router.post("/role/:id", protectRoute, adminOnly, utilisateur.addRoleToUtilisateurByIdsControlleur);

// Routes protégées - modification du propre compte (propriétaire ou admin)
router.post("/", protectRoute, utilisateur.createAccountControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, utilisateur.updateAccountControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, utilisateur.deleteAccountControlleur);



export default router;
