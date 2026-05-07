import { db } from "../config/db.js";
import { Wishlist } from "../modeles/wishlist.model.js";

export const createWishlist = async (wishlist) => {
    const [result] = await db.query(
        `INSERT INTO wishlist (IdUtilisateur) 
        VALUES (?)`,
        [
            wishlist.IdUtilisateur
        ]
    );

    return result.insertId;
}

export const getAllWishlists = async () => {
  const [rows] = await db.query("SELECT * FROM wishlist");
  return rows.map(row => new Wishlist(row));
};

export const getWishlistById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM wishlist WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Wishlist(rows[0]);
};

export const updateWishlist = async (id, wishlist) => {
  const [result] = await db.query(
    `UPDATE wishlist SET 
      IdUtilisateur = ? 
     WHERE Id = ?`,
    [
      wishlist.IdUtilisateur,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteWishlist = async (id) => {
  const [result] = await db.query(
    "DELETE FROM wishlist WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

