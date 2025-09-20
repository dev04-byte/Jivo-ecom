import fs from 'fs';
import { parseSwiggyCSV } from './server/swiggy-csv-parser.js';

async function testCSVParsing() {
  console.log('🧪 Testing CSV parsing for both files...');

  const files = [
    {
      name: 'Working file (PCHPO141863.csv)',
      path: 'c:\\Users\\singh\\Downloads\\PCHPO141863.csv'
    },
    {
      name: 'Problematic file (PO_1758265329897 (1).csv)',
      path: 'c:\\Users\\singh\\Downloads\\PO_1758265329897 (1).csv'
    }
  ];

  for (const file of files) {
    try {
      console.log(`\n📂 Testing ${file.name}`);

      if (!fs.existsSync(file.path)) {
        console.log(`❌ File not found: ${file.path}`);
        continue;
      }

      const csvContent = fs.readFileSync(file.path, 'utf-8');
      console.log(`📊 File size: ${csvContent.length} characters`);

      const result = parseSwiggyCSV(csvContent, 'test-user');

      console.log(`✅ Parsed successfully:`);
      console.log(`  - Total POs: ${result.totalPOs}`);
      console.log(`  - PO Numbers: ${result.poList.map(po => po.header.po_number).join(', ')}`);

      result.poList.forEach((po, index) => {
        console.log(`\n  PO ${index + 1}: ${po.header.po_number}`);
        console.log(`    - Vendor: ${po.header.vendor_name}`);
        console.log(`    - Total Items: ${po.lines.length}`);
        console.log(`    - Total Quantity: ${po.header.total_quantity}`);
        console.log(`    - Grand Total: ${po.header.grand_total} (${typeof po.header.grand_total})`);

        // Check first line item types
        if (po.lines.length > 0) {
          const firstLine = po.lines[0];
          console.log(`    - First item types:`);
          console.log(`      * mrp: ${firstLine.mrp} (${typeof firstLine.mrp})`);
          console.log(`      * unit_base_cost: ${firstLine.unit_base_cost} (${typeof firstLine.unit_base_cost})`);
          console.log(`      * taxable_value: ${firstLine.taxable_value} (${typeof firstLine.taxable_value})`);
          console.log(`      * line_total: ${firstLine.line_total} (${typeof firstLine.line_total})`);
        }
      });

    } catch (error) {
      console.error(`❌ Error parsing ${file.name}:`, error.message);
    }
  }
}

// Test database preparation
function testDatabasePreparation(parsedData) {
  console.log('\n🔍 Testing database preparation logic...');

  for (const parsedPO of parsedData.poList) {
    const swiggyPoData = {
      header: parsedPO.header,
      lines: parsedPO.lines
    };

    // Simulate database preparation
    const headerData = {
      po_number: swiggyPoData.header.po_number,
      total_taxable_value: swiggyPoData.header.total_taxable_value ? Number(swiggyPoData.header.total_taxable_value) : null,
      total_tax_amount: swiggyPoData.header.total_tax_amount ? Number(swiggyPoData.header.total_tax_amount) : null,
      grand_total: swiggyPoData.header.grand_total ? Number(swiggyPoData.header.grand_total) : null,
    };

    console.log(`\n  Database prep for ${headerData.po_number}:`);
    console.log(`    - grand_total: ${headerData.grand_total} (${typeof headerData.grand_total})`);

    if (swiggyPoData.lines.length > 0) {
      const lineData = {
        mrp: swiggyPoData.lines[0].mrp ? Number(swiggyPoData.lines[0].mrp) : null,
        unit_base_cost: swiggyPoData.lines[0].unit_base_cost ? Number(swiggyPoData.lines[0].unit_base_cost) : null,
        line_total: swiggyPoData.lines[0].line_total ? Number(swiggyPoData.lines[0].line_total) : null,
      };

      console.log(`    - First line prep:`);
      console.log(`      * mrp: ${lineData.mrp} (${typeof lineData.mrp})`);
      console.log(`      * line_total: ${lineData.line_total} (${typeof lineData.line_total})`);
    }
  }
}

testCSVParsing().catch(console.error);