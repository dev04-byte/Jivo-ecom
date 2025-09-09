import { parse } from 'csv-parse/sync';
import XLSX from 'xlsx';
import * as xml2js from 'xml2js';
import Papa from 'papaparse';
import type { InsertFlipkartGroceryPoHeader, InsertFlipkartGroceryPoLines, InsertZeptoPoHeader, InsertZeptoPoLines, InsertCityMallPoHeader, InsertCityMallPoLines, InsertBlinkitPoHeader, InsertBlinkitPoLines, InsertSwiggyPo, InsertSwiggyPoLine } from '@shared/schema';

interface ParsedFlipkartPO {
  header: InsertFlipkartGroceryPoHeader;
  lines: InsertFlipkartGroceryPoLines[];
}

export function parseFlipkartGroceryPO(fileContent: Buffer | string, uploadedBy: string): ParsedFlipkartPO {
  console.log('Parsing Flipkart Grocery PO...');
  
  let records: any[];
  
  // Check if we received a Buffer (Excel file) or string (CSV file)
  if (Buffer.isBuffer(fileContent)) {
    try {
      // Handle Excel file
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON array format for easier processing
      records = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: '',
        blankrows: false 
      }) as any[][];
      
      console.log('Parsed Flipkart Excel file with', records.length, 'rows');
    } catch (xlsxError) {
      throw new Error(`Failed to parse Excel file: ${xlsxError instanceof Error ? xlsxError.message : 'Unknown error'}`);
    }
  } else {
    // Handle CSV file
    records = parse(fileContent, {
      skip_empty_lines: true,
      relax_column_count: true
    });
  }
  
  console.log('Flipkart CSV records count:', records.length);
  console.log('First 5 rows:', records.slice(0, 5));

  let header: InsertFlipkartGroceryPoHeader;
  const lines: InsertFlipkartGroceryPoLines[] = [];

  // Parse header information from the first few rows
  let poNumber = '';
  let supplierName = '';
  let supplierAddress = '';
  let supplierContact = '';
  let supplierEmail = '';
  let supplierGstin = '';
  let billedToAddress = '';
  let billedToGstin = '';
  let shippedToAddress = '';
  let shippedToGstin = '';
  let natureOfSupply = '';
  let natureOfTransaction = '';
  let poExpiryDate: Date | undefined;
  let category = '';
  let orderDate: Date = new Date();
  let modeOfPayment = '';
  let contractRefId = '';
  let contractVersion = '';
  let creditTerm = '';

  // Extract header data from structured CSV
  for (let i = 0; i < Math.min(10, records.length); i++) {
    const row = records[i];
    if (!row || row.length === 0) continue;

    // PO Number from row 1
    if (row[0]?.includes('PURCHASE ORDER #')) {
      poNumber = row[0].split('#')[1]?.trim() || '';
    }
    
    // PO details from row 2
    if (row[0] === 'PO#' && row[1]) {
      poNumber = row[1].trim();
      
      // Extract other details from this row
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 'Nature Of Supply' && row[j + 1]) {
          natureOfSupply = row[j + 1];
        }
        if (row[j] === 'Nature of Transaction' && row[j + 1]) {
          natureOfTransaction = row[j + 1];
        }
        if (row[j] === 'PO Expiry' && row[j + 1]) {
          poExpiryDate = parseDate(row[j + 1]);
        }
        if (row[j] === 'CATEGORY' && row[j + 1]) {
          category = row[j + 1];
        }
        if (row[j] === 'ORDER DATE' && row[j + 1]) {
          orderDate = parseDate(row[j + 1]) || new Date();
        }
      }
    }

    // Supplier details from row 3
    if (row[0] === 'SUPPLIER NAME' && row[1]) {
      supplierName = row[1];
      
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 'SUPPLIER ADDRESS' && row[j + 1]) {
          supplierAddress = row[j + 1];
        }
        if (row[j] === 'SUPPLIER CONTACT' && row[j + 1]) {
          supplierContact = row[j + 1];
        }
        if (row[j] === 'EMAIL' && row[j + 1]) {
          supplierEmail = row[j + 1];
        }
      }
    }

    // Billing and shipping details from row 4
    if (row[0] === 'Billed by') {
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 'GSTIN' && row[j + 1] && !supplierGstin) {
          supplierGstin = row[j + 1];
        }
      }
    }

    // Billed to address from row 5
    if (row[0] === 'BILLED TO ADDRESS' && row[2]) {
      billedToAddress = row[2];
      
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 'GSTIN' && row[j + 1] && !billedToGstin) {
          billedToGstin = row[j + 1];
        }
        if (row[j] === 'SHIPPED TO ADDRESS' && row[j + 2]) {
          shippedToAddress = row[j + 2];
        }
        if (row[j] === 'GSTIN' && row[j + 1] && billedToGstin && !shippedToGstin) {
          shippedToGstin = row[j + 1];
        }
      }
    }

    // Payment details from row 7
    if (row[0] === 'MODE OF PAYMENT' && row[2]) {
      modeOfPayment = row[2];
      
      for (let j = 0; j < row.length; j++) {
        if (row[j] === 'CONTRACT REF ID' && row[j + 1]) {
          contractRefId = row[j + 1];
        }
        if (row[j] === 'CONTRACT VERSION' && row[j + 1]) {
          contractVersion = row[j + 1];
        }
        if (row[j] === 'CREDIT TERM' && row[j + 2]) {
          creditTerm = row[j + 2];
        }
      }
    }
  }

  // Find the header row for order details
  let orderDetailsStartIndex = -1;
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    if (row && row[0] === 'S. no.' && row.includes('HSN/SA Code')) {
      orderDetailsStartIndex = i + 1;
      console.log('Found order details header at row:', i, 'Start index:', orderDetailsStartIndex);
      break;
    }
  }
  
  console.log('Extracted PO Number:', poNumber);
  console.log('Supplier Name:', supplierName);
  console.log('Order details start index:', orderDetailsStartIndex);

  // Parse line items
  let totalQuantity = 0;
  let totalTaxableValue = 0;
  let totalTaxAmount = 0;
  let totalAmount = 0;

  if (orderDetailsStartIndex > 0) {
    for (let i = orderDetailsStartIndex; i < records.length; i++) {
      const row = records[i];
      if (!row || row.length < 5) continue;
      
      // Stop if we hit summary or notification rows
      if (row[0]?.toString().includes('Total Quantity') || 
          row[0]?.toString().includes('Important Notification') ||
          !row[0] || row[0].toString().trim() === '') {
        break;
      }

      try {
        const lineNumber = parseInt(row[0]?.toString() || '0');
        if (lineNumber > 0) {
          const line: InsertFlipkartGroceryPoLines = {
            line_number: lineNumber,
            hsn_code: row[1]?.toString() || null,
            fsn_isbn: row[2]?.toString() || null,
            quantity: parseInt(row[3]?.toString() || '0'),
            pending_quantity: parseInt(row[4]?.toString() || '0'),
            uom: row[5]?.toString() || null,
            title: row[6]?.toString() || '',
            brand: row[8]?.toString() || null,
            type: row[9]?.toString() || null,
            ean: row[10]?.toString() || null,
            vertical: row[11]?.toString() || null,
            required_by_date: parseDate(row[12]?.toString()),
            supplier_mrp: parseDecimal(row[13]?.toString()),
            supplier_price: parseDecimal(row[14]?.toString()),
            taxable_value: parseDecimal(row[15]?.toString()),
            igst_rate: parseDecimal(row[16]?.toString()),
            igst_amount_per_unit: parseDecimal(row[17]?.toString()),
            sgst_rate: parseDecimal(row[18]?.toString()),
            sgst_amount_per_unit: parseDecimal(row[19]?.toString()),
            cgst_rate: parseDecimal(row[20]?.toString()),
            cgst_amount_per_unit: parseDecimal(row[21]?.toString()),
            cess_rate: parseDecimal(row[22]?.toString()),
            cess_amount_per_unit: parseDecimal(row[23]?.toString()),
            tax_amount: parseDecimal(row[24]?.toString()),
            total_amount: parseDecimal(row[25]?.toString()),
            status: 'Pending',
            created_by: uploadedBy
          };

          lines.push(line);
          console.log('Parsed line item:', line);
          
          // Update totals
          totalQuantity += line.quantity;
          totalTaxableValue += Number(line.taxable_value) || 0;
          totalTaxAmount += Number(line.tax_amount) || 0;
          totalAmount += Number(line.total_amount) || 0;
        }
      } catch (error) {
        console.warn(`Error parsing line ${i}:`, error);
        continue;
      }
    }
  }

  header = {
    po_number: poNumber,
    supplier_name: supplierName,
    supplier_address: supplierAddress,
    supplier_contact: supplierContact,
    supplier_email: supplierEmail,
    supplier_gstin: supplierGstin,
    billed_to_address: billedToAddress,
    billed_to_gstin: billedToGstin,
    shipped_to_address: shippedToAddress,
    shipped_to_gstin: shippedToGstin,
    nature_of_supply: natureOfSupply,
    nature_of_transaction: natureOfTransaction,
    po_expiry_date: poExpiryDate,
    category: category,
    order_date: orderDate,
    mode_of_payment: modeOfPayment,
    contract_ref_id: contractRefId,
    contract_version: contractVersion,
    credit_term: creditTerm,
    // Add new location fields with default values
    distributor: '', // Will need to be set from UI or extracted if available
    area: '', // Will need to be set from UI or extracted if available
    city: '', // Will need to be set from UI or extracted if available
    region: '', // Will need to be set from UI or extracted if available
    state: '', // Will need to be set from UI or extracted if available
    dispatch_from: '', // Will need to be set from UI or extracted if available
    total_quantity: totalQuantity,
    total_taxable_value: totalTaxableValue.toString(),
    total_tax_amount: totalTaxAmount.toString(),
    total_amount: totalAmount.toString(),
    status: 'Open',
    created_by: uploadedBy,
    uploaded_by: uploadedBy
  };

  return { header, lines };
}

