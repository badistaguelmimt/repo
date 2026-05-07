import { createAvisService, deleteAvisService, getAllAvisServices, getAvisServiceById, updateAvisService } from "../database/avis_service.db.js";
import { getReservationById } from "../database/reservation.db.js";
import { getTypeServiceById } from "../database/type_service.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createAvisServiceControlleur(req,res) {
    try {
        const { IdReservation,IdUtilisateur,Note,DateAvis,TypeAvis } = req.body;

        if (
            IdReservation == null ||
            IdUtilisateur == null ||
            Note == null ||
            DateAvis == null ||
            TypeAvis == null
        ) {
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createAvisService({
            IdReservation,
            IdUtilisateur,
            Note,
            DateAvis,
            TypeAvis 
        })

        res.status(201).json({ message: "AvisService crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'avis_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateAvisServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdReservation,IdUtilisateur,Note,DateAvis,TypeAvis } = req.body;
        const avis_service = await getAvisServiceById(id);
        if (!avis_service) {
            return res.status(404).json({ message: "AvisService non trouvé" });
        }
        await updateAvisService( id ,{
            IdReservation,
            IdUtilisateur,
            Note,
            DateAvis,
            TypeAvis
        })
        
        res.status(200).json({ message: "AvisService modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'avis_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAvisServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const avis_service = await getAvisServiceById(id);
        if (!avis_service) {
            return res.status(404).json({ message: "AvisService non trouvé" });
        }
        await deleteAvisService(id);
        res.status(200).json({ message: "AvisService supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAvisServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const avis_service = await getAvisServiceById(id);
        if(!avis_service){
            return res.status(404).json({message:"AvisService non trouvé"})
        }
        res.status(200).json(avis_service);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'avis_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAvisServicesControlleur(req,res) {
    try {
        const avis_services = await getAllAvisServices();
        res.status(200).json(avis_services);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des avis_services:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getReservationOfAvisServiceControlleur(req,res) {
    try {
        const { Reservation } = req.params;
        const reservation = await getReservationById(Reservation);
        if (!reservation) {
            return res.status(404).json({ message: "AvisService a un reservation inexistant !(non trouvé)" });
        }
        res.status(200).json(reservation);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurOfAvisServiceControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "AvisService a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getTypeAvisOfAvisServiceControlleur(req,res) {
    try {
        const { TypeService } = req.params;
        const type_avis = await getTypeServiceById(TypeService);
        if (!type_avis) {
            return res.status(404).json({ message: "AvisService a un type_avis inexistant !(non trouvé)" });
        }
        res.status(200).json(type_avis);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}