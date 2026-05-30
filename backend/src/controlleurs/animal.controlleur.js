import cloudinary from "../config/cloudinary.js";
import { Animal } from "../modeles/animal.model.js";
import {
    createAnimal, deleteAnimal, getAllAnimals,
    getAnimalById, updateAnimal, getAnimalRefuge, getAnimalsByRefugeId,
} from "../database/animal.db.js";
import { createPhotoAnimal, getAnimalPhotosById } from "../database/photo.db.js";
import { getStatutById } from "../database/statut.db.js";
import { getRaceById } from "../database/race.db.js";
import { getCaracteristiquesByAnimalId } from "../database/caracteristique.db.js";
import { addAnimalToRefugeByIds } from "../database/refuge.db.js";
import { getUtilisateurRefugesById } from "../database/utilisateur.db.js";

// Normalise le genre reçu du formulaire ('Male'/'Femelle') vers le format BDD ('oui'/'non')
const normalizeGenre = (g) => {
    if (!g) return null;
    const v = String(g).toLowerCase();
    if (v === "oui" || v === "male" || v === "mâle") return "oui";
    if (v === "non" || v === "femelle") return "non";
    return null;
};

// Convertit les booléens du formulaire (true / 'true' / 1 / '1') en 'oui' / 'non'
const normalizeBool = (val) =>
    val === true || val === "true" || val === 1 || val === "1" ? "oui" : "non";

