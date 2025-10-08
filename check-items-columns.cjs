const { Pool } = require('pg');
require('dotenv').config();

async function checkItemsColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking items table structure...\n');

    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'items'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Columns in items table:\n');
    result.rows.forEach((row, index) => {
      let typeInfo = row.data_type;
      if (row.character_maximum_length) {
        typeInfo += `(${row.character_maximum_length})`;
      }
      console.log(`  ${(index + 1).toString().padStart(2)}. ${row.column_name.padEnd(20)} → ${typeInfo}`);
    });

    // Sample data
    console.log('\n📋 Sample items data:\n');
    const sampleData = await pool.query(`
      SELECT itemcode, itemname, invntryuom, salpackun, u_islitre, u_tax_rate, salfactor2
      FROM items
      LIMIT 3;
    `);

    sampleData.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ItemCode: ${row.itemcode}, UOM: ${row.invntryuom}, SalPackUn: ${row.salpackun}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkItemsColumns();
