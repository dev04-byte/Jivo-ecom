const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔧 Starting Amazon trigger fix migration...');

  // Create pool
  const isLocal = process.env.DATABASE_URL?.includes('localhost') ||
                  process.env.DATABASE_URL?.includes('127.0.0.1');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : undefined
  });

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'fix-amazon-trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing SQL from fix-amazon-trigger.sql...');

    // Execute SQL
    await pool.query(sql);

    console.log('✅ Amazon trigger function updated successfully!');
    console.log('✅ The trigger now uses "create_on" instead of "created_on"');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
