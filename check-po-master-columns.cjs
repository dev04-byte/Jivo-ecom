const { Pool } = require('pg');

async function checkPoMasterColumns() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 po_master table columns:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'po_master'
      ORDER BY ordinal_position;
    `);
    console.table(columnsResult.rows);

    console.log('\n📋 po_lines table columns:');
    const linesColumnsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'po_lines'
      ORDER BY ordinal_position;
    `);
    console.table(linesColumnsResult.rows);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkPoMasterColumns();
