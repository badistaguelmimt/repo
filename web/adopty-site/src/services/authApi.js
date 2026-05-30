import { endpoints } from "../lib/endpoints";
import { apiAuthRequest } from "../lib/http";

// Récupère le profil d'un utilisateur par son identifiant Clerk
export const getUtilisateurByClerkId = async (clerkId) => {
    return apiAuthRequest(endpoints.utilisateurByClerkId(clerkId));
};

// Synchronise le profil de l'utilisateur connecté avec notre base de données.
// Appelé au démarrage de l'application après la connexion Clerk.
export const bootstrapCurrentUtilisateur = async (payload = {}) => {
    const config = {
        url: endpoints.utilisateurBootstrap,
        method: "post",
        data: payload,
        timeout: 30000, // Bootstrap peut être lent (cold start TiDB + plusieurs opérations DB)
    };

    // Si un token est fourni explicitement, on court-circuite l'intercepteur automatique
    // pour gérer les cas où Clerk n'a pas encore propagé le token
    if (payload.token) {
        config.headers = { Authorization: `Bearer ${payload.token}` };
    }

    return apiAuthRequest(config);
};

export const getUtilisateurAnimaux = async (utilisateurId) => {
    return apiAuthRequest(endpoints.utilisateurAnimaux(utilisateurId));
};

export const updateUtilisateurProfil = async (utilisateurId, data) => {
    return apiAuthRequest({
        url: endpoints.utilisateurById(utilisateurId),
        method: 'put',
        data,
    });
};

export const getMesAnimauxPersonnels = async (utilisateurId) => {
    return apiAuthRequest(endpoints.utilisateurAnimaux(utilisateurId));
};

export const addAnimalPersonnel = async (utilisateurId, animalId) => {
    return apiAuthRequest({
        url: `/api/utilisateurs/animal/${utilisateurId}/${animalId}`,
        method: 'post',
    });
};

export const removeAnimalPersonnel = async (utilisateurId, animalId) => {
    return apiAuthRequest({
        url: `/api/utilisateurs/animal/${utilisateurId}/${animalId}`,
        method: 'delete',
    });
};

export const getUtilisateurRefuges = async (utilisateurId) => {
    return apiAuthRequest(endpoints.utilisateurRefuges(utilisateurId));
};

export const getUtilisateurRoles = async (utilisateurId) => {
    return apiAuthRequest(endpoints.utilisateurRoles(utilisateurId));
};

export const getCommandes = async () => {
    return apiAuthRequest(endpoints.commandes);
};

export const getReservations = async () => {
    return apiAuthRequest(endpoints.reservations);
};

