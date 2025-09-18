import { db } from './db';
import { zeptoPoHeader, zeptoPoLines } from '@shared/schema';

interface ZeptoPoHeader {
  po_number: string;
  po_date?: Date;
  status: string;
  vendor_code?: string;
  vendor_name?: string;
  po_amount?: string;
  delivery_location?: string;
  po_expiry_date?: Date;
  total_quantity: number;
  total_cost_value: string;
  total_tax_amount: string;
  total_amount: string;
  unique_brands: string[];
  created_by: string;
  uploaded_by: string;
}

interface ZeptoPoLine {
  line_number: number;
  po_number: string;
  sku: string;
  sku_desc: string;
  brand: string;
  sku_id: string;
  sap_id: string;
  hsn_code: string;
  ean_no: string;
  po_qty: number;
  asn_qty: number;
  grn_qty: number;
  remaining_qty: number;
  cost_price: string;
  landing_cost: string;
  cgst: string;
  sgst: string;
  igst: string;
  cess: string;
  mrp: string;
  total_value: string;
  status: string;
  created_by: string;
}

interface ParsedZeptoPO {
  header: ZeptoPoHeader;
  lines: ZeptoPoLine[];
}

const parseNumeric = (value: string | number, fieldName: string = 'unknown'): number => {
  if (typeof value === 'number') return value;
  if (!value || value === 'N/A' || value === '') return 0;

  const originalValue = value.toString();
  console.log(`Parsing ${fieldName}: "${originalValue}"`);

  // Remove currency symbols, units, and non-numeric characters except dots and dashes
  const cleanValue = originalValue
    .replace(/[₹,%kgtonnes\s]/g, '')  // Remove common units and currency symbols
    .replace(/[^0-9.-]/g, '')         // Keep only numbers, dots, and dashes
    .replace(/^-+/, '-')              // Consolidate leading dashes
    .replace(/\.+/g, '.');            // Consolidate multiple dots

  console.log(`Clean value for ${fieldName}: "${cleanValue}"`);
  const parsed = parseFloat(cleanValue);

  if (isNaN(parsed)) {
    console.warn(`Failed to parse ${fieldName}: "${originalValue}" -> NaN, using 0`);
    return 0;
  }

  console.log(`Parsed ${fieldName}: "${originalValue}" -> ${parsed}`);
  return parsed;
};

const parseDecimal = (value: string | number): string => {
  const numValue = parseNumeric(value);
  return numValue.toFixed(2);
};

const parseDate = (value: string | Date | undefined): Date | null => {
  if (!value) {
    console.log('parseDate: No value provided, returning null');
    return null;
  }

  console.log(`🔍 parseDate: Input value: "${value}" (type: ${typeof value})`);

  // If it's already a Date object
  if (value instanceof Date) {
    console.log('✅ parseDate: Already a Date object, returning as-is');
    return value;
  }

  // If it's a string
  if (typeof value === 'string') {
    // Try to parse the string as a date
    const parsedDate = new Date(value);
    console.log(`parseDate: Parsed "${value}" to Date object: ${parsedDate.toISOString()}`);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn(`parseDate: Invalid date string: "${value}"`);
      return null;
    }

    console.log(`parseDate: Returning valid Date object: ${parsedDate.toISOString()}`);
    return parsedDate;
  }

  console.warn(`parseDate: Unsupported value type: ${typeof value}`);
  return null;
};

