import {
    addAnimalToUtilisateurByIds, addRefugeToUtilisateurByIds, addRoleToUtilisateurByIds,
    createUtilisateur, deleteUtilisateur, ensureRoleToUtilisateurByIds, getAllUtilisateurs,
    getUtilisateurAnimalsById, getUtilisateurByClerkId, getUtilisateurById,
    getUtilisateurRefugesById, getUtilisateurRolesById, removeAnimalFromUtilisateurByIds,
    removeRefugeToUtilisateurByIds, removeRoleToUtilisateurByIds, setAnimalToUtilisateurByIds,
    unsetAnimalToUtilisateurByIds, updateUtilisateur,
} from "../database/utilisateur.db.js";
import { createRole, getRoleByName } from "../database/role.db.js";
import { CreateRefuge } from "../database/refuge.db.js";
import { createProfilPrestataire } from "../database/profil_prestataire.db.js";
import { ENV } from "../config/env.js";
import { db } from "../config/db.js";
import { getAuth } from "@clerk/express";

// Descriptions affichées dans la table 'role'
const ROLE_DESCRIPTIONS = {
    Utilisateur: "Compte utilisateur standard",
    Prestataire: "Prestataire proposant des services",
    Refuge: "Gestionnaire de refuge",
    Admin: "Administrateur plateforme",
};

// Normalise la valeur de rôle envoyée par le formulaire d'inscription
const normalizeRequestedRole = (roleValue) => {
    const normalized = String(roleValue ?? "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    if (normalized === "prestataire") return "Prestataire";
    if (normalized === "refuge") return "Refuge";
    return "Utilisateur";
};

const toSafeString = (value, fallback = null) => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed ? trimmed : fallback;
};

const pickEmailFromClaims = (authPayload) => toSafeString(
    authPayload?.sessionClaims?.email
    || authPayload?.sessionClaims?.email_address
    || authPayload?.sessionClaims?.primaryEmailAddress
);

// Récupère un rôle par nom dans la BDD. Si le rôle n'existe pas encore, le crée.
const ensureRoleByName = async (roleName) => {
    const existingRole = await getRoleByName(roleName);
    if (existingRole) return existingRole;

    const newRoleId = await createRole({
        Nom: roleName,
        Description: ROLE_DESCRIPTIONS[roleName] || `Role ${roleName}`,
    });

    return { Id: newRoleId, Nom: roleName };
};

