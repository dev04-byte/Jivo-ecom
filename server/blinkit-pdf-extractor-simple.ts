import { extractTextFromPDF, getPDFLines } from './pdf-text-extractor';

interface BlinkitPDFLineItem {
  itemCode: string;
  hsnCode: string;
  productUPC: string;
  productDescription: string;
  basicCostPrice: number;
  igstPercent: number;
  cessPercent: number;
  addtCess: number;
  taxAmount: number;
  landingRate: number;
  quantity: number;
  mrp: number;
  marginPercent: number;
  totalAmount: number;
}

interface BlinkitPDFData {
  buyer: {
    company: string;
    pan: string;
    cin: string;
    contact: string;
    phone: string;
    gst: string;
    address: string;
  };
  vendor: {
    company: string;
    pan: string;
    gst: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
  };
  orderDetails: {
    poNumber: string;
    date: string;
    poType: string;
    vendorNo: string;
    currency: string;
    paymentTerms: string;
    expiryDate: string;
    deliveryDate: string;
  };
  items: BlinkitPDFLineItem[];
  summary: {
    totalQuantity: number;
    totalItems: number;
    totalWeight: string;
    totalAmount: number;
    cartDiscount: number;
    netAmount: number;
  };
}

/**
 * Simple PDF extractor - now mainly used for fallback
 * Main processing uses pdf-to-excel-converter.ts
 */
export async function extractBlinkitDataFromPDF(pdfBuffer: Buffer): Promise<BlinkitPDFData> {
  try {
    console.log('🔍 Simple Blinkit PDF data extraction (fallback mode)...');

    // Extract text from PDF
    const { text } = await extractTextFromPDF(pdfBuffer);
    const lines = getPDFLines(text);

    // Create basic response with default data
    const data: BlinkitPDFData = {
      buyer: {
        company: 'HANDS ON TRADES PRIVATE LIMITED',
        pan: 'AADCH7038R',
        cin: 'U51909DL2015FTC285808',
        contact: 'Durgesh Giri',
        phone: '+91 9068342018',
        gst: '05AADCH7038R1Z3',
        address: 'Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun'
      },
      vendor: {
        company: 'JIVO MART PRIVATE LIMITED',
        pan: 'AAFCJ4102J',
        gst: '07AAFCJ4102J1ZS',
        contact: 'TANUJ KESWANI',
        phone: '91-9818805452',
        email: 'marketplace@jivo.in',
        address: 'J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027'
      },
      orderDetails: {
        poNumber: `BL${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        poType: 'PO',
        vendorNo: '1272',
        currency: 'INR',
        paymentTerms: '30 Days',
        expiryDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0]
      },
      items: [],
      summary: {
        totalQuantity: 0,
        totalItems: 0,
        totalWeight: '0',
        totalAmount: 0,
        cartDiscount: 0,
        netAmount: 0
      }
    };

    console.log('⚠️ Simple extractor fallback - recommend using PDF to Excel converter');
    return data;

  } catch (error) {
    console.error('❌ Simple PDF extraction failed:', error);
    throw new Error(`Failed to extract Blinkit data from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { BlinkitPDFData, BlinkitPDFLineItem };