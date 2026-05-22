import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/database/reservation.db.js", () => ({
  createReservation: vi.fn(),
  getAllReservations: vi.fn(),
  getReservationById: vi.fn(),
  getReservationsByUtilisateurId: vi.fn(),
  getReservationsByProfilId: vi.fn(),
  getReservationsByRefugeId: vi.fn(),
  updateReservation: vi.fn(),
  updateReservationStatut: vi.fn(),
  deleteReservation: vi.fn(),
}));
vi.mock("../src/database/profil_prestataire.db.js", () => ({
  getProfilPrestataireByUtilisateurId: vi.fn(),
}));
vi.mock("../src/database/utilisateur.db.js", () => ({
  getUtilisateurRefugesById: vi.fn(),
}));
vi.mock("../src/config/db.js", () => ({
  db: { query: vi.fn() },
}));
vi.mock("../src/services/cache.service.js", () => ({
  resolveStatutId: vi.fn(),
  resolveTypeServiceId: vi.fn(),
}));

import {
  createReservationControlleur,
  getMyReservationsControlleur,
  getReservationControlleur,
  getAllReservationsControlleur,
  updateReservationStatusControlleur,
  deleteReservationControlleur,
} from "../src/controlleurs/reservation.controlleur.js";
import {
  createReservation,
  getReservationById,
  getReservationsByUtilisateurId,
  getAllReservations,
  updateReservationStatut,
  deleteReservation,
} from "../src/database/reservation.db.js";
import { getProfilPrestataireByUtilisateurId } from "../src/database/profil_prestataire.db.js";
import { db } from "../src/config/db.js";
import { resolveStatutId, resolveTypeServiceId } from "../src/services/cache.service.js";

// Restaure les valeurs par défaut après chaque resetAllMocks du setup.js
beforeEach(() => {
  resolveStatutId.mockResolvedValue(2);      // Id 2 = "En attente"
  resolveTypeServiceId.mockResolvedValue(1); // Id 1 = "Pet-sitting" (valide)
});


const mockRes = () => {
  const r = {};
  r.status = vi.fn().mockReturnValue(r);
  r.json = vi.fn().mockReturnValue(r);
  return r;
};

