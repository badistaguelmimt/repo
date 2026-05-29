// Utilitaire Stripe customer — crée ou récupère un customer existant
import stripe from '../config/stripe.js';
import { db } from '../config/db.js';

/**
 * Récupère le stripeCustomerId d'un utilisateur, ou en crée un nouveau
 * si l'utilisateur n'en possède pas encore.
 * @param {number} userId - ID en base de l'utilisateur
 * @param {string} [email] - Email (optionnel, récupéré en base si absent)
 * @param {string} [name] - Nom (optionnel, récupéré en base si absent)
 * @returns {string} stripeCustomerId
 */
export const getOrCreateStripeCustomer = async (userId, email, name) => {
    // 1. Vérifier si l'utilisateur a déjà un customerId
    const [users] = await db.query(
        'SELECT stripeCustomerId, AddresseEmail AS email, Nom FROM utilisateur WHERE Id = ?',
        [userId]
    );

    if (!users[0]) {
        throw new Error(`Utilisateur ${userId} introuvable`);
    }

    // 2. Si déjà existant, le retourner directement
    if (users[0].stripeCustomerId) {
        return users[0].stripeCustomerId;
    }

    // 3. Créer un nouveau customer Stripe
    const customer = await stripe.customers.create({
        email: email || users[0].email,
        name: name || users[0].Nom,
        metadata: {
            userId: userId.toString(),
        },
    });

    // 4. Persister l'ID en base
    await db.query(
        'UPDATE utilisateur SET stripeCustomerId = ? WHERE Id = ?',
        [customer.id, userId]
    );

    return customer.id;
};