function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  
  try {
    // Handle DD-MM-YY format
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
        let year = parseInt(parts[2]);
        
        // Convert 2-digit year to 4-digit
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        return new Date(year, month, day);
      }
    }
    
    return new Date(dateStr);
  } catch (error) {
    console.warn('Error parsing date:', dateStr, error);
    return undefined;
  }
}

function parseDecimal(value: string | undefined): string | null {
  if (!value) return null;
  
  try {
    // Remove currency symbols and extra text
    const cleanValue = value.toString()
      .replace(/[^\d.-]/g, '')
      .trim();
    
    if (cleanValue === '') return null;
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed.toString();
  } catch (error) {
    return null;
  }
}

function extractBrandFromName(articleName: string): string {
  // Extract brand from article name (first word typically)
  if (!articleName) return 'Unknown';
  
  const words = articleName.trim().split(' ');
  if (words.length > 0) {
    return words[0];
  }
  return 'Unknown';
}

interface ParsedZeptoPO {
  header: InsertZeptoPoHeader;
  lines: InsertZeptoPoLines[];
}

export function parseZeptoPO(csvContent: string, uploadedBy: string): ParsedZeptoPO {
  // Clean the CSV content to remove any BOM or extra whitespace
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  
  // First, let's check if there are multiple header rows
  const csvLines = cleanContent.split('\n');
  console.log('First 3 lines of CSV:');
  csvLines.slice(0, 3).forEach((line, idx) => {
    console.log(`Line ${idx + 1}: ${line}`);
  });
  
  const records = parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    skip_records_with_empty_values: false,
    from_line: 1  // Start from first line (header)
  });

  if (records.length === 0) {
    throw new Error('CSV file is empty or invalid');
  }

  // Get PO number from first record
  const firstRecord = records[0] as Record<string, string>;
  const poNumber = firstRecord['PO No.'];
  if (!poNumber) {
    throw new Error('PO Number not found in CSV');
  }

  const lines: InsertZeptoPoLines[] = [];
  const brands = new Set<string>();
  let totalQuantity = 0;
  let totalCostValue = 0;
  let totalTaxAmount = 0;
  let totalAmount = 0;

  // Process each line item
  records.forEach((record: any, index: number) => {
    try {
      // Debug logging for first record
      if (index === 0) {
        console.log('Zepto CSV columns:', Object.keys(record));
        console.log('SAP Id value:', record['SAP Id']);
        console.log('All column variations:');
        Object.keys(record).forEach(key => {
          if (key.toLowerCase().includes('sap')) {
            console.log(`  "${key}": "${record[key]}"`);
          }
        });
        console.log('First record full data:', record);
      }
      
      const line: InsertZeptoPoLines = {
        line_number: index + 1,
        po_number: record['PO No.'] || poNumber,
        sku: record['SKU'] || '',
        brand: record['Brand'] || '',
        sku_id: record['SKU Id'] || '',
        sap_id: record['SAP Id'] || '',
        hsn_code: record['HSN Code'] || '',
        ean_no: record['EAN No.'] || '',
        po_qty: parseInt(record['PO Qty']) || 0,
        asn_qty: parseInt(record['ASN Qty']) || 0,
        grn_qty: parseInt(record['GRN Qty']) || 0,
        remaining_qty: parseInt(record['Remaining']) || 0,
        cost_price: parseDecimal(record['Cost Price']),
        cgst: parseDecimal(record['CGST']),
        sgst: parseDecimal(record['SGST']),
        igst: parseDecimal(record['IGST']),
        cess: parseDecimal(record['CESS']),
        mrp: parseDecimal(record['MRP']),
        total_value: parseDecimal(record['Total Value']),
        status: 'Pending',
        created_by: uploadedBy
      };

      lines.push(line);

      // Add brand to set
      if (line.brand) {
        brands.add(line.brand);
      }

      // Update totals
      totalQuantity += line.po_qty || 0;
      totalCostValue += Number(line.cost_price || 0) * (line.po_qty || 0);
      totalTaxAmount += (Number(line.cgst || 0) + Number(line.sgst || 0) + Number(line.igst || 0) + Number(line.cess || 0)) * (line.po_qty || 0);
      totalAmount += Number(line.total_value) || 0;

    } catch (error) {
      console.warn(`Error parsing Zepto PO line ${index + 1}:`, error);
    }
  });

  const header: InsertZeptoPoHeader = {
    po_number: poNumber,
    status: 'Open',
    total_quantity: totalQuantity,
    total_cost_value: totalCostValue.toString(),
    total_tax_amount: totalTaxAmount.toString(),
    total_amount: totalAmount.toString(),
    unique_brands: Array.from(brands),
    created_by: uploadedBy,
    uploaded_by: uploadedBy
  };

  return { header, lines };
}

