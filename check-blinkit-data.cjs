const { Pool } = require('pg');

async function checkBlinkitData() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 blinkit_po_header table columns:');
    const headerColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'blinkit_po_header'
      ORDER BY ordinal_position;
    `);
    console.table(headerColumns.rows);

    console.log('\n📋 Checking blinkit_po_header data:');
    const headerData = await client.query(`
      SELECT *
      FROM blinkit_po_header
      ORDER BY created_at DESC
      LIMIT 3;
    `);
    console.log(`Found ${headerData.rows.length} records`);
    if (headerData.rows.length > 0) {
      console.table(headerData.rows);
    } else {
      console.log('❌ NO DATA in blinkit_po_header table!');
    }

    console.log('\n📋 Checking blinkit_po_lines data:');
    const linesData = await client.query(`
      SELECT *
      FROM blinkit_po_lines
      ORDER BY id DESC
      LIMIT 5;
    `);
    console.log(`Found ${linesData.rows.length} records`);
    if (linesData.rows.length > 0) {
      console.table(linesData.rows);
    } else {
      console.log('❌ NO DATA in blinkit_po_lines table!');
    }

    console.log('\n📋 Checking po_master for Blinkit (platform_id = 1):');
    const poMasterData = await client.query(`
      SELECT id, po_number, platform_id, platform_name, po_date, create_on
      FROM po_master
      WHERE platform_id = 1 OR platform_name LIKE '%Blinkit%'
      ORDER BY create_on DESC
      LIMIT 5;
    `);
    console.log(`Found ${poMasterData.rows.length} records`);
    if (poMasterData.rows.length > 0) {
      console.table(poMasterData.rows);
    } else {
      console.log('❌ NO Blinkit data in po_master table!');
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBlinkitData();
