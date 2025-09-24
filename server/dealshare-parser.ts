import xlsx from 'xlsx';

interface DealsharePoHeader {
  po_number: string;
  po_created_date?: Date | null;
  po_delivery_date?: Date | null;
  po_expiry_date?: Date | null;
  shipped_by?: string;
  shipped_by_address?: string;
  shipped_by_gstin?: string;
  shipped_by_phone?: string;
  vendor_code?: string;
  shipped_to?: string;
  shipped_to_address?: string;
  shipped_to_gstin?: string;
  bill_to?: string;
  bill_to_address?: string;
  bill_to_gstin?: string;
  comments?: string;
  total_items?: number;
  total_quantity?: string;
  total_gross_amount?: string;
  uploaded_by?: string;
}

interface DealsharePoItem {
  line_number: number;
  sku?: string;
  product_name?: string;
  hsn_code?: string;
  quantity?: number;
  mrp_tax_inclusive?: string;
  buying_price?: string;
  gst_percent?: string;
  cess_percent?: string;
  gross_amount?: string;
}

export async function parseDealsharePO(buffer: Buffer, uploadedBy: string) {
  try {
    console.log("Processing Dealshare Excel file...");
    
    const workbook = xlsx.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    console.log(`Dealshare Excel has ${jsonData.length} rows`);

    // Parse header information from structured rows
    let header: DealsharePoHeader = {
      po_number: '',
      uploaded_by: uploadedBy
    };

    // Extract PO Number from row 2 (index 1)
    const poNumberRow = jsonData[1] as any[];
    if (poNumberRow && poNumberRow[0]) {
      header.po_number = String(poNumberRow[0]);
    }

    // Debug: Log first 10 rows to understand structure
    console.log('🔍 DealShare Excel Debug: First 10 rows structure:');
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      console.log(`Row ${i + 1}:`, jsonData[i]);
    }

    // Extract PO dates - Look for date patterns in the first column of multiple rows
    console.log('🔍 DealShare: Searching for dates in Excel data...');

    const dateFields = ['po_created_date', 'po_delivery_date', 'po_expiry_date'];
    let dateFieldIndex = 0;

    // Search through rows for date patterns
    for (let i = 0; i < jsonData.length && dateFieldIndex < dateFields.length; i++) {
      const row = jsonData[i];
      if (row && Array.isArray(row) && row[0]) {
        const cellValue = String(row[0]).toLowerCase();

        // Check if this row contains a date label
        if (cellValue.includes('created') || cellValue.includes('date') ||
            (i >= 3 && i <= 7)) { // Also check traditional positions

          const dateValue = String(row[0]);
          console.log(`🔍 Found potential date in row ${i + 1}: "${dateValue}"`);

          // First try parsing as text date (DD-MM-YYYY format) - this should be checked first!
          if (dateValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
            try {
              const parts = dateValue.split('-');
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JavaScript
              const year = parseInt(parts[2]);
              // Create date in UTC to avoid timezone conversion issues
              const jsDate = new Date(Date.UTC(year, month, day));

              console.log(`🔍 Parsing text date: ${dateValue} → Day: ${day}, Month: ${month + 1}, Year: ${year}`);
              console.log(`🔍 Result date: ${jsDate}`);

              const field = dateFields[dateFieldIndex];
              (header as any)[field] = jsDate;
              console.log(`✅ Converted ${field} from text: ${dateValue} → ${jsDate.toISOString()}`);
              dateFieldIndex++;
            } catch (error) {
              console.warn(`Failed to parse text date: ${dateValue}`, error);
            }
          }
          // If it's not a text date, try to parse as Excel serial date
          else {
            const excelDate = parseFloat(dateValue);
            if (!isNaN(excelDate) && excelDate > 0 && excelDate < 100000) {
              try {
                const field = dateFields[dateFieldIndex];
                (header as any)[field] = excelDateToJSDate(excelDate);
                console.log(`✅ Converted ${field}: ${dateValue} → ${(header as any)[field]}`);
                dateFieldIndex++;
              } catch (error) {
                console.warn(`Failed to convert date for field ${dateFields[dateFieldIndex]}:`, dateValue);
              }
            }
          }
        }
      }
    }

    console.log(`🔍 DealShare: Extracted ${dateFieldIndex} dates from Excel`);

    // Extract Shipped By info from rows 2-9
    if (poNumberRow && poNumberRow[1]) {
      header.shipped_by = String(poNumberRow[1]);
    }

    // Combine address from multiple rows
    const addressParts = [];
    const addressRows = [jsonData[2], jsonData[3], jsonData[4], jsonData[5]];
    for (const row of addressRows) {
      if (row && Array.isArray(row) && row[1]) {
        addressParts.push(String(row[1]).trim());
      }
    }
    header.shipped_by_address = addressParts.filter(part => part).join(', ');

    // Extract GSTIN and phone from specific rows
    const gstinRow = jsonData[7] as any[];
    if (gstinRow && gstinRow[1]) {
      const gstinMatch = String(gstinRow[1]).match(/GSTIN:\s*([^\s]+)/);
      if (gstinMatch) {
        header.shipped_by_gstin = gstinMatch[1];
      }
    }

    const phoneRow = jsonData[6] as any[];
    if (phoneRow && phoneRow[1]) {
      const phoneMatch = String(phoneRow[1]).match(/Contact No\.:\s*([^\s]+)/);
      if (phoneMatch) {
        header.shipped_by_phone = phoneMatch[1];
      }
    }

    // Extract Vendor Code from row 9
    const vendorRow = jsonData[8] as any[];
    if (vendorRow && vendorRow[1]) {
      const vendorMatch = String(vendorRow[1]).match(/Vendor Code:\s*([^\s]+)/);
      if (vendorMatch) {
        header.vendor_code = vendorMatch[1];
      }
    }

    // Extract Shipped To info from row 2 and following
    const shippedToRow = jsonData[1] as any[];
    if (shippedToRow && shippedToRow[3]) {
      header.shipped_to = String(shippedToRow[3]);
    }

    // Combine Shipped To address
    const shippedToAddressParts = [];
    for (const row of addressRows) {
      if (row && Array.isArray(row) && row[3]) {
        shippedToAddressParts.push(String(row[3]).trim());
      }
    }
    header.shipped_to_address = shippedToAddressParts.filter(part => part).join(', ');

    // Extract Shipped To GSTIN
    const shippedToGstinRow = jsonData[4] as any[];
    if (shippedToGstinRow && shippedToGstinRow[3]) {
      const gstinMatch = String(shippedToGstinRow[3]).match(/GSTIN:\s*([^\s]+)/);
      if (gstinMatch) {
        header.shipped_to_gstin = gstinMatch[1];
      }
    }

    // Extract Bill To info from row 2 and following
    const billToRow = jsonData[1] as any[];
    if (billToRow && billToRow[7]) {
      header.bill_to = String(billToRow[7]);
    }

    // Combine Bill To address
    const billToAddressParts = [];
    for (const row of addressRows) {
      if (row && Array.isArray(row) && row[7]) {
        billToAddressParts.push(String(row[7]).trim());
      }
    }
    header.bill_to_address = billToAddressParts.filter(part => part).join(', ');

    // Extract Bill To GSTIN
    const billToGstinRow = jsonData[5] as any[];
    if (billToGstinRow && billToGstinRow[7]) {
      const gstinMatch = String(billToGstinRow[7]).match(/GSTIN:\s*([^\s]+)/);
      if (gstinMatch) {
        header.bill_to_gstin = gstinMatch[1];
      }
    }

    // Extract Comments from row 10
    const commentsRow = jsonData[9] as any[];
    if (commentsRow && commentsRow[0]) {
      const commentMatch = String(commentsRow[0]).match(/Comments:\s*(.+)/);
      if (commentMatch) {
        header.comments = commentMatch[1];
      }
    }

    // Parse line items starting from row 12 (index 11)
    // Row 11 contains headers: SKU, Product Name, GST%, CESS%, HSN Code (Units), Quantity, MRP (Tax Inclusive), '', Buying Price, Gross Amount
    const lines: DealsharePoItem[] = [];
    let totalQuantity = 0;
    let totalGrossAmount = 0;

    for (let i = 11; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length < 6) continue;

      const sku = row[0];
      const productName = row[1];
      const gstPercent = row[2];
      const cessPercent = row[3];
      const hsnCode = row[4];
      const quantity = row[5];
      const mrpTaxInclusive = row[6];
      const buyingPrice = row[8]; // Skip empty column at index 7
      const grossAmount = row[9];

      if (!sku || !quantity) continue;
      
      // Skip total/summary rows or invalid data
      const skuStr = String(sku).toLowerCase().trim();
      const productStr = String(productName || '').toLowerCase().trim();
      if (skuStr.includes('total') || productStr.includes('total') || 
          skuStr.startsWith('total sku') || skuStr === '' || 
          productStr === '' || productStr === '...') continue;

      const line: DealsharePoItem = {
        line_number: i - 10, // Adjust for header rows (line items start from row 12, so subtract 10 to get line number starting from 1)
        sku: String(sku).trim(),
        product_name: String(productName || '').trim(),
        hsn_code: String(hsnCode || '').trim(),
        quantity: parseInt(String(quantity || '0')) || 0,
        mrp_tax_inclusive: String(parseFloat(String(mrpTaxInclusive || '0').replace(/,/g, '')).toFixed(2)),
        buying_price: String(parseFloat(String(buyingPrice || '0').replace(/,/g, '')).toFixed(2)),
        gst_percent: String(parseFloat(String(gstPercent || '0').replace(/,/g, '')).toFixed(2)),
        cess_percent: String(parseFloat(String(cessPercent || '0').replace(/,/g, '')).toFixed(2)),
        gross_amount: String(parseFloat(String(grossAmount || '0').replace(/,/g, '')).toFixed(2))
      };

      // Additional filter check after line creation
      if (line.sku?.includes('Total SKU') || line.sku?.toLowerCase().includes('total')) {
        console.log('Skipping total row after parsing:', line.sku);
        continue;
      }
      
      lines.push(line);

      // Calculate totals
      totalQuantity += line.quantity || 0;
      totalGrossAmount += parseFloat(String(grossAmount || '0').replace(/,/g, ''));

      console.log(`Parsed Dealshare line item ${line.line_number}:`, {
        sku: line.sku,
        product_name: line.product_name?.substring(0, 50) + '...',
        quantity: line.quantity,
        gross_amount: line.gross_amount
      });
    }

    // Update header totals
    header.total_items = lines.length;
    header.total_quantity = totalQuantity.toString();
    header.total_gross_amount = totalGrossAmount.toFixed(2);

    console.log("Dealshare PO parsed successfully:", {
      po_number: header.po_number,
      total_items: header.total_items,
      total_quantity: header.total_quantity,
      total_gross_amount: header.total_gross_amount
    });

    return {
      header,
      lines,
      totalItems: lines.length,
      totalQuantity,
      totalAmount: totalGrossAmount.toFixed(2),
      detectedVendor: 'dealshare'
    };

  } catch (error) {
    console.error("Error parsing Dealshare PO:", error);
    throw new Error(`Failed to parse Dealshare file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function excelDateToJSDate(excelDate: number): Date {
  // Excel date is days since 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  // Adjusted for the correct calculation
  const epochDiff = 25568; // Corrected difference 
  const millisecondsPerDay = 86400000;
  const jsDate = new Date((excelDate - epochDiff) * millisecondsPerDay);
  
  // If the result is in 1900s, it's likely just a placeholder. Return a reasonable default
  if (jsDate.getFullYear() < 1950) {
    return new Date(); // Return current date as fallback
  }
  
  return jsDate;
}