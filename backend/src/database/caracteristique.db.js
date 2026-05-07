import { db } from "../config/db.js";
import { Caracteristique } from "../modeles/caracteristique.model.js";

export const createCaracteristique = async (caracteristique) => {
    const [result] = await db.query(
        `INSERT INTO caracteristique (IdAnimal, IdRace, Nom, Description) 
        VALUES (?, ?, ?, ?)`,
        [
            caracteristique.IdAnimal,
            caracteristique.IdRace,
            caracteristique.Nom,
            caracteristique.Description
        ]
    );

    return result.insertId;
}

export const getAllCaracteristiques = async () => {
  const [rows] = await db.query("SELECT * FROM caracteristique");
  return rows.map(row => new Caracteristique(row));
};

export const getCaracteristiqueById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM caracteristique WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Caracteristique(rows[0]);
};

export const updateCaracteristique = async (id, caracteristique) => {
  const [result] = await db.query(
    `UPDATE caracteristique SET  
      IdAnimal = ?,
      IdRace = ?,
      Nom = ?,
      Description = ?

     WHERE Id = ?`,
    [
      caracteristique.IdAnimal,
      caracteristique.IdRace,
      caracteristique.Nom,
      caracteristique.Description,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteCaracteristique = async (id) => {
  const [result] = await db.query(
    "DELETE FROM caracteristique WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getCaracteristiquesByAnimalId = async (animalId) => {
  const [rows] = await db.query(
    "SELECT * FROM caracteristique WHERE IdAnimal = ? AND IdRace IS NULL",
    [animalId]
  );
  return rows.map(row => new Caracteristique(row));
};

export const getCaracteristiquesByRaceId = async (raceId) => {
  const [rows] = await db.query(
    "SELECT * FROM caracteristique WHERE IdRace = ? AND IdAnimal IS NULL",
    [raceId]
  );
  return rows.map(row => new Caracteristique(row));
};

