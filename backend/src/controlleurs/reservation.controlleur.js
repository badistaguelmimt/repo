import {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByUtilisateurId,
  getReservationsByProfilId,
  getReservationsByRefugeId,
  updateReservation,
  updateReservationStatut,
  deleteReservation,
} from "../database/reservation.db.js";
import { getProfilPrestataireByUtilisateurId } from "../database/profil_prestataire.db.js";
import { getUtilisateurRefugesById } from "../database/utilisateur.db.js";
import { db } from "../config/db.js";
import { resolveStatutId, resolveTypeServiceId } from "../services/cache.service.js";

// ── Wrappers vers le cache centralis\u00e9 (TTL 5 min, auto-expiration) ───────────
const resolveStatut      = (label) => resolveStatutId(db, label);
const resolveTypeService = (label) => resolveTypeServiceId(db, label);

// ── POST /api/reservations ────────────────────────────────────────────────────
// Client : créer une réservation chez un prestataire
export async function createReservationControlleur(req, res) {
  try {
    const {
      IdProfil,
      IdAnimal,
      TypeService,    // Id numérique ou label string (ex: "Promenade")
      DateDebut,
      DateFin,
      Notes,
      PrixFinal,
    } = req.body;

    if (!IdProfil || !TypeService || !DateDebut || !DateFin) {
      return res.status(400).json({
        message: "IdProfil, TypeService, DateDebut et DateFin sont requis.",
      });
    }

    const statutId = await resolveStatut("En attente");
    const typeServiceId = isNaN(TypeService)
      ? await resolveTypeService(TypeService)
      : Number(TypeService);

    if (!typeServiceId) {
      return res.status(400).json({ message: "Type de service invalide." });
    }

    const start = new Date(DateDebut);
    const end = new Date(DateFin);
    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Les dates sont invalides." });
    }

    // Vérifier les conflits de réservation (double booking)
    const statutAnnule = await resolveStatut("Annulée");
    const [conflits] = await db.query(
      `SELECT Id FROM reservation 
       WHERE IdProfil = ? 
       AND Statut != ? 
       AND (
         (DateDebut < ? AND DateFin > ?)
       )`,
      [IdProfil, statutAnnule, end, start]
    );

    if (conflits.length > 0) {
      return res.status(409).json({ message: "Le prestataire a déjà une réservation sur ce créneau horaire." });
    }

    // Calculer le prix si non fourni (tarif horaire × durée)
    let prix = Number(PrixFinal ?? 0);
    if (!prix) {
      const [profils] = await db.query(
        "SELECT TarifHoraire FROM profil_prestataire WHERE Id = ?",
        [IdProfil]
      );
      if (profils.length > 0) {
        const heures = (end - start) / (1000 * 60 * 60);
        prix = Number(profils[0].TarifHoraire) * heures;
      }
    }

    const id = await createReservation({
      IdUtilisateur: req.user.Id,
      IdProfil,
      IdAnimal: IdAnimal ?? 0,
      IdAnnonce: 0,
      TypeService: typeServiceId,
      DateDebut: start,
      DateFin: end,
      Statut: statutId,
      PrixFinal: prix,
      Notes: Notes ?? null,
    });

    const created = await getReservationById(id);
    return res.status(201).json({ message: "Réservation créée avec succès.", reservation: created });
  } catch (error) {
    console.error("Erreur createReservationControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/reservations/mine ────────────────────────────────────────────────
// Client : ses propres réservations
export async function getMyReservationsControlleur(req, res) {
  try {
    const reservations = await getReservationsByUtilisateurId(req.user.Id);
    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getMyReservationsControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/reservations/refuge/all ─────────────────────────────────────────
export async function getRefugeReservationsControlleur(req, res) {
  try {
    const refuges = await getUtilisateurRefugesById(req.user.Id);
    if (!refuges?.length) return res.status(200).json([]);
    const reservations = await getReservationsByRefugeId(refuges[0].IdRefuge);
    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getRefugeReservationsControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/reservations/:id ─────────────────────────────────────────────────
export async function getReservationControlleur(req, res) {
  try {
    const reservation = await getReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée." });
    return res.status(200).json(reservation);
  } catch (error) {
    console.error("Erreur getReservationControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── GET /api/reservations (Admin) ─────────────────────────────────────────────
export async function getAllReservationsControlleur(req, res) {
  try {
    const reservations = await getAllReservations();
    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur getAllReservationsControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── PUT /api/reservations/:id/status ─────────────────────────────────────────
// Prestataire : change le statut de sa réservation (Confirmée, En cours, Terminée, Annulée)
export async function updateReservationStatusControlleur(req, res) {
  try {
    const { id } = req.params;
    const { Statut } = req.body;

    if (!Statut) return res.status(400).json({ message: "Le statut est requis." });

    const reservation = await getReservationById(id);
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée." });

    // Vérifier que c'est le prestataire de cette réservation ou l'admin
    const profil = await getProfilPrestataireByUtilisateurId(req.user.Id);
    const isOwnerPrestataire = profil && profil.Id === reservation.IdProfil;
    const isClientOwner = reservation.IdUtilisateur === req.user.Id;
    const isAdmin = req.user?.roles?.some?.((r) => String(r).toLowerCase().includes("admin"));

    if (!isOwnerPrestataire && !isAdmin && !isClientOwner) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    // Le client ne peut qu'annuler
    if (isClientOwner && !isAdmin && !isOwnerPrestataire && Statut !== "Annulée") {
      return res.status(403).json({ message: "Vous pouvez uniquement annuler votre réservation." });
    }

    const statutId = isNaN(Statut) ? await resolveStatut(Statut) : Number(Statut);
    await updateReservationStatut(id, statutId);
    const updated = await getReservationById(id);
    return res.status(200).json({ message: "Statut mis à jour.", reservation: updated });
  } catch (error) {
    console.error("Erreur updateReservationStatusControlleur:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}

// ── PUT /api/reservations/:id (Full update) ───────────────────────────────────
export async function updateReservationControlleur(req, res) {
  try {
    const { id } = req.params;
    const reservation = await getReservationById(id);
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée." });

    const data = { ...reservation, ...req.body };
    if (req.body.Statut && isNaN(req.body.Statut)) {
      data.Statut = await resolveStatut(req.body.Statut);
    }
    await updateReservation(id, data);
    return res.status(200).json({ message: "Réservation modifiée avec succès." });
  } catch (error) {
    console.error("Erreur updateReservationControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── DELETE /api/reservations/:id ─────────────────────────────────────────────
export async function deleteReservationControlleur(req, res) {
  try {
    const { id } = req.params;
    const reservation = await getReservationById(id);
    if (!reservation) return res.status(404).json({ message: "Réservation non trouvée." });
    await deleteReservation(id);
    return res.status(200).json({ message: "Réservation supprimée." });
  } catch (error) {
    console.error("Erreur deleteReservationControlleur:", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
}

// ── Stubs pour anciennes routes spéciales (compatibilité) ─────────────────────
export async function getAnimalOfReservationControlleur(req, res) {
  res.status(410).json({ message: "Utiliser GET /api/reservations/:id (données enrichies)." });
}
export async function getAnnonceOfReservationControlleur(req, res) {
  res.status(410).json({ message: "Utiliser GET /api/reservations/:id." });
}
export async function getProfilPrestataireOfReservationControlleur(req, res) {
  res.status(410).json({ message: "Utiliser GET /api/reservations/:id." });
}
export async function getStatutOfReservationControlleur(req, res) {
  res.status(410).json({ message: "Utiliser GET /api/reservations/:id." });
}
export async function getTypeServiceOfReservationControlleur(req, res) {
  res.status(410).json({ message: "Utiliser GET /api/reservations/:id." });
}
export async function getUtilisateurOfReservationControlleur(req, res) {
  res.status(410).json({ message: "Utiliser GET /api/reservations/:id." });
}
