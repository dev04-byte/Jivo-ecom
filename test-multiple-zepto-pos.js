import fs from 'fs';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { Client } from 'pg';

dotenv.config();

function parseDecimal(value) {
  if (!value || value === 'N/A' || value === '') return '0.00';

  // Handle scientific notation like 8.908E+12
  if (typeof value === 'string' && value.includes('E')) {
    const num = parseFloat(value);
    return num.toFixed(2);
  }

  const cleanValue = value.toString()
    .replace(/[₹,%kgtonnes\s]/g, '')
    .replace(/[^0-9.-]/g, '')
    .replace(/^-+/, '-')
    .replace(/\.+/g, '.');

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

async function testMultiplePOs() {
  const client = new Client({
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📁 Reading CSV file...');
    const csvContent = fs.readFileSync('C:\\Users\\singh\\Downloads\\PO_5e98b644b15d1b70.csv', 'utf-8');

    console.log('🔍 Parsing CSV content...');
    const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();

    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skip_records_with_empty_values: false,
      from_line: 1
    });

    console.log(`📊 Found ${records.length} total records`);

    // Group records by PO Number
    const poGroups = new Map();

    records.forEach((record) => {
      const hasData = Object.values(record).some(value => value && value.toString().trim() !== '');
      if (!hasData) return;

      const poNumber = record['PO No.']?.trim();
      if (!poNumber) return;

      if (!poGroups.has(poNumber)) {
        poGroups.set(poNumber, []);
      }
      poGroups.get(poNumber).push(record);
    });

    console.log(`🎯 Found ${poGroups.size} unique PO numbers:`);
    for (const [poNumber, records] of poGroups) {
      console.log(`  - ${poNumber}: ${records.length} lines`);
    }

    await client.connect();
    console.log('✅ Connected to database');

    // Check for any existing data that might conflict
    const existingPOs = await client.query(`
      SELECT po_number FROM zepto_po_header
      WHERE po_number = ANY($1)
    `, [Array.from(poGroups.keys())]);

    if (existingPOs.rows.length > 0) {
      console.log('⚠️  Existing POs found, cleaning up first...');
      for (const row of existingPOs.rows) {
        await client.query('DELETE FROM zepto_po_header WHERE po_number = $1', [row.po_number]);
        console.log(`🧹 Cleaned up existing PO: ${row.po_number}`);
      }
    }

    // Process ALL PO groups
    let successCount = 0;
    let errorCount = 0;

    for (const [poNumber, poRecords] of poGroups) {
      try {
        console.log(`\n📦 Processing PO: ${poNumber} with ${poRecords.length} lines`);

        const lines = [];
        const brands = new Set();
        let totalQuantity = 0;
        let totalCostValue = 0;
        let totalTaxAmount = 0;
        let totalAmount = 0;

        // Process each line item
        poRecords.forEach((record, index) => {
          const lineNumber = index + 1;
          const qty = parseInt(record['Qty']) || 0;
          const costPrice = parseFloat(parseDecimal(record['Unit Base Cost']));
          const landingCost = parseFloat(parseDecimal(record['Landing Cost']));
          const cgst = parseFloat(parseDecimal(record['CGST %']));
          const sgst = parseFloat(parseDecimal(record['SGST %']));
          const igst = parseFloat(parseDecimal(record['IGST %']));
          const cess = parseFloat(parseDecimal(record['CESS %']));

          // Calculate line total
          const lineTotal = qty * landingCost;
          const lineTax = lineTotal * (cgst + sgst + igst + cess) / 100;

          totalQuantity += qty;
          totalCostValue += qty * costPrice;
          totalTaxAmount += lineTax;
          totalAmount += lineTotal + lineTax;

          if (record['Brand']) {
            brands.add(record['Brand']);
          }

          const line = {
            line_number: lineNumber,
            po_number: poNumber,
            sku: record['SKU'] || '',
            sku_desc: record['SKU Desc'] || '',
            brand: record['Brand'] || '',
            sku_id: record['SKU Code'] || '',
            sap_id: record['SKU'] || '',
            hsn_code: record['HSN'] || '',
            ean_no: record['EAN'] || '',
            po_qty: qty,
            asn_qty: parseInt(record['ASN Quantity']) || 0,
            grn_qty: parseInt(record['GRN Quantity']) || 0,
            remaining_qty: qty - (parseInt(record['ASN Quantity']) || 0) - (parseInt(record['GRN Quantity']) || 0),
            cost_price: parseDecimal(record['Unit Base Cost']),
            landing_cost: parseDecimal(record['Landing Cost']),
            cgst: parseDecimal(record['CGST %']),
            sgst: parseDecimal(record['SGST %']),
            igst: parseDecimal(record['IGST %']),
            cess: parseDecimal(record['CESS %']),
            mrp: parseDecimal(record['MRP']),
            total_value: parseDecimal(record['Total Amount']),
            status: 'Pending',
            created_by: 'test_user'
          };

          lines.push(line);
        });

        // Create header
        const firstRecord = poRecords[0];
        const header = {
          po_number: poNumber,
          po_date: parseDate(firstRecord['PO Date']),
          status: (firstRecord['Status'] || 'Open').substring(0, 50), // Ensure it fits in column
          vendor_code: (firstRecord['Vendor Code'] || '').substring(0, 50),
          vendor_name: (firstRecord['Vendor Name'] || '').substring(0, 200),
          po_amount: parseDecimal(firstRecord['PO Amount']),
          delivery_location: (firstRecord['Del Location'] || '').substring(0, 200),
          po_expiry_date: parseDate(firstRecord['PO Expiry Date']),
          total_quantity: totalQuantity,
          total_cost_value: totalCostValue.toFixed(2),
          total_tax_amount: totalTaxAmount.toFixed(2),
          total_amount: totalAmount.toFixed(2),
          unique_brands: Array.from(brands),
          created_by: 'test_user',
          uploaded_by: 'test_user'
        };

        console.log(`📋 Header summary: ${header.po_number}, Status: ${header.status}, Lines: ${lines.length}, Total: ${header.total_amount}`);

        // Insert header
        const headerResult = await client.query(`
          INSERT INTO zepto_po_header (
            po_number, po_date, status, vendor_code, vendor_name, po_amount,
            delivery_location, po_expiry_date, total_quantity, total_cost_value,
            total_tax_amount, total_amount, unique_brands, created_by, uploaded_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id, po_number
        `, [
          header.po_number, header.po_date, header.status, header.vendor_code,
          header.vendor_name, header.po_amount, header.delivery_location,
          header.po_expiry_date, header.total_quantity, header.total_cost_value,
          header.total_tax_amount, header.total_amount, header.unique_brands,
          header.created_by, header.uploaded_by
        ]);

        console.log(`✅ Header inserted: ID ${headerResult.rows[0].id}`);

        // Insert all lines
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineResult = await client.query(`
            INSERT INTO zepto_po_lines (
              po_header_id, line_number, po_number, sku, sku_desc, brand,
              sku_id, sap_id, hsn_code, ean_no, po_qty, asn_qty, grn_qty,
              remaining_qty, cost_price, landing_cost, cgst, sgst, igst,
              cess, mrp, total_value, status, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING id
          `, [
            headerResult.rows[0].id, line.line_number, line.po_number, line.sku,
            line.sku_desc, line.brand, line.sku_id, line.sap_id, line.hsn_code,
            line.ean_no, line.po_qty, line.asn_qty, line.grn_qty, line.remaining_qty,
            line.cost_price, line.landing_cost, line.cgst, line.sgst, line.igst,
            line.cess, line.mrp, line.total_value, line.status, line.created_by
          ]);
        }

        console.log(`✅ All ${lines.length} lines inserted for PO ${poNumber}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to insert PO ${poNumber}:`, error.message);
        console.error(`💥 Error details:`, {
          code: error.code,
          detail: error.detail,
          hint: error.hint,
          where: error.where
        });
        errorCount++;
      }
    }

    console.log(`\n🎉 Multiple PO upload test completed!`);
    console.log(`✅ Successfully inserted: ${successCount} POs`);
    console.log(`❌ Failed to insert: ${errorCount} POs`);

    // Verify data in database
    const finalCheck = await client.query(`
      SELECT h.po_number, h.status, h.total_quantity, h.total_amount,
             COUNT(l.id) as line_count
      FROM zepto_po_header h
      LEFT JOIN zepto_po_lines l ON h.id = l.po_header_id
      WHERE h.po_number = ANY($1)
      GROUP BY h.id, h.po_number, h.status, h.total_quantity, h.total_amount
      ORDER BY h.po_number
    `, [Array.from(poGroups.keys())]);

    console.log('\n📊 Final verification - Data in database:');
    finalCheck.rows.forEach(row => {
      console.log(`  ${row.po_number}: ${row.line_count} lines, Total: ${row.total_amount}, Status: ${row.status}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

testMultiplePOs();