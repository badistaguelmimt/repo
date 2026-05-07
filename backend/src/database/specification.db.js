import { db } from "../config/db.js";
import { Specification } from "../modeles/specification.model.js";

export const createSpecification = async (specification) => {
    const [result] = await db.query(
        `INSERT INTO specification (IdProfil, IdEspece) 
        VALUES (?, ?)`,
        [
            specification.IdProfil,
            specification.IdEspece
        ]
    );

    return result.insertId;
}

export const getAllSpecifications = async () => {
  const [rows] = await db.query("SELECT * FROM specification");
  return rows.map(row => new Specification(row));
};

export const getSpecificationById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM specification WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Specification(rows[0]);
};

export const updateSpecification = async (id, specification) => {
  const [result] = await db.query(
    `UPDATE specification SET 
      IdProfil = ?, 
      IdEspece = ?
     WHERE Id = ?`,
    [
      specification.IdProfil,
      specification.IdEspece,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteSpecification = async (id) => {
  const [result] = await db.query(
    "DELETE FROM specification WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

