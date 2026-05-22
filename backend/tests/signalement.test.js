import { describe, it, expect, vi } from "vitest";

vi.mock("../src/database/signalement.db.js", () => ({
  createSignalement: vi.fn(),
  getAllSignalements: vi.fn(),
  getSignalementById: vi.fn(),
  getSignalementsByUtilisateur: vi.fn(),
  resolveSignalement: vi.fn(),
  deleteSignalement: vi.fn(),
}));
vi.mock("../src/config/db.js", () => ({
  db: { query: vi.fn() },
}));
vi.mock("../src/services/cache.service.js", () => ({
  resolveStatutId: vi.fn().mockResolvedValue(2),
  resolveTypeServiceId: vi.fn().mockResolvedValue(null),
}));

import {
  createSignalementControlleur,
  getAllSignalementsControlleur,
  getMesSignalementsControlleur,
  getSignalementControlleur,
  resolveSignalementControlleur,
  deleteSignalementControlleur,
} from "../src/controlleurs/signalement.controlleur.js";
import {
  createSignalement,
  getAllSignalements,
  getSignalementById,
  getSignalementsByUtilisateur,
  resolveSignalement,
  deleteSignalement,
} from "../src/database/signalement.db.js";
import { db } from "../src/config/db.js";

const mockRes = () => {
  const r = {};
  r.status = vi.fn().mockReturnValue(r);
  r.json = vi.fn().mockReturnValue(r);
  return r;
};

// ─────────────────────────────────────────────────────────────────────────────
describe("createSignalementControlleur", () => {
  it("400 si TypeCible ou Raison manquants", async () => {
    const req = { body: { TypeCible: "animal" }, user: { Id: 1 } };
    const res = mockRes();
    await createSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 si Raison manquante", async () => {
    const req = { body: { TypeCible: "" , Raison: "Maltraitance" }, user: { Id: 1 } };
    const res = mockRes();
    await createSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("201 si signalement créé avec succès (sans connexion)", async () => {
    // cache statut géré par le mock de cache.service.js
    createSignalement.mockResolvedValue(55);
    const req = {
      body: { TypeCible: "animal", IdCible: 10, Raison: "Animal en danger" },
      user: { Id: 1 },
    };
    const res = mockRes();
    await createSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 55 }));
  });

  it("500 en cas d'erreur BDD (createSignalement)", async () => {
    // cache.service mock retourne statutId=2 ; createSignalement échoue
    createSignalement.mockRejectedValue(new Error("DB crash"));
    const req = {
      body: { TypeCible: "utilisateur", Raison: "Spam" },
      user: { Id: 1 },
    };
    const res = mockRes();
    await createSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getAllSignalementsControlleur (admin)", () => {
  it("200 avec la liste complète", async () => {
    getAllSignalements.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
    const req = {};
    const res = mockRes();
    await getAllSignalementsControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500 en cas d'erreur", async () => {
    getAllSignalements.mockRejectedValue(new Error("crash"));
    const req = {};
    const res = mockRes();
    await getAllSignalementsControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getMesSignalementsControlleur", () => {
  it("200 avec la liste des signalements de l'utilisateur", async () => {
    getSignalementsByUtilisateur.mockResolvedValue([{ Id: 3 }]);
    const req = { user: { Id: 1 } };
    const res = mockRes();
    await getMesSignalementsControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ Id: 3 }]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getSignalementControlleur", () => {
  it("404 si signalement inexistant", async () => {
    getSignalementById.mockResolvedValue(null);
    const req = { params: { id: "999" }, user: { Id: 1 } };
    const res = mockRes();
    await getSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403 si ni admin ni propriétaire", async () => {
    getSignalementById.mockResolvedValue({ Id: 1, IdUtilisateur: 99 });
    const req = { params: { id: "1" }, user: { Id: 1, roles: [] } };
    const res = mockRes();
    await getSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("200 si propriétaire du signalement", async () => {
    getSignalementById.mockResolvedValue({ Id: 1, IdUtilisateur: 1 });
    const req = { params: { id: "1" }, user: { Id: 1, roles: [] } };
    const res = mockRes();
    await getSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("resolveSignalementControlleur (admin)", () => {
  it("400 si statut manquant", async () => {
    const req = { params: { id: "1" }, body: {} };
    const res = mockRes();
    await resolveSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 si signalement introuvable", async () => {
    getSignalementById.mockResolvedValue(null);
    const req = { params: { id: "999" }, body: { statut: "Validé" } };
    const res = mockRes();
    await resolveSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("200 si résolution réussie", async () => {
    getSignalementById.mockResolvedValue({ Id: 1 });
    db.query.mockResolvedValue([[{ Id: 3, Statut: "Validé" }]]);
    resolveSignalement.mockResolvedValue(true);
    const req = { params: { id: "1" }, body: { statut: "Validé" } };
    const res = mockRes();
    await resolveSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deleteSignalementControlleur (admin)", () => {
  it("404 si signalement inexistant", async () => {
    getSignalementById.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockRes();
    await deleteSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("200 si suppression réussie", async () => {
    getSignalementById.mockResolvedValue({ Id: 1 });
    deleteSignalement.mockResolvedValue(true);
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteSignalementControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
