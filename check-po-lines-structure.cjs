const { Pool } = require('pg');
require('dotenv').config();

async function checkStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking po_lines table structure...\n');

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
      AND column_name IN (
        'itemname', 'quantity', 'basic_amount', 'platform_product_code_id',
        'sap_id', 'uom', 'unitsize', 'isLiter', 'tax', 'boxes',
        'total_liter', 'looseQty', 'landing_amount', 'total_amount'
      )
      ORDER BY ordinal_position;
    `);

    console.log('📋 Column types in po_lines table:\n');
    result.rows.forEach(row => {
      let typeInfo = row.data_type;
      if (row.character_maximum_length) {
        typeInfo += `(${row.character_maximum_length})`;
      } else if (row.numeric_precision) {
        typeInfo += `(${row.numeric_precision},${row.numeric_scale})`;
      }
      console.log(`  ${row.column_name.padEnd(25)} → ${typeInfo.padEnd(20)} ${row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkStructure();
