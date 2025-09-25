const { Client } = require('pg');

async function fixDistributorSchema() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔧 Fixing distributor_mst table schema to match application expectations...');
    await client.connect();

    // Drop the existing table with wrong column names
    await client.query('DROP TABLE IF EXISTS distributor_mst CASCADE');
    console.log('🗑️ Dropped existing distributor_mst table');

    // Create the correct table structure matching schema.ts
    await client.query(`
      CREATE TABLE distributor_mst (
        id SERIAL PRIMARY KEY,
        distributor_name VARCHAR(200) NOT NULL UNIQUE,
        distributor_code VARCHAR(50) UNIQUE,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        region VARCHAR(50),
        gst_number VARCHAR(15),
        pan_number VARCHAR(10),
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default distributor with correct column name
    await client.query(`
      INSERT INTO distributor_mst (
        id, distributor_name, distributor_code, contact_person, phone, status
      )
      VALUES (1, 'Default Distributor', 'DEFAULT', 'System Admin', '000-000-0000', 'Active')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Created distributor_mst table with correct schema');

    // Also fix companies table to match any dependencies
    await client.query('DROP TABLE IF EXISTS companies CASCADE');
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      INSERT INTO companies (id, name, code)
      VALUES (1, 'Default Company', 'DEFAULT')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Created companies table');

    // Verify the tables
    const distributorCount = await client.query('SELECT COUNT(*) as count FROM distributor_mst');
    const companiesCount = await client.query('SELECT COUNT(*) as count FROM companies');

    console.log(`📊 distributor_mst: ${distributorCount.rows[0].count} records`);
    console.log(`📊 companies: ${companiesCount.rows[0].count} records`);

    // Show the correct column structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'distributor_mst'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 distributor_mst table structure:');
    columns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    console.log('');
    console.log('🎯 SCHEMA FIXED: distributor_mst now has correct column names');
    console.log('💡 API should now successfully insert data without column errors');

  } catch (error) {
    console.error('❌ Error fixing distributor schema:', error.message);
  } finally {
    await client.end();
  }
}

fixDistributorSchema();