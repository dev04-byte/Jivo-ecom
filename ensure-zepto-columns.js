import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function ensureAllColumns() {
  try {
    console.log('🔧 Ensuring all required columns exist in Zepto tables...\n');

    // Define all required columns for zepto_po_lines
    const requiredLinesColumns = [
      { name: 'sku_desc', type: 'TEXT', check: true },
      { name: 'landing_cost', type: 'NUMERIC(10,2)', check: true },
      { name: 'created_by', type: 'VARCHAR(100)', check: true },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()', check: true }
    ];

    // Check existing columns in zepto_po_lines
    const existingColumns = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_lines'
    `);

    const existingColumnNames = existingColumns.rows.map(col => col.column_name);
    console.log('📋 Existing columns in zepto_po_lines:', existingColumnNames.join(', '));

    // Add missing columns
    for (const column of requiredLinesColumns) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`\n➕ Adding missing column: ${column.name}`);
        try {
          await db.execute(sql.raw(`
            ALTER TABLE zepto_po_lines
            ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}
          `));
          console.log(`   ✅ Added ${column.name}`);
        } catch (error) {
          if (error.code === '42701') {
            console.log(`   ℹ️  Column ${column.name} already exists`);
          } else {
            console.error(`   ❌ Failed to add ${column.name}:`, error.message);
          }
        }
      } else {
        console.log(`✅ Column ${column.name} already exists`);
      }
    }

    // Verify final structure
    console.log('\n📊 Final table structure verification:');

    const headerStructure = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_header'
      ORDER BY ordinal_position
    `);

    console.log('\nzepto_po_header columns:');
    headerStructure.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  - ${col.column_name}: ${col.data_type}${length}`);
    });

    const linesStructure = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_lines'
      ORDER BY ordinal_position
    `);

    console.log('\nzepto_po_lines columns:');
    linesStructure.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  - ${col.column_name}: ${col.data_type}${length}`);
    });

    // Test insert with all fields
    console.log('\n🧪 Testing insert with all fields...');

    const testHeader = {
      po_number: `TEST_FULL_${Date.now()}`,
      po_date: new Date(),
      status: 'Test Full Insert',
      vendor_code: 'TEST_VENDOR',
      vendor_name: 'Test Vendor Name',
      po_amount: '1000.00',
      delivery_location: 'Test Location',
      po_expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      total_quantity: 5,
      total_cost_value: '900.00',
      total_tax_amount: '100.00',
      total_amount: '1000.00',
      unique_brands: ['TestBrand1', 'TestBrand2'],
      created_by: 'test_script',
      uploaded_by: 'test_script'
    };

    try {
      const [insertedHeader] = await db.execute(sql`
        INSERT INTO zepto_po_header (
          po_number, po_date, status, vendor_code, vendor_name,
          po_amount, delivery_location, po_expiry_date, total_quantity,
          total_cost_value, total_tax_amount, total_amount,
          unique_brands, created_by, uploaded_by
        ) VALUES (
          ${testHeader.po_number}, ${testHeader.po_date}, ${testHeader.status},
          ${testHeader.vendor_code}, ${testHeader.vendor_name}, ${testHeader.po_amount},
          ${testHeader.delivery_location}, ${testHeader.po_expiry_date},
          ${testHeader.total_quantity}, ${testHeader.total_cost_value},
          ${testHeader.total_tax_amount}, ${testHeader.total_amount},
          ${testHeader.unique_brands}, ${testHeader.created_by}, ${testHeader.uploaded_by}
        ) RETURNING id
      `);

      console.log('✅ Header insert successful! ID:', insertedHeader.id);

      // Test line insert with all fields
      const testLine = {
        po_header_id: insertedHeader.id,
        line_number: 1,
        po_number: testHeader.po_number,
        sku: 'TEST_SKU_001',
        sku_desc: 'Test SKU Description with special chars: & % $ #',
        brand: 'TestBrand',
        sku_id: 'SKU001',
        sap_id: 'SAP001',
        hsn_code: 'HSN123456789012345', // Long HSN code to test VARCHAR(50)
        ean_no: 'EAN1234567890',
        po_qty: 10,
        asn_qty: 8,
        grn_qty: 5,
        remaining_qty: 5,
        cost_price: '100.00',
        landing_cost: '110.00',
        cgst: '9.00',
        sgst: '9.00',
        igst: '0.00',
        cess: '0.00',
        mrp: '150.00',
        total_value: '1100.00',
        status: 'Pending Processing with Long Status',
        created_by: 'test_script'
      };

      const [insertedLine] = await db.execute(sql`
        INSERT INTO zepto_po_lines (
          po_header_id, line_number, po_number, sku, sku_desc, brand,
          sku_id, sap_id, hsn_code, ean_no, po_qty, asn_qty, grn_qty,
          remaining_qty, cost_price, landing_cost, cgst, sgst, igst,
          cess, mrp, total_value, status, created_by
        ) VALUES (
          ${testLine.po_header_id}, ${testLine.line_number}, ${testLine.po_number},
          ${testLine.sku}, ${testLine.sku_desc}, ${testLine.brand},
          ${testLine.sku_id}, ${testLine.sap_id}, ${testLine.hsn_code},
          ${testLine.ean_no}, ${testLine.po_qty}, ${testLine.asn_qty},
          ${testLine.grn_qty}, ${testLine.remaining_qty}, ${testLine.cost_price},
          ${testLine.landing_cost}, ${testLine.cgst}, ${testLine.sgst},
          ${testLine.igst}, ${testLine.cess}, ${testLine.mrp},
          ${testLine.total_value}, ${testLine.status}, ${testLine.created_by}
        ) RETURNING id
      `);

      console.log('✅ Line insert successful! ID:', insertedLine.id);

      // Clean up test data
      await db.execute(sql`DELETE FROM zepto_po_header WHERE id = ${insertedHeader.id}`);
      console.log('✅ Test data cleaned up');

      console.log('\n🎉 All columns are properly configured and working!');
    } catch (insertError) {
      console.error('\n❌ Insert test failed:', insertError.message);
      console.error('This indicates there might still be an issue with the table structure.');
      throw insertError;
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Column check failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    process.exit(1);
  }
}

ensureAllColumns();