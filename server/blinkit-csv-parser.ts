import { parse } from 'csv-parse/sync';
import type { InsertBlinkitPoHeader, InsertBlinkitPoLines } from '@shared/schema';

// Safe number parsing function to prevent NaN values
function safeParseFloat(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point and negative sign
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function safeParseInt(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.floor(value);
  }
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[^\d-]/g, '');
    const parsed = parseInt(cleanValue, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

interface ParsedBlinkitPO {
  header: InsertBlinkitPoHeader;
  lines: InsertBlinkitPoLines[];
}

export function parseBlinkitCSVPO(csvContent: string, uploadedBy: string): any {
  console.log('📄 Starting Blinkit CSV PO parsing...');

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    quote: '"',
    escape: '"',
    relax_column_count: true
  });

  console.log(`📊 Parsed ${records.length} rows from CSV file`);

  if (records.length === 0) {
    throw new Error('No data rows found in CSV file');
  }

  // Check first record to understand structure
  const firstRecord = records[0] as any;
  console.log('🔍 First record columns:', Object.keys(firstRecord));
  console.log('🔍 First record sample:', {
    po_number: firstRecord.po_number,
    facility_name: firstRecord.facility_name,
    vendor_name: firstRecord.vendor_name,
    name: firstRecord.name
  });

  // Group records by PO Number to handle multiple POs
  const poGroups: { [key: string]: any[] } = {};

  for (const record of records) {
    const poNumber = (record as any).po_number || '';
    if (!poGroups[poNumber]) {
      poGroups[poNumber] = [];
    }
    poGroups[poNumber].push(record);
  }

  const uniquePoNumbers = Object.keys(poGroups);
  console.log(`📋 Found ${uniquePoNumbers.length} unique PO numbers:`, uniquePoNumbers);

  // If single PO, return in {header, lines} format
  if (uniquePoNumbers.length === 1) {
    const poNumber = uniquePoNumbers[0];
    const poRecords = poGroups[poNumber];
    const parsedSinglePO = parseSingleBlinkitPO(poRecords, uploadedBy);

    console.log(`✅ Single PO parsed: ${poNumber} with ${parsedSinglePO.lines.length} line items`);
    return parsedSinglePO;
  }

  // If multiple POs, return in {poList} format like Swiggy
  const poList: any[] = [];
  let totalPOs = 0;
  let totalItems = 0;
  let totalAmount = 0;

  for (const poNumber of uniquePoNumbers) {
    const poRecords = poGroups[poNumber];
    const parsedPO = parseSingleBlinkitPO(poRecords, uploadedBy);

    // Calculate total amount from lines
    const linesAmount = parsedPO.lines.reduce((sum: number, line: any) => {
      return sum + safeParseFloat(line.total_amount || 0);
    }, 0);

    poList.push({
      header: parsedPO.header,
      lines: parsedPO.lines,
      totalItems: parsedPO.lines.length,
      totalQuantity: parsedPO.lines.reduce((sum: number, line: any) => sum + (parseInt(line.quantity) || 0), 0),
      totalAmount: linesAmount
    });

    totalPOs++;
    totalItems += parsedPO.lines.length;
    totalAmount += linesAmount;

    console.log(`✅ Parsed PO: ${poNumber} with ${parsedPO.lines.length} line items`);
  }

  console.log(`✅ Successfully parsed ${totalPOs} Blinkit POs with ${totalItems} total line items, Total Amount: ${totalAmount}`);

  const safeTotalAmount = isNaN(totalAmount) ? 0 : totalAmount;

  return {
    poList,
    totalPOs,
    totalItems,
    totalAmount: safeTotalAmount.toFixed(2),
    source: 'blinkit_multiple_pos'
  };
}