// Gestion des animaux (Refuge / Admin)
export const createAnimal = async (formData) => {
    return apiAuthRequest({
        url: endpoints.animaux,
        method: "post",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const updateAnimal = async (id, animalData) => {
    return apiAuthRequest({ url: endpoints.animalById(id), method: "put", data: animalData });
};

export const deleteAnimal = async (id) => {
    return apiAuthRequest({ url: endpoints.animalById(id), method: "delete" });
};

// Gestion des produits (Refuge / Admin)
export const createProduit = async (produitData) => {
    return apiAuthRequest({ url: endpoints.produits, method: "post", data: produitData });
};

export const updateProduit = async (id, produitData) => {
    return apiAuthRequest({ url: endpoints.produitById(id), method: "put", data: produitData });
};

export const deleteProduit = async (id) => {
    return apiAuthRequest({ url: endpoints.produitById(id), method: "delete" });
};

// Gestion du profil prestataire
export const createPrestataireProfile = async (profileData) => {
    return apiAuthRequest({ url: endpoints.prestataires, method: "post", data: profileData });
};

export const updatePrestataireProfile = async (id, profileData) => {
    return apiAuthRequest({ url: endpoints.prestataireById(id), method: "put", data: profileData });
};

export const getMyPrestataireProfile = async () => {
    return apiAuthRequest({ url: "/api/profil_prestataires/mine", method: "get" });
};

export const getMyPrestataireReservations = async () => {
    return apiAuthRequest({ url: "/api/profil_prestataires/mine/reservations", method: "get" });
};

// Gestion des réservations
export const createReservation = async (data) => {
    return apiAuthRequest({ url: "/api/reservations", method: "post", data });
};

export const cancelReservation = async (id) => {
    return apiAuthRequest({
        url: `/api/reservations/${id}/status`,
        method: "put",
        data: { Statut: "Annulée" },
    });
};

export const updateReservationStatusAsPrestataire = async (id, status) => {
    return apiAuthRequest({
        url: `/api/reservations/${id}/status`,
        method: "put",
        data: { Statut: status },
    });
};

export const getMyReservations = async () => {
    return apiAuthRequest({ url: "/api/reservations/mine", method: "get" });
};

// Gestion des disponibilités (calendrier prestataire)
export const createDisponibilite = async (dispoData) => {
    return apiAuthRequest({ url: "/api/disponibilites", method: "post", data: dispoData });
};

export const updateDisponibilite = async (id, dispoData) => {
    return apiAuthRequest({ url: `/api/disponibilites/${id}`, method: "put", data: dispoData });
};

export const deleteDisponibilite = async (id) => {
    return apiAuthRequest({ url: `/api/disponibilites/${id}`, method: "delete" });
};

// Vue refuge : toutes les réservations reçues pour ses services
/**
 * Récupère les disponibilités d'un profil prestataire.
 * Utilisé dans le Dashboard Prestataire pour afficher les vrais créneaux depuis la BDD.
 *
 * @param {number|string} profilId - L'id du profil prestataire (myProfile.Id)
 */
export const getDisponibilitesByProfil = async (profilId) => {
    return apiAuthRequest({ url: `/api/disponibilites/profil_prestataire/${profilId}`, method: 'get' }).catch(() => []);
};

export const getRefugeReservations = async () => {
    return apiAuthRequest({ url: "/api/reservations/refuge/all", method: "get" });
};

export const updateReservationStatus = async (id, status) => {
    return apiAuthRequest({
        url: `/api/reservations/${id}`,
        method: "put",
        data: { Statut: status },
    });
};

// Vue refuge : toutes les sous-commandes de ses produits
export const getRefugeOrders = async () => {
    return apiAuthRequest({ url: "/api/sous_commandes/refuge/all", method: "get" });
};

export const updateOrderStatus = async (id, status) => {
    return apiAuthRequest({
        url: `/api/sous_commandes/${id}/status`,
        method: "put",
        data: { Statut: status },
    });
};

// Administration
export const verifyRefuge = async (id, status) => {
    return apiAuthRequest({ url: `/api/refuges/${id}/verify`, method: "put", data: { status } });
};

export const resolveSignalement = async (id, status) => {
    return apiAuthRequest({
        url: `/api/signalements/${id}/resolve`,
        method: "put",
        data: { statut: status },
    });
};

export const getAllUsers = async () => {
    return apiAuthRequest({ url: "/api/utilisateurs", method: "get" });
};

export const banUser = async (id) => {
    return apiAuthRequest({ url: `/api/utilisateurs/${id}/ban`, method: "put" });
};

// Stats réelles pour le dashboard admin (vraies requêtes COUNT en BDD)
export const getAdminStats = async () => {
    return apiAuthRequest({ url: "/api/utilisateurs/admin/stats", method: "get" });
};

// Historique des commandes de l'utilisateur connecté
export const getMyOrders = async (userId) => {
    return apiAuthRequest({ url: `/api/commandes/utilisateur/${userId}`, method: "get" });
};

// Demandes d'adoption
export const createDemandeAdoption = async (data) => {
    return apiAuthRequest({ url: "/api/demandes-adoption", method: "post", data });
};

export const getMesDemandesAdoption = async () => {
    return apiAuthRequest({ url: "/api/demandes-adoption/mes-demandes", method: "get" });
};

export const getRefugeDemandesAdoption = async () => {
    return apiAuthRequest({ url: "/api/demandes-adoption/refuge", method: "get" });
};

export const updateDemandeAdoptionStatut = async (id, statut, commentaire) => {
    return apiAuthRequest({
        url: `/api/demandes-adoption/${id}/statut`,
        method: "put",
        data: { Statut: statut, CommentaireRetour: commentaire },
    });
};

export const annulerDemandeAdoption = async (id) => {
    return apiAuthRequest({ url: `/api/demandes-adoption/${id}`, method: "delete" });
};

// Signalements
export const createSignalementApi = async (data) => {
    return apiAuthRequest({ url: "/api/signalements", method: "post", data });
};

export const getMesSignalements = async () => {
    return apiAuthRequest({ url: "/api/signalements/mes-signalements", method: "get" });
};

// Checkout : passer une commande complète (panier → commande simulée)
export const placeOrder = async ({ adresseLivraison, items }) => {
    return apiAuthRequest({
        url: "/api/checkout",
        method: "post",
        data: { adresseLivraison, items },
    });
};

export const getMesCommandes = async () => {
    return apiAuthRequest({ url: "/api/checkout/mes-commandes", method: "get" });
};

export const getCommandeDetail = async (commandeId) => {
    return apiAuthRequest({ url: `/api/checkout/${commandeId}`, method: "get" });
};

// ─────────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────────

/** Récupère la wishlist d'un utilisateur backend (ou null si aucune) */
export const getWishlistByUtilisateur = async (utilisateurId) => {
    return apiAuthRequest({ url: `/api/wishlist/utilisateur/${utilisateurId}`, method: "get" }).catch(() => null);
};

/** Crée une wishlist vide pour l'utilisateur connecté */
export const createWishlistForUser = async () => {
    return apiAuthRequest({ url: "/api/wishlist", method: "post", data: {} });
};

/** Récupère les lignes (produits) d'une wishlist */
export const getWishlistLines = async (wishlistId) => {
    return apiAuthRequest({ url: `/api/ligne_wishlist/wishlist/${wishlistId}`, method: "get" }).catch(() => []);
};

/** Ajoute un produit à une wishlist */
export const addLigneWishlist = async (wishlistId, produitId) => {
    return apiAuthRequest({ url: "/api/ligne_wishlist", method: "post", data: { IdWishlist: wishlistId, IdProduit: produitId } });
};

/** Supprime une ligne de la wishlist */
export const removeLigneWishlist = async (ligneId) => {
    return apiAuthRequest({ url: `/api/ligne_wishlist/${ligneId}`, method: "delete" });
};

// ─────────────────────────────────────────────
// Messagerie (Conversations & Messages)
// ─────────────────────────────────────────────

/** Récupère toutes les conversations de l'utilisateur backend courant */
export const getConversationsByUtilisateur = async (utilisateurId) => {
    return apiAuthRequest({ url: `/api/conversations/by_utilisateur/${utilisateurId}`, method: "get" }).catch(() => []);
};

/** Crée une nouvelle conversation privée entre deux utilisateurs */
export const createConversation = async (data) => {
    return apiAuthRequest({ url: "/api/conversations", method: "post", data });
};

/** Trouve ou crée une conversation directe avec un utilisateur cible */
export const findOrCreateDirectConversation = async (targetUserId) => {
    return apiAuthRequest({ url: "/api/conversations/direct", method: "post", data: { targetUserId } });
};

/** Récupère les messages d'une conversation */
export const getMessagesByConversation = async (conversationId) => {
    return apiAuthRequest({ url: `/api/messages/conversation/messages/${conversationId}`, method: "get" }).catch(() => []);
};

// ─────────────────────────────────────────────
// Demandes de Transfert (inter-refuges)
// ─────────────────────────────────────────────

/** Crée une demande de transfert d'animal entre deux refuges */
export const createDemandeTransfert = async (data) => {
    return apiAuthRequest({ url: "/api/demandes-transfert", method: "post", data });
};

/** Liste toutes les demandes de transfert (admin) */
export const getAllDemandesTransfert = async () => {
    return apiAuthRequest({ url: "/api/demandes-transfert", method: "get" });
};

/** Récupère une demande de transfert par ID */
export const getDemandeTransfertById = async (id) => {
    return apiAuthRequest({ url: `/api/demandes-transfert/${id}`, method: "get" });
};

/** Récupère les demandes de transfert émises par un refuge (départ) */
export const getDemandesTransfertByRefugeDepart = async (refugeId) => {
    return apiAuthRequest({
        url: `/api/demandes-transfert/demandes_refuge_depart/${refugeId}/${refugeId}`,
        method: "get",
    });
};

/** Récupère les demandes de transfert reçues par un refuge (cible) */
export const getDemandesTransfertByRefugeCible = async (refugeId) => {
    return apiAuthRequest({
        url: `/api/demandes-transfert/demandes_refuge_cible/${refugeId}/${refugeId}`,
        method: "get",
    });
};

/** Met à jour le statut d'une demande de transfert (accepter / refuser) */
export const updateDemandeTransfertStatut = async (id, refugeId, { Statut, CommentaireRetour }) => {
    return apiAuthRequest({
        url: `/api/demandes-transfert/demandes/statut/${id}/${refugeId}`,
        method: "patch",
        data: { Statut, CommentaireRetour },
    });
};

/** Supprime une demande de transfert */
export const deleteDemandeTransfert = async (id, refugeId) => {
    return apiAuthRequest({
        url: `/api/demandes-transfert/${id}/${refugeId}`,
        method: "delete",
    });
};

