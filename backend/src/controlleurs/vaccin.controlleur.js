import { createVaccin, deleteVaccin, getAllVaccins, getVaccinById, updateVaccin } from "../database/vaccin.db.js";

export async function createVaccinControlleur(req,res) {// pas utilisable je crois
    try {
        const { Nom, Description } = req.body;

        if(!Nom || !Description ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createVaccin({
            Nom, 
            Description
        })

        res.status(201).json({ message: "Vaccin crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création du vaccin:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateVaccinControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Nom, Description } = req.body;
        const vaccin = await getVaccinById(id);
        if (!vaccin) {
            return res.status(404).json({ message: "Vaccin non trouvé" });
        }
        await updateVaccin( id ,{
            Nom, 
            Description
        })
        
        res.status(200).json({ message: "Vaccin modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du vaccin:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteVaccinControlleur(req,res) {
    try {
        const { id } = req.params;
        const vaccin = await getVaccinById(id);
        if (!vaccin) {
            return res.status(404).json({ message: "Vaccin non trouvé" });
        }
        await deleteVaccin(id);
        res.status(200).json({ message: "Vaccin supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression du vaccin:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getVaccinControlleur(req,res) {
    try {
        const { id } = req.params;
        const vaccin = await getVaccinById(id);
        if(!vaccin){
            return res.status(404).json({message:"Vaccin non trouvé"})
        }
        res.status(200).json(vaccin);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du vaccin:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllVaccinsControlleur(req,res) {
    try {
        const vaccins = await getAllVaccins();
        res.status(200).json(vaccins);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des vaccins:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
