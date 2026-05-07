/**
 * seed_messages.js — v2
 * Insère des conversations et messages de démonstration.
 * Usage : node src/scripts/seed_messages.js
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
};

const seed = async () => {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    console.log("✅ Connecté à la base de données.");
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

    // ── Helper : crée une conversation + participants + messages ──────────────
    const daysAgoDate = (days, extraHours = 0) =>
      new Date(Date.now() - (days * 24 + extraHours) * 3600 * 1000);
    const hoursAgoDate = (hours) =>
      new Date(Date.now() - hours * 3600 * 1000);

    const createConv = async (createdBy, daysAgo, participants, messages) => {
      const [res] = await conn.query(
        `INSERT INTO conversation (Type, CreatedAt, CreatedBy) VALUES ('direct', ?, ?)`,
        [daysAgoDate(daysAgo), createdBy]
      );
      const convId = res.insertId;

      for (const { userId, daysAgoJoined } of participants) {
        await conn.query(
          `INSERT INTO conversation_participant
             (IdConversation, IdUtilisateur, Statut, Role, JoinedAt)
           VALUES (?, ?, 1, 'member', ?)`,
          [convId, userId, daysAgoDate(daysAgoJoined)]
        );
      }

      for (const { sender, text, hoursAgo } of messages) {
        await conn.query(
          `INSERT INTO message (IdConversation, SenderId, Contenu, CreatedAt) VALUES (?, ?, ?, ?)`,
          [convId, sender, text, hoursAgoDate(hoursAgo)]
        );
      }

      return convId;
    };

    // ── CONVERSATION 1 : Alice (5) ↔ Amina (10) — Pet-sitting ────────────────
    const c1 = await createConv(5, 3,
      [{ userId: 5, daysAgoJoined: 3 }, { userId: 10, daysAgoJoined: 3 }],
      [
        { sender: 5,  hoursAgo: 72, text: "Bonjour Amina ! J'ai vu votre profil sur Adopty, je cherche quelqu'un pour garder mon golden retriever la semaine prochaine." },
        { sender: 10, hoursAgo: 70, text: "Bonjour Alice ! Bien sûr, je suis disponible. Quel est le nom de votre chien et quels jours exactement ?" },
        { sender: 5,  hoursAgo: 69, text: "Il s'appelle Buddy, c'est un golden de 3 ans très joueur. Du lundi au vendredi si possible." },
        { sender: 10, hoursAgo: 68, text: "Buddy, quel beau prénom ! Oui c'est tout à fait faisable. Mon tarif est de 3500 DZD/jour, déjeuner et promenades inclus." },
        { sender: 5,  hoursAgo: 67, text: "C'est parfait ! Est-ce que vous pouvez envoyer une photo de votre espace pour les chiens ?" },
        { sender: 10, hoursAgo: 66, text: "Bien sûr, j'ai un grand appartement avec balcon à Alger Centre. Je vous envoie les photos ce soir." },
        { sender: 5,  hoursAgo: 29, text: "Super ! Je vais aussi remplir le formulaire de réservation. Merci beaucoup Amina." },
        { sender: 10, hoursAgo: 28, text: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. A bientot !" },
      ]
    );
    console.log(`✓ Conv 1 créée (Alice ↔ Amina Pet-sitting, id=${c1})`);

    // ── CONVERSATION 2 : Alice (5) ↔ Omar (13) — Promenade ───────────────────
    const c2 = await createConv(5, 5,
      [{ userId: 5, daysAgoJoined: 5 }, { userId: 13, daysAgoJoined: 5 }],
      [
        { sender: 5,  hoursAgo: 120, text: "Bonjour Omar, je cherche quelqu'un pour promener mon chien tous les matins vers 8h." },
        { sender: 13, hoursAgo: 119, text: "Bonjour ! Oui c'est exactement mon créneau. Vous habitez dans quel quartier ?" },
        { sender: 5,  hoursAgo: 118, text: "J'habite à El Biar. La promenade durerait environ 45 minutes." },
        { sender: 13, hoursAgo: 117, text: "El Biar c'est parfait, je suis basé dans ce secteur. 45min à 1500 DZD la sortie, ça vous convient ?" },
        { sender: 5,  hoursAgo: 106, text: "Oui c'est raisonnable. On peut faire un essai ce samedi ?" },
        { sender: 13, hoursAgo: 94,  text: "Parfait ! Je serai devant chez vous à 8h précises. Envoyez-moi votre adresse exacte." },
        { sender: 5,  hoursAgo: 93,  text: "12 Rue des Orangers, El Biar. Sonnez au 3eme étage." },
        { sender: 13, hoursAgo: 92,  text: "C'est noté ! À samedi. Je vous ferai un compte-rendu et des photos à la fin de la balade." },
        { sender: 5,  hoursAgo: 34,  text: "La balade s'est super bien passée ! Buddy a adoré. On peut programmer ça tous les jours de la semaine ?" },
        { sender: 13, hoursAgo: 33,  text: "Avec plaisir ! Je suis disponible lundi-samedi. Je vous envoie un récapitulatif horaire demain." },
      ]
    );
    console.log(`✓ Conv 2 créée (Alice ↔ Omar Promenade, id=${c2})`);

    // ── CONVERSATION 3 : Alice (5) ↔ Refuge Jean (2) — Adoption Max ──────────
    const c3 = await createConv(5, 7,
      [{ userId: 5, daysAgoJoined: 7 }, { userId: 2, daysAgoJoined: 7 }],
      [
        { sender: 5,  hoursAgo: 168, text: "Bonjour, j'ai soumis une demande d'adoption pour Max. Pouvez-vous me donner plus d'infos sur son comportement ?" },
        { sender: 2,  hoursAgo: 167, text: "Bonjour Alice ! Merci pour votre intérêt. Max est un berger allemand de 5 ans, très protecteur mais doux avec les adultes." },
        { sender: 5,  hoursAgo: 166, text: "Est-ce qu'il s'entend bien avec les autres chiens ? J'ai déjà un labrador." },
        { sender: 2,  hoursAgo: 154, text: "Max préfère être seul avec ses humains. Avec un autre chien, une période d'adaptation sera nécessaire." },
        { sender: 5,  hoursAgo: 132, text: "Je comprends. On serait prêts à faire ça progressivement. Quelles sont les prochaines étapes ?" },
        { sender: 2,  hoursAgo: 131, text: "Nous allons étudier votre dossier dans les prochains jours. Nous reviendrons vers vous pour une visite du refuge." },
        { sender: 5,  hoursAgo: 130, text: "Parfait, j'attends de vos nouvelles. Merci beaucoup !" },
        { sender: 2,  hoursAgo: 48,  text: "Bonne nouvelle ! Votre dossier a été retenu. Pouvez-vous passer au refuge samedi prochain à 10h ?" },
        { sender: 5,  hoursAgo: 47,  text: "Oui bien sûr ! On sera là à 10h précises avec toute la famille. Merci infiniment !!!" },
        { sender: 2,  hoursAgo: 22,  text: "À samedi alors ! Max sera très content de vous rencontrer." },
      ]
    );
    console.log(`✓ Conv 3 créée (Alice ↔ Refuge adoption Max, id=${c3})`);

    // ── CONVERSATION 4 : Nadia (14) ↔ Alice (5) — Tarifs ────────────────────
    const c4 = await createConv(14, 1,
      [{ userId: 14, daysAgoJoined: 1 }, { userId: 5, daysAgoJoined: 1 }],
      [
        { sender: 14, hoursAgo: 29, text: "Bonjour Alice ! Je suis Nadia, promeneuse partenaire Adopty à Blida. Omar m'a parlé de vous. Je suis disponible aussi si besoin." },
        { sender: 5,  hoursAgo: 28, text: "Bonjour Nadia ! Merci de me contacter. J'habite à El Biar donc c'est peut-être un peu loin pour vous ?" },
        { sender: 14, hoursAgo: 27, text: "Je couvre aussi Alger en semaine. Mon tarif est 1800 DZD/sortie avec rapport photo inclus." },
        { sender: 5,  hoursAgo: 26, text: "C'est noté ! Je vous recontacte si Omar n'est pas disponible un jour. Merci Nadia !" },
      ]
    );
    console.log(`✓ Conv 4 créée (Nadia ↔ Alice tarifs, id=${c4})`);

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log(`
🎉 Seed messagerie terminé avec succès !
   → 4 conversations créées
   → 32 messages insérés

   Comptes pour tester :
   - Alice (utilisateur)    → alice.user@test.com
   - Jean Dupont (refuge)   → jean.refuge@test.com  
   - Amina Benali (prest.)  → amina.benali@adopty-demo.com
   - Omar Belkacem (prest.) → omar.belkacem@adopty-demo.com (id=13)
   - Nadia Bensalem (prest.)→ nadia.bensalem@adopty-demo.com
    `);

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    if (err.sqlMessage) console.error("   SQL:", err.sqlMessage);
    if (err.sql) console.error("   Query:", err.sql.substring(0, 200));
  } finally {
    if (conn) await conn.end();
  }
};

seed();
