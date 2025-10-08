const { Pool } = require('pg');
require('dotenv').config();

async function testBigBasketImport() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Testing BigBasket import with triggers...\n');

    const client = await pool.connect();

    // Start a transaction for testing
    await client.query('BEGIN');

    try {
      // Test data
      const testHeader = {
        po_number: 'TEST_BB_' + Date.now(),
        po_date: new Date(),
        po_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        supplier_name: 'Test Supplier',
        total_items: 1,
        total_quantity: 10,
        grand_total: 1000.50,
        created_by: 'test_user'
      };

      console.log('📝 Inserting test header:', testHeader.po_number);

      // Insert header
      const headerResult = await client.query(`
        INSERT INTO bigbasket_po_header (
          po_number, po_date, po_expiry_date, supplier_name,
          total_items, total_quantity, grand_total, created_by,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, po_number;
      `, [
        testHeader.po_number,
        testHeader.po_date,
        testHeader.po_expiry_date,
        testHeader.supplier_name,
        testHeader.total_items,
        testHeader.total_quantity,
        testHeader.grand_total,
        testHeader.created_by
      ]);

      const headerId = headerResult.rows[0].id;
      console.log('✅ Header inserted with ID:', headerId);

      // Check if trigger inserted into po_master
      const masterCheck = await client.query(`
        SELECT id, po_number, platform_id, platform_name
        FROM po_master
        WHERE po_number = $1;
      `, [testHeader.po_number]);

      if (masterCheck.rows.length > 0) {
        console.log('✅ Header trigger worked! Record in po_master:');
        console.log('   ', masterCheck.rows[0]);
      } else {
        console.log('❌ Header trigger failed - no record in po_master');
      }

      // Now test line insertion (this would require a valid sku_code that exists in pf_item_mst)
      console.log('\n📝 Checking for test items in pf_item_mst (platform_id=12)...');
      const testItem = await client.query(`
        SELECT pim.id, pim.pf_itemcode, pim.sap_id, i.itemcode
        FROM pf_item_mst pim
        JOIN items i ON TRIM(pim.sap_id)::text = i.itemcode::text
        WHERE pim.pf_id::text = '12'
        LIMIT 1;
      `);

      if (testItem.rows.length > 0) {
        console.log('✅ Found test item:', testItem.rows[0].pf_itemcode);

        const testLine = {
          po_id: headerId,
          s_no: 1,
          sku_code: testItem.rows[0].pf_itemcode,
          description: 'Test Product',
          quantity: 10,
          basic_cost: 100.00
        };

        console.log('\n📝 Inserting test line...');

        const lineResult = await client.query(`
          INSERT INTO bigbasket_po_lines (
            po_id, s_no, sku_code, description, quantity, basic_cost, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING id, sku_code;
        `, [
          testLine.po_id,
          testLine.s_no,
          testLine.sku_code,
          testLine.description,
          testLine.quantity,
          testLine.basic_cost
        ]);

        console.log('✅ Line inserted with ID:', lineResult.rows[0].id);

        // Check if trigger inserted into po_lines
        const linesCheck = await client.query(`
          SELECT COUNT(*) as count
          FROM po_lines
          WHERE platform_product_code_id = $1;
        `, [testItem.rows[0].id]);

        if (parseInt(linesCheck.rows[0].count) > 0) {
          console.log('✅ Line trigger worked! Record in po_lines');
        } else {
          console.log('❌ Line trigger might have failed - no matching record in po_lines');
        }
      } else {
        console.log('⚠️  No items found in pf_item_mst for BigBasket (pf_id=12)');
        console.log('   Skipping line insertion test');
      }

      // Rollback the test transaction
      await client.query('ROLLBACK');
      console.log('\n🔄 Test transaction rolled back (no data saved)\n');

      console.log('✅ BigBasket import test completed!');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nError details:', error);
    await pool.end();
    process.exit(1);
  }
}

testBigBasketImport();
