import { createTypeService, deleteTypeService, getAllTypeServices, getTypeServiceById, updateTypeService } from "../database/type_service.db.js";

export async function createTypeServiceControlleur(req,res) {// pas utilisable je crois
    try {
        const { Type } = req.body;

        if(!Type ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createTypeService({
            Type
        })

        res.status(201).json({ message: "TypeService crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création de la type_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateTypeServiceControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Type } = req.body;
        const type_service = await getTypeServiceById(id);
        
        if (!type_service) {
            return res.status(404).json({ message: "TypeService non trouvé" });
        }

        if (Type == null || String(Type).trim() === "") {
            return res.status(400).json({ message: "Le strict minimun en information est requis! " });
        }
        await updateTypeService( id ,{
            Type
        })
        
        res.status(200).json({ message: "TypeService modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification de la type_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteTypeServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const type_service = await getTypeServiceById(id);
        if (!type_service) {
            return res.status(404).json({ message: "TypeService non trouvé" });
        }
        await deleteTypeService(id);
        res.status(200).json({ message: "TypeService supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression de la type_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getTypeServiceControlleur(req,res) {
    try {
        const { id } = req.params;
        const type_service = await getTypeServiceById(id);
        if(!type_service){
            return res.status(404).json({message:"TypeService non trouvé"})
        }
        res.status(200).json(type_service);
        
    } catch (error) {
        console.error("Erreur lors de la obtention de la type_service:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllTypeServicesControlleur(req,res) {
    try {
        const type_services = await getAllTypeServices();
        res.status(200).json(type_services);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des type_services:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