interface ParsedCityMallPO {
  header: InsertCityMallPoHeader;
  lines: InsertCityMallPoLines[];
  columnMappings?: { [key: string]: string };
}

export function parseCityMallPO(fileContent: string | Buffer, uploadedBy: string, filename?: string): ParsedCityMallPO {
  let records: any[] = [];
  let poNumber = `CM${Date.now()}`;
  
  // Try to parse as Excel file first if it's a Buffer
  if (Buffer.isBuffer(fileContent)) {
    try {
      const workbook = XLSX.read(fileContent, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Get raw data to find the actual data structure
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Get raw arrays to see structure
        defval: '',
        blankrows: false
      });
      
      console.log('City Mall Excel - Analyzing structure, Total rows:', rawData.length);
      
      // Extract PO number from the second row, first column (row index 1)
      if (rawData.length > 1 && rawData[1][0]) {
        const extractedPoNumber = String(rawData[1][0]).trim();
        if (extractedPoNumber && !isNaN(Number(extractedPoNumber))) {
          poNumber = extractedPoNumber;
          console.log('Extracted PO Number:', poNumber);
        }
      }
      
      // Find the row with actual column headers - looking for "S.No" or similar patterns
      let headerRowIndex = -1;
      let headers: string[] = [];
      
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i] as any[];
        if (row && row.length > 0) {
          const rowStr = row.map(cell => String(cell).toLowerCase().trim()).join(' ');
          
          // Look for rows containing typical City Mall table headers
          if (rowStr.includes('sku') || rowStr.includes('product name') || 
              rowStr.includes('gst%') || rowStr.includes('hsn code') ||
              (rowStr.includes('quantity') && rowStr.includes('mrp'))) {
            headerRowIndex = i;
            headers = row.map((cell: any) => String(cell).trim());
            console.log(`Found City Mall headers at row ${i}:`, headers);
            break;
          }
        }
      }
      
      if (headerRowIndex === -1) {
        // Look for the data table by finding rows with numeric first columns (item numbers)
        console.log('No headers found, looking for data table...');
        for (let i = 0; i < rawData.length; i++) {
          const row = rawData[i] as any[];
          if (row && row.length >= 5) {
            const firstCell = String(row[0]).trim();
            const secondCell = String(row[1] || '').trim();
            const thirdCell = String(row[2] || '').trim();
            
            // Check if this looks like a data row (first column is number, has multiple filled columns)
            if (!isNaN(Number(firstCell)) && firstCell !== '' && 
                secondCell !== '' && thirdCell !== '' && 
                row.filter(cell => String(cell).trim() !== '').length >= 5) {
              console.log(`Found potential data starting at row ${i}:`, row);
              // Use the previous row as headers if it exists, otherwise use generic headers
              if (i > 0) {
                headers = rawData[i-1].map((cell: any) => String(cell).trim());
                headerRowIndex = i - 1;
                console.log('Using previous row as headers:', headers);
              } else {
                headers = ['S.No', 'Article Id', 'Article Name', 'HSN Code', 'MRP (₹)', 
                          'Base Cost Price (₹)', 'Quantity', 'Base Amount (₹)', 
                          'IGST (%) cess (%)', 'IGST (₹) cess', 'Total Amount (₹)'];
                headerRowIndex = i - 1; // Will start from current row
                console.log('Using generic headers');
              }
              break;
            }
          }
        }
        
        if (headerRowIndex === -1) {
          console.log('Still no headers found, using fallback');
          headers = ['S.No', 'Article Id', 'Article Name', 'HSN Code', 'MRP (₹)', 
                    'Base Cost Price (₹)', 'Quantity', 'Base Amount (₹)', 
                    'IGST (%) cess (%)', 'IGST (₹) cess', 'Total Amount (₹)'];
          headerRowIndex = 5; // Common position for City Mall data
        }
      }
      
      // Get data rows starting from the row after headers
      const dataRows = rawData.slice(headerRowIndex + 1);
      
      // Convert rows to objects using the headers
      records = dataRows.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? String(row[index]).trim() : '';
        });
        return obj;
      }).filter(row => {
        // Filter out empty rows, total rows, and notes/terms
        const firstColumn = String(row[headers[0]] || '').trim().toLowerCase();
        const hasData = Object.values(row).some(value => value !== '');
        
        // Skip rows that are clearly not product data
        const isNotTotal = !firstColumn.includes('total');
        const isNotNote = !firstColumn.includes('note') && 
                         !firstColumn.includes('terms') && 
                         !firstColumn.includes('condition');
        const isValidSku = firstColumn.length > 0 && 
                          firstColumn.length < 50 && 
                          !firstColumn.includes('warehouse') &&
                          !firstColumn.includes('appointment') &&
                          !firstColumn.includes('delivery');
        
        // Only include rows that have data, aren't totals/notes, and look like valid SKUs
        return hasData && isNotTotal && isNotNote && (isValidSku || firstColumn === '');
      });
      
      console.log(`Parsed ${records.length} data records`);
      if (records.length > 0) {
        console.log('Sample record:', records[0]);
        console.log('Column mappings will be:', {
          'article_id': 'SKU',
          'article_name': 'Product Name', 
          'hsn_code': 'HSN Code',
          'mrp': 'MRP (Tax Inclusive)',
          'base_cost_price': 'Buying Price',
          'quantity': 'Quantity',
          'base_amount': 'Base Amount',
          'igst_percent': 'GST%',
          'cess_percent': 'CESS%',
          'cess_amount': 'CESS Amount', 
          'total_amount': 'Gross Amount'
        });
      }
      
      if (records.length === 0) {
        throw new Error('No data rows found in Excel file');
      }
    } catch (xlsxError) {
      console.log('Excel parsing failed, trying CSV:', xlsxError);
      // If Excel parsing fails, try CSV
      const csvContent = fileContent.toString('utf-8');
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      // Extract PO from CSV filename if available
      if (filename) {
        const poMatch = filename.match(/PO-(\d+)/i);
        if (poMatch) {
          poNumber = poMatch[1];
        }
      }
    }
  } else {
    // If it's already a string, parse as CSV
    records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    // Extract PO from CSV filename if available
    if (filename) {
      const poMatch = filename.match(/PO-(\d+)/i);
      if (poMatch) {
        poNumber = poMatch[1];
      }
    }
  }
  
  if (records.length === 0) {
    throw new Error('File is empty or invalid');
  }
  
  const lines: InsertCityMallPoLines[] = [];
  const hsnCodes = new Set<string>();
  let totalQuantity = 0;
  let totalBaseAmount = 0;
  let totalIgstAmount = 0;
  let totalCessAmount = 0;
  let totalAmount = 0;

  // Process each line item
  (records as Record<string, string>[]).forEach((record, index: number) => {
    try {
      // Skip total row and empty rows
      const firstField = record[Object.keys(record)[0]] || '';
      if (firstField.toLowerCase().includes('total') || firstField.trim() === '') {
        return;
      }

      // Map City Mall Excel columns to expected fields
      // Actual columns: SKU, Product Name, GST%, CESS%, HSN Code (Units), Quantity, MRP, Buying Price, Gross Amount
      const gstPercent = parseFloat(record['GST%'] || '0');
      const cessPercent = parseFloat(record['CESS%'] || '0');
      const mrpField = record['MRP\n(Tax Inclusive)'] || record['MRP'] || '';
      const buyingPrice = record['Buying Price'] || '';
      const grossAmount = record['Gross Amount'] || '';
      
      // Calculate amounts based on available data
      const quantity = parseInt(record['Quantity']) || 0;
      const mrp = parseFloat(mrpField) || 0;
      const basePrice = parseFloat(buyingPrice) || 0;
      const itemTotalAmount = parseFloat(grossAmount) || (quantity * basePrice);
      const baseAmount = quantity * basePrice;
      const igstAmount = (baseAmount * gstPercent) / 100;
      const cessAmountCalc = (baseAmount * cessPercent) / 100;

      const line: InsertCityMallPoLines = {
        line_number: index + 1,
        article_id: record['SKU'] || '',
        article_name: record['Product Name'] || '',
        hsn_code: String(record['HSN Code (Units)'] || '').replace(/\D/g, ''), // Remove non-digits
        mrp: mrp.toString(),
        base_cost_price: basePrice.toString(),
        quantity: quantity,
        base_amount: baseAmount.toString(),
        igst_percent: gstPercent.toString(),
        cess_percent: cessPercent.toString(),
        igst_amount: igstAmount.toString(),
        cess_amount: cessAmountCalc.toString(),
        total_amount: itemTotalAmount.toString(),
        status: 'Pending',
        created_by: uploadedBy
      };



      lines.push(line);

      // Add HSN code to set
      if (line.hsn_code) {
        hsnCodes.add(line.hsn_code);
      }

      // Update totals
      totalQuantity += line.quantity || 0;
      totalBaseAmount += Number(line.base_amount || 0);
      totalIgstAmount += igstAmount;
      totalCessAmount += cessAmountCalc;
      totalAmount += Number(itemTotalAmount || 0);

    } catch (error) {
      console.warn(`Error parsing City Mall PO line ${index + 1}:`, error);
    }
  });

  const header: InsertCityMallPoHeader = {
    po_number: poNumber,
    status: 'Open',
    total_quantity: totalQuantity,
    total_base_amount: totalBaseAmount.toString(),
    total_igst_amount: totalIgstAmount.toString(),
    total_cess_amount: totalCessAmount.toString(),
    total_amount: totalAmount.toString(),
    unique_hsn_codes: Array.from(hsnCodes),
    created_by: uploadedBy,
    uploaded_by: uploadedBy
  };

  // Define column mappings for display purposes (exclude igst_amount as it's extra)
  const columnMappings = {
    'article_id': 'SKU',
    'article_name': 'Product Name', 
    'hsn_code': 'HSN Code',
    'mrp': 'MRP (Tax Inclusive)',
    'base_cost_price': 'Buying Price',
    'quantity': 'Quantity',
    'base_amount': 'Base Amount',
    'igst_percent': 'GST%',
    'cess_percent': 'CESS%',
    'cess_amount': 'CESS Amount', 
    'total_amount': 'Gross Amount'
  };

  return { header, lines, columnMappings };
}

