import { endpoints } from "../lib/endpoints";
import { apiRequest, apiAuthRequest } from "../lib/http";

// Données accessibles sans authentification (liste publique)

export const getAnimaux = async (config = {}) => {
    return apiRequest(endpoints.animaux, config);
};

export const getAnimalById = async (id) => {
    return apiRequest(endpoints.animalById(id));
};

export const getRefuges = async () => {
    return apiRequest(endpoints.refuges);
};

export const getRefugeById = async (id) => {
    return apiRequest(endpoints.refugeById(id));
};

export const getProduits = async () => {
    return apiRequest(endpoints.produits);
};

export const getPrestataires = async () => {
    return apiRequest(endpoints.prestataires);
};

// Les signalements nécessitent une connexion car ils contiennent des données sensibles
export const getSignalements = async () => {
    return apiAuthRequest(endpoints.signalements);
};

export const getAnnonces = async () => {
    return apiRequest(endpoints.annonces);
};

export const getAnimauxByRefuge = async (refugeId) => {
    return apiRequest(`/api/animaux/refuge/${refugeId}`);
};

export const getProduitsByRefuge = async (refugeId) => {
    return apiRequest(`/api/produits/par-refuge/${refugeId}`);
};

export const getRaces = async () => {
    return apiRequest(endpoints.races);
};

export const updateRace = async (id, data) => {
    return apiRequest(`${endpoints.races}/${id}`, { method: "PUT", data });
};

export const getStatuts = async () => {
    return apiRequest(endpoints.statuts);
};

export const getProduitById = async (id) => {
    return apiRequest(endpoints.produitById(id));
};

export const getProduitPhotos = async (id) => {
    return apiRequest(`${endpoints.produits}/${id}/photos`);
};

export const getProduitMateriaux = async (id) => {
    return apiRequest(`${endpoints.produits}/materiaux/${id}`);
};

// ── Disponibilités prestataire (lecture publique) ─────────────────────────────

/**
 * Récupère les disponibilités d'un profil prestataire (route publique, sans auth).
 * Utilisé par la page ProfilPrestataire visible de tous les visiteurs.
 */
export const getDisponibilitesByProfil = async (profilId) => {
    return apiRequest(endpoints.disponibilitesByProfil(profilId)).catch(() => []);
};

