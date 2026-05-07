import { db } from "../config/db.js";
import { Animal } from "../modeles/animal.model.js";
import { Vaccin } from "../modeles/vaccin.model.js";
import { Refuge } from "../modeles/refuge.model.js";

// pour tout les fichiers requetes
// TODO: add pagination
// TODO: validate input
// TODO: handle transactions

export const createAnimal = async (animal) => {
    const [result] = await db.query(
        `INSERT INTO animal (Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race, Date_ajout) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, Now())`,
        [
            animal.Nom,
            animal.Prenom,
            animal.Age,
            animal.Genre,
            animal.Poids,
            animal.Taille,
            animal.Couleur,
            animal.EtatSantee,
            animal.Sterilise,
            animal.Temperament,
            animal.NiveauEnergetique,
            animal.SociableEnfant,
            animal.SociableAnimaux,
            animal.Statut,    //      <= bizzare
            animal.Race,
            //animal.Date_ajout
        ]
    );

    return result.insertId;
}

export const getAllAnimals = async () => {
  const [rows] = await db.query(`
    SELECT a.*,
      r.Nom    AS RaceNom,
      e.Nom    AS EspeceNom,
      ref.Nom  AS RefugeNom,
      (SELECT Url FROM photo WHERE IdAnimal = a.Id LIMIT 1) AS photo
    FROM animal a
    LEFT JOIN race r    ON a.Race   = r.Id
    LEFT JOIN espece e  ON r.Espece = e.Id
    LEFT JOIN possession p   ON p.IdAnimal = a.Id AND p.IdRefuge IS NOT NULL
    LEFT JOIN refuge ref     ON ref.Id = p.IdRefuge
  `);
  return rows.map(row => {
    const animal = new Animal(row);
    animal.photo     = row.photo;
    animal.RaceNom   = row.RaceNom;
    animal.EspeceNom = row.EspeceNom;
    animal.RefugeNom = row.RefugeNom;
    return animal;
  });
};

export const getAnimalById = async (id) => {
  const [rows] = await db.query(
    `SELECT a.*,
      r.Nom    AS RaceNom,
      e.Nom    AS EspeceNom,
      ref.Nom  AS RefugeNom,
      (SELECT Url FROM photo WHERE IdAnimal = a.Id LIMIT 1) AS photo
    FROM animal a
    LEFT JOIN race r    ON a.Race   = r.Id
    LEFT JOIN espece e  ON r.Espece = e.Id
    LEFT JOIN possession p   ON p.IdAnimal = a.Id AND p.IdRefuge IS NOT NULL
    LEFT JOIN refuge ref     ON ref.Id = p.IdRefuge
    WHERE a.Id = ?`,
    [id]
  );

  if (!rows[0]) return null;

  const animal = new Animal(rows[0]);
  animal.photo     = rows[0].photo;
  animal.RaceNom   = rows[0].RaceNom;
  animal.EspeceNom = rows[0].EspeceNom;
  animal.RefugeNom = rows[0].RefugeNom;
  return animal;
};

export const updateAnimal = async (id, animal) => {
  const [result] = await db.query(
    `UPDATE animal SET 
      Nom = ?, 
      Prenom = ?, 
      Age = ?, 
      Genre = ?, 
      Poids = ?, 
      Taille = ?, 
      Couleur = ?, 
      EtatSantee = ?, 
      Sterilise = ?, 
      Temperament = ?, 
      NiveauEnergetique = ?, 
      SociableEnfant = ?, 
      SociableAnimaux = ?, 
      Statut = ?, 
      Race = ? 
      
     WHERE Id = ?`,
    [
      animal.Nom,
      animal.Prenom,
      animal.Age,
      animal.Genre,
      animal.Poids,
      animal.Taille,
      animal.Couleur,
      animal.EtatSantee,
      animal.Sterilise,
      animal.Temperament,
      animal.NiveauEnergetique,
      animal.SociableEnfant,
      animal.SociableAnimaux,
      animal.Statut,    //      <= bizzare
      animal.Race,
      //animal.Date_ajout,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteAnimal = async (id) => {
  const [result] = await db.query(
    "DELETE FROM animal WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

//
//  special requests
//

export const getAnimalVaccinsById = async (id) => {
    const [rows] = await db.query(
        `SELECT v.*
         FROM vaccin_animal va
         JOIN vaccins v ON va.IdVaccin = v.Id
         WHERE va.IdAnimal = ?;`,
         [
            id
         ]
    );

    return rows.map(row => new Vaccin(row));
}

export const addVaccinToAnimalByIds = async (vaccinId, animalId) => {
    const [result] = await db.query(
        `INSERT INTO vaccin_animal (IdVaccin,IdAnimal)
        VALUES(?, ?)`,
        [
            vaccinId,
            animalId
        ]
    );

    return result.insertId;
}

export const removeVaccinToAnimalByIds = async (vaccinId, animalId) => {
    const [result] = await db.query(
        `DELETE FROM vaccin_animal 
        WHERE IdVaccin =? AND IdAnimal = ?`,
        [
            vaccinId,
            animalId
        ]
    );

    return result.affectedRows;
}
export const getAnimalRefuge = async (animalId) => {
    const [rows] = await db.query(
        'SELECT r.* FROM refuge r JOIN possession p ON r.Id = p.IdRefuge WHERE p.IdAnimal = ? AND p.IdRefuge IS NOT NULL',
        [animalId]
    );

    if (!rows[0]) return null;
    return new Refuge(rows[0]);
};

export const getAnimalsByRefugeId = async (refugeId) => {
    const [rows] = await db.query(
        `SELECT a.*, p.IdRefuge,
         (SELECT Url FROM photo WHERE IdAnimal = a.Id LIMIT 1) as photo
         FROM animal a
         JOIN possession p ON p.IdAnimal = a.Id
         WHERE p.IdRefuge = ?`,
        [refugeId]
    );
    return rows.map(row => {
        const animal = new Animal(row);
        return { ...animal, IdRefuge: row.IdRefuge, photo: row.photo };
    });
};

