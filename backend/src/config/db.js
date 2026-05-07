import mysql from "mysql2/promise";
import { ENV } from "./env.js";

// Instance du pool de connexions partagée dans toute l'application
export let db;

// Crée un pool de connexions MySQL vers TiDB Cloud.
// Un pool (et non une connexion unique) permet de gérer plusieurs requêtes simultanées
// sans avoir à ouvrir/fermer une connexion à chaque fois.
export const connectDB = async () => {
  try {
    if (db) return db;

    db = mysql.createPool({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASS,
      database: ENV.DB_NAME,
      ssl: { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    console.log(`Connecté à la base de données: ${ENV.DB_HOST}`);
  } catch (error) {
    console.error("Erreur de connexion à la base de données :", error);
    process.exit(1);
  }
};