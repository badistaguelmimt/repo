import { describe, it, expect, vi } from "vitest";

vi.mock("../src/database/checkout.db.js", () => ({
  createCheckout: vi.fn(),
  getCommandesByUtilisateur: vi.fn(),
  getCommandeEnrichie: vi.fn(),
  getRefugeOrdersForUser: vi.fn(),
  updateSousCommandeStatut: vi.fn(),
  getAllCommandesAdmin: vi.fn(),
}));

import {
  checkoutControlleur,
  getMesCommandesControlleur,
  getCommandeControlleur,
  getRefugeOrdersControlleur,
  updateSousCommandeStatusControlleur,
  getAllCommandesAdminControlleur,
} from "../src/controlleurs/checkout.controlleur.js";
import {
  createCheckout,
  getCommandesByUtilisateur,
  getCommandeEnrichie,
  getRefugeOrdersForUser,
  updateSousCommandeStatut,
  getAllCommandesAdmin,
} from "../src/database/checkout.db.js";

const mockRes = () => {
  const r = {};
  r.status = vi.fn().mockReturnValue(r);
  r.json = vi.fn().mockReturnValue(r);
  return r;
};

// ─────────────────────────────────────────────────────────────────────────────
describe("checkoutControlleur", () => {
  it("400 si le panier est vide", async () => {
    const req = {
      body: { items: [], adresseLivraison: { adresse: "1 rue A", ville: "Paris" } },
      user: { Id: 1 },
    };
    const res = mockRes();
    await checkoutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("vide") })
    );
  });

  it("400 si items n'est pas un tableau", async () => {
    const req = {
      body: { items: null, adresseLivraison: { adresse: "1 rue A", ville: "Paris" } },
      user: { Id: 1 },
    };
    const res = mockRes();
    await checkoutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 si adresse de livraison incomplète", async () => {
    const req = {
      body: {
        items: [{ IdProduit: 1, Quantite: 1, Prix: 10, IdRefuge: 2 }],
        adresseLivraison: { adresse: "1 rue A" }, // ville manquante
      },
      user: { Id: 1 },
    };
    const res = mockRes();
    await checkoutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("adresse") })
    );
  });

  it("400 si un article est invalide (champ manquant)", async () => {
    const req = {
      body: {
        items: [{ IdProduit: 1, Quantite: 1 }], // Prix et IdRefuge manquants
        adresseLivraison: { adresse: "1 rue A", ville: "Paris" },
      },
      user: { Id: 1 },
    };
    const res = mockRes();
    await checkoutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("201 si commande créée avec succès (décompte stock vérifié)", async () => {
    createCheckout.mockResolvedValue({ idCommande: 10, total: 50, nbSousCommandes: 1 });
    const req = {
      body: {
        items: [{ IdProduit: 1, Quantite: 2, Prix: 25, IdRefuge: 3 }],
        adresseLivraison: { adresse: "10 av B", ville: "Lyon" },
      },
      user: { Id: 1 },
    };
    const res = mockRes();
    await checkoutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ commandeId: 10, total: 50, nbSousCommandes: 1 })
    );
  });

  it("500 en cas d'erreur interne", async () => {
    createCheckout.mockRejectedValue(new Error("DB crash"));
    const req = {
      body: {
        items: [{ IdProduit: 1, Quantite: 1, Prix: 10, IdRefuge: 2 }],
        adresseLivraison: { adresse: "1 rue A", ville: "Paris" },
      },
      user: { Id: 1 },
    };
    const res = mockRes();
    await checkoutControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getMesCommandesControlleur", () => {
  it("200 avec l'historique des commandes", async () => {
    getCommandesByUtilisateur.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
    const req = { user: { Id: 1 } };
    const res = mockRes();
    await getMesCommandesControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ Id: 1 }, { Id: 2 }]);
  });

  it("500 en cas d'erreur", async () => {
    getCommandesByUtilisateur.mockRejectedValue(new Error("crash"));
    const req = { user: { Id: 1 } };
    const res = mockRes();
    await getMesCommandesControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getCommandeControlleur", () => {
  it("404 si commande introuvable", async () => {
    getCommandeEnrichie.mockResolvedValue([]);
    const req = { params: { commandeId: "999" } };
    const res = mockRes();
    await getCommandeControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("200 si commande trouvée", async () => {
    getCommandeEnrichie.mockResolvedValue([{ Id: 1, IdProduit: 5 }]);
    const req = { params: { commandeId: "1" } };
    const res = mockRes();
    await getCommandeControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getRefugeOrdersControlleur", () => {
  it("200 avec les sous-commandes du refuge", async () => {
    getRefugeOrdersForUser.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
    const req = { user: { Id: 5 } };
    const res = mockRes();
    await getRefugeOrdersControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("updateSousCommandeStatusControlleur", () => {
  it("400 si statut manquant", async () => {
    const req = { params: { sousCommandeId: "1" }, body: {} };
    const res = mockRes();
    await updateSousCommandeStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("200 si mise à jour réussie (statuts corrects)", async () => {
    updateSousCommandeStatut.mockResolvedValue({ updated: true });
    const req = { params: { sousCommandeId: "1" }, body: { statut: "Expédiée" } };
    const res = mockRes();
    await updateSousCommandeStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Statut mis à jour." })
    );
  });

  it("500 si erreur métier remontée par la BDD", async () => {
    updateSousCommandeStatut.mockRejectedValue(new Error("Statut invalide"));
    const req = { params: { sousCommandeId: "1" }, body: { statut: "StatutBidon" } };
    const res = mockRes();
    await updateSousCommandeStatusControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("getAllCommandesAdminControlleur", () => {
  it("200 avec toutes les commandes (vue admin)", async () => {
    getAllCommandesAdmin.mockResolvedValue([{ Id: 1 }, { Id: 2 }, { Id: 3 }]);
    const req = {};
    const res = mockRes();
    await getAllCommandesAdminControlleur(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([{ Id: 1 }]));
  });
});
