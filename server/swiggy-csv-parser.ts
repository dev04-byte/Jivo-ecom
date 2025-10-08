import Papa from 'papaparse';
import type { InsertSwiggyPo, InsertSwiggyPoLine } from '@shared/schema';
import { extractHsnCode } from './hsn-mapper';

interface SwiggyCSVRow {
  PoNumber: string;
  Entity: string;
  FacilityId: string;
  FacilityName: string;
  City: string;
  PoCreatedAt: string;
  PoModifiedAt: string;
  Status: string;
  SupplierCode: string;
  VendorName: string;
  PoAmount: string;
  SkuCode: string;
  SkuDescription: string;
  CategoryId: string;
  OrderedQty: string;
  ReceivedQty: string;
  BalancedQty: string;
  Tax: string;
  PoLineValueWithoutTax: string;
  PoLineValueWithTax: string;
  Mrp: string;
  UnitBasedCost: string;
  ExpectedDeliveryDate: string;
  PoExpiryDate: string;
  OtbReferenceNumber: string;
  InternalExternalPo: string;
  PoAgeing: string;
  BrandName: string;
  ReferencePoNumber: string;
  HsnCode?: string; // Optional HSN code field
}

interface SwiggyParsedPO {
  header: InsertSwiggyPo;
  lines: InsertSwiggyPoLine[];
}

