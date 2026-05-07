import { Router } from "express";
import * as commande from "../controlleurs/commande.controlleur.js"
import { protectRoute } from "../midleware/auth.midleware.js";

const router = Router()

// Routes protégées - recherche par statut et utilisateur
router.get("/statut/:Statut", protectRoute, commande.getStatutOfCommandeControlleur);
router.get("/utilisateur/:Utilisateur", protectRoute, commande.getUtilisateurOfCommandeControlleur);

// Routes protégées - création, modification, suppression de commandes (utilisateurs authentifiés)
router.post("/", protectRoute, commande.createCommandeControlleur);
router.put("/:id", protectRoute, commande.updateCommandeControlleur);
router.delete("/:id", protectRoute, commande.deleteCommandeControlleur);

// Routes protégées - lecture des commandes
router.get("/:id", protectRoute, commande.getCommandeControlleur);

// Route admin only - liste tous les commandes (insérer aussi si needed)
router.get("/", protectRoute, commande.getAllCommandesControlleur);

export default router;