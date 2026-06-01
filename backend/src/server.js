import express from "express";
import path from "path";
import http from "http";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { serve } from "inngest/express";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { functions, ingest } from "./config/inngest.js";
import { initSocket } from "./midleware/socketInit.js";

// Routes — chaque fichier regroupe les endpoints d'une entité métier
import webRoutes from "./routes/web.route.js";
import animalRoutes from "./routes/animal.route.js";
import especeRoutes from "./routes/espece.route.js";
import raceRoutes from "./routes/race.route.js";
import refugeRoutes from "./routes/refuge.route.js";
import roleRoutes from "./routes/role.route.js";
import utilisateurRoutes from "./routes/utilisateur.route.js";
import vaccinRoutes from "./routes/vaccin.route.js";
import annonceRoutes from "./routes/annonce.route.js";
import avis_servicesRoutes from "./routes/avis_service.route.js";
import avisRoutes from "./routes/avis.route.js";
import commandeRoutes from "./routes/commande.route.js";
import disponibiliteRoutes from "./routes/disponibilite.route.js";
import ligne_commandeRoutes from "./routes/ligne_commande.route.js";
import ligne_panierRoutes from "./routes/ligne_panier.route.js";
import ligne_wishlistRoutes from "./routes/ligne_wishlist.route.js";
import livraisonRoutes from "./routes/livraison.route.js";
import paiement_commandeRoutes from "./routes/paiement_commande.route.js";
import paiement_serviceRoutes from "./routes/paiement_service.route.js";
import panierRoutes from "./routes/panier.route.js";
import profil_prestataireRoutes from "./routes/profil_prestataire.route.js";
import produitRoutes from "./routes/produit.route.js";
import reservationRoutes from "./routes/reservation.route.js";
import sous_commandeRoutes from "./routes/sous_commande.route.js";
import specificationRoutes from "./routes/specification.route.js";
import statutRoutes from "./routes/statut.route.js";
import type_serviceRoutes from "./routes/type_service.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import signalementRoutes from "./routes/signalement.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import conversation_participantRoutes from "./routes/conversation_participant.route.js";
import messageRoutes from "./routes/message.route.js";
import message_readRoutes from "./routes/message_read.route.js";
import materiauxRoutes from "./routes/materiaux.route.js";
import caracteristiqueRoutes from "./routes/caracteristique.route.js";
import demandeAdoptionRoutes from "./routes/demande_adoption.route.js";
import demandeTransfertRoutes from "./routes/demande_transfert.route.js";
import checkoutRoutes from "./routes/checkout.route.js";
import stripeRoutes from "./routes/stripe.route.js";

const app = express();
const __dirname = path.resolve();

// Construit la liste des origines autorisées pour le CORS.
// On accepte à la fois CLIENT_URL et FRONTEND_URL pour être flexible selon l'environnement.
const allowedOrigins = Array.from(
    new Set([ENV.CLIENT_URL, ENV.FRONTEND_URL, "http://localhost:5173"].filter(Boolean))
);
const corsOrigin = allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;

// La route webhook Stripe doit recevoir le corps brut (non parsé en JSON)
// pour que la vérification de signature cryptographique fonctionne.
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// Pour toutes les autres routes, on parse le corps en JSON normalement
app.use(express.json());

// CORS avant Clerk : indispensable pour que les requêtes OPTIONS (preflight) passent
app.use(cors({ origin: corsOrigin, credentials: true }));

// Clerk vérifie le token JWT sur chaque requête et peuple req.auth
app.use(
    clerkMiddleware({
        publishableKey: ENV.CLERK_PUBLISHABLE_KEY,
        secretKey: ENV.CLERK_SECRET_KEY,
    })
);

// Endpoint Inngest natif (utilisé par le serveur Inngest pour appeler nos fonctions)
app.use("/api/inngest", serve({ client: ingest, functions }));

// Endpoint pour recevoir les Webhooks de Clerk et les envoyer à Inngest
app.post("/api/webhooks/clerk", async (req, res) => {
    const evt = req.body;
    try {
        if (evt && evt.type === "user.created") {
            await ingest.send({ name: "clerk/user.created", data: evt.data });
        } else if (evt && evt.type === "user.deleted") {
            await ingest.send({ name: "clerk/user.deleted", data: evt.data });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("[Webhook Clerk] Erreur envoi Inngest:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Paiement Stripe (webhook + PaymentIntents + Stripe Connect)
app.use("/api/stripe", stripeRoutes);

// Données publiques et de référence
app.use("/api/web", webRoutes);
app.use("/api/animaux", animalRoutes);
app.use("/api/especes", especeRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/vaccins", vaccinRoutes);
app.use("/api/refuges", refugeRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/utilisateurs", utilisateurRoutes);

// Catalogue et commerce
app.use("/api/annonces", annonceRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/paniers", panierRoutes);
app.use("/api/ligne_paniers", ligne_panierRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/ligne_commandes", ligne_commandeRoutes);
app.use("/api/sous_commandes", sous_commandeRoutes);
app.use("/api/livraisons", livraisonRoutes);
app.use("/api/paiement_commandes", paiement_commandeRoutes);
app.use("/api/checkout", checkoutRoutes);

// Services et réservations
app.use("/api/profil_prestataires", profil_prestataireRoutes);
app.use("/api/disponibilites", disponibiliteRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/avis_services", avis_servicesRoutes);
app.use("/api/paiement_services", paiement_serviceRoutes);
app.use("/api/type_services", type_serviceRoutes);

// Adoption
app.use("/api/demandes-adoption", demandeAdoptionRoutes);
app.use("/api/demandes-transfert", demandeTransfertRoutes);

// Fonctionnalités sociales
app.use("/api/aviss", avisRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/ligne_wishlists", ligne_wishlistRoutes);
app.use("/api/signalements", signalementRoutes);

// Messagerie temps réel
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversation_participants", conversation_participantRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/message_reads", message_readRoutes);

// Métadonnées produits
app.use("/api/materiaux", materiauxRoutes);
app.use("/api/caracteristiques", caracteristiqueRoutes);
app.use("/api/specifications", specificationRoutes);
app.use("/api/statuts", statutRoutes);

// En production, le backend sert également le frontend compilé
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../web/dist")));
    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../web", "dist", "index.html"));
    });
}

const server = http.createServer(app);

// Socket.IO s'appuie sur le même serveur HTTP qu'Express
initSocket(server, { origin: corsOrigin });

server.listen(ENV.PORT, () => {
    console.log(`Serveur démarré en mode ${ENV.NODE_ENV} sur le port ${ENV.PORT}`);
    connectDB();
});
