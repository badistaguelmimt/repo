import { Router } from "express";
import * as web from "../controlleurs/web.controlleur.js"
import { adminOnly, protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router();

// ==================== ROUTES ANIMAUX ====================

// Routes protégées - création, modification, suppression d'animaux (utilisateurs authentifiés)
router.post("/animaux", protectRoute, web.createAnimalControlleur);
router.put("/animaux/:id", protectRoute, isOwnerOrAdmin, web.updateAnimal);
router.delete("/animaux/:id", protectRoute, isOwnerOrAdmin, web.deleteAnimal);

// Routes publiques - lecture des animaux
router.get("/animaux/:id", web.getAnimal);
router.get("/animaux", web.getAllAnimals);

// ==================== ROUTES COMPTES ====================

// Route publique - création de compte
router.post("/accounts", web.createAccount);

// Routes protégées - lecture et modification (propriétaire ou admin)
router.get("/accounts/:id", protectRoute, isOwnerOrAdmin, web.getAccount);
router.put("/accounts/:id", protectRoute, isOwnerOrAdmin, web.updateAccount);
router.delete("/accounts/:id", protectRoute, isOwnerOrAdmin, web.deleteAccount);

// Route admin only - liste tous les comptes
router.get("/accounts", protectRoute, adminOnly, web.getAllAccounts);

// ==================== ROUTES PRODUITS ====================

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/products", protectRoute, web.createProduct);
router.put("/products/:id", protectRoute, isOwnerOrAdmin, web.updateProduct);
router.delete("/products/:id", protectRoute, isOwnerOrAdmin, web.deleteProduct);

// Routes publiques - lecture des produits
router.get("/products/:id", web.getProduct);
router.get("/products", web.getAllProducts);

// ==================== ROUTES REFUGES ====================

// Routes admin only - gestion des refuges
router.post("/refuges", protectRoute, adminOnly, web.createRefuge);
router.put("/refuges/:id", protectRoute, adminOnly, web.updateRefuge);
router.delete("/refuges/:id", protectRoute, adminOnly, web.deleteRefuge);

// Routes publiques - lecture des refuges
router.get("/refuges/:id", web.getRefuge);
router.get("/refuges", web.getAllRefuges);

export default router