import { Router } from "express";
import {
  createSignalementControlleur,
  getAllSignalementsControlleur,
  getMesSignalementsControlleur,
  getSignalementControlleur,
  resolveSignalementControlleur,
  deleteSignalementControlleur,
} from "../controlleurs/signalement.controlleur.js";
import { protectRoute, adminOnly } from "../midleware/auth.midleware.js";

const router = Router();

// ── Routes publiques ──────────────────────────────────────────────────────────
// Aucune — les signalements ne sont pas publics

// ── Routes authentifiées ──────────────────────────────────────────────────────
// Créer un signalement (utilisateur connecté)
router.post("/", protectRoute, createSignalementControlleur);

// Mes signalements (utilisateur connecté)
router.get("/mes-signalements", protectRoute, getMesSignalementsControlleur);

// Un signalement par ID (utilisateur connecté, admin, ou propriétaire)
router.get("/:id", protectRoute, getSignalementControlleur);

// ── Routes Admin uniquement ───────────────────────────────────────────────────
router.get("/", protectRoute, adminOnly, getAllSignalementsControlleur);
router.put("/:id/resolve", protectRoute, adminOnly, resolveSignalementControlleur);
router.delete("/:id", protectRoute, adminOnly, deleteSignalementControlleur);

export default router;