export function parseBlinkitPO(fileContent: Buffer, uploadedBy: string): {
  poList: Array<{
    header: InsertBlinkitPoHeader;
    lines: InsertBlinkitPoLines[];
  }>;
} {
  let rows: any[];
  
  try {
    // Try to parse as Excel file first
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON - try different approaches for Blinkit files
    let jsonData: any[];
    
    // First try: Get all data as arrays to understand structure
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      range: undefined  // Get all data
    });
    
    if (rawData.length === 0) {
      throw new Error('Excel file appears to be empty');
    }
    
    // Look for actual data rows - skip title/header rows that might be merged
    let dataStartRow = 0;
    let headers: string[] = [];
    
    console.log(`🔍 BLINKIT: Analyzing file structure, found ${rawData.length} raw rows`);
    
    // Find the row with actual column headers
    for (let i = 0; i < Math.min(15, rawData.length); i++) {
      const row = rawData[i] as any[];
      console.log(`🔍 BLINKIT: Row ${i + 1}:`, row ? row.slice(0, 5) : 'empty');
      
      if (row && row.length > 1) {
        // Check if this looks like a header row with multiple meaningful columns
        const nonEmptyColumns = row.filter(cell => cell && cell.toString().trim() !== '').length;
        const hasTypicalHeaders = row.some(cell => {
          const str = (cell || '').toString().toLowerCase();
          return str.includes('item') || str.includes('product') || str.includes('quantity') || 
                 str.includes('qty') || str.includes('po') || str.includes('name') || 
                 str.includes('code') || str.includes('amount');
        });
        
        console.log(`🔍 BLINKIT: Row ${i + 1} analysis - nonEmpty: ${nonEmptyColumns}, hasTypicalHeaders: ${hasTypicalHeaders}`);
        
        if (nonEmptyColumns >= 3 && (hasTypicalHeaders || nonEmptyColumns >= 6)) { 
          headers = row.map(cell => (cell || '').toString().trim());
          dataStartRow = i + 1;
          console.log(`✅ BLINKIT: Using row ${i + 1} as headers:`, headers);
          break;
        }
      }
    }
    
    if (headers.length === 0) {
      throw new Error('Could not find column headers in the Excel file. Please ensure the file has proper column headers.');
    }
    
    // Get data rows
    const dataRows = rawData.slice(dataStartRow);
    if (dataRows.length === 0) {
      throw new Error('No data rows found in the Excel file');
    }
    
    // Convert to object format with headers
    rows = (dataRows as unknown[][]).map((row, rowIndex) => {
      const obj: any = {};
      headers.forEach((header, index) => {
        const cellValue = row[index] || '';
        obj[header] = cellValue.toString().trim();
      });
      // Add debug info for troubleshooting (will be filtered out later)
      obj._debug_row_index = dataStartRow + rowIndex + 1;
      return obj;
    }).filter((row, index) => {
      // More lenient row filtering - keep rows with any meaningful content
      const hasContent = Object.values(row).some(value => {
        const str = String(value).trim();
        return str !== '' && str !== 'undefined' && str !== 'null' && !str.startsWith('_debug_');
      });
      
      if (!hasContent) {
        console.log(`🔍 BLINKIT: Filtering out empty row ${index + 1}:`, row);
      } else {
        console.log(`✅ BLINKIT: Keeping row ${index + 1} with data:`, Object.keys(row).filter(k => !k.startsWith('_debug_')).map(k => `${k}: ${row[k]}`).slice(0, 3));
      }
      
      return hasContent;
    });
  } catch (xlsxError) {
    // Fallback to CSV parsing if Excel parsing fails
    try {
      const csvContent = fileContent.toString('utf-8');
      const parsedData = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim()
      });

      if (parsedData.errors.length > 0) {
        throw new Error(`CSV parsing errors: ${parsedData.errors.map(e => e.message).join(', ')}`);
      }

      rows = parsedData.data as any[];
    } catch (csvError) {
      throw new Error(`Failed to parse file as both Excel and CSV: ${xlsxError instanceof Error ? xlsxError.message : 'Excel error'}, ${csvError instanceof Error ? csvError.message : 'CSV error'}`);
    }
  }

  if (rows.length === 0) {
    throw new Error('File appears to be empty');
  }

  // Check for required headers with flexible matching
  const headers = Object.keys(rows[0]);
  console.log('Blinkit file headers found:', headers);
  const headerMap: { [key: string]: string } = {};
  
  // Map common header variations to standard field names (case-insensitive)
  const headerMappings = {
    po_number: ['po_number', 'po number', 'ponumber', 'po_no', 'po no', 'purchase order number', 'purchase order', 'po #', 'po#', 'order number', 'order no', 'order_number', 'order_no'],
    item_id: ['item_id', 'item id', 'itemid', 'product_id', 'product id', 'sku', 'item code', 'item_code', 'product code', 'product_code', 'barcode', 'article id', 'article_id', 'article code', 'article_code', 'vendor code', 'vendor_code'],
    name: ['name', 'product_name', 'product name', 'item_name', 'item name', 'description', 'product_description', 'product description', 'item description', 'title', 'product title', 'item_description', 'product_title', 'item_title'],
    remaining_quantity: ['remaining_quantity', 'remaining quantity', 'quantity', 'qty', 'ordered_quantity', 'ordered quantity', 'order qty', 'order quantity', 'req qty', 'required quantity', 'remaining qty', 'remaining_qty', 'order_qty', 'order_quantity'],
    // Additional optional fields for better data capture
    hsn_code: ['hsn_code', 'hsn code', 'hsn', 'hsncode', 'hsn_no', 'hsn no'],
    uom: ['uom', 'unit', 'uom_text', 'unit of measure', 'measure', 'grammage'],
    mrp: ['mrp', 'max retail price', 'maximum retail price', 'retail price', 'market price'],
    price: ['price', 'unit_price', 'unit price', 'cost', 'rate', 'cost_price', 'cost price', 'basic_cost_price', 'basic cost price'],
    total_amount: ['total_amount', 'total amount', 'total', 'amount', 'line_total', 'line total', 'total_value', 'total value'],
    tax: ['tax', 'tax_amount', 'tax amount', 'gst', 'gst_amount', 'gst amount']
  };
  
  console.log(`🔍 BLINKIT: Available headers in file:`, headers);
  
  // Find matching headers (case-insensitive)
  for (const [standardField, variations] of Object.entries(headerMappings)) {
    const matchedHeader = headers.find(header => 
      variations.some(variation => 
        header.toLowerCase().trim() === variation.toLowerCase()
      )
    );
    if (matchedHeader) {
      headerMap[standardField] = matchedHeader;
    }
  }
  
  // Check if we found all required headers (PO number is now optional)
  const requiredFields = ['item_id', 'name', 'remaining_quantity'];
  const missingFields = requiredFields.filter(field => !headerMap[field]);
  
  console.log('🔍 BLINKIT: Header mapping result:', headerMap);
  console.log('🔍 BLINKIT: Missing fields:', missingFields);
  console.log('🔍 BLINKIT: Available headers:', headers);
  
  if (missingFields.length > 0) {
    // Try more flexible matching for missing fields
    const flexibleMatches: { [key: string]: string } = {};
    
    for (const missingField of missingFields) {
      // Try partial matching for field names
      const partialMatch = headers.find(header => {
        const lowerHeader = header.toLowerCase();
        if (missingField === 'item_id') {
          return lowerHeader.includes('item') || lowerHeader.includes('product') || lowerHeader.includes('sku') || lowerHeader.includes('code');
        } else if (missingField === 'name') {
          return lowerHeader.includes('name') || lowerHeader.includes('description') || lowerHeader.includes('title');
        } else if (missingField === 'remaining_quantity') {
          return lowerHeader.includes('qty') || lowerHeader.includes('quantity') || lowerHeader.includes('order');
        }
        return false;
      });
      
      if (partialMatch) {
        console.log(`🔍 BLINKIT: Found flexible match for ${missingField}: ${partialMatch}`);
        headerMap[missingField] = partialMatch;
        flexibleMatches[missingField] = partialMatch;
      }
    }
    
    // Check again after flexible matching
    const stillMissingFields = requiredFields.filter(field => !headerMap[field]);
    
    if (stillMissingFields.length > 0) {
      // If we're still missing critical fields, provide more helpful error message
      const suggestions = stillMissingFields.map(field => {
        const variations = headerMappings[field as keyof typeof headerMappings];
        return `${field} (expected one of: ${variations.join(', ')})`;
      });
      
      throw new Error(`Missing required fields: ${suggestions.join(' | ')}. Available headers: ${headers.join(', ')}. Please check if your file has the correct column names.`);
    } else {
      console.log('✅ BLINKIT: All required fields found using flexible matching:', flexibleMatches);
    }
  } else {
    console.log('✅ BLINKIT: All required fields found with exact matching');
  }

  // Group rows by PO number (generate one if missing)
  const poGroups: { [poNumber: string]: any[] } = {};
  
  rows.forEach(row => {
    let poNumber: string;
    
    if (headerMap.po_number) {
      // Use existing PO number if available
      poNumber = row[headerMap.po_number]?.toString().trim();
      if (!poNumber) {
        // Generate PO number if field exists but is empty
        poNumber = `BL${Date.now()}`;
      }
    } else {
      // Generate PO number when field doesn't exist
      poNumber = `BL${Date.now()}`;
    }
    
    if (!poGroups[poNumber]) {
      poGroups[poNumber] = [];
    }
    poGroups[poNumber].push(row);
  });

  // Process each PO separately
  const poList = Object.entries(poGroups).map(([poNumber, poRows]) => {
    let totalQuantity = 0;
    let totalAmount = 0;

    const blinkitLines: InsertBlinkitPoLines[] = poRows.map((row: any, index: number) => {
      // Use the flexible field mappings with more comprehensive fallbacks
      const quantity = Number(
        row[headerMap.remaining_quantity] || 
        row[headerMap.remaining_quantity?.toLowerCase()] ||
        row['remaining_quantity'] || row['quantity'] || row['qty'] || 
        row['ordered_quantity'] || row['order_qty'] || 0
      );
      
      const lineTotal = Number(
        row[headerMap.total_amount] || 
        row['total_amount'] || row['total'] || row['line_total'] || 
        row['amount'] || row['value'] || 0
      );
      
      totalQuantity += quantity;
      totalAmount += lineTotal;

      console.log(`🔍 BLINKIT: Processing line ${index + 1} - item: ${row[headerMap.item_id] || 'N/A'}, qty: ${quantity}, total: ${lineTotal}`);

      return {
        line_number: index + 1,
        item_code: String(
          row[headerMap.item_id] || 
          row['item_id'] || row['sku'] || row['item_code'] || 
          row['product_id'] || row['product_code'] || row['barcode'] || ''
        ),
        hsn_code: String(
          row[headerMap.hsn_code] || 
          row['hsn_code'] || row['hsn'] || row['hsncode'] || ''
        ),
        product_upc: String(row['upc'] || row['barcode'] || row['product_upc'] || ''),
        product_description: String(
          row[headerMap.name] || 
          row['name'] || row['product_name'] || row['item_name'] || 
          row['description'] || row['product_description'] || ''
        ),
        grammage: String(
          row[headerMap.uom] || 
          row['uom_text'] || row['uom'] || row['unit'] || row['grammage'] || ''
        ),
        basic_cost_price: (Number(
          row[headerMap.price] || 
          row['cost_price'] || row['base_price'] || row['unit_price'] || 
          row['price'] || row['rate'] || 0
        )).toString(),
        cgst_percent: (Number(row['cgst_value'] || row['cgst'] || row['cgst_percent'] || 0)).toString(),
        sgst_percent: (Number(row['sgst_value'] || row['sgst'] || row['sgst_percent'] || 0)).toString(),
        igst_percent: (Number(row['igst_value'] || row['igst'] || row['igst_percent'] || 0)).toString(),
        cess_percent: (Number(row['cess_value'] || row['cess'] || row['cess_percent'] || 0)).toString(),
        additional_cess: '0',
        tax_amount: (Number(
          row[headerMap.tax] || 
          row['tax_value'] || row['tax_amount'] || row['tax'] || 
          row['gst_amount'] || row['gst'] || 0
        )).toString(),
        landing_rate: (Number(
          row['landing_rate'] || row['unit_price'] || row['price'] || 
          row['rate'] || row['cost_price'] || 0
        )).toString(),
        quantity: quantity,
        mrp: (Number(
          row[headerMap.mrp] || 
          row['mrp'] || row['max_retail_price'] || row['retail_price'] || 0
        )).toString(),
        margin_percent: (Number(row['margin_percentage'] || row['margin'] || 0)).toString(),
        total_amount: lineTotal.toString(),
        status: String(row['po_state'] || row['status'] || "Active"),
        created_by: uploadedBy
      };
    });

    const blinkitHeader: InsertBlinkitPoHeader = {
      po_number: poNumber,
      status: "Open",
      total_quantity: totalQuantity,
      total_tax_amount: blinkitLines.reduce((sum, line) => sum + Number(line.tax_amount), 0).toString(),
      created_by: uploadedBy
    };

    console.log(`✅ BLINKIT: Created PO ${poNumber} with ${blinkitLines.length} lines, total qty: ${totalQuantity}, total amount: ${totalAmount}`);
    return { header: blinkitHeader, lines: blinkitLines };
  });

  console.log(`🎉 BLINKIT PARSER SUMMARY: Processed ${rows.length} total rows into ${poList.length} POs with ${poList.reduce((sum, po) => sum + po.lines.length, 0)} total line items`);
  
  return { poList };
}

