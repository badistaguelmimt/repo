import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM produit");
    console.log("Produit columns:", rows.map(r => r.Field));
    
    // Let's also check if there are any products that the user considers 'manual'
    // Maybe they belong to a specific refuge or something?
    // Let's list all products with their IdRefuge
    const [prods] = await db.query("SELECT Id, Nom, IdRefuge FROM produit LIMIT 5");
    console.log("Sample products:", prods);

  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
