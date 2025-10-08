const { Pool } = require('pg');

async function checkSchemas() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 po_master table schema:');
    const poMasterSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'po_master'
      ORDER BY ordinal_position;
    `);
    console.table(poMasterSchema.rows);

    console.log('\n📋 po_lines table schema:');
    const poLinesSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'po_lines'
      ORDER BY ordinal_position;
    `);
    console.table(poLinesSchema.rows);

    console.log('\n📋 Platforms list with IDs:');
    const platforms = await client.query(`
      SELECT id, name
      FROM platforms
      ORDER BY id;
    `);
    console.table(platforms.rows);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkSchemas();
