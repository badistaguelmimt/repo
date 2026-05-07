import { createConversationParticipant, deleteConversationParticipant, getAllConversationParticipants, getConversationParticipantById, getParticipantsByConversationId, updateConversationParticipant } from "../database/conversation_participant.db.js";
import { getConversationById } from "../database/conversation.db.js";
import { getStatutById } from "../database/statut.db.js";

export async function createConversationParticipantControlleur(req,res) {
    try {
        const { IdConversation, IdUtilisateur, Statut, Role } = req.body;
        const userId = req.user.Id;

        if (
            IdConversation == null ||
            IdUtilisateur == null ||
            Statut == null ||
            !Number.isInteger(Role) ||
            Role <= 0
        ) {
            return res.status(400).json({ message: "Informations requises manquantes!" })
        }

        // ✅ Vérifier que c'est le créateur de la conversation ou admin
        const conversation = await getConversationById(IdConversation);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        // Seulement le créateur peut ajouter des participants
        if (conversation.CreatedBy !== userId) {
            return res.status(403).json({ message: "Seul le créateur peut ajouter des participants" });
        }

        const requete = await createConversationParticipant({
            IdConversation, 
            IdUtilisateur,
            Statut,
            Role
        })

        res.status(201).json({ message: "Participant ajouté avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de l'ajout du participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateConversationParticipantControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Statut, Role } = req.body;
        const userId = req.user.Id;

        const participant = await getConversationParticipantById(id);
        if (!participant) {
            return res.status(404).json({ message: "Participant non trouvé" });
        }

        const conversation = await getConversationById(participant.IdConversation);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        // ✅ Seulement le créateur ou le participant lui-même
        if (conversation.CreatedBy !== userId && participant.IdUtilisateur !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez modifier que vos informations ou si vous êtes le créateur" });
        }

        if (Statut == null || !Number.isInteger(Role) || Role <= 0) {
            return res.status(400).json({ message: "Informations valides requises!" });
        }

        await updateConversationParticipant(id, {
            IdConversation: participant.IdConversation,
            IdUtilisateur: participant.IdUtilisateur,
            Statut,
            Role
        })
        
        res.status(200).json({ message: "Participant modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteConversationParticipantControlleur(req,res) {
    try {
        const { id } = req.params;
        const userId = req.user.Id;

        const participant = await getConversationParticipantById(id);
        if (!participant) {
            return res.status(404).json({ message: "Participant non trouvé" });
        }

        const conversation = await getConversationById(participant.IdConversation);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        // ✅ Seulement le créateur ou le participant lui-même
        if (conversation.CreatedBy !== userId && participant.IdUtilisateur !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez supprimer que votre participation" });
        }

        await deleteConversationParticipant(id);
        res.status(200).json({ message: "Participant retiré avec succès" });
        
    } catch (error) {
        console.error("Erreur lors du retrait du participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getConversationParticipantControlleur(req,res) {
    try {
        const { id } = req.params;
        const conversation_participant = await getConversationParticipantById(id);
        if(!conversation_participant){
            return res.status(404).json({message:"ConversationParticipant non trouvée"})
        }
        res.status(200).json(conversation_participant);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la conversation_participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllConversationParticipantsControlleur(req,res) {
    try {
        const conversation_participants = await getAllConversationParticipants();
        res.status(200).json(conversation_participants);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des conversation_participants:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getConversationOfConversationParticipantControlleur(req,res) {
    try {
        const { Conversation } = req.params;
        const conversation = await getConversationById(Conversation);
        if (!conversation) {
            return res.status(404).json({ message: "ConversationParticipant a un conversation inexistant !(non trouvé)" });
        }
        res.status(200).json(conversation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}



export async function getStatutOfConversationParticipantControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "ConversationParticipant a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getParticipantsOfConversationControlleur(req,res) {
    try {
        const { conversationId } = req.params;
        const participants = await getParticipantsByConversationId(conversationId);
        res.status(200).json(participants);
    } catch (error) {
        console.error("Erreur lors de l'obtention des participants de la conversation:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}