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
      po_expiry_date: poExpiryDate
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

    // Prepare header data with correct mapping from parsed header
    const headerData = {
      po_number: poNumberToCheck,
      po_date: safeDate(poCreatedAt),
      po_release_date: safeDate(data.header.po_release_date || data.header.PoModifiedAt),
      expected_delivery_date: safeDate(expectedDeliveryDate),
      po_expiry_date: safeDate(poExpiryDate),
      vendor_name: vendorName || null,
      payment_terms: data.header.payment_terms || null,
      total_items: data.lines.length || 0,
      total_quantity: data.lines.reduce((sum: number, line: any) => sum + (Number(line.quantity || line.OrderedQty) || 0), 0),
      total_taxable_value: data.header.total_taxable_value || data.header.PoLineValueWithoutTax || null,
      total_tax_amount: data.header.total_tax_amount || data.header.Tax || null,
      grand_total: data.header.grand_total || data.header.total_amount || poAmount || null,
      unique_hsn_codes: data.header.unique_hsn_codes || [],
      status: status || 'pending',
      created_by: data.header.created_by || data.header.uploaded_by || 'system'
    };

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

      // Insert PO Lines
      if (data.lines && data.lines.length > 0) {
        console.log(`📝 Inserting ${data.lines.length} lines into swiggy_po_lines...`);

        const linesData = data.lines.map((line: any, index: number) => ({
          po_id: insertedHeader.id,
          line_number: line.line_number || (index + 1),
          // Map from both old and new field names
          item_code: line.item_code || line.SkuCode || '',
          item_description: line.item_description || line.product_description || line.SkuDescription || '',
          hsn_code: line.hsn_code || null,
          quantity: Number(line.quantity || line.OrderedQty) || 0,
          mrp: line.mrp || line.Mrp || null,
          unit_base_cost: line.unit_base_cost || line.UnitBasedCost || null,
          taxable_value: line.taxable_value || line.PoLineValueWithoutTax || null,
          // Map tax breakdown from parsed data
          cgst_rate: line.cgst_rate || null,
          cgst_amount: line.cgst_amount || null,
          sgst_rate: line.sgst_rate || null,
          sgst_amount: line.sgst_amount || null,
          igst_rate: line.igst_rate || null,
          igst_amount: line.igst_amount || null,
          cess_rate: line.cess_rate || null,
          cess_amount: line.cess_amount || null,
          additional_cess: line.additional_cess || null,
          total_tax_amount: line.total_tax_amount || line.Tax || null,
          line_total: line.line_total || line.PoLineValueWithTax || null
        }));

        await tx.insert(swiggyPoLines).values(linesData);
        console.log(`✅ Inserted ${data.lines.length} Swiggy PO lines`);
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