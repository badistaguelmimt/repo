// backend/dto/conversation.dto.js
import { toMessageDTO } from "./message.dto.js";

/**
 * Transforme une Conversation en ConversationDTO
 * @param {Object} conversation - Instance de Conversation
 * @param {Object} options
 * @param {Array} options.participants - Liste des participants (optionnel)
 * @param {Object} options.lastMessage - Dernier message (optionnel)
 * @param {number} options.unreadCount - Messages non lus pour l'utilisateur courant
 */
export const toConversationDTO = (conversation, options = {}) => {
  return {
    id: conversation.Id,
    type: conversation.Type,
    createdAt: conversation.CreatedAt,
    createdBy: conversation.CreatedBy,
    
    // Champs enrichis
    participants: options.participants || [],
    lastMessage: options.lastMessage ? toMessageDTO(options.lastMessage) : null,
    unreadCount: options.unreadCount || 0,
    
    // Pour affichage UI
    name: options.customName || null,           // Nom personnalisé (ex: "Groupe Famille")
    isGroup: (options.participants?.length || 0) > 2
  };
};

/**
 * Transforme un participant (Utilisateur) en ParticipantDTO
 */
export const toParticipantDTO = (user, options = {}) => {
  return {
    id: user.Id,
    clerkId: user.clerkId,
    name: `${user.Prenom || ''} ${user.Nom || ''}`.trim(),
    email: user.AddresseEmail,
    avatar: user.Photo,
    isOnline: options.isOnline || false,
    lastReadAt: options.lastReadAt || null
  };
};