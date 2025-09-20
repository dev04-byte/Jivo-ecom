import { parse } from 'csv-parse/sync';
import XLSX from 'xlsx';
import * as xml2js from 'xml2js';
import Papa from 'papaparse';
import type { InsertFlipkartGroceryPoHeader, InsertFlipkartGroceryPoLines, InsertZeptoPoHeader, InsertZeptoPoLines, InsertCityMallPoHeader, InsertCityMallPoLines, InsertBlinkitPoHeader, InsertBlinkitPoLines, InsertSwiggyPo, InsertSwiggyPoLine } from '@shared/schema';

interface ParsedFlipkartPO {
  header: InsertFlipkartGroceryPoHeader;
  lines: InsertFlipkartGroceryPoLines[];
}

export function parseFlipkartGroceryPO(csvContent: string, uploadedBy: string): ParsedFlipkartPO {
  console.log('Parsing Flipkart Grocery PO...');
  const records = parse(csvContent, {
    skip_empty_lines: true,
    relax_column_count: true
  });
  
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
        if (row[j] === 'CREDIT TERM') {
          // In Flipkart CSV format, credit term value is usually at +2 position due to empty cell
          let creditTermValue = null;

          // Check +1, +2, and +3 positions to handle different layouts
          for (let offset = 1; offset <= 3; offset++) {
            const cellValue = row[j + offset];
            if (cellValue && cellValue.toString().trim() !== '') {
              creditTermValue = cellValue;
              break;
            }
          }

          if (creditTermValue) {
            creditTerm = creditTermValue.toString().trim();
            console.log(`💳 Found credit term: "${creditTerm}"`);
          } else {
            console.log('⚠️ CREDIT TERM field found but no value found in adjacent cells');
          }
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
    // Clean the date string
    const cleanDateStr = dateStr.toString().trim();

    // Handle different date formats
    if (cleanDateStr.includes('-')) {
      const parts = cleanDateStr.split('-');
      if (parts.length === 3) {
        let day, month, year;

        // Detect format: YYYY-MM-DD vs DD-MM-YY/YYYY
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          day = parseInt(parts[2]);
          console.log(`📅 Detected YYYY-MM-DD format: ${cleanDateStr}`);
        } else {
          // DD-MM-YY/YYYY format
          day = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          year = parseInt(parts[2]);

          // Convert 2-digit year to 4-digit
          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          console.log(`📅 Detected DD-MM-YY/YYYY format: ${cleanDateStr}`);
        }

        // Validate parsed values
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
          // Create date in UTC to avoid timezone issues
          const result = new Date(Date.UTC(year, month, day));
          console.log(`📅 Parsed date ${cleanDateStr} as:`, result.toISOString().split('T')[0]);
          return result;
        } else {
          console.warn(`⚠️ Invalid date components: day=${day}, month=${month+1}, year=${year}`);
        }
      }
    }

    // Try standard JavaScript Date parsing
    const result = new Date(cleanDateStr);
    if (!isNaN(result.getTime())) {
      console.log(`📅 Parsed date ${cleanDateStr} as:`, result.toISOString().split('T')[0]);
      return result;
    }

    console.warn('⚠️ Unable to parse date:', cleanDateStr);
    return undefined;
  } catch (error) {
    console.warn('❌ Error parsing date:', dateStr, error);
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

interface ParsedZeptoPOMultiple {
  poList: Array<{
    header: InsertZeptoPoHeader;
    lines: InsertZeptoPoLines[];
  }>;
}

export function parseZeptoPO(csvContent: string, uploadedBy: string): ParsedZeptoPOMultiple {
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
    throw new Error('CSV file is empty or contains no data rows. Please ensure the CSV file has actual data beyond just headers.');
  }

  // Check if all records are empty (only headers, no data)
  const hasValidData = records.some((record: any) => {
    return Object.values(record).some(value => value && value.toString().trim() !== '');
  });

  if (!hasValidData) {
    throw new Error('CSV file contains only headers with no actual data. Please upload a CSV file with PO line items.');
  }

  // Group records by PO Number
  const poGroups = new Map<string, any[]>();

  records.forEach((record: any) => {
    const hasData = Object.values(record).some(value => value && value.toString().trim() !== '');
    if (!hasData) return;

    const poNumber = record['PO No.']?.trim();
    if (!poNumber) return;

    if (!poGroups.has(poNumber)) {
      poGroups.set(poNumber, []);
    }
    poGroups.get(poNumber)!.push(record);
  });

  if (poGroups.size === 0) {
    throw new Error('No valid PO numbers found in CSV. Please ensure the CSV has valid data in the "PO No." column.');
  }

  // Process each PO group
  const poList: Array<{header: InsertZeptoPoHeader; lines: InsertZeptoPoLines[]}> = [];

  for (const [poNumber, poRecords] of poGroups) {
    const lines: InsertZeptoPoLines[] = [];
    const brands = new Set<string>();
    let totalQuantity = 0;
    let totalCostValue = 0;
    let totalTaxAmount = 0;
    let totalAmount = 0;

    // Process each line item for this PO
    poRecords.forEach((record: any, index: number) => {
      try {
        // Debug logging for first valid record of first PO
        if (poList.length === 0 && lines.length === 0) {
          console.log('Zepto CSV columns:', Object.keys(record));
          console.log('First valid record full data:', record);
        }

        // Use sequential line numbers since Line No column is empty
        const lineNumber = index + 1;

        // Map to correct CSV columns based on actual data structure
        const line: InsertZeptoPoLines = {
          line_number: lineNumber,
          po_number: poNumber,
          sku: record['SKU'] || '',  // Use the GUID from SKU column
          sku_desc: record['SKU Desc'] || '',  // Product description
          brand: record['Brand'] || '',
          sku_id: record['SKU Code'] || '',  // This is empty in the actual file
          sap_id: record['SKU'] || '',  // Use SKU as SAP ID since SKU Code is empty
          hsn_code: record['HSN'] || '',
          ean_no: record['EAN'] || '',
          po_qty: parseInt(record['Qty']) || 0,
          asn_qty: parseInt(record['ASN Quantity']) || 0,
          grn_qty: parseInt(record['GRN Quantity']) || 0,
          remaining_qty: (parseInt(record['Qty']) || 0) - (parseInt(record['ASN Quantity']) || 0) - (parseInt(record['GRN Quantity']) || 0),
          cost_price: parseDecimal(record['Unit Base Cost']),
          landing_cost: parseDecimal(record['Landing Cost']),
          cgst: parseDecimal(record['CGST %']),
          sgst: parseDecimal(record['SGST %']),
          igst: parseDecimal(record['IGST %']),
          cess: parseDecimal(record['CESS %']),
          mrp: parseDecimal(record['MRP']),
          total_value: parseDecimal(record['Total Amount']),
          status: record['Status'] || 'PENDING_ACKNOWLEDGEMENT',  // Use actual status from CSV
          created_by: record['Created By'] || uploadedBy
        };

        lines.push(line);

        // Add brand to set
        if (line.brand) {
          brands.add(line.brand);
        }

        // Update totals
        totalQuantity += line.po_qty || 0;
        totalCostValue += Number(line.cost_price || 0) * (line.po_qty || 0);

        // Calculate tax amounts per item
        const itemTaxAmount = ((Number(line.cgst || 0) + Number(line.sgst || 0) + Number(line.igst || 0) + Number(line.cess || 0)) / 100) * Number(line.cost_price || 0) * (line.po_qty || 0);
        totalTaxAmount += itemTaxAmount;

        totalAmount += Number(line.total_value) || 0;

      } catch (error) {
        console.warn(`Error parsing Zepto PO line ${index + 1} for PO ${poNumber}:`, error);
      }
    });

    // Create header for this PO using first record
    const firstRecord = poRecords[0];

    // Parse date properly - handle various date formats including "9/17/2025 12:04"
    const parseZeptoDate = (dateStr: string): Date => {
      try {
        if (!dateStr) return new Date();

        // Handle "9/17/2025 12:04" format (M/D/YYYY H:mm)
        if (dateStr.includes('/')) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }

        // Handle "2024-01-15" format
        if (dateStr.includes('-') && dateStr.split('-').length === 3) {
          return new Date(dateStr);
        }

        // Handle other formats
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
        return new Date();
      } catch {
        return new Date();
      }
    };

    const header: InsertZeptoPoHeader = {
      po_number: poNumber,
      po_date: parseZeptoDate(firstRecord['PO Date']),
      status: firstRecord['Status'] || 'Open',
      vendor_code: firstRecord['Vendor Code'] || '',
      vendor_name: firstRecord['Vendor Name'] || '',
      po_amount: parseDecimal(firstRecord['PO Amount']) || totalAmount.toString(),
      delivery_location: firstRecord['Del Location'] || '',
      po_expiry_date: firstRecord['PO Expiry Date'] ? parseZeptoDate(firstRecord['PO Expiry Date']) : null,
      total_quantity: totalQuantity,
      total_cost_value: totalCostValue.toString(),
      total_tax_amount: totalTaxAmount.toString(),
      total_amount: totalAmount.toString(),
      unique_brands: Array.from(brands),
      created_by: firstRecord['Created By'] || uploadedBy,
      uploaded_by: uploadedBy
    };

    poList.push({ header, lines });
  }

  console.log(`✅ Successfully parsed ${poList.length} Zepto POs with ${poList.reduce((sum, po) => sum + po.lines.length, 0)} total line items`);

  return { poList };
}

