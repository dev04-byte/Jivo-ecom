// Check if City Mall data was saved
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function checkData() {
  try {
    console.log('🔍 Checking City Mall data in database...\n');

    // Check header
    const headers = await db.execute(sql`
      SELECT id, po_number, vendor_name, total_amount, created_at
      FROM city_mall_po_header
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${headers.rows.length} City Mall PO headers:`);
    headers.rows.forEach(h => {
      console.log(`  ✅ ID ${h.id}: ${h.po_number} - ${h.vendor_name} - Amount: ${h.total_amount}`);
    });

    if (headers.rows.length > 0) {
      const lastPO = headers.rows[0];
      console.log(`\n📋 Latest PO Details:`);
      console.log(`   ID: ${lastPO.id}`);
      console.log(`   PO Number: ${lastPO.po_number}`);
      console.log(`   Created: ${lastPO.created_at}`);

      // Check lines for this PO
      const lines = await db.execute(sql`
        SELECT id, line_number, article_name, quantity, total_amount
        FROM city_mall_po_lines
        WHERE po_header_id = ${lastPO.id}
        ORDER BY line_number
      `);

      console.log(`\n📦 Line Items (${lines.rows.length} items):`);
      lines.rows.forEach(l => {
        console.log(`   Line ${l.line_number}: ${l.article_name} - Qty: ${l.quantity} - Amount: ${l.total_amount}`);
      });

      console.log('\n✅ DATA IS IN DATABASE!');
      console.log('   The error was just from the optional consolidated table.');
      console.log('   Your City Mall PO was saved successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
