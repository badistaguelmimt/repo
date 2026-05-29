import stripe from "../config/stripe.js";
import { db } from "../config/db.js";
import * as connectService from "../services/stripe/connect.service.js";
import * as paymentService from "../services/stripe/payment.service.js";
import { handleWebhook } from "../services/stripe/webhook.service.js";

// Reçoit les événements Stripe (paiement confirmé, remboursement, etc.)
// et délègue leur traitement au service webhook dédié.
// La vérification de signature garantit que l'événement vient bien de Stripe.
export const webhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        await handleWebhook(event);
        res.json({ received: true });
    } catch (err) {
        console.error("Erreur webhook Stripe :", err.message);
        res.status(400).send(err.message);
    }
};

// Crée un client Stripe lié à l'utilisateur et sauvegarde son stripeCustomerId en base.
// Cette étape est nécessaire avant de pouvoir créer un PaymentIntent.
export const createCustomer = async (req, res) => {
    try {
        const { userId, email, name } = req.body;

        const [rows] = await db.query("SELECT Id FROM utilisateur WHERE Id = ?", [userId]);
        if (!rows[0]) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const customer = await stripe.customers.create({
            email,
            name,
            metadata: { userId: userId.toString() },
        });

        const [result] = await db.query(
            "UPDATE utilisateur SET stripeCustomerId = ? WHERE Id = ?",
            [customer.id, userId]
        );

        if (result.affectedRows !== 1) {
            await stripe.customers.del(customer.id);
            return res.status(500).json({ error: "Impossible de lier le client Stripe" });
        }

        res.json({ success: true, customerId: customer.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crée un compte Stripe Connect de type "Express" pour un refuge.
// Renvoie une URL d'onboarding où le gestionnaire complète son profil marchand.
export const createRefugeAccount = async (req, res) => {
    try {
        const { refugeId } = req.params;
        const { email, name } = req.body;

        const account = await connectService.createConnectAccountForRefuge(refugeId, email, name);
        const link = await connectService.createAccountLink(account.id, `refuge/${refugeId}`);

        res.json({ success: true, accountId: account.id, onboardingUrl: link.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crée un compte Stripe Connect de type "Express" pour un prestataire.
export const createPrestataireAccount = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email, name } = req.body;

        const account = await connectService.createConnectAccountForPrestataire(userId, email, name);
        const link = await connectService.createAccountLink(account.id, "prestataire");

        res.json({ success: true, accountId: account.id, onboardingUrl: link.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retourne si le compte Stripe Connect est vérifié et peut recevoir des paiements
export const getAccountStatus = async (req, res) => {
    try {
        const status = await connectService.getAccountStatus(req.params.accountId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crée un PaymentIntent pour une commande de produits.
// Retourne le clientSecret utilisé par Stripe.js côté frontend pour finaliser le paiement.
export const payProduct = async (req, res) => {
    try {
        const { commandeId, userId, totalAmount } = req.body;
        const paymentIntent = await paymentService.createProductPaymentIntent(commandeId, userId, totalAmount);
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crée un PaymentIntent pour une réservation de service prestataire.
// Le paiement est redirigé vers le compte Connect du prestataire via transfer_data.
export const payService = async (req, res) => {
    try {
        const { reservationId, userId, amount } = req.body;

        // Récupérer les infos de l'utilisateur pour enrichir le PaymentIntent
        const [users] = await db.query(
            "SELECT AddresseEmail AS email, Nom AS nom FROM utilisateur WHERE Id = ?",
            [userId]
        );

        if (!users[0]) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const paymentIntent = await paymentService.createServicePaymentIntent(
            reservationId,
            userId,
            amount,
            users[0].email,
            users[0].nom
        );
        res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crée un PaymentIntent couvrant une commande avec plusieurs sous-commandes (multi-vendeurs).
// Chaque sous-commande est routée vers le compte Connect du refuge correspondant.
export const payMultiVendorOrder = async (req, res) => {
    try {
        const { commandeId, userId, subOrders } = req.body;
        // subOrders = [{ refugeId, Total_prix }, ...]

        const [users] = await db.query(
            "SELECT AddresseEmail AS email, Nom AS nom FROM utilisateur WHERE Id = ?",
            [userId]
        );

        if (!users[0]) return res.status(404).json({ error: "Utilisateur non trouvé" });

        const paymentIntent = await paymentService.createOrderWithSubOrders(
            commandeId,
            userId,
            subOrders,
            users[0].email,
            users[0].nom
        );

        res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } catch (error) {
        console.error("Erreur paiement multi-vendeurs :", error);
        res.status(500).json({ error: error.message });
    }
};

// Retourne le statut actuel d'un PaymentIntent Stripe.
// Utile pour le frontend afin de confirmer si le paiement a abouti.
export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            clientSecret: paymentIntent.client_secret,
            metadata: paymentIntent.metadata
        });
    } catch (error) {
        console.error("Erreur récupération statut paiement :", error);
        res.status(500).json({ error: error.message });
    }
};

// Retourne les informations détaillées d'un compte Stripe Connect.
// Indique si le compte peut recevoir des paiements (charges_enabled) et effectuer des virements.
export const getConnectedAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const account = await stripe.accounts.retrieve(accountId);

        res.json({
            id: account.id,
            email: account.email,
            business_type: account.business_type,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            status: account.charges_enabled && account.payouts_enabled ? "verified" : "pending"
        });
    } catch (error) {
        console.error("Erreur récupération compte Connect :", error);
        res.status(500).json({ error: error.message });
    }
};

// Génère un nouveau lien d'onboarding Stripe Connect pour un compte existant.
// Nécessaire quand le lien initial a expiré (durée de vie : ~5 minutes).
export const refreshOnboardingLink = async (req, res) => {
    try {
        const { accountId, type } = req.params; // type = 'refuge' ou 'prestataire'
        const { refugeId } = req.body;

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const returnPath = type === "refuge"
            ? `/refuge/${refugeId}/onboarding/success`
            : `/prestataire/onboarding/success`;

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${frontendUrl}/onboarding/refresh`,
            return_url: `${frontendUrl}${returnPath}`,
            type: "account_onboarding",
        });

        res.json({ success: true, onboardingUrl: accountLink.url });
    } catch (error) {
        console.error("Erreur rafraîchissement lien onboarding :", error);
        res.status(500).json({ error: error.message });
    }
};