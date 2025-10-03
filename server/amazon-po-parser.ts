import * as XLSX from 'xlsx';
import { parse } from 'csv-parse';
import type { InsertAmazonPoHeader, InsertAmazonPoLines } from '../shared/schema';

export interface AmazonParsedData {
  header: InsertAmazonPoHeader;
  lines: InsertAmazonPoLines[];
  totalItems: number;
  totalQuantity: number;
  totalAmount: string;
  detectedVendor: string;
}

export async function parseAmazonPO(buffer: Buffer, originalFilename: string, uploadedBy: string): Promise<AmazonParsedData> {
  try {
    // Validate input
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid or empty file buffer provided');
    }

    if (!uploadedBy || uploadedBy.trim() === '') {
      throw new Error('uploadedBy parameter is required');
    }

    console.log(`Parsing Amazon PO file: ${originalFilename}`);

    const isExcel = originalFilename.toLowerCase().match(/\.(xlsx?|xls)$/);
    const isCSV = originalFilename.toLowerCase().match(/\.csv$/);

    if (isExcel) {
      return await parseAmazonExcelPO(buffer, uploadedBy);
    } else if (isCSV) {
      return await parseAmazonCSVPO(buffer, uploadedBy);
    } else {
      throw new Error('Unsupported file format. Only Excel (.xlsx, .xls) and CSV files are supported for Amazon PO uploads.');
    }
  } catch (error) {
    console.error('Error parsing Amazon PO file:', error);
    throw error;
  }
}

async function parseAmazonExcelPO(buffer: Buffer, uploadedBy: string): Promise<AmazonParsedData> {
  // Read Excel file
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No worksheets found in the Excel file');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error(`Worksheet '${firstSheetName}' not found`);
  }

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  if (!jsonData || jsonData.length === 0) {
    throw new Error('No data found in the Excel worksheet');
  }

  console.log("Processing Amazon Excel PO file with", jsonData.length, "rows");

  return parseAmazonData(jsonData, uploadedBy);
}

