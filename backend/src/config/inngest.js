import { Inngest } from "inngest";
import { connectDB, db } from "./db.js";
import { ENV } from "./env.js";
import * as utiliDB from "../database/utilisateur.db.js";
import { getRoleByName, createRole } from "../database/role.db.js";
import { createProfilPrestataire } from "../database/profil_prestataire.db.js";
import { CreateRefuge } from "../database/refuge.db.js";

// Crée le rôle s'il n'existe pas et le retourne
const ensureRoleByName = async (nom) => {
    let role = await getRoleByName(nom);
    if (!role) {
        const id = await createRole({ Nom: nom, Description: nom });
        role = { Id: id, Nom: nom };
    }
    return role;
};

export const ingest = new Inngest({
    id: "Adopty",
    isDev: process.env.NODE_ENV !== "production",
});

const syncUser = ingest.createFunction(
    { id: "sync-user", triggers: [{ event: "clerk/user.created" }] },
    async ({ event }) => {
        await connectDB();
        const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = event.data;

        const metadata = unsafe_metadata || {};
        const email = email_addresses?.[0]?.email_address || "";
        // Clerk met parfois le firstName même s'il vient de nous
        const prenom = first_name || metadata.prenom || "";
        const nom = last_name || metadata.nom || "";

        // 1. Création de l'utilisateur de base
        const createdId = await utiliDB.createUtilisateur({
            clerkId: id,
            stripeCustomerId: null,
            Nom: nom || "Utilisateur",
            Prenom: prenom,
            Addresse: metadata.adresse || null,
            AddresseEmail: email,
            Wilaya: (metadata.wilaya || "").substring(0, 15),
            MotDePasse: null,
            CreePar: null,
            ModifieePar: null,
            Photo: image_url || "",
        });

        const utilisateur = await utiliDB.getUtilisateurById(createdId);
        if (!utilisateur) return;

        // 2. Attribution des rôles
        const roleNames = ["Utilisateur"];
        const requestedRole = metadata.role === "prestataire" ? "Prestataire" : metadata.role === "refuge" ? "Refuge" : "Utilisateur";
        if (requestedRole !== "Utilisateur") roleNames.push(requestedRole);

        // Admin check
        const adminEmails = String(ENV.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
        if (email && adminEmails.includes(email.toLowerCase())) {
            roleNames.push("Admin");
        }

        for (const roleName of new Set(roleNames)) {
            const role = await ensureRoleByName(roleName);
            if (role?.Id) await utiliDB.ensureRoleToUtilisateurByIds(role.Id, utilisateur.Id);
        }

        // 3. Création des profils étendus
        if (requestedRole === "Prestataire") {
            const serviceLabel = (metadata.service || "").toLowerCase();
            const typeServiceId =
                serviceLabel.includes("pet") || serviceLabel.includes("sitting") || serviceLabel.includes("garde") ? 3
                : serviceLabel.includes("promen") ? 4
                : serviceLabel.includes("educ") || serviceLabel.includes("dressage") ? 2
                : serviceLabel.includes("vet") ? 5
                : 1;

            await createProfilPrestataire({
                IdUtilisateur: utilisateur.Id,
                Experience: metadata.experience || "0",
                TarifHoraire: 0,
                ZoneIntervention: (metadata.zone || "Non spécifiée").substring(0, 100),
                TypeService: typeServiceId,
                Statut: 1,
                Bio: "",
                NoteMoyenne: 0,
            });
        } else if (requestedRole === "Refuge") {
            const refugeNom = (metadata.nomRefuge || `Refuge de ${nom}`).substring(0, 50);
            const [existingRefuge] = await db.query("SELECT Id FROM refuge WHERE Nom = ?", [refugeNom]);

            let refugeId = null;
            if (existingRefuge.length === 0) {
                refugeId = await CreateRefuge({
                    Nom: refugeNom,
                    Description: `Capacité: ${metadata.capacite || "N/A"} - SIRET: ${metadata.siret || "N/A"}`.substring(0, 1024),
                    Addresse: (metadata.adresse || "").substring(0, 70),
                    AddresseGPS: null,
                    Telephone: (metadata.wilaya || "").substring(0, 20),
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
        }
    }
);

// Quand un compte Clerk est supprimé, on supprime également l'utilisateur
// de notre base de données pour ne pas garder de données orphelines.
const deleteUserFromDB = ingest.createFunction(
    { id: "delete-user-from-db", triggers: [{ event: "clerk/user.deleted" }] },
    async ({ event }) => {
        await connectDB();
        const { id } = event.data;
        const utilisateur = await utiliDB.getUtilisateurByClerkId(id);
        if (!utilisateur) return;
        await utiliDB.deleteUtilisateur(utilisateur.Id);
    }
);

export const functions = [syncUser, deleteUserFromDB];