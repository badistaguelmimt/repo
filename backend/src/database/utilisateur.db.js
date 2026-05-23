import { db } from "../config/db.js";
import { Animal } from "../modeles/animal.model.js";
import { Refuge } from "../modeles/refuge.model.js";
import { Role } from "../modeles/role.model.js";
import { Utilisateur } from "../modeles/utilisateur.model.js";

export const createUtilisateur = async (user) => {
  // on a enlevé stripe car mnt on simule le paiement
  const [result] = await db.query(
    `INSERT INTO utilisateur 
    (clerkId, Nom, Prenom, Addresse, AddresseEmail, Wilaya, MotDePasse, Photo, CreeLe, CreePar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      user.clerkId,
      user.Nom,
      user.Prenom,
      user.Addresse,
      user.AddresseEmail,
      user.Wilaya,
      user.MotDePasse,
      user.Photo,
      user.CreePar
    ]
  );

  return result.insertId;
};

export const getAllUtilisateurs = async () => {
  const [rows] = await db.query("SELECT * FROM utilisateur");
  return rows.map(row => new Utilisateur(row));
};

export const getUtilisateurById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM utilisateur WHERE Id = ?",
    [id]
  );

  if (!rows[0]) return null;

  return new Utilisateur(rows[0]);
};

export const updateUtilisateur = async (id, user) => {
  const [result] = await db.query(
    `UPDATE utilisateur SET 
      Nom = ?, 
      Prenom = ?, 
      Addresse = ?, 
      AddresseEmail = ?, 
      MotDePasse = ?,
      Wilaya = ?, 
      Photo = ?, 
      ModifieeLe = NOW(),
      ModifieePar = ?
     WHERE Id = ?`,
    [
      user.Nom,
      user.Prenom,
      user.Addresse,
      user.AddresseEmail,
      user.MotDePasse,
      user.Wilaya,
      user.Photo,
      user.ModifieePar,
      id
    ]
  );

  return result.affectedRows;
};

export const deleteUtilisateur = async (id) => {
  const [result] = await db.query(
    "DELETE FROM utilisateur WHERE Id = ?",
    [id]
  );

  return result.affectedRows;
};

export const getUtilisateurByClerkId = async (clerkId) => {
  const [rows] = await db.query(
    "SELECT * FROM utilisateur WHERE clerkId = ?",
    [clerkId]
  );

  if (!rows[0]) return null;

  return new Utilisateur(rows[0]);
};

//
// special requests
//

// en rapport avec les roles d'un utilisateur
export const getUtilisateurRolesById = async (id) => {
  const [rows] = await db.query(
    `SELECT r.* FROM utilisateur u
     JOIN role_utilisateur ru ON u.Id = ru.IdUtilisateur 
     JOIN role r ON ru.IdRole = r.Id
     WHERE u.Id = ?`,
     [
      id
     ]
  );

  return rows.map(row =>new Role(row));
}

export const addRoleToUtilisateurByIds = async (roleId, utilisateurId) => {
    const [result] = await db.query(
        `INSERT INTO role_utilisateur (IdRole,IdUtilisateur)
        VALUES(?, ?)`,
        [
            roleId,
            utilisateurId
        ]
    );

    return result.insertId;
}

export const hasRoleToUtilisateurByIds = async (roleId, utilisateurId) => {
  const [rows] = await db.query(
    `SELECT 1 FROM role_utilisateur
     WHERE IdRole = ? AND IdUtilisateur = ?
     LIMIT 1`,
    [roleId, utilisateurId]
  );

  return Boolean(rows[0]);
}

export const ensureRoleToUtilisateurByIds = async (roleId, utilisateurId) => {
  if (!roleId || !utilisateurId) return false;

  const hasRole = await hasRoleToUtilisateurByIds(roleId, utilisateurId);
  if (hasRole) return false;

  const [result] = await db.query(
    `INSERT INTO role_utilisateur (IdRole,IdUtilisateur)
     VALUES(?, ?)`,
    [roleId, utilisateurId]
  );

  return result.affectedRows > 0;
}

export const removeRoleToUtilisateurByIds = async (roleId, utilisateurId) => {
    const [result] = await db.query(
        `DELETE FROM role_utilisateur 
        WHERE IdRole =? AND IdUtilisateur = ?`,
        [
            roleId,
            utilisateurId
        ]
    );

    return result.affectedRows;
}

// en rapport avec les refuges d'un utilisateur

export const getUtilisateurRefugesById = async (id) => {
  const [rows] = await db.query(
    `SELECT r.* FROM utilisateur u
     JOIN refuge_utilisateur ru ON u.Id = ru.IdUtilisateur 
     JOIN refuge r ON ru.IdRefuge = r.Id
     WHERE u.Id = ?`,
     [
      id
     ]
  );

  return rows.map(row =>new Refuge(row));
}

export const addRefugeToUtilisateurByIds = async (refugeId, utilisateurId) => {
    const [result] = await db.query(
        `INSERT INTO refuge_utilisateur (IdRefuge,IdUtilisateur)
        VALUES(?, ?)`,
        [
            refugeId,
            utilisateurId
        ]
    );

    return result.insertId;
}

export const removeRefugeToUtilisateurByIds = async (refugeId, utilisateurId) => {
    const [result] = await db.query(
        `DELETE FROM refuge_utilisateur 
        WHERE IdRefuge =? AND IdUtilisateur = ?`,
        [
            refugeId,
            utilisateurId
        ]
    );

    return result.affectedRows;
}

export const getUtilisateurAnimalsById = async (id) => {
  const [rows] = await db.query(
    `SELECT a.* FROM utilisateur u
     JOIN possession p ON u.Id = p.IdUtilisateur 
     JOIN animal a ON p.IdAnimal = a.Id
     WHERE u.Id = ? AND p.IdRefuge IS NULL`,  // a surveiller: condition pour pas melanger avec refuge
     [
      id
     ]
  );

  return rows.map(row =>new Animal(row));
}

 //   todo : check les deux funcs juste en bas car pas fini 

export const addAnimalToUtilisateurByIds = async (animalId, utilisateurId) => {
    const [result] = await db.query(
        `INSERT INTO possession (IdAnimal,IdUtilisateur,IdRefuge)
        VALUES(?, ?,NULL)`,
        [
            animalId,
            utilisateurId
        ]
    );

    return result.insertId;
}

export const removeAnimalFromUtilisateurByIds = async (animalId, utilisateurId) => {
    const [result] = await db.query(
        `DELETE FROM possession 
        WHERE IdAnimal =? AND IdUtilisateur = ?`,
        [
            animalId,
            utilisateurId
        ]
    );

    return result.affectedRows;
}

export const setAnimalToUtilisateurByIds = async (animalId, utilisateurId) => {
    const [result] = await db.query(
        `UPDATE possession SET
         IdUtilisateur = ?
        WHERE IdAnimal =? AND IdUtilisateur IS NULL AND IdRefuge IS NULL`,
        [
            utilisateurId,
            animalId,
        ]
    );

    return result.affectedRows;
}

export const unsetAnimalToUtilisateurByIds = async (animalId, utilisateurId) => {
    const [result] = await db.query(
        `UPDATE possession SET
         IdUtilisateur = NULL
        WHERE IdAnimal =? AND IdUtilisateur = ? AND IdRefuge IS NOT NULL`,   // pas sur que ca marche a 100% ca
        [
            animalId,
            utilisateurId
        ]
    );

    return result.affectedRows;
}