function parseSingleBlinkitPO(records: any[], uploadedBy: string): ParsedBlinkitPO {
  const firstRow = records[0] as any;
  const poNumber = firstRow.po_number || '';
  const facilityName = firstRow.facility_name || '';
  const manufacturerName = firstRow.manufacturer_name || '';
  const entityVendorLegalName = firstRow.entity_vendor_legal_name || '';
  const vendorName = firstRow.vendor_name || '';
  const poState = firstRow.po_state || 'active';

  // Parse dates exactly as they appear in CSV
  const orderDate = parseBlinkitDate(firstRow.order_date);
  const appointmentDate = parseBlinkitDate(firstRow.appointment_date);
  const expiryDate = parseBlinkitDate(firstRow.expiry_date);

  // Process line items - map exactly to CSV columns
  const lines: InsertBlinkitPoLines[] = [];
  let totalQuantity = 0;
  let totalTaxableValue = 0;
  let totalTaxAmount = 0;
  let calculatedTotalAmount = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as any;

    try {
      // Parse values exactly as they appear in CSV using safe parsing
      const unitsOrdered = safeParseInt(row.units_ordered);
      const remainingQuantity = safeParseInt(row.remaining_quantity);
      const landingRate = safeParseFloat(row.landing_rate);
      const costPrice = safeParseFloat(row.cost_price);
      const marginPercentage = safeParseFloat(row.margin_percentage);
      const cessValue = safeParseFloat(row.cess_value);
      const sgstValue = safeParseFloat(row.sgst_value);
      const igstValue = safeParseFloat(row.igst_value);
      const cgstValue = safeParseFloat(row.cgst_value);
      const taxValue = safeParseFloat(row.tax_value);
      const totalAmount = safeParseFloat(row.total_amount);
      const mrp = safeParseFloat(row.mrp);

      // Map CSV fields to database schema fields
      const line: InsertBlinkitPoLines = {
        item_code: row.item_id || '',
        hsn_code: '', // Not provided in CSV, using empty string
        product_upc: row.upc || '',
        product_description: row.name || '',
        basic_cost_price: costPrice.toString(),
        igst_percent: igstValue > 0 ? ((igstValue / costPrice) * 100).toFixed(2) : '0',
        cess_percent: cessValue > 0 ? ((cessValue / costPrice) * 100).toFixed(2) : '0',
        addt_cess: '0', // Not provided in CSV
        tax_amount: taxValue.toString(),
        landing_rate: landingRate.toString(),
        quantity: unitsOrdered,
        mrp: mrp.toString(),
        margin_percent: marginPercentage.toString(),
        total_amount: totalAmount.toString()
      };

      lines.push(line);

      // Update totals
      totalQuantity += unitsOrdered;
      totalTaxableValue += costPrice * unitsOrdered;
      totalTaxAmount += taxValue;
      calculatedTotalAmount += totalAmount;

    } catch (error) {
      console.warn(`⚠️ Error parsing line ${i + 1}:`, error);
      continue;
    }
  }

  // Create header object with proper mapping to database schema
  const header: InsertBlinkitPoHeader = {
    // Database schema fields
    po_number: poNumber,
    po_date: orderDate,
    po_type: 'PO',
    currency: 'INR',
    buyer_name: entityVendorLegalName || 'HANDS ON TRADES PRIVATE LIMITED',
    buyer_pan: null,
    buyer_cin: null,
    buyer_unit: facilityName,
    buyer_contact_name: null,
    buyer_contact_phone: null,
    vendor_no: null,
    vendor_name: vendorName || manufacturerName,
    vendor_pan: null,
    vendor_gst_no: null,
    vendor_registered_address: null,
    vendor_contact_name: null,
    vendor_contact_phone: null,
    vendor_contact_email: null,
    delivered_by: vendorName,
    delivered_to_company: entityVendorLegalName,
    delivered_to_address: facilityName,
    delivered_to_gst_no: null,
    spoc_name: null,
    spoc_phone: null,
    spoc_email: null,
    payment_terms: null,
    po_expiry_date: expiryDate,
    po_delivery_date: appointmentDate,
    total_quantity: totalQuantity,
    total_items: lines.length,
    total_weight: null,
    total_amount: calculatedTotalAmount.toFixed(2),
    cart_discount: '0',
    net_amount: calculatedTotalAmount.toFixed(2),
    uploaded_by: uploadedBy,
    status: poState === 'Expired' ? 'expired' : 'active'
  };

  return { header, lines };
}

function parseBlinkitDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  try {
    const cleanDateStr = dateStr.toString().trim();

    // Handle Blinkit date formats: "2025-09-08 06:23:15+00:00" or "2025-09-17T18:29:59Z"
    if (cleanDateStr.includes('T') && cleanDateStr.includes('Z')) {
      // ISO 8601 format: "2025-09-17T18:29:59Z"
      const result = new Date(cleanDateStr);
      if (!isNaN(result.getTime())) {
        console.log(`📅 Parsed Blinkit ISO date "${cleanDateStr}" as:`, result.toISOString().split('T')[0]);
        return result;
      }
    } else if (cleanDateStr.includes('+')) {
      // Format with timezone: "2025-09-08 06:23:15+00:00"
      const result = new Date(cleanDateStr);
      if (!isNaN(result.getTime())) {
        console.log(`📅 Parsed Blinkit timezone date "${cleanDateStr}" as:`, result.toISOString().split('T')[0]);
        return result;
      }
    } else if (cleanDateStr.includes('-') && cleanDateStr.includes(' ')) {
      // Format: "2025-09-08 06:23:15"
      const result = new Date(cleanDateStr);
      if (!isNaN(result.getTime())) {
        console.log(`📅 Parsed Blinkit datetime "${cleanDateStr}" as:`, result.toISOString().split('T')[0]);
        return result;
      }
    }

    // Try standard JavaScript Date parsing as fallback
    const result = new Date(cleanDateStr);
    if (!isNaN(result.getTime())) {
      console.log(`📅 Parsed date "${cleanDateStr}" as:`, result.toISOString().split('T')[0]);
      return result;
    }

    console.warn('⚠️ Unable to parse Blinkit date:', cleanDateStr);
    return null;
  } catch (error) {
    console.warn('❌ Error parsing Blinkit date:', dateStr, error);
    return null;
  }
}