interface ParsedSwiggyPO {
  header: InsertSwiggyPo;
  lines: InsertSwiggyPoLine[];
}

export async function parseSwiggyPO(fileBuffer: Buffer, uploadedBy: string): Promise<ParsedSwiggyPO> {
  // Read the Excel file
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert worksheet to CSV format first to get tabular data
  const csvData = XLSX.utils.sheet_to_csv(worksheet);
  
  // Parse CSV to get structured rows
  const records = parse(csvData, {
    skip_empty_lines: true,
    relax_column_count: true
  });
  
  // Initialize variables for header
  let poNumber = '';
  let poDate = '';
  let supplierName = '';
  let totalAmount = 0;
  let totalQuantity = 0;
  
  // Extract header information from CSV rows
  for (const row of records) {
    if (!row || row.length === 0) continue;
    
    for (const value of row) {
      if (!value) continue;
      
      // Look for PO number pattern
      if (typeof value === 'string' && value.includes('SOTY-')) {
        poNumber = value.trim();
      }
      
      // Look for date patterns
      if (typeof value === 'string' && value.match(/\d{2}\/\d{2}\/\d{4}/)) {
        poDate = value;
      }
      
      // Look for supplier information
      if (typeof value === 'string' && value.toLowerCase().includes('supplier')) {
        supplierName = value;
      }
    }
  }
  
  // Parse line items from the data rows
  const lines: InsertSwiggyPoLine[] = [];
  let lineNumber = 1;
  
  // Look for tabular data starting after header rows
  let dataStartRow = -1;
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    if (!row) continue;
    
    // Check if this row contains item data headers
    const cellValues = row.map((val: any) => (val || '').toString().toLowerCase());
    if (cellValues.some((val: string) => val.includes('item') || val.includes('product') || val.includes('description'))) {
      dataStartRow = i + 1;
      break;
    }
  }
  
  // Extract line items
  if (dataStartRow > 0) {
    for (let i = dataStartRow; i < records.length; i++) {
      const row = records[i];
      if (!row || row.length < 3) continue;
      
      // Skip empty rows
      if (row.every((val: any) => !val)) continue;
      
      const itemCode = row[0]?.toString() || '';
      const itemName = row[1]?.toString() || '';
      const quantity = Number(row[2]) || 0;
      const unitPrice = Number(row[3]) || 0;
      const totalPrice = Number(row[4]) || (quantity * unitPrice);
      
      if (itemCode && quantity > 0) {
        lines.push({
          line_number: lineNumber++,
          item_code: itemCode,
          quantity: quantity,
          unit_base_cost: unitPrice.toString(),
          line_total: totalPrice.toString()
        });
        
        totalQuantity += quantity;
        totalAmount += totalPrice;
      }
    }
  }
  
  // Generate PO number if not found
  if (!poNumber) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    poNumber = `SW_${timestamp}`;
  }
  
  const header: InsertSwiggyPo = {
    po_number: poNumber,
    po_date: poDate ? new Date(poDate) : new Date(),
    grand_total: totalAmount.toString(),
    total_quantity: totalQuantity,
    total_items: lines.length,
    status: 'Open',
    created_by: uploadedBy
  };
  
  return {
    header,
    lines
  };
}