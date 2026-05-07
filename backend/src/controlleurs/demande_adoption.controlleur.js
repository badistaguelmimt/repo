import {
  createDemandeAdoption,
  getDemandesByRefuge,
  getDemandesByUtilisateur,
  getDemandeById,
  updateDemandeStatut,
  deleteDemandeAdoption,
  demandeExisteDeja,
} from "../database/demande_adoption.db.js";
import { getUtilisateurRefugesById } from "../database/utilisateur.db.js";
import { db } from "../config/db.js";

// ── Résoudre un label statut → Id (avec cache en mémoire) ───────────────────
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

// ── POST /api/demandes-adoption ───────────────────────────────────────────────
export const createDemandeControlleur = async (req, res) => {
  try {
    const { IdAnimal, TypeLogement, Jardin, Animaux, Enfants, CommentaireDepart, Disponibilite } = req.body;

    if (!IdAnimal || !TypeLogement || !CommentaireDepart) {
      return res.status(400).json({ message: "IdAnimal, TypeLogement et CommentaireDepart sont requis." });
    }

    // Récupérer IdRefuge via la table possession
    const [[possessionRow]] = await db.query(
      "SELECT IdRefuge FROM possession WHERE IdAnimal = ? AND IdRefuge IS NOT NULL LIMIT 1",
      [IdAnimal]
    );
    const IdRefuge = possessionRow?.IdRefuge ?? req.body.IdRefuge;
    if (!IdRefuge) {
      return res.status(400).json({ message: "Impossible de déterminer le refuge de cet animal." });
    }

    // Vérifier si une demande existe déjà
    const alreadyExists = await demandeExisteDeja(IdAnimal, req.user.Id);
    if (alreadyExists) {
      return res.status(409).json({ message: "Vous avez déjà soumis une demande d'adoption pour cet animal." });
    }

    const statutId = await resolveStatutId("En attente");

    const newId = await createDemandeAdoption({
      IdAnimal,
      IdUtilisateur: req.user.Id,
      IdRefuge,
      Statut: statutId,
      TypeLogement,
      Jardin: Jardin ?? null,
      Animaux: Animaux ?? null,
      Enfants: Enfants ?? null,
      CommentaireDepart,
      Disponibilite: Disponibilite ?? null,
    });

    return res.status(201).json({ message: "Demande d'adoption soumise avec succès.", id: newId });
  } catch (error) {
    console.error("Erreur createDemandeControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ── GET /api/demandes-adoption/mes-demandes ───────────────────────────────────
export const getMesDemandes = async (req, res) => {
  try {
    const demandes = await getDemandesByUtilisateur(req.user.Id);
    return res.status(200).json(demandes);
  } catch (error) {
    console.error("Erreur getMesDemandes:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ── GET /api/demandes-adoption/refuge ─────────────────────────────────────────
export const getDemandesRefuge = async (req, res) => {
  try {
    const userRefuges = await getUtilisateurRefugesById(req.user.Id);
    if (!userRefuges.length) {
      return res.status(403).json({ message: "Vous n'êtes associé à aucun refuge." });
    }
    const idRefuge = userRefuges[0].Id;
    const demandes = await getDemandesByRefuge(idRefuge);
    return res.status(200).json(demandes);
  } catch (error) {
    console.error("Erreur getDemandesRefuge:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ── GET /api/demandes-adoption/:id ───────────────────────────────────────────
export const getDemandeByIdControlleur = async (req, res) => {
  try {
    const demande = await getDemandeById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande introuvable." });

    const isOwner = demande.IdUtilisateur === req.user.Id;
    const userRefuges = await getUtilisateurRefugesById(req.user.Id);
    const isRefuge = userRefuges.some((r) => r.Id === demande.IdRefuge);

    if (!isOwner && !isRefuge) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    return res.status(200).json(demande);
  } catch (error) {
    console.error("Erreur getDemandeByIdControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ── PUT /api/demandes-adoption/:id/statut ────────────────────────────────────
export const updateStatutControlleur = async (req, res) => {
  try {
    const { Statut, CommentaireRetour } = req.body;
    if (!Statut) return res.status(400).json({ message: "Le statut est requis." });

    const demande = await getDemandeById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande introuvable." });

    const userRefuges = await getUtilisateurRefugesById(req.user.Id);
    const isRefuge = userRefuges.some((r) => r.Id === demande.IdRefuge);
    if (!isRefuge) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette demande." });
    }

    // Accepte un Id numérique ou un label textuel
    const statutId = isNaN(Statut) ? await resolveStatutId(Statut) : Number(Statut);

    await updateDemandeStatut(req.params.id, statutId, CommentaireRetour);
    return res.status(200).json({ message: "Statut mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur updateStatutControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// ── DELETE /api/demandes-adoption/:id ────────────────────────────────────────
export const deleteDemande = async (req, res) => {
  try {
    const demande = await getDemandeById(req.params.id);
    if (!demande) return res.status(404).json({ message: "Demande introuvable." });

    if (demande.IdUtilisateur !== req.user.Id) {
      return res.status(403).json({ message: "Vous ne pouvez annuler que vos propres demandes." });
    }

    await deleteDemandeAdoption(req.params.id);
    return res.status(200).json({ message: "Demande annulée." });
  } catch (error) {
    console.error("Erreur deleteDemande:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
