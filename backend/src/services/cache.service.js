// Fonctions utilitaires pour résoudre des labels en IDs depuis la base de données.

/**
 * Cherche l'Id d'un statut par son label (ex: "En attente").
 * @param {object} db - Instance de la connexion MySQL
 * @param {string} label - Nom du statut
 * @returns {Promise<number>}
 */
export async function resolveStatutId(db, label) {
  const [rows] = await db.query("SELECT Id, Statut FROM statut");
  const found = rows.find(
    (s) => s.Statut?.toLowerCase() === String(label).toLowerCase()
  );
  return found?.Id ?? 2; // fallback : Id 2 = "En attente"
}

/**
 * Cherche l'Id d'un type de service par son label (ex: "Toilettage").
 * @param {object} db - Instance de la connexion MySQL
 * @param {string} label - Nom du type de service
 * @returns {Promise<number|null>}
 */
export async function resolveTypeServiceId(db, label) {
  const [rows] = await db.query("SELECT Id, Type FROM type_service");
  const found = rows.find(
    (t) => t.Type?.toLowerCase() === String(label).toLowerCase()
  );
  return found?.Id ?? null;
}
