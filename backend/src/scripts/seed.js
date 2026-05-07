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

const seed = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connecté à TiDB Cloud pour le seeding sécurisé.");

    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // On ne vide plus les tables pour préserver les données existantes (conversations, etc.)
    // On utilise INSERT IGNORE pour ne pas créer de doublons sur les IDs fixes
    
    // 1. Rôles et Statuts
    await connection.query("INSERT IGNORE INTO role (Id, Nom, Description) VALUES (1, 'Admin', 'Admin'), (2, 'Refuge', 'Refuge'), (3, 'Prestataire', 'Prestataire'), (4, 'Utilisateur', 'Utilisateur')");
    await connection.query("INSERT IGNORE INTO statut (Id, Statut) VALUES (1, 'Disponible'), (2, 'En attente'), (3, 'Adopté'), (4, 'Validé'), (5, 'Rejeté'), (6, 'En cours'), (7, 'Livré')");
    
    // 2. Espèces et Races
    await connection.query("INSERT IGNORE INTO espece (Id, Nom, Description) VALUES (1, 'Chien', 'Chien'), (2, 'Chat', 'Chat'), (3, 'Lapin', 'Lapin'), (4, 'Hamster', 'Hamster')");

    const races = [
      { Id: 1, Nom: 'Golden Retriever', Description: 'Le Golden Retriever est un chien intelligent, amical et dévoué.', Espece: 1, Origine: 'Écosse', EsperanceVie: '12', TailleMoyenne: 0.60 },
      { Id: 2, Nom: 'Berger Allemand', Description: 'Le Berger Allemand est courageux, intelligent et polyvalent.', Espece: 1, Origine: 'Allemagne', EsperanceVie: '11', TailleMoyenne: 0.65 },
      { Id: 3, Nom: 'Labrador', Description: 'Le Labrador est connu pour sa gentillesse et son intelligence.', Espece: 1, Origine: 'Canada', EsperanceVie: '12', TailleMoyenne: 0.57 },
      { Id: 4, Nom: 'Siamois', Description: 'Le Siamois est une race de chat très bavarde et attachée à son maître.', Espece: 2, Origine: 'Thaïlande', EsperanceVie: '15', TailleMoyenne: 0.30 },
      { Id: 5, Nom: 'Bengal', Description: 'Le Bengal est un chat actif aux allures de petit léopard.', Espece: 2, Origine: 'USA', EsperanceVie: '14', TailleMoyenne: 0.35 },
      { Id: 6, Nom: 'Main Coon', Description: 'Le Maine Coon est l\'un des plus grands chats domestiques.', Espece: 2, Origine: 'USA', EsperanceVie: '13', TailleMoyenne: 0.40 },
      { Id: 7, Nom: 'Bélier', Description: 'Le lapin Bélier est reconnaissable à ses longues oreilles tombantes.', Espece: 3, Origine: 'Europe', EsperanceVie: '10', TailleMoyenne: 0.25 },
      { Id: 8, Nom: 'Russe', Description: 'Le hamster Russe est petit et vif.', Espece: 4, Origine: 'Asie', EsperanceVie: '2', TailleMoyenne: 0.10 }
    ];

    for (const r of races) {
      await connection.query(
        "INSERT INTO race (Id, Nom, Description, Espece, Origine, EsperanceVie, TailleMoyenne) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE Description=VALUES(Description), Origine=VALUES(Origine), EsperanceVie=VALUES(EsperanceVie), TailleMoyenne=VALUES(TailleMoyenne)",
        [r.Id, r.Nom, r.Description, r.Espece, r.Origine, r.EsperanceVie, r.TailleMoyenne]
      );
    }

    // 3. Utilisateurs de base
    await connection.query(`
      INSERT IGNORE INTO utilisateur (Id, clerkId, Nom, Prenom, AddresseEmail, MotDePasse, CreeLe) VALUES 
      (1, 'user_admin_1', 'Admin', 'Adopty', 'admin@adopty.com', 'password123', NOW()),
      (2, 'user_refuge_1', 'Dupont', 'Jean', 'jean.refuge@test.com', 'password123', NOW()),
      (3, 'user_refuge_2', 'Martin', 'Sophie', 'sophie.refuge@test.com', 'password123', NOW()),
      (4, 'user_prestataire_1', 'Lemoine', 'Pierre', 'pierre.toilettage@test.com', 'password123', NOW()),
      (5, 'user_standard_1', 'Boulanger', 'Alice', 'alice.user@test.com', 'password123', NOW())
    `);

    // 4. Refuges
    await connection.query(`
      INSERT IGNORE INTO refuge (Id, Nom, Description, Addresse, Telephone, Date_inscription) VALUES 
      (1, 'Refuge de l''Espoir', 'Un havre de paix pour nos amis à quatre pattes.', 'Alger, Centre', '0550123456', NOW()),
      (2, 'Le Repaire des Matous', 'Spécialisé dans l''accueil des félins.', 'Oran, Front de mer', '0550987654', NOW())
    `);

    // 5. Animaux (Utilisant les images réelles du dossier public)
    const animals = [
      // Id, Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race
      [1, 'Buddy', 'Buddy', 3, 'M', 25.5, 0.6, 'Sable', 'Excellente', 'oui', 'Joueur', 'Haut', 'oui', 'oui', 1, 1],
      [2, 'Luna', 'Luna', 2, 'F', 4.2, 0.3, 'Gris', 'Bonne', 'oui', 'Calme', 'Moyen', 'oui', 'oui', 1, 4],
      [3, 'Max', 'Max', 5, 'M', 32.0, 0.7, 'Noir', 'Suivi', 'oui', 'Protecteur', 'Haut', 'non', 'oui', 1, 2],
      [4, 'Bella', 'Bella', 1, 'F', 18.0, 0.5, 'Blanc', 'Bonne', 'oui', 'Affectueux', 'Moyen', 'oui', 'oui', 1, 3],
      [5, 'Simba', 'Simba', 4, 'M', 5.5, 0.4, 'Roux', 'Excellente', 'oui', 'Indépendant', 'Bas', 'non', 'non', 1, 5],
      [6, 'Oscar', 'Oscar', 1, 'M', 1.5, 0.2, 'Blanc', 'Bonne', 'non', 'Curieux', 'Moyen', 'oui', 'oui', 1, 7]
    ];

    const animalPhotos = [
      '/dog-g3f8bcf435_720.jpg',
      '/04et05B_MondouChatsRefuges1.jpeg',
      '/photo-1450778869180-41d0601e046e.avif',
      '/B9727898820Z.1_20210804173826_000+GE1IMEK0I.1-0.jpg',
      '/chatterie_association_du_chat_libre-1-1024x664.jpg',
      '/Kaninchen im Freigehege (2)-4440x3072-1920x1328.jpg'
    ];

    for (let i = 0; i < animals.length; i++) {
      const a = animals[i];
      await connection.query(`
        INSERT IGNORE INTO animal (Id, Nom, Prenom, Age, Genre, Poids, Taille, Couleur, EtatSantee, Sterilise, Temperament, NiveauEnergetique, SociableEnfant, SociableAnimaux, Statut, Race, Date_ajout) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, a);
      
      // Lier au refuge (1-4 au refuge 1, 5-6 au refuge 2)
      const refugeId = a[0] <= 4 ? 1 : 2;
      await connection.query(`INSERT IGNORE INTO possession (IdAnimal, IdRefuge) VALUES (?, ?)`, [a[0], refugeId]);

      // Ajouter la photo
      await connection.query(`INSERT IGNORE INTO photo (IdAnimal, Url) VALUES (?, ?)`, [a[0], animalPhotos[i]]);
    }

    // 6. Produits
    const products = [
      [1, 1, 'Croquettes Premium Chien 12kg', 59.99, 50, 'Alimentation', 0, 1, '/contenu4_abdd4e5c6d_duuW3kG9s.webp'],
      [2, 1, 'Collier Cuir Ajustable', 15.50, 20, 'Accessoires', 10.0, 1, '/istockphoto-577960242-170667a.jpg'],
      [3, 2, 'Arbre à chat XXL', 89.00, 10, 'Hygiène', 0, 1, '/pets 3 flickr.jpg'],
      [4, 2, 'Jouet Souris Sisal', 4.99, 100, 'Jouets', 0, 1, '/2000005545891.webp'],
      [5, 1, 'Panier Moelleux Confort', 35.00, 15, 'Accessoires', 5.0, 1, '/LKQBNJHAK5DXRNNEDV2WEQOP4Q.jpg']
    ];

    for (const p of products) {
      await connection.query(`
        INSERT IGNORE INTO produit (Id, IdRefuge, Nom, Prix, Stock, Categorie, Reduction, Disponibilite) VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)
      `, p.slice(0, 8));
      
      // Ajouter la photo du produit
      await connection.query(`INSERT IGNORE INTO photo (IdProduit, Url) VALUES (?, ?)`, [p[0], p[8]]);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\n✨ Seeding sécurisé terminé !");
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error);
  } finally {
    if (connection) await connection.end();
  }
};
seed();
