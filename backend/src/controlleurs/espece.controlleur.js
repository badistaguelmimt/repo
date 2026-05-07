import { createEspece, deleteEspece, getAllEspeces, getEspeceById, updateEspece } from "../database/espece.db.js";

export async function createEspeceControlleur(req,res) {// pas utilisable je crois
    try {
        const { Nom, Description } = req.body;

        if(!Nom || !Description ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createEspece({
            Nom, 
            Description
        })

        res.status(201).json({ message: "Espece crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'espece:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateEspeceControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Nom, Description } = req.body;
        const espece = await getEspeceById(id);
        if (!espece) {
            return res.status(404).json({ message: "Espece non trouvé" });
        }
        await updateEspece( id ,{
            Nom, 
            Description
        })
        
        res.status(200).json({ message: "Espece modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'espece:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteEspeceControlleur(req,res) {
    try {
        const { id } = req.params;
        const espece = await getEspeceById(id);
        if (!espece) {
            return res.status(404).json({ message: "Espece non trouvé" });
        }
        await deleteEspece(id);
        res.status(200).json({ message: "Espece supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'espece:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getEspeceControlleur(req,res) {
    try {
        const { id } = req.params;
        const espece = await getEspeceById(id);
        if(!espece){
            return res.status(404).json({message:"Espece non trouvé"})
        }
        res.status(200).json(espece);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'espece:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllEspecesControlleur(req,res) {
    try {
        const especes = await getAllEspeces();
        res.status(200).json(especes);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des especes:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
