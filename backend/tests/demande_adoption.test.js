import { describe, it, expect, vi } from "vitest";

vi.mock("../src/database/demande_adoption.db.js", () => ({
  createDemandeAdoption: vi.fn(),
  getDemandesByRefuge: vi.fn(),
  getDemandesByUtilisateur: vi.fn(),
  getDemandeById: vi.fn(),
  updateDemandeStatut: vi.fn(),
  deleteDemandeAdoption: vi.fn(),
  demandeExisteDeja: vi.fn(),
}));
vi.mock("../src/database/utilisateur.db.js", () => ({
  getUtilisateurRefugesById: vi.fn(),
}));
vi.mock("../src/config/db.js", () => ({
  db: { query: vi.fn() },
}));
vi.mock("../src/services/cache.service.js", () => ({
  resolveStatutId: vi.fn().mockResolvedValue(2),   // Id 2 = "En attente"
  resolveTypeServiceId: vi.fn().mockResolvedValue(null),
}));

import {
  createDemandeControlleur,
  getMesDemandes,
  getDemandesRefuge,
  getDemandeByIdControlleur,
  updateStatutControlleur,
  deleteDemande,
} from "../src/controlleurs/demande_adoption.controlleur.js";
import {
  createDemandeAdoption,
  getDemandesByUtilisateur,
  getDemandesByRefuge,
  getDemandeById,
  updateDemandeStatut,
  deleteDemandeAdoption,
  demandeExisteDeja,
} from "../src/database/demande_adoption.db.js";
import { getUtilisateurRefugesById } from "../src/database/utilisateur.db.js";
import { db } from "../src/config/db.js";

const mockRes = () => {
  const r = {};
  r.status = vi.fn().mockReturnValue(r);
  r.json = vi.fn().mockReturnValue(r);
  return r;
};

// Simule le cache statut (query retourne statut "En attente" id=2)
const setupStatutCache = () => {
  db.query.mockResolvedValue([[{ Id: 2, Statut: "En attente" }]]);
};

