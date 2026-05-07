import stripe from '../../config/stripe.js';
import {db} from '../../config/db.js';

// Pour les refuges
export const createConnectAccountForRefuge = async (refugeId, email, name) => {
  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    business_type: 'non_profit',
    business_profile: {
      name: name,
      url: 'https://adopty.com',
    },
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    metadata: { refugeId: refugeId.toString() },
  });

  const [result] = await db.query(
    `UPDATE refuge SET stripeAccountId = ?, stripeAccountStatus = 'pending' WHERE Id = ?`,
    [account.id, refugeId]
  );

  if (!result?.affectedRows || result.affectedRows !== 1) {
    try {
      await stripe.accounts.del(account.id);
    } catch (cleanupError) {
      console.error('Erreur lors de la suppression du compte Stripe après échec DB:', cleanupError);
    }
    throw new Error(`Impossible de lier le compte Stripe au refuge ${refugeId}`);
  }

  return account;
};

// Pour les prestataires
export const createConnectAccountForPrestataire = async (userId, email, name) => {
  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    business_type: 'individual',
    business_profile: {
      name: name,
      url: 'https://adopty.com',
    },
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    metadata: { userId: userId.toString() },
  });

  const [result] = await db.query(
    `UPDATE utilisateur SET stripeAccountId = ?, stripeAccountStatus = 'pending' WHERE Id = ?`,
    [account.id, userId]
  );

  if (!result?.affectedRows || result.affectedRows !== 1) {
    try {
      await stripe.accounts.del(account.id);
    } catch (cleanupError) {
      console.error('Erreur lors de la suppression du compte Stripe après échec DB:', cleanupError);
    }
    throw new Error(`Impossible de lier le compte Stripe à l'utilisateur ${userId}`);
  }

  return account;
};

// Génère le lien d'onboarding Stripe vers lequel rediriger le vendeur
export const createAccountLink = async (accountId, returnPath) => {
  const { FRONTEND_URL } = process.env;
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${FRONTEND_URL}/onboarding/refresh`,
    return_url: `${FRONTEND_URL}/${returnPath}/onboarding/success`,
    type: 'account_onboarding',
  });

  return accountLink;
};

// Vérifier statut compte
export const getAccountStatus = async (accountId) => {
  const account = await stripe.accounts.retrieve(accountId);
  
  return {
    status: account.charges_enabled && account.payouts_enabled ? 'verified' : 'pending',
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
};