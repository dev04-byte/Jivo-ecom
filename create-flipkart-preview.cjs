const XLSX = require('xlsx');

function createFlipkartPreview() {
  console.log('🎨 CREATING COMPREHENSIVE FLIPKART GROCERY PREVIEW');
  console.log('='.repeat(80));

  // Based on the analysis, here are ALL the columns found in Flipkart Excel files:
  const allColumns = [
    {
      key: 'line_number',
      label: 'S. no.',
      width: '60px',
      description: 'Serial number of the line item'
    },
    {
      key: 'hsn_code',
      label: 'HSN/SA Code',
      width: '100px',
      description: 'HSN (Harmonized System of Nomenclature) code for tax classification'
    },
    {
      key: 'fsn_isbn',
      label: 'FSN/ISBN13',
      width: '150px',
      description: 'Flipkart Serial Number or ISBN for product identification'
    },
    {
      key: 'quantity',
      label: 'Quantity',
      width: '80px',
      description: 'Total quantity ordered'
    },
    {
      key: 'pending_quantity',
      label: 'Pending Quantity',
      width: '120px',
      description: 'Quantity yet to be delivered'
    },
    {
      key: 'uom',
      label: 'UOM',
      width: '60px',
      description: 'Unit of Measurement (pcs, kg, etc.)'
    },
    {
      key: 'title',
      label: 'Title',
      width: '300px',
      description: 'Complete product title/name'
    },
    {
      key: 'empty_col_8',
      label: '[Empty Col 8]',
      width: '80px',
      description: 'Empty column between Title and Brand'
    },
    {
      key: 'brand',
      label: 'Brand',
      width: '100px',
      description: 'Product brand name'
    },
    {
      key: 'type',
      label: 'Type',
      width: '120px',
      description: 'Product type/category'
    },
    {
      key: 'ean',
      label: 'EAN',
      width: '140px',
      description: 'European Article Number (barcode)'
    },
    {
      key: 'vertical',
      label: 'Vertical',
      width: '100px',
      description: 'Product vertical (edible_oil, etc.)'
    },
    {
      key: 'required_by_date',
      label: 'Required by Date',
      width: '140px',
      description: 'Date by which product is required'
    },
    {
      key: 'supplier_mrp',
      label: 'Supplier MRP',
      width: '120px',
      description: 'Maximum Retail Price set by supplier'
    },
    {
      key: 'supplier_price',
      label: 'Supplier Price',
      width: '120px',
      description: 'Price charged by supplier to Flipkart'
    },
    {
      key: 'taxable_value',
      label: 'Taxable Value',
      width: '120px',
      description: 'Total value on which tax is calculated'
    },
    {
      key: 'igst_rate',
      label: 'IGST Rate',
      width: '100px',
      description: 'Integrated Goods and Services Tax rate'
    },
    {
      key: 'igst_amount_per_unit',
      label: 'IGST Amount(per unit)',
      width: '150px',
      description: 'IGST amount charged per unit'
    },
    {
      key: 'sgst_rate',
      label: 'SGST/UTGST Rate',
      width: '140px',
      description: 'State/Union Territory GST rate'
    },
    {
      key: 'sgst_amount_per_unit',
      label: 'SGST/UTGST Amount(per unit)',
      width: '180px',
      description: 'SGST/UTGST amount charged per unit'
    },
    {
      key: 'cgst_rate',
      label: 'CGST Rate',
      width: '100px',
      description: 'Central Goods and Services Tax rate'
    },
    {
      key: 'cgst_amount_per_unit',
      label: 'CGST Amount(per unit)',
      width: '150px',
      description: 'CGST amount charged per unit'
    },
    {
      key: 'cess_rate',
      label: 'CESS Rate',
      width: '100px',
      description: 'Cess tax rate (additional tax)'
    },
    {
      key: 'cess_amount_per_unit',
      label: 'CESS Amount(per unit)',
      width: '150px',
      description: 'Cess amount charged per unit'
    },
    {
      key: 'tax_amount',
      label: 'Tax Amount',
      width: '120px',
      description: 'Total tax amount for the line item'
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      width: '120px',
      description: 'Total amount including taxes'
    }
  ];

  // Generate HTML preview
  console.log('📄 GENERATING HTML PREVIEW TABLE:');
  console.log('-'.repeat(80));

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flipkart Grocery PO - Complete Column Preview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 100%;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
        }
        .info-section {
            padding: 20px;
            background: #f8f9ff;
            border-bottom: 1px solid #e0e6ed;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
        }
        .info-item {
            background: white;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: 600;
            color: #333;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-value {
            color: #666;
            margin-top: 4px;
        }
        .table-container {
            overflow-x: auto;
            max-height: 600px;
            overflow-y: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px 8px;
            text-align: left;
            position: sticky;
            top: 0;
            z-index: 10;
            border-right: 1px solid rgba(255,255,255,0.2);
            font-weight: 600;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #e0e6ed;
            border-right: 1px solid #e0e6ed;
            vertical-align: top;
        }
        tr:hover {
            background-color: #f8f9ff;
        }
        .col-desc {
            font-size: 11px;
            color: #888;
            font-style: italic;
            display: block;
            margin-top: 2px;
        }
        .sample-data {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .money {
            text-align: right;
            font-family: monospace;
            color: #2d5016;
            font-weight: 500;
        }
        .number {
            text-align: right;
            font-family: monospace;
            color: #1565c0;
        }
        .date {
            color: #7b1fa2;
        }
        .code {
            font-family: monospace;
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 11px;
        }
        .empty-col {
            background: #fff3e0;
            color: #ef6c00;
            font-style: italic;
        }
        .stats {
            padding: 15px 20px;
            background: #f8f9ff;
            border-top: 1px solid #e0e6ed;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Flipkart Grocery Purchase Order</h1>
            <p>Complete Column Structure Preview - All ${allColumns.length} Columns</p>
        </div>

        <div class="info-section">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">PO Number</div>
                    <div class="info-value">FLFWG06905883</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Supplier</div>
                    <div class="info-value">Evara Enterprises (grocery_jivo_evara_ludh)</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Items</div>
                    <div class="info-value">3 Line Items</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Quantity</div>
                    <div class="info-value">1,084 pieces</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Amount</div>
                    <div class="info-value">₹201,428.00</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Contract Ref</div>
                    <div class="info-value">FKI-OR-01135247 (v10.0)</div>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>`;

  // Add all column headers
  allColumns.forEach(col => {
    html += `<th style="min-width: ${col.width}">
                            ${col.label}
                            <span class="col-desc">${col.description}</span>
                        </th>`;
  });

  html += `</tr>
                </thead>
                <tbody>`;

  // Sample data rows from the actual Excel file
  const sampleRows = [
    {
      line_number: '1',
      hsn_code: '15149120',
      fsn_isbn: 'EDOGDVWYGJNDYRQP',
      quantity: '1020',
      pending_quantity: '1020',
      uom: 'pcs',
      title: 'JIVO Cold Pressed Pure Cooking (Pack of 1) Mustard Oil 1 L Plastic Bottle',
      empty_col_8: '',
      brand: 'JIVO',
      type: 'Mustard Oil',
      ean: '8908000258198',
      vertical: 'edible_oil',
      required_by_date: '2025-09-21',
      supplier_mrp: '255.0 INR',
      supplier_price: '167.0 INR',
      taxable_value: '162220.8 INR',
      igst_rate: '0.0%',
      igst_amount_per_unit: '0.0 INR',
      sgst_rate: '2.5%',
      sgst_amount_per_unit: '3.98 INR',
      cgst_rate: '2.5%',
      cgst_amount_per_unit: '3.98 INR',
      cess_rate: '0.0%',
      cess_amount_per_unit: '0.0 INR',
      tax_amount: '8119.2 INR',
      total_amount: '170340.00'
    },
    {
      line_number: '2',
      hsn_code: '15099090',
      fsn_isbn: 'EDOFTHNH4YZ7GDHS',
      quantity: '48',
      pending_quantity: '48',
      uom: 'pcs',
      title: 'JIVO Pomace Olive Oil 1 L Plastic Bottle',
      empty_col_8: '',
      brand: 'JIVO',
      type: 'Olive Oil',
      ean: '8908000258549',
      vertical: 'edible_oil',
      required_by_date: '2025-09-21',
      supplier_mrp: '1049.0 INR',
      supplier_price: '425.0 INR',
      taxable_value: '19428.48 INR',
      igst_rate: '0.0%',
      igst_amount_per_unit: '0.0 INR',
      sgst_rate: '2.5%',
      sgst_amount_per_unit: '10.12 INR',
      cgst_rate: '2.5%',
      cgst_amount_per_unit: '10.12 INR',
      cess_rate: '0.0%',
      cess_amount_per_unit: '0.0 INR',
      tax_amount: '971.52 INR',
      total_amount: '20400.00'
    },
    {
      line_number: '3',
      hsn_code: '15092000',
      fsn_isbn: 'EDOHAUNQSDFDYPFC',
      quantity: '16',
      pending_quantity: '16',
      uom: 'pcs',
      title: 'JIVO Cold Pressed Pure Cooking Mustard Oil Mustard Oil 4 L Can',
      empty_col_8: '',
      brand: 'JIVO',
      type: 'Mustard Oil',
      ean: '8905604003070',
      vertical: 'edible_oil',
      required_by_date: '2025-09-21',
      supplier_mrp: '1000.0 INR',
      supplier_price: '668.0 INR',
      taxable_value: '10179.2 INR',
      igst_rate: '0.0%',
      igst_amount_per_unit: '0.0 INR',
      sgst_rate: '2.5%',
      sgst_amount_per_unit: '15.9 INR',
      cgst_rate: '2.5%',
      cgst_amount_per_unit: '15.9 INR',
      cess_rate: '0.0%',
      cess_amount_per_unit: '0.0 INR',
      tax_amount: '508.8 INR',
      total_amount: '10688.00'
    }
  ];

  // Add sample data rows
  sampleRows.forEach(row => {
    html += '<tr>';
    allColumns.forEach(col => {
      const value = row[col.key] || '';
      let cellClass = 'sample-data';

      if (col.key.includes('amount') || col.key.includes('price') || col.key.includes('value') || col.key.includes('mrp')) {
        cellClass += ' money';
      } else if (col.key.includes('quantity') || col.key.includes('rate')) {
        cellClass += ' number';
      } else if (col.key.includes('date')) {
        cellClass += ' date';
      } else if (col.key.includes('code') || col.key.includes('fsn') || col.key.includes('ean')) {
        cellClass += ' code';
      } else if (col.key.includes('empty')) {
        cellClass += ' empty-col';
      }

      html += `<td class="${cellClass}">${value || (col.key.includes('empty') ? '[Empty]' : '')}</td>`;
    });
    html += '</tr>';
  });

  html += `</tbody>
            </table>
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${allColumns.length}</div>
                <div class="stat-label">Total Columns</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">3</div>
                <div class="stat-label">Sample Rows</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">1,084</div>
                <div class="stat-label">Total Quantity</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">₹201,428</div>
                <div class="stat-label">Total Amount</div>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Write the HTML file
  require('fs').writeFileSync('flipkart-grocery-complete-preview.html', html);

  console.log('✅ HTML preview generated successfully!');
  console.log('📄 File: flipkart-grocery-complete-preview.html');
  console.log('🌐 Open the file in a browser to see the complete column preview');
  console.log('');

  // Generate React component structure
  console.log('⚛️  REACT COMPONENT COLUMN STRUCTURE:');
  console.log('-'.repeat(80));

  const reactColumns = allColumns.map((col, index) => {
    return `  {
    Header: '${col.label}',
    accessor: '${col.key}',
    width: '${col.width}',
    Cell: ({ value }) => (
      <div className="cell-content" title="${col.description}">
        {value || ${col.key.includes('empty') ? "'[Empty]'" : "''"}}
      </div>
    )
  }${index < allColumns.length - 1 ? ',' : ''}`;
  }).join('\n');

  console.log('const flipkartGroceryColumns = [');
  console.log(reactColumns);
  console.log('];');

  console.log('');
  console.log('📊 COLUMN SUMMARY:');
  console.log(`• Total Columns: ${allColumns.length}`);
  console.log(`• Empty Columns: ${allColumns.filter(col => col.key.includes('empty')).length}`);
  console.log(`• Tax Columns: ${allColumns.filter(col => col.key.includes('gst') || col.key.includes('cess') || col.key.includes('tax')).length}`);
  console.log(`• Product Info Columns: ${allColumns.filter(col => ['title', 'brand', 'type', 'ean', 'vertical'].includes(col.key)).length}`);
  console.log(`• Pricing Columns: ${allColumns.filter(col => col.key.includes('price') || col.key.includes('amount') || col.key.includes('value')).length}`);
}

createFlipkartPreview();