// ─────────────────────────────────────────────────────────────────────────────
describe("createDemandeControlleur", () => {
  it("400 si champs obligatoires manquants", async () => {
    const req = { body: { IdAnimal: 1 }, user: { Id: 10 } };
    const res = mockRes();
    await createDemandeControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 si impossible de trouver le refuge de l'animal", async () => {
    // possession retourne vide → pas de IdRefuge → 400
    db.query.mockResolvedValueOnce([[]]);
    demandeExisteDeja.mockResolvedValue(false);
    const req = {
      body: { IdAnimal: 99, TypeLogement: "Appartement", CommentaireDepart: "Test" },
      user: { Id: 10 },
    };
    const res = mockRes();
    await createDemandeControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("409 si une demande existe déjà pour cet animal", async () => {
    // possession → IdRefuge=5 ; cache statut géré par cache.service mock
    db.query.mockResolvedValueOnce([[{ IdRefuge: 5 }]]);
    demandeExisteDeja.mockResolvedValue(true);
    const req = {
      body: { IdAnimal: 1, TypeLogement: "Maison", CommentaireDepart: "Motif" },
      user: { Id: 10 },
    };
    const res = mockRes();
    await createDemandeControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("201 si création réussie", async () => {
    // possession → IdRefuge=5 ; cache statut géré par cache.service mock
    db.query.mockResolvedValueOnce([[{ IdRefuge: 5 }]]);
    demandeExisteDeja.mockResolvedValue(false);
    createDemandeAdoption.mockResolvedValue(42);
    const req = {
      body: { IdAnimal: 1, TypeLogement: "Maison", CommentaireDepart: "Motif" },
      user: { Id: 10 },
    };
    const res = mockRes();
    await createDemandeControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getMesDemandes", () => {
  it("200 avec la liste des demandes de l'utilisateur", async () => {
    const fakeDemandes = [{ Id: 1 }, { Id: 2 }];
    getDemandesByUtilisateur.mockResolvedValue(fakeDemandes);
    const req = { user: { Id: 10 } };
    const res = mockRes();
    await getMesDemandes(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeDemandes);
  });

  it("500 en cas d'erreur BDD", async () => {
    getDemandesByUtilisateur.mockRejectedValue(new Error("DB crash"));
    const req = { user: { Id: 10 } };
    const res = mockRes();
    await getMesDemandes(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getDemandesRefuge", () => {
  it("403 si l'utilisateur n'est associé à aucun refuge", async () => {
    getUtilisateurRefugesById.mockResolvedValue([]);
    const req = { user: { Id: 10 } };
    const res = mockRes();
    await getDemandesRefuge(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("200 avec les demandes du refuge", async () => {
    getUtilisateurRefugesById.mockResolvedValue([{ Id: 5 }]);
    getDemandesByRefuge.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
    const req = { user: { Id: 10 } };
    const res = mockRes();
    await getDemandesRefuge(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getDemandeByIdControlleur", () => {
  it("404 si demande inexistante", async () => {
    getDemandeById.mockResolvedValue(null);
    const req = { params: { id: "999" }, user: { Id: 10 } };
    const res = mockRes();
    await getDemandeByIdControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403 si ni propriétaire ni refuge", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdUtilisateur: 99, IdRefuge: 5 });
    getUtilisateurRefugesById.mockResolvedValue([{ Id: 7 }]); // autre refuge
    const req = { params: { id: "1" }, user: { Id: 10 } };
    const res = mockRes();
    await getDemandeByIdControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("200 si propriétaire de la demande", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdUtilisateur: 10, IdRefuge: 5 });
    getUtilisateurRefugesById.mockResolvedValue([]);
    const req = { params: { id: "1" }, user: { Id: 10 } };
    const res = mockRes();
    await getDemandeByIdControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("200 si gestionnaire du refuge concerné", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdUtilisateur: 99, IdRefuge: 5 });
    getUtilisateurRefugesById.mockResolvedValue([{ Id: 5 }]);
    const req = { params: { id: "1" }, user: { Id: 10 } };
    const res = mockRes();
    await getDemandeByIdControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("updateStatutControlleur", () => {
  it("400 si statut manquant", async () => {
    const req = { params: { id: "1" }, body: {}, user: { Id: 10 } };
    const res = mockRes();
    await updateStatutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404 si demande inexistante", async () => {
    getDemandeById.mockResolvedValue(null);
    const req = { params: { id: "999" }, body: { Statut: "Acceptée" }, user: { Id: 10 } };
    const res = mockRes();
    await updateStatutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403 si utilisateur pas gestionnaire du refuge", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdRefuge: 5 });
    getUtilisateurRefugesById.mockResolvedValue([{ Id: 7 }]);
    const req = { params: { id: "1" }, body: { Statut: "Acceptée" }, user: { Id: 10 } };
    const res = mockRes();
    await updateStatutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("200 si mise à jour réussie par le refuge", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdRefuge: 5 });
    getUtilisateurRefugesById.mockResolvedValue([{ Id: 5 }]);
    updateDemandeStatut.mockResolvedValue(true);
    db.query.mockResolvedValue([[{ Id: 3, Statut: "Acceptée" }]]);
    const req = { params: { id: "1" }, body: { Statut: "Acceptée" }, user: { Id: 10 } };
    const res = mockRes();
    await updateStatutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("deleteDemande", () => {
  it("404 si demande inexistante", async () => {
    getDemandeById.mockResolvedValue(null);
    const req = { params: { id: "999" }, user: { Id: 10 } };
    const res = mockRes();
    await deleteDemande(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403 si l'utilisateur n'est pas propriétaire", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdUtilisateur: 99 });
    const req = { params: { id: "1" }, user: { Id: 10 } };
    const res = mockRes();
    await deleteDemande(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("200 si annulation réussie par le propriétaire", async () => {
    getDemandeById.mockResolvedValue({ Id: 1, IdUtilisateur: 10 });
    deleteDemandeAdoption.mockResolvedValue(true);
    const req = { params: { id: "1" }, user: { Id: 10 } };
    const res = mockRes();
    await deleteDemande(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
