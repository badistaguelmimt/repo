import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM race");
    console.log(rows);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
