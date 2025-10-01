const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');
require('dotenv').config();

neonConfig.webSocketConstructor = ws;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDistributors() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking distributors table...\n');

    const result = await client.query('SELECT id, distributor_name FROM distributors ORDER BY distributor_name');

    console.log(`✅ Found ${result.rows.length} distributors in the table:`);
    result.rows.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.distributor_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDistributors();
