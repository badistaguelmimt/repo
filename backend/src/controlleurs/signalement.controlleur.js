import {
  createSignalement,
  getAllSignalements,
  getSignalementById,
  getSignalementsByUtilisateur,
  resolveSignalement,
  deleteSignalement,
} from "../database/signalement.db.js";
import { db } from "../config/db.js";

// ── Cache statuts en mémoire ──────────────────────────────────────────────────
let _statutCache = null;
const resolveStatutId = async (label) => {
  if (!_statutCache) {
    const [rows] = await db.query("SELECT Id, Statut FROM statut");
    _statutCache = rows;
  }
  const found = _statutCache.find(
    (s) => s.Statut?.toLowerCase() === String(label).toLowerCase()
  );
  return found?.Id ?? 2; // fallback: Id 2 = "En attente"
};

// ── POST /api/signalements ────────────────────────────────────────────────────
// Utilisateur authentifié signale un problème (animal en danger, abus, etc.)
export async function createSignalementControlleur(req, res) {
  try {
    const {
      TypeCible,   // ex: "animal", "utilisateur", "refuge"
      IdCible,     // id de la ressource signalée (0 si non applicable)
      Raison,      // description détaillée du signalement
    } = req.body;

    if (!Raison || !TypeCible) {
      return res.status(400).json({
        message: "TypeCible et Raison sont requis.",
      });
    }

    const statutId = await resolveStatutId("En attente");

    const id = await createSignalement({
      IdUtilisateur: req.user.Id,
      TypeCible,
      IdCible: IdCible ?? 0,
      Statut: statutId,
      Raison,
    });

    return res.status(201).json({
      message: "Signalement créé avec succès.",
      id,
    });
  } catch (error) {
    console.error("Erreur createSignalementControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/signalements ─────────────────────────────────────────────────────
// Admin : liste tous les signalements enrichis
export async function getAllSignalementsControlleur(req, res) {
  try {
    const signalements = await getAllSignalements();
    return res.status(200).json(signalements);
  } catch (error) {
    console.error("Erreur getAllSignalementsControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/signalements/mes-signalements ────────────────────────────────────
// Utilisateur connecté : ses propres signalements
export async function getMesSignalementsControlleur(req, res) {
  try {
    const signalements = await getSignalementsByUtilisateur(req.user.Id);
    return res.status(200).json(signalements);
  } catch (error) {
    console.error("Erreur getMesSignalementsControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/signalements/:id ─────────────────────────────────────────────────
export async function getSignalementControlleur(req, res) {
  try {
    const sig = await getSignalementById(req.params.id);
    if (!sig) return res.status(404).json({ message: "Signalement non trouvé." });

    // Autorisation : admin ou propriétaire
    const isAdmin = req.user?.roles?.some?.((r) =>
      String(r).toLowerCase().includes("admin")
    );
    const isOwner = sig.IdUtilisateur === req.user?.Id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    return res.status(200).json(sig);
  } catch (error) {
    console.error("Erreur getSignalementControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── PUT /api/signalements/:id/resolve ────────────────────────────────────────
// Admin : résoudre ou rejeter un signalement
export async function resolveSignalementControlleur(req, res) {
  try {
    const { id } = req.params;
    const { statut } = req.body; // "Validé" (résolu) ou "Rejeté"

    if (!statut) {
      return res.status(400).json({ message: "Le statut est requis." });
    }

    const sig = await getSignalementById(id);
    if (!sig) return res.status(404).json({ message: "Signalement non trouvé." });

    const statutId = isNaN(statut) ? await resolveStatutId(statut) : Number(statut);
    await resolveSignalement(id, statutId);

    return res.status(200).json({ message: "Signalement mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur resolveSignalementControlleur:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// ── DELETE /api/signalements/:id ─────────────────────────────────────────────
// Admin uniquement
export async function deleteSignalementControlleur(req, res) {
  try {
    const { id } = req.params;
    const sig = await getSignalementById(id);
    if (!sig) return res.status(404).json({ message: "Signalement non trouvé." });

    await deleteSignalement(id);
    return res.status(200).json({ message: "Signalement supprimé." });
  } catch (error) {
    console.error("Erreur deleteSignalementControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}