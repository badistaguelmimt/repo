import { Router } from "express";
import * as demande_transfert from "../controlleurs/demande_transfert.controlleur.js";
import { protectRoute, isOwnerOrAdmin, refugeOnlyById } from "../midleware/auth.midleware.js";

const router = Router();

// ── PATCH : mettre à jour le statut d'une demande ─────────────────────────
// Le refuge identifié par :refugeId doit être celui de l'utilisateur connecté
router.patch(
    "/demandes/statut/:id/:refugeId",
    protectRoute,
    refugeOnlyById,
    demande_transfert.updateDemandeTripleTStatutController
);

// ── Requêtes spéciales de lecture (réservées aux gestionnaires du refuge) ──
router.get("/animal/:Animal/:refugeId",                     refugeOnlyById, demande_transfert.getAnimalOfDemandeTransfertControlleur);
router.get("/refuge/:Refuge/:refugeId",                     refugeOnlyById, demande_transfert.getRefugeOfDemandeTransfertControlleur);
router.get("/statut/:Statut/:refugeId",                     refugeOnlyById, demande_transfert.getStatutOfDemandeTransfertControlleur);
router.get("/demandes_refuge_depart/:Refuge/:refugeId",     protectRoute, refugeOnlyById, demande_transfert.getDemandeTransfertByRefugeDepartIdControlleur);
router.get("/demandes_refuge_cible/:Refuge/:refugeId",      protectRoute, refugeOnlyById, demande_transfert.getDemandeTransfertByRefugeCibleIdControlleur);

// ── Mutations (authentification requise) ──────────────────────────────────
router.post("/",                    protectRoute, demande_transfert.createDemandeTransfertControlleur);
router.put("/:id/:refugeId",        protectRoute, refugeOnlyById, demande_transfert.updateDemandeTransfertControlleur);
router.delete("/:id/:refugeId",     protectRoute, refugeOnlyById, demande_transfert.deleteDemandeTransfertControlleur);

// ── Lectures publiques ────────────────────────────────────────────────────
router.get("/:id", demande_transfert.getDemandeTransfertControlleur);
router.get("/",    demande_transfert.getAllDemandeTransfertsControlleur);

export default router;
