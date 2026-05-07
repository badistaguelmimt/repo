import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Variable d'environnement manquante : STRIPE_SECRET_KEY");
}

// Initialise le client Stripe avec la clé secrète.
// Utilisé par les contrôleurs de paiement pour créer des PaymentIntents
// et gérer les comptes Stripe Connect (refuges, prestataires).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    appInfo: {
        name: "Adopty",
        version: "1.0.0",
    },
});

export default stripe;