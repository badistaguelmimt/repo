import { db } from "../config/db.js";
import { Animal } from "../modeles/animal.model.js";
import { Refuge } from "../modeles/refuge.model.js";

export const CreateRefuge = async (refuge) => {
    const [result] = await db.query(
        `INSERT INTO refuge (Nom,Description,Addresse,AddresseGPS,Date_inscription,Telephone,stripeAccountId,stripeAccountStatus)
        VALUES(?,?,?,?,NOW(),?,?,?)`,
        [
            refuge.Nom,
            refuge.Description,
            refuge.Addresse,
            refuge.AddresseGPS,
            
            refuge.Telephone,
            refuge.stripeAccountId,
            refuge.stripeAccountStatus
        ]
    );

    return result.insertId;
}

export const getAllRefuges = async () => {
  const [rows] = await db.query("SELECT * FROM refuge");
  return rows.map(row => new Refuge(row));
};

export const getRefugeById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM refuge WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Refuge(rows[0]);
};

export const updateRefuge = async (id, refuge) => {
  const [result] = await db.query(
    `UPDATE refuge SET 
      Nom = ?,
      Description = ?,
      Addresse = ?,
      AddresseGPS = ?,
      
      Telephone = ?,
      stripeAccountId = ?,
      stripeAccountStatus = ?
     WHERE Id = ?`,
    [
      refuge.Nom,
      refuge.Description,
      refuge.Addresse,
      refuge.AddresseGPS,
      
      refuge.Telephone,
      refuge.stripeAccountId,
      refuge.stripeAccountStatus,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteRefuge = async (id) => {
  const [result] = await db.query(
    "DELETE FROM refuge WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

//
// requetes speciales
//

export const getRefugeAnimalsById = async (id) => {
  const [rows] = await db.query(
    `SELECT a.* FROM refuge r
     JOIN possession p ON r.Id = p.IdRefuge
     JOIN animal a ON p.IdAnimal = a.Id
     WHERE r.Id = ? AND p.IdUtilisateur IS NULL`,  //    <= c'est sous condition todo:(a surveiller)
     [
      id
     ]
  );

  return rows.map(row =>new Animal(row));
}

 //   todo : check les deux funcs juste en bas car pas fini 

export const addAnimalToRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `INSERT INTO possession (IdAnimal,IdUtilisateur,IdRefuge)
        VALUES(?, NULL, ?)`,
        [
            animalId,
            refugeId
        ]
    );

    return result.insertId;
}

export const removeAnimalFromRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `DELETE FROM possession 
        WHERE IdAnimal =? AND IdRefuge = ?`,
        [
            animalId,
            refugeId
        ]
    );

    return result.affectedRows;
}

export const setAnimalToRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `UPDATE possession SET
         IdRefuge = ?
        WHERE IdAnimal =? AND IdRefuge IS NULL AND IdUtilisateur IS NULL`,
        [
            refugeId,
            animalId,
        ]
    );

    return result.affectedRows;
}

export const unsetAnimalToRefugeByIds = async (animalId, refugeId) => {
    const [result] = await db.query(
        `UPDATE possession SET
         IdRefuge = NULL
        WHERE IdAnimal =? AND IdRefuge = ? AND IdUtilisateur IS NOT NULL`,   //    <= todo:(a voir si ca fonctionne)
        [
            animalId,
            refugeId
        ]
    );

    return result.affectedRows;
}