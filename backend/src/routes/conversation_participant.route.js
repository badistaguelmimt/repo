import { Router } from "express";
import * as conversation_participant from "../controlleurs/conversation_participant.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/conversation/participants/:conversationId", protectRoute, conversation_participant.getParticipantsOfConversationControlleur);
router.get("/conversation/:Conversation", protectRoute, conversation_participant.getConversationOfConversationParticipantControlleur);
router.get("/statut/:Statut", protectRoute, conversation_participant.getStatutOfConversationParticipantControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, conversation_participant.createConversationParticipantControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, conversation_participant.updateConversationParticipantControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, conversation_participant.deleteConversationParticipantControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, conversation_participant.getConversationParticipantControlleur);
router.get("/", protectRoute, conversation_participant.getAllConversationParticipantsControlleur);



export default router;