// Centralise tous les endpoints de l'API backend.
// Modifier une URL ici suffit à la propager partout dans l'application.
export const endpoints = {
    animaux: "/api/animaux",
    animalById: (id) => `/api/animaux/${id}`,

    refuges: "/api/refuges",
    refugeById: (id) => `/api/refuges/${id}`,

    produits: "/api/produits",
    produitById: (id) => `/api/produits/${id}`,

    prestataires: "/api/profil_prestataires",
    prestataireById: (id) => `/api/profil_prestataires/${id}`,

    signalements: "/api/signalements",
    annonces: "/api/annonces",

    utilisateurBootstrap: "/api/utilisateurs/bootstrap",
    utilisateurByClerkId: (clerkId) => `/api/utilisateurs/clerk/${clerkId}`,
    utilisateurAnimaux: (id) => `/api/utilisateurs/animaux/${id}`,
    utilisateurRefuges: (id) => `/api/utilisateurs/refuges/${id}`,
    utilisateurRoles: (id) => `/api/utilisateurs/roles/${id}`,

    commandes: "/api/commandes",
    reservations: "/api/reservations",
    races: "/api/races",
    statuts: "/api/statuts",

    // Disponibilités prestataires
    disponibilites: "/api/disponibilites",
    disponibiliteById: (id) => `/api/disponibilites/${id}`,
    disponibilitesByProfil: (profilId) => `/api/disponibilites/profil_prestataire/${profilId}`,
};