async function parseAmazonCSVPO(buffer: Buffer, uploadedBy: string): Promise<AmazonParsedData> {
  return new Promise((resolve, reject) => {
    const records: any[][] = [];

    parse(buffer, {
      encoding: 'utf8',
      skip_empty_lines: true,
      relax_column_count: true,
    }, (err, data) => {
      if (err) {
        console.error('CSV parsing error:', err);
        reject(new Error(`CSV parsing failed: ${err.message}`));
        return;
      }

      console.log("Processing Amazon CSV PO file with", data.length, "rows");

      try {
        const result = parseAmazonData(data, uploadedBy);
        resolve(result);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

function parseAmazonData(jsonData: any[][], uploadedBy: string): AmazonParsedData {
  console.log('📊 Amazon Excel Data Structure Analysis:');
  console.log('Total rows:', jsonData.length);
  console.log('First 5 rows:', jsonData.slice(0, 5));
  console.log('Header row candidates:', jsonData.slice(0, 10).map((row, idx) => ({
    index: idx,
    firstFewCells: row.slice(0, 5),
    length: row.length
  })));

  // Initialize header data with INR currency for India
  let header: InsertAmazonPoHeader = {
    po_number: "",
    po_date: null,
    shipment_date: null,
    delivery_date: null,
    ship_to_location: "",
    ship_to_address: "",
    bill_to_location: "",
    vendor_code: "",
    vendor_name: "",
    buyer_name: "",
    currency: "INR", // Changed to Indian Rupees
    total_amount: "0",
    tax_amount: "0",
    shipping_cost: "0",
    discount_amount: "0",
    net_amount: "0",
    status: "Open",
    notes: "",
    created_by: uploadedBy
  };

  const lines: InsertAmazonPoLines[] = [];
  let detectedVendor = "amazon"; // Always set to amazon for this parser
  let currentRowIndex = 0;
  let headerDataFound = false;
  let itemsStartIndex = -1;

  // Function to safely convert date - enhanced with better validation
  const parseDate = (dateValue: any): Date | null => {
    try {
      if (!dateValue) return null;

      if (typeof dateValue === 'number') {
        // Excel date serial number conversion
        console.log(`🔍 Converting Excel serial number: ${dateValue}`);

        // Validate reasonable range for Excel serial numbers
        if (dateValue < 1 || dateValue > 50000) {
          console.warn(`⚠️ Invalid Excel date serial number: ${dateValue}, returning null`);
          return null;
        }

        // Excel stores dates as serial numbers starting from January 1, 1900 (= day 1)
        // But Excel has a bug where it treats 1900 as a leap year (it's not)
        // This means for dates after Feb 28, 1900, the serial number is off by 1

        // Create a base date of January 1, 1900
        const baseDate = new Date(1900, 0, 1); // January 1, 1900

        // Add the days (minus 1 because Excel counts from day 1, not day 0)
        let daysToAdd = dateValue - 1;

        // Account for Excel's leap year bug - if after day 59 (Feb 28, 1900), subtract 1
        if (dateValue > 59) {
          daysToAdd = dateValue - 2; // Subtract 2 to account for both day 1 offset and leap year bug
        }

        const jsDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

        console.log(`📅 Converted ${dateValue} to: ${jsDate.toISOString()}`);

        // Validate the resulting date
        if (isNaN(jsDate.getTime()) || jsDate.getFullYear() < 1900 || jsDate.getFullYear() > 2100) {
          console.warn(`⚠️ Invalid parsed date from serial ${dateValue}: ${jsDate}, returning null`);
          return null;
        }

        return jsDate;
      }

      if (typeof dateValue === 'string') {
        // Try to parse string dates with common formats
        const trimmed = dateValue.trim();
        if (!trimmed) return null;

        // Handle common date formats
        const parsed = new Date(trimmed);

        // Validate the parsed date
        if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1900 || parsed.getFullYear() > 2100) {
          console.warn(`⚠️ Invalid parsed date from string "${dateValue}": ${parsed}, returning null`);
          return null;
        }

        console.log(`📅 Parsed date string "${dateValue}" to: ${parsed.toISOString()}`);
        return parsed;
      }

      if (dateValue instanceof Date) {
        // Validate existing Date object
        if (isNaN(dateValue.getTime()) || dateValue.getFullYear() < 1900 || dateValue.getFullYear() > 2100) {
          console.warn(`⚠️ Invalid Date object: ${dateValue}, returning null`);
          return null;
        }
        return dateValue;
      }

      console.warn(`⚠️ Unsupported date value type: ${typeof dateValue}, value: ${dateValue}`);
      return null;
    } catch (error) {
      console.error(`❌ Error parsing date value "${dateValue}":`, error);
      return null;
    }
  };

  // Function to safely extract numeric value
  const parseNumeric = (value: any): string => {
    if (!value) return "0";
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      return cleaned || "0";
    }
    return "0";
  };

  // Enhanced header parsing with more patterns - specifically for Amazon PO format
  for (let i = 0; i < Math.min(jsonData.length, 50); i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    // Comprehensive PO Number detection - Amazon specific format "PO: 664155NW"
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (!cell) continue;
      const cellStr = cell.toString();

      // Look for Amazon PO format "PO: 664155NW"
      if (cellStr.startsWith('PO:')) {
        const poMatch = cellStr.match(/PO:\s*([A-Z0-9]+)/);
        if (poMatch && poMatch[1]) {
          header.po_number = poMatch[1];
          console.log('✅ Found Amazon PO Number:', header.po_number);
        }
      }

      // Legacy patterns
      if (cellStr.toLowerCase().includes('po') && (cellStr.includes('number') || cellStr.includes('no'))) {
        if (j + 1 < row.length && row[j + 1]) {
          const poCandidate = row[j + 1].toString();
          if (poCandidate.match(/\w{6,}/)) {
            if (!header.po_number) {
              header.po_number = poCandidate;
              console.log('Found PO Number (legacy):', header.po_number);
            }
          }
        }
      }
    }

    // Amazon-specific field detection based on the Excel structure
    const firstCell = row[0] ? row[0].toString() : '';
    const secondCell = row[1] ? row[1].toString() : '';
    const thirdCell = row[3]; // Don't convert to string - keep original type for date parsing
    const thirdCellStr = thirdCell ? thirdCell.toString() : ''; // String version for text matching

    // Vendor detection - Row with "Vendor" in first column
    if (firstCell.toLowerCase() === 'vendor' && thirdCellStr) {
      header.vendor_code = thirdCellStr; // "0M7KK" - vendor code
      header.vendor_name = "Amazon"; // Set as Amazon since this is Amazon PO parser
      detectedVendor = "amazon"; // Always set to amazon for this parser
      console.log('✅ Found Amazon Vendor Code:', header.vendor_code);
      console.log('✅ Set Vendor Name:', header.vendor_name);
    }

    // Ship to location - Row with "Ship to location" in first column
    if (firstCell.toLowerCase() === 'ship to location' && thirdCellStr) {
      header.ship_to_location = thirdCellStr;
      header.bill_to_location = thirdCellStr; // Use same location for billing
      console.log('✅ Found Ship To Location:', header.ship_to_location);
    }

    // Delivery address extraction - check all cells in the row
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (!cell) continue;
      const cellStr = cell.toString();

      // Look for "Delivery Address:" prefix
      if (cellStr.includes('Delivery Address:')) {
        const deliveryAddress = cellStr.split('Delivery Address:')[1]?.trim();
        if (deliveryAddress) {
          header.ship_to_address = deliveryAddress;
          console.log('✅ Found Delivery Address location:', deliveryAddress);
        }
      }

      // Next row often contains the full address - check for multi-line addresses with company names
      if (cellStr.includes('WorldInfocom') || cellStr.includes('ESR') || (cellStr.includes('GURUGRAM') && cellStr.length > 50)) {
        if (!header.ship_to_address || header.ship_to_address.length < 20) {
          header.ship_to_address = cellStr.trim();
          console.log('✅ Found Full Delivery Address:', header.ship_to_address.substring(0, 100) + '...');
        }
      }
    }

    // Ordered On date - Row with "Ordered On" in first column
    if (firstCell.toLowerCase() === 'ordered on' && thirdCell) {
      console.log(`🔍 Attempting to parse Ordered On date from value: ${thirdCell} (type: ${typeof thirdCell})`);
      const date = parseDate(thirdCell);
      if (date) {
        header.po_date = date;
        console.log('✅ Found Order Date:', date);
      } else {
        console.warn(`⚠️ Failed to parse Ordered On date from value: ${thirdCell}`);
      }
    }

    // Ship window (delivery date range) - Row with "Ship window" in first column
    if (firstCell.toLowerCase() === 'ship window' && thirdCellStr) {
      // Store full ship window
      header.notes = (header.notes || '') + `Ship Window: ${thirdCellStr}. `;
      console.log('✅ Found Ship Window:', thirdCellStr);

      // Extract end date from range like "26/9/2025 - 21/10/2025"
      const dateRange = thirdCellStr.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateRange && dateRange[2]) {
        const deliveryDate = parseDate(dateRange[2]);
        if (deliveryDate) {
          header.delivery_date = deliveryDate;
          console.log('✅ Found Delivery Date from Ship Window:', deliveryDate);
        }
      }
    }

    // Payment terms
    if (firstCell.toLowerCase() === 'payment terms' && thirdCellStr) {
      header.notes = (header.notes || '') + `Payment Terms: ${thirdCellStr}. `;
      console.log('✅ Found Payment Terms:', thirdCellStr);
    }

    // Freight terms
    if (firstCell.toLowerCase() === 'freight terms' && thirdCellStr) {
      header.notes = (header.notes || '') + `Freight Terms: ${thirdCellStr}. `;
      console.log('✅ Found Freight Terms:', thirdCellStr);
    }

    // Payment method
    if (firstCell.toLowerCase() === 'payment method' && thirdCellStr) {
      header.notes = (header.notes || '') + `Payment Method: ${thirdCellStr}. `;
      console.log('✅ Found Payment Method:', thirdCellStr);
    }

    // Purchasing entity (can be used as buyer)
    if (firstCell.toLowerCase() === 'purchasing entity' && thirdCellStr) {
      header.buyer_name = thirdCellStr;
      console.log('✅ Found Purchasing Entity/Buyer:', thirdCellStr);
    }

    // Status
    if (firstCell.toLowerCase() === 'status' && thirdCellStr) {
      header.status = thirdCellStr;
      console.log('✅ Found Status:', thirdCellStr);
    }

    // Look for summary totals in the right side of the Excel (columns 10-20)
    if (i < 10) { // Summary info is in first 10 rows
      for (let j = 10; j < Math.min(row.length, 20); j++) {
        const cell = row[j];
        if (cell && !isNaN(parseFloat(cell.toString()))) {
          const value = parseFloat(cell.toString());

          // Look for total cost in column 17 (index 17)
          if (j === 17 && value > 1000) { // Total cost is likely > 1000
            header.total_amount = value.toString();
            header.net_amount = value.toString();
            console.log('✅ Found Total Amount:', value);
          }

          // Items count in column 10
          if (j === 10 && value > 0 && value < 1000) { // Item count
            console.log('✅ Found Items Count:', value);
          }

          // Quantity in column 12
          if (j === 12 && value > 0) {
            console.log('✅ Found Total Quantity:', value);
          }
        }
      }
    }

    // Enhanced total amount detection
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (!cell) continue;
      const cellStr = cell.toString().toLowerCase();

      if (cellStr.includes('total') && (cellStr.includes('amount') || cellStr.includes('value'))) {
        if (j + 1 < row.length && row[j + 1]) {
          const totalValue = parseNumeric(row[j + 1]);
          if (parseFloat(totalValue) > 0) {
            header.total_amount = totalValue;
            header.net_amount = totalValue;
            console.log('Found Total Amount:', totalValue);
          }
        }
      }
    }

    // Amazon-specific items header detection - look for actual columns
    const hasItemCode = row.some(cell => cell && cell.toString().toLowerCase().includes('item code'));
    const hasHSN = row.some(cell => cell && cell.toString().toLowerCase().includes('hsn'));
    const hasProductDescription = row.some(cell => cell && cell.toString().toLowerCase().includes('product') && cell.toString().toLowerCase().includes('description'));
    const hasBasicCost = row.some(cell => cell && cell.toString().toLowerCase().includes('basic') && cell.toString().toLowerCase().includes('cost'));
    const hasMRP = row.some(cell => cell && cell.toString().toLowerCase().trim() === 'mrp');
    const hasMargin = row.some(cell => cell && cell.toString().toLowerCase().includes('margin'));

    // Debug: Log when we find Item Code header
    if (hasItemCode && i >= 5) {
      console.log(`🔍 DEBUG Row ${i + 1}: Found Item Code! Row content:`, row.slice(0, 17));
      console.log(`🔍 hasHSN: ${hasHSN}, hasProductDescription: ${hasProductDescription}, hasBasicCost: ${hasBasicCost}, hasMRP: ${hasMRP}, hasMargin: ${hasMargin}`);
    }

    // Priority: If this row has Item Code, HSN, and other key headers, it's the items header
    if ((hasItemCode || hasHSN || hasProductDescription) && (hasBasicCost || hasMRP || hasMargin) && !headerDataFound) {
      itemsStartIndex = i;
      headerDataFound = true;
      console.log('✅ Found Amazon items header at row:', i + 1);
      console.log('Header row content:', row.slice(0, 17));
      break;
    }

    // Fallback: Also check for ASIN-based format (for other Amazon PO formats)
    const hasASIN = row.some(cell => cell && cell.toString().toLowerCase().trim() === 'asin');
    const hasExternalId = row.some(cell => cell && cell.toString().toLowerCase().trim().includes('external id'));
    const hasTitle = row.some(cell => cell && cell.toString().toLowerCase().trim() === 'title');

    if (hasASIN && !headerDataFound) {
      itemsStartIndex = i;
      headerDataFound = true;
      console.log('✅ Found Amazon items header with ASIN at row:', i + 1);
      console.log('Header row content:', row.slice(0, 15));
      break;
    }

    // Legacy detection as fallback - only for rows after 10 and with higher score requirement
    if (i >= 10) {
      const possibleHeaderPatterns = [
        'asin', 'sku', 'product', 'item', 'description', 'quantity', 'price', 'amount',
        'unit', 'total', 'line', 'part', 'catalog', 'model', 'external'
      ];

      const headerScore = row.reduce((score, cell) => {
        if (!cell) return score;
        const cellStr = cell.toString().toLowerCase();
        return score + possibleHeaderPatterns.filter(pattern => cellStr.includes(pattern)).length;
      }, 0);

      // Require higher score for fallback and ensure it's not in the first 10 rows
      if (headerScore >= 4 && !headerDataFound) {
        itemsStartIndex = i;
        headerDataFound = true;
        console.log('Found items header (fallback) at row:', i + 1, 'with score:', headerScore);
        console.log('Header row content:', row.slice(0, 10));
        break;
      }
    }
  }

  if (!headerDataFound || itemsStartIndex === -1) {
    throw new Error('Could not find item details section in Amazon PO file');
  }

  // Parse items with enhanced column mapping
  const headerRow = jsonData[itemsStartIndex];
  const columnMapping: { [key: string]: number } = {};

  console.log('📋 Analyzing header row for column mapping:');
  console.log('Header row:', headerRow);

  // Amazon-specific column mapping - detect format first
  // Format 1: Item Code, HSN, UPC, Basic Cost, IGST, etc. (Indian format)
  // Format 2: ASIN, External Id, Model Number, HSN, Title (Standard Amazon format)

  // Detect which format we have by checking first few headers
  const firstHeader = headerRow[0] ? headerRow[0].toString().toLowerCase().trim() : '';
  const secondHeader = headerRow[1] ? headerRow[1].toString().toLowerCase().trim() : '';

  const isFormat1 = (firstHeader === '#' || firstHeader === 'item number') &&
                    (secondHeader.includes('item code') || secondHeader.includes('sku'));
  const isFormat2 = firstHeader === 'asin' ||
                    (secondHeader.includes('external') && secondHeader.includes('id'));

  console.log(`🔍 Detected Amazon format: ${isFormat1 ? 'Format 1 (Indian)' : isFormat2 ? 'Format 2 (Standard)' : 'Unknown, defaulting to Format 2'}`);

  if (isFormat1) {
    // Format 1: Indian Amazon PO format (5401210015065.xlsx)
    console.log('📋 Applying Format 1 (Indian) column mapping...');
    columnMapping['item_number'] = 0;  // Column A - #
    columnMapping['sku'] = 1;   // Column B - Item Code
    columnMapping['category'] = 2;   // Column C - HSN Code
    columnMapping['upc'] = 3;  // Column D - Product UPC
    columnMapping['product_name'] = 4;  // Column E - Product Description
    // Column 5 is empty
    columnMapping['unit_cost'] = 6;  // Column G - Basic Cost Price
    columnMapping['igst_percent'] = 7;  // Column H - IGST %
    columnMapping['cess_percent'] = 8;  // Column I - CESS %
    columnMapping['addt_cess'] = 9;  // Column J - ADDT.CESS
    columnMapping['tax_amount'] = 10;  // Column K - Tax Amt
    columnMapping['landing_rate'] = 11; // Column L - Landing Rate
    // Column 12 is empty
    columnMapping['quantity_ordered'] = 13;  // Column N - Qty
    columnMapping['mrp'] = 14;  // Column O - MRP
    columnMapping['margin_percent'] = 15;  // Column P - Margin %
    columnMapping['total_cost'] = 16; // Column Q - Total Amt

    console.log('✅ Format 1 mapping applied:');
    console.log('- #: Column 0, Item Code: Column 1, HSN: Column 2, UPC: Column 3');
    console.log('- Description: Column 4, Basic Cost: Column 6');
    console.log('- IGST%: Column 7, CESS%: Column 8, ADDT.CESS: Column 9');
    console.log('- Tax Amt: Column 10, Landing Rate: Column 11');
    console.log('- Qty: Column 13, MRP: Column 14, Margin%: Column 15, Total: Column 16');
  } else {
    // Format 2: Standard Amazon PO format (664155NW.xlsx)
    console.log('📋 Applying Format 2 (Standard) column mapping...');
    columnMapping['asin'] = 0;  // Column A - ASIN
    columnMapping['external_id'] = 1;   // Column B - External Id (EAN/ISBN/SKU)
    columnMapping['model_number'] = 2;   // Column C - Model Number
    columnMapping['category'] = 4;   // Column E - HSN
    columnMapping['product_name'] = 5;  // Column F - Title
    columnMapping['window_type'] = 7;  // Column H - Window Type
    columnMapping['expected_date'] = 8;  // Column I - Expected date
    columnMapping['quantity_ordered'] = 9;  // Column J - Quantity Requested
    columnMapping['quantity_accepted'] = 11;  // Column L - Accepted quantity
    columnMapping['quantity_received'] = 13;  // Column N - Quantity received
    columnMapping['quantity_outstanding'] = 14;  // Column O - Quantity Outstanding
    columnMapping['unit_cost'] = 16;  // Column Q - Unit Cost
    columnMapping['total_cost'] = 18; // Column S - Total cost

    console.log('✅ Format 2 mapping applied:');
    console.log('- ASIN: Column 0, External ID: Column 1, Model: Column 2');
    console.log('- HSN: Column 4, Title: Column 5, Window Type: Column 7');
    console.log('- Expected Date: Column 8, Qty Requested: Column 9');
    console.log('- Qty Accepted: Column 11, Qty Received: Column 13, Qty Outstanding: Column 14');
    console.log('- Unit Cost: Column 16, Total Cost: Column 18');
  }

  // Optional: Validate/refine mapping by checking actual headers (but don't override format-specific mappings)
  console.log('🔍 Validating column headers match expected positions...');
  let validationWarnings = 0;

  headerRow.forEach((header: any, index: number) => {
    if (!header) return;
    const headerStr = header.toString().toLowerCase().trim().replace(/\s+/g, ' ');

    // For Format 1, validate key columns
    if (isFormat1) {
      if (index === 0 && headerStr !== '#' && !headerStr.includes('item')) {
        console.warn(`⚠️ Warning: Column 0 header is "${header}", expected "#" or "item number"`);
        validationWarnings++;
      }
      if (index === 1 && !headerStr.includes('item') && !headerStr.includes('code')) {
        console.warn(`⚠️ Warning: Column 1 header is "${header}", expected "Item Code"`);
        validationWarnings++;
      }
    }

    // For Format 2, validate key columns
    if (isFormat2) {
      if (index === 0 && headerStr !== 'asin') {
        console.warn(`⚠️ Warning: Column 0 header is "${header}", expected "ASIN"`);
        validationWarnings++;
      }
      if (index === 1 && !headerStr.includes('external') && !headerStr.includes('id')) {
        console.warn(`⚠️ Warning: Column 1 header is "${header}", expected "External Id"`);
        validationWarnings++;
      }
    }
  });

  if (validationWarnings === 0) {
    console.log('✅ All column headers validated successfully');
  } else {
    console.warn(`⚠️ Found ${validationWarnings} validation warnings - mapping may be incorrect`);
  }

  console.log('📊 Final column mapping:', columnMapping);

  // Process item rows
  for (let i = itemsStartIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    // Skip completely empty rows
    const hasAnyData = row.some((cell: any) => cell && cell.toString().trim() !== '');
    if (!hasAnyData) continue;

    // Skip rows that don't have essential data (more lenient check)
    const hasASIN = columnMapping['asin'] !== undefined && row[columnMapping['asin']];
    const hasSKU = columnMapping['sku'] !== undefined && row[columnMapping['sku']];
    const hasProductName = columnMapping['product_name'] !== undefined && row[columnMapping['product_name']];
    const hasAnyIdentifier = hasASIN || hasSKU || hasProductName;

    // Log row data for debugging
    console.log(`Row ${i}:`, {
      hasASIN,
      hasSKU,
      hasProductName,
      hasAnyIdentifier,
      rowData: row.slice(0, 10)
    });

    // Only skip if there's absolutely no identifying information
    if (!hasAnyIdentifier && row.every((cell: any) => !cell || cell.toString().trim() === '')) {
      console.log(`Skipping completely empty row ${i}`);
      continue;
    }

    // Create line item with comprehensive Amazon data including all fields from both formats
    const igstPercent = columnMapping['igst_percent'] !== undefined ? parseNumeric(row[columnMapping['igst_percent']]) : "0";
    const cessPercent = columnMapping['cess_percent'] !== undefined ? parseNumeric(row[columnMapping['cess_percent']]) : "0";
    const addtCess = columnMapping['addt_cess'] !== undefined ? parseNumeric(row[columnMapping['addt_cess']]) : "0";
    const marginPercent = columnMapping['margin_percent'] !== undefined ? parseNumeric(row[columnMapping['margin_percent']]) : "0";
    const mrp = columnMapping['mrp'] !== undefined ? parseNumeric(row[columnMapping['mrp']]) : "0";
    const landingRate = columnMapping['landing_rate'] !== undefined ? parseNumeric(row[columnMapping['landing_rate']]) : "0";

    // Extract all available data
    const asin = columnMapping['asin'] !== undefined ? (row[columnMapping['asin']] || '').toString().trim() : '';
    const externalId = columnMapping['external_id'] !== undefined ? (row[columnMapping['external_id']] || '').toString().trim() : '';
    const modelNumber = columnMapping['model_number'] !== undefined ? (row[columnMapping['model_number']] || '').toString().trim() : '';
    const hsnCode = columnMapping['category'] !== undefined ? (row[columnMapping['category']] || '').toString().trim().replace(/\n/g, '') : '';
    const windowType = columnMapping['window_type'] !== undefined ? (row[columnMapping['window_type']] || '').toString().trim() : '';
    const expectedDateValue = columnMapping['expected_date'] !== undefined ? row[columnMapping['expected_date']] : null;
    const quantityAccepted = columnMapping['quantity_accepted'] !== undefined ? parseInt(parseNumeric(row[columnMapping['quantity_accepted']])) || 0 : 0;
    const quantityReceived = columnMapping['quantity_received'] !== undefined ? parseInt(parseNumeric(row[columnMapping['quantity_received']])) || 0 : 0;
    const quantityOutstanding = columnMapping['quantity_outstanding'] !== undefined ? parseInt(parseNumeric(row[columnMapping['quantity_outstanding']])) || 0 : 0;

    const line: InsertAmazonPoLines = {
      line_number: columnMapping['item_number'] !== undefined ?
        parseInt((row[columnMapping['item_number']] || (lines.length + 1)).toString()) : lines.length + 1,
      asin: asin,
      sku: columnMapping['sku'] !== undefined ? (row[columnMapping['sku']] || '').toString().trim() : (externalId || ''),
      product_name: columnMapping['product_name'] !== undefined ? (row[columnMapping['product_name']] || '').toString().trim() : '',
      product_description: modelNumber, // Store model number in description field
      category: hsnCode, // HSN Code
      brand: '', // Not reliably available in Amazon POs
      upc: columnMapping['upc'] !== undefined ? (row[columnMapping['upc']] || '').toString().trim() : '',
      size: '', // Not reliably available in Amazon POs
      color: '', // Not reliably available in Amazon POs
      quantity_ordered: columnMapping['quantity_ordered'] !== undefined ?
        parseInt(parseNumeric(row[columnMapping['quantity_ordered']])) || 0 : 0,
      unit_cost: columnMapping['unit_cost'] !== undefined ?
        parseNumeric(row[columnMapping['unit_cost']]) : "0",
      total_cost: columnMapping['total_cost'] !== undefined ?
        parseNumeric(row[columnMapping['total_cost']]) :
        columnMapping['unit_cost'] !== undefined && columnMapping['quantity_ordered'] !== undefined ?
        (parseFloat(parseNumeric(row[columnMapping['unit_cost']])) * parseInt(parseNumeric(row[columnMapping['quantity_ordered']]))).toString() : "0",
      tax_rate: igstPercent, // Use IGST % as tax rate
      tax_amount: columnMapping['tax_amount'] !== undefined ?
        parseNumeric(row[columnMapping['tax_amount']]) : "0",
      discount_percent: "0",
      discount_amount: "0",
      net_amount: columnMapping['total_cost'] !== undefined ?
        parseNumeric(row[columnMapping['total_cost']]) : "0",
      // Store ALL additional fields in supplier_reference as JSON for display
      supplier_reference: JSON.stringify({
        external_id: externalId,
        model_number: modelNumber,
        hsn_code: hsnCode,
        window_type: windowType,
        expected_date: expectedDateValue,
        quantity_requested: columnMapping['quantity_ordered'] !== undefined ? parseInt(parseNumeric(row[columnMapping['quantity_ordered']])) || 0 : 0,
        quantity_accepted: quantityAccepted,
        quantity_received: quantityReceived,
        quantity_outstanding: quantityOutstanding,
        igst_percent: igstPercent,
        cess_percent: cessPercent,
        addt_cess: addtCess,
        landing_rate: landingRate,
        mrp: mrp,
        margin_percent: marginPercent
      }),
      expected_delivery_date: expectedDateValue ? parseDate(expectedDateValue) : null
    };

    console.log(`✅ Parsed line ${line.line_number}:`, {
      asin: line.asin,
      sku: line.sku,
      product_name: line.product_name ? line.product_name.substring(0, 50) + '...' : 'N/A',
      quantity: line.quantity_ordered,
      unit_cost: line.unit_cost,
      total_cost: line.total_cost
    });

    lines.push(line);
  }

  if (lines.length === 0) {
    throw new Error('No valid item lines found in the Amazon PO file');
  }

  // Calculate totals from parsed lines
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity_ordered, 0);
  const calculatedTotal = lines.reduce((sum, line) => sum + parseFloat(line.total_cost || '0'), 0);

  console.log(`📊 Calculated totals: Quantity=${totalQuantity}, Total=${calculatedTotal}`);

  // Always use calculated totals (more reliable than header totals)
  header.total_amount = calculatedTotal.toString();
  header.net_amount = calculatedTotal.toString();

  console.log(`✅ Updated header totals: total_amount=${header.total_amount}, net_amount=${header.net_amount}`);

  // Ensure detectedVendor is always amazon
  detectedVendor = "amazon";

  console.log(`✅ Successfully parsed Amazon PO: ${lines.length} items, total quantity: ${totalQuantity}`);
  console.log(`✅ Final summary:`, {
    po_number: header.po_number,
    vendor: detectedVendor,
    total_items: lines.length,
    total_quantity: totalQuantity,
    total_amount: header.total_amount
  });

  const result = {
    header,
    lines,
    totalItems: lines.length,
    totalQuantity,
    totalAmount: header.total_amount || calculatedTotal.toFixed(2),
    detectedVendor: detectedVendor
  };

  console.log(`📦 Final result summary:`, {
    totalItems: result.totalItems,
    totalQuantity: result.totalQuantity,
    totalAmount: result.totalAmount,
    calculatedTotal: calculatedTotal,
    header_total_amount: header.total_amount,
    po_number: header.po_number,
    po_date: header.po_date,
    ship_window: header.notes?.match(/Ship Window: ([^.]+)/)?.[1]
  });

  if (result.totalQuantity === 0 || result.totalAmount === "0" || result.totalAmount === "0.00") {
    console.warn(`⚠️ WARNING: Totals are zero! totalQuantity=${result.totalQuantity}, totalAmount=${result.totalAmount}`);
    console.warn(`⚠️ Check: calculatedTotal=${calculatedTotal}, lines.length=${lines.length}`);
    console.warn(`⚠️ Sample line totals:`, lines.slice(0, 3).map(l => ({ qty: l.quantity_ordered, cost: l.total_cost })));
  }

  return result;
}