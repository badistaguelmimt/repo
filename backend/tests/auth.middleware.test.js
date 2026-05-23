import { describe, it, expect, vi, beforeEach } from "vitest";

// On simule les dépendances externes (BDD et Clerk) pour ne pas avoir besoin
// d'une vraie connexion à la base de données pendant les tests.
vi.mock("@clerk/express", () => ({ getAuth: vi.fn() }));
vi.mock("../src/config/env.js", () => ({ ENV: { ADMIN_EMAIL: "admin@adopty.fr" } }));
vi.mock("../src/database/utilisateur.db.js", () => ({
  getUtilisateurByClerkId: vi.fn(),
  getUtilisateurRolesById: vi.fn(),
}));

import { getAuth } from "@clerk/express";
import { getUtilisateurByClerkId, getUtilisateurRolesById } from "../src/database/utilisateur.db.js";
import {
  protectRoute,
  adminOnly,
  refugeOnly,
  prestataireOnly,
  hasAnyRole,
  isOwnerOrAdmin,
  socketAuth,
} from "../src/midleware/auth.midleware.js";

// Utilitaire : crée un faux objet réponse Express pour les tests
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware protectRoute
// Ce middleware vérifie qu'un utilisateur est bien connecté avant d'accéder à une route.
// ─────────────────────────────────────────────────────────────────────────────
describe("protectRoute — vérification de connexion", () => {
  it("retourne 401 si aucun token n'est fourni", async () => {
    getAuth.mockReturnValue({ userId: null });
    const req = { auth: { userId: null } };
    const res = mockRes();
    const next = vi.fn();

    await protectRoute[0](req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si l'utilisateur n'existe pas en base de données", async () => {
    getAuth.mockReturnValue({ userId: "clerk_abc" });
    getUtilisateurByClerkId.mockResolvedValue(null); // utilisateur introuvable
    const req = { auth: {} };
    const res = mockRes();
    const next = vi.fn();

    await protectRoute[0](req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("appelle next() et attache l'utilisateur à la requête si le token est valide", async () => {
    const fakeUser = { Id: 1, AdresseEmail: "user@test.fr" };
    getAuth.mockReturnValue({ userId: "clerk_abc" });
    getUtilisateurByClerkId.mockResolvedValue(fakeUser);
    const req = { auth: {} };
    const res = mockRes();
    const next = vi.fn();

    await protectRoute[0](req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(fakeUser);
  });

  it("retourne 500 en cas d'erreur inattendue", async () => {
    getAuth.mockImplementation(() => { throw new Error("crash"); });
    const req = { auth: {} };
    const res = mockRes();
    const next = vi.fn();

    await protectRoute[0](req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware adminOnly
// Ce middleware vérifie que l'utilisateur est administrateur.
// ─────────────────────────────────────────────────────────────────────────────
describe("adminOnly — accès administrateur", () => {
  it("autorise l'accès si l'email correspond à l'admin", async () => {
    const req = { user: { Id: 1, AdresseEmail: "admin@adopty.fr" } };
    const res = mockRes();
    const next = vi.fn();

    await adminOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("autorise l'accès si l'utilisateur a le rôle Admin en base de données", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Admin" }]);
    const req = { user: { Id: 2, AdresseEmail: "autre@test.fr" } };
    const res = mockRes();
    const next = vi.fn();

    await adminOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("retourne 403 si l'utilisateur n'est pas admin", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 3, AdresseEmail: "lambda@test.fr" } };
    const res = mockRes();
    const next = vi.fn();

    await adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si req.user est absent", async () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();

    await adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware refugeOnly
// ─────────────────────────────────────────────────────────────────────────────
describe("refugeOnly — accès refuge", () => {
  it("autorise un utilisateur avec le rôle Refuge", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Refuge" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes();
    const next = vi.fn();

    await refugeOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("retourne 403 si l'utilisateur n'a pas le rôle Refuge", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes();
    const next = vi.fn();

    await refugeOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware prestataireOnly
// ─────────────────────────────────────────────────────────────────────────────
describe("prestataireOnly — accès prestataire", () => {
  it("autorise un utilisateur avec le rôle Prestataire", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Prestataire" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes();
    const next = vi.fn();

    await prestataireOnly(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("retourne 403 si l'utilisateur n'est pas prestataire", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes();
    const next = vi.fn();

    await prestataireOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware hasAnyRole
// Ce middleware accepte plusieurs rôles (ex: Refuge OU Admin peuvent créer un animal).
// ─────────────────────────────────────────────────────────────────────────────
describe("hasAnyRole — accès multi-rôles", () => {
  it("autorise si au moins un rôle de l'utilisateur correspond", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Refuge" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes();
    const next = vi.fn();

    await hasAnyRole(["Admin", "Refuge"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("retourne 403 si aucun rôle ne correspond", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes();
    const next = vi.fn();

    await hasAnyRole(["Admin", "Refuge"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware isOwnerOrAdmin
// Vérifie que seul le propriétaire ou un admin peut modifier une ressource.
// ─────────────────────────────────────────────────────────────────────────────
describe("isOwnerOrAdmin — propriétaire ou admin", () => {
  it("autorise si l'utilisateur est le propriétaire de la ressource", () => {
    const req = { user: { Id: 5, AdresseEmail: "user@test.fr" }, params: { id: "5" } };
    const res = mockRes();
    const next = vi.fn();

    isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("autorise si l'utilisateur est admin (email reconnu)", () => {
    const req = { user: { Id: 99, AdresseEmail: "admin@adopty.fr" }, params: { id: "5" } };
    const res = mockRes();
    const next = vi.fn();

    isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("retourne 403 si ni propriétaire ni admin", () => {
    const req = { user: { Id: 10, AdresseEmail: "inconnu@test.fr" }, params: { id: "5" } };
    const res = mockRes();
    const next = vi.fn();

    isOwnerOrAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test du middleware socketAuth
// Ce middleware authentifie les connexions Socket.IO (chat en temps réel).
// ─────────────────────────────────────────────────────────────────────────────
describe("socketAuth — authentification Socket.IO", () => {
  it("appelle next(Error) si aucun userId n'est fourni", async () => {
    const socket = { handshake: { auth: {} } };
    const next = vi.fn();

    await socketAuth(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("appelle next(Error) si l'utilisateur est introuvable en base", async () => {
    getUtilisateurByClerkId.mockResolvedValue(null);
    const socket = { handshake: { auth: { userId: "clerk_inconnu" } } };
    const next = vi.fn();

    await socketAuth(socket, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("attache socket.user et appelle next() sans erreur si userId valide", async () => {
    const fakeUser = { Id: 1, Nom: "Alice" };
    getUtilisateurByClerkId.mockResolvedValue(fakeUser);
    const socket = { handshake: { auth: { userId: "clerk_abc" } } };
    const next = vi.fn();

    await socketAuth(socket, next);

    expect(socket.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith(); // appelé sans argument = succès
  });
});
