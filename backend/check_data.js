import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [refuges] = await db.query("SELECT Id, Nom FROM refuge");
    console.log("All refuges:", refuges);
    
    // Find how many products per refuge
    const [prodCounts] = await db.query("SELECT IdRefuge, COUNT(*) as c FROM produit GROUP BY IdRefuge");
    console.log("Products per refuge:", prodCounts);

    // Find how many animals per refuge
    const [animCounts] = await db.query("SELECT IdRefuge, COUNT(*) as c FROM possession WHERE IdRefuge IS NOT NULL GROUP BY IdRefuge");
    console.log("Animals per refuge (in possession):", animCounts);

    // Find animals NOT in possession
    const [animNull] = await db.query("SELECT Id, Nom FROM animal WHERE Id NOT IN (SELECT IdAnimal FROM possession WHERE IdRefuge IS NOT NULL)");
    console.log("Animals with no refuge:", animNull);

  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
