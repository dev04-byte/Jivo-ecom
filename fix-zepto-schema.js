import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function fixZeptoSchema() {
  try {
    console.log('🔧 Starting Zepto schema fix...');

    // Check current columns in zepto_po_header
    const headerColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_header'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Current columns in zepto_po_header:');
    headerColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // List of columns that should exist
    const requiredColumns = [
      { name: 'po_date', type: 'timestamp', sql: 'TIMESTAMP' },
      { name: 'vendor_code', type: 'varchar(50)', sql: 'VARCHAR(50)' },
      { name: 'vendor_name', type: 'varchar(200)', sql: 'VARCHAR(200)' },
      { name: 'po_amount', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'delivery_location', type: 'varchar(200)', sql: 'VARCHAR(200)' },
      { name: 'po_expiry_date', type: 'timestamp', sql: 'TIMESTAMP' }
    ];

    const existingColumns = headerColumns.rows.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col.name));

    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns detected:', missingColumns.map(c => c.name).join(', '));

      for (const column of missingColumns) {
        console.log(`\n➕ Adding column: ${column.name}`);
        try {
          await db.execute(sql.raw(`
            ALTER TABLE zepto_po_header
            ADD COLUMN ${column.name} ${column.sql}
          `));
          console.log(`   ✅ Added ${column.name}`);
        } catch (error) {
          if (error.code === '42701') {
            console.log(`   ℹ️  Column ${column.name} already exists`);
          } else {
            console.error(`   ❌ Failed to add ${column.name}:`, error.message);
          }
        }
      }
    } else {
      console.log('\n✅ All required columns exist in zepto_po_header');
    }

    // Check zepto_po_lines columns
    const linesColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_lines'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Current columns in zepto_po_lines:');
    linesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check for missing decimal columns in lines table
    const linesRequiredColumns = [
      { name: 'cost_price', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'landing_cost', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'cgst', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'sgst', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'igst', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'cess', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'mrp', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' },
      { name: 'total_value', type: 'decimal(15,2)', sql: 'DECIMAL(15,2)' }
    ];

    const existingLinesColumns = linesColumns.rows.map(col => col.column_name);
    const missingLinesColumns = linesRequiredColumns.filter(col => !existingLinesColumns.includes(col.name));

    if (missingLinesColumns.length > 0) {
      console.log('\n⚠️  Missing columns in zepto_po_lines:', missingLinesColumns.map(c => c.name).join(', '));

      for (const column of missingLinesColumns) {
        console.log(`\n➕ Adding column to lines: ${column.name}`);
        try {
          await db.execute(sql.raw(`
            ALTER TABLE zepto_po_lines
            ADD COLUMN ${column.name} ${column.sql}
          `));
          console.log(`   ✅ Added ${column.name}`);
        } catch (error) {
          if (error.code === '42701') {
            console.log(`   ℹ️  Column ${column.name} already exists`);
          } else {
            console.error(`   ❌ Failed to add ${column.name}:`, error.message);
          }
        }
      }
    } else {
      console.log('\n✅ All required columns exist in zepto_po_lines');
    }

    console.log('\n🎉 Schema fix completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
}

fixZeptoSchema();