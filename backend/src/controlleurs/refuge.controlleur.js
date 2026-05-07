import { addAnimalToRefugeByIds, CreateRefuge, deleteRefuge, getAllRefuges, getRefugeAnimalsById, getRefugeById, removeAnimalFromRefugeByIds, setAnimalToRefugeByIds, unsetAnimalToRefugeByIds, updateRefuge } from "../database/refuge.db.js";

export async function createRefugeControlleur(req,res) {
    try {
        const { Nom,Description,Addresse,AddresseGPS,Telephone,stripeAccountId,stripeAccountStatus } = req.body;

        if(!Nom || !Addresse && !AddresseGPS || !Telephone){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "})
        }

        const requete = await CreateRefuge({
            Nom,
            Description,
            Addresse,
            AddresseGPS,
            Telephone, 
            stripeAccountId,
            stripeAccountStatus
        })

        res.status(201).json({ message: "Refuge crée avec succès", id: requete });
        
    } catch (error) {
        console.error("Erreur lors de la création du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateRefugeControlleur(req,res) {
    try {
        const { id } = req.params;
        const { Nom,Description,Addresse,AddresseGPS,Telephone,stripeAccountId,stripeAccountStatus } = req.body;
        const refuge = await getRefugeById(id);
        if (!refuge) {
            return res.status(404).json({ message: "Refuge non trouvé" });
        }
        await updateRefuge( id ,{
            Nom,
            Description,
            Addresse,
            AddresseGPS,
            Telephone,
            stripeAccountId,
            stripeAccountStatus
        })
        
        res.status(200).json({ message: "Refuge modifié avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la modification du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteRefugeControlleur(req,res) {
    try {
        const { id } = req.params;
        const refuge = await getRefugeById(id);
        if (!refuge) {
            return res.status(404).json({ message: "Refuge non trouvé" });
        }
        await deleteRefuge(id);
        res.status(200).json({ message: "Refuge supprimé avec succès" });
        
    } catch (error) {
        console.error("Erreur lors de la suppression du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRefugeControlleur(req,res) {
    try {
        const { id } = req.params;
        const refuge = await getRefugeById(id);
        if(!refuge){
            return res.status(404).json({message:"Refuge non trouvé"})
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllRefugesControlleur(req,res) {
    try {
        const refuges = await getAllRefuges();
        res.status(200).json(refuges);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention des refuges:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// controlleurs speciales

export async function getRefugeAnimalsByIdControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await getRefugeAnimalsById(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addAnimalToRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await addAnimalToRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeAnimalFromRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await removeAnimalFromRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function setAnimalToRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await setAnimalToRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function unsetAnimalToRefugeByIdsControlleur(req,res) {
    try {
        const { id } = req.params;
        const animals = await unsetAnimalToRefugeByIds(id);
        if (!animals) {
            return res.status(404).json({ message: "Ce refuge n'a pas d'animaux !(non trouvé)" });
        }
        res.status(200).json(animals);
        
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal de l'annonce:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Validation admin d'un refuge
export async function verifyRefugeControlleur(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'
        const refuge = await getRefugeById(id);
        if (!refuge) return res.status(404).json({ message: "Refuge non trouvé" });

        await updateRefuge(id, { ...refuge, stripeAccountStatus: status });
        res.status(200).json({ message: `Refuge ${status} avec succès` });
    } catch (error) {
        console.error("Erreur lors de la validation du refuge:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}