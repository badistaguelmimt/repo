/**
 * cache.service.js
 *
 * Fournit un cache en mémoire avec TTL (Time-To-Live).
 * Utilisé pour éviter des requêtes répétées en BDD sur des tables
 * quasi-statiques (statut, type_service…).
 *
 * Par défaut, les entrées expirent après 5 minutes.
 * On peut invalider manuellement un cache via `invalidate(key)`.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** @type {Map<string, { data: any, expiresAt: number }>} */
const store = new Map();

/**
 * Récupère une valeur du cache si elle existe et n'est pas expirée.
 * @param {string} key
 * @returns {any | null}
 */
export function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Stocke une valeur dans le cache avec un TTL optionnel.
 * @param {string} key
 * @param {any} data
 * @param {number} [ttlMs] - durée en ms (défaut : CACHE_TTL_MS)
 */
export function set(key, data, ttlMs = CACHE_TTL_MS) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalide manuellement une entrée du cache.
 * @param {string} key
 */
export function invalidate(key) {
  store.delete(key);
}

/**
 * Vide intégralement le cache (utile pour les tests ou un reload admin).
 */
export function flush() {
  store.clear();
}

/**
 * Helper : résout un label de statut vers son Id en BDD.
 * Résultat mis en cache pendant CACHE_TTL_MS.
 *
 * @param {import('../config/db.js').db} db
 * @param {string} label  ex: "En attente", "Acceptée"
 * @returns {Promise<number>}
 */
export async function resolveStatutId(db, label) {
  const CACHE_KEY = "statut:all";
  let rows = get(CACHE_KEY);
  if (!rows) {
    const [result] = await db.query("SELECT Id, Statut FROM statut");
    rows = result;
    set(CACHE_KEY, rows);
  }
  const found = rows.find(
    (s) => s.Statut?.toLowerCase() === String(label).toLowerCase()
  );
  return found?.Id ?? 2; // fallback : Id 2 = "En attente"
}

/**
 * Helper : résout un label de type_service vers son Id en BDD.
 * Résultat mis en cache pendant CACHE_TTL_MS.
 *
 * @param {import('../config/db.js').db} db
 * @param {string} label  ex: "Pet-sitting", "Promenade"
 * @returns {Promise<number | null>}
 */
export async function resolveTypeServiceId(db, label) {
  const CACHE_KEY = "type_service:all";
  let rows = get(CACHE_KEY);
  if (!rows) {
    const [result] = await db.query("SELECT Id, Type FROM type_service");
    rows = result;
    set(CACHE_KEY, rows);
  }
  const found = rows.find(
    (t) => t.Type?.toLowerCase() === String(label).toLowerCase()
  );
  return found?.Id ?? null;
}
