import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function fixColumnLengths() {
  try {
    console.log('🔧 Fixing column lengths in Zepto tables...');

    // Fix status column length in zepto_po_header
    console.log('\n📏 Updating status column in zepto_po_header to VARCHAR(50)...');
    await db.execute(sql.raw(`
      ALTER TABLE zepto_po_header
      ALTER COLUMN status TYPE VARCHAR(50)
    `));
    console.log('✅ Updated status column in zepto_po_header');

    // Fix status column length in zepto_po_lines
    console.log('\n📏 Updating status column in zepto_po_lines to VARCHAR(50)...');
    await db.execute(sql.raw(`
      ALTER TABLE zepto_po_lines
      ALTER COLUMN status TYPE VARCHAR(50)
    `));
    console.log('✅ Updated status column in zepto_po_lines');

    // Check current column types
    const headerColumns = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_header'
      AND column_name IN ('status', 'vendor_code', 'vendor_name', 'delivery_location')
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Updated column lengths in zepto_po_header:');
    headerColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}(${col.character_maximum_length})`);
    });

    const linesColumns = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_lines'
      AND column_name = 'status'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Updated column lengths in zepto_po_lines:');
    linesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}(${col.character_maximum_length})`);
    });

    console.log('\n✅ Column lengths fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to fix column lengths:', error);
    process.exit(1);
  }
}

fixColumnLengths();