// Check if CityMall data actually exists in database
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@103.89.44.240:5432/ecom',
  ssl: false
});

async function checkCityMallData() {
  try {
    console.log('🔍 Checking CityMall data in database...');

    // Check headers
    const headers = await pool.query('SELECT * FROM city_mall_po_header ORDER BY created_at DESC LIMIT 5');
    console.log(`📋 Found ${headers.rows.length} CityMall headers:`);
    headers.rows.forEach(header => {
      console.log(`  - ID: ${header.id}, PO: ${header.po_number}, Vendor: "${header.vendor_name}", Amount: ${header.total_amount}`);
    });

    if (headers.rows.length > 0) {
      // Check lines for the latest header
      const latestHeaderId = headers.rows[0].id;
      const lines = await pool.query('SELECT * FROM city_mall_po_lines WHERE po_header_id = $1', [latestHeaderId]);
      console.log(`📝 Found ${lines.rows.length} lines for PO ${headers.rows[0].po_number}:`);
      lines.rows.forEach(line => {
        console.log(`  - Line ${line.line_number}: ${line.article_name} (${line.article_id}) - Qty: ${line.quantity}, Amount: ${line.total_amount}`);
      });
    }

    // Check what the API query is actually doing
    console.log('🔍 Testing API query logic...');

    // This mimics what getAllCityMallPos() should do
    const apiQuery = `
      SELECT h.*,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', l.id,
                   'po_header_id', l.po_header_id,
                   'line_number', l.line_number,
                   'article_id', l.article_id,
                   'article_name', l.article_name,
                   'hsn_code', l.hsn_code,
                   'mrp', l.mrp,
                   'base_cost_price', l.base_cost_price,
                   'quantity', l.quantity,
                   'base_amount', l.base_amount,
                   'igst_percent', l.igst_percent,
                   'cess_percent', l.cess_percent,
                   'igst_amount', l.igst_amount,
                   'cess_amount', l.cess_amount,
                   'total_amount', l.total_amount,
                   'status', l.status,
                   'created_by', l.created_by,
                   'created_at', l.created_at
                 ) ORDER BY l.line_number
               ) FILTER (WHERE l.id IS NOT NULL),
               '[]'::json
             ) as po_lines
      FROM city_mall_po_header h
      LEFT JOIN city_mall_po_lines l ON h.id = l.po_header_id
      GROUP BY h.id
      ORDER BY h.created_at DESC
    `;

    const apiResult = await pool.query(apiQuery);
    console.log(`📊 API-style query returned ${apiResult.rows.length} records:`);
    apiResult.rows.forEach(record => {
      console.log(`  - ID: ${record.id}, PO: ${record.po_number}, Lines: ${Array.isArray(record.po_lines) ? record.po_lines.length : 'invalid'}`);
    });

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
  }
}

checkCityMallData();