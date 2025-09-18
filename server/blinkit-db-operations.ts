import { db } from './db';
import { blinkitPoHeader, blinkitPoLines } from '@shared/schema';

interface BlinkitPoHeader {
  po_number: string;
  po_date: string;
  po_type: string;
  currency: string;
  buyer_name: string;
  buyer_pan: string;
  buyer_cin: string;
  buyer_unit: string;
  buyer_contact_name: string;
  buyer_contact_phone: string;
  vendor_no: string;
  vendor_name: string;
  vendor_pan: string;
  vendor_gst_no: string;
  vendor_registered_address: string;
  vendor_contact_name: string;
  vendor_contact_phone: string;
  vendor_contact_email: string;
  delivered_by: string;
  delivered_to_company: string;
  delivered_to_address: string;
  delivered_to_gst_no: string;
  spoc_name: string;
  spoc_phone: string;
  spoc_email: string;
  payment_terms: string;
  po_expiry_date: string;
  po_delivery_date: string;
  total_quantity: number;
  total_items: number;
  total_weight: string;
  total_amount: string;
  cart_discount: string;
  net_amount: string;
}

interface BlinkitPoLine {
  item_code: string;
  hsn_code: string;
  product_upc: string;
  product_description: string;
  basic_cost_price: number;
  igst_percent: number;
  cess_percent: number;
  addt_cess: number;
  tax_amount: number;
  landing_rate: number;
  quantity: number;
  mrp: number;
  margin_percent: number;
  total_amount: number;
}

interface BlinkitPoData {
  po_header: BlinkitPoHeader;
  po_lines: BlinkitPoLine[];
}

/**
 * Insert Blinkit PO data into database - ONLY blinkit_po_header and blinkit_po_lines
 * Simple flow: Insert into 2 tables:
 * 1. blinkit_po_header (platform-specific)
 * 2. blinkit_po_lines (platform-specific)
 */
