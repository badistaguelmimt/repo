import { createMessage, deleteMessage, getAllMessages, getMessageById, getMessagesByConversationId, updateMessage } from "../database/message.db.js";
import { getConversationById } from "../database/conversation.db.js";
import { isUserInConversation } from "../database/conversation_participant.db.js";

export async function createMessageControlleur(req,res) {
    try {
        const { IdConversation, Contenu } = req.body;
        const SenderId = req.user.Id; // Utiliser l'utilisateur connecté, pas du body!

        if (
            IdConversation == null ||
            typeof Contenu !== 'string' ||
            Contenu.trim().length === 0
        ) {
            return res.status(400).json({ message: "Conversation ID et contenu requis!" })
        }

        // Vérifier que l'utilisateur est membre de la conversation
        const isMember = await isUserInConversation(IdConversation, SenderId);
        if (!isMember) {
            return res.status(403).json({ message: "Vous n'êtes pas membre de cette conversation" });
        }

        // Vérifier que la conversation existe
        const conversation = await getConversationById(IdConversation);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        const requete = await createMessage({
            IdConversation, 
            SenderId,
            Contenu
        })

        res.status(201).json({ message: "Message créé avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création du message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateMessageControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Contenu } = req.body;
        const userId = req.user.Id; //  Middleware isOwnerOrAdmin garantit déjà la propriété

        if (
            typeof Contenu !== 'string' ||
            Contenu.trim().length === 0
        ) {
            return res.status(400).json({ message: "Contenu valide requis!" });
        }

        const message = await getMessageById(id);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé" });
        }

        // Vérifier que c'est l'auteur du message
        if (message.SenderId !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres messages" });
        }

        await updateMessage(id, {
            IdConversation: message.IdConversation,
            SenderId: message.SenderId,
            Contenu
        })
        
        res.status(200).json({ message: "Message modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteMessageControlleur(req,res) {
    try {
        const { id } = req.params;
        const userId = req.user.Id; // Middleware garantit propriété

        const message = await getMessageById(id);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé" });
        }

        // Vérifier propriété
        if (message.SenderId !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres messages" });
        }

        await deleteMessage(id);
        res.status(200).json({ message: "Message supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression du message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getMessageControlleur(req,res) {
    try {
        const { id } = req.params;
        const userId = req.user.Id;

        const message = await getMessageById(id);
        if(!message){
            return res.status(404).json({message:"Message non trouvé"})
        }

        // Vérifier que l'utilisateur est membre de la conversation
        const isMember = await isUserInConversation(message.IdConversation, userId);
        if (!isMember) {
            return res.status(403).json({ message: "Vous n'avez pas accès à ce message" });
        }

        res.status(200).json(message);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du message:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllMessagesControlleur(req,res) {
    try {
        const messages = await getAllMessages();
        res.status(200).json(messages);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des messages:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getConversationOfMessageControlleur(req,res) {
    try {
        const { Conversation } = req.params;
        const conversation = await getConversationById(Conversation);
        if (!conversation) {
            return res.status(404).json({ message: "Message a un conversation inexistant !(non trouvé)" });
        }
        res.status(200).json(conversation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export const getMessagesByConversationIdControlleur = async (req, res) => {
    try {
        const { ConversationId } = req.params;
        const messages = await getMessagesByConversationId(ConversationId);
        res.status(200).json(messages);
    } catch (error) {
        console.error("Erreur lors de l'obtention des messages de la conversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getSenderIdOfMessageControlleur(req,res) {
    try {
        const { SenderId } = req.params;
        const senderId = await getUtilisateurById(SenderId);
        if (!senderId) {
            return res.status(404).json({ message: "Message a un senderId inexistant !(non trouvé)" });
        }
        res.status(200).json(senderId);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}