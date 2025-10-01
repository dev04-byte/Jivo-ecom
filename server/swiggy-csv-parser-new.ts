import { parse } from 'csv-parse/sync';
import type { InsertSwiggyPo, InsertSwiggyPoLine } from '@shared/schema';

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

interface ParsedSwiggyPO {
  header: InsertSwiggyPo;
  lines: InsertSwiggyPoLine[];
}

export function parseSwiggyCSVPO(csvContent: string, uploadedBy: string): any {
  console.log('📄 Starting Swiggy CSV PO parsing...');

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

  // Group records by PO Number to handle multiple POs
  const poGroups: { [key: string]: any[] } = {};

  for (const record of records) {
    const poNumber = (record as any).PoNumber || '';
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
    const parsedSinglePO = parseSingleSwiggyPO(poRecords, uploadedBy);

    console.log(`✅ Single PO parsed: ${poNumber} with ${parsedSinglePO.lines.length} line items`);
    return parsedSinglePO;
  }

  // If multiple POs, return in {poList} format like Blinkit
  const poList: any[] = [];
  let totalPOs = 0;
  let totalItems = 0;
  let totalAmount = 0;

  for (const poNumber of uniquePoNumbers) {
    const poRecords = poGroups[poNumber];
    const parsedPO = parseSingleSwiggyPO(poRecords, uploadedBy);

    // Calculate total amount from lines if header amount is not available
    const headerAmount = safeParseFloat((parsedPO.header as any).PoAmount || parsedPO.header.grand_total || 0);
    const linesAmount = parsedPO.lines.reduce((sum: number, line: any) => {
      return sum + safeParseFloat(line.line_total || line.total_value || line.PoLineValueWithTax || 0);
    }, 0);
    const finalAmount = headerAmount > 0 ? headerAmount : linesAmount;

    poList.push({
      header: parsedPO.header,
      lines: parsedPO.lines,
      totalItems: parsedPO.lines.length,
      totalQuantity: parsedPO.lines.reduce((sum: number, line: any) => sum + (line.quantity || parseInt(line.OrderedQty) || 0), 0),
      totalAmount: finalAmount
    });

    totalPOs++;
    totalItems += parsedPO.lines.length;
    totalAmount += finalAmount;

    console.log(`✅ Parsed PO: ${poNumber} with ${parsedPO.lines.length} line items`);
  }

  console.log(`✅ Successfully parsed ${totalPOs} Swiggy POs with ${totalItems} total line items, Total Amount: ${totalAmount}`);

  const safeTotalAmount = isNaN(totalAmount) ? 0 : totalAmount;

  return {
    poList,
    totalPOs,
    totalItems,
    totalAmount: safeTotalAmount.toFixed(2),
    source: 'swiggy_multiple_pos'
  };
}

