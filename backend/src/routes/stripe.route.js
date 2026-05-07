import { Router } from "express";
import * as stripeController from "../controlleurs/stripe.controlleur.js";

const router = Router();

// Le webhook doit être déclaré en premier car le body brut (raw) est appliqué
// au niveau du serveur uniquement pour cette route (voir server.js)
router.post("/webhook", stripeController.webhook);

// Crée un compte client Stripe pour un utilisateur
router.post("/customer", stripeController.createCustomer);

// Onboarding Stripe Connect pour les vendeurs (refuges et prestataires)
router.post("/connect/refuge/:refugeId", stripeController.createRefugeAccount);
router.post("/connect/prestataire/:userId", stripeController.createPrestataireAccount);
router.get("/connect/status/:accountId", stripeController.getAccountStatus);

// PaymentIntents : paiement d'une commande produit ou d'une réservation service
router.post("/payment/product", stripeController.payProduct);
router.post("/payment/service", stripeController.payService);

export default router;