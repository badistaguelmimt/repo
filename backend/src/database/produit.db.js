import { db } from "../config/db.js";
import { Produit } from "../modeles/produit.model.js";

export const createProduit = async (produit) => {
    const [result] = await db.query(
        `INSERT INTO produit (IdRefuge, Nom, Prix, Stock, Categorie, Reduction, Disponibilite) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            produit.IdRefuge,
            produit.Nom,
            produit.Prix,
            produit.Stock,
            produit.Categorie,
            produit.Reduction,
            produit.Disponibilite
        ]
    );

    return result.insertId;
}

export const getAllProduits = async () => {
  const [rows] = await db.query(`
    SELECT p.*,
    (SELECT Url FROM photo WHERE IdProduit = p.Id LIMIT 1) as photo
    FROM produit p
  `);
  return rows.map(row => {
    const produit = new Produit(row);
    produit.photo = row.photo;
    return produit;
  });
};

export const getProduitById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*,
    (SELECT Url FROM photo WHERE IdProduit = p.Id LIMIT 1) as photo
    FROM produit p WHERE p.Id = ?`,
    [id]
  );

  if (!rows[0]) return null;

  const produit = new Produit(rows[0]);
  produit.photo = rows[0].photo;
  return produit;
};

export const updateProduit = async (id, produit) => {
  const [result] = await db.query(
    `UPDATE produit SET 
      IdRefuge = ?, 
      Nom = ?,
      Prix = ?,
      Stock =?,
      Categorie = ?,
      Reduction = ?,
      Disponibilite = ?
     WHERE Id = ?`,
    [
      produit.IdRefuge,
      produit.Nom,
      produit.Prix,
      produit.Stock,
      produit.Categorie,
      produit.Reduction,
      produit.Disponibilite,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteProduit = async (id) => {
  const [result] = await db.query(
    "DELETE FROM produit WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};


export const getMateriauxOfProduit = async (produitId) => {
    const [rows] = await db.query(
        `SELECT m.* FROM materiaux m
         JOIN materiaux_produit mp ON m.Id = mp.IdMateriaux
         WHERE mp.IdProduit = ?`,
        [produitId]
    );
    return rows.map(row => new Materiaux(row));
};

export const getMateriauxOfProduitByIds = async (produitId, materiauxId) => {
    const [rows] = await db.query(
        `SELECT m.* FROM materiaux m
         JOIN materiaux_produit mp ON m.Id = mp.IdMateriaux
         WHERE mp.IdProduit = ? AND mp.IdMateriaux = ?`,
        [
          produitId,
          materiauxId
        ]
    );
    return rows.map(row => new Materiaux(row));
};

export const addMateriauxToProduit = async (produitId, materiauxId) => {
    const [result] = await db.query(
        `INSERT INTO materiaux_produit (IdProduit, IdMateriaux) VALUES (?, ?)`,
        [
          produitId, 
          materiauxId
        ]
    );
    return result.insertId;
};

export const removeMateriauxFromProduit = async (produitId, materiauxId) => {
    const [result] = await db.query(
        `DELETE FROM materiaux_produit WHERE IdProduit = ? AND IdMateriaux = ?`,
        [          produitId, 
          materiauxId]
    );
    return result.affectedRows;
};

export const getProduitsByRefugeId = async (refugeId) => {
    const [rows] = await db.query(
        `SELECT p.*,
         (SELECT Url FROM photo WHERE IdProduit = p.Id LIMIT 1) as photo
         FROM produit p WHERE p.IdRefuge = ?`,
        [refugeId]
    );
    return rows.map(row => {
        const produit = new Produit(row);
        produit.photo = row.photo;
        return produit;
    });
};