interface MultipleSwiggyPOs {
  poList: SwiggyParsedPO[];
  totalPOs: number;
}

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const parseNumber = (numStr: string): number | null => {
  if (!numStr || numStr.trim() === '') return null;
  const parsed = parseFloat(numStr.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? null : parsed;
};

const parseNumberOrZero = (numStr: string): number => {
  if (!numStr || numStr.trim() === '') return 0;
  const parsed = parseFloat(numStr.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

export function parseSwiggyCSV(csvContent: string, uploadedBy: string): MultipleSwiggyPOs {
  try {
    console.log('🔄 Starting Swiggy CSV parsing...');

    // Parse CSV using Papa Parse
    const parseResult = Papa.parse<SwiggyCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      throw new Error(`CSV parsing failed: ${parseResult.errors[0].message}`);
    }

    const rows = parseResult.data;
    console.log(`📊 Parsed ${rows.length} CSV rows`);

    if (rows.length === 0) {
      throw new Error('No data found in CSV file');
    }

    // Group rows by PO Number
    const poGroups = new Map<string, SwiggyCSVRow[]>();

    for (const row of rows) {
      if (!row.PoNumber || row.PoNumber.trim() === '') {
        console.warn('Skipping row with empty PO number:', row);
        continue;
      }

      const poNumber = row.PoNumber.trim();
      if (!poGroups.has(poNumber)) {
        poGroups.set(poNumber, []);
      }
      poGroups.get(poNumber)!.push(row);
    }

    console.log(`📋 Found ${poGroups.size} distinct PO numbers: ${Array.from(poGroups.keys()).join(', ')}`);

    // Process each PO group
    const parsedPOs: SwiggyParsedPO[] = [];

    for (const [poNumber, poRows] of Array.from(poGroups)) {
      console.log(`🔄 Processing PO ${poNumber} with ${poRows.length} line items`);

      // Use first row for header information (assuming all rows in a PO group have same header data)
      const firstRow = poRows[0];

      // Use PoAmount from first row as it contains the correct total (all rows in same PO have same PoAmount)
      const poAmount = parseNumberOrZero(firstRow.PoAmount);

      // Calculate totals from line items using MRP × Quantity logic
      const totalQuantity = poRows.reduce((sum: number, row: SwiggyCSVRow) => sum + parseNumberOrZero(row.OrderedQty), 0);
      const totalTaxableValue = poRows.reduce((sum: number, row: SwiggyCSVRow) => sum + parseNumberOrZero(row.PoLineValueWithoutTax), 0);
      const totalTaxAmount = poRows.reduce((sum: number, row: SwiggyCSVRow) => sum + parseNumberOrZero(row.Tax), 0);

      // Calculate grand total using MRP × Quantity for each line
      const mrpBasedTotal = poRows.reduce((sum: number, row: SwiggyCSVRow) => {
        const mrp = parseNumberOrZero(row.Mrp);
        const quantity = parseNumberOrZero(row.OrderedQty);
        return sum + (mrp * quantity);
      }, 0);

      const calculatedGrandTotal = poRows.reduce((sum: number, row: SwiggyCSVRow) => sum + parseNumberOrZero(row.PoLineValueWithTax), 0);

      // Priority order for grand_total calculation:
      // 1. Use PoAmount from CSV (most reliable source for total)
      // 2. Calculate from PoLineValueWithTax sum
      // 3. Calculate from MRP × Quantity (fallback)
      const grandTotal = poAmount > 0 ? poAmount : (calculatedGrandTotal > 0 ? calculatedGrandTotal : mrpBasedTotal);

      console.log(`💰 PO ${poNumber} totals:`, {
        poAmount,
        calculatedGrandTotal,
        mrpBasedTotal,
        selectedGrandTotal: grandTotal,
        totalTaxableValue,
        totalTaxAmount
      });

      // Get unique categories (HSN codes not available in CSV format)
      const uniqueHsnCodes: string[] = [];

      // Create header matching InsertSwiggyPo schema
      const header = {
        po_number: poNumber,
        entity: firstRow.Entity || null,
        facility_id: firstRow.FacilityId || null,
        facility_name: firstRow.FacilityName || null,
        city: firstRow.City || null,
        po_date: parseDate(firstRow.PoCreatedAt),
        po_modified_at: parseDate(firstRow.PoModifiedAt),
        po_release_date: parseDate(firstRow.PoModifiedAt),
        expected_delivery_date: parseDate(firstRow.ExpectedDeliveryDate),
        po_expiry_date: parseDate(firstRow.PoExpiryDate),
        supplier_code: firstRow.SupplierCode || null,
        vendor_name: firstRow.VendorName || null,
        po_amount: poAmount > 0 ? poAmount.toString() : (grandTotal > 0 ? grandTotal.toString() : null),
        payment_terms: `${firstRow.InternalExternalPo || 'External'} PO`,
        otb_reference_number: firstRow.OtbReferenceNumber || null,
        internal_external_po: firstRow.InternalExternalPo || null,
        total_items: poRows.length,
        total_quantity: totalQuantity,
        total_taxable_value: totalTaxableValue > 0 ? totalTaxableValue.toString() : null,
        total_tax_amount: totalTaxAmount > 0 ? totalTaxAmount.toString() : null,
        grand_total: grandTotal > 0 ? grandTotal.toString() : null,
        unique_hsn_codes: Array.from(new Set(poRows.map((row: SwiggyCSVRow) => row.CategoryId).filter(Boolean).map(String))),
        status: firstRow.Status || 'pending',
        created_by: uploadedBy
      };

      // Create lines matching InsertSwiggyPoLine schema
      const lines = poRows.map((row: SwiggyCSVRow, index: number) => {
        // Use the HSN mapper to extract or infer HSN code
        const hsnCode = extractHsnCode({
          hsnCode: row.HsnCode,
          description: row.SkuDescription,
          category: row.CategoryId,
          brandName: row.BrandName
        });

        return {
        line_number: index + 1,
        item_code: row.SkuCode || '',
        item_description: row.SkuDescription || '',
        category_id: row.CategoryId || null,
        brand_name: row.BrandName || null,
        hsn_code: hsnCode,
        quantity: parseNumberOrZero(row.OrderedQty),
        received_qty: parseNumberOrZero(row.ReceivedQty),
        balanced_qty: parseNumberOrZero(row.BalancedQty),
        mrp: parseNumber(row.Mrp)?.toString() || null,
        unit_base_cost: parseNumber(row.UnitBasedCost)?.toString() || null,
        taxable_value: parseNumber(row.PoLineValueWithoutTax)?.toString() || null,

        // Tax fields - Calculate actual tax rates from CSV data
        cgst_rate: (() => {
          const taxableValue = parseNumberOrZero(row.PoLineValueWithoutTax);
          const taxAmount = parseNumberOrZero(row.Tax);
          if (taxableValue > 0 && taxAmount > 0) {
            const taxRate = (taxAmount / taxableValue) * 100;
            return (taxRate / 2).toString(); // Split between CGST and SGST
          }
          return null;
        })(),
        cgst_amount: parseNumberOrZero(row.Tax) > 0 ? (parseNumberOrZero(row.Tax) / 2).toString() : null,
        sgst_rate: (() => {
          const taxableValue = parseNumberOrZero(row.PoLineValueWithoutTax);
          const taxAmount = parseNumberOrZero(row.Tax);
          if (taxableValue > 0 && taxAmount > 0) {
            const taxRate = (taxAmount / taxableValue) * 100;
            return (taxRate / 2).toString(); // Split between CGST and SGST
          }
          return null;
        })(),
        sgst_amount: parseNumberOrZero(row.Tax) > 0 ? (parseNumberOrZero(row.Tax) / 2).toString() : null,
        igst_rate: null,
        igst_amount: null,
        cess_rate: null,
        cess_amount: null,
        additional_cess: null,
        total_tax_amount: parseNumber(row.Tax)?.toString() || null,
        line_total: (() => {
          const mrp = parseNumber(row.Mrp);
          const quantity = parseNumberOrZero(row.OrderedQty);
          if (mrp && quantity > 0) {
            return (mrp * quantity).toString();
          }
          return parseNumber(row.PoLineValueWithTax)?.toString() || null;
        })(),
        expected_delivery_date: parseDate(row.ExpectedDeliveryDate),
        po_expiry_date: parseDate(row.PoExpiryDate),
        otb_reference_number: row.OtbReferenceNumber || null,
        internal_external_po: row.InternalExternalPo || null,
        po_ageing: parseNumberOrZero(row.PoAgeing),
        reference_po_number: row.ReferencePoNumber || null
      };
    });

      parsedPOs.push({
        header,
        lines
      });

      console.log(`✅ Processed PO ${poNumber}: ${lines.length} items, Total: ${grandTotal}`);
    }

    console.log(`🎉 Successfully parsed ${parsedPOs.length} Swiggy POs from CSV`);

    // Calculate total amounts and items across all POs for preview display
    const totalItems = parsedPOs.reduce((sum, po) => sum + po.lines.length, 0);
    const totalAmount = parsedPOs.reduce((sum, po) => {
      const poTotal = po.header.grand_total || po.header.po_amount;
      return sum + (poTotal ? parseFloat(poTotal) : 0);
    }, 0);

    console.log(`📊 Summary: ${parsedPOs.length} POs, ${totalItems} items, ₹${totalAmount.toFixed(2)} total`);

    return {
      poList: parsedPOs,
      totalPOs: parsedPOs.length,
      totalItems: totalItems,
      totalAmount: totalAmount.toString()
    };

  } catch (error) {
    console.error('❌ Swiggy CSV parsing failed:', error);
    throw new Error(`Failed to parse Swiggy CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}