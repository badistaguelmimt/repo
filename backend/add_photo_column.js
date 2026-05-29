import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM race LIKE 'Photo'");
    if (rows.length === 0) {
      console.log("Column 'Photo' does not exist. Adding it...");
      await db.query("ALTER TABLE race ADD COLUMN Photo VARCHAR(255) DEFAULT NULL");
      console.log("Column 'Photo' added successfully.");
    } else {
      console.log("Column 'Photo' already exists.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
