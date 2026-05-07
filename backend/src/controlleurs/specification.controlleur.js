import { getEspeceById } from "../database/espece.db.js";
import { getProfilPrestataireById } from "../database/profil_prestataire.db.js";
import { createSpecification, deleteSpecification, getAllSpecifications, getSpecificationById, updateSpecification } from "../database/specification.db.js";

export async function createSpecificationControlleur(req,res) {// pas utilisable je crois
    try {
        const { IdProfil, IdEspece } = req.body;

        if(!IdProfil || !IdEspece ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createSpecification({
            IdProfil, 
            IdEspece
        })

        res.status(201).json({ message: "Specification crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'specification:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateSpecificationControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { IdProfil, IdEspece } = req.body;
        const specification = await getSpecificationById(id);
        if (!specification) {
            return res.status(404).json({ message: "Specification non trouvé" });
        }
        await updateSpecification( id ,{
            IdProfil, 
            IdEspece
        })
        
        res.status(200).json({ message: "Specification modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'specification:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteSpecificationControlleur(req,res) {
    try {
        const { id } = req.params;
        const specification = await getSpecificationById(id);
        if (!specification) {
            return res.status(404).json({ message: "Specification non trouvé" });
        }
        await deleteSpecification(id);
        res.status(200).json({ message: "Specification supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'specification:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getSpecificationControlleur(req,res) {
    try {
        const { id } = req.params;
        const specification = await getSpecificationById(id);
        if(!specification){
            return res.status(404).json({message:"Specification non trouvé"})
        }
        res.status(200).json(specification);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'specification:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllSpecificationsControlleur(req,res) {
    try {
        const specifications = await getAllSpecifications();
        res.status(200).json(specifications);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des specifications:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales

export async function getEspeceOfSpecificationControlleur(req,res) {
    try {
        const { Espece } = req.params;
        const espece = await getEspeceById(Espece);
        if (!espece) {
            return res.status(404).json({ message: "Specification a un espece inexistant !(non trouvé)" });
        }
        res.status(200).json(espece);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProfilPrestataireOfSpecificationControlleur(req,res) {
    try {
        const { ProfilPrestataire } = req.params;
        const profil_prestataire = await getProfilPrestataireById(ProfilPrestataire);
        if (!profil_prestataire) {
            return res.status(404).json({ message: "Specification a un profil_prestataire inexistant !(non trouvé)" });
        }
        res.status(200).json(profil_prestataire);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}