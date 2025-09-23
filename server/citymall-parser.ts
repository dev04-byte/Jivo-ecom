import XLSX from 'xlsx';
import type { InsertCityMallPoHeader, InsertCityMallPoLines } from '@shared/schema';

interface ParsedCityMallPO {
  header: InsertCityMallPoHeader & {
    buyer_name?: string;
    buyer_gst?: string;
    buyer_address?: string;
    vendor_gst_no?: string;
    vendor_registered_address?: string;
    vendor_contact_name?: string;
    vendor_contact_email?: string;
  };
  lines: InsertCityMallPoLines[];
}

function parseDecimal(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? null : parsed.toString();
}

function extractPOInfo(workbook: XLSX.WorkBook): {
  poNumber: string;
  poDate?: Date;
  poExpiryDate?: Date;
  vendorName?: string;
  vendorGST?: string;
  vendorCode?: string;
  buyerName?: string;
  buyerGST?: string;
  buyerAddress?: string;
  vendorContactName?: string;
  vendorAddress?: string;
  vendorPhone?: string;
} {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  let poNumber = '';
  let poDate: Date | undefined;
  let poExpiryDate: Date | undefined;
  let vendorName = '';
  let vendorGST = '';
  let vendorCode = '';
  let buyerName = '';
  let buyerGST = '';
  let buyerAddress = '';
  let vendorContactName = '';
  let vendorAddress = '';
  let vendorPhone = '';

  // Look for PO info in the header area (usually in top-right corner)
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i] as any[];

    for (let j = 0; j < row.length; j++) {
      const cellValue = String(row[j] || '');

      // Extract PO number and dates from merged cell or individual cells
      if (cellValue.includes('Purchase Order PO-') || cellValue.includes('PO-')) {
        const lines = cellValue.split('\n');
        for (const line of lines) {
          if (line.includes('PO-')) {
            const match = line.match(/PO-(\d+)/);
            if (match) poNumber = match[1];
          }
          if (line.includes('Purchase Order Date') || line.includes('PO Date')) {
            const dateMatch = line.match(/(\d{2}-\d{2}-\d{4})/);
            if (dateMatch) {
              const [day, month, year] = dateMatch[1].split('-');
              // Note: month is 0-indexed in JS Date, so subtract 1
              poDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
          }
          if (line.includes('Expiry Date') || line.includes('Valid Until')) {
            const dateMatch = line.match(/(\d{2}-\d{2}-\d{4})/);
            if (dateMatch) {
              const [day, month, year] = dateMatch[1].split('-');
              // Note: month is 0-indexed in JS Date, so subtract 1
              poExpiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
          }
        }
      }

      // Try to extract PO number from separate cells too
      if (!poNumber && (cellValue.includes('PO Number') || cellValue.includes('PO#'))) {
        // Check next cell for the actual PO number
        if (j + 1 < row.length) {
          const nextCell = String(row[j + 1] || '');
          const match = nextCell.match(/PO-?(\d+)/);
          if (match) poNumber = match[1];
        }
      }

      // Extract vendor info - vendor data is in column 4 (index 4)
      if (String(row[0]).toLowerCase().includes('issued to')) {
        vendorName = String(row[4] || '').trim();
      }
      if (String(row[0]).toLowerCase().includes('vendor code')) {
        vendorCode = String(row[4] || '').trim();
      }
      // GST for vendor is after "Vendor Code" row
      if (String(row[0]).toLowerCase() === 'gst' && i > 6 && !vendorGST) {
        const gstValue = String(row[4] || '').trim();
        if (gstValue.includes('-')) {
          vendorGST = gstValue;
        }
      }
      // Extract contact person name
      if (String(row[0]).toLowerCase().includes('contact person')) {
        vendorContactName = String(row[4] || '').trim();
      }
      // Extract vendor address
      if (String(row[0]).toLowerCase() === 'address' && i > 6) {
        vendorAddress = String(row[4] || '').trim();
      }
      // Extract vendor contact number
      if (String(row[0]).toLowerCase().includes('vendor contact')) {
        vendorPhone = String(row[4] || '').trim();
      }

      // Extract buyer company information (from "Company Details" section)
      if (String(row[0]).toLowerCase() === 'name' && i < 5) {
        buyerName = String(row[2] || '').trim();
      }
      if (String(row[0]).toLowerCase() === 'gst' && i < 5) {
        buyerGST = String(row[2] || '').trim();
      }
      if (String(row[0]).toLowerCase().includes('billing address') && i < 5) {
        buyerAddress = String(row[2] || '').trim();
      }
    }
  }

  return {
    poNumber: poNumber || `CM${Date.now()}`,
    poDate,
    poExpiryDate,
    vendorName,
    vendorGST,
    vendorCode,
    buyerName,
    buyerGST,
    buyerAddress,
    vendorContactName,
    vendorAddress,
    vendorPhone
  };
}

