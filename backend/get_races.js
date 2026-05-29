import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [rows] = await db.query("SELECT Nom FROM race");
    console.log(rows.map(r => r.Nom));
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
