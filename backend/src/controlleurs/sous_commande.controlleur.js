import { createSousCommande, deleteSousCommande, getAllSousCommandes, getSousCommandeById, updateSousCommande, getSousCommandesByRefugeId, getLigneCommandesBySousCommandeId } from '../database/sous_commande.db.js';
import { getCommandeById } from '../database/commande.db.js';
import { getRefugeById } from '../database/refuge.db.js';
import { getStatutById } from '../database/statut.db.js';
import { getUtilisateurRefugesById, getUtilisateurByClerkId } from '../database/utilisateur.db.js';

// Helper pour obtenir l'ID DB à partir du Clerk ID
async function getDbUserId(clerkId) {
    const user = await getUtilisateurByClerkId(clerkId);
    return user ? user.Id : null;
}

export async function createSousCommandeControlleur(req,res) {
    try {
        const { IdCommande,IdRefuge,Statut,Total_prix,stripe_transfer_id,platformFee } = req.body;

        if(!IdCommande || !Statut || !Total_prix || !stripe_transfer_id){
            return res.status(400).json({ message: 'Le strict minimun en information est requis! '})
        }

        const requete = await createSousCommande({
            IdCommande,
            IdRefuge,
            Statut,
            Total_prix,
            stripe_transfer_id,
            platformFee
        })

        res.status(201).json({ message: 'SousCommande crée avec succès', id: requete });
        
    } catch (error) {
        console.error('Erreur lors de la création de la sous_commande:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}
export async function updateSousCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const { IdCommande,IdRefuge,Statut,Total_prix,stripe_transfer_id,platformFee } = req.body;
        const sous_commande = await getSousCommandeById(id);
        if (!sous_commande) {
            return res.status(404).json({ message: 'SousCommande non trouvée' });
        }
        await updateSousCommande( id ,{
            IdCommande,
            IdRefuge,
            Statut,
            Total_prix,
            stripe_transfer_id,
            platformFee
        })
        
        res.status(200).json({ message: 'SousCommande modifiée avec succès' });
        
    } catch (error) {
        console.error('Erreur lors de la modification de la sous_commande:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function deleteSousCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const sous_commande = await getSousCommandeById(id);
        if (!sous_commande) {
            return res.status(404).json({ message: 'SousCommande non trouvée' });
        }
        await deleteSousCommande(id);
        res.status(200).json({ message: 'SousCommande supprimée avec succès' });
        
    } catch (error) {
        console.error('Erreur lors de la suppression de la sous_commande:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function getSousCommandeControlleur(req,res) {
    try {
        const { id } = req.params;
        const sous_commande = await getSousCommandeById(id);
        if(!sous_commande){
            return res.status(404).json({message:'SousCommande non trouvée'})
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error('Erreur lors de l\'obtention de la sous_commande:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function getAllSousCommandesControlleur(req,res) {
    try {
        const sous_commandes = await getAllSousCommandes();
        res.status(200).json(sous_commandes);
        
    } catch (error) {
        console.error('Erreur lors de l\'obtention des sous_commandes:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function getCommandeOfSousCommandeControlleur(req,res) {
    try {
        const { Commande } = req.params;
        const sous_commande = await getCommandeById(Commande);
        if (!sous_commande) {
            return res.status(404).json({ message: 'SousCommande a un sous_commande inexistant !(non trouvé)' });
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error('Erreur lors de l\'obtention de l\'animal de l\'annonce:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function getRefugeOfSousCommandeControlleur(req,res) {
    try {
        const { Refuge } = req.params;
        const refuge = await getRefugeById(Refuge);
        if (!refuge) {
            return res.status(404).json({ message: 'SousCommande a un refuge inexistant !(non trouvé)' });
        }
        res.status(200).json(refuge);
        
    } catch (error) {
        console.error('Erreur lors de l\'obtention de l\'animal de l\'annonce:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function getStatutOfSousCommandeControlleur(req,res) {
    try {
        const { Statut } = req.params;
        const sous_commande = await getStatutById(Statut);
        if (!sous_commande) {
            return res.status(404).json({ message: 'SousCommande a un sous_commande inexistant !(non trouvé)' });
        }
        res.status(200).json(sous_commande);
        
    } catch (error) {
        console.error('Erreur lors de l\'obtention de l\'animal de l\'annonce:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function getRefugeSousCommandesControlleur(req, res) {
    try {
        const dbId = req.user.Id;
        const refuges = await getUtilisateurRefugesById(dbId);
        if (!refuges || refuges.length === 0) {
            return res.status(200).json([]);
        }

        const refugeId = refuges[0].IdRefuge;
        const sousCommandes = await getSousCommandesByRefugeId(refugeId);
        
        const detailedSousCommandes = await Promise.all(sousCommandes.map(async (sc) => {
            const lines = await getLigneCommandesBySousCommandeId(sc.Id);
            return { ...sc, lines };
        }));

        res.status(200).json(detailedSousCommandes);
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes du refuge:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}

export async function updateSousCommandeStatusControlleur(req, res) {
    try {
        const { id } = req.params;
        const { Statut } = req.body;
        const dbId = req.user.Id;

        const sc = await getSousCommandeById(id);
        if (!sc) return res.status(404).json({ message: 'Commande non trouvée' });

        const refuges = await getUtilisateurRefugesById(dbId);
        if (!refuges.some(r => String(r.IdRefuge) === String(sc.IdRefuge))) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        await updateSousCommande(id, { ...sc, Statut });
        res.status(200).json({ message: 'Statut mis à jour' });
    } catch (error) {
        console.error('Erreur statut commande:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
