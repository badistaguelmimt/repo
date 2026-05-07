import { db } from "../config/db.js";
import { Avis } from "../modeles/avis.model.js";

export const createAvis = async (avis) => {
    const [result] = await db.query(
        `INSERT INTO avis (IdUtilisateur, IdProduit, IdSousCommande, Note, Commentaire) 
        VALUES (?, ?, ?, ?, ?)`,
        [
            avis.IdUtilisateur,
            avis.IdProduit,
            avis.IdSousCommande,
            avis.Note,
            avis.Commentaire
        ]
    );

    return result.insertId;
}

export const getAllAviss = async () => {
  const [rows] = await db.query("SELECT * FROM avis");
  return rows.map(row => new Avis(row));
};

export const getAvisById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM avis WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Avis(rows[0]);
};

export const updateAvis = async (id, avis) => {
  const [result] = await db.query(
    `UPDATE avis SET 
      IdUtilisateur = ?, 
      IdProduit = ?,
      IdSousCommande = ?,
      Note =?,
      Commentaire = ?
     WHERE Id = ?`,
    [
      avis.IdUtilisateur,
      avis.IdProduit,
      avis.IdSousCommande,
      avis.Note,
      avis.Commentaire,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteAvis = async (id) => {
  const [result] = await db.query(
    "DELETE FROM avis WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

