import { db } from './server/db.js';
import { zeptoPoHeader, zeptoPoLines } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function testZeptoDatabase() {
  try {
    console.log('🔍 Testing Zepto database connection...');

    // Test basic connection
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Basic database connection successful');

    // Check if zepto_po_header table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'zepto_po_header'
      ) as table_exists
    `);

    console.log('Zepto PO Header table exists:', tableCheck.rows[0].table_exists);

    // If table exists, count records
    if (tableCheck.rows[0].table_exists) {
      const count = await db.execute(sql`SELECT COUNT(*) as count FROM zepto_po_header`);
      console.log('Records in zepto_po_header:', count.rows[0].count);
    }

    // Check zepto_po_lines table
    const linesTableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'zepto_po_lines'
      ) as table_exists
    `);

    console.log('Zepto PO Lines table exists:', linesTableCheck.rows[0].table_exists);

    // Test insert with minimal data
    if (tableCheck.rows[0].table_exists) {
      console.log('\n🧪 Testing insert with minimal data...');

      const testHeader = {
        po_number: `TEST_${Date.now()}`,
        status: 'Test',
        total_quantity: 1,
        total_cost_value: '100.00',
        total_tax_amount: '18.00',
        total_amount: '118.00',
        unique_brands: ['TestBrand'],
        created_by: 'test',
        uploaded_by: 'test'
      };

      console.log('Test data:', testHeader);

      try {
        const [inserted] = await db.insert(zeptoPoHeader).values(testHeader).returning();
        console.log('✅ Test insert successful! ID:', inserted.id);

        // Clean up test data
        await db.execute(sql`DELETE FROM zepto_po_header WHERE id = ${inserted.id}`);
        console.log('✅ Test data cleaned up');
      } catch (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        throw insertError;
      }
    }

    console.log('\n✅ All tests passed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    process.exit(1);
  }
}

testZeptoDatabase();