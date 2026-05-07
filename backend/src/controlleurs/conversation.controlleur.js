import { createConversation, deleteConversation, getAllConversations, getConversationById, getConversationsByUtilisateurId, updateConversation, findOrCreateDirectConversation } from "../database/conversation.db.js";

import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createConversationControlleur(req,res) {
    try {
        const { Type } = req.body;
        const CreatedBy = req.user.Id; // Utiliser l'utilisateur connecté

        if (
            Type == null ||
            Type.trim().length === 0
        ) {
            return res.status(400).json({ message: "Type de conversation requis!" })
        }

        const requete = await createConversation({
            Type, 
            CreatedBy
        })

        res.status(201).json({ message: "Conversation créée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la conversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateConversationControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Type } = req.body;
        const userId = req.user.Id;

        const conversation = await getConversationById(id);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        // Vérifier que c'est le créateur
        if (conversation.CreatedBy !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez modifier que vos conversations" });
        }

        if (
            Type == null ||
            Type.trim().length === 0
        ) {
            return res.status(400).json({ message: "Type valide requis!" });
        }

        await updateConversation(id, {
            Type, 
            CreatedBy: conversation.CreatedBy
        })
        
        res.status(200).json({ message: "Conversation modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la conversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteConversationControlleur(req,res) {
    try {
        const { id } = req.params;
        const userId = req.user.Id;

        const conversation = await getConversationById(id);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        //  Vérifier que c'est le créateur
        if (conversation.CreatedBy !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez supprimer que vos conversations" });
        }

        await deleteConversation(id);
        res.status(200).json({ message: "Conversation supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la conversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getConversationControlleur(req,res) {
    try {
        const { id } = req.params;
        const conversation = await getConversationById(id);
        if(!conversation){
            return res.status(404).json({message:"Conversation non trouvée"})
        }
        res.status(200).json(conversation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la conversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllConversationsControlleur(req,res) {
    try {
        const conversations = await getAllConversations();
        res.status(200).json(conversations);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des conversations:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getUtilisateurOfConversationControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Conversation a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getConversationsByUtilisateurIdControlleur(req,res) {
    try {
        const { utilisateurId } = req.params;
        const conversations = await getConversationsByUtilisateurId(utilisateurId);
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Erreur lors de l'obtention des conversations de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

/** POST /api/conversations/direct — Trouve ou crée une conversation directe entre l'utilisateur connecté et une cible */
export async function findOrCreateDirectConversationControlleur(req, res) {
    try {
        const userIdA = req.user.Id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ message: "targetUserId requis" });
        }
        if (String(userIdA) === String(targetUserId)) {
            return res.status(400).json({ message: "Impossible de créer une conversation avec soi-même" });
        }

        const result = await findOrCreateDirectConversation(userIdA, targetUserId);
        res.status(result.created ? 201 : 200).json(result);
    } catch (error) {
        console.error("Erreur findOrCreateDirectConversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}