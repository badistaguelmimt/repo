import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    // Check animals
    const [animals] = await db.query(
      `SELECT COUNT(*) as count FROM animal WHERE Id NOT IN (SELECT IdAnimal FROM possession WHERE IdRefuge IS NOT NULL)`
    );
    console.log(`Animaux à supprimer (ajoutés manuellement) : ${animals[0].count}`);

    // Check products
    const [produits] = await db.query(
      `SELECT COUNT(*) as count FROM produit WHERE IdRefuge IS NULL`
    );
    console.log(`Produits à supprimer (ajoutés manuellement) : ${produits[0].count}`);
    
    // Check total animals
    const [totalAnimals] = await db.query(`SELECT COUNT(*) as count FROM animal`);
    console.log(`Total animaux : ${totalAnimals[0].count}`);

    // Check total products
    const [totalProduits] = await db.query(`SELECT COUNT(*) as count FROM produit`);
    console.log(`Total produits : ${totalProduits[0].count}`);

  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
