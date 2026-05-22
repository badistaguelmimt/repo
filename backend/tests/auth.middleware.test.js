import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/express", () => ({ getAuth: vi.fn() }));
vi.mock("@clerk/backend", () => ({ verifyToken: vi.fn() }));
vi.mock("../src/config/env.js", () => ({ ENV: { ADMIN_EMAIL: "admin@adopty.fr" } }));
vi.mock("../src/database/utilisateur.db.js", () => ({
  getUtilisateurByClerkId: vi.fn(),
  getUtilisateurRolesById: vi.fn(),
}));

import { getAuth } from "@clerk/express";
import { verifyToken } from "@clerk/backend";
import { getUtilisateurByClerkId, getUtilisateurRolesById } from "../src/database/utilisateur.db.js";
import { protectRoute, hasRole, adminOnly, refugeOnly, prestataireOnly, utilisateurOnly, hasAnyRole, isOwnerOrAdmin, socketAuth } from "../src/midleware/auth.midleware.js";

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("protectRoute", () => {
  it("401 si aucun token", async () => {
    getAuth.mockReturnValue({ userId: null });
    const req = { auth: { userId: null } };
    const res = mockRes();
    const next = vi.fn();
    await protectRoute[0](req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("401 si utilisateur introuvable en BDD", async () => {
    getAuth.mockReturnValue({ userId: "clerk_abc" });
    getUtilisateurByClerkId.mockResolvedValue(null);
    const req = { auth: {} };
    const res = mockRes();
    const next = vi.fn();
    await protectRoute[0](req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("appelle next() et attache req.user si token valide", async () => {
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

  it("500 en cas d'erreur inattendue", async () => {
    getAuth.mockImplementation(() => { throw new Error("crash"); });
    const req = { auth: {} };
    const res = mockRes();
    const next = vi.fn();
    await protectRoute[0](req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("hasRole", () => {
  it("true si rôle présent (insensible casse)", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Refuge" }]);
    expect(await hasRole(1, "refuge")).toBe(true);
  });

  it("false si rôle absent", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    expect(await hasRole(1, "Admin")).toBe(false);
  });

  it("false en cas d'erreur BDD", async () => {
    getUtilisateurRolesById.mockRejectedValue(new Error("DB error"));
    expect(await hasRole(1, "Admin")).toBe(false);
  });
});

describe("adminOnly", () => {
  it("autorise si email admin", async () => {
    const req = { user: { Id: 1, AdresseEmail: "admin@adopty.fr" } };
    const res = mockRes(); const next = vi.fn();
    await adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("autorise si rôle Admin en BDD", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Admin" }]);
    const req = { user: { Id: 2, AdresseEmail: "autre@test.fr" } };
    const res = mockRes(); const next = vi.fn();
    await adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 si email et rôle absents", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 3, AdresseEmail: "lambda@test.fr" } };
    const res = mockRes(); const next = vi.fn();
    await adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("401 si req.user absent", async () => {
    const req = {};
    const res = mockRes(); const next = vi.fn();
    await adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("refugeOnly", () => {
  it("autorise rôle Refuge", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Refuge" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes(); const next = vi.fn();
    await refugeOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 sans rôle Refuge", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes(); const next = vi.fn();
    await refugeOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("prestataireOnly", () => {
  it("autorise un prestataire", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Prestataire" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes(); const next = vi.fn();
    await prestataireOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 si pas prestataire", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes(); const next = vi.fn();
    await prestataireOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("utilisateurOnly", () => {
  it("autorise utilisateur standard", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes(); const next = vi.fn();
    await utilisateurOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 pour un refuge", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Refuge" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes(); const next = vi.fn();
    await utilisateurOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("hasAnyRole", () => {
  it("autorise si au moins un rôle correspond", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Refuge" }]);
    const req = { user: { Id: 1 } };
    const res = mockRes(); const next = vi.fn();
    await hasAnyRole(["Admin", "Refuge"])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 si aucun rôle ne correspond", async () => {
    getUtilisateurRolesById.mockResolvedValue([{ Nom: "Utilisateur" }]);
    const req = { user: { Id: 2 } };
    const res = mockRes(); const next = vi.fn();
    await hasAnyRole(["Admin", "Refuge"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("isOwnerOrAdmin", () => {
  it("autorise si propriétaire de la ressource", () => {
    const req = { user: { Id: 5, AdresseEmail: "user@test.fr" }, params: { id: "5" } };
    const res = mockRes(); const next = vi.fn();
    isOwnerOrAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("autorise si admin (email)", () => {
    const req = { user: { Id: 99, AdresseEmail: "admin@adopty.fr" }, params: { id: "5" } };
    const res = mockRes(); const next = vi.fn();
    isOwnerOrAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("403 si ni propriétaire ni admin", () => {
    const req = { user: { Id: 10, AdresseEmail: "hacker@evil.com" }, params: { id: "5" } };
    const res = mockRes(); const next = vi.fn();
    isOwnerOrAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("socketAuth", () => {
  it("next(error) si token absent", async () => {
    const socket = { handshake: { auth: {} } };
    const next = vi.fn();
    await socketAuth(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toContain("Token manquant");
  });

  it("next(error) si token invalide (sub null)", async () => {
    verifyToken.mockResolvedValue({ sub: null });
    const socket = { handshake: { auth: { token: "bad" } } };
    const next = vi.fn();
    await socketAuth(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toContain("invalide");
  });

  it("next(error) si utilisateur introuvable en BDD", async () => {
    verifyToken.mockResolvedValue({ sub: "clerk_xyz" });
    getUtilisateurByClerkId.mockResolvedValue(null);
    const socket = { handshake: { auth: { token: "valid" } } };
    const next = vi.fn();
    await socketAuth(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("attache socket.user et appelle next() sans erreur si valide", async () => {
    const fakeUser = { Id: 1, Nom: "Alice" };
    verifyToken.mockResolvedValue({ sub: "clerk_abc" });
    getUtilisateurByClerkId.mockResolvedValue(fakeUser);
    const socket = { handshake: { auth: { token: "valid" } } };
    const next = vi.fn();
    await socketAuth(socket, next);
    expect(socket.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });
});
