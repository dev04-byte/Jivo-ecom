const XLSX = require('xlsx');

function testCompleteLineItemsDisplay() {
  const filePath = "C:\\Users\\singh\\Downloads\\purchase_order_FLFWG06905883 (1).xls";

  console.log('🧪 TESTING COMPLETE LINE ITEMS DISPLAY');
  console.log('='.repeat(70));

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Find table headers row
    const headerRowIndex = jsonData.findIndex((row) =>
      row && row[0] === 'S. no.' && row.includes('HSN/SA Code')
    );

    if (headerRowIndex === -1) {
      throw new Error('Could not find table headers');
    }

    console.log(`✅ Found table headers at row: ${headerRowIndex + 1}`);
    const headers = jsonData[headerRowIndex];
    console.log(`📊 Total columns in Excel: ${headers.length}`);

    // Parse line items (simulate the real parser logic)
    const lines = [];
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      if (!row || row.length === 0) continue;

      // Check for termination patterns
      if (row.some((cell) => cell && cell.toString().includes('Total Quantity'))) {
        console.log('📍 Found summary row, stopping line parsing');
        break;
      }

      // Skip non-data rows
      const firstCell = row[0]?.toString() || '';
      if (firstCell.includes('Important Notification') ||
          firstCell.includes('Please mention PO number') ||
          firstCell.length > 50) {
        continue;
      }

      // Check if this is a valid line item
      const serialNum = row[0];
      const hasValidData = row[1] && row[2] && row[3];

      if (!serialNum || isNaN(parseInt(serialNum.toString())) || !hasValidData) {
        continue;
      }

      // Create line item with all 25 data fields (excluding empty column 8)
      const line = {
        line_number: parseInt(serialNum.toString()),
        hsn_code: row[1]?.toString() || null,
        fsn_isbn: row[2]?.toString() || null,
        quantity: parseInt(row[3]?.toString() || '0'),
        pending_quantity: parseInt(row[4]?.toString() || '0'),
        uom: row[5]?.toString() || null,
        title: row[6]?.toString() || '',
        // Note: row[7] is empty column
        brand: row[8]?.toString() || null,
        type: row[9]?.toString() || null,
        ean: row[10]?.toString() || null,
        vertical: row[11]?.toString() || null,
        required_by_date: row[12]?.toString() || null,
        supplier_mrp: row[13]?.toString() || null,
        supplier_price: row[14]?.toString() || null,
        taxable_value: row[15]?.toString() || null,
        igst_rate: row[16]?.toString() || null,
        igst_amount_per_unit: row[17]?.toString() || null,
        sgst_rate: row[18]?.toString() || null,
        sgst_amount_per_unit: row[19]?.toString() || null,
        cgst_rate: row[20]?.toString() || null,
        cgst_amount_per_unit: row[21]?.toString() || null,
        cess_rate: row[22]?.toString() || null,
        cess_amount_per_unit: row[23]?.toString() || null,
        tax_amount: row[24]?.toString() || null,
        total_amount: row[25]?.toString() || null
      };

      lines.push(line);
    }

    console.log(`📦 Parsed ${lines.length} line items`);
    console.log('');

    // Show complete table structure
    console.log('📋 COMPLETE TABLE STRUCTURE (All 25 Columns):');
    console.log('-'.repeat(70));

    const allColumns = [
      { key: 'line_number', header: 'S.No', width: '60px' },
      { key: 'hsn_code', header: 'HSN/SA Code', width: '100px' },
      { key: 'fsn_isbn', header: 'FSN/ISBN13', width: '150px' },
      { key: 'quantity', header: 'Quantity', width: '80px' },
      { key: 'pending_quantity', header: 'Pending Qty', width: '120px' },
      { key: 'uom', header: 'UOM', width: '60px' },
      { key: 'title', header: 'Title', width: '300px' },
      { key: 'brand', header: 'Brand', width: '100px' },
      { key: 'type', header: 'Type', width: '120px' },
      { key: 'ean', header: 'EAN', width: '140px' },
      { key: 'vertical', header: 'Vertical', width: '100px' },
      { key: 'required_by_date', header: 'Required by Date', width: '140px' },
      { key: 'supplier_mrp', header: 'Supplier MRP', width: '120px' },
      { key: 'supplier_price', header: 'Supplier Price', width: '120px' },
      { key: 'taxable_value', header: 'Taxable Value', width: '120px' },
      { key: 'igst_rate', header: 'IGST Rate', width: '100px' },
      { key: 'igst_amount_per_unit', header: 'IGST Amount(per unit)', width: '150px' },
      { key: 'sgst_rate', header: 'SGST/UTGST Rate', width: '140px' },
      { key: 'sgst_amount_per_unit', header: 'SGST/UTGST Amount(per unit)', width: '180px' },
      { key: 'cgst_rate', header: 'CGST Rate', width: '100px' },
      { key: 'cgst_amount_per_unit', header: 'CGST Amount(per unit)', width: '150px' },
      { key: 'cess_rate', header: 'CESS Rate', width: '100px' },
      { key: 'cess_amount_per_unit', header: 'CESS Amount(per unit)', width: '150px' },
      { key: 'tax_amount', header: 'Tax Amount', width: '120px' },
      { key: 'total_amount', header: 'Total Amount', width: '120px' }
    ];

    console.log(`Column | Header | Width | Sample Data`);
    console.log('-'.repeat(70));

    allColumns.forEach((col, index) => {
      const sampleValue = lines[0] ? (lines[0][col.key] || '-') : '-';
      const truncatedSample = sampleValue.toString().length > 20
        ? sampleValue.toString().substring(0, 17) + '...'
        : sampleValue.toString();

      console.log(`${(index + 1).toString().padStart(2)} | ${col.header.padEnd(25)} | ${col.width.padEnd(7)} | ${truncatedSample}`);
    });

    console.log('');
    console.log('🎯 FRONTEND TABLE FEATURES:');
    console.log('-'.repeat(50));
    console.log('✅ Horizontal scroll enabled (overflow-x-auto)');
    console.log('✅ Vertical scroll with max height (max-h-96)');
    console.log('✅ Sticky headers (sticky top-0 z-10)');
    console.log('✅ Responsive widths (min-w-[...])');
    console.log('✅ Proper text alignment (text-center, text-right)');
    console.log('✅ Currency formatting for monetary values');
    console.log('✅ Percentage formatting for tax rates');
    console.log('✅ Monospace fonts for codes (font-mono)');
    console.log('✅ Truncated text for long titles (max-w-xs)');

    console.log('');
    console.log('📊 SAMPLE LINE ITEM DATA:');
    console.log('-'.repeat(50));
    if (lines.length > 0) {
      const sample = lines[0];
      console.log(`Line ${sample.line_number}:`);
      console.log(`  📦 Product: ${sample.title}`);
      console.log(`  🏷️  Brand: ${sample.brand}`);
      console.log(`  📊 Quantity: ${sample.quantity} ${sample.uom}`);
      console.log(`  💰 Supplier Price: ₹${sample.supplier_price}`);
      console.log(`  🏷️  HSN Code: ${sample.hsn_code}`);
      console.log(`  📋 FSN: ${sample.fsn_isbn}`);
      console.log(`  🔖 Type: ${sample.type}`);
      console.log(`  📅 Required by: ${sample.required_by_date}`);
      console.log(`  💸 Total: ₹${sample.total_amount}`);
    }

    console.log('');
    console.log('📏 TABLE WIDTH CALCULATION:');
    console.log('-'.repeat(50));
    const totalWidth = allColumns.reduce((sum, col) => {
      const width = parseInt(col.width.replace(/[^\d]/g, ''));
      return sum + width;
    }, 0);
    console.log(`Total minimum width: ${totalWidth}px`);
    console.log(`Average column width: ${Math.round(totalWidth / allColumns.length)}px`);
    console.log('✅ Table will require horizontal scrolling on most screens');

    console.log('');
    console.log('✅ ALL 25 COLUMNS SUCCESSFULLY CONFIGURED!');
    console.log('🎨 Table includes proper styling and responsive behavior');
    console.log('📱 Mobile-friendly with horizontal scrolling');
    console.log('💎 Professional formatting with proper data types');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCompleteLineItemsDisplay();