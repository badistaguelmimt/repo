import { db } from "../config/db.js";
import { Photo } from "../modeles/photo.model.js";

export const createPhotoUtilisateur = async (photo) => {
    const [result] = await db.query(
        "INSERT INTO photo (IdUtilisateur,IdProduit,IdRefuge,IdAnimal,Url) values(?, NULL, Null, Null, ?)",
        [
            photo.IdUtilisateur,
            photo.Url
        ]
    );

    return result.insertId;
}

export const createPhotoRefuge = async (photo) => {
    const [result] = await db.query(
        "INSERT INTO photo (IdUtilisateur,IdProduit,IdRefuge,IdAnimal,Url) values(Null, NULL, ?, Null, ?)",
        [
            photo.IdRefuge,
            photo.Url
        ]
    );

    return result.insertId;
}

export const createPhotoAnimal = async (photo) => {
    const [result] = await db.query(
        "INSERT INTO photo (IdUtilisateur,IdProduit,IdRefuge,IdAnimal,Url) values(NULL, NULL, Null, ?, ?)",
        [
            photo.IdAnimal,
            photo.Url
        ]
    );

    return result.insertId;
}

export const createPhotoRace = async (photo) => {
    // Note: La colonne IdRace semble manquante dans la table photo. 
    // Si elle est ajoutée plus tard, décommentez ou adaptez.
    return null;
}

export const createPhotoProduit = async (photo) => {
    const [result] = await db.query(
        "INSERT INTO photo (IdUtilisateur,IdProduit,IdRefuge,IdAnimal,Url) values(NULL, ?, Null, NULL, ?)",
        [
            photo.IdProduit,
            photo.Url
        ]
    );

    return result.insertId;
}

export const getAllPhotos = async () => {
  const [rows] = await db.query("SELECT * FROM photo");//    <= bizzare mais drole
  return rows.map(row => new Photo(row));
};

export const getPhotoById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM photo WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Photo(rows[0]);
};

export const updatePhoto = async (id, photo) => {
  const [result] = await db.query(
    `UPDATE photo SET 
      IdUtilisateur = ?, 
      IdRefuge = ?, 
      IdAnimal = ?, 
      Url = ?
     WHERE Id = ?`,
    [
      photo.IdUtilisateur,
      photo.IdRefuge,
      photo.IdAnimal,
      photo.Url,
      id
    ]
  );

  return result.affectedRows;
};

export const deletePhoto = async (id) => {
  const [result] = await db.query(
    "DELETE FROM photo WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

//
// requetes speciales
//

export const getUtilisateurPhotosById = async (id) => {
    const [rows] = await db.query(`
        SELECT * FROM photo 
        WHERE IdUtilisateur = ?`,
    [
        id
    ]);

    return rows.map(row => new Photo(row));
}

export const getRefugePhotosById = async (id) => {
    const [rows] = await db.query(`
        SELECT * FROM photo 
        WHERE IdRefuge = ?`,
    [
        id
    ]);

    return rows.map(row => new Photo(row));
}

export const getAnimalPhotosById = async (id) => {
    const [rows] = await db.query(`
        SELECT * FROM photo 
        WHERE IdAnimal = ?`,
    [
        id
    ]);

    return rows.map(row => new Photo(row));
}

export const getProduitPhotosById = async (id) => {
    const [rows] = await db.query(`
        SELECT * FROM photo 
        WHERE IdProduit = ?`,
    [
        id
    ]);

    return rows.map(row => new Photo(row));
}

export const getRacePhotosById = async (id) => {
    const [rows] = await db.query(`
        SELECT * FROM photo 
        WHERE IdRace = ?`,
    [
        id
    ]);

    return rows.map(row => new Photo(row));
}

//  normalement on a pas besoin d'autres requetes speciale todo:(enleve ce commentaire a la fin du projet)