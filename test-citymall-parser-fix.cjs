const fs = require('fs');
const path = require('path');

async function testCityMallParser() {
  try {
    console.log('🧪 Testing CityMall Parser with fixed column indices...\n');

    // Dynamically import the TypeScript parser
    const { parseCityMallPO } = await import('./server/citymall-parser.ts');

    const filePath = 'c:\\Users\\singh\\Downloads\\PO-1359161.xlsx';
    console.log('📄 Reading file:', filePath);

    const fileBuffer = fs.readFileSync(filePath);
    console.log('✅ File loaded, size:', fileBuffer.length, 'bytes\n');

    console.log('🔄 Parsing CityMall PO...\n');
    const result = parseCityMallPO(fileBuffer, 'test_user');

    console.log('📋 HEADER INFORMATION:');
    console.log('='.repeat(80));
    console.log('PO Number:', result.header.po_number);
    console.log('PO Date:', result.header.po_date);
    console.log('PO Expiry Date:', result.header.po_expiry_date);
    console.log('');
    console.log('Buyer (Company):');
    console.log('  Name:', result.header.buyer_name);
    console.log('  GST:', result.header.buyer_gst);
    console.log('  Address:', result.header.buyer_address?.substring(0, 80) + '...');
    console.log('');
    console.log('Vendor:');
    console.log('  Name:', result.header.vendor_name);
    console.log('  Code:', result.header.vendor_code);
    console.log('  GST:', result.header.vendor_gstin);
    console.log('  Contact:', result.header.vendor_contact_name);
    console.log('  Phone:', result.header.vendor_registered_address?.substring(0, 80));
    console.log('');
    console.log('Totals:');
    console.log('  Total Items:', result.lines.length);
    console.log('  Total Quantity:', result.header.total_quantity);
    console.log('  Total Base Amount: ₹', result.header.total_base_amount);
    console.log('  Total IGST: ₹', result.header.total_igst_amount);
    console.log('  Total CESS: ₹', result.header.total_cess_amount);
    console.log('  Total Amount: ₹', result.header.total_amount);
    console.log('');

    console.log('📦 LINE ITEMS (First 5):');
    console.log('='.repeat(80));
    result.lines.slice(0, 5).forEach((line, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  Article ID:', line.article_id);
      console.log('  Name:', line.article_name);
      console.log('  HSN Code:', line.hsn_code);
      console.log('  MRP: ₹', line.mrp);
      console.log('  Base Cost: ₹', line.base_cost_price);
      console.log('  Quantity:', line.quantity);
      console.log('  Base Amount: ₹', line.base_amount);
      console.log('  IGST:', line.igst_percent + '%', '(₹' + line.igst_amount + ')');
      console.log('  CESS:', line.cess_percent + '%', '(₹' + line.cess_amount + ')');
      console.log('  Total Amount: ₹', line.total_amount);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test completed successfully!');
    console.log(`📊 Parsed ${result.lines.length} line items from CityMall PO`);

    // Validate critical fields
    console.log('\n🔍 Validation:');
    let issues = 0;

    if (!result.header.po_number || result.header.po_number.startsWith('CM')) {
      console.log('  ⚠️  PO Number might be incorrect or missing:', result.header.po_number);
      issues++;
    } else {
      console.log('  ✅ PO Number extracted correctly');
    }

    if (!result.header.vendor_name) {
      console.log('  ⚠️  Vendor name missing');
      issues++;
    } else {
      console.log('  ✅ Vendor name extracted');
    }

    if (result.lines.length === 0) {
      console.log('  ❌ No line items parsed!');
      issues++;
    } else {
      console.log('  ✅ Line items parsed');
    }

    const firstLine = result.lines[0];
    if (firstLine) {
      if (!firstLine.article_id || firstLine.article_id.trim() === '') {
        console.log('  ⚠️  Article ID might be missing in first line');
        issues++;
      } else {
        console.log('  ✅ Article IDs present');
      }

      if (!firstLine.article_name || firstLine.article_name.trim() === '') {
        console.log('  ⚠️  Article name might be missing in first line');
        issues++;
      } else {
        console.log('  ✅ Article names present');
      }
    }

    console.log('\n' + (issues === 0 ? '✅ All validations passed!' : `⚠️  ${issues} validation issues found`));

  } catch (error) {
    console.error('\n❌ Error testing CityMall parser:');
    console.error('Message:', error.message);
    console.error('\nStack:', error.stack);
  }
}

testCityMallParser();
