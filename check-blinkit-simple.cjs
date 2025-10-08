const { Pool } = require('pg');

async function checkBlinkitSimple() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Checking blinkit_po_header data:');
    const headerData = await client.query(`
      SELECT id, po_number, po_date, total_items, total_amount
      FROM blinkit_po_header
      ORDER BY id DESC
      LIMIT 5;
    `);
    console.log(`Found ${headerData.rows.length} records`);
    console.table(headerData.rows);

    console.log('\n📋 Checking blinkit_po_lines data:');
    const linesData = await client.query(`
      SELECT COUNT(*) as count FROM blinkit_po_lines;
    `);
    console.log(`Total line items: ${linesData.rows[0].count}`);

    console.log('\n📋 Checking po_master for Blinkit:');
    const poMasterData = await client.query(`
      SELECT COUNT(*) as count FROM po_master WHERE platform_id = 1;
    `);
    console.log(`Blinkit records in po_master: ${poMasterData.rows[0].count}`);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBlinkitSimple();
