import { db } from "../config/db.js";
import { LigneWishlist } from "../modeles/ligne_wishlist.model.js";

export const createLigneWishlist = async (ligne_wishlist) => {
    const [result] = await db.query(
        `INSERT INTO ligne_wishlist (IdWishlist, IdProduit, Quantite) 
        VALUES (?, ?, ?)`,
        [
            ligne_wishlist.IdWishlist,
            ligne_wishlist.IdProduit,
            ligne_wishlist.Quantite
        ]
    );

    return result.insertId;
}

export const getAllLigneWishlists = async () => {
  const [rows] = await db.query("SELECT * FROM ligne_wishlist");
  return rows.map(row => new LigneWishlist(row));
};

export const getLigneWishlistById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM ligne_wishlist WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new LigneWishlist(rows[0]);
};

export const updateLigneWishlist = async (id, ligne_wishlist) => {
  const [result] = await db.query(
    `UPDATE ligne_wishlist SET 
      IdWishlist = ?, 
      IdProduit = ?,
      Quantite = ?
     WHERE Id = ?`,
    [
      ligne_wishlist.IdWishlist,
      ligne_wishlist.IdProduit,
      ligne_wishlist.Quantite,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteLigneWishlist = async (id) => {
  const [result] = await db.query(
    "DELETE FROM ligne_wishlist WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

