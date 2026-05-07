import { Router } from "express";
import * as produit from "../controlleurs/produit.controlleur.js"
import { protectRoute, hasAnyRole, isOwnerOrAdmin } from "../midleware/auth.midleware.js";

const router = Router()

// Routes spéciales de lecture publiques
router.get("/materiaux/:id", produit.getMateriauxOfProduitControlleur);
router.get("/materiaux/ids/:id/:materiauxId", produit.getMateriauxOfProduitByIdsControlleur);
router.get("/refuge/:Refuge", produit.getRefugeOfProduitControlleur);
router.get("/par-refuge/:refugeId", produit.getProduitsByRefugeControlleur);
router.get("/:id/photos", produit.getPhotosOfProduitControlleur)

// Routes protégées - création, modification, suppression (refuge ou admin et propriétaire)
router.post("/materiaux/ajout/:id/:materiauxId", protectRoute, hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin, produit.addMateriauxToProduitControlleur);
router.delete("/materiaux/supprimer/:id/:materiauxId", protectRoute, hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin, produit.RemoveMateriauxFromProduitControlleur);
router.post("/", protectRoute, hasAnyRole(["Refuge", "Admin"]), produit.createProduitControlleur);
router.put("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin, produit.updateProduitControlleur);
router.delete("/:id", protectRoute, hasAnyRole(["Refuge", "Admin"]), isOwnerOrAdmin, produit.deleteProduitControlleur);

// Routes de lecture publiques
router.get("/:id", produit.getProduitControlleur);
router.get("/", produit.getAllProduitsControlleur);



export default router;