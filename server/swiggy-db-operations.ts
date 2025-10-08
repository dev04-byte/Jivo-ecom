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

    // Helper function to safely convert to integer
    const safeInt = (value: any): number => {
      if (value === null || value === undefined || value === '') return 0;
      if (typeof value === 'number') {
        return isNaN(value) ? 0 : Math.floor(value);
      }
      if (typeof value === 'string') {
        // Remove any non-numeric characters except negative sign
        const cleanValue = value.replace(/[^\d-]/g, '');
        const parsed = parseInt(cleanValue, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Helper function to safely convert to decimal string for database
    const safeDecimal = (value: any): string | null => {
      if (value === null || value === undefined || value === '' || value === 'NaN') return null;

      // If already a valid string number, return it directly
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed > 0) {
          return value; // Return original string to preserve precision
        }
      }

      const num = safeNumber(value);
      // Only return non-zero positive values, null for zero or negative
      return num > 0 ? num.toString() : null;
    };

    // Helper function to safely convert to string
    const safeString = (value: any, defaultValue: string = ''): string => {
      if (value === null || value === undefined) return defaultValue;
      // Explicitly convert to string, even if it's a number
      if (typeof value === 'number') {
        return value.toString();
      }
      return String(value);
    };

    // Helper to ensure varchar fields are always strings, not numbers
    const toVarchar = (value: any): string | null => {
      if (value === null || value === undefined || value === '') return null;
      // Force conversion to string for all types
      return String(value);
    };

    // Build raw header data first
    const rawHeaderData = {
      po_number: poNumberToCheck,
      entity: data.header.entity,
      facility_id: data.header.facility_id || data.header.FacilityId,
      facility_name: facilityName,
      city: data.header.city || data.header.City,
      po_date: poCreatedAt,
      po_modified_at: data.header.po_modified_at || data.header.PoModifiedAt,
      po_release_date: data.header.po_release_date || data.header.PoModifiedAt,
      expected_delivery_date: expectedDeliveryDate,
      po_expiry_date: poExpiryDate,
      supplier_code: supplierCode,
      vendor_name: vendorName,
      po_amount: data.header.po_amount || poAmount,
      payment_terms: data.header.payment_terms || data.header.credit_term,
      otb_reference_number: data.header.otb_reference_number || data.header.OtbReferenceNumber,
      internal_external_po: data.header.internal_external_po || data.header.InternalExternalPo,
      total_items: data.lines?.length || 0,
      total_quantity: data.lines?.reduce((sum: number, line: any) => sum + (line.quantity || line.OrderedQty || 0), 0) || 0,
      total_taxable_value: data.header.total_taxable_value || data.header.PoLineValueWithoutTax,
      total_tax_amount: data.header.total_tax_amount || data.header.Tax,
      grand_total: data.header.grand_total || data.header.po_amount || poAmount,
      status: status || 'pending',
      created_by: data.header.created_by || data.header.uploaded_by || 'system'
    };

    // Apply strict type conversions based on schema
    const headerData: any = {
      // VARCHAR fields - MUST be strings or null
      po_number: toVarchar(rawHeaderData.po_number) || 'UNKNOWN',
      entity: toVarchar(rawHeaderData.entity),
      facility_id: toVarchar(rawHeaderData.facility_id),
      facility_name: toVarchar(rawHeaderData.facility_name),
      city: toVarchar(rawHeaderData.city),
      supplier_code: toVarchar(rawHeaderData.supplier_code),
      vendor_name: toVarchar(rawHeaderData.vendor_name),
      payment_terms: toVarchar(rawHeaderData.payment_terms),
      otb_reference_number: toVarchar(rawHeaderData.otb_reference_number),
      internal_external_po: toVarchar(rawHeaderData.internal_external_po),
      status: toVarchar(rawHeaderData.status) || 'pending',
      created_by: toVarchar(rawHeaderData.created_by) || 'system',

      // TIMESTAMP fields - Date objects or null
      po_date: safeDate(rawHeaderData.po_date),
      po_modified_at: safeDate(rawHeaderData.po_modified_at),
      po_release_date: safeDate(rawHeaderData.po_release_date),
      expected_delivery_date: safeDate(rawHeaderData.expected_delivery_date),
      po_expiry_date: safeDate(rawHeaderData.po_expiry_date),

      // INTEGER fields - MUST be integers
      total_items: safeInt(rawHeaderData.total_items),
      total_quantity: safeInt(rawHeaderData.total_quantity),

      // DECIMAL fields - MUST be string representations or null
      po_amount: safeDecimal(rawHeaderData.po_amount),
      total_taxable_value: safeDecimal(rawHeaderData.total_taxable_value),
      total_tax_amount: safeDecimal(rawHeaderData.total_tax_amount),
      grand_total: safeDecimal(rawHeaderData.grand_total)
    };

    // Validate required fields
    if (!headerData.po_number || headerData.po_number === 'UNKNOWN') {
      throw new Error('PO Number is required but not found in data');
    }

    console.log('✅ Header data prepared with strict type conversions');
    console.log('📋 PO:', headerData.po_number, '| Items:', headerData.total_items, '| Total:', headerData.grand_total);

    // Start database transaction
    const result = await db.transaction(async (tx) => {
      console.log('📝 Inserting header into swiggy_po_header...');
      console.log('📝 About to insert header data:', JSON.stringify(headerData, null, 2));

      // Log data types for debugging
      console.log('🔍 Header data types:', Object.entries(headerData).map(([key, value]) => ({
        field: key,
        value: value,
        type: typeof value,
        isNull: value === null
      })));

      // Insert PO Header
      let insertedHeader;
      try {
        [insertedHeader] = await tx
          .insert(swiggyPos)
          .values(headerData)
          .returning();
      } catch (insertError: any) {
        console.error('❌ Header insertion failed:', insertError);
        console.error('❌ Failed headerData:', JSON.stringify(headerData, null, 2));
        throw new Error(`Header insertion failed: ${insertError.message}`);
      }

      console.log(`✅ Inserted Swiggy PO header with ID: ${insertedHeader.id}`);

      if (!insertedHeader.id) {
        throw new Error('Failed to get inserted header ID from database');
      }

      // Insert PO Lines
      if (data.lines && data.lines.length > 0) {
        console.log(`📝 Inserting ${data.lines.length} lines into swiggy_po_lines...`);

        const linesData = data.lines.map((line: any, index: number) => {
          // Build raw line data first
          const rawLineData = {
            line_number: line.line_number || (index + 1),
            item_code: line.item_code || line.SkuCode,
            item_description: line.item_description || line.product_description || line.SkuDescription,
            category_id: line.category_id || line.CategoryId,
            brand_name: line.brand_name || line.BrandName,
            quantity: line.quantity || line.OrderedQty,
            received_qty: line.received_qty || line.ReceivedQty,
            balanced_qty: line.balanced_qty || line.BalancedQty,
            mrp: line.mrp || line.Mrp,
            unit_base_cost: line.unit_base_cost || line.UnitBasedCost,
            taxable_value: line.taxable_value || line.PoLineValueWithoutTax,
            line_total: line.total_value || line.line_total || line.PoLineValueWithTax,
            total_tax_amount: line.total_tax_amount || line.Tax,
            expected_delivery_date: line.expected_delivery_date || line.ExpectedDeliveryDate,
            po_expiry_date: line.po_expiry_date || line.PoExpiryDate,
            otb_reference_number: line.otb_reference_number || line.OtbReferenceNumber,
            internal_external_po: line.internal_external_po || line.InternalExternalPo,
            po_ageing: line.po_ageing || line.PoAgeing,
            reference_po_number: line.reference_po_number || line.ReferencePoNumber
          };

          // Calculate tax amount if not provided
          const taxableVal = safeNumber(rawLineData.taxable_value);
          const lineTotalVal = safeNumber(rawLineData.line_total);
          const calculatedTax = lineTotalVal > taxableVal ? lineTotalVal - taxableVal : 0;

          // Validate required line fields
          if (!rawLineData.item_code) {
            console.warn(`⚠️ Line ${index + 1}: Missing item_code, using placeholder`);
          }

          // Apply strict type conversions based on schema
          return {
            po_id: insertedHeader.id,

            // INTEGER fields
            line_number: safeInt(rawLineData.line_number),
            quantity: safeInt(rawLineData.quantity),
            received_qty: safeInt(rawLineData.received_qty),
            balanced_qty: safeInt(rawLineData.balanced_qty),
            po_ageing: safeInt(rawLineData.po_ageing),

            // VARCHAR fields
            item_code: toVarchar(rawLineData.item_code) || 'UNKNOWN',
            item_description: toVarchar(rawLineData.item_description),
            category_id: toVarchar(rawLineData.category_id),
            brand_name: toVarchar(rawLineData.brand_name),
            otb_reference_number: toVarchar(rawLineData.otb_reference_number),
            internal_external_po: toVarchar(rawLineData.internal_external_po),
            reference_po_number: toVarchar(rawLineData.reference_po_number),

            // NOTE: hsn_code commented out temporarily until database migration is complete
            // Uncomment after running: ALTER TABLE swiggy_po_lines ADD COLUMN hsn_code varchar(20);
            // hsn_code: toVarchar(line.hsn_code),

            // DECIMAL fields
            mrp: safeDecimal(rawLineData.mrp),
            unit_base_cost: safeDecimal(rawLineData.unit_base_cost),
            taxable_value: safeDecimal(rawLineData.taxable_value),
            total_tax_amount: safeDecimal(rawLineData.total_tax_amount || calculatedTax),
            line_total: safeDecimal(rawLineData.line_total),

            // Tax component fields - set to null as per requirement
            cgst_rate: null,
            cgst_amount: null,
            sgst_rate: null,
            sgst_amount: null,
            igst_rate: null,
            igst_amount: null,
            cess_rate: null,
            cess_amount: null,
            additional_cess: null,

            // TIMESTAMP fields
            expected_delivery_date: safeDate(rawLineData.expected_delivery_date),
            po_expiry_date: safeDate(rawLineData.po_expiry_date)
          };
        });

        console.log(`📝 Lines data sample:`, JSON.stringify(linesData[0], null, 2));

        // Log data types for first line
        if (linesData.length > 0) {
          console.log('🔍 First line data types:', Object.entries(linesData[0]).map(([key, value]) => ({
            field: key,
            value: value,
            type: typeof value,
            isNull: value === null
          })));
        }

        let insertedLines;
        try {
          insertedLines = await tx.insert(swiggyPoLines).values(linesData).returning();
          console.log(`✅ Successfully inserted ${insertedLines.length} Swiggy PO lines`);
        } catch (lineInsertError: any) {
          console.error('❌ Line insertion failed:', lineInsertError);
          console.error('❌ Failed line data (first line):', JSON.stringify(linesData[0], null, 2));
          throw new Error(`Line insertion failed: ${lineInsertError.message}`);
        }
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