import { apiAuthRequest } from "../lib/http";

// Crée (ou retrouve) le client Stripe pour l'utilisateur courant.
// À appeler une fois lors de la première intention de paiement.
export const ensureStripeCustomer = async ({ userId, email, name }) => {
    return apiAuthRequest({
        url: "/api/stripe/customer",
        method: "post",
        data: { userId, email, name },
    });
};

// Crée un PaymentIntent pour une commande de produits.
// Le backend retourne un clientSecret à passer à Stripe.js pour finaliser le paiement.
export const createProductPaymentIntent = async ({ commandeId, userId, totalAmount }) => {
    return apiAuthRequest({
        url: "/api/stripe/payment/product",
        method: "post",
        data: { commandeId, userId, totalAmount },
    });
};

// Crée un PaymentIntent pour une réservation de service prestataire
export const createServicePaymentIntent = async ({ reservationId, userId, amount }) => {
    return apiAuthRequest({
        url: "/api/stripe/payment/service",
        method: "post",
        data: { reservationId, userId, amount },
    });
};

// Récupère le statut du compte Stripe Connect d'un refuge ou prestataire
export const getStripeAccountStatus = async (accountId) => {
    return apiAuthRequest({
        url: `/api/stripe/connect/status/${accountId}`,
        method: "get",
    });
};

// Lance l'onboarding Stripe Connect pour un refuge (création du compte marchand)
export const createRefugeStripeAccount = async ({ refugeId, email, name }) => {
    return apiAuthRequest({
        url: `/api/stripe/connect/refuge/${refugeId}`,
        method: "post",
        data: { email, name },
    });
};

// Lance l'onboarding Stripe Connect pour un prestataire
export const createPrestataireStripeAccount = async ({ userId, email, name }) => {
    return apiAuthRequest({
        url: `/api/stripe/connect/prestataire/${userId}`,
        method: "post",
        data: { email, name },
    });
};

// Paiement multi-vendeurs : répartit entre plusieurs comptes Connect
export const createMultiVendorPayment = async ({ commandeId, userId, subOrders }) => {
    return apiAuthRequest({
        url: "/api/stripe/payment/multi-vendor",
        method: "post",
        data: { commandeId, userId, subOrders },
    });
};

// Vérifie le statut d'un PaymentIntent après redirection de paiement
export const getPaymentStatus = async (paymentIntentId) => {
    return apiAuthRequest({
        url: `/api/stripe/payment/status/${paymentIntentId}`,
        method: "get",
    });
};

// Récupère les infos d'un compte Stripe Connect (vérification onboarding)
export const getConnectedAccount = async (accountId) => {
    return apiAuthRequest({
        url: `/api/stripe/connect/account/${accountId}`,
        method: "get",
    });
};

// Rafraîchit le lien d'onboarding Stripe Connect expiré
export const refreshOnboardingLink = async ({ accountId, type, refugeId }) => {
    return apiAuthRequest({
        url: `/api/stripe/connect/refresh/${accountId}/${type}`,
        method: "post",
        data: { refugeId },
    });
};
