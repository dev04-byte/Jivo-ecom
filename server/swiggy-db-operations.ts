import { db } from './db';
import { swiggyPos, swiggyPoLines } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface SwiggyPoData {
  header: any;
  lines: any[];
}

export const insertSwiggyPoToDatabase = async (data: SwiggyPoData): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log('🔄 Starting Swiggy PO database insertion with duplicate checking...');

    // Handle both old field names (po_number) and new field names (PoNumber)
    const poNumber = data.header.po_number || data.header.PoNumber;
    const vendorName = data.header.vendor_name || data.header.VendorName;
    const poCreatedAt = data.header.po_date || data.header.PoCreatedAt;
    const poAmount = data.header.po_amount || data.header.PoAmount;
    const expectedDeliveryDate = data.header.expected_delivery_date || data.header.ExpectedDeliveryDate;
    const poExpiryDate = data.header.po_expiry_date || data.header.PoExpiryDate;
    const facilityName = data.header.facility_name || data.header.FacilityName;
    const entity = data.header.entity || data.header.Entity;
    const supplierCode = data.header.supplier_code || data.header.SupplierCode;
    const status = data.header.status || data.header.Status;

    console.log('📦 Header data types:', {
      po_number: typeof poNumber,
      po_date: typeof poCreatedAt,
      expected_delivery_date: typeof expectedDeliveryDate,
      po_expiry_date: typeof poExpiryDate,
      vendor_name: typeof vendorName
    });
    console.log('📦 Header data values:', {
      po_number: poNumber,
      po_date: poCreatedAt,
      expected_delivery_date: expectedDeliveryDate,
      po_expiry_date: poExpiryDate,
      raw_grand_total: data.header.grand_total,
      raw_total_amount: data.header.total_amount,
      raw_po_amount: poAmount
    });

    // Check for existing PO with same number in swiggy_po_header table
    const poNumberToCheck = String(poNumber || `SWIGGY_${Date.now()}`);
    console.log(`🔍 Checking for duplicate PO number: ${poNumberToCheck} in swiggy_po_header table...`);

    const existingPo = await db
      .select({
        id: swiggyPos.id,
        po_number: swiggyPos.po_number,
        po_date: swiggyPos.po_date,
        vendor_name: swiggyPos.vendor_name,
        grand_total: swiggyPos.grand_total,
        created_at: swiggyPos.created_at
      })
      .from(swiggyPos)
      .where(eq(swiggyPos.po_number, poNumberToCheck))
      .limit(1);

    if (existingPo.length > 0) {
      const existing = existingPo[0];
      const duplicateMessage = `PO ${poNumber} already exists in swiggy_po_header table (ID: ${existing.id}, Date: ${existing.po_date}, Vendor: ${existing.vendor_name}, Created: ${existing.created_at}). Duplicate imports are not allowed.`;
      console.log('❌ ' + duplicateMessage);
      return {
        success: false,
        message: duplicateMessage
      };
    }

    console.log(`✅ No duplicate found for PO ${poNumberToCheck}. Proceeding with insertion...`);

    // Helper function to safely convert to Date
    const safeDate = (value: any): Date | null => {
      if (!value) return null;
      if (value instanceof Date) return value;
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    };

    // Helper function to safely convert to number
    const safeNumber = (value: any): number => {
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
    };

    // Helper function to safely convert to decimal string for database
    const safeDecimal = (value: any): string | null => {
      if (value === null || value === undefined || value === '' || value === 'NaN') return null;
      const num = safeNumber(value);
      // Only return non-zero positive values, null for zero or negative
      return num > 0 ? num.toString() : null;
    };

    // Helper function to safely convert to string
    const safeString = (value: any, defaultValue: string = ''): string => {
      if (value === null || value === undefined) return defaultValue;
      return String(value);
    };

    // Prepare header data with correct mapping from parsed header using safe conversions
    const headerData = {
      po_number: safeString(poNumberToCheck),
      entity: data.header.entity ? safeString(data.header.entity) : null,
      facility_id: data.header.facility_id ? safeString(data.header.facility_id) : null,
      facility_name: facilityName ? safeString(facilityName) : null,
      city: data.header.city ? safeString(data.header.city) : null,
      po_date: safeDate(poCreatedAt),
      po_modified_at: safeDate(data.header.po_modified_at || data.header.PoModifiedAt),
      po_release_date: safeDate(data.header.po_release_date || data.header.PoModifiedAt),
      expected_delivery_date: safeDate(expectedDeliveryDate),
      po_expiry_date: safeDate(poExpiryDate),
      supplier_code: supplierCode ? safeString(supplierCode) : null,
      vendor_name: vendorName ? safeString(vendorName) : null,
      po_amount: safeDecimal(poAmount),
      payment_terms: (data.header.payment_terms || data.header.credit_term) ? safeString(data.header.payment_terms || data.header.credit_term) : null,
      otb_reference_number: data.header.otb_reference_number ? safeString(data.header.otb_reference_number) : null,
      internal_external_po: data.header.internal_external_po ? safeString(data.header.internal_external_po) : null,
      total_items: data.lines?.length || 0,
      total_quantity: data.lines?.reduce((sum: number, line: any) => sum + safeNumber(line.quantity || line.OrderedQty), 0) || 0,
      total_taxable_value: safeDecimal(data.header.total_taxable_value || data.header.PoLineValueWithoutTax),
      total_tax_amount: safeDecimal(data.header.total_tax_amount || data.header.Tax),
      grand_total: (() => {
        // Calculate grand total from lines if header values are invalid
        const headerTotal = data.header.grand_total || data.header.total_amount || poAmount;
        console.log('🔍 Debug grand_total calculation:', {
          headerGrandTotal: data.header.grand_total,
          headerTotalAmount: data.header.total_amount,
          poAmount: poAmount,
          selectedHeaderTotal: headerTotal
        });

        if (headerTotal && !isNaN(parseFloat(String(headerTotal))) && parseFloat(String(headerTotal)) > 0) {
          const result = safeDecimal(headerTotal);
          console.log('✅ Using header total:', result);
          return result;
        }

        // Fallback: calculate from lines
        const linesTotal = data.lines?.reduce((sum: number, line: any) => {
          const lineTotal = safeNumber(line.line_total || line.total_value || line.PoLineValueWithTax);
          return sum + lineTotal;
        }, 0) || 0;

        console.log('📊 Calculated from lines total:', linesTotal);
        const result = safeDecimal(linesTotal);
        console.log('✅ Final grand_total result:', result);
        return result;
      })(),
      status: safeString(status || 'pending'),
      created_by: safeString(data.header.created_by || data.header.uploaded_by || 'system')
    };

    // Validate required fields
    if (!headerData.po_number) {
      throw new Error('PO Number is required but not found in data');
    }

    // Start database transaction
    const result = await db.transaction(async (tx) => {
      console.log('📝 Inserting header into swiggy_po_header...');
      console.log('📝 About to insert header data:', JSON.stringify(headerData, null, 2));

      // Insert PO Header
      const [insertedHeader] = await tx
        .insert(swiggyPos)
        .values(headerData)
        .returning();

      console.log(`✅ Inserted Swiggy PO header with ID: ${insertedHeader.id}`);

      if (!insertedHeader.id) {
        throw new Error('Failed to get inserted header ID from database');
      }

      // Insert PO Lines
      if (data.lines && data.lines.length > 0) {
        console.log(`📝 Inserting ${data.lines.length} lines into swiggy_po_lines...`);

        const linesData = data.lines.map((line: any, index: number) => {
          const quantity = safeNumber(line.quantity || line.OrderedQty);
          const unitCost = safeNumber(line.unit_base_cost || line.UnitBasedCost);
          const taxableValue = safeNumber(line.taxable_value || line.PoLineValueWithoutTax);
          const lineTotal = safeNumber(line.total_value || line.line_total || line.PoLineValueWithTax);

          // Calculate correct tax using formula (R2/S2)*100 where R2 = taxable_value, S2 = line_total
          // This gives the tax percentage as per your requirement
          const correctTaxAmount = lineTotal > taxableValue ? lineTotal - taxableValue : 0;

          // Validate required line fields
          if (!line.item_code && !line.SkuCode) {
            console.warn(`⚠️ Line ${index + 1}: Missing item_code, using placeholder`);
          }

          return {
            po_id: insertedHeader.id,
            line_number: line.line_number || (index + 1),
            item_code: safeString(line.item_code || line.SkuCode),
            item_description: safeString(line.item_description || line.product_description || line.SkuDescription),
            category_id: line.category_id || line.CategoryId ? safeString(line.category_id || line.CategoryId) : null,
            brand_name: line.brand_name || line.BrandName ? safeString(line.brand_name || line.BrandName) : null,
            hsn_code: line.hsn_code ? safeString(line.hsn_code) : null,
            quantity: quantity,
            received_qty: safeNumber(line.received_qty || line.ReceivedQty),
            balanced_qty: safeNumber(line.balanced_qty || line.BalancedQty),
            mrp: safeDecimal(line.mrp || line.Mrp),
            unit_base_cost: safeDecimal(unitCost),
            taxable_value: safeDecimal(taxableValue),
            // Remove IGST, CGST, SGST, CESS - set to null as per requirement
            cgst_rate: null,
            cgst_amount: null,
            sgst_rate: null,
            sgst_amount: null,
            igst_rate: null,
            igst_amount: null,
            cess_rate: null,
            cess_amount: null,
            additional_cess: null,
            // Use correct tax calculation instead of separate tax components
            total_tax_amount: safeDecimal(correctTaxAmount),
            line_total: safeDecimal(lineTotal),
            expected_delivery_date: safeDate(line.expected_delivery_date || line.ExpectedDeliveryDate),
            po_expiry_date: safeDate(line.po_expiry_date || line.PoExpiryDate),
            otb_reference_number: line.otb_reference_number || line.OtbReferenceNumber ? safeString(line.otb_reference_number || line.OtbReferenceNumber) : null,
            internal_external_po: line.internal_external_po || line.InternalExternalPo ? safeString(line.internal_external_po || line.InternalExternalPo) : null,
            po_ageing: safeNumber(line.po_ageing || line.PoAgeing),
            reference_po_number: line.reference_po_number || line.ReferencePoNumber ? safeString(line.reference_po_number || line.ReferencePoNumber) : null
          };
        });

        console.log(`📝 Lines data sample:`, JSON.stringify(linesData[0], null, 2));

        const insertedLines = await tx.insert(swiggyPoLines).values(linesData).returning();
        console.log(`✅ Successfully inserted ${insertedLines.length} Swiggy PO lines`);
      }

      return {
        success: true,
        message: `Successfully inserted Swiggy PO ${poNumber} into swiggy_po_header and swiggy_po_lines with ${data.lines.length} line items`,
        data: {
          swiggy_header_id: insertedHeader.id,
          po_number: insertedHeader.po_number,
          total_items: data.lines.length,
          total_quantity: headerData.total_quantity,
          grand_total: headerData.grand_total
        }
      };
    });

    console.log('🎉 Swiggy PO database transaction completed successfully!');
    return result;

  } catch (error) {
    console.error('❌ Swiggy PO database insertion failed:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      cause: error instanceof Error ? error.cause : 'No cause'
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check if it's a database constraint violation
    if (errorMessage.includes('duplicate key value') || errorMessage.includes('unique constraint')) {
      return {
        success: false,
        message: `PO ${data.header.po_number} already exists in the database. Duplicate imports are not allowed.`
      };
    }

    return {
      success: false,
      message: errorMessage
    };
  }
};