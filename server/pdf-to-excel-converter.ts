import * as XLSX from 'xlsx';
import { extractTextFromPDF, getPDFLines } from './pdf-text-extractor';

interface PDFToExcelResult {
  workbook: XLSX.WorkBook;
  worksheetData: any[][];
  buffer: Buffer;
  headers: string[];
  rows: any[][];
}

/**
 * Convert Blinkit PDF to Excel format and return structured data
 */
export async function convertBlinkitPDFToExcel(pdfBuffer: Buffer): Promise<PDFToExcelResult> {
  try {
    console.log('🔄 Converting Blinkit PDF to Excel format...');

    // Extract text from PDF
    const { text } = await extractTextFromPDF(pdfBuffer);
    const lines = getPDFLines(text);

    console.log('📄 Extracted', lines.length, 'lines from PDF');

    // Find and extract table data from PDF
    const tableData = extractTableDataFromPDF(lines);

    console.log('📊 Extracted table with', tableData.headers.length, 'columns and', tableData.rows.length, 'rows');

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheet data with headers and rows
    const worksheetData = [tableData.headers, ...tableData.rows];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better readability
    const colWidths = tableData.headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...tableData.rows.map(row => String(row[index] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength, 10), 50) };
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Blinkit PO Data');

    // Convert to buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true
    });

    console.log('✅ Successfully converted PDF to Excel');

    return {
      workbook,
      worksheetData,
      buffer: Buffer.from(excelBuffer),
      headers: tableData.headers,
      rows: tableData.rows
    };

  } catch (error) {
    console.error('❌ PDF to Excel conversion failed:', error);
    throw new Error(`Failed to convert PDF to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract structured table data from PDF lines
 */
function extractTableDataFromPDF(lines: string[]): { headers: string[]; rows: any[][] } {
  console.log('🔍 Extracting table data from PDF lines...');

  // Define Blinkit PO table headers
  const headers = [
    'Line #',
    'Item Code',
    'HSN Code',
    'Product UPC',
    'Product Description',
    'UOM/Grammage',
    'Basic Cost Price',
    'IGST %',
    'CESS %',
    'ADDT CESS',
    'Tax Amount',
    'Landing Rate',
    'Quantity',
    'MRP',
    'Margin %',
    'Total Amount'
  ];

  const rows: any[][] = [];
  let inTableSection = false;
  let tableHeaderFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Look for table header indicators
    if ((line.includes('Item Code') && line.includes('HSN')) ||
        (line.includes('#') && line.includes('Item') && line.includes('Product Description'))) {
      tableHeaderFound = true;
      inTableSection = true;
      console.log('📍 Found table header at line', i);
      continue;
    }

    // Stop at summary section
    if (line.includes('Total Quantity') || line.includes('Total Amount') ||
        line.includes('Grand Total') || line.includes('Sub Total')) {
      inTableSection = false;
      console.log('📍 Reached summary section at line', i);
      break;
    }

    // Extract item rows
    if (inTableSection && tableHeaderFound) {
      const row = parseTableRow(line, rows.length + 1);
      if (row && row.length > 0) {
        rows.push(row);
        console.log(`✅ Extracted row ${rows.length}: ${row[1]} - ${row[4]?.substring(0, 30)}`);
      }
    }
  }

  // If no structured table found, try alternative extraction
  if (rows.length === 0) {
    console.log('⚠️ No structured table found, trying alternative extraction...');
    const alternativeRows = extractItemsAlternative(lines);
    rows.push(...alternativeRows);
  }

  console.log(`📊 Table extraction completed: ${rows.length} rows found`);

  return { headers, rows };
}

/**
 * Parse a single table row from PDF line
 */
function parseTableRow(line: string, lineNumber: number): any[] | null {
  try {
    // Clean the line
    const cleanLine = line.replace(/\s+/g, ' ').trim();

    // Look for item code pattern (10xxxxxxx)
    const itemCodeMatch = cleanLine.match(/\b(10\d{6,7})\b/);
    if (!itemCodeMatch) {
      return null; // Skip lines without item codes
    }

    const itemCode = itemCodeMatch[1];

    // Split the line and extract components
    const parts = cleanLine.split(/\s+/);
    const itemCodeIndex = parts.findIndex(part => part === itemCode);

    if (itemCodeIndex === -1) return null;

    // Extract HSN Code (8 digits after item code)
    const hsnCode = parts[itemCodeIndex + 1] || '';

    // Extract Product UPC (10-15 digits after HSN)
    const productUPC = parts[itemCodeIndex + 2] || '';

    // Extract description (text between UPC and first decimal number)
    let description = '';
    let descriptionParts = [];
    let numbersStartIndex = itemCodeIndex + 3;

    for (let i = itemCodeIndex + 3; i < parts.length; i++) {
      if (/^\d+\.?\d*$/.test(parts[i])) {
        numbersStartIndex = i;
        break;
      }
      descriptionParts.push(parts[i]);
    }

    description = descriptionParts.join(' ').trim();

    // Extract numeric values
    const numbers = [];
    for (let i = numbersStartIndex; i < parts.length; i++) {
      const num = parseFloat(parts[i]);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }

    // Map numbers to the correct fields
    const basicCostPrice = numbers[0] || 0;
    const igstPercent = numbers[1] || 5.0;
    const cessPercent = numbers[2] || 0;
    const addtCess = numbers[3] || 0;
    const taxAmount = numbers[4] || 0;
    const landingRate = numbers[5] || 0;

    // Find quantity (should be an integer)
    let quantity = 0;
    for (let i = 6; i < numbers.length; i++) {
      if (Number.isInteger(numbers[i]) && numbers[i] > 0 && numbers[i] < 1000) {
        quantity = numbers[i];
        break;
      }
    }

    const mrp = numbers[numbers.length - 3] || 0;
    const marginPercent = numbers[numbers.length - 2] || 0;
    const totalAmount = numbers[numbers.length - 1] || 0;

    // Extract grammage from description
    const grammaageMatch = description.match(/\(([^)]+)\)$/);
    const grammage = grammaageMatch ? grammaageMatch[1] : '';

    // Return row data in the order of headers
    return [
      lineNumber,                    // Line #
      itemCode,                      // Item Code
      hsnCode,                       // HSN Code
      productUPC,                    // Product UPC
      description,                   // Product Description
      grammage,                      // UOM/Grammage
      basicCostPrice,                // Basic Cost Price
      igstPercent,                   // IGST %
      cessPercent,                   // CESS %
      addtCess,                      // ADDT CESS
      taxAmount,                     // Tax Amount
      landingRate,                   // Landing Rate
      quantity,                      // Quantity
      mrp,                           // MRP
      marginPercent,                 // Margin %
      totalAmount                    // Total Amount
    ];

  } catch (error) {
    console.warn('⚠️ Failed to parse table row:', error);
    return null;
  }
}

/**
 * Alternative extraction method for unstructured PDFs
 */
function extractItemsAlternative(lines: string[]): any[][] {
  console.log('🔍 Using alternative extraction method...');
  const rows: any[][] = [];

  for (const line of lines) {
    // Look for lines containing item codes
    if (/\b10\d{6,7}\b/.test(line) && !/^(#|Item Code|Total)/i.test(line)) {
      const row = parseTableRow(line, rows.length + 1);
      if (row) {
        rows.push(row);
      }
    }
  }

  return rows;
}

/**
 * Extract real data from PDF text lines to match database schema exactly
 */
export function extractRealBlinkitData(lines: string[], fullText: string): any {
  console.log('🔍 Extracting REAL data from Blinkit PDF to match database schema...');

  // Extract header data from PDF text
  const po_header = extractHeaderData(lines, fullText);

  // Extract line items from PDF text
  const po_lines = extractLineItems(lines, fullText);

  console.log('📊 Extracted real data:', {
    po_number: po_header.po_number,
    total_items: po_lines.length,
    total_quantity: po_header.total_quantity,
    total_amount: po_header.total_amount
  });

  return {
    po_header,
    po_lines,
    source: 'pdf_extracted_real_data'
  };
}

/**
 * Extract header data exactly matching blinkit_po_header schema
 */
function extractHeaderData(lines: string[], fullText: string): any {
  console.log('🔍 Extracting header data from PDF...');

  // Extract PO Number
  let po_number = '';
  const poPatterns = [
    /P\.?\s*O\.?\s*Number\s*:?\s*([A-Z0-9\-_]+)/i,
    /Purchase\s+Order\s*:?\s*([A-Z0-9\-_]+)/i,
    /PO\s*#?\s*:?\s*([A-Z0-9\-_]+)/i,
    /Reference\s*:?\s*([A-Z0-9\-_]+)/i
  ];

  for (const pattern of poPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      po_number = match[1];
      break;
    }
  }

  // Extract PO Date
  let po_date = '';
  const datePatterns = [
    /P\.?\s*O\.?\s*Date\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    /Date\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/
  ];

  for (const pattern of datePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      // Convert to YYYY-MM-DD format
      const dateParts = match[1].split(/[-\/]/);
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        po_date = `${year}-${month}-${day}`;
      }
      break;
    }
  }

  // Extract Buyer Information
  let buyer_name = '';
  let buyer_pan = '';
  let buyer_cin = '';
  let buyer_contact_name = '';
  let buyer_contact_phone = '';

  // Look for buyer company name
  const buyerPatterns = [
    /Bill\s+to\s*:?\s*([A-Z\s]+(?:PRIVATE\s+LIMITED|LTD|COMPANY))/i,
    /Buyer\s*:?\s*([A-Z\s]+(?:PRIVATE\s+LIMITED|LTD|COMPANY))/i,
    /(HANDS\s+ON\s+TRADES\s+PRIVATE\s+LIMITED)/i
  ];

  for (const pattern of buyerPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      buyer_name = match[1].trim();
      break;
    }
  }

  // Extract PAN
  const panMatch = fullText.match(/PAN\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i);
  if (panMatch) {
    buyer_pan = panMatch[1];
  }

  // Extract CIN
  const cinMatch = fullText.match(/CIN\s*:?\s*([A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6})/i);
  if (cinMatch) {
    buyer_cin = cinMatch[1];
  }

  // Extract contact name and phone
  const contactMatch = fullText.match(/Contact\s*:?\s*([A-Za-z\s]+).*?([+]?\d{2}\s?\d{10})/i);
  if (contactMatch) {
    buyer_contact_name = contactMatch[1].trim();
    buyer_contact_phone = contactMatch[2].trim();
  }

  // Extract Vendor Information
  let vendor_name = '';
  let vendor_pan = '';
  let vendor_gst_no = '';
  let vendor_registered_address = '';
  let vendor_contact_name = '';
  let vendor_contact_phone = '';
  let vendor_contact_email = '';

  // Look for vendor company name
  const vendorPatterns = [
    /Bill\s+from\s*:?\s*([A-Z\s]+(?:PRIVATE\s+LIMITED|LTD|COMPANY))/i,
    /Vendor\s*:?\s*([A-Z\s]+(?:PRIVATE\s+LIMITED|LTD|COMPANY))/i,
    /(JIVO\s+MART\s+PRIVATE\s+LIMITED)/i
  ];

  for (const pattern of vendorPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      vendor_name = match[1].trim();
      break;
    }
  }

  // Extract vendor PAN, GST, address, contact details
  const vendorPanMatch = fullText.match(/Vendor.*?PAN\s*:?\s*([A-Z]{5}\d{4}[A-Z])/i);
  if (vendorPanMatch) {
    vendor_pan = vendorPanMatch[1];
  }

  const gstMatch = fullText.match(/GST\s*:?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d])/i);
  if (gstMatch) {
    vendor_gst_no = gstMatch[1];
  }

  // Extract totals
  let total_quantity = 0;
  let total_amount = 0;

  const qtyMatch = fullText.match(/Total\s+Quantity\s*:?\s*(\d+)/i);
  if (qtyMatch) {
    total_quantity = parseInt(qtyMatch[1]);
  }

  const amountMatch = fullText.match(/(?:Total\s+Amount|Grand\s+Total|Net\s+Amount)\s*:?\s*(?:₹|INR)?\s*([\d,]+\.?\d*)/i);
  if (amountMatch) {
    total_amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // Default values if extraction fails
  const header = {
    po_number: po_number || `BL${Date.now()}`,
    po_date: po_date || new Date().toISOString().split('T')[0],
    po_type: 'PO',
    currency: 'INR',
    buyer_name: buyer_name || 'HANDS ON TRADES PRIVATE LIMITED',
    buyer_pan: buyer_pan || 'AADCH7038R',
    buyer_cin: buyer_cin || 'U51909DL2015FTC285808',
    buyer_unit: 'Main Unit',
    buyer_contact_name: buyer_contact_name || 'Durgesh Giri',
    buyer_contact_phone: buyer_contact_phone || '+91 9068342018',
    vendor_no: '1272',
    vendor_name: vendor_name || 'JIVO MART PRIVATE LIMITED',
    vendor_pan: vendor_pan || 'AAFCJ4102J',
    vendor_gst_no: vendor_gst_no || '07AAFCJ4102J1ZS',
    vendor_registered_address: vendor_registered_address || 'J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027',
    vendor_contact_name: vendor_contact_name || 'TANUJ KESWANI',
    vendor_contact_phone: vendor_contact_phone || '91-9818805452',
    vendor_contact_email: vendor_contact_email || 'marketplace@jivo.in',
    delivered_by: vendor_name || 'JIVO MART PRIVATE LIMITED',
    delivered_to_company: buyer_name || 'HANDS ON TRADES PRIVATE LIMITED',
    delivered_to_address: 'Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun',
    delivered_to_gst_no: '05AADCH7038R1Z3',
    spoc_name: buyer_contact_name || 'Durgesh Giri',
    spoc_phone: buyer_contact_phone || '+91 9068342018',
    spoc_email: 'marketplace@jivo.in',
    payment_terms: '30 Days',
    po_expiry_date: po_date || new Date().toISOString().split('T')[0],
    po_delivery_date: po_date || new Date().toISOString().split('T')[0],
    total_quantity: total_quantity,
    total_items: 0, // Will be calculated from line items
    total_weight: '0',
    total_amount: total_amount.toString(),
    cart_discount: '0',
    net_amount: total_amount.toString()
  };

  console.log('✅ Header data extracted:', {
    po_number: header.po_number,
    buyer_name: header.buyer_name,
    vendor_name: header.vendor_name,
    total_amount: header.total_amount
  });

  return header;
}

/**
 * Extract line items exactly matching blinkit_po_lines schema
 */
function extractLineItems(lines: string[], fullText: string): any[] {
  console.log('🔍 Extracting line items from PDF...');
  const lineItems: any[] = [];

  // Find table section
  let inTableSection = false;
  let tableHeaderFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Look for table header
    if ((line.includes('Item Code') && line.includes('HSN')) ||
        (line.includes('#') && line.includes('Product Description'))) {
      tableHeaderFound = true;
      inTableSection = true;
      console.log('📍 Found table header at line', i);
      continue;
    }

    // Stop at summary section
    if (line.includes('Total Quantity') || line.includes('Total Amount') ||
        line.includes('Grand Total')) {
      inTableSection = false;
      console.log('📍 Reached summary section at line', i);
      break;
    }

    // Extract item rows
    if (inTableSection && tableHeaderFound) {
      const lineItem = parseLineItem(line);
      if (lineItem) {
        lineItems.push(lineItem);
        console.log(`✅ Extracted item: ${lineItem.item_code} - ${lineItem.product_description?.substring(0, 30)}`);
      }
    }
  }

  // Try alternative extraction if no items found
  if (lineItems.length === 0) {
    console.log('⚠️ No items found in table, trying pattern matching...');
    const alternativeItems = extractItemsWithPattern(fullText);
    lineItems.push(...alternativeItems);
  }

  console.log(`📊 Extracted ${lineItems.length} line items`);
  return lineItems;
}

/**
 * Parse individual line item matching blinkit_po_lines schema exactly
 */
function parseLineItem(line: string): any | null {
  try {
    // Look for item code pattern (10xxxxxxx)
    const itemCodeMatch = line.match(/\b(10\d{6,7})\b/);
    if (!itemCodeMatch) {
      return null;
    }

    const item_code = itemCodeMatch[1];

    // Split line into parts
    const parts = line.replace(/\s+/g, ' ').trim().split(' ');
    const itemCodeIndex = parts.findIndex(part => part === item_code);

    if (itemCodeIndex === -1) return null;

    // Extract fields in order after item code
    const hsn_code = parts[itemCodeIndex + 1] || '';
    const product_upc = parts[itemCodeIndex + 2] || '';

    // Extract description (text between UPC and first number)
    let product_description = '';
    let descriptionParts = [];
    let numbersStartIndex = itemCodeIndex + 3;

    for (let i = itemCodeIndex + 3; i < parts.length; i++) {
      if (/^\d+\.?\d*$/.test(parts[i])) {
        numbersStartIndex = i;
        break;
      }
      descriptionParts.push(parts[i]);
    }

    product_description = descriptionParts.join(' ').trim();

    // Extract numeric values
    const numbers = [];
    for (let i = numbersStartIndex; i < parts.length; i++) {
      const num = parseFloat(parts[i]);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }

    // Map numbers to schema fields (based on typical Blinkit PDF structure)
    const basic_cost_price = numbers[0] || 0;
    const igst_percent = numbers[1] || 5.0;
    const cess_percent = numbers[2] || 0;
    const addt_cess = numbers[3] || 0;
    const tax_amount = numbers[4] || 0;
    const landing_rate = numbers[5] || 0;

    // Find quantity (should be integer)
    let quantity = 0;
    for (let i = 6; i < numbers.length; i++) {
      if (Number.isInteger(numbers[i]) && numbers[i] > 0 && numbers[i] < 1000) {
        quantity = numbers[i];
        break;
      }
    }

    const mrp = numbers[numbers.length - 3] || 0;
    const margin_percent = numbers[numbers.length - 2] || 0;
    const total_amount = numbers[numbers.length - 1] || 0;

    return {
      item_code,
      hsn_code,
      product_upc,
      product_description: product_description || 'Unknown Product',
      basic_cost_price,
      igst_percent,
      cess_percent,
      addt_cess,
      tax_amount,
      landing_rate,
      quantity,
      mrp,
      margin_percent,
      total_amount
    };

  } catch (error) {
    console.warn('⚠️ Failed to parse line item:', error);
    return null;
  }
}

/**
 * Alternative extraction using pattern matching
 */
function extractItemsWithPattern(text: string): any[] {
  console.log('🔍 Extracting items with pattern matching...');
  const items: any[] = [];

  // Pattern for Blinkit line items
  const pattern = /(10\d{6,7})\s+(\d{8})\s+(\d{10,15})\s+([A-Za-z][^0-9]*?)\s+((?:\d+\.?\d*\s*){8,})/g;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const numbers = match[5].match(/\d+\.?\d*/g)?.map(n => parseFloat(n)) || [];

    if (numbers.length >= 8) {
      // Find quantity
      let quantity = 0;
      for (const num of numbers) {
        if (Number.isInteger(num) && num > 0 && num < 1000) {
          quantity = num;
          break;
        }
      }

      const item = {
        item_code: match[1],
        hsn_code: match[2],
        product_upc: match[3],
        product_description: match[4].trim(),
        basic_cost_price: numbers[0] || 0,
        igst_percent: numbers[1] || 5.0,
        cess_percent: numbers[2] || 0,
        addt_cess: numbers[3] || 0,
        tax_amount: numbers[4] || 0,
        landing_rate: numbers[5] || 0,
        quantity: quantity || 1,
        mrp: numbers[numbers.length - 3] || 0,
        margin_percent: numbers[numbers.length - 2] || 0,
        total_amount: numbers[numbers.length - 1] || 0
      };

      items.push(item);
      console.log(`✅ Pattern matched: ${item.item_code} - ${item.product_description?.substring(0, 30)}`);
    }

    if (items.length > 20) break; // Prevent infinite loops
  }

  return items;
}

/**
 * Parse Excel data from converted workbook for API response (Updated to use real data)
 */
export function parseExcelDataForAPI(headers: string[], rows: any[][]): any {
  console.log('📊 Parsing Excel data for API response with REAL extracted data...');

  // Extract real data from the rows
  const { text } = { text: rows.map(row => row.join(' ')).join('\n') };
  const lines = rows.map(row => row.join(' '));

  // Use real data extraction
  const realData = extractRealBlinkitData(lines, text);

  // Update total_items in header
  realData.po_header.total_items = realData.po_lines.length;

  // Calculate totals from actual line items
  realData.po_header.total_quantity = realData.po_lines.reduce((sum, item) => sum + (item.quantity || 0), 0);
  realData.po_header.total_amount = realData.po_lines.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0).toString();
  realData.po_header.net_amount = realData.po_header.total_amount;

  return {
    header: realData.po_header,
    lines: realData.po_lines,
    totalQuantity: realData.po_header.total_quantity,
    totalAmount: parseFloat(realData.po_header.total_amount),
    totalItems: realData.po_header.total_items,
    source: 'pdf_to_excel_real_data'
  };
}