import { createRole, deleteRole, getAllRoles, getRoleById, updateRole } from "../database/role.db.js";

export async function createRoleControlleur(req,res) {// pas utilisable je crois
    try {
        const { Nom, Description } = req.body;

        if(!Nom || !Description ){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await createRole({
            Nom, 
            Description
        })

        res.status(201).json({ message: "Role crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création du role:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateRoleControlleur(req,res) {// just la au cas ou 
    try {
        const { id } = req.params;
        const { Nom, Description } = req.body;
        const role = await getRoleById(id);
        if (!role) {
            return res.status(404).json({ message: "Role non trouvé" });
        }
        await updateRole( id ,{
            Nom, 
            Description
        })
        
        res.status(200).json({ message: "Role modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du role:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteRoleControlleur(req,res) {
    try {
        const { id } = req.params;
        const role = await getRoleById(id);
        if (!role) {
            return res.status(404).json({ message: "Role non trouvé" });
        }
        await deleteRole(id);
        res.status(200).json({ message: "Role supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression du role:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRoleControlleur(req,res) {
    try {
        const { id } = req.params;
        const role = await getRoleById(id);
        if(!role){
            return res.status(404).json({message:"Role non trouvé"})
        }
        res.status(200).json(role);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du role:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllRolesControlleur(req,res) {
    try {
        const roles = await getAllRoles();
        res.status(200).json(roles);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des roles:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
