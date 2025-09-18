import XLSX from 'xlsx';

interface BlinkitExcelLineItem {
  item_code: string;
  hsn_code: string;
  product_upc: string;
  product_description: string;
  basic_cost_price: number;
  igst_percent: number;
  cess_percent: number;
  addt_cess: number;
  tax_amount: number;
  landing_rate: number;
  quantity: number;
  mrp: number;
  margin_percent: number;
  total_amount: number;
}

interface BlinkitExcelHeader {
  po_number: string;
  po_date: string;
  po_type: string;
  currency: string;
  buyer_name: string;
  buyer_pan: string;
  buyer_cin: string;
  buyer_unit: string;
  buyer_contact_name: string;
  buyer_contact_phone: string;
  vendor_no: string;
  vendor_name: string;
  vendor_pan: string;
  vendor_gst_no: string;
  vendor_registered_address: string;
  vendor_contact_name: string;
  vendor_contact_phone: string;
  vendor_contact_email: string;
  delivered_by: string;
  delivered_to_company: string;
  delivered_to_address: string;
  delivered_to_gst_no: string;
  spoc_name: string;
  spoc_phone: string;
  spoc_email: string;
  payment_terms: string;
  po_expiry_date: string;
  po_delivery_date: string;
  total_quantity: number;
  total_items: number;
  total_weight: string;
  total_amount: string;
  cart_discount: string;
  net_amount: string;
}

interface BlinkitExcelData {
  po_header: BlinkitExcelHeader;
  po_lines: BlinkitExcelLineItem[];
}

/**
 * Parse real Blinkit Excel files (like the one from C:\Users\singh\Downloads\blinkit.xlsx)
 * This handles the actual format used in Blinkit Purchase Orders
 */
