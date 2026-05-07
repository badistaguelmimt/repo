import { getMessageById } from "../database/message.db.js";
import { createMessageRead, deleteMessageRead, getAllMessageReads, getMessageReadById, getMessageReadsByMessageId, getMessagesByConversation, updateMessageRead } from "../database/message_read.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createMessageReadControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdMessage, IdUtilisateur } = req.body;

        if(!IdMessage || !IdUtilisateur ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createMessageRead({
            IdMessage, 
            IdUtilisateur
        })

        res.status(201).json({ message: "MessageRead crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'message_read:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateMessageReadControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdMessage, IdUtilisateur } = req.body;
        const message_read = await getMessageReadById(id);
        if (!message_read) {
            return res.status(404).json({ message: "MessageRead non trouvé" });
        }
        await updateMessageRead( id ,{
            IdMessage, 
            IdUtilisateur
        })
        
        res.status(200).json({ message: "MessageRead modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'message_read:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteMessageReadControlleur(req,res) {
    try {
        const { id } = req.params;
        const message_read = await getMessageReadById(id);
        if (!message_read) {
            return res.status(404).json({ message: "MessageRead non trouvé" });
        }
        await deleteMessageRead(id);
        res.status(200).json({ message: "MessageRead supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'message_read:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getMessageReadControlleur(req,res) {
    try {
        const { id } = req.params;
        const message_read = await getMessageReadById(id);
        if(!message_read){
            return res.status(404).json({message:"MessageRead non trouvé"})
        }
        res.status(200).json(message_read);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'message_read:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllMessageReadsControlleur(req,res) {
    try {
        const message_reads = await getAllMessageReads();
        res.status(200).json(message_reads);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des message_reads:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getMessageOfMessageReadControlleur(req,res) {
    try {
        const { Message } = req.params;
        const message = await getMessageReadsByMessageId(Message);
        if (!message) {
            return res.status(404).json({ message: "MessageRead a un message inexistant !(non trouvé)" });
        }
        res.status(200).json(message);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurOfMessageReadControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const senderId = await getUtilisateurById(Utilisateur);
        if (!senderId) {
            return res.status(404).json({ message: "MessageRead a un senderId inexistant !(non trouvé)" });
        }
        res.status(200).json(senderId);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getMessagesByConversationControlleur(req,res) {
    try {
        const { Conversation } = req.params;
        const message = await getMessagesByConversation(Conversation);
        if (!message) {
            return res.status(404).json({ message: "MessageRead a un conversation inexistant !(non trouvé)" });
        }
        res.status(200).json(message);
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}