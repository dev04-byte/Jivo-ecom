const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/jivo_ecom';
const sql = postgres(connectionString);
const db = drizzle(sql);

async function testCityMallTables() {
  try {
    console.log('🔍 Testing CityMall database tables...');

    // Check if tables exist
    const checkTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'city_mall_%'
    `;

    console.log('📋 Found CityMall tables:', checkTables.map(t => t.table_name));

    if (checkTables.length === 0) {
      console.log('❌ CityMall tables do not exist! They may need to be created.');

      // Try to create the tables
      console.log('🔧 Attempting to create CityMall tables...');

      await sql`
        CREATE TABLE IF NOT EXISTS city_mall_po_header (
          id SERIAL PRIMARY KEY,
          po_number VARCHAR(50) NOT NULL,
          po_date TIMESTAMP,
          po_expiry_date TIMESTAMP,
          vendor_name VARCHAR(255),
          vendor_gstin VARCHAR(50),
          vendor_code VARCHAR(50),
          status VARCHAR(20) DEFAULT 'Open',
          total_quantity INTEGER DEFAULT 0,
          total_base_amount DECIMAL(15,2) DEFAULT 0,
          total_igst_amount DECIMAL(15,2) DEFAULT 0,
          total_cess_amount DECIMAL(15,2) DEFAULT 0,
          total_amount DECIMAL(15,2) DEFAULT 0,
          unique_hsn_codes TEXT[],
          created_by VARCHAR(100),
          uploaded_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS city_mall_po_lines (
          id SERIAL PRIMARY KEY,
          po_header_id INTEGER REFERENCES city_mall_po_header(id) ON DELETE CASCADE,
          line_number INTEGER NOT NULL,
          article_id VARCHAR(50),
          article_name TEXT,
          hsn_code VARCHAR(20),
          mrp DECIMAL(10,2),
          base_cost_price DECIMAL(10,2),
          quantity INTEGER DEFAULT 0,
          base_amount DECIMAL(15,2),
          igst_percent DECIMAL(5,2),
          cess_percent DECIMAL(5,2),
          igst_amount DECIMAL(10,2),
          cess_amount DECIMAL(10,2),
          total_amount DECIMAL(15,2),
          status VARCHAR(20) DEFAULT 'Pending',
          created_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      console.log('✅ CityMall tables created successfully!');
    } else {
      console.log('✅ CityMall tables already exist');
    }

    // Check data count
    const headerCount = await sql`SELECT COUNT(*) FROM city_mall_po_header`;
    const linesCount = await sql`SELECT COUNT(*) FROM city_mall_po_lines`;

    console.log(`📊 Current data: ${headerCount[0].count} headers, ${linesCount[0].count} lines`);

    // Test insertion
    console.log('🧪 Testing data insertion...');

    const testHeader = {
      po_number: 'TEST-CM-' + Date.now(),
      po_date: new Date(),
      vendor_name: 'Test Vendor',
      vendor_gstin: 'TEST123456789',
      status: 'Open',
      total_quantity: 10,
      total_amount: 1000.00,
      created_by: 'test-user'
    };

    const insertedHeader = await sql`
      INSERT INTO city_mall_po_header ${sql(testHeader)}
      RETURNING *
    `;

    console.log('✅ Header inserted:', insertedHeader[0].id);

    const testLine = {
      po_header_id: insertedHeader[0].id,
      line_number: 1,
      article_id: 'ART001',
      article_name: 'Test Article',
      hsn_code: '12345678',
      quantity: 5,
      mrp: 100.00,
      base_cost_price: 80.00,
      total_amount: 400.00
    };

    const insertedLine = await sql`
      INSERT INTO city_mall_po_lines ${sql(testLine)}
      RETURNING *
    `;

    console.log('✅ Line inserted:', insertedLine[0].id);

    // Clean up test data
    await sql`DELETE FROM city_mall_po_lines WHERE po_header_id = ${insertedHeader[0].id}`;
    await sql`DELETE FROM city_mall_po_header WHERE id = ${insertedHeader[0].id}`;

    console.log('🧹 Test data cleaned up');
    console.log('🎉 CityMall database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await sql.end();
  }
}

testCityMallTables();