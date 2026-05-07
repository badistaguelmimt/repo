import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import * as utiliDB from "../database/utilisateur.db.js";

// Crée le client Inngest. Inngest est utilisé pour exécuter des fonctions
// en arrière-plan déclenchées par des événements Clerk (création/suppression d'utilisateur).
export const ingest = new Inngest({ id: "Adopty" });

// Quand Clerk crée un compte, on synchronise automatiquement l'utilisateur
// dans notre propre base de données pour pouvoir lui associer des rôles et des données.
const syncUser = ingest.createFunction(
    { id: "sync-user" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        await connectDB();
        const { id, email_addresses, first_name, last_name, image_url } = event.data;

        const newUser = {
            clerkId: id,
            stripeCustomerId: null,
            Nom: first_name || "",
            Prenom: last_name || "",
            Addresse: null,
            AddresseEmail: email_addresses?.[0]?.email_address,
            Wilaya: null,
            MotDePasse: null,
            CreePar: null,
            ModifieePar: null,
            Photo: image_url || "",
        };

        await utiliDB.createUtilisateur(newUser);
    }
);

// Quand un compte Clerk est supprimé, on supprime également l'utilisateur
// de notre base de données pour ne pas garder de données orphelines.
const deleteUserFromDB = ingest.createFunction(
    { id: "delete-user-from-db" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        await connectDB();
        const { id } = event.data;
        const utilisateur = await utiliDB.getUtilisateurByClerkId(id);
        if (!utilisateur) return;
        await utiliDB.deleteUtilisateur(utilisateur.Id);
    }
);

export const functions = [syncUser, deleteUserFromDB];