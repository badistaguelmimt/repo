import cloudinary from "../config/cloudinary.js"
import { Animal } from "../modeles/animal.model.js";
import { createAnimal } from "../database/animal.db.js";
import { createPhotoAnimal } from "../database/photo.db.js";
//
// pur IMENE les controlleurs sont simples , c'est une func[try[ramene les infos (req.body), vois si elles sont intactes, fait des operations sur eles , met les dans une requete et ship le tout , retourn le status (reponse serveur)]catch(error)[console.log("erreur (son type)", error), retourne une erreur de serveur intern (code : 500)]
// et c'est tout , un jeu d'enfant vraiment , bonne chance.
//

//
// les trucs d'animaux    - rien n'est places
//

export async function createAnimalControlleur(req,res) {
    try {
        //sort les infos de la requete
        const { Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race} = req.body;

        // verif les infos
        if(!Nom || !Age || !Genre || !Race){
            return res.status(400).json({ message: "Le strict minimun en information est requis! "});
        }

        // verif si pas de photo
        if(!req.files || req.files.length === 0){
            return res.status(400).json({ message: "une photo au minimun est requise" });
        }

        // si on veux limiteur le nombre de photos 
        /*
        if(req.files.length> 3){
            return res.status(400).json({ message: "Un maximum de 3 photos sont permises"});
        }
        */

        // les upload vers cloudinary
        const uploadPromises = req.files.map((file) => {
            return cloudinary.uploader.upload(file.path, {
                folder: "adopty-animals",
            });
        });

        // les reponces des promesses
        const uploadResults = await Promise.all(uploadPromises);

        // les urls ou sont les photos
        const imageUrls = uploadResults.map((result) => result.secure_url);

        // creation de l'animal dans la bdd mysql
        //const animal = new Animal(req.body);

        const requete = await createAnimal({
                        Nom,
                        Prenom,
                        Age,
                        Genre,
                        Poids,
                        Taille,
                        Couleur,
                        EtatSantee,
                        Sterilise,
                        Temperament,
                        NiveauEnergetique,
                        SociableEnfant,
                        SociableAnimaux,
                        Statut,
                        Race
        });
        // const newAnimalId = await createAnimal({
        //     Nom,
        //     Prenom,
        //     Age,
        //     Genre,
        //     Poids,
        //     Taille,
        //     Couleur,
        //     EtatSantee,
        //     Sterilise,
        //     Temperament,
        //     NiveauEnergetique,
        //     SociableEnfant,
        //     SociableAnimaux,
        //     Statut,
        //     Race,
        //     ImageUrls: imageUrls
        // });

        // Création photos
        await Promise.all(
        imageUrls.map(url => createPhotoAnimal({
            IdAnimal: newAnimalId,
            Url: url
        }))
        );

        res.status(201).json({ message: "Animal crée avec succès", id: requete });

    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAnimal(req,res) {
    try {
        const { id } = req.params;
        const animal = await getAnimalById(id);
        if (!animal) {
            return res.status(404).json({ message: "Animal non trouvé" });
        }
        await deleteAnimalById(id);
        res.status(200).json({ message: "Animal supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateAnimal(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAnimal(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAnimals(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

//
// les trucs de comptes    - rien n'est places
//

export async function createAccount(req,res) {// pas utilisable je crois
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateAccount(req,res) {// just la au cas ou 
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteAccount(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAccount(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllAccounts(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

//
// les trucs de produits    - rien n'est places
//

export async function createProduct(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function updateProduct(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteProduct(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getProduct(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllProducts(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

//
// les trucs de refuges    - rien n'est places
//

export async function createRefuge(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export async function updateRefuge(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function deleteRefuge(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getRefuge(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

export async function getAllRefuges(req,res) {
    try {
        
    } catch (error) {
        console.error("Erreur lors de la création de l'animal:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}