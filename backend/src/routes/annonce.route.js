import { Router } from "express";
import * as annonce from "../controlleurs/annonce.controlleur.js"
import { protectRoute, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture (publiques)
router.get("/type_service/:TypeService", annonce.getTypeServiceOfAnnonceControlleur);
router.get("/animal/:Animal", annonce.getAnimalOfAnnonceControlleur);
router.get("/utilisateur/:Utilisateur", annonce.getUtilisateurOfAnnonceControlleur);
router.get("/statut/:Statut", annonce.getStatutOfAnnonceControlleur);

// Routes protégées - création, modification, suppression (utilisateurs authentifiés)
router.post("/", protectRoute, annonce.createAnnonceControlleur);
router.put("/:id", protectRoute, isOwnerOrAdmin, annonce.updateAnnonceControlleur);
router.delete("/:id", protectRoute, isOwnerOrAdmin, annonce.deleteAnnonceControlleur);

// Routes de lecture (publiques pour annonces)
router.get("/:id", annonce.getAnnonceControlleur);
router.get("/", annonce.getAllAnnoncesControlleur);



export default router;