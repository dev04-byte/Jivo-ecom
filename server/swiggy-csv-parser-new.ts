import { parse } from 'csv-parse/sync';
import type { InsertSwiggyPo, InsertSwiggyPoLine } from '@shared/schema';

interface ParsedSwiggyPO {
  header: InsertSwiggyPo;
  lines: InsertSwiggyPoLine[];
}

export function parseSwiggyCSVPO(csvContent: string, uploadedBy: string): ParsedSwiggyPO {
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

  // Extract header information from first row (all rows have same header data)
  const firstRow = records[0] as any;
  const poNumber = firstRow.PoNumber || '';
  const entity = firstRow.Entity || '';
  const facilityId = firstRow.FacilityId || '';
  const facilityName = firstRow.FacilityName || '';
  const city = firstRow.City || '';
  const vendorName = firstRow.VendorName || '';
  const supplierCode = firstRow.SupplierCode || '';
  const poAmount = parseFloat(firstRow.PoAmount || '0');
  const status = firstRow.Status || '';

  // Parse dates exactly as they appear in CSV
  const poCreatedAt = parseSwiggyDate(firstRow.PoCreatedAt);
  const poModifiedAt = parseSwiggyDate(firstRow.PoModifiedAt);
  const expectedDeliveryDate = parseSwiggyDate(firstRow.ExpectedDeliveryDate);
  const poExpiryDate = parseSwiggyDate(firstRow.PoExpiryDate);

  console.log(`✅ Found PO Number: ${poNumber}`);
  console.log(`✅ Vendor: ${vendorName}`);
  console.log(`✅ Entity: ${entity}`);
  console.log(`✅ Facility: ${facilityName}`);
  console.log(`✅ Total rows: ${records.length}`);

  // Process line items - map exactly to CSV columns
  const lines: InsertSwiggyPoLine[] = [];
  let totalQuantity = 0;
  let totalTaxableValue = 0;
  let totalTaxAmount = 0;
  let calculatedTotalAmount = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as any;

    try {
      // Parse values exactly as they appear in CSV
      const orderedQty = parseInt(row.OrderedQty || '0');
      const receivedQty = parseInt(row.ReceivedQty || '0');
      const balancedQty = parseInt(row.BalancedQty || '0');
      const mrp = parseFloat(row.Mrp || '0');
      const unitBaseCost = parseFloat(row.UnitBasedCost || '0');
      const tax = parseFloat(row.Tax || '0');
      const poLineValueWithoutTax = parseFloat(row.PoLineValueWithoutTax || '0');
      const poLineValueWithTax = parseFloat(row.PoLineValueWithTax || '0');
      const poAgeing = parseInt(row.PoAgeing || '0');

      // Keep all original CSV columns for preview display
      const line: any = {
        line_number: i + 1,
        // Original CSV columns preserved exactly as they are
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
        CategoryId: row.CategoryId || '',
        OrderedQty: orderedQty,
        ReceivedQty: row.ReceivedQty || '',
        BalancedQty: row.BalancedQty || '',
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

      console.log(`📦 Line ${i + 1}: ${row.SkuCode} - ${row.SkuDescription}`);
      console.log(`   Qty: ${orderedQty}, MRP: ${mrp}, Cost: ${unitBaseCost}, Tax: ${tax}, Total: ${poLineValueWithTax}`);

    } catch (error) {
      console.warn(`⚠️ Error parsing line ${i + 1}:`, error);
      continue;
    }
  }

  console.log(`📊 Totals - Items: ${lines.length}, Qty: ${totalQuantity}, Amount: ${calculatedTotalAmount}`);

  // Create header object with original CSV column names for preview
  const header: any = {
    // Original CSV header fields
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
    PoAmount: poAmount,
    ExpectedDeliveryDate: firstRow.ExpectedDeliveryDate || '',
    PoExpiryDate: firstRow.PoExpiryDate || '',
    // Summary fields for display
    total_items: lines.length,
    total_quantity: totalQuantity,
    total_amount: calculatedTotalAmount > 0 ? calculatedTotalAmount.toFixed(2) : poAmount.toFixed(2)
  };

  console.log(`✅ Successfully parsed Swiggy CSV PO: ${poNumber} with ${lines.length} line items`);

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