// Simple check without type issues
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function check() {
  try {
    console.log('🔍 Checking po_lines population issue...\n');

    // 1. Get latest Flipkart PO
    const po = await db.execute(sql`
      SELECT id, po_number FROM flipkart_grocery_po_header
      ORDER BY created_at DESC LIMIT 1
    `);

    if (po.rows.length === 0) {
      console.log('No Flipkart POs found');
      process.exit(0);
    }

    const poId = po.rows[0].id;
    const poNumber = po.rows[0].po_number;
    console.log(`Latest PO: ${poNumber} (ID: ${poId})\n`);

    // 2. Count lines in flipkart_grocery_po_lines
    const lines = await db.execute(sql`
      SELECT COUNT(*) as count FROM flipkart_grocery_po_lines WHERE header_id = ${poId}
    `);
    console.log(`Flipkart lines count: ${lines.rows[0].count}`);

    // 3. Count records in po_lines (consolidated table)
    const poLines = await db.execute(sql`
      SELECT COUNT(*) as count FROM po_lines
    `);
    console.log(`po_lines total count: ${poLines.rows[0].count}`);

    // 4. Check if pf_item_mst has any Flipkart items (avoid type comparison)
    const pfItems = await db.execute(sql`
      SELECT COUNT(*) as count FROM pf_item_mst
    `);
    console.log(`pf_item_mst total count: ${pfItems.rows[0].count}\n`);

    // 5. Check platform table
    const platforms = await db.execute(sql`
      SELECT id, pf_name FROM pf_mst ORDER BY id
    `);
    console.log('Platforms in pf_mst:');
    platforms.rows.forEach(p => console.log(`  ID ${p.id}: ${p.pf_name}`));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DIAGNOSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (lines.rows[0].count > 0 && poLines.rows[0].count == 0) {
      console.log('❌ Flipkart lines exist but po_lines is empty');
      console.log('   The trigger is not populating po_lines');
      console.log('\nPossible causes:');
      console.log('   1. Items missing in pf_item_mst');
      console.log('   2. Trigger is failing silently (check exception)');
      console.log('   3. Wrong platform_id (check if Flipkart = 6)');
      console.log('\n💡 Solution: Manually populate pf_item_mst OR disable trigger');
    } else if (poLines.rows[0].count > 0) {
      console.log('✅ po_lines has data!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
