import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [prestataires] = await db.query("SELECT Id, IdUtilisateur, Experience, Bio FROM profil_prestataire");
    prestataires.forEach(p => console.log(`Id: ${p.Id}, IdUser: ${p.IdUtilisateur}, Exp: ${p.Experience}`));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
