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
 * Extract structured data from Blinkit PDF
 */
export async function extractBlinkitDataFromPDF(pdfBuffer: Buffer): Promise<BlinkitPDFData> {
  try {
    console.log('🔍 🆕 HOTFIX V3 - Starting Blinkit PDF data extraction...');

    // Extract text from PDF
    const { text } = await extractTextFromPDF(pdfBuffer);
    const lines = getPDFLines(text);

    console.log('📝 Extracted lines:', lines.length);

    // Parse the PDF content
    const extractedData = parseBlinkitPDFContent(lines);

    console.log('✅ Blinkit PDF data extraction completed');
    return extractedData;

  } catch (error) {
    console.error('❌ Blinkit PDF extraction failed:', error);
    throw new Error(`Failed to extract Blinkit data from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse Blinkit PDF content from extracted text lines
 */
function parseBlinkitPDFContent(lines: string[]): BlinkitPDFData {
  console.log('🔍 Parsing Blinkit PDF content...');
  console.log('📝 Total lines to process:', lines.length);

  // Join all lines into one text for better parsing
  const fullText = lines.join(' ');

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
      poNumber: '',
      date: '',
      poType: 'PO',
      vendorNo: '1272',
      currency: 'INR',
      paymentTerms: '30 Days',
      expiryDate: '',
      deliveryDate: ''
    },
    items: [],
    summary: {
      totalQuantity: 0,
      totalItems: 0,
      totalWeight: '',
      totalAmount: 0,
      cartDiscount: 0,
      netAmount: 0
    }
  };

  // Extract PO Number with more patterns
  const poPatterns = [
    /P\.O\.\s*Number\s*:\s*(\d+)/i,
    /PO\s*Number\s*:\s*(\d+)/i,
    /Purchase\s*Order\s*:\s*(\d+)/i
  ];

  for (const pattern of poPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      data.orderDetails.poNumber = match[1];
      console.log('📋 Found PO Number:', data.orderDetails.poNumber);
      break;
    }
  }

  // Extract Date
  const datePattern = /Date\s*:\s*([^,\n]+?)(?:\s*PO Type|$)/i;
  const dateMatch = fullText.match(datePattern);
  if (dateMatch) {
    data.orderDetails.date = dateMatch[1].trim();
    console.log('📅 Found Date:', data.orderDetails.date);
  }

  // Extract Vendor details
  if (fullText.includes('JIVO MART')) {
    data.vendor.company = 'JIVO MART PRIVATE LIMITED';
    data.vendor.pan = 'AAFCJ4102J';
    data.vendor.gst = '07AAFCJ4102J1ZS';
    console.log('🏢 Found Vendor:', data.vendor.company);
  }

  // Extract Buyer details
  if (fullText.includes('HANDS ON TRADES')) {
    data.buyer.company = 'HANDS ON TRADES PRIVATE LIMITED';
    data.buyer.pan = 'AADCH7038R';
    data.buyer.cin = 'U51909DL2015FTC285808';
    console.log('🏢 Found Buyer:', data.buyer.company);
  }

  // Extract Contact Information
  const emailMatch = fullText.match(/([\w\.-]+@[\w\.-]+\.\w+)/);
  if (emailMatch) {
    data.vendor.email = emailMatch[1];
  }

  // Extract line items using simplified and robust approach
  console.log('📊 Extracting line items from PDF text...');

  // Try multiple extraction strategies
  data.items = extractItemsRobust(lines, fullText);
  console.log('📦 Successfully extracted', data.items.length, 'items from PDF');

  // Extract summary totals with more flexible patterns
  const totalQtyMatch = fullText.match(/Total\s+Quantity[:\s]*(\d+)/i);
  if (totalQtyMatch) {
    data.summary.totalQuantity = parseInt(totalQtyMatch[1]);
    console.log('📊 Found Total Quantity:', data.summary.totalQuantity);
  }

  const totalAmountMatch = fullText.match(/Total\s+Amount[:\s]*([\d,]+\.?\d*)/i);
  if (totalAmountMatch) {
    data.summary.totalAmount = parseFloat(totalAmountMatch[1].replace(/,/g, ''));
    data.summary.netAmount = data.summary.totalAmount;
    console.log('💰 Found Total Amount:', data.summary.totalAmount);
  }

  // Try multiple patterns for total weight
  const totalWeightPatterns = [
    /Total\s+weight[:\s]*([^\n\r]+)/i,
    /Total\s+Weight[:\s]*([^\n\r]+)/i,
    /weight[:\s]*([0-9.]+\s*(?:kg|g|gm|grams?|kilos?|kgs?))/i,
    /Weight[:\s]*([0-9.]+\s*(?:kg|g|gm|grams?|kilos?|kgs?))/i
  ];

  for (const pattern of totalWeightPatterns) {
    const weightMatch = fullText.match(pattern);
    if (weightMatch) {
      data.summary.totalWeight = weightMatch[1].trim();
      console.log('⚖️ Found Total Weight:', data.summary.totalWeight);
      break;
    }
  }

  // Calculate missing values from items if available
  if (data.items.length > 0) {
    console.log('📊 Calculating totals from extracted items...');

    // Always recalculate from actual items for accuracy
    data.summary.totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
    data.summary.totalAmount = data.items.reduce((sum, item) => sum + item.totalAmount, 0);
    data.summary.netAmount = data.summary.totalAmount;
    data.summary.totalItems = data.items.length;

    console.log('✅ Calculated totals from items:', {
      totalItems: data.summary.totalItems,
      totalQuantity: data.summary.totalQuantity,
      totalAmount: data.summary.totalAmount
    });
  } else {
    console.log('⚠️ No items found during extraction, using fallback totals from PDF text');
    // Try multiple patterns to find total items
    const totalItemsPatterns = [
      /Total\s+Items[:\s]*(\d+)/i,
      /Total\s+item[s]?[:\s]*(\d+)/i,
      /Item[s]?\s*count[:\s]*(\d+)/i,
      /Number\s+of\s+items[:\s]*(\d+)/i
    ];

    for (const pattern of totalItemsPatterns) {
      const itemsMatch = fullText.match(pattern);
      if (itemsMatch) {
        data.summary.totalItems = parseInt(itemsMatch[1]);
        console.log('📊 Found Total Items from text:', data.summary.totalItems);
        break;
      }
    }

    // If still no total items found, try counting based on item codes in text
    if (data.summary.totalItems === 0) {
      const itemCodes = fullText.match(/(10\d{6,7})/g);
      if (itemCodes) {
        const uniqueItemCodes = [...new Set(itemCodes)];
        data.summary.totalItems = uniqueItemCodes.length;
        console.log('📊 Estimated Total Items from unique item codes:', data.summary.totalItems);
      }
    }
  }

  // Fill in default values if not extracted
  if (!data.orderDetails.poNumber) {
    data.orderDetails.poNumber = `BL${Date.now()}`;
  }

  if (!data.orderDetails.date) {
    data.orderDetails.date = new Date().toISOString().split('T')[0];
  }

  console.log('✅ Parsing completed. Found:', {
    poNumber: data.orderDetails.poNumber,
    items: data.items.length,
    totalAmount: data.summary.totalAmount,
    totalQuantity: data.summary.totalQuantity,
    itemDetails: data.items.length > 0 ? data.items.map(item => ({
      itemCode: item.itemCode,
      description: item.productDescription.substring(0, 30),
      quantity: item.quantity,
      totalAmount: item.totalAmount
    })) : 'No items extracted'
  });

  return data;
}

/**
 * Robust item extraction that combines multiple strategies
 */
function extractItemsRobust(lines: string[], fullText: string): BlinkitPDFLineItem[] {
  console.log('🔍 Starting robust item extraction...');

  let items: BlinkitPDFLineItem[] = [];

  // Strategy 1: Look for table structure in lines
  items = extractFromTableStructure(lines);
  if (items.length > 0) {
    console.log('✅ Strategy 1 (Table Structure) found', items.length, 'items');
    return items;
  }

  // Strategy 2: Pattern matching in full text
  items = extractWithPatternMatching(fullText);
  if (items.length > 0) {
    console.log('✅ Strategy 2 (Pattern Matching) found', items.length, 'items');
    return items;
  }

  // Strategy 3: Line-by-line analysis
  items = extractLineByLine(lines);
  if (items.length > 0) {
    console.log('✅ Strategy 3 (Line by Line) found', items.length, 'items');
    return items;
  }

  console.log('⚠️ All extraction strategies failed, returning empty items');
  return [];
}

/**
 * Extract items from table structure in lines
 */
function extractFromTableStructure(lines: string[]): BlinkitPDFLineItem[] {
  console.log('🔍 Extracting from table structure...');
  const items: BlinkitPDFLineItem[] = [];

  let inItemsSection = false;
  let tableHeaderFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Look for table header
    if ((line.includes('Item Code') && line.includes('HSN')) ||
        (line.includes('#') && line.includes('Item') && line.includes('Code'))) {
      tableHeaderFound = true;
      inItemsSection = true;
      console.log('📍 Found table header at line', i);
      continue;
    }

    // Stop at summary
    if (line.includes('Total Quantity') || line.includes('Total Amount') ||
        line.includes('Grand Total') || line.includes('Sub Total')) {
      inItemsSection = false;
      console.log('📍 Reached summary section at line', i);
      break;
    }

    // If we're in items section, try to extract item
    if (inItemsSection && tableHeaderFound) {
      const item = parseItemFromLineLegacy(line);
      if (item) {
        items.push(item);
        console.log(`✅ Extracted item ${items.length}: ${item.itemCode} - ${item.productDescription?.substring(0, 30)}`);
      }
    }
  }

  return items;
}

/**
 * Extract items using pattern matching on full text
 */
function extractWithPatternMatching(text: string): BlinkitPDFLineItem[] {
  console.log('🔍 Extracting with pattern matching...');
  const items: BlinkitPDFLineItem[] = [];

  // More precise patterns for Blinkit PDFs
  const patterns = [
    // Pattern for complete row: line# itemCode HSN UPC description ... numbers
    /(\d+)\s+(10\d{6,7})\s+(\d{8})\s+(\d{10,15})\s+([A-Za-z][^0-9]+?)\s+((?:\d+\.?\d*\s*){10,})/g,

    // Simplified pattern: itemCode followed by description and numbers
    /(10\d{6,7})\s+(\d{8})\s+(\d{10,15})\s+([A-Za-z][^0-9]+?)\s+((?:\d+\.?\d*\s*){8,})/g
  ];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const item = createItemFromPatternMatch(match);
      if (item && item.quantity > 0) {
        items.push(item);
        console.log(`✅ Pattern matched item ${items.length}: ${item.itemCode} - ${item.productDescription?.substring(0, 30)}`);
      }

      if (items.length > 20) break; // Prevent infinite loops
    }

    if (items.length > 0) break; // Stop if we found items
  }

  return items;
}

/**
 * Create item from pattern match
 */
function createItemFromPatternMatch(match: RegExpMatchArray): BlinkitPDFLineItem | null {
  try {
    console.log('🔍 Processing pattern match with', match.length, 'groups');

    let itemCode, hsnCode, productUPC, description, numbersStr;

    if (match.length >= 6) {
      // Full pattern match
      if (match[1] && /^\d+$/.test(match[1])) {
        // Has line number
        itemCode = match[2];
        hsnCode = match[3];
        productUPC = match[4];
        description = match[5];
        numbersStr = match[6];
      } else {
        // No line number
        itemCode = match[1];
        hsnCode = match[2];
        productUPC = match[3];
        description = match[4];
        numbersStr = match[5];
      }
    } else {
      return null;
    }

    // Extract numbers from the numbers string
    const numbers = numbersStr.match(/\d+\.?\d*/g)?.map(n => parseFloat(n)) || [];

    if (numbers.length < 8) {
      console.log('⚠️ Not enough numbers found:', numbers.length);
      return null;
    }

    // Find quantity (usually an integer in the middle-to-end of numbers array)
    let quantity = 0;
    for (let i = Math.max(0, numbers.length - 6); i < numbers.length; i++) {
      if (Number.isInteger(numbers[i]) && numbers[i] > 0 && numbers[i] < 1000) {
        quantity = numbers[i];
        break;
      }
    }

    if (quantity === 0) {
      console.log('⚠️ Could not find valid quantity');
      return null;
    }

    // Total amount is usually the largest number or last number
    const totalAmount = numbers[numbers.length - 1] || Math.max(...numbers.filter(n => n > 50));

    const item: BlinkitPDFLineItem = {
      itemCode: itemCode,
      hsnCode: hsnCode,
      productUPC: productUPC,
      productDescription: description.trim(),
      basicCostPrice: numbers[0] || 0,
      igstPercent: numbers[1] || 5.0,
      cessPercent: numbers[2] || 0,
      addtCess: numbers[3] || 0,
      taxAmount: numbers[4] || 0,
      landingRate: numbers[5] || 0,
      quantity: quantity,
      mrp: numbers[numbers.length - 3] || 0,
      marginPercent: numbers[numbers.length - 2] || 0,
      totalAmount: totalAmount
    };

    return item;

  } catch (error) {
    console.warn('⚠️ Failed to create item from pattern match:', error);
    return null;
  }
}

/**
 * Extract items line by line (fallback method)
 */
function extractLineByLine(lines: string[]): BlinkitPDFLineItem[] {
  console.log('🔍 Extracting line by line...');
  const items: BlinkitPDFLineItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Look for lines that might contain item data
    if (containsItemCode(line) && containsProductInfo(line)) {
      const item = parseItemFromLineLegacy(line);
      if (item) {
        items.push(item);
        console.log(`✅ Line-by-line extracted item ${items.length}: ${item.itemCode} - ${item.productDescription?.substring(0, 30)}`);
      }
    }
  }

  return items;
}

/**
 * Check if line contains item code
 */
function containsItemCode(line: string): boolean {
  return /\b10\d{6,7}\b/.test(line);
}

/**
 * Check if line contains product information
 */
function containsProductInfo(line: string): boolean {
  return /(?:Jivo|Oil|Olive|Extra|Virgin|Light|Pomace)/i.test(line) ||
         (line.match(/\d+\.?\d*/g) || []).length >= 5;
}

/**
 * Parse item from a single line (improved version)
 */
function parseItemFromLineLegacy(line: string): BlinkitPDFLineItem | null {
  try {
    console.log('🔍 Parsing line:', line.substring(0, 100) + '...');

    // Clean the line
    const cleanLine = line.replace(/\s+/g, ' ').trim();

    // Find item code
    const itemCodeMatch = cleanLine.match(/\b(10\d{6,7})\b/);
    if (!itemCodeMatch) {
      console.log('⚠️ No item code found');
      return null;
    }

    const itemCode = itemCodeMatch[1];
    const itemCodePos = cleanLine.indexOf(itemCode);

    // Extract HSN code (usually 8 digits after item code)
    const afterItemCode = cleanLine.substring(itemCodePos + itemCode.length);
    const hsnMatch = afterItemCode.match(/\b(\d{8})\b/);
    const hsnCode = hsnMatch ? hsnMatch[1] : '';

    // Extract UPC (usually 10-15 digits after HSN)
    const upcMatch = afterItemCode.match(/\b(\d{10,15})\b/);
    const productUPC = upcMatch ? upcMatch[1] : '';

    // Extract description (text between codes and first decimal number)
    let description = '';
    const descMatch = cleanLine.match(new RegExp(`${itemCode}\\s+(?:\\d+\\s+){0,2}([A-Za-z][^0-9]*?)\\s+\\d+\\.?\\d*`));
    if (descMatch) {
      description = descMatch[1].trim();
    }

    // Extract all numbers
    const numbers = cleanLine.match(/\d+\.?\d*/g)?.map(n => parseFloat(n)) || [];

    if (numbers.length < 6) {
      console.log('⚠️ Not enough numbers found');
      return null;
    }

    // Find quantity (integer in the range 1-999)
    let quantity = 0;
    for (const num of numbers) {
      if (Number.isInteger(num) && num > 0 && num < 1000) {
        quantity = num;
        break;
      }
    }

    if (quantity === 0) {
      console.log('⚠️ Could not find quantity');
      return null;
    }

    // Total amount is usually the largest number
    const totalAmount = Math.max(...numbers.filter(n => n > 50));

    const item: BlinkitPDFLineItem = {
      itemCode: itemCode,
      hsnCode: hsnCode,
      productUPC: productUPC,
      productDescription: description || 'Unknown Product',
      basicCostPrice: numbers[0] || 0,
      igstPercent: 5.0, // Default
      cessPercent: 0,
      addtCess: 0,
      taxAmount: 0,
      landingRate: totalAmount / quantity,
      quantity: quantity,
      mrp: totalAmount / quantity * 2.5, // Estimate
      marginPercent: 60.0, // Default
      totalAmount: totalAmount
    };

    console.log(`✅ Successfully parsed: ${item.itemCode} - ${item.productDescription?.substring(0, 30)} (Qty: ${item.quantity}, Total: ${item.totalAmount})`);
    return item;

  } catch (error) {
    console.warn('⚠️ Failed to parse line:', error);
    return null;
  }
}

// Legacy functions removed - using PDF to Excel converter instead
// This file is kept for backward compatibility but the main processing
// now uses pdf-to-excel-converter.ts for better structure and accuracy

/**
 * Extract items directly from concatenated PDF text
 */
function extractItemsDirectly(text: string): BlinkitPDFLineItem[] {
  const items: BlinkitPDFLineItem[] = [];

  console.log('🔍 Starting intelligent item extraction from PDF text...');
  console.log('📄 Processing text length:', text.length);

  // Look for any item codes in the text (typically start with 10)
  const itemCodePattern = /(10\d{6})/g;
  const foundItemCodes = text.match(itemCodePattern);

  if (foundItemCodes) {
    console.log('🎯 Found potential item codes:', foundItemCodes);
  }

  // Try improved regex patterns to match actual Blinkit PDF table structure
  console.log('🔍 Trying improved regex patterns for Blinkit PDF structure...');

  // Common Blinkit PDF patterns - more specific and accurate
  const blinkitPatterns = [
    // Pattern 1: Full line with all columns
    // Example: "1 10153585 15099090 8908002584002 Jivo Extra Light Olive Oil (2 l) 954.29 5.00 0.00 0.00 47.71 1002.00 20 2799.00 64.20 20040.00"
    /(\d+)\s+(10\d{6,7})\s+(\d{8})\s+(\d{10,13})\s+(.*?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g,

    // Pattern 2: Simplified with item code and product name
    // Example: "10153585 Jivo Extra Light Olive Oil (2 l) 20 20040.00"
    /(10\d{6,7})\s+(Jivo[^0-9]+(?:\([^)]+\))?)\s+(\d+)\s+([\d,]+\.?\d*)/g,

    // Pattern 3: Even more flexible for any product structure
    /(10\d{6,7})\s+.*?([A-Za-z].*?(?:\([^)]*\))?)\s+.*?(\d+)\s+.*?([\d,]+\.?\d*)/g
  ];

  for (const pattern of blinkitPatterns) {
    console.log('🔍 Trying pattern:', pattern.source.substring(0, 50) + '...');

    let match;
    pattern.lastIndex = 0; // Reset regex
    let patternMatches = 0;

    while ((match = pattern.exec(text)) !== null) {
      patternMatches++;
      console.log('🎯 Pattern found match', patternMatches + ':', match[0].substring(0, 100));

      const item = createBlinkitItemFromMatch(match);
      if (item && item.quantity > 0) {
        items.push(item);
        console.log('✅ Successfully extracted item:', {
          itemCode: item.itemCode,
          description: item.productDescription?.substring(0, 30),
          quantity: item.quantity,
          totalAmount: item.totalAmount
        });
      }

      // Prevent infinite loops
      if (items.length > 50 || patternMatches > 100) break;
    }

    console.log(`📊 Pattern found ${patternMatches} matches, extracted ${items.length} valid items`);

    // If we found items with this pattern, we can stop
    if (items.length > 0) {
      console.log(`✅ Pattern successful, stopping further pattern attempts`);
      break;
    }
  }

  console.log(`🔍 Direct extraction completed. Found ${items.length} items total.`);
  return items;
}


/**
 * Create Blinkit item from regex match with improved field mapping
 */
function createBlinkitItemFromMatch(match: RegExpMatchArray): BlinkitPDFLineItem | null {
  try {
    console.log('🔍 Processing match with', match.length, 'groups');

    // Pattern 1: Full table row (16 groups)
    if (match.length >= 16) {
      const item: BlinkitPDFLineItem = {
        itemCode: match[2],
        hsnCode: match[3],
        productUPC: match[4],
        productDescription: match[5]?.trim() || '',
        basicCostPrice: parseFloat(match[6]) || 0,
        igstPercent: parseFloat(match[7]) || 0,
        cessPercent: parseFloat(match[8]) || 0,
        addtCess: parseFloat(match[9]) || 0,
        taxAmount: parseFloat(match[10]) || 0,
        landingRate: parseFloat(match[11]) || 0,
        quantity: parseInt(match[12]) || 0,
        mrp: parseFloat(match[13]) || 0,
        marginPercent: parseFloat(match[14]) || 0,
        totalAmount: parseFloat(match[15]) || 0
      };

      console.log('📊 Created full item from pattern 1:', {
        itemCode: item.itemCode,
        description: item.productDescription?.substring(0, 30),
        quantity: item.quantity,
        totalAmount: item.totalAmount
      });

      return item.quantity > 0 ? item : null;
    }

    // Pattern 2: Simplified format (5 groups)
    else if (match.length >= 5) {
      const totalAmount = parseFloat(match[4]?.replace(/,/g, '')) || 0;
      const quantity = parseInt(match[3]) || 0;

      const item: BlinkitPDFLineItem = {
        itemCode: match[1],
        hsnCode: '15099090', // Default HSN for oil products
        productUPC: '',
        productDescription: match[2]?.trim() || '',
        basicCostPrice: totalAmount / Math.max(quantity, 1) * 0.95, // Estimate basic cost
        igstPercent: 5.0,
        cessPercent: 0,
        addtCess: 0,
        taxAmount: totalAmount * 0.05, // Estimate tax
        landingRate: totalAmount / Math.max(quantity, 1),
        quantity: quantity,
        mrp: totalAmount / Math.max(quantity, 1) * 2.5, // Estimate MRP
        marginPercent: 60.0, // Default margin
        totalAmount: totalAmount
      };

      console.log('📊 Created simplified item from pattern 2:', {
        itemCode: item.itemCode,
        description: item.productDescription?.substring(0, 30),
        quantity: item.quantity,
        totalAmount: item.totalAmount
      });

      return item.quantity > 0 ? item : null;
    }

    console.log('⚠️ Match does not fit any expected pattern');
    return null;

  } catch (error) {
    console.warn('⚠️ Failed to create item from match:', error);
    return null;
  }
}

/**
 * Create item from regex match
 */
function createItemFromMatch(match: RegExpMatchArray, pattern: RegExp): BlinkitPDFLineItem | null {
  try {
    // Pattern 1: Full table row format
    if (match.length >= 15) {
      return {
        itemCode: match[2],
        hsnCode: match[3],
        productUPC: match[4],
        productDescription: match[5]?.trim() || '',
        basicCostPrice: parseFloat(match[6]) || 0,
        igstPercent: parseFloat(match[7]) || 0,
        cessPercent: parseFloat(match[8]) || 0,
        addtCess: parseFloat(match[9]) || 0,
        taxAmount: parseFloat(match[10]) || 0,
        landingRate: parseFloat(match[11]) || 0,
        quantity: parseInt(match[12]) || 0,
        mrp: parseFloat(match[13]) || 0,
        marginPercent: parseFloat(match[14]) || 0,
        totalAmount: parseFloat(match[15]) || 0
      };
    }
    // Pattern 2: Condensed format
    else if (match.length >= 4) {
      const totalAmount = parseFloat(match[4]?.replace(/,/g, '')) || 0;
      return {
        itemCode: match[1],
        hsnCode: '15099090', // Default for olive oil products
        productUPC: '',
        productDescription: match[2]?.trim() || '',
        basicCostPrice: 0,
        igstPercent: 5,
        cessPercent: 0,
        addtCess: 0,
        taxAmount: 0,
        landingRate: 0,
        quantity: parseInt(match[3]) || 0,
        mrp: 0,
        marginPercent: 0,
        totalAmount: totalAmount
      };
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Failed to create item from match:', error);
    return null;
  }
}

/**
 * Advanced parsing for item lines with better field detection
 */
function parseItemLineAdvanced(line: string): BlinkitPDFLineItem | null {
  try {
    console.log('🔍 Parsing line:', line);

    // Clean the line and split by spaces
    const cleanLine = line.trim().replace(/\s+/g, ' ');
    const parts = cleanLine.split(' ');

    if (parts.length < 15) {
      console.log('⚠️ Line too short, skipping:', parts.length, 'parts');
      return null;
    }

    // Find the pattern: lineNum + itemCode + hsn + upc + description + values
    let itemCode = '';
    let hsnCode = '';
    let productUPC = '';
    let description = '';
    let values: number[] = [];

    // Look for 8-digit item code (like 10153585)
    let itemCodeIndex = -1;
    for (let i = 1; i < parts.length; i++) {
      if (/^\d{8}$/.test(parts[i])) {
        itemCode = parts[i];
        itemCodeIndex = i;
        break;
      }
    }

    if (itemCodeIndex === -1) {
      console.log('⚠️ No item code found');
      return null;
    }

    // HSN code should be next (8 digits like 15099090)
    if (itemCodeIndex + 1 < parts.length && /^\d{8}$/.test(parts[itemCodeIndex + 1])) {
      hsnCode = parts[itemCodeIndex + 1];
    }

    // UPC should be next (long number like 8908002584002)
    if (itemCodeIndex + 2 < parts.length && /^\d{10,}$/.test(parts[itemCodeIndex + 2])) {
      productUPC = parts[itemCodeIndex + 2];
    }

    // Description is between UPC and first decimal number
    let descStartIndex = itemCodeIndex + 3;
    let descEndIndex = descStartIndex;

    // Find where description ends (first decimal number)
    for (let i = descStartIndex; i < parts.length; i++) {
      if (/^\d+\.\d+$/.test(parts[i])) {
        descEndIndex = i;
        break;
      }
    }

    if (descEndIndex > descStartIndex) {
      description = parts.slice(descStartIndex, descEndIndex).join(' ');
    }

    // Extract all numeric values from the end
    for (let i = descEndIndex; i < parts.length; i++) {
      const num = parseFloat(parts[i]);
      if (!isNaN(num)) {
        values.push(num);
      }
    }

    console.log('🔍 Extracted:', { itemCode, hsnCode, description: description.substring(0, 30), valuesCount: values.length });

    // We expect at least 11 numeric values
    if (values.length < 11) {
      console.log('⚠️ Not enough numeric values:', values.length);
      return null;
    }

    // Map the values to the correct fields
    // Expected order: basicCost, igst%, cess%, addtCess, taxAmt, landingRate, qty, mrp, margin%, totalAmt
    const item: BlinkitPDFLineItem = {
      itemCode,
      hsnCode,
      productUPC,
      productDescription: description.trim(),
      basicCostPrice: values[0] || 0,
      igstPercent: values[1] || 0,
      cessPercent: values[2] || 0,
      addtCess: values[3] || 0,
      taxAmount: values[4] || 0,
      landingRate: values[5] || 0,
      quantity: Math.floor(values[6]) || 0,
      mrp: values[7] || 0,
      marginPercent: values[8] || 0,
      totalAmount: values[9] || 0
    };

    console.log('✅ Successfully parsed item:', item.itemCode, '-', item.productDescription?.substring(0, 30));
    return item;

  } catch (error) {
    console.warn('⚠️ Failed to parse item line:', error);
    return null;
  }
}