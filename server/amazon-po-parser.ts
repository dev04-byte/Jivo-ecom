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
    const thirdCell = row[3] ? row[3].toString() : ''; // Amazon format has data in column D (index 3)

    // Vendor detection - Row with "Vendor" in first column
    if (firstCell.toLowerCase() === 'vendor' && thirdCell) {
      header.vendor_code = thirdCell; // "0M7KK" - vendor code
      header.vendor_name = "Amazon"; // Set as Amazon since this is Amazon PO parser
      detectedVendor = "amazon"; // Always set to amazon for this parser
      console.log('✅ Found Amazon Vendor Code:', header.vendor_code);
      console.log('✅ Set Vendor Name:', header.vendor_name);
    }

    // Ship to location - Row with "Ship to location" in first column
    if (firstCell.toLowerCase() === 'ship to location' && thirdCell) {
      header.ship_to_location = thirdCell;
      header.bill_to_location = thirdCell; // Use same location for billing
      console.log('✅ Found Ship To Location:', header.ship_to_location);
    }

    // Delivery address extraction for more detailed address
    if (firstCell.toLowerCase().includes('delivery address')) {
      const deliveryAddress = firstCell.split('Delivery Address:')[1]?.trim();
      if (deliveryAddress) {
        header.ship_to_address = deliveryAddress;
        console.log('✅ Found Delivery Address:', header.ship_to_address);
      }
    }

    // Ordered On date - Row with "Ordered On" in first column
    if (firstCell.toLowerCase() === 'ordered on' && thirdCell) {
      const date = parseDate(thirdCell);
      if (date) {
        header.po_date = date;
        console.log('✅ Found Order Date:', date);
      }
    }

    // Ship window (delivery date range) - Row with "Ship window" in first column
    if (firstCell.toLowerCase() === 'ship window' && thirdCell) {
      // Extract end date from range like "26/9/2025 - 21/10/2025"
      const dateRange = thirdCell.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateRange && dateRange[2]) {
        const deliveryDate = parseDate(dateRange[2]);
        if (deliveryDate) {
          header.delivery_date = deliveryDate;
          console.log('✅ Found Delivery Date from Ship Window:', deliveryDate);
        }
      }
    }

    // Payment terms
    if (firstCell.toLowerCase() === 'payment terms' && thirdCell) {
      header.notes = (header.notes || '') + `Payment Terms: ${thirdCell}. `;
      console.log('✅ Found Payment Terms:', thirdCell);
    }

    // Freight terms
    if (firstCell.toLowerCase() === 'freight terms' && thirdCell) {
      header.notes = (header.notes || '') + `Freight Terms: ${thirdCell}. `;
      console.log('✅ Found Freight Terms:', thirdCell);
    }

    // Payment method
    if (firstCell.toLowerCase() === 'payment method' && thirdCell) {
      header.notes = (header.notes || '') + `Payment Method: ${thirdCell}. `;
      console.log('✅ Found Payment Method:', thirdCell);
    }

    // Purchasing entity (can be used as buyer)
    if (firstCell.toLowerCase() === 'purchasing entity' && thirdCell) {
      header.buyer_name = thirdCell;
      console.log('✅ Found Purchasing Entity/Buyer:', thirdCell);
    }

    // Status
    if (firstCell.toLowerCase() === 'status' && thirdCell) {
      header.status = thirdCell;
      console.log('✅ Found Status:', thirdCell);
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

    // Amazon-specific items header detection - look for exact Amazon headers
    const hasASIN = row.some(cell => cell && cell.toString().toLowerCase().trim() === 'asin');
    const hasExternalId = row.some(cell => cell && cell.toString().toLowerCase().trim().includes('external id'));
    const hasTitle = row.some(cell => cell && cell.toString().toLowerCase().trim() === 'title');
    const hasQuantity = row.some(cell => cell && cell.toString().toLowerCase().includes('quantity'));

    // Debug: Log when we find ASIN
    if (hasASIN && i >= 5) {
      console.log(`🔍 DEBUG Row ${i + 1}: Found ASIN! Row content:`, row.slice(0, 10));
      console.log(`🔍 hasExternalId: ${hasExternalId}, hasTitle: ${hasTitle}, hasQuantity: ${hasQuantity}`);
    }

    // Priority: If this row has ASIN header text, it's definitely the Amazon items header
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

  // Amazon-specific column mapping - simplified to focus on essential data only
  // Based on typical Amazon PO structure
  columnMapping['asin'] = 0;  // Column A - ASIN
  columnMapping['sku'] = 1;   // Column B - External Id (use as SKU)
  columnMapping['product_name'] = 5;  // Column F - Title/Product Name
  columnMapping['category'] = 4;   // Column E - HSN/Category
  columnMapping['quantity_ordered'] = 9;  // Column J - Quantity Requested

  // Look for unit cost and total cost in common locations
  // These are typically in later columns in Amazon POs
  columnMapping['unit_cost'] = 15;  // Common location for unit price
  columnMapping['total_cost'] = 16; // Common location for line total

  console.log('✅ Applied simplified Amazon column mapping:');
  console.log('- ASIN: Column 0');
  console.log('- SKU (External ID): Column 1');
  console.log('- Product Name (Title): Column 5');
  console.log('- Category (HSN): Column 4');
  console.log('- Quantity Requested: Column 9');
  console.log('- Unit Cost: Column 15');
  console.log('- Total Cost: Column 16');

  // Enhanced dynamic mapping for pricing columns that might vary
  headerRow.forEach((header: any, index: number) => {
    if (!header) return;
    const headerStr = header.toString().toLowerCase().trim();

    // Override direct mapping if we find better header matches
    if (headerStr === 'asin' && index !== columnMapping['asin']) {
      columnMapping['asin'] = index;
      console.log(`✅ Found ASIN header at column ${index}`);
    }

    if (headerStr === 'external id' && index !== columnMapping['sku']) {
      columnMapping['sku'] = index;
      console.log(`✅ Found External ID (SKU) at column ${index}`);
    }

    if (headerStr === 'title' && index !== columnMapping['product_name']) {
      columnMapping['product_name'] = index;
      console.log(`✅ Found Title (Product Name) at column ${index}`);
    }

    if (headerStr.includes('quantity requested') || headerStr === 'quantity requested') {
      columnMapping['quantity_ordered'] = index;
      console.log(`✅ Found Quantity Requested at column ${index}`);
    }

    // Look for pricing columns which can vary
    if ((headerStr.includes('unit') && (headerStr.includes('cost') || headerStr.includes('price'))) ||
        headerStr === 'unit price' || headerStr === 'price per unit') {
      columnMapping['unit_cost'] = index;
      console.log(`✅ Found Unit Cost at column ${index}`);
    }

    if ((headerStr.includes('total') && (headerStr.includes('cost') || headerStr.includes('price') || headerStr.includes('amount'))) ||
        headerStr === 'total' || headerStr === 'line total' || headerStr === 'amount') {
      columnMapping['total_cost'] = index;
      console.log(`✅ Found Total Cost at column ${index}`);
    }
  });

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

    // Create line item with essential Amazon data only
    const line: InsertAmazonPoLines = {
      line_number: lines.length + 1,
      asin: columnMapping['asin'] !== undefined ? (row[columnMapping['asin']] || '').toString() : '',
      sku: columnMapping['sku'] !== undefined ? (row[columnMapping['sku']] || '').toString() : '',
      product_name: columnMapping['product_name'] !== undefined ? (row[columnMapping['product_name']] || '').toString() : '',
      product_description: '', // Not available in basic Amazon PO
      category: columnMapping['category'] !== undefined ? (row[columnMapping['category']] || '').toString() : '',
      brand: '', // Not reliably available in Amazon POs
      upc: '', // Not reliably available in Amazon POs
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
      tax_rate: "0",
      tax_amount: "0",
      discount_percent: "0",
      discount_amount: "0",
      net_amount: columnMapping['total_cost'] !== undefined ?
        parseNumeric(row[columnMapping['total_cost']]) : "0",
      supplier_reference: "",
      expected_delivery_date: null
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

  // Calculate totals
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity_ordered, 0);
  const calculatedTotal = lines.reduce((sum, line) => sum + parseFloat(line.total_cost || '0'), 0);

  // Update header totals if not already set
  if (header.total_amount === "0" && calculatedTotal > 0) {
    header.total_amount = calculatedTotal.toString();
    header.net_amount = calculatedTotal.toString();
  }

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

  return {
    header,
    lines,
    totalItems: lines.length,
    totalQuantity,
    totalAmount: header.total_amount,
    detectedVendor: detectedVendor
  };
}