export async function createAccountControlleur(req, res) {
    try {
        const {
            clerkId, stripeCustomerId, stripeAccountId, Nom, Prenom,
            Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, CreePar, stripeAccountStatus,
        } = req.body;

        if (!Nom || !Prenom || !Addresse) {
            return res.status(400).json({ message: "Le strict minimum en information est requis!" });
        }

        const newId = await createUtilisateur({
            clerkId, stripeCustomerId, stripeAccountId, Nom, Prenom,
            Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, CreePar, stripeAccountStatus,
        });

        res.status(201).json({ message: "Utilisateur créé avec succès", id: newId });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateAccountControlleur(req, res) {
    try {
        const { id } = req.params;
        const {
            Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse,
            Photo, ModifieePar, stripeAccountStatus, stripeAccountId,
        } = req.body;

        const utilisateur = await getUtilisateurById(id);
        if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

        await updateUtilisateur(id, {
            Nom:                Nom                ?? utilisateur.Nom,
            Prenom:             Prenom             ?? utilisateur.Prenom,
            Addresse:           Addresse           ?? utilisateur.Addresse,
            AddresseEmail:      AddresseEmail      ?? utilisateur.AddresseEmail,
            // Ne pas écraser le mot de passe si non fourni
            MotDePasse:         MotDePasse         || utilisateur.MotDePasse,
            Wilaya:             Wilaya             ?? utilisateur.Wilaya,
            Photo:              Photo              ?? utilisateur.Photo,
            ModifieePar:        ModifieePar        ?? utilisateur.Id,
            stripeAccountStatus: stripeAccountStatus ?? utilisateur.stripeAccountStatus,
            stripeAccountId:    stripeAccountId    ?? utilisateur.stripeAccountId,
        });

        res.status(200).json({ message: "Utilisateur modifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la modification de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAccountControlleur(req, res) {
    try {
        const { id } = req.params;
        const utilisateur = await getUtilisateurById(id);
        if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });
        await deleteUtilisateur(id);
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAccountControlleur(req, res) {
    try {
        const utilisateur = await getUtilisateurById(req.params.id);
        if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.status(200).json(utilisateur);
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAccountsControlleur(req, res) {
    try {
        const utilisateurs = await getAllUtilisateurs();
        res.status(200).json(utilisateurs);
    } catch (error) {
        console.error("Erreur lors de l'obtention des utilisateurs:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}


export async function getUtilisateurByClerkIdControlleur(req, res) {
    try {
        const utilisateur = await getUtilisateurByClerkId(req.params.id);
        if (!utilisateur) return res.status(404).json({ message: "Pas d'utilisateur avec ce clerkId!" });
        res.status(200).json(utilisateur);
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'utilisateur par clerkId:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

/**
 * GET /api/utilisateurs/me
 * Remplace l'ancien /bootstrap.
 * protectRoute a déjà vérifié le token et attaché req.user.
 * Retourne { utilisateur, roles }.
 */
export async function getMeControlleur(req, res) {
    try {
        // req.user est déjà résolu par protectRoute
        const utilisateur = req.user;
        if (!utilisateur) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        const roles = await getUtilisateurRolesById(utilisateur.Id);
        return res.status(200).json({ utilisateur, roles: roles ?? [] });
    } catch (error) {
        console.error("Erreur getMeControlleur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}


export async function getUtilisateurRolesByIdControlleur(req, res) {
    try {
        const roles = await getUtilisateurRolesById(req.params.id);
        if (!roles) return res.status(404).json({ message: "Pas de rôles pour cet utilisateur!" });
        res.status(200).json(roles);
    } catch (error) {
        console.error("Erreur lors de l'obtention des rôles:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addRoleToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, roleId } = req.params;
        const result = await addRoleToUtilisateurByIds(roleId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de l'ajout du rôle:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeRoleToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, roleId } = req.params;
        const result = await removeRoleToUtilisateurByIds(roleId, utilisateurId);
        if (!result) return res.status(404).json({ message: "Relation introuvable" });
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de la suppression du rôle:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurRefugesByIdControlleur(req, res) {
    try {
        const refuge = await getUtilisateurRefugesById(req.params.id);
        if (!refuge) return res.status(404).json({ message: "Pas de refuges pour cet utilisateur!" });
        res.status(200).json(refuge);
    } catch (error) {
        console.error("Erreur lors de l'obtention des refuges:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addRefugeToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, refugeId } = req.params;
        const result = await addRefugeToUtilisateurByIds(refugeId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de l'ajout du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeRefugeToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, refugeId } = req.params;
        const result = await removeRefugeToUtilisateurByIds(refugeId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de la suppression du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getUtilisateurAnimalsByIdControlleur(req, res) {
    try {
        const animaux = await getUtilisateurAnimalsById(req.params.id);
        if (!animaux) return res.status(404).json({ message: "Pas d'animaux pour cet utilisateur!" });
        res.status(200).json(animaux);
    } catch (error) {
        console.error("Erreur lors de l'obtention des animaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function addAnimalToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, animalId } = req.params;
        const result = await addAnimalToUtilisateurByIds(animalId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function removeAnimalFromUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, animalId } = req.params;
        const result = await removeAnimalFromUtilisateurByIds(animalId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de la suppression de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function setAnimalToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, animalId } = req.params;
        const result = await setAnimalToUtilisateurByIds(animalId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors du set animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function unsetAnimalToUtilisateurByIdsControlleur(req, res) {
    try {
        const { utilisateurId, animalId } = req.params;
        const result = await unsetAnimalToUtilisateurByIds(animalId, utilisateurId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors du unset animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Bannissement d'un utilisateur (admin uniquement).
// Le flag 'banned' est stocké dans stripeAccountStatus en attendant un champ dédié.
export async function banUtilisateurControlleur(req, res) {
    try {
        const { id } = req.params;
        const user = await getUtilisateurById(id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        await updateUtilisateur(id, { ...user, stripeAccountStatus: "banned" });
        res.status(200).json({ message: "Utilisateur banni avec succès" });
    } catch (error) {
        console.error("Erreur lors du bannissement:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// GET /api/utilisateurs/admin/stats — Statistiques réelles pour le dashboard admin
export async function getAdminStatsControlleur(req, res) {
    try {
        const queries = [
            db.query("SELECT COUNT(*) as count FROM utilisateur"),
            db.query("SELECT COUNT(*) as count FROM animal"),
            db.query("SELECT COUNT(*) as count FROM animal WHERE Statut = 'Urgent'"),
            db.query("SELECT COUNT(*) as count FROM refuge"),
            db.query("SELECT COUNT(*) as count FROM profil_prestataire"),
            db.query("SELECT COUNT(*) as count FROM signalement"),
            db.query("SELECT COUNT(*) as count FROM signalement s JOIN statut st ON s.Statut = st.Id WHERE LOWER(st.Statut) LIKE '%attente%'"),
            db.query("SELECT COUNT(*) as count FROM demande_adoption"),
            db.query(`
                SELECT COUNT(*) as count FROM demande_adoption da
                JOIN statut st ON da.Statut = st.Id
                WHERE MONTH(da.DateDemande) = MONTH(CURDATE()) AND YEAR(da.DateDemande) = YEAR(CURDATE())
            `),
            db.query("SELECT COALESCE(SUM(sc.Total_prix), 0) as total FROM sous_commande sc"),
            db.query(`
                SELECT COUNT(*) as count FROM commande c
                JOIN statut st ON c.Statut = st.Id
                WHERE LOWER(st.Statut) LIKE '%attente%'
            `),
        ];

        const results = await Promise.all(queries);

        const [
            [usersRows], [animauxRows], [urgentsRows],
            [refugesRows], [prestatairesRows],
            [signalementsRows], [signalementsAttenteRows],
            [adoptionsRows], [adoptionsMoisRows],
            [caRows], [commandesAttenteRows],
        ] = results;

        res.status(200).json({
            utilisateurs:         usersRows[0].count,
            animauxTotal:         animauxRows[0].count,
            animauxUrgent:        urgentsRows[0].count,
            refuges:              refugesRows[0].count,
            prestatairesActifs:   prestatairesRows[0].count,
            signalementsTotal:    signalementsRows[0].count,
            signalementsEnAttente: signalementsAttenteRows[0].count,
            adoptionsTotal:       adoptionsRows[0].count,
            adoptionsMois:        adoptionsMoisRows[0].count,
            caBoutique:           Number(caRows[0].total),
            commandesEnAttente:   commandesAttenteRows[0].count,
        });
    } catch (error) {
        console.error("Erreur getAdminStatsControlleur:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
