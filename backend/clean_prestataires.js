import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    console.log("Starting prestataires cleanup...");
    
    const mockIds = [1, 2, 3, 90001, 180001, 180002, 180003, 180004, 180005, 180006];
    
    if (mockIds.length > 0) {
      await db.query(`DELETE FROM disponibilite WHERE IdProfil IN (?)`, [mockIds]).catch(e => console.log('Dispo:', e.message));
      await db.query(`DELETE FROM reservation WHERE IdProfil IN (?)`, [mockIds]).catch(e => console.log('Resa:', e.message));
      await db.query(`DELETE FROM specification WHERE IdProfil IN (?)`, [mockIds]).catch(e => console.log('Spec:', e.message));
      
      const [res] = await db.query(`DELETE FROM profil_prestataire WHERE Id IN (?)`, [mockIds]);
      console.log(`Deleted ${res.affectedRows} mock prestataires.`);
    }
    console.log("Cleanup complete!");
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
  process.exit(0);
}
run();
