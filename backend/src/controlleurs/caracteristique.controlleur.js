import { createCaracteristique, deleteCaracteristique, getAllCaracteristiques, getCaracteristiqueById, updateCaracteristique } from "../database/caracteristique.db.js";


export async function createCaracteristiqueControlleur(req,res) {
    try {
        const { IdAnimal, IdRace, Nom, Description } = req.body;
        const userId = req.user.Id;

        const hasAnimalTarget = IdAnimal != null;
        const hasRaceTarget = IdRace != null;

        if (hasAnimalTarget === hasRaceTarget || Nom == null) {
            return res.status(400).json({ message: "Informations requises manquantes!" })
        }

        // ✅ Vérifier que c'est le créateur de la conversation ou admin
        const conversation = await getConversationById(IdAnimal);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        // Seulement le créateur peut ajouter des participants
        if (conversation.CreatedBy !== userId) {
            return res.status(403).json({ message: "Seul le créateur peut ajouter des participants" });
        }

        const requete = await createCaracteristique({
            IdAnimal, 
            IdRace,
            Nom,
            Description
        })

        res.status(201).json({ message: "Participant ajouté avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de l'ajout du participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateCaracteristiqueControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Nom, Description } = req.body;
        const userId = req.user.Id;

        const participant = await getCaracteristiqueById(id);
        if (!participant) {
            return res.status(404).json({ message: "Participant non trouvé" });
        }

        // ✅ Seulement le créateur ou le participant lui-même
        if (conversation.CreatedBy !== userId && participant.IdRace !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez modifier que vos informations ou si vous êtes le créateur" });
        }

        if (Nom == null) {
            return res.status(400).json({ message: "Informations valides requises!" });
        }

        await updateCaracteristique(id, {
            IdAnimal: participant.IdAnimal,
            IdRace: participant.IdRace,
            Nom,
            Description
        })
        
        res.status(200).json({ message: "Participant modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteCaracteristiqueControlleur(req,res) {
    try {
        const { id } = req.params;
        const userId = req.user.Id;

        const participant = await getCaracteristiqueById(id);
        if (!participant) {
            return res.status(404).json({ message: "Participant non trouvé" });
        }

        const conversation = await getConversationById(participant.IdAnimal);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation non trouvée" });
        }

        // ✅ Seulement le créateur ou le participant lui-même
        if (conversation.CreatedBy !== userId && participant.IdRace !== userId) {
            return res.status(403).json({ message: "Vous ne pouvez supprimer que votre participation" });
        }

        await deleteCaracteristique(id);
        res.status(200).json({ message: "Participant retiré avec succès" });
        
    } catch (error) {
        console.error("Erreur lors du retrait du participant:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getCaracteristiqueControlleur(req,res) {
    try {
        const { id } = req.params;
        const caracteristique = await getCaracteristiqueById(id);
        if(!caracteristique){
            return res.status(404).json({message:"Caracteristique non trouvée"})
        }
        res.status(200).json(caracteristique);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la caracteristique:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllCaracteristiquesControlleur(req,res) {
    try {
        const caracteristiques = await getAllCaracteristiques();
        res.status(200).json(caracteristiques);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des caracteristiques:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 
