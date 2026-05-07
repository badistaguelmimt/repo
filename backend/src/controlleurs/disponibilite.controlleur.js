import { createDisponibilite, deleteDisponibilite, getAllDisponibilites, getDisponibiliteById, updateDisponibilite } from "../database/disponibilite.db.js";
import { getProfilPrestataireById } from "../database/profil_prestataire.db.js";

export async function createDisponibiliteControlleur(req,res) {
    try {
        const { IdProfil,DateDebut,DateFin,Recurrence,Frequence,Disponibilite } = req.body;
        const toDbValue = (v) => v === undefined ? null : v;

        const isMissing = (v) => v === undefined || v === null || v === "";
        if (isMissing(IdProfil) || (isMissing(DateFin) && isMissing(Recurrence)) || isMissing(Disponibilite)) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        // Vérifier que le profil appartient à l'utilisateur
        const profil = await getProfilPrestataireById(IdProfil);
        if (!profil || profil.IdUtilisateur !== req.user.Id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à ajouter une disponibilité pour ce profil." });
        }

        const requete = await createDisponibilite({
            IdProfil: Number(IdProfil),
            DateDebut: toDbValue(DateDebut),
            DateFin: toDbValue(DateFin),
            Recurrence: toDbValue(Recurrence),
            Frequence: toDbValue(Frequence),
            Disponibilite: !!Disponibilite 
        })

        res.status(201).json({ message: "Disponibilite crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la disponibilite:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateDisponibiliteControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdProfil,DateDebut,DateFin,Recurrence,Frequence,Disponibilite } = req.body;
        const toDbValue = (v) => v === undefined ? null : v;

        const dispo = await getDisponibiliteById(id);
        if (!dispo) {
            return res.status(404).json({ message: "Disponibilite non trouvée" });
        }

        const profil = await getProfilPrestataireById(dispo.IdProfil);
        if (!profil || profil.IdUtilisateur !== req.user.Id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette disponibilité." });
        }
        
        const affectedRows = await updateDisponibilite(id, {
            IdProfil: Number(IdProfil || dispo.IdProfil),
            DateDebut: toDbValue(DateDebut),
            DateFin: toDbValue(DateFin),
            Recurrence: toDbValue(Recurrence),
            Frequence: toDbValue(Frequence),
            Disponibilite: Disponibilite !== undefined ? !!Disponibilite : dispo.Disponibilite
        });
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Disponibilite non trouvée" });
        }
        
        res.status(200).json({ message: "Disponibilite modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la disponibilite:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteDisponibiliteControlleur(req,res) {
    try {
        const { id } = req.params;
        const dispo = await getDisponibiliteById(id);
        if (!dispo) {
            return res.status(404).json({ message: "Disponibilite non trouvée" });
        }

        const profil = await getProfilPrestataireById(dispo.IdProfil);
        if (!profil || profil.IdUtilisateur !== req.user.Id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette disponibilité." });
        }

        const affectedRows = await deleteDisponibilite(id);
        res.status(200).json({ message: "Disponibilite supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la disponibilite:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getDisponibiliteControlleur(req,res) {
    try {
        const { id } = req.params;
        const disponibilite = await getDisponibiliteById(id);
        if(!disponibilite){
            return res.status(404).json({message:"Disponibilite non trouvée"})
        }
        res.status(200).json(disponibilite);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la disponibilite:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllDisponibilitesControlleur(req,res) {
    try {
        const disponibilites = await getAllDisponibilites();
        res.status(200).json(disponibilites);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des disponibilites:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getProfilOfDisponibiliteControlleur(req,res) {
    try {
        const { Profil } = req.params;
        const profil = await getProfilPrestataireById(Profil);
        if (!profil) {
            return res.status(404).json({ message: "Disponibilite a un profil inexistant !(non trouvé)" });
        }
        res.status(200).json(profil);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}