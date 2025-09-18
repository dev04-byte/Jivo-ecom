const { Pool } = require('pg');

const pool = new Pool({
  host: '103.89.44.240',
  port: 1433,
  database: 'jivo_ecomapp',
  user: 'sa',
  password: 'Ganesh@123456',
});

async function fixZeptoColumns() {
  try {
    console.log('🔧 Starting final Zepto columns fix...');

    // Check current columns first
    const currentColumns = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_header'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Current zepto_po_header columns:');
    currentColumns.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}${row.character_maximum_length ? '(' + row.character_maximum_length + ')' : ''}`);
    });

    const existingColumns = currentColumns.rows.map(row => row.column_name);

    // Define columns that should exist
    const requiredColumns = [
      { name: 'po_date', type: 'timestamp', nullable: true },
      { name: 'vendor_code', type: 'varchar(100)', nullable: true },
      { name: 'vendor_name', type: 'varchar(255)', nullable: true },
      { name: 'po_amount', type: 'decimal(15,2)', nullable: true },
      { name: 'delivery_location', type: 'varchar(255)', nullable: true },
      { name: 'po_expiry_date', type: 'timestamp', nullable: true }
    ];

    // Add missing columns
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        const sql = `ALTER TABLE zepto_po_header ADD COLUMN ${column.name} ${column.type}${column.nullable ? '' : ' NOT NULL'};`;
        console.log(`🔧 Adding missing column: ${column.name}`);
        await pool.query(sql);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`✅ Column ${column.name} already exists`);
      }
    }

    // Fix status column length if needed
    const statusColumn = currentColumns.rows.find(row => row.column_name === 'status');
    if (statusColumn && statusColumn.character_maximum_length && statusColumn.character_maximum_length < 50) {
      console.log('🔧 Fixing status column length...');
      await pool.query('ALTER TABLE zepto_po_header ALTER COLUMN status TYPE varchar(50);');
      console.log('✅ Fixed status column length to varchar(50)');
    } else {
      console.log('✅ Status column length is adequate');
    }

    // Also fix the log table if it exists
    try {
      await pool.query('ALTER TABLE zepto_po_header_log ALTER COLUMN original_status TYPE varchar(50);');
      console.log('✅ Fixed log table status column length');
    } catch (error) {
      console.log('⚠️ Log table fix not needed or already done');
    }

    console.log('🎉 All Zepto column fixes completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing Zepto columns:', error);
  } finally {
    await pool.end();
  }
}

fixZeptoColumns();