import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function checkAllColumns() {
  try {
    console.log('🔍 Checking all column sizes in Zepto tables...\n');

    // Check zepto_po_header columns
    const headerColumns = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_header'
      AND data_type = 'character varying'
      ORDER BY ordinal_position;
    `);

    console.log('📊 VARCHAR columns in zepto_po_header:');
    headerColumns.rows.forEach(col => {
      const warning = col.character_maximum_length <= 20 ? ' ⚠️ SMALL' : '';
      console.log(`  - ${col.column_name}: VARCHAR(${col.character_maximum_length})${warning}`);
    });

    // Check zepto_po_lines columns
    const linesColumns = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_lines'
      AND data_type = 'character varying'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 VARCHAR columns in zepto_po_lines:');
    linesColumns.rows.forEach(col => {
      const warning = col.character_maximum_length <= 20 ? ' ⚠️ SMALL' : '';
      console.log(`  - ${col.column_name}: VARCHAR(${col.character_maximum_length})${warning}`);
    });

    // Find all VARCHAR(20) columns
    const smallColumns = [...headerColumns.rows, ...linesColumns.rows]
      .filter(col => col.character_maximum_length === 20);

    if (smallColumns.length > 0) {
      console.log('\n⚠️  Found VARCHAR(20) columns that might cause issues:');
      smallColumns.forEach(col => {
        console.log(`  - ${col.column_name}`);
      });
    } else {
      console.log('\n✅ No VARCHAR(20) columns found');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
}

checkAllColumns();