export const insertZeptoPoToDatabase = async (data: ParsedZeptoPO): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log('🔄 Starting Zepto PO database insertion with SQL Server support...');
    console.log('📦 Raw header data:', JSON.stringify(data.header, null, 2));

    // Create header object with all available columns matching the database schema
    const safeHeaderData = {
      po_number: String(data.header.po_number || `ZEPTO_${Date.now()}`),
      po_date: parseDate(data.header.po_date),
      status: String(data.header.status || 'Open').substring(0, 20),
      vendor_code: data.header.vendor_code ? String(data.header.vendor_code).substring(0, 50) : null,
      vendor_name: data.header.vendor_name ? String(data.header.vendor_name).substring(0, 200) : null,
      po_amount: data.header.po_amount ? parseDecimal(data.header.po_amount) : null,
      delivery_location: data.header.delivery_location ? String(data.header.delivery_location).substring(0, 200) : null,
      po_expiry_date: parseDate(data.header.po_expiry_date),
      total_quantity: parseInt(String(data.header.total_quantity || '0')) || 0,
      total_cost_value: parseDecimal(data.header.total_cost_value || '0'),
      total_tax_amount: parseDecimal(data.header.total_tax_amount || '0'),
      total_amount: parseDecimal(data.header.total_amount || '0'),
      unique_brands: data.header.unique_brands || [],
      created_by: String(data.header.created_by || 'system'),
      uploaded_by: String(data.header.uploaded_by || 'system')
    };

    console.log('✅ Complete header data prepared:', JSON.stringify(safeHeaderData, null, 2));

    // Insert header using Drizzle ORM
    const [insertedHeader] = await db
      .insert(zeptoPoHeader)
      .values(safeHeaderData)
      .returning();

    console.log('🎯 Header inserted successfully with ID:', insertedHeader.id);

    // Insert lines if they exist
    let insertedLinesCount = 0;
    if (data.lines && data.lines.length > 0) {
      console.log(`📋 Processing ${data.lines.length} line items...`);

      // Process lines in smaller batches to avoid issues
      const batchSize = 10;
      for (let i = 0; i < data.lines.length; i += batchSize) {
        const batch = data.lines.slice(i, i + batchSize);

        const safeLinesData = batch.map((line, index) => {
          const safeLine: any = {
            po_header_id: insertedHeader.id,
            line_number: parseInt(String(line.line_number || (i + index + 1))) || (i + index + 1),
            po_number: String(line.po_number || safeHeaderData.po_number),
            sku: String(line.sku || ''),
            sku_desc: String(line.sku_desc || ''),
            brand: String(line.brand || ''),
            sku_id: String(line.sku_id || ''),
            sap_id: String(line.sap_id || ''),
            hsn_code: String(line.hsn_code || ''),
            ean_no: String(line.ean_no || ''),
            po_qty: parseInt(String(line.po_qty || '0')) || 0,
            asn_qty: parseInt(String(line.asn_qty || '0')) || 0,
            grn_qty: parseInt(String(line.grn_qty || '0')) || 0,
            remaining_qty: parseInt(String(line.remaining_qty || '0')) || 0,
            status: String(line.status || 'Pending'),
            created_by: String(line.created_by || safeHeaderData.created_by)
          };

          // Handle decimal fields for lines with proper null handling
          safeLine.cost_price = line.cost_price ? parseDecimal(line.cost_price) : null;
          safeLine.landing_cost = line.landing_cost ? parseDecimal(line.landing_cost) : null;
          safeLine.cgst = line.cgst ? parseDecimal(line.cgst) : null;
          safeLine.sgst = line.sgst ? parseDecimal(line.sgst) : null;
          safeLine.igst = line.igst ? parseDecimal(line.igst) : null;
          safeLine.cess = line.cess ? parseDecimal(line.cess) : null;
          safeLine.mrp = line.mrp ? parseDecimal(line.mrp) : null;
          safeLine.total_value = line.total_value ? parseDecimal(line.total_value) : null;

          return safeLine;
        });

        await db.insert(zeptoPoLines).values(safeLinesData);
        insertedLinesCount += safeLinesData.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${safeLinesData.length} lines`);
      }
    }

    const successMessage = `Zepto PO ${safeHeaderData.po_number} inserted successfully with ${insertedLinesCount} lines`;
    console.log('🎉 ' + successMessage);

    return {
      success: true,
      message: successMessage,
      data: {
        header: insertedHeader,
        linesCount: insertedLinesCount
      }
    };

  } catch (error) {
    console.error('❌ Database insertion error:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return {
      success: false,
      message: `Failed to insert Zepto PO: ${error instanceof Error ? error.message : 'Unknown database error'}`
    };
  }
};

export const insertMultipleZeptoPoToDatabase = async (poList: ParsedZeptoPO[]): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log(`Starting insertion of ${poList.length} Zepto POs...`);

    const results = [];
    for (const po of poList) {
      const result = await insertZeptoPoToDatabase(po);
      results.push(result);
      if (!result.success) {
        console.error(`Failed to insert PO ${po.header.po_number}:`, result.message);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return {
      success: failureCount === 0,
      message: `Inserted ${successCount} POs successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      data: results
    };
  } catch (error) {
    console.error('Multiple PO insertion error:', error);
    return {
      success: false,
      message: `Failed to insert multiple Zepto POs: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};