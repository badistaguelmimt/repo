import { db } from "../config/db.js";
import { DemandeTransfert } from "../modeles/demande_transfert.model.js";

// ── Créer une demande de transfert ───────────────────────────────────────────
export const createDemandeTransfert = async (demande_transfert) => {
    const [result] = await db.query(
        `INSERT INTO demande_transfert (IdRefugeDepart, IdAnimal, IdRefugeCible, CommentaireDepart, CommentaireRetour, DateDemande, Statut, DateRetours) 
        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
            demande_transfert.IdRefugeDepart,
            demande_transfert.IdAnimal,
            demande_transfert.IdRefugeCible,
            demande_transfert.CommentaireDepart,
            demande_transfert.CommentaireRetour,
            demande_transfert.Statut,
            demande_transfert.DateRetours
        ]
    );

    return result.insertId;
};

// ── Toutes les demandes de transfert ─────────────────────────────────────────
export const getAllDemandeTransferts = async () => {
    const [rows] = await db.query("SELECT * FROM demande_transfert");
    return rows.map(row => new DemandeTransfert(row));
};

// ── Une demande par ID ────────────────────────────────────────────────────────
export const getDemandeTransfertById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM demande_transfert WHERE Id = ?",
        [id]
    );

    if (!rows[0]) return null;

    return new DemandeTransfert(rows[0]);
};

// ── Mettre à jour une demande ─────────────────────────────────────────────────
export const updateDemandeTransfert = async (id, demande_transfert) => {
    const [result] = await db.query(
        `UPDATE demande_transfert SET 
          IdRefugeDepart = ?, 
          IdAnimal = ?,
          IdRefugeCible = ?,
          CommentaireDepart = ?,
          CommentaireRetour = ?,
          Statut = ?,
          DateRetours = NOW()
         WHERE Id = ?`,
        [
            demande_transfert.IdRefugeDepart,
            demande_transfert.IdAnimal,
            demande_transfert.IdRefugeCible,
            demande_transfert.CommentaireDepart,
            demande_transfert.CommentaireRetour,
            demande_transfert.Statut,
            id
        ]
    );

    return result.affectedRows;
};

// ── Supprimer une demande ─────────────────────────────────────────────────────
export const deleteDemandeTransfert = async (id) => {
    const [result] = await db.query(
        "DELETE FROM demande_transfert WHERE Id = ?",
        [id]
    );

    return result.affectedRows;
};

// ── Demandes par refuge de départ ─────────────────────────────────────────────
export const getDemandeTransfertByRefugeDepartId = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM demande_transfert WHERE IdRefugeDepart = ?",
        [id]
    );
    return rows.map(row => new DemandeTransfert(row));
};

// ── Demandes par refuge cible ─────────────────────────────────────────────────
export const getDemandeTransfertByRefugeCibleId = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM demande_transfert WHERE IdRefugeCible = ?",
        [id]
    );
    return rows.map(row => new DemandeTransfert(row));
};

// ── Mettre à jour uniquement le statut d'une demande (+ commentaire retour) ──
export const updateDemandeTripleTStatut = async (demandeId, nouveauStatut, CommentaireRetour) => {
    try {
        console.log(`Mise à jour de la demande de transfert ${demandeId} vers le statut ${nouveauStatut}`);

        // Vérifier si la demande existe
        const [demandeExistante] = await db.execute(
            'SELECT Id, Statut FROM demande_transfert WHERE Id = ?',
            [demandeId]
        );

        if (demandeExistante.length === 0) {
            throw new Error(`Demande de transfert ${demandeId} non trouvée`);
        }

        // Mettre à jour le statut
        await db.execute(
            'UPDATE demande_transfert SET Statut = ?, CommentaireRetour = ?, DateRetours = NOW() WHERE Id = ?',
            [nouveauStatut, CommentaireRetour, demandeId]
        );

        // Récupérer la demande mise à jour
        const [demandeMaj] = await db.execute(
            'SELECT * FROM demande_transfert WHERE Id = ?',
            [demandeId]
        );

        return demandeMaj[0];

    } catch (error) {
        console.error("Erreur dans updateDemandeTripleTStatut:", error);
        throw error;
    }
};
