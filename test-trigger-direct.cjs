const { Pool } = require('pg');
require('dotenv').config();

async function testTriggerDirect() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Testing trigger with detailed error logging...\n');

    const client = await pool.connect();

    // Get a real item from pf_item_mst
    const testItem = await client.query(`
      SELECT pim.id, pim.pf_itemcode, pim.sap_id, pim.pf_id
      FROM pf_item_mst pim
      WHERE pim.pf_id::text = '12'
      LIMIT 1;
    `);

    if (testItem.rows.length === 0) {
      console.log('❌ No items found in pf_item_mst for BigBasket (pf_id=12)');
      await pool.end();
      return;
    }

    console.log('✅ Found test item:', testItem.rows[0]);

    // Check if this item exists in items table
    const itemsCheck = await client.query(`
      SELECT id, itemcode
      FROM items
      WHERE itemcode::text = TRIM($1)::text
      LIMIT 1;
    `, [testItem.rows[0].sap_id]);

    console.log('\n🔍 Checking if SAP ID exists in items table...');
    if (itemsCheck.rows.length === 0) {
      console.log('❌ SAP ID not found in items table:', testItem.rows[0].sap_id.trim());
      console.log('   This is why the trigger fails - the JOIN to items table has no match');

      // Find any item that has a valid mapping
      console.log('\n🔍 Looking for items with valid mappings...');
      const validMapping = await client.query(`
        SELECT pim.id, pim.pf_itemcode, TRIM(pim.sap_id) as sap_id, i.itemcode
        FROM pf_item_mst pim
        JOIN items i ON TRIM(pim.sap_id)::text = i.itemcode::text
        WHERE pim.pf_id::text = '12'
        LIMIT 1;
      `);

      if (validMapping.rows.length > 0) {
        console.log('✅ Found item with valid mapping:', validMapping.rows[0]);
      } else {
        console.log('❌ No items in pf_item_mst (pf_id=12) have matching SAP IDs in items table');
        console.log('   This means BigBasket PO imports will fail on the trigger');
      }
    } else {
      console.log('✅ SAP ID found in items table:', itemsCheck.rows[0]);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
  }
}

testTriggerDirect();
