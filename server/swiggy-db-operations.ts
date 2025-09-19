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
    console.log('📦 Header data types:', {
      po_number: typeof data.header.po_number,
      po_date: typeof data.header.po_date,
      po_release_date: typeof data.header.po_release_date,
      expected_delivery_date: typeof data.header.expected_delivery_date,
      po_expiry_date: typeof data.header.po_expiry_date,
      vendor_name: typeof data.header.vendor_name
    });
    console.log('📦 Header data values:', {
      po_number: data.header.po_number,
      po_date: data.header.po_date,
      po_release_date: data.header.po_release_date,
      expected_delivery_date: data.header.expected_delivery_date,
      po_expiry_date: data.header.po_expiry_date
    });

    // Check for existing PO with same number in swiggy_po_header table
    const poNumberToCheck = String(data.header.po_number || `SWIGGY_${Date.now()}`);
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
      const duplicateMessage = `PO ${data.header.po_number} already exists in swiggy_po_header table (ID: ${existing.id}, Date: ${existing.po_date}, Vendor: ${existing.vendor_name}, Created: ${existing.created_at}). Duplicate imports are not allowed.`;
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
      po_date: safeDate(data.header.po_date),
      po_release_date: safeDate(data.header.po_release_date),
      expected_delivery_date: safeDate(data.header.expected_delivery_date),
      po_expiry_date: safeDate(data.header.po_expiry_date),
      vendor_name: data.header.vendor_name || null,
      payment_terms: data.header.payment_terms || null,
      total_items: data.lines.length || 0,
      total_quantity: data.lines.reduce((sum: number, line: any) => sum + (Number(line.quantity) || 0), 0),
      total_taxable_value: data.header.total_taxable_value ? String(data.header.total_taxable_value) : null,
      total_tax_amount: data.header.total_tax_amount ? String(data.header.total_tax_amount) : null,
      grand_total: data.header.grand_total ? String(data.header.grand_total) : null,
      unique_hsn_codes: data.header.unique_hsn_codes || [...new Set(data.lines.map((line: any) => line.hsn_code).filter(Boolean))],
      status: data.header.status || 'pending',
      created_by: data.header.created_by || 'system'
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
          // Map directly from parsed line items
          item_code: line.item_code || '',
          item_description: line.item_description || line.product_description || '',
          hsn_code: line.hsn_code || null, // Don't use category_id as it's too long for hsn_code field
          quantity: Number(line.quantity) || 0,
          mrp: line.mrp ? (typeof line.mrp === 'string' ? Number(line.mrp) : line.mrp) : null,
          unit_base_cost: line.unit_base_cost ? (typeof line.unit_base_cost === 'string' ? Number(line.unit_base_cost) : line.unit_base_cost) : null,
          taxable_value: line.taxable_value ? (typeof line.taxable_value === 'string' ? Number(line.taxable_value) : line.taxable_value) : null,
          // Map tax breakdown from parsed data
          cgst_rate: line.cgst_rate ? (typeof line.cgst_rate === 'string' ? Number(line.cgst_rate) : line.cgst_rate) : null,
          cgst_amount: line.cgst_amount ? (typeof line.cgst_amount === 'string' ? Number(line.cgst_amount) : line.cgst_amount) : null,
          sgst_rate: line.sgst_rate ? (typeof line.sgst_rate === 'string' ? Number(line.sgst_rate) : line.sgst_rate) : null,
          sgst_amount: line.sgst_amount ? (typeof line.sgst_amount === 'string' ? Number(line.sgst_amount) : line.sgst_amount) : null,
          igst_rate: line.igst_rate ? (typeof line.igst_rate === 'string' ? Number(line.igst_rate) : line.igst_rate) : null,
          igst_amount: line.igst_amount ? (typeof line.igst_amount === 'string' ? Number(line.igst_amount) : line.igst_amount) : null,
          cess_rate: line.cess_rate ? (typeof line.cess_rate === 'string' ? Number(line.cess_rate) : line.cess_rate) : null,
          cess_amount: line.cess_amount ? (typeof line.cess_amount === 'string' ? Number(line.cess_amount) : line.cess_amount) : null,
          additional_cess: line.additional_cess ? (typeof line.additional_cess === 'string' ? Number(line.additional_cess) : line.additional_cess) : null,
          total_tax_amount: line.total_tax_amount ? (typeof line.total_tax_amount === 'string' ? Number(line.total_tax_amount) : line.total_tax_amount) : null,
          line_total: line.line_total ? (typeof line.line_total === 'string' ? Number(line.line_total) : line.line_total) : null
        }));

        await tx.insert(swiggyPoLines).values(linesData);
        console.log(`✅ Inserted ${data.lines.length} Swiggy PO lines`);
      }

      return {
        success: true,
        message: `Successfully inserted Swiggy PO ${data.header.po_number} into swiggy_po_header and swiggy_po_lines with ${data.lines.length} line items`,
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