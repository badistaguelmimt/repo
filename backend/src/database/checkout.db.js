import { db } from "../config/db.js";

// ── Créer une commande complète (transaction atomique) ─────────────────────
// Données entrantes :
// {
//   IdUtilisateur,
//   adresseLivraison: { adresse, ville, codePostal, wilaya },
//   items: [{ IdProduit, Quantite, Prix, IdRefuge }],
// }
export async function createCheckout(data) {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { IdUtilisateur, adresseLivraison, items } = data;

    // 1. Résoudre IdStatut "En attente" (Id=2) et "Validé" (Id=4) ──────────
    const [[statutEnAttente]] = await conn.query(
      "SELECT Id FROM statut WHERE Statut = 'En attente' LIMIT 1"
    );
    const [[statutValide]] = await conn.query(
      "SELECT Id FROM statut WHERE Statut = 'Validé' LIMIT 1"
    );
    const idStatutEnAttente = statutEnAttente?.Id ?? 2;
    const idStatutValide = statutValide?.Id ?? 4;

    // 2. Créer la commande principale ────────────────────────────────────────
    const [cmdResult] = await conn.query(
      "INSERT INTO commande (IdUtilisateur, Statut) VALUES (?, ?)",
      [IdUtilisateur, idStatutEnAttente]
    );
    const idCommande = cmdResult.insertId;

    // 3. Grouper les articles par refuge ─────────────────────────────────────
    const refugeMap = {};
    for (const item of items) {
      const idRefuge = Number(item.IdRefuge);
      if (!refugeMap[idRefuge]) refugeMap[idRefuge] = [];
      refugeMap[idRefuge].push(item);
    }

    let totalGlobal = 0;

    // 4. Pour chaque refuge : sous_commande + ligne_commandes + livraison ────
    for (const [idRefuge, produits] of Object.entries(refugeMap)) {
      const totalRefuge = produits.reduce(
        (sum, p) => sum + Number(p.Prix) * Number(p.Quantite),
        0
      );
      totalGlobal += totalRefuge;

      // Sous-commande
      const [scResult] = await conn.query(
        `INSERT INTO sous_commande (IdCommande, IdRefuge, Statut, Total_prix, stripe_transfer_id, platformFee)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idCommande, idRefuge, idStatutEnAttente, totalRefuge, null, 0]
      );
      const idSousCommande = scResult.insertId;

      // Lignes de commande
      for (const p of produits) {
        await conn.query(
          "INSERT INTO ligne_commande (IdSousCommande, IdProduit, Quantite) VALUES (?, ?, ?)",
          [idSousCommande, p.IdProduit, p.Quantite]
        );

        // Décrémenter le stock
        await conn.query(
          "UPDATE produit SET Stock = GREATEST(0, Stock - ?) WHERE Id = ?",
          [p.Quantite, p.IdProduit]
        );
      }

      // Livraison
      const adresseComplete = `${adresseLivraison.adresse}, ${adresseLivraison.ville} ${adresseLivraison.codePostal}${adresseLivraison.wilaya ? ', ' + adresseLivraison.wilaya : ''}`;
      await conn.query(
        `INSERT INTO livraison (IdSousCommande, Addresse, Statut, TrackingNumber, Transporteur)
         VALUES (?, ?, ?, ?, ?)`,
        [idSousCommande, adresseComplete, idStatutEnAttente, null, 'Adopty Livraison']
      );
    }

    // 5. Paiement simulé — Validé directement ───────────────────────────────
    await conn.query(
      `INSERT INTO paiement_commande (IdCommande, Montant, Statut, stripe_payment_intent_id, applicationFeeAmount)
       VALUES (?, ?, ?, ?, ?)`,
      [idCommande, totalGlobal, idStatutValide, `SIM-${Date.now()}`, 0]
    );

    // 6. Marquer commande comme "En cours" ────────────────────────────────────
    await conn.query(
      "UPDATE commande SET Statut = ? WHERE Id = ?",
      [idStatutValide, idCommande]
    );

    await conn.commit();

    return {
      idCommande,
      total: totalGlobal,
      nbSousCommandes: Object.keys(refugeMap).length,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ── Récupérer les commandes d'un utilisateur (enrichies) ───────────────────
export async function getCommandesByUtilisateur(idUtilisateur) {
  const [rows] = await db.query(
    `SELECT
       c.Id                              AS commandeId,
       ANY_VALUE(c.Statut)               AS commandeStatutId,
       ANY_VALUE(sc.Statut)              AS StatutId,
       ANY_VALUE(s.Statut)               AS StatutLabel,
       sc.Id                             AS sousCommandeId,
       ANY_VALUE(sc.Total_prix)          AS Total_prix,
       ANY_VALUE(r.Nom)                  AS NomRefuge,
       ANY_VALUE(pm.Montant)             AS MontantPaiement,
       ANY_VALUE(pm.Statut)              AS PaiementStatutId,
       ANY_VALUE(sp.Statut)              AS PaiementStatutLabel,
       ANY_VALUE(pm.stripe_payment_intent_id) AS PaymentRef,
       GROUP_CONCAT(lc.IdProduit, ':', lc.Quantite) AS Lignes
     FROM commande c
     LEFT JOIN sous_commande sc     ON sc.IdCommande   = c.Id
     LEFT JOIN statut s             ON sc.Statut       = s.Id
     LEFT JOIN refuge r             ON sc.IdRefuge     = r.Id
     LEFT JOIN paiement_commande pm ON pm.IdCommande   = c.Id
     LEFT JOIN statut sp            ON pm.Statut       = sp.Id
     LEFT JOIN ligne_commande lc    ON lc.IdSousCommande = sc.Id
     WHERE c.IdUtilisateur = ?
     GROUP BY c.Id, sc.Id, pm.Id
     ORDER BY c.Id DESC`,
    [idUtilisateur]
  );
  return rows;
}

// ── Récupérer les sous-commandes du refuge du gestionnaire connecté ──────────
export async function getRefugeOrdersForUser(idUtilisateur) {
  const [rows] = await db.query(
    `SELECT
       sc.Id                                   AS sousCommandeId,
       ANY_VALUE(sc.Total_prix)                AS Total_prix,
       ANY_VALUE(sc.Statut)                    AS sousCommandeStatutId,
       ANY_VALUE(ss.Statut)                    AS StatutLabel,
       c.Id                                    AS commandeId,
       ANY_VALUE(c.IdUtilisateur)              AS IdUtilisateur,
       ANY_VALUE(u.Prenom)                     AS ClientPrenom,
       ANY_VALUE(u.Nom)                        AS ClientNom,
       ANY_VALUE(r.Nom)                        AS NomRefuge,
       ANY_VALUE(l.Addresse)                   AS Addresse,
       ANY_VALUE(l.Statut)                     AS livraisonStatutId,
       ANY_VALUE(ls.Statut)                    AS LivraisonStatutLabel,
       ANY_VALUE(l.TrackingNumber)             AS TrackingNumber,
       ANY_VALUE(pm.Montant)                   AS MontantTotal,
       ANY_VALUE(pm.stripe_payment_intent_id)  AS PaymentRef,
       ANY_VALUE(ps.Statut)                    AS PaiementStatutLabel,
       GROUP_CONCAT(CONCAT(p.Nom, ' x', lc.Quantite) SEPARATOR ', ') AS ArticlesDetail
     FROM sous_commande sc
     JOIN refuge r             ON sc.IdRefuge     = r.Id
     JOIN commande c           ON sc.IdCommande   = c.Id
     JOIN utilisateur u        ON c.IdUtilisateur = u.Id
     LEFT JOIN statut ss       ON sc.Statut       = ss.Id
     LEFT JOIN livraison l     ON l.IdSousCommande = sc.Id
     LEFT JOIN statut ls       ON l.Statut        = ls.Id
     LEFT JOIN paiement_commande pm ON pm.IdCommande = c.Id
     LEFT JOIN statut ps       ON pm.Statut       = ps.Id
     LEFT JOIN ligne_commande lc ON lc.IdSousCommande = sc.Id
     LEFT JOIN produit p       ON lc.IdProduit    = p.Id
     WHERE r.Id IN (
       SELECT IdRefuge FROM utilisateur_refuge WHERE IdUtilisateur = ?
     )
     GROUP BY sc.Id, c.Id
     ORDER BY sc.Id DESC`,
    [idUtilisateur]
  );
  return rows;
}

// ── Mettre à jour le statut d'une sous-commande ──────────────────────────────
export async function updateSousCommandeStatut(sousCommandeId, statutLabel) {
  const [[statut]] = await db.query(
    "SELECT Id FROM statut WHERE Statut = ? LIMIT 1",
    [statutLabel]
  );
  if (!statut) throw new Error(`Statut inconnu : ${statutLabel}`);

  await db.query(
    "UPDATE sous_commande SET Statut = ? WHERE Id = ?",
    [statut.Id, sousCommandeId]
  );

  // Mettre à jour la livraison associée aussi
  await db.query(
    "UPDATE livraison SET Statut = ? WHERE IdSousCommande = ?",
    [statut.Id, sousCommandeId]
  );

  return { ok: true };
}

// ── Toutes les commandes (Admin) ─────────────────────────────────────────────
export async function getAllCommandesAdmin() {
  const [rows] = await db.query(
    `SELECT
       c.Id               AS commandeId,
       c.IdUtilisateur,
       u.Prenom           AS ClientPrenom,
       u.Nom              AS ClientNom,
       sc.Id              AS sousCommandeId,
       sc.Total_prix,
       sc.Statut          AS sousStatutId,
       ss.Statut          AS StatutLabel,
       r.Nom              AS NomRefuge,
       pm.Montant         AS MontantTotal,
       pm.stripe_payment_intent_id AS PaymentRef,
       ps.Statut          AS PaiementStatutLabel
     FROM commande c
     JOIN utilisateur u      ON c.IdUtilisateur = u.Id
     LEFT JOIN sous_commande sc  ON sc.IdCommande = c.Id
     LEFT JOIN statut ss         ON sc.Statut = ss.Id
     LEFT JOIN refuge r          ON sc.IdRefuge = r.Id
     LEFT JOIN paiement_commande pm ON pm.IdCommande = c.Id
     LEFT JOIN statut ps         ON pm.Statut = ps.Id
     ORDER BY c.Id DESC
     LIMIT 200`,
    []
  );
  return rows;
}

export async function getCommandeEnrichie(idCommande) {
  const [rows] = await db.query(
    `SELECT
       c.Id AS commandeId,
       sc.Id AS sousCommandeId,
       sc.Total_prix,
       sc.Statut AS sousCommandeStatut,
       s.Statut AS StatutLabel,
       r.Nom AS NomRefuge,
       l.Addresse,
       l.Statut AS livraisonStatut,
       ls.Statut AS LivraisonStatutLabel,
       l.TrackingNumber,
       pm.Montant,
       pm.stripe_payment_intent_id AS PaymentRef,
       ps.Statut AS PaiementStatutLabel
     FROM commande c
     LEFT JOIN sous_commande sc     ON sc.IdCommande = c.Id
     LEFT JOIN statut s             ON sc.Statut = s.Id
     LEFT JOIN refuge r             ON sc.IdRefuge = r.Id
     LEFT JOIN livraison l          ON l.IdSousCommande = sc.Id
     LEFT JOIN statut ls            ON l.Statut = ls.Id
     LEFT JOIN paiement_commande pm ON pm.IdCommande = c.Id
     LEFT JOIN statut ps            ON pm.Statut = ps.Id
     WHERE c.Id = ?`,
    [idCommande]
  );
  return rows;
}
