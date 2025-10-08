const { Pool } = require('pg');
require('dotenv').config();

async function checkPlatformName() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking po_master.platform_name column type...\n');

    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'po_master'
      AND column_name IN ('platform_id', 'platform_name');
    `);

    console.log('📋 Platform columns in po_master:\n');
    result.rows.forEach(row => {
      let typeInfo = row.data_type;
      if (row.character_maximum_length) {
        typeInfo += `(${row.character_maximum_length})`;
      }
      console.log(`  ${row.column_name.padEnd(20)} → ${typeInfo.padEnd(25)} ${row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    // Check existing BigBasket records
    const bbRecords = await pool.query(`
      SELECT platform_id, platform_name, po_number
      FROM po_master
      WHERE platform_id = 2 OR platform_id = 12
      LIMIT 5;
    `);

    console.log('\n📋 Existing BigBasket records in po_master:\n');
    if (bbRecords.rows.length === 0) {
      console.log('  ❌ No BigBasket records found\n');
    } else {
      bbRecords.rows.forEach(row => {
        console.log(`  PO: ${row.po_number}, Platform ID: ${row.platform_id}, Platform Name: "${row.platform_name}"`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkPlatformName();
