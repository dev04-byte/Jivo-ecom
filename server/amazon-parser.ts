import XLSX from 'xlsx';
import type { InsertAmazonPoHeader, InsertAmazonPoLines } from '@shared/schema';

interface ParsedAmazonPO {
  header: InsertAmazonPoHeader;
  lines: InsertAmazonPoLines[];
}

export function parseAmazonPO(fileBuffer: Buffer, uploadedBy: string): ParsedAmazonPO {
  try {
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '',
      range: 0,
      raw: false,
      dateNF: 'yyyy-mm-dd'
    }) as any[][];

    console.log('🔍 Amazon PO Parser: Processing', jsonData.length, 'rows');
    console.log('📋 First few rows preview:');
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      if (jsonData[i] && jsonData[i].length > 0) {
        console.log(`Row ${i}:`, jsonData[i].slice(0, 5).map(cell => cell ? cell.toString().substring(0, 30) : 'empty'));
      }
    }

    // Initialize header variables
    let poNumber = '';
    let poDate: Date | null = null;
    let deliveryDate: Date | null = null;
    let vendorCode = '';
    let vendorName = '';
    let vendorAddress = '';
    let vendorGstin = '';
    let shipToLocation = '';
    let shipToAddress = '';
    let shipToGstin = '';
    let billToLocation = '';
    let billToAddress = '';
    let billToGstin = '';
    let paymentTerms = '';
    let currency = 'INR';

    // Extract header information from the first rows
    for (let i = 0; i < Math.min(30, jsonData.length); i++) {
      const row = jsonData[i];
      if (!row) continue;

      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (!cell) continue;
        
        const cellStr = cell.toString().trim().toLowerCase();
        
        // Extract PO Number
        if (cellStr.includes('po number') || cellStr.includes('order number') || cellStr.includes('purchase order')) {
          for (let k = j + 1; k < Math.min(j + 5, row.length); k++) {
            if (row[k] && row[k].toString().trim()) {
              poNumber = row[k].toString().trim();
              console.log('✅ Found PO Number:', poNumber);
              break;
            }
          }
        }
        
        // Extract PO Date
        if (cellStr.includes('po date') || cellStr.includes('order date')) {
          for (let k = j + 1; k < Math.min(j + 5, row.length); k++) {
            if (row[k] && row[k].toString().trim()) {
              poDate = parseDate(row[k].toString().trim());
              console.log('✅ Found PO Date:', poDate);
              break;
            }
          }
        }

        // Extract Delivery Date
        if (cellStr.includes('delivery date') || cellStr.includes('expected delivery')) {
          for (let k = j + 1; k < Math.min(j + 5, row.length); k++) {
            if (row[k] && row[k].toString().trim()) {
              deliveryDate = parseDate(row[k].toString().trim());
              console.log('✅ Found Delivery Date:', deliveryDate);
              break;
            }
          }
        }

        // Extract Vendor Information
        if (cellStr.includes('vendor') || cellStr.includes('supplier')) {
          // Look in the next few rows for vendor details
          for (let nextRow = i; nextRow < Math.min(i + 5, jsonData.length); nextRow++) {
            const searchRow = jsonData[nextRow];
            if (searchRow) {
              for (let k = 0; k < searchRow.length; k++) {
                const value = searchRow[k]?.toString().trim();
                if (value && !vendorName && !value.includes(':') && value.length > 3) {
                  vendorName = value;
                  // Try to find address in next cell or row
                  if (searchRow[k + 1]) {
                    vendorAddress = searchRow[k + 1].toString().trim();
                  }
                  // Try to find GSTIN
                  for (let g = k; g < searchRow.length; g++) {
                    const gstCheck = searchRow[g]?.toString().trim();
                    if (gstCheck && gstCheck.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) {
                      vendorGstin = gstCheck;
                      break;
                    }
                  }
                  break;
                }
              }
              if (vendorName) break;
            }
          }
        }

        // Extract Ship To Address
        if (cellStr.includes('ship to') || cellStr.includes('delivery address')) {
          for (let nextRow = i; nextRow < Math.min(i + 3, jsonData.length); nextRow++) {
            const searchRow = jsonData[nextRow];
            if (searchRow) {
              for (let k = j; k < searchRow.length; k++) {
                const value = searchRow[k]?.toString().trim();
                if (value && !value.includes(':') && value.length > 5) {
                  if (!shipToLocation) {
                    shipToLocation = value;
                  } else if (!shipToAddress) {
                    shipToAddress = value;
                  }
                }
              }
            }
          }
        }

        // Extract Bill To Address  
        if (cellStr.includes('bill to') || cellStr.includes('billing address')) {
          for (let nextRow = i; nextRow < Math.min(i + 3, jsonData.length); nextRow++) {
            const searchRow = jsonData[nextRow];
            if (searchRow) {
              for (let k = j; k < searchRow.length; k++) {
                const value = searchRow[k]?.toString().trim();
                if (value && !value.includes(':') && value.length > 5) {
                  if (!billToLocation) {
                    billToLocation = value;
                  } else if (!billToAddress) {
                    billToAddress = value;
                  }
                }
              }
            }
          }
        }

        // Extract Payment Terms
        if (cellStr.includes('payment terms') || cellStr.includes('payment')) {
          for (let k = j + 1; k < Math.min(j + 5, row.length); k++) {
            if (row[k] && row[k].toString().trim()) {
              paymentTerms = row[k].toString().trim();
              break;
            }
          }
        }
      }
    }

    // Find the item data section - look for specific Amazon inventory headers
    let itemDataStartRow = -1;
    let columnMapping: { [key: string]: number } = {};
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row) continue;
      
      // Check for different Amazon file formats
      let hasASIN = false;
      let hasProductTitle = false;
      let hasBrand = false;
      let hasPONumber = false;
      let hasPlatform = false;
      let hasStatus = false;
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j]?.toString().trim();
        
        // Amazon inventory format headers
        if (cell === 'ASIN') {
          columnMapping['asin'] = j;
          hasASIN = true;
        }
        if (cell === 'Product Title') {
          columnMapping['item_name'] = j;
          hasProductTitle = true;
        }
        if (cell === 'Brand') {
          columnMapping['brand'] = j;
          hasBrand = true;
        }
        
        // Amazon PO format headers (your actual file format)
        if (cell === 'External Id') {
          columnMapping['external_id'] = j;
        }
        if (cell === 'External Id Type') {
          columnMapping['external_id_type'] = j;
        }
        if (cell === 'Model Number') {
          columnMapping['model_number'] = j;
        }
        if (cell === 'Title') {
          columnMapping['item_name'] = j;
          hasProductTitle = true;
        }
        if (cell === 'Window Type') {
          columnMapping['window_type'] = j;
        }
        if (cell === 'Expected date') {
          columnMapping['delivery_date'] = j;
        }
        if (cell === 'Quantity Requested') {
          columnMapping['quantity'] = j;
        }
        if (cell === 'Unit Cost') {
          columnMapping['unit_price'] = j;
        }
        if (cell === 'Total cost') {
          columnMapping['line_total'] = j;
        }
        if (cell === 'Sellable On Hand Units') {
          columnMapping['quantity'] = j;
        }
        if (cell === 'Sellable On-Hand Inventory') {
          columnMapping['unit_price'] = j;
        }
        if (cell === 'Unfilled Customer Ordered Units') {
          columnMapping['external_id_type'] = j;
        }
        
        // PO summary format headers
        if (cell === 'PO Number') {
          columnMapping['po_number'] = j;
          hasPONumber = true;
        }
        if (cell === 'Platform') {
          columnMapping['platform'] = j;
          hasPlatform = true;
        }
        if (cell === 'Status') {
          columnMapping['status'] = j;
          hasStatus = true;
        }
        if (cell === 'Order Date') {
          columnMapping['order_date'] = j;
        }
        if (cell === 'Expiry Date') {
          columnMapping['expiry_date'] = j;
        }
        if (cell === 'City') {
          columnMapping['city'] = j;
        }
        if (cell === 'State') {
          columnMapping['state'] = j;
        }
        if (cell === 'Location') {
          columnMapping['location'] = j;
        }
        if (cell === 'Distributor') {
          columnMapping['distributor'] = j;
        }
        if (cell === 'Total Items') {
          columnMapping['total_items'] = j;
        }
        if (cell === 'Total Quantity') {
          columnMapping['total_quantity'] = j;
        }
        if (cell === 'Total Value') {
          columnMapping['total_value'] = j;
        }
        
        // Traditional PO headers (fallback for actual PO files)
        const cellLower = cell.toLowerCase();
        if (cellLower.includes('external') && cellLower.includes('id') && !cellLower.includes('type')) {
          columnMapping['external_id'] = j;
        }
        if (cellLower.includes('model') && cellLower.includes('number')) {
          columnMapping['model_number'] = j;
        }
        if (cellLower.includes('expected') && cellLower.includes('date')) {
          columnMapping['delivery_date'] = j;
        }
        if (cellLower.includes('window') && cellLower.includes('type')) {
          columnMapping['window_type'] = j;
        }
        if (cellLower.includes('unit') && cellLower.includes('cost')) {
          columnMapping['unit_price'] = j;
        }
        if (cellLower.includes('total') && cellLower.includes('cost')) {
          columnMapping['line_total'] = j;
        }
        if (cellLower.includes('quantity') && (cellLower.includes('requested') || cellLower.includes('accepted') || cellLower.includes('received'))) {
          if (!columnMapping['quantity']) columnMapping['quantity'] = j;
        }
      }
      
      // If we found Amazon inventory headers or at least ASIN, use this row
      if (hasASIN && (hasProductTitle || hasBrand)) {
        itemDataStartRow = i + 1;
        console.log('✅ Found Amazon inventory headers at row', i, 'with mapping:', columnMapping);
        console.log('🔍 Header row was:', jsonData[i]);
        break;
      }
      
      // If we found Amazon PO headers (ASIN + Title + External Id, etc.), use this row
      if (hasASIN && hasProductTitle && (columnMapping['external_id'] || columnMapping['model_number'])) {
        itemDataStartRow = i + 1;
        console.log('✅ Found Amazon PO headers at row', i, 'with mapping:', columnMapping);
        console.log('🔍 Header row was:', jsonData[i]);
        break;
      }
      
      // If we found PO summary headers, use this row  
      if (hasPONumber && hasPlatform && hasStatus) {
        itemDataStartRow = i + 1;
        console.log('✅ Found PO summary headers at row', i, 'with mapping:', columnMapping);
        console.log('🔍 Header row was:', jsonData[i]);
        break;
      }
      
      // Fallback: if we found any relevant headers, use them
      if (Object.keys(columnMapping).length > 0 && (hasASIN || columnMapping['item_name'] || hasPONumber)) {
        itemDataStartRow = i + 1;
        console.log('✅ Found headers at row', i, 'with mapping:', columnMapping);
        break;
      }
    }

    const lines: InsertAmazonPoLines[] = [];
    let totalQuantity = 0;
    let totalBaseAmount = 0;
    let totalTaxAmount = 0;
    let totalAmount = 0;

    // Parse item data
    if (itemDataStartRow > 0) {
      let lineNumber = 0;
      for (let i = itemDataStartRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 2) continue;
        
        // Check if this row has data
        const hasData = row.some(cell => cell && cell.toString().trim());
        if (!hasData) continue;

        lineNumber++;
        
        try {
          let quantity = 0;
          let unitPrice = 0;
          let baseAmount = 0;
          let lineTotal = 0;
          
          // Handle different file formats
          if (columnMapping['quantity']) {
            // Parse quantity - handle comma-separated numbers
            const quantityStr = row[columnMapping['quantity']]?.toString().replace(/,/g, '') || '0';
            quantity = parseInt(quantityStr) || 0;
          } else if (columnMapping['total_quantity']) {
            // For PO summary files, use Total Quantity column
            const totalQtyStr = row[columnMapping['total_quantity']]?.toString().replace(/,/g, '') || '0';
            quantity = parseInt(totalQtyStr) || 1;
          } else {
            // Fallback: set quantity to 1 for counting
            quantity = 1;
          }
          
          if (columnMapping['unit_price']) {
            // Parse unit price - handle comma-separated numbers and inventory values
            const unitPriceStr = row[columnMapping['unit_price']]?.toString().replace(/,/g, '') || '0';
            unitPrice = parseFloat(unitPriceStr) || 0;
            baseAmount = quantity * unitPrice;
            lineTotal = baseAmount;
          } else if (columnMapping['line_total']) {
            // For Amazon PO files, use Total cost column  
            const lineTotalStr = row[columnMapping['line_total']]?.toString().replace(/,/g, '') || '0';
            lineTotal = parseFloat(lineTotalStr) || 0;
            unitPrice = quantity > 0 ? lineTotal / quantity : 0;
            baseAmount = lineTotal;
          } else if (columnMapping['total_value']) {
            // For PO summary files, use Total Value column
            const totalValueStr = row[columnMapping['total_value']]?.toString().replace(/,/g, '') || '0';
            unitPrice = parseFloat(totalValueStr) || 0;
            baseAmount = unitPrice;
            lineTotal = unitPrice;
          } else {
            // Fallback: use dummy values
            unitPrice = 0;
            baseAmount = 0;
            lineTotal = 0;
          }
          
          const taxRate = parseFloat(row[columnMapping['tax_rate']] || '0') || 0;
          const taxAmount = parseFloat(row[columnMapping['tax_amount']] || '0') || (baseAmount * taxRate / 100);
          const discountPercent = parseFloat(row[columnMapping['discount_percent']] || '0') || 0;
          const discountAmount = parseFloat(row[columnMapping['discount_amount']] || '0') || (baseAmount * discountPercent / 100);
          
          if (taxAmount || discountAmount) {
            lineTotal = baseAmount + taxAmount - discountAmount;
          }

          const line: InsertAmazonPoLines = {
            line_number: lineNumber,
            asin: row[columnMapping['asin']]?.toString() || null,
            sku: row[columnMapping['sku']]?.toString() || null,
            external_id: row[columnMapping['external_id']]?.toString() || null,
            // For PO summary format, use po_number as item_name for display
            item_name: row[columnMapping['item_name']]?.toString() || 
                      row[columnMapping['po_number']]?.toString() || '',
            item_description: row[columnMapping['item_name']]?.toString() || 
                            row[columnMapping['po_number']]?.toString() || null,
            hsn_code: row[columnMapping['hsn_code']]?.toString() || 
                     row[columnMapping['city']]?.toString() || null,
            category: row[columnMapping['category']]?.toString() || 
                     row[columnMapping['state']]?.toString() || null,
            brand: row[columnMapping['brand']]?.toString() || 
                  row[columnMapping['platform']]?.toString() || null,
            model_number: row[columnMapping['model_number']]?.toString() || 
                         row[columnMapping['status']]?.toString() || null,
            quantity: quantity,
            unit_price: unitPrice.toString(),
            base_amount: baseAmount.toString(),
            tax_rate: taxRate.toString(),
            tax_amount: taxAmount.toString(),
            discount_percent: discountPercent.toString(),
            discount_amount: discountAmount.toString(),
            line_total: lineTotal.toString(),
            delivery_date: row[columnMapping['delivery_date']] ? parseDate(row[columnMapping['delivery_date']].toString()) : 
                         row[columnMapping['order_date']] ? parseDate(row[columnMapping['order_date']].toString()) : null,
            window_type: row[columnMapping['window_type']]?.toString() || 
                        row[columnMapping['expiry_date']]?.toString() || null,
            window_start: null,
            window_end: null
          };

          lines.push(line);
          console.log('Parsed Amazon line item:', line.line_number, line.item_name ? line.item_name.substring(0, 50) + '...' : 'NO NAME');

          // Update totals
          totalQuantity += quantity;
          totalBaseAmount += baseAmount;
          totalTaxAmount += taxAmount;
          totalAmount += lineTotal;
        } catch (error) {
          console.warn(`Error parsing Amazon PO line ${i}:`, error);
          continue;
        }
      }
    }

    // Generate PO number if not found
    if (!poNumber) {
      const timestamp = Date.now();
      poNumber = `AMZ_${timestamp}`;
      console.log('⚠️ Generated PO number:', poNumber);
    }

    const header: InsertAmazonPoHeader = {
      po_number: poNumber,
      po_date: poDate,
      delivery_date: deliveryDate,
      delivery_window_start: null,
      delivery_window_end: null,
      vendor_code: vendorCode || null,
      vendor_name: vendorName || null,
      vendor_address: vendorAddress || null,
      vendor_gstin: vendorGstin || null,
      ship_to_location: shipToLocation || null,
      ship_to_address: shipToAddress || null,
      ship_to_gstin: shipToGstin || null,
      bill_to_location: billToLocation || null,
      bill_to_address: billToAddress || null,
      bill_to_gstin: billToGstin || null,
      payment_terms: paymentTerms || null,
      currency: currency,
      total_items: lines.length,
      total_quantity: totalQuantity,
      total_base_amount: totalBaseAmount.toString(),
      total_tax_amount: totalTaxAmount.toString(),
      total_amount: totalAmount.toString(),
      status: 'pending',
      created_by: uploadedBy
    };

    console.log('✅ Amazon PO parsed successfully:', {
      poNumber: header.po_number,
      totalItems: header.total_items,
      totalQuantity: header.total_quantity,
      totalAmount: header.total_amount
    });

    return { header, lines };
  } catch (error) {
    throw new Error(`Failed to parse Amazon PO: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  
  try {
    const cleanDateStr = dateStr.toString().trim();
    
    // Handle various date formats
    const date = new Date(cleanDateStr);
    
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try parsing DD/MM/YYYY or DD-MM-YYYY
    const parts = cleanDateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error parsing Amazon date:', dateStr, error);
    return null;
  }
}