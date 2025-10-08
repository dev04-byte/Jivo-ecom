const { Pool } = require('pg');
require('dotenv').config();

async function checkTypes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking pf_item_mst and items column types...\n');

    const result = await pool.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision
      FROM information_schema.columns
      WHERE (table_name = 'pf_item_mst' AND column_name IN ('sap_id', 'pf_itemcode', 'id', 'pf_id'))
         OR (table_name = 'items' AND column_name IN ('itemcode', 'id'))
      ORDER BY table_name, column_name;
    `);

    console.log('📋 Column types:\n');
    result.rows.forEach(row => {
      let typeInfo = row.data_type;
      if (row.character_maximum_length) {
        typeInfo += `(${row.character_maximum_length})`;
      } else if (row.numeric_precision) {
        typeInfo += `(${row.numeric_precision})`;
      }
      console.log(`  ${row.table_name.padEnd(15)} | ${row.column_name.padEnd(15)} → ${typeInfo}`);
    });

    // Sample data
    console.log('\n📋 Sample data from pf_item_mst (pf_id=12):\n');
    const sampleData = await pool.query(`
      SELECT id, pf_itemcode, sap_id, pf_id, pg_typeof(sap_id) as sap_id_type
      FROM pf_item_mst
      WHERE pf_id = 12
      LIMIT 3;
    `);

    sampleData.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Item Code: ${row.pf_itemcode}, SAP ID: ${row.sap_id} (type: ${row.sap_id_type}), PF ID: ${row.pf_id}`);
    });

    console.log('\n📋 Sample data from items:\n');
    const itemsSample = await pool.query(`
      SELECT id, itemcode, pg_typeof(itemcode) as itemcode_type
      FROM items
      LIMIT 3;
    `);

    itemsSample.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Item Code: ${row.itemcode} (type: ${row.itemcode_type})`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkTypes();