export function parseBlinkitExcelFile(fileContent: Buffer): BlinkitExcelData {
  console.log('🔍 Parsing real Blinkit Excel file...');

  try {
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    console.log('📊 Excel data loaded, total rows:', rawData.length);

    // Extract header information from the structured data
    const header = extractHeaderFromBlinkitExcel(rawData);

    // Extract line items from the data
    const lineItems = extractLineItemsFromBlinkitExcel(rawData);

    // Calculate totals if missing
    if (!header.total_amount || header.total_amount === '' || header.total_amount === '0') {
      const calculatedTotal = lineItems.reduce((sum, item) => sum + (item.total_amount || 0), 0);
      header.total_amount = calculatedTotal.toFixed(2);
    }

    if (!header.total_quantity || header.total_quantity === 0) {
      header.total_quantity = lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }

    if (!header.total_weight || header.total_weight === '') {
      // Estimate weight from line items if available
      const estimatedWeight = lineItems.length * 0.1; // Rough estimate: 100g per item
      header.total_weight = `${estimatedWeight.toFixed(2)} kg`;
    }

    console.log('✅ Successfully parsed Blinkit Excel:', {
      po_number: header.po_number,
      vendor_name: header.vendor_name,
      total_items: lineItems.length,
      total_quantity: header.total_quantity,
      total_amount: header.total_amount,
      total_weight: header.total_weight
    });

    return {
      po_header: header,
      po_lines: lineItems
    };

  } catch (error) {
    console.error('❌ Error parsing Blinkit Excel file:', error);
    throw new Error(`Failed to parse Blinkit Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractHeaderFromBlinkitExcel(rawData: any[]): BlinkitExcelHeader {
  console.log('🔍 Extracting header information...');

  // Initialize with default values
  let header: BlinkitExcelHeader = {
    po_number: '',
    po_date: '',
    po_type: 'PO',
    currency: 'INR',
    buyer_name: '',
    buyer_pan: '',
    buyer_cin: '',
    buyer_unit: '',
    buyer_contact_name: '',
    buyer_contact_phone: '',
    vendor_no: '',
    vendor_name: '',
    vendor_pan: '',
    vendor_gst_no: '',
    vendor_registered_address: '',
    vendor_contact_name: '',
    vendor_contact_phone: '',
    vendor_contact_email: '',
    delivered_by: '',
    delivered_to_company: '',
    delivered_to_address: '',
    delivered_to_gst_no: '',
    spoc_name: '',
    spoc_phone: '',
    spoc_email: '',
    payment_terms: '',
    po_expiry_date: '',
    po_delivery_date: '',
    total_quantity: 0,
    total_items: 0,
    total_weight: '',
    total_amount: '',
    cart_discount: '',
    net_amount: ''
  };

  // Extract information from the structured format
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i] as any[];
    if (!row || row.length === 0) continue;

    const cellText = (row[0] || '').toString();
    console.log(`🔍 Processing row ${i}:`, cellText.substring(0, 50));

    // Row 1: Buyer company information
    if (cellText.includes('HANDS ON TRADES PRIVATE LIMITED')) {
      header.buyer_name = 'HANDS ON TRADES PRIVATE LIMITED';

      // Extract PAN and CIN from all columns in this row
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const colText = (row[colIndex] || '').toString();

        const panMatch = colText.match(/PAN\s*:\s*([A-Z0-9]+)/);
        if (panMatch) header.buyer_pan = panMatch[1];

        const cinMatch = colText.match(/CIN\s*:\s*([A-Z0-9]+)/);
        if (cinMatch) header.buyer_cin = cinMatch[1];

        // Extract contact info
        const contactMatch = colText.match(/Contact Name:\s*([^\n]+)/);
        if (contactMatch) header.buyer_contact_name = contactMatch[1].trim();

        const phoneMatch = colText.match(/Phone No\s*:\s*([^\n]+)/);
        if (phoneMatch) header.buyer_contact_phone = phoneMatch[1].trim();
      }
    }

    // Row 2: Vendor information
    if (cellText.includes('JIVO MART PRIVATE LIMITED')) {
      header.vendor_name = 'JIVO MART PRIVATE LIMITED';

      // Extract vendor information from all columns in this row
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const colText = (row[colIndex] || '').toString();

        // Extract vendor PAN
        const vendorPanMatch = colText.match(/PAN\s*:\s*([A-Z0-9]+)/);
        if (vendorPanMatch) header.vendor_pan = vendorPanMatch[1];

        // Extract vendor address
        const addressMatch = colText.match(/Address\s*:\s*([^\n]+)/);
        if (addressMatch) header.vendor_registered_address = addressMatch[1].trim();

        // Extract vendor contact
        const vendorContactMatch = colText.match(/Contact\s*:\s*([^\n]+)/);
        if (vendorContactMatch) header.vendor_contact_name = vendorContactMatch[1].trim();

        // Extract vendor phone - more flexible pattern
        const vendorPhoneMatch = colText.match(/([0-9+\-\s]{8,})/);
        if (vendorPhoneMatch) header.vendor_contact_phone = vendorPhoneMatch[1].trim();

        // Extract vendor email
        const emailMatch = colText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) header.vendor_contact_email = emailMatch[1];
      }
    }

    // Extract PO details from row 2 (search all columns)
    if (i === 2) {
      console.log('🔍 Processing PO details from row 2, searching all columns...');

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const poDetailsText = (row[colIndex] || '').toString();
        if (poDetailsText.length < 5) continue; // Skip empty or very short cells

        console.log(`🔍 Processing PO details from row 2, column ${colIndex}:`, poDetailsText.substring(0, 100));

        // Extract PO Number (13 digits)
        const poNumberMatch = poDetailsText.match(/(\d{13})/);
        if (poNumberMatch) {
          header.po_number = poNumberMatch[1];
          console.log('✅ Found PO Number:', header.po_number);
        }

        // Extract PO Date (more flexible pattern)
        const poDateMatch = poDetailsText.match(/([A-Z][a-z]{2,8}\.\s*\d{1,2},\s*\d{4},\s*\d{1,2}:\d{2}\s*[ap]\.m\.)/);
        if (poDateMatch) {
          header.po_date = poDateMatch[1];
          console.log('✅ Found PO Date:', header.po_date);
        }

        // Extract Vendor Number (4 digits)
        const vendorNoMatch = poDetailsText.match(/(\d{4})/);
        if (vendorNoMatch && vendorNoMatch[1] !== header.po_number?.substring(0, 4)) {
          header.vendor_no = vendorNoMatch[1];
          console.log('✅ Found Vendor No:', header.vendor_no);
        }
      }
    }

    // Extract payment terms and dates from row 3 (search all columns)
    if (i === 3) {
      console.log('🔍 Processing payment details from row 3, searching all columns...');

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const paymentDetailsText = (row[colIndex] || '').toString();
        if (paymentDetailsText.length < 5) continue; // Skip empty or very short cells

        console.log(`🔍 Processing payment details from row 3, column ${colIndex}:`, paymentDetailsText.substring(0, 100));

        // Split by lines to extract individual values
        const lines = paymentDetailsText.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex].trim();
          if (line.length < 3) continue; // Skip very short lines

          console.log(`🔍 Processing line ${lineIndex}: "${line}"`);

          // Extract payment terms (flexible pattern)
          const paymentTermsMatch = line.match(/(\d+\s*Days?)/i);
          if (paymentTermsMatch) {
            header.payment_terms = paymentTermsMatch[1];
            console.log('✅ Found Payment Terms:', header.payment_terms);
          }

          // Extract expiry date (flexible pattern)
          const expiryDateMatch = line.match(/(Sept?\.\s*\d{1,2},\s*\d{4})/);
          if (expiryDateMatch) {
            header.po_expiry_date = line.replace(':', '').trim();
            console.log('✅ Found PO Expiry Date:', header.po_expiry_date);
          }

          // Extract delivery date (flexible pattern)
          const deliveryDateMatch = line.match(/(Sept?\.\s*\d{1,2},\s*\d{4})/);
          if (deliveryDateMatch && !header.po_expiry_date.includes(deliveryDateMatch[1])) {
            header.po_delivery_date = line.replace(':', '').trim();
            console.log('✅ Found PO Delivery Date:', header.po_delivery_date);
          }

          // Extract vendor GST (flexible pattern)
          const vendorGstMatch = line.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9])/);
          if (vendorGstMatch) {
            header.vendor_gst_no = vendorGstMatch[1];
            console.log('✅ Found Vendor GST:', header.vendor_gst_no);
          }
        }
      }
    }

    // Extract SPOC information (search all columns)
    if (cellText.includes('SPOC')) {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const colText = (row[colIndex] || '').toString();

        // Extract SPOC name (flexible pattern)
        if (colText.includes('SPOC')) {
          const spocNameMatch = colText.match(/SPOC[:\s]*([A-Z\s]+)/);
          if (spocNameMatch) {
            header.spoc_name = spocNameMatch[1].trim();
            console.log('✅ Found SPOC Name:', header.spoc_name);
          }

          // Extract SPOC phone (flexible pattern)
          const spocPhoneMatch = colText.match(/(\d{10})/);
          if (spocPhoneMatch) {
            header.spoc_phone = spocPhoneMatch[1];
            console.log('✅ Found SPOC Phone:', header.spoc_phone);
          }

          // Extract SPOC email (flexible pattern)
          const spocEmailMatch = colText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (spocEmailMatch) {
            // Check if there are multiple emails in the text
            const allEmails = colText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            if (allEmails && allEmails.length > 1) {
              header.spoc_email = allEmails.join(';');
            } else {
              header.spoc_email = spocEmailMatch[1];
            }
            console.log('✅ Found SPOC Email:', header.spoc_email);
          }
        }
      }
    }

    // Extract delivered to GST from row 7 (search all columns)
    if (i === 7) {
      console.log('🔍 Processing delivered GST from row 7, searching all columns...');

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const deliveredGstText = (row[colIndex] || '').toString();

        // Extract GST number using flexible pattern
        const gstMatch = deliveredGstText.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9])/);
        if (gstMatch) {
          header.delivered_to_gst_no = gstMatch[1];
          console.log('✅ Found Delivered To GST:', header.delivered_to_gst_no);
        }

        // Extract delivered to company
        if (deliveredGstText.includes('HANDS ON TRADES PRIVATE LIMITED')) {
          header.delivered_to_company = 'HANDS ON TRADES PRIVATE LIMITED';
          console.log('✅ Found Delivered To Company:', header.delivered_to_company);
        }
      }
    }

    // Extract delivered to address from row 8 (search all columns)
    if (i === 8) {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const addressText = (row[colIndex] || '').toString();

        if (addressText.includes('Khasra') || addressText.includes('Address')) {
          header.delivered_to_address = addressText.replace(/^To\s*/, '').trim();
          console.log('✅ Found Delivered To Address:', header.delivered_to_address);
        }
      }
    }

    // Add address from row 9 (continuation) - search all columns
    if (i === 9) {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const addressText = (row[colIndex] || '').toString();

        if (addressText.includes('Uttarakhand') || (addressText.length > 10 && header.delivered_to_address)) {
          if (header.delivered_to_address) {
            header.delivered_to_address += ', ' + addressText;
          } else {
            header.delivered_to_address = addressText;
          }
          console.log('✅ Updated Delivered To Address:', header.delivered_to_address);
        }
      }
    }

    // Extract totals information (search all columns)
    if (cellText.includes('Total Quantity:') || cellText.includes('Total Items:')) {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const colText = (row[colIndex] || '').toString();

        const quantityMatch = colText.match(/Total Quantity:\s*(\d+)/);
        if (quantityMatch) header.total_quantity = parseInt(quantityMatch[1]);

        const itemsMatch = colText.match(/Total Items:\s*(\d+)/);
        if (itemsMatch) header.total_items = parseInt(itemsMatch[1]);

        // Extract total amount from any column
        const amountMatch = colText.match(/(\d+\.\d+)/);
        if (amountMatch && colText.includes('amount')) {
          header.total_amount = amountMatch[1];
          header.cart_discount = '0.0';
        }
      }
    }

    // Extract total weight (search all columns)
    if (cellText.includes('Total weight:')) {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const colText = (row[colIndex] || '').toString();

        const weightMatch = colText.match(/Total weight:\s*([0-9.]+\s*tonnes)/);
        if (weightMatch) header.total_weight = weightMatch[1];
      }
    }

    // Extract net amount (flexible search)
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const colText = (row[colIndex] || '').toString();

      if (colText.includes('Net amount') && row[colIndex + 1]) {
        header.net_amount = (row[colIndex + 1] || '').toString();
      }
    }
  }

  // Final comprehensive search for any missing data
  console.log('🔍 Performing final comprehensive search for missing data...');
  for (let i = 0; i < rawData.length && i < 20; i++) { // Search first 20 rows
    const row = rawData[i] as any[];
    if (!row) continue;

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellText = (row[colIndex] || '').toString();
      if (cellText.length < 3) continue;

      // Search for any missing critical data
      if (!header.po_number) {
        const poMatch = cellText.match(/(\d{13})/);
        if (poMatch) {
          header.po_number = poMatch[1];
          console.log('✅ Found PO Number in final search:', header.po_number);
        }
      }

      if (!header.vendor_no) {
        const vendorMatch = cellText.match(/vendor.*?(\d{4})/i);
        if (vendorMatch) {
          header.vendor_no = vendorMatch[1];
          console.log('✅ Found Vendor No in final search:', header.vendor_no);
        }
      }

      if (!header.po_date) {
        const dateMatch = cellText.match(/([A-Z][a-z]{2,8}\.\s*\d{1,2},\s*\d{4})/);
        if (dateMatch) {
          header.po_date = dateMatch[1];
          console.log('✅ Found PO Date in final search:', header.po_date);
        }
      }

      if (!header.payment_terms) {
        const termsMatch = cellText.match(/(\d+\s*[Dd]ays?)/);
        if (termsMatch) {
          header.payment_terms = termsMatch[1];
          console.log('✅ Found Payment Terms in final search:', header.payment_terms);
        }
      }

      if (!header.vendor_gst_no) {
        const gstMatch = cellText.match(/([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9])/);
        if (gstMatch) {
          header.vendor_gst_no = gstMatch[1];
          console.log('✅ Found Vendor GST in final search:', header.vendor_gst_no);
        }
      }
    }
  }

  console.log('✅ Header extraction completed:', {
    po_number: header.po_number,
    buyer_name: header.buyer_name,
    vendor_name: header.vendor_name,
    total_quantity: header.total_quantity,
    total_items: header.total_items
  });

  return header;
}

function extractLineItemsFromBlinkitExcel(rawData: any[]): BlinkitExcelLineItem[] {
  console.log('🔍 Extracting line items...');

  const lineItems: BlinkitExcelLineItem[] = [];

  // Find the header row (contains "Item Code", "HSN Code", etc.)
  let headerRowIndex = -1;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i] as any[];
    if (row && row.length > 1) {
      // Check if this row contains the expected column headers
      if (row.some(cell => cell && cell.toString().includes('Item Code'))) {
        headerRowIndex = i;
        console.log('📍 Found header row at index:', i);
        break;
      }
    }
  }

  if (headerRowIndex === -1) {
    console.warn('⚠️ Could not find header row with Item Code');
    return lineItems;
  }

  // Process data rows after the header
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i] as any[];
    if (!row || row.length < 10) continue;

    // Check if this row has an item number (first column should be a number)
    const itemNumber = row[0];
    if (!itemNumber || isNaN(Number(itemNumber))) continue;

    console.log(`🔍 Processing item row ${i}:`, row.slice(0, 5));

    try {
      // Handle the case where product description might be split across rows
      let description = '';
      let itemCode = '';
      let hsnCode = '';
      let productUpc = '';

      // Extract basic information
      itemCode = cleanCellValue(row[1]);
      hsnCode = cleanCellValue(row[2]);
      productUpc = cleanCellValue(row[3]);

      // Product description might be in row[4] or the next row
      if (row[4] && row[4].toString().trim()) {
        description = row[4].toString().trim();
      }

      // Check if description continues in the next row
      if (i + 1 < rawData.length) {
        const nextRow = rawData[i + 1] as any[];
        if (nextRow && nextRow[4] && nextRow[4].toString().trim() && !nextRow[0]) {
          description += ' ' + nextRow[4].toString().trim();
        }
      }

      const lineItem: BlinkitExcelLineItem = {
        item_code: itemCode,
        hsn_code: hsnCode,
        product_upc: productUpc,
        product_description: description,
        basic_cost_price: parseNumber(row[5]),
        igst_percent: parseNumber(row[6]),
        cess_percent: parseNumber(row[7]),
        addt_cess: parseNumber(row[8]),
        tax_amount: parseNumber(row[9]),
        landing_rate: parseNumber(row[10]),
        quantity: Math.floor(parseNumber(row[12])),
        mrp: parseNumber(row[13]),
        margin_percent: parseNumber(row[14]),
        total_amount: parseNumber(row[15])
      };

      console.log('✅ Extracted line item:', {
        item_code: lineItem.item_code,
        description: lineItem.product_description?.substring(0, 30),
        quantity: lineItem.quantity,
        total_amount: lineItem.total_amount
      });

      lineItems.push(lineItem);

    } catch (error) {
      console.warn(`⚠️ Error processing row ${i}:`, error);
    }
  }

  console.log(`✅ Line items extraction completed. Found ${lineItems.length} items.`);
  return lineItems;
}

function cleanCellValue(cell: any): string {
  if (!cell) return '';
  return cell.toString().replace(/\n/g, '').trim();
}

function parseNumber(cell: any): number {
  if (!cell) return 0;
  const str = cell.toString().replace(/\n/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export { BlinkitExcelData, BlinkitExcelHeader, BlinkitExcelLineItem };