import { db } from "../config/db.js";
import { TypeService } from "../modeles/type_service.model.js";

export const createTypeService = async (type_service) => {
    const [result] = await db.query(
        `INSERT INTO type_service (Type) 
        VALUES (?)`,
        [
            type_service.Type
        ]
    );

    return result.insertId;
}

export const getAllTypeServices = async () => {
  const [rows] = await db.query("SELECT * FROM type_service");
  return rows.map(row => new TypeService(row));
};

export const getTypeServiceById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM type_service WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new TypeService(rows[0]);
};

export const updateTypeService = async (id, type_service) => {
  const [result] = await db.query(
    `UPDATE type_service SET 
      Type = ? 
     WHERE Id = ?`,
    [
      type_service.Type,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteTypeService = async (id) => {
  const [result] = await db.query(
    "DELETE FROM type_service WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