function parseSingleSwiggyPO(records: any[], uploadedBy: string): ParsedSwiggyPO {
  const firstRow = records[0] as any;
  const poNumber = firstRow.PoNumber || '';
  const entity = firstRow.Entity || '';
  const facilityId = firstRow.FacilityId || '';
  const facilityName = firstRow.FacilityName || '';
  const city = firstRow.City || '';
  const vendorName = firstRow.VendorName || '';
  const supplierCode = firstRow.SupplierCode || '';
  const poAmount = safeParseFloat(firstRow.PoAmount);
  const status = firstRow.Status || '';

  // Parse dates exactly as they appear in CSV
  const poCreatedAt = parseSwiggyDate(firstRow.PoCreatedAt);
  const poModifiedAt = parseSwiggyDate(firstRow.PoModifiedAt);
  const expectedDeliveryDate = parseSwiggyDate(firstRow.ExpectedDeliveryDate);
  const poExpiryDate = parseSwiggyDate(firstRow.PoExpiryDate);

  // Process line items - map exactly to CSV columns
  const lines: InsertSwiggyPoLine[] = [];
  let totalQuantity = 0;
  let totalTaxableValue = 0;
  let totalTaxAmount = 0;
  let calculatedTotalAmount = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as any;

    try {
      // Parse values exactly as they appear in CSV using safe parsing
      const orderedQty = safeParseInt(row.OrderedQty);
      const receivedQty = safeParseInt(row.ReceivedQty);
      const balancedQty = safeParseInt(row.BalancedQty);
      const mrp = safeParseFloat(row.Mrp);
      const unitBaseCost = safeParseFloat(row.UnitBasedCost);
      const tax = safeParseFloat(row.Tax);
      const poLineValueWithoutTax = safeParseFloat(row.PoLineValueWithoutTax);
      const poLineValueWithTax = safeParseFloat(row.PoLineValueWithTax);
      const poAgeing = safeParseInt(row.PoAgeing);

      // Map CSV fields to database schema fields
      const line: any = {
        line_number: i + 1,
        item_code: row.SkuCode || '',
        item_description: row.SkuDescription || '',
        quantity: orderedQty,
        mrp: mrp,
        unit_base_cost: unitBaseCost,
        taxable_value: poLineValueWithoutTax,
        cgst_rate: tax / 2,
        cgst_amount: (poLineValueWithoutTax * (tax / 2)) / 100,
        sgst_rate: tax / 2,
        sgst_amount: (poLineValueWithoutTax * (tax / 2)) / 100,
        igst_rate: 0,
        igst_amount: 0,
        cess_rate: 0,
        cess_amount: 0,
        additional_cess: 0,
        total_tax_amount: tax,
        line_total: poLineValueWithTax,
        // Keep original CSV columns for reference
        PoNumber: row.PoNumber || '',
        Entity: row.Entity || '',
        FacilityId: row.FacilityId || '',
        FacilityName: row.FacilityName || '',
        City: row.City || '',
        PoCreatedAt: row.PoCreatedAt || '',
        PoModifiedAt: row.PoModifiedAt || '',
        Status: row.Status || '',
        SupplierCode: row.SupplierCode || '',
        VendorName: row.VendorName || '',
        PoAmount: row.PoAmount || '',
        SkuCode: row.SkuCode || '',
        SkuDescription: row.SkuDescription || '',
        CategoryId: row.CategoryId || '', // Store original value for reference
        OrderedQty: orderedQty,
        ReceivedQty: receivedQty,
        BalancedQty: balancedQty,
        Tax: tax,
        PoLineValueWithoutTax: poLineValueWithoutTax,
        PoLineValueWithTax: poLineValueWithTax,
        Mrp: mrp,
        UnitBasedCost: unitBaseCost,
        ExpectedDeliveryDate: row.ExpectedDeliveryDate || '',
        PoExpiryDate: row.PoExpiryDate || '',
        OtbReferenceNumber: row.OtbReferenceNumber || '',
        InternalExternalPo: row.InternalExternalPo || '',
        PoAgeing: poAgeing,
        BrandName: row.BrandName || '',
        ReferencePoNumber: row.ReferencePoNumber || ''
      };

      lines.push(line);

      // Update totals
      totalQuantity += orderedQty;
      totalTaxableValue += poLineValueWithoutTax;
      totalTaxAmount += tax;
      calculatedTotalAmount += poLineValueWithTax;

    } catch (error) {
      console.warn(`⚠️ Error parsing line ${i + 1}:`, error);
      continue;
    }
  }

  // Create header object with proper mapping to database schema
  const header: any = {
    // Database schema fields
    po_number: poNumber,
    po_date: poCreatedAt,
    po_release_date: poModifiedAt,
    expected_delivery_date: expectedDeliveryDate,
    po_expiry_date: poExpiryDate,
    vendor_name: vendorName,
    payment_terms: null,
    total_items: lines.length,
    total_quantity: totalQuantity,
    total_taxable_value: totalTaxableValue,
    total_tax_amount: totalTaxAmount,
    grand_total: (() => {
      const finalTotal = calculatedTotalAmount > 0 ? calculatedTotalAmount : poAmount;
      const safeFinalTotal = isNaN(finalTotal) ? 0 : finalTotal;
      return safeFinalTotal;
    })(),
    status: status || 'pending',
    created_by: uploadedBy,
    // Keep original CSV fields for preview display
    PoNumber: poNumber,
    Entity: entity,
    FacilityId: facilityId,
    FacilityName: facilityName,
    City: city,
    PoCreatedAt: firstRow.PoCreatedAt || '',
    PoModifiedAt: firstRow.PoModifiedAt || '',
    Status: status,
    SupplierCode: supplierCode,
    VendorName: vendorName,
    PoAmount: isNaN(poAmount) ? 0 : poAmount,
    ExpectedDeliveryDate: firstRow.ExpectedDeliveryDate || '',
    PoExpiryDate: firstRow.PoExpiryDate || '',
    // Summary fields for display - use safe calculation to prevent NaN
    total_amount: (() => {
      const finalTotal = calculatedTotalAmount > 0 ? calculatedTotalAmount : poAmount;
      const safeFinalTotal = isNaN(finalTotal) || finalTotal === null || finalTotal === undefined ? 0 : finalTotal;
      return Number(safeFinalTotal).toFixed(2);
    })()
  };

  return { header, lines };
}

function parseSwiggyDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  try {
    const cleanDateStr = dateStr.toString().trim();

    // Handle Swiggy date formats: "2025-09-18 20:09:28" and "2025-09-29"
    if (cleanDateStr.includes('-')) {
      // Check if it's YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format
      const parts = cleanDateStr.split(' ');
      const datePart = parts[0];
      const timePart = parts[1];

      const [year, month, day] = datePart.split('-');

      if (year && month && day) {
        let date;

        if (timePart) {
          // YYYY-MM-DD HH:MM:SS format
          const [hours, minutes, seconds] = timePart.split(':');
          date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours || '0'),
            parseInt(minutes || '0'),
            parseInt(seconds || '0')
          );
        } else {
          // YYYY-MM-DD format
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        if (!isNaN(date.getTime())) {
          console.log(`📅 Parsed Swiggy date "${cleanDateStr}" as:`, date.toISOString().split('T')[0]);
          return date;
        }
      }
    }

    // Try standard JavaScript Date parsing as fallback
    const result = new Date(cleanDateStr);
    if (!isNaN(result.getTime())) {
      console.log(`📅 Parsed date "${cleanDateStr}" as:`, result.toISOString().split('T')[0]);
      return result;
    }

    console.warn('⚠️ Unable to parse Swiggy date:', cleanDateStr);
    return null;
  } catch (error) {
    console.warn('❌ Error parsing Swiggy date:', dateStr, error);
    return null;
  }
}