import { connectDB, db } from "./src/config/db.js";

async function main() {
  await connectDB();
  
  const [fks] = await db.query(`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA = 'adopty'
      AND REFERENCED_TABLE_NAME = 'utilisateur'
      AND REFERENCED_COLUMN_NAME = 'Id';
  `);
  console.log("Tables referencing utilisateur.Id:");
  console.table(fks);
  
  process.exit(0);
}
main();
