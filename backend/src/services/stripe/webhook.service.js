import stripe from "../../config/stripe.js";
import { db } from "../../config/db.js";

// Dispatch les événements Stripe reçus en webhook vers le handler approprié
export const handleWebhook = async (event) => {
    switch (event.type) {
        case "payment_intent.succeeded":
            await handlePaymentSuccess(event.data.object);
            break;
        case "payment_intent.payment_failed":
            await handlePaymentFailed(event.data.object);
            break;
        case "account.updated":
            await handleAccountUpdated(event.data.object);
            break;
        case "transfer.created":
            await handleTransferCreated(event.data.object);
            break;
        case "transfer.failed":
            await handleTransferFailed(event.data.object);
            break;
        default:
            // Événements non gérés ignorés silencieusement
            break;
    }
};

// Met à jour le statut de la commande/réservation en base après paiement confirmé.
// Les deux types (product_order / service_booking) sont traités dans une transaction.
async function handlePaymentSuccess(paymentIntent) {
    const { metadata } = paymentIntent;

    if (metadata.type === "product_order") {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(
                'UPDATE commande SET Statut = (SELECT Id FROM statut WHERE Statut = "payé") WHERE Id = ?',
                [metadata.commandeId]
            );
            await connection.query(
                'UPDATE paiement_commande SET Statut = (SELECT Id FROM statut WHERE Statut = "payé") WHERE stripe_payment_intent_id = ?',
                [paymentIntent.id]
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error("Erreur webhook payment_intent.succeeded (product_order) :", error);
            throw error;
        } finally {
            connection.release();
        }
    } else if (metadata.type === "service_booking") {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.query(
                'UPDATE reservation SET Statut = (SELECT Id FROM statut WHERE Statut = "confirmé") WHERE Id = ?',
                [metadata.reservationId]
            );
            await connection.query(
                'UPDATE paiement_service SET Statut = (SELECT Id FROM statut WHERE Statut = "payé") WHERE stripe_payment_intent_id = ?',
                [paymentIntent.id]
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error("Erreur webhook payment_intent.succeeded (service_booking) :", error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

async function handlePaymentFailed(paymentIntent) {
    const { metadata } = paymentIntent;

    if (metadata.type === "product_order") {
        await db.query(
            'UPDATE commande SET Statut = (SELECT Id FROM statut WHERE Statut = "échec paiement") WHERE Id = ?',
            [metadata.commandeId]
        );
    } else if (metadata.type === "service_booking") {
        await db.query(
            'UPDATE reservation SET Statut = (SELECT Id FROM statut WHERE Statut = "échec paiement") WHERE Id = ?',
            [metadata.reservationId]
        );
    }
}

// Met à jour le statut du compte Connect (refuge ou prestataire) quand Stripe envoie account.updated.
// Cela permet de savoir si l'onboarding est terminé et le compte vérifié.
async function handleAccountUpdated(account) {
    const status = account.charges_enabled && account.payouts_enabled ? "verified" : "pending";

    const [refuge] = await db.query(
        "SELECT Id FROM refuge WHERE stripeAccountId = ?",
        [account.id]
    );

    if (refuge.length > 0) {
        await db.query(
            "UPDATE refuge SET stripeAccountStatus = ? WHERE stripeAccountId = ?",
            [status, account.id]
        );
    } else {
        await db.query(
            "UPDATE utilisateur SET stripeAccountStatus = ? WHERE stripeAccountId = ?",
            [status, account.id]
        );
    }
}

async function handleTransferCreated(transfer) {
    // Placeholder : à compléter si on doit tracer les virements dans la table sous_commande
}

async function handleTransferFailed(transfer) {
    console.error("Virement Stripe échoué :", transfer.id);
}