// ─────────────────────────────────────────────────────────────────────────────
describe("createReservationControlleur", () => {
  it("400 si champs obligatoires manquants", async () => {
    const req = { body: { IdProfil: 1 }, user: { Id: 10 } };
    const res = mockRes();
    await createReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 si le type de service est invalide", async () => {
    // resolveTypeServiceId mocké pour retourner null = service invalide
    const { resolveTypeServiceId } = await import("../src/services/cache.service.js");
    resolveTypeServiceId.mockResolvedValueOnce(null);
    const req = {
      body: {
        IdProfil: 1,
        TypeService: "ServiceInexistant",
        DateDebut: "2026-06-01T09:00:00",
        DateFin: "2026-06-01T11:00:00",
      },
      user: { Id: 10 },
    };
    const res = mockRes();
    await createReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("service") })
    );
  });

  it("400 si DateFin <= DateDebut", async () => {
    // cache.service mock retourne typeServiceId=1 (valide) par défaut
    // La validation des dates doit échouer
    const req = {
      body: {
        IdProfil: 1,
        TypeService: "Pet-sitting",
        DateDebut: "2026-06-01T11:00:00",
        DateFin:   "2026-06-01T09:00:00",
      },
      user: { Id: 10 },
    };
    const res = mockRes();
    await createReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("dates") })
    );
  });

  it("201 si réservation créée avec succès", async () => {
    // cache.service mock actif, seul TarifHoraire nécessite db.query
    db.query.mockResolvedValueOnce([[{ TarifHoraire: 15 }]]);
    createReservation.mockResolvedValue(88);
    getReservationById.mockResolvedValue({ Id: 88, Statut: "En attente" });
    const req = {
      body: {
        IdProfil: 1,
        TypeService: "Pet-sitting",
        DateDebut: "2026-06-01T09:00:00",
        DateFin:   "2026-06-01T11:00:00",
      },
      user: { Id: 10 },
    };
    const res = mockRes();
    await createReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("succès") })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getMyReservationsControlleur", () => {
  it("200 avec la liste des réservations du client", async () => {
    getReservationsByUtilisateurId.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
    const req = { user: { Id: 10 } };
    const res = mockRes();
    await getMyReservationsControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ Id: 1 }, { Id: 2 }]);
  });

  it("500 en cas d'erreur BDD", async () => {
    getReservationsByUtilisateurId.mockRejectedValue(new Error("crash"));
    const req = { user: { Id: 10 } };
    const res = mockRes();
    await getMyReservationsControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getReservationControlleur", () => {
  it("404 si réservation inexistante", async () => {
    getReservationById.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockRes();
    await getReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("200 si réservation trouvée", async () => {
    getReservationById.mockResolvedValue({ Id: 1, Statut: "En attente" });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getAllReservationsControlleur (admin)", () => {
  it("200 avec toutes les réservations", async () => {
    getAllReservations.mockResolvedValue([{ Id: 1 }, { Id: 2 }, { Id: 3 }]);
    const req = {};
    const res = mockRes();
    await getAllReservationsControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([{ Id: 1 }]));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("updateReservationStatusControlleur", () => {
  it("400 si statut manquant", async () => {
    const req = { params: { id: "1" }, body: {}, user: { Id: 10 } };
    const res = mockRes();
    await updateReservationStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 si réservation inexistante", async () => {
    getReservationById.mockResolvedValue(null);
    const req = { params: { id: "999" }, body: { Statut: "Confirmée" }, user: { Id: 10 } };
    const res = mockRes();
    await updateReservationStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403 si ni prestataire ni admin ni client propriétaire", async () => {
    getReservationById.mockResolvedValue({ Id: 1, IdProfil: 5, IdUtilisateur: 99 });
    getProfilPrestataireByUtilisateurId.mockResolvedValue({ Id: 7 }); // autre profil
    const req = {
      params: { id: "1" },
      body: { Statut: "Confirmée" },
      user: { Id: 10, roles: [] },
    };
    const res = mockRes();
    await updateReservationStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("403 si client essaie autre chose qu'Annulée", async () => {
    getReservationById.mockResolvedValue({ Id: 1, IdProfil: 5, IdUtilisateur: 10 });
    getProfilPrestataireByUtilisateurId.mockResolvedValue({ Id: 7 }); // pas le bon prestataire
    const req = {
      params: { id: "1" },
      body: { Statut: "Confirmée" }, // le client ne peut pas confirmer
      user: { Id: 10, roles: [] },
    };
    const res = mockRes();
    await updateReservationStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("annuler") })
    );
  });

  it("200 si client annule sa propre réservation", async () => {
    getReservationById
      .mockResolvedValueOnce({ Id: 1, IdProfil: 5, IdUtilisateur: 10 })
      .mockResolvedValueOnce({ Id: 1, Statut: "Annulée" });
    getProfilPrestataireByUtilisateurId.mockResolvedValue({ Id: 7 });
    db.query.mockResolvedValue([[{ Id: 5, Statut: "Annulée" }]]);
    updateReservationStatut.mockResolvedValue(true);
    const req = {
      params: { id: "1" },
      body: { Statut: "Annulée" },
      user: { Id: 10, roles: [] },
    };
    const res = mockRes();
    await updateReservationStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("200 si prestataire change le statut", async () => {
    getReservationById
      .mockResolvedValueOnce({ Id: 1, IdProfil: 5, IdUtilisateur: 99 })
      .mockResolvedValueOnce({ Id: 1, Statut: "Confirmée" });
    getProfilPrestataireByUtilisateurId.mockResolvedValue({ Id: 5 }); // bon prestataire
    db.query.mockResolvedValue([[{ Id: 3, Statut: "Confirmée" }]]);
    updateReservationStatut.mockResolvedValue(true);
    const req = {
      params: { id: "1" },
      body: { Statut: "Confirmée" },
      user: { Id: 10, roles: [] },
    };
    const res = mockRes();
    await updateReservationStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deleteReservationControlleur", () => {
  it("404 si réservation inexistante", async () => {
    getReservationById.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockRes();
    await deleteReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("200 si suppression réussie", async () => {
    getReservationById.mockResolvedValue({ Id: 1 });
    deleteReservation.mockResolvedValue(true);
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteReservationControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
