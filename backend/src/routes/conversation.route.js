import { Router } from "express";
import * as conversation from "../controlleurs/conversation.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Route spéciale : trouver ou créer une conversation directe
router.post("/direct", protectRoute, conversation.findOrCreateDirectConversationControlleur);

// Routes DM — accepter / refuser une demande
router.put("/:id/accept", protectRoute, conversation.acceptConversationControlleur);
router.delete("/:id/decline", protectRoute, conversation.declineConversationControlleur);

// Routes spéciales de lecture protégées
router.get("/utilisateur/:Utilisateur", protectRoute, conversation.getUtilisateurOfConversationControlleur);
router.get("/by_utilisateur/:utilisateurId", protectRoute, conversation.getConversationsByUtilisateurIdControlleur);


// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, conversation.createConversationControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, conversation.updateConversationControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, conversation.deleteConversationControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, isOwnerOrAdmin, conversation.getConversationControlleur);
router.get("/", protectRoute, conversation.getAllConversationsControlleur);

export default router;