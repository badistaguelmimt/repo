import {
  createCheckout,
  getCommandesByUtilisateur,
  getCommandeEnrichie,
  getRefugeOrdersForUser,
  updateSousCommandeStatut,
  getAllCommandesAdmin,
} from "../database/checkout.db.js";

// ── POST /api/checkout ────────────────────────────────────────────────────────
// Crée une commande complète depuis le panier (produits + livraison + paiement simulé)
export async function checkoutControlleur(req, res) {
  try {
    const { adresseLivraison, items } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Le panier est vide." });
    }
    if (!adresseLivraison?.adresse || !adresseLivraison?.ville) {
      return res.status(400).json({ message: "L'adresse de livraison est requise." });
    }

    // Vérifier que chaque item a un IdProduit, Quantite, Prix et IdRefuge
    for (const item of items) {
      if (!item.IdProduit || !item.Quantite || !item.Prix || !item.IdRefuge) {
        return res.status(400).json({
          message: `Article invalide : ${JSON.stringify(item)}. IdProduit, Quantite, Prix et IdRefuge requis.`,
        });
      }
    }

    const result = await createCheckout({
      IdUtilisateur: req.user.Id,
      adresseLivraison,
      items,
    });

    return res.status(201).json({
      message: "Commande créée avec succès.",
      commandeId: result.idCommande,
      total: result.total,
      nbSousCommandes: result.nbSousCommandes,
    });
  } catch (error) {
    console.error("Erreur checkoutControlleur:", error);
    return res.status(500).json({ message: "Erreur lors de la création de la commande." });
  }
}

// ── GET /api/checkout/mes-commandes ─────────────────────────────────────────
// Historique des commandes du client connecté
export async function getMesCommandesControlleur(req, res) {
  try {
    const rows = await getCommandesByUtilisateur(req.user.Id);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur getMesCommandesControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/checkout/:commandeId ────────────────────────────────────────────
export async function getCommandeControlleur(req, res) {
  try {
    const rows = await getCommandeEnrichie(req.params.commandeId);
    if (!rows.length) return res.status(404).json({ message: "Commande non trouvée." });
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur getCommandeControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/checkout/refuge-orders ──────────────────────────────────────────
// Sous-commandes reçues par le refuge du gestionnaire connecté
export async function getRefugeOrdersControlleur(req, res) {
  try {
    const rows = await getRefugeOrdersForUser(req.user.Id);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur getRefugeOrdersControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── PUT /api/checkout/sous-commande/:sousCommandeId/status ───────────────────
export async function updateSousCommandeStatusControlleur(req, res) {
  try {
    const { sousCommandeId } = req.params;
    const { statut } = req.body;
    if (!statut) return res.status(400).json({ message: "Statut requis." });
    const result = await updateSousCommandeStatut(sousCommandeId, statut);
    return res.status(200).json({ message: "Statut mis à jour.", ...result });
  } catch (error) {
    console.error("Erreur updateSousCommandeStatusControlleur:", error);
    return res.status(500).json({ message: error.message || "Erreur interne du serveur." });
  }
}

// ── GET /api/checkout/all-orders (Admin) ─────────────────────────────────────
export async function getAllCommandesAdminControlleur(req, res) {
  try {
    const rows = await getAllCommandesAdmin();
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur getAllCommandesAdminControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}
