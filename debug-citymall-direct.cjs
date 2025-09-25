// Direct CityMall insertion without transactions for debugging
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@103.89.44.240:5432/ecom',
  ssl: false
});

async function debugDirectInsertion() {
  try {
    console.log('🔧 Testing direct CityMall insertion without transactions...');

    const testHeader = {
      po_number: 'DIRECT-TEST-' + Date.now(),
      po_date: new Date(),
      vendor_name: 'Direct Test Vendor',
      vendor_gstin: 'DIRECT123456789',
      total_amount: 1000.00,
      created_by: 'direct-test',
      status: 'Open',
      total_quantity: 1
    };

    console.log('📋 Inserting test header directly...');
    const headerResult = await pool.query(`
      INSERT INTO city_mall_po_header (po_number, po_date, vendor_name, vendor_gstin, total_amount, created_by, status, total_quantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [testHeader.po_number, testHeader.po_date, testHeader.vendor_name, testHeader.vendor_gstin, testHeader.total_amount, testHeader.created_by, testHeader.status, testHeader.total_quantity]);

    console.log('✅ Header inserted with ID:', headerResult.rows[0].id);

    const testLine = {
      po_header_id: headerResult.rows[0].id,
      line_number: 1,
      article_id: 'DIRECT001',
      article_name: 'Direct Test Article',
      hsn_code: '87654321',
      quantity: 1,
      mrp: 100.00,
      base_cost_price: 80.00,
      total_amount: 80.00
    };

    console.log('📝 Inserting test line directly...');
    const lineResult = await pool.query(`
      INSERT INTO city_mall_po_lines (po_header_id, line_number, article_id, article_name, hsn_code, quantity, mrp, base_cost_price, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [testLine.po_header_id, testLine.line_number, testLine.article_id, testLine.article_name, testLine.hsn_code, testLine.quantity, testLine.mrp, testLine.base_cost_price, testLine.total_amount]);

    console.log('✅ Line inserted with ID:', lineResult.rows[0].id);

    // Verify data persists
    console.log('🔍 Verifying data persistence...');
    const verification = await pool.query('SELECT COUNT(*) FROM city_mall_po_header WHERE po_number = $1', [testHeader.po_number]);
    console.log('📊 Verification result:', verification.rows[0].count, 'headers found');

    if (verification.rows[0].count > 0) {
      console.log('✅ SUCCESS: Direct insertion worked, data persists!');
      console.log('📋 This confirms the database connection and tables are working');
    } else {
      console.log('❌ FAILED: Direct insertion did not persist');
    }

    // Clean up
    await pool.query('DELETE FROM city_mall_po_lines WHERE po_header_id = $1', [headerResult.rows[0].id]);
    await pool.query('DELETE FROM city_mall_po_header WHERE id = $1', [headerResult.rows[0].id]);
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Direct insertion test failed:', error);
  } finally {
    await pool.end();
  }
}

debugDirectInsertion();