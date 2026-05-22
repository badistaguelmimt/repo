/**
 * migrate_disponibilite_recurrence_fin.js
 *
 * Adds the `RecurrenceFin` column to the `disponibilite` table if it does not already exist.
 * This column was added in the "exams" commit and is required by AvailabilityCalendar.
 *
 * Run: node src/scripts/migrate_disponibilite_recurrence_fin.js
 */

import { connectDB } from '../config/db.js';

const run = async () => {
  const db = await connectDB();

  // Check if column already exists
  const [rows] = await db.query(`
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'disponibilite'
      AND COLUMN_NAME = 'RecurrenceFin'
  `);

  if (rows[0].count > 0) {
    console.log('✅ La colonne RecurrenceFin existe déjà — migration ignorée.');
    process.exit(0);
  }

  await db.query(`
    ALTER TABLE disponibilite
    ADD COLUMN RecurrenceFin DATETIME NULL DEFAULT NULL
      COMMENT 'Date de fin de la récurrence (null = récurrence indéfinie)';
  `);

  console.log('✅ Colonne RecurrenceFin ajoutée avec succès à la table disponibilite.');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Erreur lors de la migration:', err.message);
  process.exit(1);
});
