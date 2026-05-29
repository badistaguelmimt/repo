import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [users] = await db.query("SELECT Id, Nom, Prenom, Role FROM utilisateur WHERE Id <= 20");
    console.log("Users <= 20:", users);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
