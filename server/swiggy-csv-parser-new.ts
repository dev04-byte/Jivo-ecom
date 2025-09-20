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
  const firstRow = records[0];
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
    const row = records[i];

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

      const line: InsertSwiggyPoLine = {
        line_number: i + 1,
        item_code: row.SkuCode || '',
        item_description: row.SkuDescription || '',
        hsn_code: null, // Not provided in Swiggy CSV format
        quantity: orderedQty,
        received_qty: receivedQty,
        balanced_qty: balancedQty,
        mrp: mrp > 0 ? mrp.toFixed(2) : null,
        unit_base_cost: unitBaseCost > 0 ? unitBaseCost.toFixed(2) : null,
        taxable_value: poLineValueWithoutTax > 0 ? poLineValueWithoutTax.toFixed(2) : null,
        tax_amount: tax > 0 ? tax.toFixed(2) : null,
        total_tax_amount: tax > 0 ? tax.toFixed(2) : null,
        line_total: poLineValueWithTax > 0 ? poLineValueWithTax.toFixed(2) : null,
        category_id: row.CategoryId || null,
        brand_name: row.BrandName || null,
        expected_delivery_date: parseSwiggyDate(row.ExpectedDeliveryDate),
        po_expiry_date: parseSwiggyDate(row.PoExpiryDate),
        otb_reference_number: row.OtbReferenceNumber || null,
        internal_external_po: row.InternalExternalPo || null,
        po_ageing: poAgeing,
        reference_po_number: row.ReferencePoNumber || null,
        cgst_rate: null, // Not provided in Swiggy CSV
        cgst_amount: null,
        sgst_rate: null,
        sgst_amount: null,
        igst_rate: null,
        igst_amount: null,
        cess_rate: null,
        cess_amount: null,
        additional_cess: null
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

  // Create header object with exact data from CSV
  const header: InsertSwiggyPo = {
    po_number: poNumber,
    entity: entity,
    facility_id: facilityId,
    facility_name: facilityName,
    city: city,
    po_date: poCreatedAt,
    po_release_date: poCreatedAt, // Using created date as release date
    po_modified_at: poModifiedAt,
    expected_delivery_date: expectedDeliveryDate,
    po_expiry_date: poExpiryDate,
    status: status,
    supplier_code: supplierCode,
    vendor_name: vendorName,
    payment_terms: null, // Not provided in Swiggy CSV format
    total_items: lines.length,
    total_quantity: totalQuantity,
    total_taxable_value: totalTaxableValue > 0 ? totalTaxableValue.toFixed(2) : null,
    total_tax_amount: totalTaxAmount > 0 ? totalTaxAmount.toFixed(2) : null,
    grand_total: calculatedTotalAmount > 0 ? calculatedTotalAmount.toFixed(2) : poAmount.toFixed(2),
    po_amount: poAmount.toFixed(2),
    unique_hsn_codes: [], // HSN codes not provided in Swiggy CSV
    created_by: uploadedBy
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