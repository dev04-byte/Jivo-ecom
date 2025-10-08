const { Pool } = require('pg');
require('dotenv').config();

async function checkAllColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking ALL po_lines table columns...\n');

    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'po_lines'
      ORDER BY ordinal_position;
    `);

    console.log('📋 All columns in po_lines table:\n');
    result.rows.forEach((row, index) => {
      let typeInfo = row.data_type;
      if (row.character_maximum_length) {
        typeInfo += `(${row.character_maximum_length})`;
      } else if (row.numeric_precision) {
        typeInfo += `(${row.numeric_precision},${row.numeric_scale})`;
      }
      console.log(`  ${(index + 1).toString().padStart(2)}. ${row.column_name.padEnd(30)} → ${typeInfo.padEnd(25)} ${row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    console.log('\n🔎 Looking for: isLiter, looseQty');
    const hasIsLiter = result.rows.find(r => r.column_name.toLowerCase() === 'isliter');
    const hasLooseQty = result.rows.find(r => r.column_name.toLowerCase() === 'looseqty');

    console.log(`  isLiter: ${hasIsLiter ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`  looseQty: ${hasLooseQty ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkAllColumns();
