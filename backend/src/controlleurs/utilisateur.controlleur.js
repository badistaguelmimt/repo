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

// Récupère un rôle par nom, le crée s'il n'existe pas encore.
// Gère le cas de création concurrente avec un double-check après insertion.
const ensureRoleByName = async (roleName) => {
    let role = await getRoleByName(roleName);
    if (role) return role;

    let insertedRoleId = null;
    try {
        insertedRoleId = await createRole({
            Nom: roleName,
            Description: ROLE_DESCRIPTIONS[roleName] || `Role ${roleName}`,
        });
    } catch {
        // Création concurrente possible — on relit simplement le rôle
    }

    role = await getRoleByName(roleName);
    if (!role && insertedRoleId) {
        return { Id: insertedRoleId, Nom: roleName, Description: ROLE_DESCRIPTIONS[roleName] || `Role ${roleName}` };
    }
    return role;
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
            Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse,
            Photo, ModifieePar, stripeAccountStatus, stripeAccountId,
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

// Point d'entrée principal du parcours d'inscription Clerk.
// Appelé après le sign-in/sign-up Clerk pour synchroniser l'utilisateur
// en base et créer son profil étendu (Prestataire ou Refuge) si nécessaire.
export async function bootstrapCurrentUtilisateurControlleur(req, res) {
    try {
        const authPayload = getAuth(req);
        const clerkId = authPayload?.userId;

        if (!clerkId) {
            return res.status(401).json({ message: "Pas autorisé - utilisateur Clerk introuvable" });
        }

        // Normalisation des données du formulaire
        const requestedRole = normalizeRequestedRole(req.body?.role);
        const providedNom = toSafeString(req.body?.nom);
        const providedPrenom = toSafeString(req.body?.prenom);
        const providedAdresse = toSafeString(req.body?.adresse);
        const providedWilaya = toSafeString(req.body?.wilaya || req.body?.telephone);
        const providedEmail = toSafeString(req.body?.email);
        const finalEmail = providedEmail || pickEmailFromClaims(authPayload);

        const extra = {
            nomRefuge: toSafeString(req.body?.nomRefuge),
            siret: toSafeString(req.body?.siret),
            capacite: toSafeString(req.body?.capacite),
            nomEntreprise: toSafeString(req.body?.nomEntreprise),
            service: toSafeString(req.body?.service),
            zone: toSafeString(req.body?.zone),
        };

        // Déterminer la liste des rôles à attribuer
        const roleNames = ["Utilisateur"];
        if (requestedRole !== "Utilisateur") roleNames.push(requestedRole);

        // Promotion Admin si l'email correspond à la liste ADMIN_EMAIL
        const adminEmails = String(ENV.ADMIN_EMAIL ?? "")
            .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
        if (finalEmail && adminEmails.includes(finalEmail.toLowerCase())) {
            roleNames.push("Admin");
        }

        // Création ou mise à jour de l'utilisateur en base
        let utilisateur = await getUtilisateurByClerkId(clerkId);
        if (!utilisateur) {
            const createdId = await createUtilisateur({
                clerkId,
                stripeCustomerId: null,
                stripeAccountId: null,
                Nom: providedNom || "Utilisateur",
                Prenom: providedPrenom || "",
                Addresse: providedAdresse,
                AddresseEmail: finalEmail,
                Wilaya: (providedWilaya || "").substring(0, 15),
                MotDePasse: null,
                Photo: null,
                CreePar: null,
                stripeAccountStatus: null,
            });
            utilisateur = await getUtilisateurById(createdId);
        } else {
            await updateUtilisateur(utilisateur.Id, {
                Nom: providedNom || utilisateur.Nom,
                Prenom: providedPrenom || utilisateur.Prenom,
                Addresse: providedAdresse || utilisateur.Addresse,
                AddresseEmail: finalEmail || utilisateur.AddresseEmail,
                MotDePasse: utilisateur.MotDePasse,
                Wilaya: (providedWilaya || utilisateur.Wilaya || "").substring(0, 15),
                Photo: utilisateur.Photo,
                ModifieePar: utilisateur.Id,
                stripeAccountStatus: utilisateur.stripeAccountStatus || null,
                stripeAccountId: utilisateur.stripeAccountId,
            });
            utilisateur = await getUtilisateurById(utilisateur.Id);
        }

        // Synchronisation des rôles (idempotent — IGNORE si déjà présent)
        for (const roleName of new Set(roleNames)) {
            const role = await ensureRoleByName(roleName);
            if (role?.Id) await ensureRoleToUtilisateurByIds(role.Id, utilisateur.Id);
        }

        // Création du profil étendu selon le rôle demandé
        if (requestedRole === "Prestataire") {
            try {
                const [exists] = await db.query(
                    "SELECT Id FROM profil_prestataire WHERE IdUtilisateur = ?",
                    [utilisateur.Id]
                );
                if (exists.length === 0) {
                    // Mapper le service choisi vers l'ID TypeService correct
                    const serviceLabel = (extra.service || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const typeServiceId =
                        serviceLabel.includes("pet") || serviceLabel.includes("sitting") || serviceLabel.includes("garde") ? 3
                        : serviceLabel.includes("promen") ? 4
                        : serviceLabel.includes("educ") || serviceLabel.includes("dressage") ? 2
                        : serviceLabel.includes("vet") ? 5
                        : 1; // Toilettage par défaut seulement si rien ne matche

                    await createProfilPrestataire({
                        IdUtilisateur: utilisateur.Id,
                        Experience: extra.nomEntreprise || "Nouveau prestataire",
                        TarifHoraire: 0,
                        ZoneIntervention: (extra.zone || "Non spécifiée").substring(0, 100),
                        TypeService: typeServiceId,
                        Statut: 1,
                        Bio: `Service: ${extra.service || "Non spécifié"}`,
                        NoteMoyenne: 0,
                    });
                }
            } catch (err) {
                console.error("Erreur création profil prestataire:", err.message);
            }
        } else if (requestedRole === "Refuge") {
            try {
                const refugeNom = (extra.nomRefuge || `Refuge de ${providedNom}`).substring(0, 50);
                const [existingRefuge] = await db.query("SELECT Id FROM refuge WHERE Nom = ?", [refugeNom]);

                let refugeId = null;
                if (existingRefuge.length === 0) {
                    refugeId = await CreateRefuge({
                        Nom: refugeNom,
                        Description: `Capacité: ${extra.capacite || "N/A"} - SIRET: ${extra.siret || "N/A"}`.substring(0, 1024),
                        Addresse: (providedAdresse || "").substring(0, 70),
                        AddresseGPS: null,
                        Telephone: (providedWilaya || "").substring(0, 20),
                        stripeAccountId: null,
                        stripeAccountStatus: null,
                    });
                } else {
                    refugeId = existingRefuge[0].Id;
                }

                if (refugeId) {
                    await db.query(
                        "INSERT IGNORE INTO refuge_utilisateur (IdRefuge, IdUtilisateur) VALUES (?, ?)",
                        [refugeId, utilisateur.Id]
                    );
                }
            } catch (err) {
                console.error("Erreur création profil refuge:", err.message);
            }
        }

        const roles = await getUtilisateurRolesById(utilisateur.Id);
        res.status(200).json({ utilisateur, roles, canAccessDashboard: true });

    } catch (error) {
        console.error("Erreur bootstrap utilisateur:", error);
        res.status(500).json({ message: error.message });
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
