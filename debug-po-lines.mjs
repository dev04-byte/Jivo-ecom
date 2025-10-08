// Debug why po_lines is not being populated
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function debug() {
  console.log('🔍 Debugging po_lines issue...\n');

  try {
    // 1. Check if Flipkart PO was imported
    console.log('1️⃣ Checking Flipkart PO header...');
    const headers = await db.execute(sql`
      SELECT id, po_number, supplier_name
      FROM flipkart_grocery_po_header
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`Found ${headers.rows.length} Flipkart PO headers`);
    headers.rows.forEach(h => console.log(`  - ${h.po_number}: ${h.supplier_name}`));

    if (headers.rows.length === 0) {
      console.log('❌ No Flipkart POs found!');
      return;
    }

    const lastPO = headers.rows[0];
    console.log(`\n✅ Latest PO: ${lastPO.po_number} (ID: ${lastPO.id})\n`);

    // 2. Check Flipkart PO lines
    console.log('2️⃣ Checking Flipkart PO lines...');
    const lines = await db.execute(sql`
      SELECT id, line_number, fsn_isbn, title, quantity, supplier_price
      FROM flipkart_grocery_po_lines
      WHERE header_id = ${lastPO.id}
      ORDER BY line_number
    `);
    console.log(`Found ${lines.rows.length} line items`);
    lines.rows.forEach(l => console.log(`  - Line ${l.line_number}: ${l.title} (FSN: ${l.fsn_isbn})`));

    if (lines.rows.length === 0) {
      console.log('❌ No line items found for this PO!');
      return;
    }

    const firstLine = lines.rows[0];
    console.log(`\n✅ First line: ${firstLine.title} (FSN: ${firstLine.fsn_isbn})\n`);

    // 3. Check if FSN exists in pf_item_mst
    console.log('3️⃣ Checking pf_item_mst for Flipkart items...');
    const pfItems = await db.execute(sql`
      SELECT id, pf_id, pf_itemcode, pf_itemname, sap_id
      FROM pf_item_mst
      WHERE pf_itemcode = ${firstLine.fsn_isbn} AND pf_id = 6
    `);
    console.log(`Found ${pfItems.rows.length} matching items in pf_item_mst`);
    if (pfItems.rows.length > 0) {
      pfItems.rows.forEach(i => console.log(`  - ${i.pf_itemname} (SAP: ${i.sap_id})`));
    } else {
      console.log('❌ No matching item in pf_item_mst!');
      console.log(`   Looking for: pf_itemcode='${firstLine.fsn_isbn}' AND pf_id=6`);
    }

    // 4. Check platform ID for Flipkart
    console.log('\n4️⃣ Checking Flipkart platform ID...');
    const platform = await db.execute(sql`
      SELECT id, pf_name
      FROM pf_mst
      WHERE pf_name ILIKE '%flipkart%'
    `);
    console.log(`Found ${platform.rows.length} Flipkart platforms`);
    platform.rows.forEach(p => console.log(`  - ${p.pf_name} (ID: ${p.id})`));

    // 5. Check po_lines table
    console.log('\n5️⃣ Checking po_lines table...');
    const poLines = await db.execute(sql`
      SELECT COUNT(*) as count FROM po_lines
    `);
    console.log(`Total records in po_lines: ${poLines.rows[0].count}`);

    const recentPoLines = await db.execute(sql`
      SELECT id, itemname, quantity, platform_product_code_id
      FROM po_lines
      ORDER BY id DESC
      LIMIT 5
    `);
    console.log(`Recent po_lines entries: ${recentPoLines.rows.length}`);
    recentPoLines.rows.forEach(l => console.log(`  - ${l.itemname} (Qty: ${l.quantity})`));

    // 6. Check trigger warnings in PostgreSQL logs
    console.log('\n6️⃣ Summary:');
    console.log('═'.repeat(60));
    if (pfItems.rows.length === 0) {
      console.log('🔴 ISSUE FOUND: Items not in pf_item_mst table');
      console.log('   The trigger requires items to exist in pf_item_mst first');
      console.log('   Solution: Populate pf_item_mst with Flipkart items');
    } else if (poLines.rows.length === 0) {
      console.log('🔴 ISSUE: po_lines is empty despite items existing');
      console.log('   The trigger might be failing silently');
    } else {
      console.log('✅ Everything looks good!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debug();
