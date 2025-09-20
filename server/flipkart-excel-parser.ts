import * as XLSX from 'xlsx';
import type { InsertFlipkartGroceryPoHeader, InsertFlipkartGroceryPoLines } from '../shared/schema';

interface ParsedFlipkartPO {
  header: InsertFlipkartGroceryPoHeader;
  lines: InsertFlipkartGroceryPoLines[];
}

export function parseFlipkartGroceryExcelPO(buffer: Buffer, uploadedBy: string): ParsedFlipkartPO {
  console.log('Parsing Flipkart Grocery PO Excel file...');

  try {
    // Read Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!jsonData || jsonData.length < 10) {
      throw new Error('Invalid Excel file format: Insufficient data rows');
    }

    console.log('Total rows in Excel file:', jsonData.length);

    // Extract header information
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
    let orderDate: Date | undefined;
    let modeOfPayment = '';
    let contractRefId = '';
    let contractVersion = '';
    let creditTerm = '';

    // Extract PO Number and other info from Row 2
    const poRow = jsonData.find((row: any[]) => row && row[0] === 'PO#');
    if (poRow && poRow[1]) {
      poNumber = poRow[1].toString().trim();

      // Extract additional info from the same row
      const natureSupplyIndex = poRow.findIndex((cell: any) => cell === 'Nature Of Supply');
      if (natureSupplyIndex >= 0 && poRow[natureSupplyIndex + 1]) {
        natureOfSupply = poRow[natureSupplyIndex + 1].toString().trim();
      }

      const natureTransactionIndex = poRow.findIndex((cell: any) => cell === 'Nature of Transaction');
      if (natureTransactionIndex >= 0 && poRow[natureTransactionIndex + 1]) {
        natureOfTransaction = poRow[natureTransactionIndex + 1].toString().trim();
      }

      const poExpiryIndex = poRow.findIndex((cell: any) => cell === 'PO Expiry');
      if (poExpiryIndex >= 0 && poRow[poExpiryIndex + 1]) {
        poExpiryDate = parseDate(poRow[poExpiryIndex + 1].toString());
      }

      const categoryIndex = poRow.findIndex((cell: any) => cell === 'CATEGORY');
      if (categoryIndex >= 0 && poRow[categoryIndex + 1]) {
        category = poRow[categoryIndex + 1].toString().trim();
      }

      const orderDateIndex = poRow.findIndex((cell: any) => cell === 'ORDER DATE');
      if (orderDateIndex >= 0 && poRow[orderDateIndex + 1]) {
        orderDate = parseDate(poRow[orderDateIndex + 1].toString());
      }
    }

    // Extract Supplier Information (Row 3)
    const supplierRow = jsonData.find((row: any[]) => row && row[0] === 'SUPPLIER NAME');
    if (supplierRow && supplierRow[1]) {
      supplierName = supplierRow[1].toString().trim();
      if (supplierRow[4]) {
        supplierAddress = supplierRow[4].toString().trim();
      }

      const contactIndex = supplierRow.findIndex((cell: any) => cell === 'SUPPLIER CONTACT');
      if (contactIndex >= 0 && supplierRow[contactIndex + 1]) {
        supplierContact = supplierRow[contactIndex + 1].toString().trim();
      }

      const emailIndex = supplierRow.findIndex((cell: any) => cell === 'EMAIL');
      if (emailIndex >= 0 && supplierRow[emailIndex + 1]) {
        supplierEmail = supplierRow[emailIndex + 1].toString().trim();
      }
    }

    // Extract Billed by and Shipped from (Row 4)
    const billedByRow = jsonData.find((row: any[]) => row && row[0] === 'Billed by');
    if (billedByRow) {
      const gstinIndex = billedByRow.findIndex((cell: any) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedByRow[gstinIndex + 1]) {
        supplierGstin = billedByRow[gstinIndex + 1].toString().trim();
      }

      const shippedFromIndex = billedByRow.findIndex((cell: any) => cell === 'Shipped From');
      if (shippedFromIndex >= 0 && billedByRow[shippedFromIndex + 1]) {
        shippedToAddress = billedByRow[shippedFromIndex + 1].toString().trim();
      }

      // GSTIN for shipped to (usually after Shipped From address)
      const lastGstinIndex = billedByRow.lastIndexOf('GSTIN');
      if (lastGstinIndex > gstinIndex && billedByRow[lastGstinIndex + 1]) {
        shippedToGstin = billedByRow[lastGstinIndex + 1].toString().trim();
      }
    }

    // Extract Billed To Address (Row 5)
    const billedToRow = jsonData.find((row: any[]) => row && row[0] === 'BILLED TO ADDRESS');
    if (billedToRow && billedToRow[2]) {
      billedToAddress = billedToRow[2].toString().trim();

      const gstinIndex = billedToRow.findIndex((cell: any) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedToRow[gstinIndex + 1]) {
        billedToGstin = billedToRow[gstinIndex + 1].toString().trim();
      }

      const shippedToIndex = billedToRow.findIndex((cell: any) => cell === 'SHIPPED TO ADDRESS');
      if (shippedToIndex >= 0 && billedToRow[shippedToIndex + 1]) {
        shippedToAddress = billedToRow[shippedToIndex + 1].toString().trim();
      }
    }

    // Extract Payment Details (Row 7)
    const paymentRow = jsonData.find((row: any[]) => row && row[0] === 'MODE OF PAYMENT') as any[];
    if (paymentRow) {
      if (paymentRow[2]) modeOfPayment = paymentRow[2].toString().trim();

      const contractRefIndex = paymentRow.findIndex((cell: any) => cell === 'CONTRACT REF ID');
      if (contractRefIndex >= 0 && paymentRow[contractRefIndex + 1]) {
        contractRefId = paymentRow[contractRefIndex + 1].toString().trim();
      }

      const contractVersionIndex = paymentRow.findIndex((cell: any) => cell === 'CONTRACT VERSION');
      if (contractVersionIndex >= 0 && paymentRow[contractVersionIndex + 1]) {
        contractVersion = paymentRow[contractVersionIndex + 1].toString().trim();
      }

      const creditTermIndex = paymentRow.findIndex((cell: any) => cell === 'CREDIT TERM');
      if (creditTermIndex >= 0) {
        // In Flipkart PO format, credit term value is usually at +2 position due to empty cell
        let creditTermValue = null;

        // Check +1, +2, and +3 positions to handle different layouts
        for (let offset = 1; offset <= 3; offset++) {
          const cellValue = paymentRow[creditTermIndex + offset];
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

    // Find table headers row
    const headerRowIndex = jsonData.findIndex((row: any[]) =>
      row && row[0] === 'S. no.' && row.includes('HSN/SA Code')
    );

    if (headerRowIndex === -1) {
      throw new Error('Could not find table headers row in Excel file');
    }

    console.log('Found table headers at row:', headerRowIndex + 1);
    const headers = jsonData[headerRowIndex] as string[];

    // Parse line items
    const lines: InsertFlipkartGroceryPoLines[] = [];
    let totalQuantity = 0;
    let totalTaxableValue = 0;
    let totalTaxAmount = 0;
    let totalAmount = 0;

    // Look for line items after headers
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];

      if (!row || row.length === 0) continue;

      // Check if this is a summary row first (before other checks)
      if (row.some((cell: any) => cell && cell.toString().includes('Total Quantity'))) {
        console.log('Found summary row at line', i + 1);
        break;
      }

      // Skip if first cell contains "Important Notification" or other non-data text
      const firstCell = row[0]?.toString() || '';
      if (firstCell.includes('Important Notification') ||
          firstCell.includes('Please mention PO number') ||
          firstCell.includes('. ') || // Contains numbered list (1. 2. etc)
          firstCell.length > 50) { // Skip cells with very long text (likely notifications)
        console.log('Skipping non-data row at line', i + 1);
        continue;
      }

      // Check if this is a valid line item (has serial number and other required data)
      const serialNum = row[0];
      const hasValidData = row[1] && row[2] && row[3]; // Must have HSN, FSN, and Quantity

      if (!serialNum || isNaN(parseInt(serialNum.toString())) || !hasValidData) {
        continue;
      }

      try {
        // Map row data to line item fields based on header positions
        // Note: Column 8 (index 7) is empty in the Excel format, so we skip it
        const lineNumber = parseInt(serialNum.toString());

        const line: InsertFlipkartGroceryPoLines = {
          line_number: lineNumber,
          hsn_code: row[1]?.toString() || null,
          fsn_isbn: row[2]?.toString() || null,
          quantity: parseInt(row[3]?.toString() || '0'),
          pending_quantity: parseInt(row[4]?.toString() || '0'),
          uom: row[5]?.toString() || null,
          title: row[6]?.toString() || '',
          // Note: row[7] is empty column in Excel format
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
        console.log(`Parsed line item ${lineNumber}:`, {
          title: line.title,
          quantity: line.quantity,
          supplier_price: line.supplier_price,
          total_amount: line.total_amount
        });

        // Update totals
        totalQuantity += line.quantity;
        totalTaxableValue += Number(line.taxable_value) || 0;
        totalTaxAmount += Number(line.tax_amount) || 0;
        totalAmount += Number(line.total_amount) || 0;

      } catch (error) {
        console.warn(`Error parsing line ${i + 1}:`, error);
        continue;
      }
    }

    if (lines.length === 0) {
      throw new Error('No valid line items found in Excel file');
    }

    // Create header object
    const header: InsertFlipkartGroceryPoHeader = {
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
      order_date: orderDate || new Date(),
      mode_of_payment: modeOfPayment,
      contract_ref_id: contractRefId,
      contract_version: contractVersion,
      credit_term: creditTerm,
      distributor: '',
      area: '',
      city: '',
      region: '',
      state: '',
      dispatch_from: '',
      total_quantity: totalQuantity,
      total_taxable_value: totalTaxableValue.toString(),
      total_tax_amount: totalTaxAmount.toString(),
      total_amount: totalAmount.toString(),
      status: 'Open',
      created_by: uploadedBy,
      uploaded_by: uploadedBy
    };

    console.log(`✅ Successfully parsed Flipkart PO: ${poNumber} with ${lines.length} line items`);
    console.log(`📊 Totals: Qty=${totalQuantity}, Amount=${totalAmount}`);

    return { header, lines };

  } catch (error) {
    console.error('Error parsing Flipkart Excel PO:', error);
    throw new Error(`Failed to parse Flipkart Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;

  try {
    // Clean the date string
    const cleanDateStr = dateStr.toString().trim();

    // Handle Excel serial number (numeric date)
    if (/^\d+(\.\d+)?$/.test(cleanDateStr)) {
      const serialNumber = parseFloat(cleanDateStr);
      // Excel date serial number starts from 1900-01-01 (but Excel thinks 1900 is a leap year)
      const excelEpoch = new Date(1900, 0, 1);
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const result = new Date(excelEpoch.getTime() + (serialNumber - 2) * millisecondsPerDay);
      console.log(`📅 Converted Excel serial ${serialNumber} to date:`, result.toISOString().split('T')[0]);
      return result;
    }

    // Handle different date formats
    if (cleanDateStr.includes('-') || cleanDateStr.includes('/')) {
      const separator = cleanDateStr.includes('-') ? '-' : '/';
      const parts = cleanDateStr.split(separator);
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