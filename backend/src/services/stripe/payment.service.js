import stripe from "../../config/stripe.js";
import { db } from "../../config/db.js";

// Taux de commission plateforme (configurable via variable d'environnement)
const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10;

const calculatePlatformFee = (amountInCents) =>
    Math.round(amountInCents * (PLATFORM_FEE_PERCENTAGE / 100));

// Crée ou récupère un PaymentIntent pour une commande produits.
// On vérifie d'abord si un PaymentIntent existe déjà pour éviter les doublons.
export const createProductPaymentIntent = async (commandeId, userId, totalAmount) => {
    const [users] = await db.query(
        "SELECT stripeCustomerId FROM utilisateur WHERE Id = ?",
        [userId]
    );
    if (!users[0]?.stripeCustomerId) {
        throw new Error("Utilisateur pas encore configuré pour Stripe");
    }

    const [existing] = await db.query(
        "SELECT stripe_payment_intent_id FROM paiement_commande WHERE IdCommande = ?",
        [commandeId]
    );
    if (existing[0]?.stripe_payment_intent_id) {
        return stripe.paymentIntents.retrieve(existing[0].stripe_payment_intent_id);
    }

    const amountInCents = Math.round(totalAmount * 100);
    const platformFee = calculatePlatformFee(amountInCents);
    const idempotencyKey = `product_order_${commandeId}_${userId}`;

    const paymentIntent = await stripe.paymentIntents.create(
        {
            amount: amountInCents,
            currency: "eur",
            customer: users[0].stripeCustomerId,
            payment_method_types: ["card"],
            application_fee_amount: platformFee,
            transfer_group: `order_${commandeId}_${Date.now()}`,
            metadata: { commandeId: commandeId.toString(), type: "product_order" },
        },
        { idempotencyKey }
    );

    await db.query(
        `INSERT INTO paiement_commande
         (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
         VALUES (?, ?, 1, ?, ?)`,
        [commandeId, totalAmount, paymentIntent.id, platformFee / 100]
    );

    return paymentIntent;
};

// Crée ou récupère un PaymentIntent pour une réservation de service prestataire.
// Le montant est transféré sur le compte Connect du prestataire (Stripe Connect).
// La commission plateforme est prélevée via application_fee_amount.
export const createServicePaymentIntent = async (reservationId, userId, amount) => {
    try {
        const [users] = await db.query(
            "SELECT stripeCustomerId FROM utilisateur WHERE Id = ?",
            [userId]
        );
        if (!users[0]?.stripeCustomerId) {
            throw new Error("Utilisateur pas encore configuré pour Stripe");
        }

        const [reservations] = await db.query(
            "SELECT IdProfil FROM reservation WHERE Id = ?",
            [reservationId]
        );
        if (!reservations[0]?.IdProfil) {
            throw new Error(`Réservation ${reservationId} introuvable ou profil manquant`);
        }

        const [profil] = await db.query(
            `SELECT u.stripeAccountId
             FROM profil_prestataire p
             JOIN utilisateur u ON p.IdUtilisateur = u.Id
             WHERE p.Id = ?`,
            [reservations[0].IdProfil]
        );
        if (!profil[0]?.stripeAccountId) {
            throw new Error("Prestataire pas encore configuré pour recevoir des paiements");
        }

        const [existing] = await db.query(
            "SELECT stripe_payment_intent_id FROM paiement_service WHERE IdReservation = ?",
            [reservationId]
        );
        if (existing[0]?.stripe_payment_intent_id) {
            return stripe.paymentIntents.retrieve(existing[0].stripe_payment_intent_id);
        }

        const amountInCents = Math.round(amount * 100);
        const platformFee = calculatePlatformFee(amountInCents);
        const idempotencyKey = `service_booking_${reservationId}_${userId}`;

        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount: amountInCents,
                currency: "eur",
                customer: users[0].stripeCustomerId,
                payment_method_types: ["card"],
                transfer_data: { destination: profil[0].stripeAccountId },
                application_fee_amount: platformFee,
                transfer_group: `booking_${reservationId}_${Date.now()}`,
                metadata: { reservationId: reservationId.toString(), type: "service_booking" },
            },
            { idempotencyKey }
        );

        await db.query(
            `INSERT INTO paiement_service
             (IdReservation, Montant, Statut, stripe_payment_intent_id, connectedAccountId, applicationFeeAmount)
             VALUES (?, ?, 1, ?, ?, ?)`,
            [reservationId, amount, paymentIntent.id, profil[0].stripeAccountId, platformFee / 100]
        );

        return paymentIntent;
    } catch (error) {
        console.error("Erreur paiement service:", error);
        throw error;
    }
};