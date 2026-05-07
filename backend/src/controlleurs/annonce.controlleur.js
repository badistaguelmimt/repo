import { getAnimalById } from "../database/animal.db.js";
import { createAnnonce, deleteAnnonce, getAllAnnonces, getAnnonceById, updateAnnonce } from "../database/annonce.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getTypeServiceById } from "../database/type_service.db.js";
import { getUtilisateurById } from "../database/utilisateur.db.js";

export async function createAnnonceControlleur(req,res) {
    try {
        const { IdUtilisateur,IdAnimal,TypeService,DateDebut,DateFin,PrixSouhaite,Statut,Notes } = req.body;

        if(!IdUtilisateur || !TypeService && !DateDebut || !DateFin){
            return res.status(400).json({ message: "Le strict minimum en information est requis! "})
        }

        const requete = await createAnnonce({
            IdUtilisateur,
            IdAnimal,
            TypeService,
            DateDebut,
            DateFin, 
            PrixSouhaite, 
            Statut, 
            Notes 
        })

        res.status(201).json({ message: "Annonce crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateAnnonceControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdUtilisateur,IdAnimal,TypeService,DateDebut,DateFin, PrixSouhaite, Statut, Notes } = req.body;
        const annonce = await getAnnonceById(id);
        if (!annonce) {
            return res.status(404).json({ message: "Annonce non trouvée" });
        }
        await updateAnnonce( id ,{
            IdUtilisateur,
            IdAnimal,
            TypeService,
            DateDebut,
            DateFin,
            PrixSouhaite, 
            Statut, 
            Notes 
        })
        
        res.status(200).json({ message: "Annonce modifiée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAnnonceControlleur(req,res) {
    try {
        const { id } = req.params;
        const annonce = await getAnnonceById(id);
        if (!annonce) {
            return res.status(404).json({ message: "Annonce non trouvée" });
        }
        await deleteAnnonce(id);
        res.status(200).json({ message: "Annonce supprimée avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnnonceControlleur(req,res) {
    try {
        const { id } = req.params;
        const annonce = await getAnnonceById(id);
        if(!annonce){
            return res.status(404).json({message:"Annonce non trouvée"})
        }
        res.status(200).json(annonce);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAnnoncesControlleur(req,res) {
    try {
        const annonces = await getAllAnnonces();
        res.status(200).json(annonces);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des annonces:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getStatutOfAnnonceControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const statut = await getStatutById(Statut);
        if (!statut) {
            return res.status(404).json({ message: "Annonce a un statut inexistant !(non trouvé)" });
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du statut de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurOfAnnonceControlleur(req,res) {
    try {
        const { Utilisateur } = req.params;
        const utilisateur = await getUtilisateurById(Utilisateur);
        if (!utilisateur) {
            return res.status(404).json({ message: "Annonce a un utilisateur inexistant !(non trouvé)" });
        }
        res.status(200).json(utilisateur);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'utilisateur de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimalOfAnnonceControlleur(req,res) {
    try {
        const { Animal } = req.params;
        const animal = await getAnimalById(Animal);
        if (!animal) {
            return res.status(404).json({ message: "Annonce a un animal inexistant !(non trouvé)" });
        }
        res.status(200).json(animal);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'aniaml de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getTypeServiceOfAnnonceControlleur(req,res) {
    try {
        const { TypeService } = req.params;
        const animal = await getTypeServiceById(TypeService);
        if (!animal) {
            return res.status(404).json({ message: "Annonce a un animal inexistant !(non trouvé)" });
        }
        res.status(200).json(animal);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'aniaml de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}