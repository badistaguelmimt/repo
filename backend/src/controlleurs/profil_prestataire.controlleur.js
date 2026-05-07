import { createProfilPrestataire, deleteProfilPrestataire, getAllProfilPrestataires, getProfilPrestataireById, updateProfilPrestataire, getProfilPrestataireByUtilisateurId } from "../database/profil_prestataire.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getTypeServiceById } from "../database/type_service.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";
import { getReservationsByProfilId } from "../database/reservation.db.js";

export async function createProfilPrestataireControlleur(req,res) {
    try {
        const { Experience,TarifHoraire,ZoneIntervention,TypeService,Statut,Bio,NoteMoyenne } = req.body;
        const IdUtilisateur = req.user.Id;

        if(!TarifHoraire && !ZoneIntervention || !TypeService){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        // Vérifier si le profil existe déjà
        const existing = await getProfilPrestataireByUtilisateurId(IdUtilisateur);
        if (existing) {
            return res.status(409).json({ message: "Un profil prestataire existe déjà pour cet utilisateur." });
        }

        const requete = await createProfilPrestataire({
            IdUtilisateur,
            Experience: Number(Experience || 0),
            TarifHoraire: Number(TarifHoraire),
            ZoneIntervention,
            TypeService: Number(TypeService), 
            Statut: Number(Statut || 1), 
            Bio, 
            NoteMoyenne: Number(NoteMoyenne || 0)
        })

        res.status(201).json({ message: "ProfilPrestataire crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateProfilPrestataireControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Experience,TarifHoraire,ZoneIntervention,TypeService, Statut, Bio, NoteMoyenne } = req.body;
        const profil_prestataire = await getProfilPrestataireById(id);
        if (!profil_prestataire) {
            return res.status(404).json({ message: "ProfilPrestataire non trouvée" });
        }

        // Vérifier l'appartenance
        if (profil_prestataire.IdUtilisateur !== req.user.Id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce profil." });
        }

        await updateProfilPrestataire( id ,{
            IdUtilisateur: req.user.Id,
            Experience: Number(Experience || 0),
            TarifHoraire: Number(TarifHoraire),
            ZoneIntervention,
            TypeService: Number(TypeService),
            Statut: Number(Statut || 1), 
            Bio, 
            NoteMoyenne: Number(NoteMoyenne || 0)
        })
        
        res.status(200).json({ message: "ProfilPrestataire modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteProfilPrestataireControlleur(req,res) {
    try {
        const { id } = req.params;
        const profil_prestataire = await getProfilPrestataireById(id);
        if (!profil_prestataire) {
            return res.status(404).json({ message: "ProfilPrestataire non trouvée" });
        }

        // Vérifier l'appartenance
        if (profil_prestataire.IdUtilisateur !== req.user.Id) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce profil." });
        }

        await deleteProfilPrestataire(id);
        res.status(200).json({ message: "ProfilPrestataire supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProfilPrestataireControlleur(req,res) {
    try {
        const { id } = req.params;
        const profil_prestataire = await getProfilPrestataireById(id);
        if(!profil_prestataire){
            return res.status(404).json({message:"ProfilPrestataire non trouvée"})
        }
        res.status(200).json(profil_prestataire);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la profil_prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllProfilPrestatairesControlleur(req,res) {
    try {
        const profil_prestataires = await getAllProfilPrestataires();
        res.status(200).json(profil_prestataires);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des profil_prestataires:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getUtilisateurOfProfilPrestataireControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "ProfilPrestataire a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getTypeServiceOfProfilPrestataireControlleur(req,res) {
    try {
        const { TypeService } = req.params;
        const type_service = await getTypeServiceById(TypeService);
        if (!type_service) {
            return res.status(404).json({ message: "ProfilPrestataire a un type_service inexistant !(non trouvé)" });
        }
        res.status(200).json(type_service);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfProfilPrestataireControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "ProfilPrestataire a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Récupérer le profil prestataire de l'utilisateur connecté
export async function getMyProfilPrestataireControlleur(req, res) {
    try {
        const userId = req.user.Id;
        const profil = await getProfilPrestataireByUtilisateurId(userId);
        if (!profil) {
            return res.status(404).json({ message: "Aucun profil prestataire trouvé pour cet utilisateur." });
        }
        res.status(200).json(profil);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Récupérer les réservations pour le prestataire connecté
export async function getMyReservationsAsPrestataire(req, res) {
    try {
        const userId = req.user.Id;
        const profil = await getProfilPrestataireByUtilisateurId(userId);
        if (!profil) {
            return res.status(404).json({ message: "Aucun profil prestataire trouvé." });
        }
        const reservations = await getReservationsByProfilId(profil.Id);
        res.status(200).json(reservations);
    } catch (error) {
        console.error("Erreur lors de la récupération des réservations prestataire:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}