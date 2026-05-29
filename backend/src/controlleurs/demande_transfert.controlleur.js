import { getAnimalById } from "../database/animal.db.js";
import {
    createDemandeTransfert,
    deleteDemandeTransfert,
    getAllDemandeTransferts,
    getDemandeTransfertById,
    getDemandeTransfertByRefugeCibleId,
    getDemandeTransfertByRefugeDepartId,
    updateDemandeTransfert,
    updateDemandeTripleTStatut
} from "../database/demande_transfert.db.js";
import { getRefugeById } from "../database/refuge.db.js";
import { getStatutById } from "../database/statut.db.js";

// ── Créer une demande de transfert ─────────────────────────────────────────
export async function createDemandeTransfertControlleur(req, res) {
    try {
        const { IdRefugeDepart, IdAnimal, IdRefugeCible, CommentaireDepart, CommentaireRetour, DateDepart, Statut, DateRetours } = req.body;

        if (!IdRefugeDepart || !IdRefugeCible || !CommentaireDepart) {
            return res.status(400).json({ message: "Le strict minimum en information est requis !" });
        }

        const id = await createDemandeTransfert({
            IdRefugeDepart,
            IdAnimal,
            IdRefugeCible,
            CommentaireDepart,
            CommentaireRetour,
            DateDepart,
            Statut,
            DateRetours
        });

        res.status(201).json({ message: "Demande de transfert créée avec succès", id });

    } catch (error) {
        console.error("Erreur lors de la création de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── Mettre à jour une demande de transfert ────────────────────────────────
export async function updateDemandeTransfertControlleur(req, res) {
    try {
        const { id } = req.params;
        const { IdRefugeDepart, IdAnimal, IdRefugeCible, CommentaireDepart, CommentaireRetour, DateDepart, Statut, DateRetours } = req.body;

        const demande_transfert = await getDemandeTransfertById(id);
        if (!demande_transfert) {
            return res.status(404).json({ message: "Demande de transfert non trouvée" });
        }

        await updateDemandeTransfert(id, {
            IdRefugeDepart,
            IdAnimal,
            IdRefugeCible,
            CommentaireDepart,
            CommentaireRetour,
            DateDepart,
            Statut,
            DateRetours
        });

        res.status(200).json({ message: "Demande de transfert modifiée avec succès" });

    } catch (error) {
        console.error("Erreur lors de la modification de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── Supprimer une demande de transfert ───────────────────────────────────
export async function deleteDemandeTransfertControlleur(req, res) {
    try {
        const { id } = req.params;

        const demande_transfert = await getDemandeTransfertById(id);
        if (!demande_transfert) {
            return res.status(404).json({ message: "Demande de transfert non trouvée" });
        }

        await deleteDemandeTransfert(id);
        res.status(200).json({ message: "Demande de transfert supprimée avec succès" });

    } catch (error) {
        console.error("Erreur lors de la suppression de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── Obtenir une demande par ID ─────────────────────────────────────────────
export async function getDemandeTransfertControlleur(req, res) {
    try {
        const { id } = req.params;
        const demande_transfert = await getDemandeTransfertById(id);
        if (!demande_transfert) {
            return res.status(404).json({ message: "Demande de transfert non trouvée" });
        }
        res.status(200).json(demande_transfert);

    } catch (error) {
        console.error("Erreur lors de l'obtention de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── Obtenir toutes les demandes de transfert ──────────────────────────────
export async function getAllDemandeTransfertsControlleur(req, res) {
    try {
        const demande_transferts = await getAllDemandeTransferts();
        res.status(200).json(demande_transferts);

    } catch (error) {
        console.error("Erreur lors de l'obtention des demande_transferts:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── Requêtes spéciales de relation ───────────────────────────────────────

export async function getStatutOfDemandeTransfertControlleur(req, res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Statut de la demande de transfert introuvable" });
        }
        res.status(200).json(statut);

    } catch (error) {
        console.error("Erreur lors de l'obtention du statut de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRefugeOfDemandeTransfertControlleur(req, res) {
    try {
        const { Refuge } = req.params;
        const refuge = await getRefugeById(Refuge);
        if (!refuge) {
            return res.status(404).json({ message: "Refuge de la demande de transfert introuvable" });
        }
        res.status(200).json(refuge);

    } catch (error) {
        console.error("Erreur lors de l'obtention du refuge de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimalOfDemandeTransfertControlleur(req, res) {
    try {
        const { Animal } = req.params;
        const animal = await getAnimalById(Animal);
        if (!animal) {
            return res.status(404).json({ message: "Animal de la demande de transfert introuvable" });
        }
        res.status(200).json(animal);

    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de la demande_transfert:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getDemandeTransfertByRefugeCibleIdControlleur(req, res) {
    try {
        const { Refuge } = req.params;
        const refuges = await getDemandeTransfertByRefugeCibleId(Refuge);
        if (!refuges) {
            return res.status(404).json({ message: "Aucune demande de transfert pour ce refuge cible" });
        }
        res.status(200).json(refuges);

    } catch (error) {
        console.error("Erreur lors de l'obtention des demandes par refuge cible:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getDemandeTransfertByRefugeDepartIdControlleur(req, res) {
    try {
        const { Refuge } = req.params;
        const refuges = await getDemandeTransfertByRefugeDepartId(Refuge);
        if (!refuges) {
            return res.status(404).json({ message: "Aucune demande de transfert pour ce refuge de départ" });
        }
        res.status(200).json(refuges);

    } catch (error) {
        console.error("Erreur lors de l'obtention des demandes par refuge de départ:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// ── PATCH : mettre à jour uniquement le statut ────────────────────────────
export const updateDemandeTripleTStatutController = async (req, res) => {
    try {
        const { id } = req.params;
        const { Statut, CommentaireRetour } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: "ID de demande invalide" });
        }

        const statutsValides = [1, 2, 3, 4, 5, 6];
        if (!Statut || !statutsValides.includes(Statut)) {
            return res.status(400).json({ success: false, message: "Statut invalide. Utilisez 1, 2, 3, 4, 5 ou 6" });
        }

        const demandeMaj = await updateDemandeTripleTStatut(id, Statut, CommentaireRetour);

        res.status(200).json({
            success: true,
            message: `Statut de la demande de transfert ${id} mis à jour avec succès`,
            demande: demandeMaj,
            nouveauStatut: Statut
        });

    } catch (error) {
        console.error("Erreur dans updateDemandeTripleTStatutController:", error);

        if (error.message.includes('non trouvée')) {
            return res.status(404).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};
