import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function applyFix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = fs.readFileSync('fix-blinkit-trigger.sql', 'utf8');
    console.log('📝 Executing SQL fix...');

    await client.query(sql);

    console.log('✅ Blinkit trigger fix applied successfully!');
    console.log('✅ You can now import Blinkit POs');
  } catch (error) {
    console.error('❌ Error applying fix:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyFix();