export async function insertBlinkitPoData(data: BlinkitPoData): Promise<{ headerId: number; masterId: number; success: boolean; message: string }> {
  console.log('🔄 Starting database insertion for Blinkit PO... V5 (DEBUG - ALL FIELDS)');
  console.log('📊 Data summary:', {
    po_number: data.po_header.po_number,
    total_items: data.po_lines.length,
    total_quantity: data.po_header.total_quantity,
    total_amount: data.po_header.total_amount
  });

  // Debug: Log ALL header data to see what's causing the issue
  console.log('🔍 HEADER DEBUG - All fields:', JSON.stringify(data.po_header, null, 2));

  // Debug: Log ALL line items data
  console.log('🔍 LINES DEBUG - All line items:');
  data.po_lines.forEach((line, index) => {
    console.log(`Line ${index + 1}:`, JSON.stringify(line, null, 2));

    // Check specifically for problematic fields
    Object.entries(line).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('tonnes')) {
        console.error(`❌ FOUND TONNES IN LINE ${index + 1}.${key}: "${value}"`);
      }
    });
  });

  // Check header for problematic fields
  Object.entries(data.po_header).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes('tonnes')) {
      console.error(`❌ FOUND TONNES IN HEADER.${key}: "${value}"`);
    }
  });

  try {
    // Start database transaction
    const result = await db.transaction(async (tx) => {
      console.log('📝 Inserting header into blinkit_po_header...');

      // Step 1: Insert PO Header
      // Convert date strings to proper date format
      const parsePODate = (dateStr: string): string => {
        // Handle formats like "Sept. 18, 2025, 9:40 a.m." or just "Sept. 18, 2025"
        try {
          if (!dateStr || dateStr === 'N/A' || dateStr === '') {
            console.warn('Empty or N/A date, using current date');
            return new Date().toISOString().split('T')[0];
          }

          const cleanDate = dateStr.replace(/\./g, '').replace(/,\s*\d{1,2}:\d{2}\s*[ap]\.m\./i, '');
          const dateObj = new Date(cleanDate);
          if (!isNaN(dateObj.getTime())) {
            const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            console.log(`✅ Successfully parsed date: ${dateStr} -> ${formattedDate}`);
            return formattedDate;
          }
        } catch (e) {
          console.warn('Failed to parse date:', dateStr, e);
        }
        console.warn('Using default date for:', dateStr);
        return new Date().toISOString().split('T')[0]; // Default to today if parse fails
      };

      // Clean numeric values by removing units and text
      const parseNumeric = (value: string | number, fieldName: string = 'unknown'): number => {
        if (typeof value === 'number') return value;
        if (!value || value === 'N/A' || value === '') return 0;

        const originalValue = value.toString();

        // ALERT if we find tonnes anywhere
        if (originalValue.includes('tonnes')) {
          console.error(`🚨 CRITICAL: parseNumeric received tonnes value [${fieldName}]: "${originalValue}"`);
        }

        // Remove common units and extract only numbers and decimal points
        const cleanValue = originalValue
          .replace(/[^0-9.-]/g, '') // Remove everything except numbers, dots, and minus
          .replace(/^-+/, '-') // Keep only one minus at start
          .replace(/\.+/g, '.'); // Keep only one decimal point

        const parsed = parseFloat(cleanValue);
        const result = isNaN(parsed) ? 0 : parsed;

        // Debug logging for ALL conversions to catch the problem
        if (originalValue !== result.toString() || originalValue.includes('tonnes') || originalValue.includes('kg') || originalValue.includes('₹') || originalValue.includes('%')) {
          console.log(`🔄 parseNumeric [${fieldName}]: "${originalValue}" -> ${result}`);
        }

        return result;
      };

      // Log the data being inserted
      console.log('📊 Data to be inserted into header table:', {
        po_number: data.po_header.po_number || 'MISSING',
        po_date: data.po_header.po_date || 'MISSING',
        vendor_name: data.po_header.vendor_name || 'MISSING',
        buyer_name: data.po_header.buyer_name || 'MISSING',
        total_items: data.po_header.total_items,
        total_quantity: data.po_header.total_quantity,
        total_amount: data.po_header.total_amount || 'MISSING',
        total_weight: data.po_header.total_weight || 'MISSING',
        total_weight_parsed: parseNumeric(data.po_header.total_weight || '').toString()
      });

      const [insertedHeader] = await tx
        .insert(blinkitPoHeader)
        .values({
          po_number: data.po_header.po_number || '',
          po_date: parsePODate(data.po_header.po_date || ''),
          po_type: data.po_header.po_type || 'PO',
          currency: data.po_header.currency || 'INR',
          buyer_name: data.po_header.buyer_name || '',
          buyer_pan: data.po_header.buyer_pan || '',
          buyer_cin: data.po_header.buyer_cin || '',
          buyer_unit: data.po_header.buyer_unit || '',
          buyer_contact_name: data.po_header.buyer_contact_name || '',
          buyer_contact_phone: data.po_header.buyer_contact_phone || '',
          vendor_no: data.po_header.vendor_no || '',
          vendor_name: data.po_header.vendor_name || '',
          vendor_pan: data.po_header.vendor_pan || '',
          vendor_gst_no: data.po_header.vendor_gst_no || '',
          vendor_registered_address: data.po_header.vendor_registered_address || '',
          vendor_contact_name: data.po_header.vendor_contact_name || '',
          vendor_contact_phone: data.po_header.vendor_contact_phone || '',
          vendor_contact_email: data.po_header.vendor_contact_email || '',
          delivered_by: data.po_header.delivered_by || '',
          delivered_to_company: data.po_header.delivered_to_company || '',
          delivered_to_address: data.po_header.delivered_to_address || '',
          delivered_to_gst_no: data.po_header.delivered_to_gst_no || '',
          spoc_name: data.po_header.spoc_name || '',
          spoc_phone: data.po_header.spoc_phone || '',
          spoc_email: data.po_header.spoc_email || '',
          payment_terms: data.po_header.payment_terms || '',
          po_expiry_date: parsePODate(data.po_header.po_expiry_date || ''),
          po_delivery_date: parsePODate(data.po_header.po_delivery_date || ''),
          total_quantity: data.po_header.total_quantity || 0,
          total_items: data.po_header.total_items || 0,
          total_weight: data.po_header.total_weight || '',
          total_amount: parseNumeric(data.po_header.total_amount || '0', 'header.total_amount'),
          cart_discount: parseNumeric(data.po_header.cart_discount || '0', 'header.cart_discount'),
          net_amount: parseNumeric(data.po_header.net_amount || '0', 'header.net_amount')
        })
        .returning();

      const headerId = insertedHeader.id;
      console.log('✅ Blinkit header inserted with ID:', headerId);

      // Step 2: Insert Blinkit PO Lines with header_id foreign key
      console.log('📝 Inserting', data.po_lines.length, 'lines into blinkit_po_lines...');

      const lineInsertPromises = data.po_lines.map(async (line, index) => {
        // Extra safety: force parseNumeric on ALL potentially numeric fields
        const cleanedLine = {
          header_id: headerId, // Foreign key linking to header
          item_code: line.item_code || '',
          hsn_code: line.hsn_code || '',
          product_upc: line.product_upc || '',
          product_description: line.product_description || '',
          basic_cost_price: parseNumeric(line.basic_cost_price, `line[${index}].basic_cost_price`),
          igst_percent: parseNumeric(line.igst_percent, `line[${index}].igst_percent`),
          cess_percent: parseNumeric(line.cess_percent, `line[${index}].cess_percent`),
          addt_cess: parseNumeric(line.addt_cess, `line[${index}].addt_cess`),
          tax_amount: parseNumeric(line.tax_amount, `line[${index}].tax_amount`),
          landing_rate: parseNumeric(line.landing_rate, `line[${index}].landing_rate`),
          quantity: parseNumeric(line.quantity, `line[${index}].quantity`),
          mrp: parseNumeric(line.mrp, `line[${index}].mrp`),
          margin_percent: parseNumeric(line.margin_percent, `line[${index}].margin_percent`),
          total_amount: parseNumeric(line.total_amount, `line[${index}].total_amount`)
        };

        console.log(`🔍 Line ${index + 1} cleaned data:`, cleanedLine);

        return tx
          .insert(blinkitPoLines)
          .values(cleanedLine);
      });

      // Execute all Blinkit line insertions
      await Promise.all(lineInsertPromises);
      console.log('✅ All', data.po_lines.length, 'Blinkit lines inserted successfully');

      return {
        headerId,
        masterId: headerId, // Return headerId as masterId for compatibility
        success: true,
        message: `Successfully inserted Blinkit PO ${data.po_header.po_number} into blinkit_po_header and blinkit_po_lines with ${data.po_lines.length} line items`
      };
    });

    console.log('🎉 Database transaction completed successfully!');
    return result;

  } catch (error) {
    console.error('❌ Database insertion failed:', error);

    // ENHANCED ERROR DEBUGGING: Log the exact error and problematic data
    if (error instanceof Error && error.message.includes('tonnes')) {
      console.error('🚨 TONNES ERROR DETECTED!');
      console.error('Raw PO Header data:', JSON.stringify(data.po_header, null, 2));
      console.error('Raw PO Lines data:', JSON.stringify(data.po_lines, null, 2));
    }

    // More detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      // Check for specific database constraint errors
      if (error.message.includes('null value') || error.message.includes('NOT NULL')) {
        const fieldMatch = error.message.match(/column "([^"]+)"/);
        const field = fieldMatch ? fieldMatch[1] : 'unknown field';
        return {
          headerId: -1,
          masterId: -1,
          success: false,
          message: `Required field '${field}' is missing or null. Please ensure all required fields are provided.`
        };
      }

      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return {
          headerId: -1,
          masterId: -1,
          success: false,
          message: `This PO number already exists in the database. Duplicate entries are not allowed.`
        };
      }

      if (error.message.includes('foreign key')) {
        return {
          headerId: -1,
          masterId: -1,
          success: false,
          message: `Database relationship error. Please check that all referenced data exists.`
        };
      }
    }

    return {
      headerId: -1,
      masterId: -1,
      success: false,
      message: `Failed to insert Blinkit PO data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get Blinkit PO with all line items by header ID
 */
export async function getBlinkitPoById(headerId: number): Promise<BlinkitPoData | null> {
  try {
    console.log('🔍 Fetching Blinkit PO by ID:', headerId);

    // Get header
    const [header] = await db
      .select()
      .from(blinkitPoHeader)
      .where(blinkitPoHeader.id.eq(headerId))
      .limit(1);

    if (!header) {
      console.log('❌ Header not found for ID:', headerId);
      return null;
    }

    // Get lines
    const lines = await db
      .select()
      .from(blinkitPoLines)
      .where(blinkitPoLines.header_id.eq(headerId));

    console.log('✅ Found Blinkit PO:', {
      po_number: header.po_number,
      total_lines: lines.length
    });

    return {
      po_header: header as any,
      po_lines: lines as any
    };

  } catch (error) {
    console.error('❌ Error fetching Blinkit PO:', error);
    return null;
  }
}

/**
 * Validate extracted data before insertion
 */
export function validateBlinkitPoData(data: BlinkitPoData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate header
  if (!data.po_header.po_number) {
    errors.push('PO Number is required');
  }

  if (!data.po_header.po_date) {
    errors.push('PO Date is required');
  }

  if (!data.po_header.buyer_name) {
    errors.push('Buyer Name is required');
  }

  if (!data.po_header.vendor_name) {
    errors.push('Vendor Name is required');
  }

  // Validate line items
  if (!data.po_lines || data.po_lines.length === 0) {
    errors.push('At least one line item is required');
  }

  for (let i = 0; i < data.po_lines.length; i++) {
    const line = data.po_lines[i];

    if (!line.item_code) {
      errors.push(`Line ${i + 1}: Item Code is required`);
    }

    if (!line.product_description) {
      errors.push(`Line ${i + 1}: Product Description is required`);
    }

    if (line.quantity <= 0) {
      errors.push(`Line ${i + 1}: Quantity must be greater than 0`);
    }

    if (line.total_amount <= 0) {
      errors.push(`Line ${i + 1}: Total Amount must be greater than 0`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get preview data formatted for frontend display
 */
export function formatBlinkitPoForPreview(data: BlinkitPoData) {
  return {
    header: {
      ...data.po_header,
      formatted_total_amount: `₹${parseFloat(data.po_header.total_amount).toLocaleString('en-IN')}`,
      formatted_po_date: new Date(data.po_header.po_date).toLocaleDateString('en-IN')
    },
    lines: data.po_lines.map((line, index) => ({
      ...line,
      line_number: index + 1,
      formatted_total_amount: `₹${line.total_amount.toLocaleString('en-IN')}`,
      formatted_basic_cost_price: `₹${line.basic_cost_price.toLocaleString('en-IN')}`,
      formatted_mrp: `₹${line.mrp.toLocaleString('en-IN')}`
    })),
    summary: {
      total_items: data.po_lines.length,
      total_quantity: data.po_header.total_quantity,
      total_amount: parseFloat(data.po_header.total_amount),
      formatted_total_amount: `₹${parseFloat(data.po_header.total_amount).toLocaleString('en-IN')}`
    }
  };
}

export { BlinkitPoData, BlinkitPoHeader, BlinkitPoLine };