import { createMateriaux, deleteMateriaux, getAllMateriauxs, getMateriauxById, updateMateriaux } from "../database/materiaux.db.js";

export async function createMateriauxControlleur(req,res) {// pas utilisable je crois
    try {
        const { Nom, Description } = req.body;

        if(!Nom || !Description ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createMateriaux({
            Nom, 
            Description
        })

        res.status(201).json({ message: "Materiaux crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de l'materiaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateMateriauxControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Nom, Description } = req.body;
        if(!Nom || !Description ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }
        const materiaux = await getMateriauxById(id);
        if (!materiaux) {
            return res.status(404).json({ message: "Materiaux non trouvé" });
        }
        await updateMateriaux( id ,{
            Nom, 
            Description
        })
        
        res.status(200).json({ message: "Materiaux modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'materiaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteMateriauxControlleur(req,res) {
    try {
        const { id } = req.params;
        const materiaux = await getMateriauxById(id);
        if (!materiaux) {
            return res.status(404).json({ message: "Materiaux non trouvé" });
        }
        await deleteMateriaux(id);
        res.status(200).json({ message: "Materiaux supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de l'materiaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getMateriauxControlleur(req,res) {
    try {
        const { id } = req.params;
        const materiaux = await getMateriauxById(id);
        if(!materiaux){
            return res.status(404).json({message:"Materiaux non trouvé"})
        }
        res.status(200).json(materiaux);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'materiaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllMateriauxsControlleur(req,res) {
    try {
        const materiauxs = await getAllMateriauxs();
        res.status(200).json(materiauxs);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des materiauxs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
