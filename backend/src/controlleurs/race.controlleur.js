import { getEspeceById } from "../database/espece.db.js";
import { createRace, deleteRace, getAllRaces, getRaceById, updateRace } from "../database/race.db.js";
import { getCaracteristiquesByRaceId } from "../database/caracteristique.db.js";

export async function createRaceControlleur(req,res) {// pas utilisable je crois
    try {
        const { Nom, Description, Origine, EsperanceVie, Maintenance, TailleMoyenne, PoidsMoyen, Couleurs, Classification, Pelage, TaillePelageMoyen, Habitat, Inteligence, Imunite, Alergies, Espece } = req.body;

        if(!Nom || !Description || !Espece ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createRace({
            Nom, 
            Description,
            Origine,
            EsperanceVie,
            Maintenance,
            TailleMoyenne,
            PoidsMoyen,
            Couleurs,
            Classification,
            Pelage,
            TaillePelageMoyen,
            Habitat,
            Inteligence,
            Imunite,
            Alergies,
            Espece
        })

        res.status(201).json({ message: "Race crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateRaceControlleur(req,res) {
    try {
        const { id } = req.params;
        const body = req.body;
        
        const race = await getRaceById(id);
        if (!race) {
            return res.status(404).json({ message: "Race non trouvé" });
        }
        
        await updateRace( id ,{
            Nom: body.Nom || body.nom || race.Nom, 
            Description: body.Description || body.description || race.Description,
            Origine: body.Origine || body.origine || race.Origine,
            EsperanceVie: body.EsperanceVie || body.esperanceVie || race.EsperanceVie,
            Maintenance: body.Maintenance || body.soins || race.Maintenance,
            TailleMoyenne: body.TailleMoyenne || body.tailleAdulte || race.TailleMoyenne,
            PoidsMoyen: body.PoidsMoyen || race.PoidsMoyen,
            Couleurs: body.Couleurs || race.Couleurs,
            Classification: body.Classification || race.Classification,
            Pelage: body.Pelage || race.Pelage,
            TaillePelageMoyen: body.TaillePelageMoyen || race.TaillePelageMoyen,
            Habitat: body.Habitat || race.Habitat,
            Inteligence: body.Inteligence || race.Inteligence,
            Imunite: body.Imunite || race.Imunite,
            Alergies: body.Alergies || race.Alergies,
            Espece: (typeof body.Espece === 'number') ? body.Espece : race.Espece
        })
        
        res.status(200).json({ message: "Race modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteRaceControlleur(req,res) {
    try {
        const { id } = req.params;
        const race = await getRaceById(id);
        if (!race) {
            return res.status(404).json({ message: "Race non trouvé" });
        }
        await deleteRace(id);
        res.status(200).json({ message: "Race supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRaceControlleur(req,res) {
    try {
        const { id } = req.params;
        const race = await getRaceById(id);
        if(!race){
            return res.status(404).json({message:"Race non trouvé"})
        }
        res.status(200).json(race);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de la race:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllRacesControlleur(req,res) {
    try {
        const races = await getAllRaces();
        res.status(200).json(races);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des races:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// requetes speciales 

export async function getEspeceOfRaceControlleur(req,res) {
    try {
        const { Espece } = req.params;
        const espece = await getEspeceById(Espece);
        if (!espece) {
            return res.status(404).json({ message: "Race a un espece inexistant !(non trouvé)" });
        }
        res.status(200).json(espece);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getCaracteristiquesOfRaceIdControlleur(req, res) {
    try {
        const { id } = req.params;
        const race = await getRaceById(id);
        if (!race) {
            return res.status(404).json({ message: "Race non trouvé" });
        }
        const caracteristiques = await getCaracteristiquesByRaceId(id);
        if (!caracteristiques || caracteristiques.length === 0) {
            return res.status(404).json({ message: "Aucune caractéristique trouvée pour cette race" });
        }
        res.status(200).json(caracteristiques);
    } catch (error) {
        console.error("Erreur lors de la récupération des caractéristiques:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
