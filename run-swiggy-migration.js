import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running Swiggy PO fields migration...');

    const migrationSQL = readFileSync('./migrations/add-swiggy-po-fields-migration.sql', 'utf8');

    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