export async function createAnimalControlleur(req, res) {
    try {
        const {
            Nom, Prenom, Age: rawAge, Genre, Poids: rawPoids, Taille, Couleur,
            EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant,
            SociableAnimaux, Statut: rawStatut, Race: rawRace, IdRefuge: rawIdRefuge,
        } = req.body;

        const Age = parseInt(rawAge);
        const Poids = parseFloat(rawPoids);
        const Statut = parseInt(rawStatut);
        const Race = parseInt(rawRace);
        const IdRefuge = parseInt(rawIdRefuge);

        if (!Nom || isNaN(Age) || !Genre || isNaN(Race) || isNaN(IdRefuge)) {
            return res.status(400).json({ message: "Le strict minimum en information est requis (y compris l'ID du refuge et de la race)!" });
        }

        // Vérifier que l'utilisateur appartient bien à ce refuge
        const userRefuges = await getUtilisateurRefugesById(req.user.Id);
        if (!userRefuges.some((r) => r.Id === IdRefuge)) {
            return res.status(403).json({ message: "Vous n'avez pas l'autorisation d'ajouter un animal à ce refuge." });
        }

        if (Age < 0) {
            return res.status(400).json({ message: "L'âge doit être positif!" });
        }

        const dbGenre = normalizeGenre(Genre);
        if (!dbGenre) {
            return res.status(400).json({ message: "Le genre doit être 'Male' ou 'Femelle'!" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Une photo au minimum est requise" });
        }

        // Upload vers Cloudinary et récupération des URLs sécurisées
        let uploadResults;
        try {
            uploadResults = await Promise.all(
                req.files.map((file) => cloudinary.uploader.upload(file.path, { folder: "adopty-animals" }))
            );
        } catch (error) {
            console.error("Erreur Cloudinary:", error);
            return res.status(500).json({ message: "Erreur lors de l'upload des images" });
        }

        const imageUrls = uploadResults.map((r) => r.secure_url);

        const dbSterilise = normalizeBool(Sterilise);
        const dbSociableEnfant = normalizeBool(SociableEnfant);
        const dbSociableAnimaux = normalizeBool(SociableAnimaux);
        const dbTaille = isNaN(Poids) ? 50 : parseFloat(Taille) || 50;

        const newId = await createAnimal({
            Nom:               String(Nom || '').substring(0, 30),
            Prenom:            String(Prenom || Nom || '').substring(0, 1024),
            Age,
            Genre:             dbGenre,
            Poids:             isNaN(Poids) ? 0 : Poids,
            Taille:            dbTaille,
            Couleur:           String(Couleur || '').substring(0, 15),
            EtatSantee:        String(EtatSantee || 'Bon').substring(0, 15),
            Sterilise:         dbSterilise,
            Temperament:       String(Temperament || '').substring(0, 300),
            NiveauEnergetique: String(NiveauEnergetique || 'Moyen').substring(0, 15),
            SociableEnfant:    dbSociableEnfant,
            SociableAnimaux:   dbSociableAnimaux,
            Statut:            isNaN(Statut) ? 1 : Statut,
            Race,
        });

        await Promise.all(imageUrls.map((url) => createPhotoAnimal({ IdAnimal: newId, Url: url })));
        await addAnimalToRefugeByIds(newId, IdRefuge);

        res.status(201).json({ message: "Animal créé avec succès et lié au refuge", id: newId });
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur lors de la création" });
    }
}

export async function deleteAnimalControlleur(req, res) {
    try {
        const { id } = req.params;
        const animalData = await getAnimalById(id);
        if (!animalData) return res.status(404).json({ message: "Animal non trouvé" });

        // Les admins peuvent supprimer n'importe quel animal
        const isAdmin = req.user.Roles?.some(r => r.Intitule === 'Admin') ?? false;
        if (!isAdmin) {
            const animalRefuge = await getAnimalRefuge(id);
            const userRefuges = await getUtilisateurRefugesById(req.user.Id);
            if (!userRefuges.some((r) => r.Id === animalRefuge?.Id)) {
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cet animal." });
            }
        }

        await deleteAnimal(id);
        res.status(200).json({ message: "Animal supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateAnimalControlleur(req, res) {
    try {
        const { id } = req.params;
        const {
            Nom, Prenom, Age: rawAge, Genre, Poids: rawPoids, Taille, Couleur,
            EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant,
            SociableAnimaux, Statut: rawStatut, Race: rawRace,
        } = req.body;

        const Age = parseInt(rawAge);
        const Poids = parseFloat(rawPoids);
        const Statut = parseInt(rawStatut);
        const Race = parseInt(rawRace);

        const animal = await getAnimalById(id);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé" });

        // Les admins peuvent modifier n'importe quel animal
        const isAdmin = req.user.Roles?.some(r => r.Intitule === 'Admin') ?? false;
        if (!isAdmin) {
            const animalRefuge = await getAnimalRefuge(id);
            const userRefuges = await getUtilisateurRefugesById(req.user.Id);
            if (!userRefuges.some((r) => r.Id === animalRefuge?.Id)) {
                return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cet animal." });
            }
        }

        const dbGenre = normalizeGenre(Genre);
        const dbSterilise = Sterilise !== undefined ? normalizeBool(Sterilise) : undefined;
        const dbSociableEnfant = SociableEnfant !== undefined ? normalizeBool(SociableEnfant) : undefined;
        const dbSociableAnimaux = SociableAnimaux !== undefined ? normalizeBool(SociableAnimaux) : undefined;
        const dbTaille = Taille && !isNaN(parseFloat(Taille)) ? parseFloat(Taille) : undefined;

        await updateAnimal(id, {
            Nom:               String(Nom || animal.Nom || '').substring(0, 30),
            Prenom:            String(Prenom || animal.Prenom || '').substring(0, 1024),
            Age:               isNaN(Age) ? animal.Age : Age,
            Genre:             dbGenre || animal.Genre,
            Poids:             isNaN(Poids) ? animal.Poids : Poids,
            Taille:            dbTaille !== undefined ? dbTaille : animal.Taille,
            Couleur:           String(Couleur || animal.Couleur || '').substring(0, 15),
            EtatSantee:        String(EtatSantee || animal.EtatSantee || 'Bon').substring(0, 15),
            Sterilise:         dbSterilise || animal.Sterilise,
            Temperament:       String(Temperament || animal.Temperament || '').substring(0, 300),
            NiveauEnergetique: String(NiveauEnergetique || animal.NiveauEnergetique || 'Moyen').substring(0, 15),
            SociableEnfant:    dbSociableEnfant || animal.SociableEnfant,
            SociableAnimaux:   dbSociableAnimaux || animal.SociableAnimaux,
            Statut:            isNaN(Statut) ? animal.Statut : Statut,
            Race:              isNaN(Race) ? animal.Race : Race,
        });

        res.status(200).json({ message: "Animal modifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la modification de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimalControlleur(req, res) {
    try {
        const animal = await getAnimalById(req.params.id);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé" });
        res.status(200).json(animal);
    } catch (error) {
        console.error("Erreur lors de l'obtention de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAnimalsControlleur(req, res) {
    try {
        const animals = await getAllAnimals();
        res.status(200).json(animals);
    } catch (error) {
        console.error("Erreur lors de l'obtention des animaux:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getStatutOfAnimalControlleur(req, res) {
    try {
        const statut = await getStatutById(req.params.Statut);
        if (!statut) return res.status(404).json({ message: "Statut inexistant pour cet animal" });
        res.status(200).json(statut);
    } catch (error) {
        console.error("Erreur lors de l'obtention du statut de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRaceOfAnimalControlleur(req, res) {
    try {
        const race = await getRaceById(req.params.Race);
        if (!race) return res.status(404).json({ message: "Race inexistante pour cet animal" });
        res.status(200).json(race);
    } catch (error) {
        console.error("Erreur lors de l'obtention de la race de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Retourne un tableau vide si aucune photo — la route ne fait jamais de 404 sur les photos
export async function getPhotosOfAnimalControlleur(req, res) {
    try {
        const photos = await getAnimalPhotosById(req.params.id);
        res.status(200).json(photos ?? []);
    } catch (error) {
        console.error("Erreur lors de la récupération des photos:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Retourne un tableau vide si aucune caractéristique — idem
export async function getCaracteristiquesOfAnimalIdControlleur(req, res) {
    try {
        const { id } = req.params;
        const animal = await getAnimalById(id);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé" });
        const caracteristiques = await getCaracteristiquesByAnimalId(id);
        res.status(200).json(caracteristiques ?? []);
    } catch (error) {
        console.error("Erreur lors de la récupération des caractéristiques:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

// Récupère tous les animaux d'un refuge via la table de possession
export async function getAnimalsByRefugeControlleur(req, res) {
    try {
        const animaux = await getAnimalsByRefugeId(req.params.refugeId);
        res.status(200).json(animaux);
    } catch (error) {
        console.error("Erreur lors de la récupération des animaux du refuge:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
