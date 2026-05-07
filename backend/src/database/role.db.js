import { db } from "../config/db.js";
import { Role } from "../modeles/role.model.js";

export const createRole = async (role) => {
    const [result] = await db.query(
        "INSERT INTO role (Nom,Description) values(?,?)",
        [
            role.Nom,
            role.Description
        ]
    );

    return result.insertId;
}

export const getAllRoles = async () => {
  const [rows] = await db.query("SELECT * FROM role");
  return rows.map(row => new Role(row));
};

export const getRoleById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM role WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Role(rows[0]);
};

export const getRoleByName = async (name) => {
  const normalizedName = String(name ?? "").trim();
  if (!normalizedName) return null;

  const [rows] = await db.query(
    "SELECT * FROM role WHERE LOWER(Nom) = LOWER(?) LIMIT 1",
    [normalizedName]
  );

  if (!rows[0]) return null;

  return new Role(rows[0]);
};

export const updateRole = async (id, role) => {
  const [result] = await db.query(
    `UPDATE role SET 
      Nom = ?, 
      Description = ?
     WHERE Id = ?`,
    [
      role.Nom,
      role.Description,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteRole = async (id) => {
  const [result] = await db.query(
    "DELETE FROM role WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};
