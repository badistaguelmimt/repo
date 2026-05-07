import { getAuth } from "@clerk/express";
import { ENV } from "../config/env.js";
import { getUtilisateurByClerkId, getUtilisateurRolesById } from "../database/utilisateur.db.js";
import { verifyToken } from "@clerk/backend";

// Vérifie que la requête contient un token Clerk valide et que l'utilisateur existe en base.
// Ce middleware est placé devant toutes les routes qui nécessitent une connexion.
export const protectRoute = [
    async (req, res, next) => {
        try {
            const auth = getAuth(req);
            const clerkId = auth?.userId;

            if (!clerkId && !req.auth?.userId) {
                return res.status(401).json({ message: "Non autorisé - token manquant ou invalide" });
            }

            const user = await getUtilisateurByClerkId(clerkId || req.auth?.userId);

            if (!user) {
                return res.status(401).json({ message: "Non autorisé - utilisateur introuvable" });
            }

            // Attache l'utilisateur à la requête pour les middlewares suivants
            req.user = user;
            req.auth = auth;
            next();
        } catch (error) {
            console.error("Erreur dans protectRoute :", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    },
];

// Fonction utilitaire pour vérifier si un utilisateur possède un rôle donné.
// Utilisée en interne par les middlewares de rôle ci-dessous.
export const hasRole = async (utilisateurId, roleName) => {
    try {
        const roles = await getUtilisateurRolesById(utilisateurId);
        return roles.some((role) => role.Nom.toLowerCase() === roleName.toLowerCase());
    } catch (error) {
        console.error("Erreur lors de la vérification du rôle :", error);
        return false;
    }
};

// Restreint l'accès aux utilisateurs ayant le rôle "Refuge"
export const refugeOnly = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Non autorisé" });

        const isRefuge = await hasRole(req.user.Id, "Refuge");
        if (!isRefuge) {
            return res.status(403).json({ message: "Accès réservé aux refuges" });
        }
        next();
    } catch (error) {
        console.error("Erreur dans refugeOnly :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Restreint l'accès aux utilisateurs ayant le rôle "Prestataire"
export const prestataireOnly = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Non autorisé" });

        const isPrestataire = await hasRole(req.user.Id, "Prestataire");
        if (!isPrestataire) {
            return res.status(403).json({ message: "Accès réservé aux prestataires" });
        }
        next();
    } catch (error) {
        console.error("Erreur dans prestataireOnly :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Restreint l'accès aux utilisateurs standard (rôle "Utilisateur")
export const utilisateurOnly = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Non autorisé" });

        const isUtilisateur = await hasRole(req.user.Id, "Utilisateur");
        if (!isUtilisateur) {
            return res.status(403).json({ message: "Accès réservé aux utilisateurs standard" });
        }
        next();
    } catch (error) {
        console.error("Erreur dans utilisateurOnly :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Restreint l'accès aux administrateurs.
// On vérifie d'abord par email (plus simple), puis par rôle en base de données.
export const adminOnly = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Non autorisé" });

        const adminEmailList = ENV.ADMIN_EMAIL
            ? ENV.ADMIN_EMAIL.split(",").map((e) => e.trim())
            : [];

        if (adminEmailList.includes(req.user.AdresseEmail)) {
            return next();
        }

        const isAdmin = await hasRole(req.user.Id, "Admin");
        if (!isAdmin) {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }

        next();
    } catch (error) {
        console.error("Erreur dans adminOnly :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Accepte plusieurs rôles possibles. Pratique pour les routes accessibles
// à la fois par un refuge et un admin, par exemple.
export const hasAnyRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) return res.status(401).json({ message: "Non autorisé" });

            const userRoles = await getUtilisateurRolesById(req.user.Id);
            const hasRequiredRole = userRoles.some((role) =>
                requiredRoles.some(
                    (required) => role.Nom.toLowerCase() === required.toLowerCase()
                )
            );

            if (!hasRequiredRole) {
                return res.status(403).json({
                    message: `Accès refusé. Rôles acceptés : ${requiredRoles.join(", ")}`,
                });
            }

            next();
        } catch (error) {
            console.error("Erreur dans hasAnyRole :", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    };
};

// Autorise l'accès uniquement au propriétaire de la ressource (via req.params.id) ou à un admin.
// Utile pour les routes de modification de profil, par exemple.
export const isOwnerOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.id;

    if (!req.user) return res.status(401).json({ message: "Non autorisé" });

    const isOwner = req.user.Id.toString() === resourceUserId;
    const isAdmin = ENV.ADMIN_EMAIL?.split(",")
        .map((e) => e.trim())
        .includes(req.user.AdresseEmail);

    if (isOwner || isAdmin) return next();

    return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres données" });
};

// Middleware d'authentification pour les connexions Socket.IO.
// Clerk ne peut pas être utilisé directement avec socket.io, donc on vérifie le token JWT manuellement.
export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) return next(new Error("Token manquant"));

        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!payload?.sub) return next(new Error("Token invalide"));

        const user = await getUtilisateurByClerkId(payload.sub);
        if (!user) return next(new Error("Utilisateur introuvable"));

        socket.user = user;
        next();
    } catch (err) {
        console.error("Erreur d'authentification socket :", err);
        next(new Error("Authentification échouée"));
    }
};