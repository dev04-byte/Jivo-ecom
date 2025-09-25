import { insertBlinkitPoHeaderSchema, insertBlinkitPoLinesSchema } from "@shared/schema";
import type { InsertBlinkitPoHeader, InsertBlinkitPoLines } from "@shared/schema";

// Parse the extracted PDF data from frontend
export function parseBlinkitPDF(pdfData: any, uploadedBy: string): {
  poList: Array<{
    header: InsertBlinkitPoHeader;
    lines: InsertBlinkitPoLines[];
    totalQuantity: number;
    totalAmount: number;
  }>;
} {
  try {
    // Check if the data structure matches our expected Blinkit PDF format
    if (!pdfData || !pdfData.items || !Array.isArray(pdfData.items)) {
      throw new Error('Invalid PDF data structure. Expected items array.');
    }

    const { orderDetails, vendor, buyer, items, summary } = pdfData;

    // Calculate totals for header
    const totalBasicCost = items.reduce((sum, item) => sum + (item.basicCostPrice || 0) * (item.quantity || 0), 0);
    const totalTaxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0) * (item.quantity || 0), 0);
    const totalLandingRate = items.reduce((sum, item) => sum + (item.landingRate || 0) * (item.quantity || 0), 0);
    const uniqueHsnCodes = [...new Set(items.map(item => item.hsnCode).filter(Boolean))];

    // Create header from PDF data matching ACTUAL database schema
    const header: any = {
      // ACTUAL Database columns
      po_number: orderDetails?.poNumber || `BL${Date.now()}`,
      po_date: orderDetails?.date ? (() => {
        const date = parseBlinkitDate(orderDetails.date);
        return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      })() : new Date().toISOString().split('T')[0],
      po_type: orderDetails?.poType || 'PO',
      currency: orderDetails?.currency || 'INR',
      buyer_name: buyer?.company || 'HANDS ON TRADES PRIVATE LIMITED',
      buyer_pan: buyer?.pan || 'AADCH7038R',
      buyer_cin: buyer?.cin || 'U51909DL2015FTC285808',
      buyer_unit: 'Main Unit',
      buyer_contact_name: buyer?.contact || 'Durgesh Giri',
      buyer_contact_phone: buyer?.phone || '+91 9068342018',
      vendor_no: orderDetails?.vendorNo || '1272',
      vendor_name: vendor?.company || 'JIVO MART PRIVATE LIMITED',
      vendor_pan: vendor?.pan || 'AAFCJ4102J',
      vendor_gst_no: vendor?.gst || '07AAFCJ4102J1ZS',
      vendor_registered_address: vendor?.address || 'J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027',
      vendor_contact_name: vendor?.contact || 'TANUJ KESWANI',
      vendor_contact_phone: vendor?.phone || '91-9818805452',
      vendor_contact_email: vendor?.email || 'marketplace@jivo.in',
      delivered_by: vendor?.company || 'JIVO MART PRIVATE LIMITED',
      delivered_to_company: buyer?.company || 'HANDS ON TRADES PRIVATE LIMITED',
      delivered_to_address: buyer?.address || 'Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun',
      delivered_to_gst_no: buyer?.gst || '05AADCH7038R1Z3',
      spoc_name: buyer?.contact || 'Durgesh Giri',
      spoc_phone: buyer?.phone || '+91 9068342018',
      spoc_email: vendor?.email || 'marketplace@jivo.in',
      payment_terms: orderDetails?.paymentTerms || '30 Days',
      po_expiry_date: orderDetails?.expiryDate ? (() => {
        const date = parseBlinkitDate(orderDetails.expiryDate);
        return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      })() : new Date().toISOString().split('T')[0],
      po_delivery_date: orderDetails?.deliveryDate ? (() => {
        const date = parseBlinkitDate(orderDetails.deliveryDate);
        return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      })() : new Date().toISOString().split('T')[0],
      total_quantity: summary?.totalQuantity || items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      total_items: summary?.totalItems || items.length,
      total_weight: summary?.totalWeight ? String(summary.totalWeight) : calculateTotalWeightFromItems(items),
      total_amount: summary?.totalAmount?.toString() || calculateTotalAmountFromItems(items),
      cart_discount: summary?.cartDiscount?.toString() || '0',
      net_amount: summary?.netAmount?.toString() || summary?.totalAmount?.toString() || calculateTotalAmountFromItems(items)
    };

    // Create lines from PDF items matching ACTUAL database schema
    const lines: any[] = items.map((item: any, index: number) => {
      const line: any = {
        // ACTUAL database columns for lines (header_id will be set by backend)
        item_code: item.itemCode || '',
        hsn_code: item.hsnCode || '',
        product_upc: item.productUPC || '',
        product_description: item.productDescription || '',
        basic_cost_price: item.basicCostPrice?.toString() || '0',
        igst_percent: item.igstPercent?.toString() || '0',
        cess_percent: item.cessPercent?.toString() || '0',
        addt_cess: item.addtCess?.toString() || '0', // Note: database uses 'addt_cess'
        tax_amount: item.taxAmount?.toString() || '0',
        landing_rate: item.landingRate?.toString() || '0',
        quantity: item.quantity || 0,
        mrp: item.mrp?.toString() || '0',
        margin_percent: item.marginPercent?.toString() || '0',
        total_amount: item.totalAmount?.toString() || '0'
      };
      return line;
    });

    return {
      poList: [{
        header,
        lines,
        totalQuantity: summary?.totalQuantity || 0,
        totalAmount: summary?.totalAmount || 0
      }]
    };

  } catch (error) {
    console.error('Error parsing Blinkit PDF:', error);
    throw new Error(`Failed to parse Blinkit PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to parse Blinkit date format
function parseBlinkitDate(dateString: string): Date {
  try {
    if (!dateString || typeof dateString !== 'string') {
      console.warn('Invalid date string provided:', dateString);
      return new Date();
    }

    // Handle format like "Sept. 10, 2025, 12:38 p.m."
    let cleanDateString = dateString.trim();

    // Replace common abbreviations
    cleanDateString = cleanDateString
      .replace(/Sept\./g, 'Sep')
      .replace(/Oct\./g, 'Oct')
      .replace(/Nov\./g, 'Nov')
      .replace(/Dec\./g, 'Dec')
      .replace(/Jan\./g, 'Jan')
      .replace(/Feb\./g, 'Feb')
      .replace(/Mar\./g, 'Mar')
      .replace(/Apr\./g, 'Apr')
      .replace(/Jun\./g, 'Jun')
      .replace(/Jul\./g, 'Jul')
      .replace(/Aug\./g, 'Aug');

    // If it contains comma, take only the date part
    if (cleanDateString.includes(',')) {
      const datePart = cleanDateString.split(',')[0].trim();
      cleanDateString = datePart;
    }

    const parsedDate = new Date(cleanDateString);

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn('Could not parse date, using current date:', dateString);
      return new Date();
    }

    return parsedDate;
  } catch (error) {
    console.warn('Error parsing date, using current date:', dateString, error);
    return new Date();
  }
}

// Helper function to extract grammage/size from product description
function extractGrammage(description: string): string {
  if (!description) return '';

  // Look for patterns like "(1 l)", "(2 l)", "(500 ml)", "(250g)", etc.
  const grammaageMatch = description.match(/\(([^)]+)\)$/);
  if (grammaageMatch) {
    return grammaageMatch[1].trim();
  }

  // Alternative patterns
  const altMatch = description.match(/(\d+\s*(?:ml|l|g|kg|gm))/i);
  if (altMatch) {
    return altMatch[1].trim();
  }

  return '';
}

// Helper function to calculate total weight from items
function calculateTotalWeightFromItems(items: any[]): string {
  if (!items || items.length === 0) return '0';

  let totalWeight = 0;

  for (const item of items) {
    const description = item.productDescription || '';

    // Extract weight from product description (e.g., "(2 l)", "(500 ml)", "(1 kg)")
    const weightMatch = description.match(/\(([^)]+)\)$/) || description.match(/(\d+(?:\.\d+)?\s*(?:l|ml|kg|g|gm|litre?s?|gram?s?|kilo?s?))/i);

    if (weightMatch) {
      let weightStr = weightMatch[1].toLowerCase().replace(/[(),]/g, '').trim();
      let weight = parseFloat(weightStr);

      if (!isNaN(weight)) {
        // Convert to grams for consistency
        if (weightStr.includes('kg') || weightStr.includes('kilo')) {
          weight *= 1000; // kg to grams
        } else if (weightStr.includes('l') || weightStr.includes('litre')) {
          weight *= 1000; // assuming liquid density ~1g/ml
        }
        // ml and g are already in base units

        totalWeight += weight * (item.quantity || 1);
      }
    }
  }

  // Convert back to kg for display
  return totalWeight > 0 ? (totalWeight / 1000).toFixed(2) : '0';
}

// Helper function to calculate total amount from items
function calculateTotalAmountFromItems(items: any[]): string {
  if (!items || items.length === 0) return '0';

  let totalAmount = 0;

  for (const item of items) {
    const itemAmount = (item.totalAmount || item.amount || 0);
    const quantity = item.quantity || 1;

    if (typeof itemAmount === 'number') {
      totalAmount += itemAmount;
    } else if (typeof itemAmount === 'string') {
      const parsed = parseFloat(itemAmount.replace(/[^0-9.-]/g, ''));
      if (!isNaN(parsed)) {
        totalAmount += parsed;
      }
    }
  }

  return totalAmount > 0 ? totalAmount.toFixed(2) : '0';
}

// Helper function to validate PDF data structure
export function validateBlinkitPDFData(data: any): boolean {
  try {
    return !!(
      data &&
      data.orderDetails &&
      data.vendor &&
      data.buyer &&
      data.items &&
      Array.isArray(data.items) &&
      data.items.length > 0 &&
      data.summary
    );
  } catch {
    return false;
  }
}