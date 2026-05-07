import { Router } from "express";
import {
  checkoutControlleur,
  getMesCommandesControlleur,
  getCommandeControlleur,
  getRefugeOrdersControlleur,
  updateSousCommandeStatusControlleur,
  getAllCommandesAdminControlleur,
} from "../controlleurs/checkout.controlleur.js";
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router();

// Créer une commande complète (panier → paiement simulé)
router.post("/", protectRoute, checkoutControlleur);

// Historique commandes du client
router.get("/mes-commandes", protectRoute, getMesCommandesControlleur);

// Commandes reçues pour le refuge du gestionnaire connecté
router.get("/refuge-orders", protectRoute, getRefugeOrdersControlleur);

// Admin — toutes les commandes
router.get("/all-orders", protectRoute, getAllCommandesAdminControlleur);

// Mise à jour statut d'une sous-commande (refuge)
router.put("/sous-commande/:sousCommandeId/status", protectRoute, updateSousCommandeStatusControlleur);

// Détail d'une commande
router.get("/:commandeId", protectRoute, getCommandeControlleur);

export default router;
