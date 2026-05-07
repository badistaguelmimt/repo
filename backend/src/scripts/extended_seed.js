import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
};

const extendedSeed = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("🚀 Lancement du seeding étendu...");

    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 1. Utilisateurs Supplémentaires (Prestataires et Clients)
    console.log("👥 Ajout des utilisateurs...");
    await connection.query(`
      INSERT IGNORE INTO utilisateur (Id, clerkId, Nom, Prenom, AddresseEmail, MotDePasse, CreeLe) VALUES 
      (10, 'user_p_2', 'Karim', 'Samy', 'samy.pets@test.com', 'password123', NOW()),
      (11, 'user_p_3', 'Zahra', 'Amel', 'amel.care@test.com', 'password123', NOW()),
      (12, 'user_u_2', 'Mansouri', 'Yasmine', 'yasmine.m@test.com', 'password123', NOW()),
      (13, 'user_u_3', 'Belkacem', 'Omar', 'omar.b@test.com', 'password123', NOW())
    `);

    // Rôles pour les nouveaux utilisateurs
    await connection.query(`INSERT IGNORE INTO role_utilisateur (IdUtilisateur, IdRole) VALUES (10, 3), (11, 3), (12, 4), (13, 4)`);

    // 2. Profils Prestataires
    console.log("🐕 Création des profils prestataires...");
    await connection.query(`
      INSERT IGNORE INTO profil_prestataire (Id, IdUtilisateur, Experience, TarifHoraire, ZoneIntervention, TypeService, Statut, Bio, NoteMoyenne) VALUES 
      (1, 4, '5 ans d''expérience en toilettage canin.', 2500.00, 'Alger Est', 'Toilettage', 4, 'Passionné par le bien-être animal depuis mon plus jeune âge.', 4.8),
      (2, 10, 'Ancien assistant vétérinaire.', 1800.00, 'Alger Centre', 'Garde à domicile', 4, 'Je m''occupe de vos animaux comme si c''étaient les miens.', 4.9),
      (3, 11, 'Spécialiste en comportement félin.', 3000.00, 'Oran', 'Comportementaliste', 4, 'Aide à résoudre les problèmes de cohabitation.', 5.0)
    `);

    // 3. Nouveaux Animaux
    console.log("🐾 Ajout de nouveaux animaux...");
    const moreAnimals = [
      // Id, Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race
      [10, 'Rex', 'Rex', 4, 'M', 35.0, 0.7, 'Noir et Feu', 'Parfaite', 'oui', 'Protecteur', 'Haut', 'oui', 'non', 1, 2],
      [11, 'Misty', 'Misty', 2, 'F', 5.0, 0.35, 'Argenté', 'Excellente', 'oui', 'Calme', 'Bas', 'oui', 'oui', 1, 4],
      [12, 'Hulk', 'Hulk', 6, 'M', 8.0, 0.45, 'Marbré', 'Bonne', 'oui', 'Actif', 'Haut', 'non', 'non', 1, 5],
      [13, 'Snow', 'Snow', 1, 'F', 1.2, 0.18, 'Blanc', 'Bonne', 'non', 'Timide', 'Bas', 'oui', 'oui', 1, 7],
      [14, 'Cooper', 'Cooper', 3, 'M', 28.0, 0.62, 'Chocolat', 'Excellente', 'oui', 'Amical', 'Moyen', 'oui', 'oui', 1, 3],
      [15, 'Ginger', 'Ginger', 2, 'F', 4.8, 0.32, 'Rousse', 'Suivi', 'oui', 'Espiègle', 'Moyen', 'oui', 'non', 1, 5],
      [16, 'Shadow', 'Shadow', 5, 'M', 30.0, 0.65, 'Noir', 'Bonne', 'oui', 'Indépendant', 'Moyen', 'non', 'oui', 1, 2],
      [17, 'Daisy', 'Daisy', 2, 'F', 24.0, 0.58, 'Crème', 'Excellente', 'oui', 'Douce', 'Bas', 'oui', 'oui', 1, 1],
      [18, 'Nala', 'Nala', 4, 'F', 6.0, 0.4, 'Écaille de tortue', 'Bonne', 'oui', 'Majestueuse', 'Bas', 'non', 'non', 1, 6],
      [19, 'Pixel', 'Pixel', 1, 'M', 0.8, 0.12, 'Gris', 'Bonne', 'non', 'Vif', 'Haut', 'oui', 'oui', 1, 8]
    ];

    const morePhotos = [
      '/chien-loup-animaux-domestiques-sauvages-evolution-cerveau-intelligence-domestication-moteur-de-recherche.jpg',
      '/04et05B_MondouChatsRefuges1.jpeg',
      '/les-animaux-domestiques-sont-ils-doues-dintuition.webp',
      '/Kaninchen im Freigehege (2)-4440x3072-1920x1328.jpg',
      '/B9723964194Z.1_20200708223738_000+G6HGA5Q6J.1-0.jpg',
      '/chatterie_association_du_chat_libre-1-1024x664.jpg',
      '/LKQBNJHAK5DXRNNEDV2WEQOP4Q.jpg',
      '/dog-g3f8bcf435_720.jpg',
      '/pets 3 flickr.jpg',
      '/2000005545891.webp'
    ];

    for (let i = 0; i < moreAnimals.length; i++) {
      const a = moreAnimals[i];
      await connection.query(`
        INSERT IGNORE INTO animal (Id, Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race, Date_ajout) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, a);
      
      const refugeId = a[0] % 2 === 0 ? 1 : 2;
      await connection.query(`INSERT IGNORE INTO possession (IdAnimal, IdRefuge) VALUES (?, ?)`, [a[0], refugeId]);
      await connection.query(`INSERT IGNORE INTO photo (IdAnimal, Url) VALUES (?, ?)`, [a[0], morePhotos[i]]);
    }

    // 4. Produits Supplémentaires
    console.log("🛍️ Ajout de nouveaux produits...");
    const moreProducts = [
      [10, 1, 'Harnais de Randonnée Ergonomique', 45.00, 30, 'Accessoires', 0, 1, '/istockphoto-577960242-170667a.jpg'],
      [11, 1, 'Fontaine à eau filtrante 2L', 39.99, 15, 'Hygiène', 15.0, 1, '/2000005545891.webp'],
      [12, 2, 'Litière Auto-Nettoyante', 199.00, 5, 'Hygiène', 0, 1, '/pets 3 flickr.jpg'],
      [13, 2, 'Pointeur Laser Interactif', 9.99, 50, 'Jouets', 0, 1, '/2000005545891.webp'],
      [14, 1, 'Sac de Transport Aéré', 55.00, 12, 'Accessoires', 10.0, 1, '/LKQBNJHAK5DXRNNEDV2WEQOP4Q.jpg'],
      [15, 1, 'Brosse Anti-Poils Vapeur', 24.50, 40, 'Soins', 0, 1, '/photo-1450778869180-41d0601e046e.avif'],
      [16, 2, 'Lot de 5 Jouets Menthe à Chat', 12.00, 60, 'Jouets', 0, 1, '/2000005545891.webp']
    ];

    for (const p of moreProducts) {
      await connection.query(`
        INSERT IGNORE INTO produit (Id, IdRefuge, Nom, Prix, Stock, Categorie, Reduction, Disponibilite) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)
      `, p.slice(0, 8));
      await connection.query(`INSERT IGNORE INTO photo (IdProduit, Url) VALUES (?, ?)`, [p[0], p[8]]);
    }

    // 5. Avis Clients
    console.log("⭐ Ajout des avis...");
    await connection.query(`
      INSERT IGNORE INTO avis (IdUtilisateur, IdProduit, Note, Commentaire) VALUES 
      (5, 1, 5, 'Mes chiens adorent ces croquettes, leur poil est devenu magnifique.'),
      (12, 3, 4, 'L''arbre à chat est immense ! Un peu long à monter mais solide.'),
      (13, 10, 5, 'Le harnais est parfait pour les longues marches en forêt.'),
      (5, 11, 4, 'Bonne fontaine, très silencieuse.')
    `);

    // 6. Annonces de services
    console.log("📢 Création d'annonces de services...");
    await connection.query(`
      INSERT IGNORE INTO annonce (Id, IdUtilisateur, IdAnimal, TypeService, DateDebut, DateFin, PrixSouhaite, Statut) VALUES 
      (1, 5, 1, 'Garderie', '2024-06-01', '2024-06-05', 5000.00, 1),
      (2, 12, 2, 'Promenade', '2024-05-20', '2024-05-20', 1000.00, 1)
    `);

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n✨ Seeding étendu terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du seeding étendu :", error);
  } finally {
    if (connection) await connection.end();
  }
};

extendedSeed();
