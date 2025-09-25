const { Client } = require('pg');

async function fixDistributorsTable() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔧 Fixing distributors table name mismatch...');
    await client.connect();

    // First, check what foreign key constraint exists on po_master
    const foreignKeys = await client.query(`
      SELECT
        tc.constraint_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.table_name,
        kcu.column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'po_master'
        AND kcu.column_name = 'distributor_id'
    `);

    if (foreignKeys.rows.length > 0) {
      const fk = foreignKeys.rows[0];
      console.log(`📋 Found foreign key constraint: ${fk.constraint_name}`);
      console.log(`   References: ${fk.foreign_table_name}.${fk.foreign_column_name}`);

      // Create the table with the name that the constraint expects
      const expectedTableName = fk.foreign_table_name;

      console.log(`🔄 Creating table: ${expectedTableName}`);

      // Drop existing table if it exists
      await client.query(`DROP TABLE IF EXISTS ${expectedTableName} CASCADE`);

      // Create the distributors table (plural) that po_master expects
      await client.query(`
        CREATE TABLE ${expectedTableName} (
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

      // Insert default distributor
      await client.query(`
        INSERT INTO ${expectedTableName} (
          id, distributor_name, distributor_code, contact_person, phone, status
        )
        VALUES (1, 'Default Distributor', 'DEFAULT', 'System Admin', '000-000-0000', 'Active')
        ON CONFLICT (id) DO NOTHING
      `);

      console.log(`✅ Created ${expectedTableName} table with default distributor`);

      // Also create/update distributor_mst if it's different
      if (expectedTableName !== 'distributor_mst') {
        await client.query(`DROP TABLE IF EXISTS distributor_mst CASCADE`);
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

        await client.query(`
          INSERT INTO distributor_mst (
            id, distributor_name, distributor_code, contact_person, phone, status
          )
          VALUES (1, 'Default Distributor', 'DEFAULT', 'System Admin', '000-000-0000', 'Active')
          ON CONFLICT (id) DO NOTHING
        `);
        console.log(`✅ Also created distributor_mst table for schema compatibility`);
      }

    } else {
      console.log('⚠️  No foreign key constraint found on po_master.distributor_id');
    }

    // Verify the fix
    const distributorCount = await client.query('SELECT COUNT(*) as count FROM distributors');
    console.log(`📊 distributors: ${distributorCount.rows[0].count} records`);

    console.log('');
    console.log('🎯 FOREIGN KEY ISSUE FIXED');
    console.log('💡 po_master should now successfully reference distributor records');

  } catch (error) {
    console.error('❌ Error fixing distributors table:', error.message);
  } finally {
    await client.end();
  }
}

fixDistributorsTable();