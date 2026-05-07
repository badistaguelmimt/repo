/**
 * seed_prestataires.js
 * Insère des prestataires de démonstration dans la base de données.
 * Usage : node src/scripts/seed_prestataires.js
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

    // 1. Insérer les type_services si manquants
    await conn.query(`
      INSERT IGNORE INTO type_service (Id, Type) VALUES
        (1, 'Toilettage'),
        (2, 'Éducation canine'),
        (3, 'Pet-sitting'),
        (4, 'Promenade'),
        (5, 'Vétérinaire')
    `);
    console.log("✓ Types de service OK");

    // 2. Insérer les utilisateurs prestataires (INSERT IGNORE = ne crée pas de doublon)
    await conn.query(`
      INSERT IGNORE INTO utilisateur (Id, clerkId, Nom, Prenom, AddresseEmail, MotDePasse, CreeLe) VALUES
        (10, 'seed_prestataire_10', 'Benali',   'Amina',    'amina.benali@adopty-demo.com',   'demo123', NOW()),
        (11, 'seed_prestataire_11', 'Chaoui',   'Karim',    'karim.chaoui@adopty-demo.com',   'demo123', NOW()),
        (12, 'seed_prestataire_12', 'Mazouz',   'Sarah',    'sarah.mazouz@adopty-demo.com',   'demo123', NOW()),
        (13, 'seed_prestataire_13', 'Hadj',     'Yacine',   'yacine.hadj@adopty-demo.com',    'demo123', NOW()),
        (14, 'seed_prestataire_14', 'Bensalem', 'Nadia',    'nadia.bensalem@adopty-demo.com', 'demo123', NOW()),
        (15, 'seed_prestataire_15', 'Touati',   'Riad',     'riad.touati@adopty-demo.com',    'demo123', NOW())
    `);
    console.log("✓ Utilisateurs prestataires créés");

    // 3. Insérer les rôles prestataire si besoin
    // (role Id=3 = 'Prestataire' d'après le seed principal)
    await conn.query(`
      INSERT IGNORE INTO role (Id, Nom, Description) VALUES (3, 'Prestataire', 'Prestataire')
    `);

    // 4. Insérer les profils prestataires
    //    (IdUtilisateur, Experience, TarifHoraire, ZoneIntervention, TypeService, Statut, Bio, NoteMoyenne)
    const prestataires = [
      // Pet-sitting (TypeService=3)
      [10, 5,  3500, 'Alger Centre',     3, 1, 'Passionnée des animaux depuis toujours, je garde vos compagnons avec amour dans mon appartement ou chez vous. Chiens et chats bienvenus.', 4.8],
      [11, 3,  2800, 'Oran Bir El Djir', 3, 1, 'Spécialiste du pet-sitting à domicile. Votre animal est traité comme un membre de la famille. Disponible week-ends et vacances.', 4.5],
      [12, 7,  4200, 'Constantine',      3, 1, 'Vétérinaire de formation, je propose un service de garde médicalisé pour les animaux fragiles ou sous traitement.', 4.9],
      // Promenade (TypeService=4)
      [13, 2,  1500, 'Alger El Biar',    4, 1, 'Promeneur certifié, je propose des sorties quotidiennes adaptées à chaque chien. Groupes de 3 max pour un suivi optimal.', 4.6],
      [14, 4,  1800, 'Blida',            4, 1, 'Ancien éducateur canin reconverti dans la promenade. Je maîtrise les techniques de laisse et socialisation.', 4.7],
      [15, 6,  2000, 'Alger Hydra',      4, 1, 'Sortie matin et soir, rapport photos inclus. Je couvre Alger centre et Hydra. Tarif dégressif dès 5 sorties par semaine.', 4.4],
    ];

    for (const p of prestataires) {
      await conn.query(`
        INSERT IGNORE INTO profil_prestataire
          (IdUtilisateur, Experience, TarifHoraire, ZoneIntervention, TypeService, Statut, Bio, NoteMoyenne)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, p);
    }
    console.log("✓ Profils prestataires insérés");

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n🎉 Seed prestataires terminé avec succès !");

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    if (err.sqlMessage) console.error("SQL:", err.sqlMessage);
  } finally {
    if (conn) await conn.end();
  }
};

seed();
