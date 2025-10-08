// Run Amazon trigger fix migration
import { pool } from './db';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

async function runMigration() {
  console.log('🔧 Starting Amazon trigger fix migration...');

  try {
    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'fix-amazon-trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing SQL from fix-amazon-trigger.sql...');

    // Execute SQL using the existing pool
    await pool.query(sql);

    console.log('✅ Amazon trigger function updated successfully!');
    console.log('✅ The trigger now uses "create_on" instead of "created_on"');
    console.log('✅ Amazon PO imports should now work correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : error);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run migration
runMigration();