interface ParsedCityMallPO {
  header: InsertCityMallPoHeader;
  lines: InsertCityMallPoLines[];
}

export function parseCityMallPO(csvContent: string, uploadedBy: string, filename?: string): ParsedCityMallPO {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  if (records.length === 0) {
    throw new Error('CSV file is empty or invalid');
  }

  // Extract PO number from filename or use a generated one
  let poNumber = `CM${Date.now()}`;
  
  if (filename) {
    // Try to extract PO number from filename like "PO-1346338_timestamp.csv"
    const poMatch = filename.match(/PO-(\d+)/i);
    if (poMatch) {
      poNumber = poMatch[1]; // Use just the number part
    }
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
      // Skip total row
      if (record['S.No'] === '' && record['Article Id'] === 'Total') {
        return;
      }

      // Parse IGST and CESS percentages from combined field
      const igstCessField = record['IGST (%) cess (%)'] || '';
      const igstCessLines = igstCessField.split('\n');
      const igstPercent = parseFloat(igstCessLines[0] || '0');
      const cessPercent = parseFloat(igstCessLines[1] || '0');

      // Parse IGST and CESS amounts from combined field
      const igstCessAmountField = record['IGST (₹) cess'] || '';
      const igstCessAmountLines = igstCessAmountField.split('\n');
      const igstAmount = parseFloat(igstCessAmountLines[0] || '0');
      const cessAmount = parseFloat(igstCessAmountLines[1] || '0');

      const line: InsertCityMallPoLines = {
        line_number: parseInt(record['S.No']) || index + 1,
        article_id: record['Article Id'] || '',
        article_name: record['Article Name'] || '',
        hsn_code: record['HSN Code'] || '',
        mrp: parseDecimal(record['MRP (₹)']),
        base_cost_price: parseDecimal(record['Base Cost Price (₹)']),
        quantity: parseInt(record['Quantity']) || 0,
        base_amount: parseDecimal(record['Base Amount (₹)']),
        igst_percent: igstPercent.toString(),
        cess_percent: cessPercent.toString(),
        igst_amount: igstAmount.toString(),
        cess_amount: cessAmount.toString(),
        total_amount: parseDecimal(record['Total Amount (₹)']),
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
      totalCessAmount += cessAmount;
      totalAmount += Number(line.total_amount || 0);

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

  return { header, lines };
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
    
    // Find the row with actual column headers
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i] as any[];
      if (row && row.length > 1) {
        // Check if this looks like a header row with multiple meaningful columns
        const nonEmptyColumns = row.filter(cell => cell && cell.toString().trim() !== '').length;
        if (nonEmptyColumns >= 4) { // At least 4 columns with data
          headers = row.map(cell => (cell || '').toString().trim());
          dataStartRow = i + 1;
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
    rows = (dataRows as unknown[][]).map((row) => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = (row[index] || '').toString().trim();
      });
      return obj;
    }).filter(row => {
      // Filter out completely empty rows
      return Object.values(row).some(value => value !== '');
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
    po_number: ['po_number', 'po number', 'ponumber', 'po_no', 'po no', 'purchase order number', 'purchase order', 'po #', 'po#', 'order number', 'order no'],
    item_id: ['item_id', 'item id', 'itemid', 'product_id', 'product id', 'sku', 'item code', 'item_code', 'product code', 'product_code', 'barcode', 'article id'],
    name: ['name', 'product_name', 'product name', 'item_name', 'item name', 'description', 'product_description', 'product description', 'item description', 'title', 'product title'],
    remaining_quantity: ['remaining_quantity', 'remaining quantity', 'quantity', 'qty', 'ordered_quantity', 'ordered quantity', 'order qty', 'order quantity', 'req qty', 'required quantity'],
    hsn_code: ['hsn_code', 'hsn code', 'hsn', 'hsncode'],
    product_upc: ['product_upc', 'product upc', 'upc', 'barcode'],
    basic_cost_price: ['basic_cost_price', 'basic cost price', 'cost price', 'basic cost', 'unit cost'],
    igst_percent: ['igst_%', 'igst', 'igst_percent', 'igst percent'],
    cess_percent: ['cess_%', 'cess', 'cess_percent', 'cess percent'],
    tax_amount: ['tax_amount', 'tax amount', 'tax'],
    landing_rate: ['landing_rate', 'landing rate', 'landing cost'],
    mrp: ['mrp', 'max retail price', 'maximum retail price'],
    margin_percent: ['margin_%', 'margin', 'margin_percent', 'margin percent'],
    total_amount: ['total_amount', 'total amount', 'total']
  };
  
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
  
  // Check if we found all required headers
  const criticalFields = ['item_id', 'name'];  // Only require item-level data
  const missingCriticalFields = criticalFields.filter(field => !headerMap[field]);

  console.log('Header mapping result:', headerMap);
  console.log('Missing critical fields:', missingCriticalFields);

  if (missingCriticalFields.length > 0) {
    // If we're missing critical fields, provide more helpful error message
    const suggestions = missingCriticalFields.map(field => {
      const variations = headerMappings[field as keyof typeof headerMappings];
      return `${field} (expected one of: ${variations.join(', ')})`;
    });

    throw new Error(`Missing required fields: ${suggestions.join(' | ')}. Available headers: ${headers.join(', ')}. Please check if your file has the correct column names.`);
  }

  // Group rows by PO number or create a default PO
  const poGroups: { [poNumber: string]: any[] } = {};

  rows.forEach(row => {
    let poNumber = row[headerMap.po_number]?.toString().trim();

    // If no PO number field exists or is empty, generate one
    if (!poNumber) {
      poNumber = `BLINKIT_PO_${Date.now()}`;
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
      // Use the flexible field mappings
      const quantity = Number(row[headerMap.remaining_quantity] || row['Quantity'] || row['quantity'] || row['qty'] || 0);
      const lineTotal = Number(row[headerMap.total_amount] || row['Total Amount'] || row['total_amount'] || row['amount'] || 0);

      totalQuantity += quantity;
      totalAmount += lineTotal;

      return {
        item_code: String(row[headerMap.item_id] || row['Item Code'] || row['item_code'] || row['sku'] || ''),
        hsn_code: String(row[headerMap.hsn_code] || row['HSN Code'] || row['hsn_code'] || row['hsn'] || ''),
        product_upc: String(row[headerMap.product_upc] || row['Product UPC'] || row['product_upc'] || row['upc'] || ''),
        product_description: String(row[headerMap.name] || row['Product Description'] || row['product_description'] || row['description'] || ''),
        basic_cost_price: (Number(row[headerMap.basic_cost_price] || row['Basic Cost Price'] || row['basic_cost_price'] || row['cost_price'] || 0)).toString(),
        igst_percent: (Number(row[headerMap.igst_percent] || row['IGST %'] || row['igst_percent'] || row['igst'] || 0)).toString(),
        cess_percent: (Number(row[headerMap.cess_percent] || row['CESS %'] || row['cess_percent'] || row['cess'] || 0)).toString(),
        addt_cess: (Number(row['ADDT. CESS'] || row['addt_cess'] || row['additional_cess'] || 0)).toString(),
        tax_amount: (Number(row[headerMap.tax_amount] || row['Tax Amount'] || row['tax_amount'] || row['tax'] || 0)).toString(),
        landing_rate: (Number(row[headerMap.landing_rate] || row['Landing Rate'] || row['landing_rate'] || row['price'] || 0)).toString(),
        quantity: quantity,
        mrp: (Number(row[headerMap.mrp] || row['MRP'] || row['mrp'] || 0)).toString(),
        margin_percent: (Number(row[headerMap.margin_percent] || row['Margin %'] || row['margin_percent'] || row['margin'] || 0)).toString(),
        total_amount: lineTotal.toString()
      };
    });

    const blinkitHeader: InsertBlinkitPoHeader = {
      po_number: poNumber,
      po_date: null,
      po_type: null,
      currency: null,
      buyer_name: null,
      buyer_pan: null,
      buyer_cin: null,
      buyer_unit: null,
      buyer_contact_name: null,
      buyer_contact_phone: null,
      vendor_no: null,
      vendor_name: null,
      vendor_pan: null,
      vendor_gst_no: null,
      vendor_registered_address: null,
      vendor_contact_name: null,
      vendor_contact_phone: null,
      vendor_contact_email: null,
      delivered_by: null,
      delivered_to_company: null,
      delivered_to_address: null,
      delivered_to_gst_no: null,
      spoc_name: null,
      spoc_phone: null,
      spoc_email: null,
      payment_terms: null,
      po_expiry_date: null,
      po_delivery_date: null,
      total_quantity: totalQuantity,
      total_items: blinkitLines.length,
      total_weight: null,
      total_amount: totalAmount.toString(),
      cart_discount: "0",
      net_amount: totalAmount.toString()
    };

    return { header: blinkitHeader, lines: blinkitLines };
  });

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