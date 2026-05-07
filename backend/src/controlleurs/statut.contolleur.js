import { createStatut, deleteStatut, getAllStatuts, getStatutById, updateStatut } from "../database/statut.db.js";

export async function createStatutControlleur(req,res) {// pas utilisable je crois
    try {
        const { Statut } = req.body;

        if(!Statut ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createStatut({
            Statut
        })

        res.status(201).json({ message: "Statut crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la statut:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateStatutControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Statut } = req.body;
        const statut = await getStatutById(id);
        if (Statut == null || String(Statut).trim() === "") {
            return res.status(400).json({ message: "Le strict minimun en information est requis! " });
        }
        await updateStatut( id ,{
            Statut
        })
        
        res.status(200).json({ message: "Statut modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la statut:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteStatutControlleur(req,res) {
    try {
        const { id } = req.params;
        const statut = await getStatutById(id);
        if (!statut) {
            return res.status(404).json({ message: "Statut non trouvé" });
        }
        await deleteStatut(id);
        res.status(200).json({ message: "Statut supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la statut:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutControlleur(req,res) {
    try {
        const { id } = req.params;
        const statut = await getStatutById(id);
        if(!statut){
            return res.status(404).json({message:"Statut non trouvé"})
        }
        res.status(200).json(statut);
        
    } catch (error) {
        console.error("Erreur lors de la obtention de la statut:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllStatutsControlleur(req,res) {
    try {
        const statuts = await getAllStatuts();
        res.status(200).json(statuts);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des statuts:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
