import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function fixSequence() {
  try {
    console.log('🔧 Fixing ID sequences...');

    // Get the maximum ID from zepto_po_header
    const maxIdResult = await db.execute(sql`SELECT MAX(id) as max_id FROM zepto_po_header`);
    const maxId = maxIdResult.rows[0].max_id || 0;
    console.log(`Current max ID in zepto_po_header: ${maxId}`);

    // Find the sequence name
    const sequenceInfo = await db.execute(sql`
      SELECT column_default
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_header'
      AND column_name = 'id'
    `);

    console.log('Column default:', sequenceInfo.rows[0]?.column_default);

    // Reset the sequence to the max value + 1
    await db.execute(sql.raw(`SELECT setval('zepto_po_header_id_seq', ${maxId + 1}, false)`));
    console.log(`✅ Reset zepto_po_header sequence to ${maxId + 1}`);

    // Do the same for zepto_po_lines
    const maxLinesIdResult = await db.execute(sql`SELECT MAX(id) as max_id FROM zepto_po_lines`);
    const maxLinesId = maxLinesIdResult.rows[0].max_id || 0;
    console.log(`Current max ID in zepto_po_lines: ${maxLinesId}`);

    await db.execute(sql.raw(`SELECT setval('zepto_po_lines_id_seq', ${maxLinesId + 1}, false)`));
    console.log(`✅ Reset zepto_po_lines sequence to ${maxLinesId + 1}`);

    console.log('\n✅ Sequences fixed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Failed to fix sequences:', error);
    process.exit(1);
  }
}

fixSequence();