export function parseCityMallPO(fileContent: Buffer, uploadedBy: string): ParsedCityMallPO {
  try {
    console.log('Starting CityMall PO parsing...');
    const workbook = XLSX.read(fileContent, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No worksheets found in the Excel file');
    }

    console.log('Available sheets:', workbook.SheetNames);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!worksheet) {
      throw new Error('Could not access the worksheet');
    }

    // Extract PO header information
    console.log('Extracting PO header information...');
    const poInfo = extractPOInfo(workbook);

    // Get all data to find the data table
    console.log('Reading worksheet data...');
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    console.log(`Found ${allData.length} rows in worksheet`);

    // Find the header row for line items
    console.log('Searching for header row...');
    let headerRowIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(25, allData.length); i++) {
      const row = allData[i] as any[];
      if (row && row.length > 0) {
        const cellValues = row.map(cell => String(cell).toLowerCase().trim());
        // Look for the line items header - more flexible pattern matching
        if ((cellValues.some(val => val.includes('s.no') || val.includes('sr no') || val.includes('s no') || val.includes('serial')) &&
            cellValues.some(val => val.includes('article') || val.includes('product') || val.includes('item'))) ||
            (cellValues.some(val => val.includes('article id') || val.includes('sku') || val.includes('product id')) &&
            cellValues.some(val => val.includes('name') || val.includes('description')))) {
          headerRowIndex = i;
          headers = row.map(cell => String(cell));
          console.log(`Found header row at index ${i}:`, headers.slice(0, 10));
          break;
        }
      }
    }

  if (headerRowIndex === -1) {
    // If we can't find a proper header, try to find a fallback pattern
    console.log('Primary header pattern not found, trying fallback...');
    for (let i = 0; i < Math.min(30, allData.length); i++) {
      const row = allData[i] as any[];
      if (row && row.length >= 5) {
        const cellValues = row.map(cell => String(cell).toLowerCase().trim());
        // More lenient fallback - look for any numeric first column and text columns
        if (cellValues[0] && !isNaN(Number(cellValues[0])) &&
            cellValues.some(val => val.length > 3 && isNaN(Number(val)))) {
          headerRowIndex = i - 1; // Assume header is one row above
          if (headerRowIndex >= 0 && allData[headerRowIndex]) {
            headers = (allData[headerRowIndex] as any[]).map(cell => String(cell));
            console.log(`Found fallback header at row ${headerRowIndex}`);
            break;
          }
        }
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Could not find the line items table in the Excel file. Please ensure the file contains a proper table with headers like "S.No", "Article", etc.');
    }
  }

  // Parse line items
  const lines: InsertCityMallPoLines[] = [];
  const hsnCodes = new Set<string>();
  let totalQuantity = 0;
  let totalBaseAmount = 0;
  let totalIgstAmount = 0;
  let totalCessAmount = 0;
  let totalAmount = 0;

  // Process data rows
  for (let i = headerRowIndex + 1; i < allData.length; i++) {
    const row = allData[i] as any[];

    // Skip empty rows, total rows, or rows without meaningful data
    if (!row || row.length === 0 || !row[0]) {
      continue;
    }

    const firstCol = String(row[0]).toLowerCase().trim();
    if (firstCol === 'total' || firstCol === '' || isNaN(Number(firstCol))) {
      continue;
    }

    // Validate that we have basic required data
    const tempArticleId = String(row[1] || '').trim();
    const tempArticleName = String(row[5] || '').trim();
    const tempSNo = row[0];

    if (!tempSNo || (!tempArticleId && !tempArticleName)) {
      continue; // Skip if we don't have essential data
    }

    // Map row data based on XLSX.js output structure
    const sNo = row[0];
    const articleId = row[1] || '';
    const articleName = row[5] || ''; // Article name at index 5
    const hsnCode = row[8] || ''; // HSN code at index 8
    const mrp = row[11] || 0; // MRP at index 11
    const baseCostPrice = row[13] || 0; // Base cost price at index 13
    const quantity = row[15] || 0; // Quantity at index 15
    const baseAmount = row[16] || 0; // Base amount at index 16
    const igstCess = String(row[18] || ''); // IGST/CESS percentage at index 18
    const igstCessAmount = String(row[19] || ''); // IGST/CESS amount at index 19
    const total = row[21] || 0; // Total at index 21

    // Parse IGST and CESS percentages
    const igstCessLines = igstCess.split('\n');
    const igstPercent = parseFloat(igstCessLines[0] || '0');
    const cessPercent = parseFloat(igstCessLines[1] || '0');

    // Parse IGST and CESS amounts
    const igstCessAmountLines = igstCessAmount.split('\n');
    const igstAmt = parseFloat(igstCessAmountLines[0] || '0');
    const cessAmt = parseFloat(igstCessAmountLines[1] || '0');

    const line: InsertCityMallPoLines = {
      line_number: parseInt(String(sNo)) || i - headerRowIndex,
      article_id: String(articleId),
      article_name: String(articleName),
      hsn_code: String(hsnCode),
      mrp: parseDecimal(mrp),
      base_cost_price: parseDecimal(baseCostPrice),
      quantity: parseInt(String(quantity)) || 0,
      base_amount: parseDecimal(baseAmount),
      igst_percent: igstPercent.toString(),
      cess_percent: cessPercent.toString(),
      igst_amount: igstAmt.toString(),
      cess_amount: cessAmt.toString(),
      total_amount: parseDecimal(total),
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
    totalBaseAmount += parseFloat(line.base_amount || '0');
    totalIgstAmount += igstAmt;
    totalCessAmount += cessAmt;
    totalAmount += parseFloat(line.total_amount || '0');
  }

    if (lines.length === 0) {
      throw new Error('No line items found in the Excel file');
    }

    console.log(`Successfully parsed ${lines.length} line items`);

    const header: InsertCityMallPoHeader = {
      po_number: poInfo.poNumber,
      po_date: poInfo.poDate,
      po_expiry_date: poInfo.poExpiryDate,
      vendor_name: poInfo.vendorName,
      vendor_gstin: poInfo.vendorGST,
      vendor_code: poInfo.vendorCode,
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

    return {
      header: {
        ...header,
        buyer_name: poInfo.buyerName,
        buyer_gst: poInfo.buyerGST,
        buyer_address: poInfo.buyerAddress,
        vendor_gst_no: poInfo.vendorGST,
        vendor_registered_address: poInfo.vendorAddress,
        vendor_contact_name: poInfo.vendorContactName,
        vendor_contact_email: '', // Not available in CityMall format
      },
      lines
    };

  } catch (error) {
    console.error('Error parsing CityMall PO:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to parse CityMall PO: ${error.message}`);
    }
    throw new Error('Failed to parse CityMall PO: Unknown error');
  }
}