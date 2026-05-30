import axios from "axios";

// URL de base de l'API backend. En développement, pointe vers localhost:3000.
// En production, Vite remplace VITE_API_URL par l'URL du serveur déployé.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let tokenGetter = null;

// Instance Axios partagée dans toute l'application
export const http = axios.create({
    baseURL,
    timeout: 20000, // 20s — TiDB Cloud peut avoir des cold starts lents
});

// Permet à main.jsx d'injecter la fonction de récupération du token Clerk.
// Cela évite de coupler ce module à Clerk directement.
export const setAuthTokenGetter = (getter) => {
    tokenGetter = typeof getter === "function" ? getter : null;
};

const resolveAuthToken = async () => {
    if (!tokenGetter) return null;
    try {
        return await tokenGetter();
    } catch {
        return null;
    }
};

// Intercepteur automatique : ajoute le token Bearer sur toutes les requêtes
// si un tokenGetter est disponible et que le header n'est pas déjà renseigné.
http.interceptors.request.use(async (config) => {
    if (!tokenGetter || config.headers?.Authorization) return config;

    const token = await resolveAuthToken();
    if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
});

// Accepte soit une URL (string), soit un objet de config Axios directement
const toRequestConfig = (input, config = {}) => {
    if (typeof input === "string") return { ...config, url: input };
    return { ...input };
};

// Requête publique (sans token). Utilisée pour les données accessibles sans connexion.
export const apiRequest = async (input, config = {}) => {
    const requestConfig = toRequestConfig(input, config);
    const response = await http.request(requestConfig);
    if (!response.data && response.status === 204) return null;
    return response.data;
};

// Requête authentifiée. Attache le token Clerk dans le header Authorization.
export const apiAuthRequest = async (input, config = {}) => {
    const requestConfig = toRequestConfig(input, config);
    const headers = { ...(requestConfig.headers || {}) };

    // Ne résout le token que si le header n'est pas déjà fourni (évite le double appel)
    if (!headers.Authorization) {
        const token = await resolveAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await http.request({ ...requestConfig, headers });
    if (!response.data && response.status === 204) return null;
    return response.data;
};

// Normalise les erreurs Axios pour afficher un message clair dans l'UI
export const normalizeApiError = (error) => {
    if (error.response) {
        return {
            status: error.response.status,
            message: error.response.data?.message || "Erreur API",
        };
    }
    if (error.request) {
        return { status: 0, message: "Backend indisponible" };
    }
    return { status: 0, message: error.message || "Erreur inconnue" };
};
