import xlsx from 'xlsx';

interface ZomatoPoHeader {
  po_number: string;
  po_date?: Date | null;
  expected_delivery_date?: Date | null;
  account_number?: string;
  vendor_id?: string;
  bill_from_name?: string;
  bill_from_address?: string;
  bill_from_gstin?: string;
  bill_from_phone?: string;
  bill_to_name?: string;
  bill_to_address?: string;
  bill_to_gstin?: string;
  ship_from_name?: string;
  ship_from_address?: string;
  ship_from_gstin?: string;
  ship_to_name?: string;
  ship_to_address?: string;
  ship_to_gstin?: string;
  total_items?: number;
  total_quantity?: string;
  grand_total?: string;
  total_tax_amount?: string;
  uploaded_by?: string;
}

interface ZomatoPoItem {
  line_number: number;
  product_number?: string;
  product_name?: string;
  hsn_code?: string;
  quantity_ordered?: string;
  price_per_unit?: string;
  uom?: string;
  gst_rate?: string;
  total_tax_amount?: string;
  line_total?: string;
}

export async function parseZomatoPO(buffer: Buffer, uploadedBy: string) {
  try {
    console.log("🔄 Processing Zomato Excel file...");
    console.log("📊 Buffer size:", buffer.length);
    
    const workbook = xlsx.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    console.log(`Zomato Excel has ${jsonData.length} rows`);

    // Parse header information from structured rows
    let header: ZomatoPoHeader = {
      po_number: '',
      uploaded_by: uploadedBy
    };

    // Extract PO information from row 4 (index 3)
    const poInfoRow = jsonData[3] as any[];
    if (poInfoRow && poInfoRow.length > 0) {
      // Extract PO Number (first cell contains "Purchase Order Number\nZHPGJ26-PO-2009516")
      const poNumberCell = poInfoRow[0];
      if (poNumberCell && typeof poNumberCell === 'string') {
        const poMatch = poNumberCell.match(/Purchase Order Number\s*\n?(.+)/i);
        if (poMatch) {
          header.po_number = poMatch[1].trim();
        }
      }

      // Extract PO Date (4th cell contains "Purchase Order Date\n24-Sep-2025")
      const poDateCell = poInfoRow[3];
      if (poDateCell && typeof poDateCell === 'string') {
        const dateMatch = poDateCell.match(/Purchase Order Date\s*\n?(.+)/i);
        if (dateMatch) {
          header.po_date = parseDate(dateMatch[1].trim());
        }
      }

      // Extract Expected Delivery Date (8th cell)
      const deliveryDateCell = poInfoRow[7];
      if (deliveryDateCell && typeof deliveryDateCell === 'string') {
        const deliveryMatch = deliveryDateCell.match(/Expected Delivery Date\s*\n?(.+)/i);
        if (deliveryMatch) {
          header.expected_delivery_date = parseDate(deliveryMatch[1].trim());
        }
      }

      // Extract Account Number (14th cell)
      const accountCell = poInfoRow[13];
      if (accountCell && typeof accountCell === 'string') {
        const accountMatch = accountCell.match(/Account Number\s*\n?(.+)/i);
        if (accountMatch) {
          header.account_number = accountMatch[1].trim();
        }
      }

      // Extract Vendor ID (18th cell)
      const vendorCell = poInfoRow[17];
      if (vendorCell && typeof vendorCell === 'string') {
        const vendorMatch = vendorCell.match(/Vendor Id\s*\n?(.+)/i);
        if (vendorMatch) {
          header.vendor_id = vendorMatch[1].trim();
        }
      }
    }

    // Extract billing/shipping info from rows 2-3 (indices 1-2)
    const billFromRow = jsonData[1] as any[];
    const billToRow = jsonData[2] as any[];

    if (billFromRow && billFromRow[0]) {
      const billFromText = billFromRow[0];
      if (typeof billFromText === 'string') {
        const lines = billFromText.split('\n');
        header.bill_from_name = lines[1]?.trim() || '';
        header.bill_from_address = lines[2]?.trim() || '';
        const gstinMatch = billFromText.match(/GSTIN\s*:\s*([^\s]+)/);
        if (gstinMatch) header.bill_from_gstin = gstinMatch[1];
        const phoneMatch = billFromText.match(/Phone\s*:\s*([^\s]+)/);
        if (phoneMatch) header.bill_from_phone = phoneMatch[1];
      }

      // Extract shipping from info from 8th column (index 7)
      const shipFromText = billFromRow[7];
      if (typeof shipFromText === 'string') {
        const lines = shipFromText.split('\n');
        header.ship_from_name = lines[1]?.trim() || '';
        header.ship_from_address = lines[2]?.trim() || '';
        const gstinMatch = shipFromText.match(/GSTIN\s*:\s*([^\s]+)/);
        if (gstinMatch) header.ship_from_gstin = gstinMatch[1];
      }
    }

    if (billToRow && billToRow[0]) {
      const billToText = billToRow[0];
      if (typeof billToText === 'string') {
        const lines = billToText.split('\n');
        header.bill_to_name = lines[1]?.trim() || '';
        header.bill_to_address = lines[2]?.trim() || '';
        const gstinMatch = billToText.match(/GSTIN\s*:\s*([^\s]+)/);
        if (gstinMatch) header.bill_to_gstin = gstinMatch[1];
      }

      // Extract shipping to info from 11th column (index 10)
      const shipToText = billToRow[10];
      if (typeof shipToText === 'string') {
        const lines = shipToText.split('\n');
        header.ship_to_name = lines[1]?.trim() || '';
        header.ship_to_address = lines[2]?.trim() || '';
        const gstinMatch = shipToText.match(/GSTIN\s*:\s*([^\s]+)/);
        if (gstinMatch) header.ship_to_gstin = gstinMatch[1];
      }
    }

    // Parse line items starting from row 5 (index 4)
    const lines: ZomatoPoItem[] = [];
    let totalQuantity = 0;
    let totalValue = 0;
    let totalTax = 0;

    // Row 5 (index 4) contains headers, data starts from row 6 (index 5)
    for (let i = 5; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length < 15) {
        continue;
      }

      // Actual column mapping based on Excel structure with merged cells:
      // 0: Product Number
      // 1: Product Name
      // 2-4: Empty (merged cells)
      // 5: HSN
      // 6-7: Empty (merged cells)
      // 8: Qty. Ord.
      // 9-10: Empty (merged cells)
      // 11: Price Per Unit
      // 12: Empty
      // 13: UoM
      // 14: Empty
      // 15: GST Rate
      // 16: Empty
      // 17: Total Tax Amount
      // 18: Total

      const productNumber = row[0];
      const productName = row[1];
      const hsnCode = row[5];
      const quantity = row[8];
      const pricePerUnit = row[11];
      const uom = row[13];
      const gstRate = row[15];
      const taxAmount = row[17];
      const totalAmount = row[18];

      if (!productNumber || !quantity) {
        continue;
      }

      // Skip non-product rows (like "Total", "Delivery Charge", etc.)
      if (typeof productNumber === 'string' && (
        productNumber.toLowerCase().includes('total') ||
        productNumber.toLowerCase().includes('delivery') ||
        productNumber.toLowerCase().includes('hsn')
      )) {
        continue;
      }

      const line: ZomatoPoItem = {
        line_number: i - 4, // Adjust for header rows (data starts at index 5, so subtract 4)
        product_number: String(productNumber),
        product_name: String(productName || ''),
        hsn_code: String(hsnCode || ''),
        quantity_ordered: String(parseFloat(String(quantity || '0')).toFixed(2)),
        price_per_unit: String(parseFloat(String(pricePerUnit || '0')).toFixed(2)),
        uom: String(uom || ''),
        gst_rate: String(parseFloat(String(gstRate || '0')).toFixed(4)),
        total_tax_amount: String(parseFloat(String(taxAmount || '0')).toFixed(2)),
        line_total: String(parseLineTotal(totalAmount))
      };

      lines.push(line);

      // Calculate totals
      totalQuantity += parseFloat(line.quantity_ordered || '0');
      totalValue += parseFloat(line.line_total || '0');
      totalTax += parseFloat(line.total_tax_amount || '0');

      console.log(`Parsed Zomato line item ${line.line_number}:`, {
        product_number: line.product_number,
        product_name: line.product_name?.substring(0, 50) + '...',
        quantity: line.quantity_ordered,
        price: line.price_per_unit,
        gst_rate: line.gst_rate,
        tax: line.total_tax_amount,
        line_total: line.line_total
      });
    }

    // Update header totals
    header.total_items = lines.length;
    header.total_quantity = totalQuantity.toFixed(2);
    header.grand_total = totalValue.toFixed(2);
    header.total_tax_amount = totalTax.toFixed(2);

    // Only keep fields that exist in the database schema
    // Removed: vendor_name, buyer_name, vendor_gstin, buyer_gstin, vendor_address, buyer_address, po_expiry_date, total_amount
    // These fields don't exist in the zomato_po_header schema and cause database insertion errors

    // Ensure dates are proper Date objects or null
    const validateAndFixDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;

      if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
      }

      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }

      return null;
    };

    header.po_date = validateAndFixDate(header.po_date);
    header.expected_delivery_date = validateAndFixDate(header.expected_delivery_date);

    console.log("✅ Zomato PO parsed successfully:", {
      po_number: header.po_number,
      total_items: header.total_items,
      total_quantity: header.total_quantity,
      grand_total: header.grand_total,
      bill_from_name: header.bill_from_name,
      ship_to_name: header.ship_to_name
    });

    const response = {
      success: true,
      data: {
        po_header: header,
        po_lines: lines,
        source: 'excel_real_data_extracted'
      },
      message: `Successfully extracted Zomato PO ${header.po_number} with ${lines.length} line items`,
      // Legacy format for backward compatibility
      header,
      lines,
      totalItems: lines.length,
      totalQuantity,
      totalAmount: totalValue.toFixed(2),
      detectedVendor: 'zomato'
    };

    console.log("📤 Returning response structure:", {
      success: response.success,
      hasData: !!response.data,
      hasPoHeader: !!response.data.po_header,
      hasPoLines: !!response.data.po_lines,
      poNumber: response.data.po_header.po_number,
      linesCount: response.data.po_lines.length
    });

    return response;

  } catch (error) {
    console.error("Error parsing Zomato PO:", error);
    throw new Error(`Failed to parse Zomato file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Handle DD-MMM-YYYY format (e.g., "06-Aug-2025")
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const month = monthMap[monthStr];
      if (month !== undefined) {
        return new Date(year, month, day);
      }
    }
    
    // Fallback to Date.parse
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? null : new Date(parsed);
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}

function parseLineTotal(total: any): string {
  if (!total) return '0.00';
  
  // Convert to string and remove commas
  let totalStr = String(total).replace(/,/g, '');
  
  // Parse as float
  const parsed = parseFloat(totalStr);
  return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
}