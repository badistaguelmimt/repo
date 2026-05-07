import { Router } from "express";
import * as message from "../controlleurs/message.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture protégées
router.get("/conversation/:Conversation", protectRoute, message.getConversationOfMessageControlleur);
router.get("/conversation/messages/:ConversationId", protectRoute, message.getMessagesByConversationIdControlleur);
router.get("/sender_id/:SenderId", protectRoute, message.getSenderIdOfMessageControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, message.createMessageControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, message.updateMessageControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, message.deleteMessageControlleur);

// Routes de lecture protégées
router.get("/:id", protectRoute, message.getMessageControlleur);
router.get("/", protectRoute, message.getAllMessagesControlleur);



export default router;