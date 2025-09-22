import XLSX from 'xlsx';
import type { InsertBigbasketPoHeader, InsertBigbasketPoLines } from '@shared/schema';

export interface BigBasketParsedData {
  header: InsertBigbasketPoHeader;
  lines: InsertBigbasketPoLines[];
  totalItems: number;
  totalQuantity: number;
  totalAmount: string;
  detectedVendor: string;
}

export async function parseBigBasketPO(buffer: Buffer, uploadedBy: string): Promise<BigBasketParsedData> {
  try {
    // Validate input
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid or empty file buffer provided');
    }

    if (!uploadedBy || uploadedBy.trim() === '') {
      throw new Error('uploadedBy parameter is required');
    }

    // Read Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No worksheets found in the Excel file');
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      throw new Error(`Worksheet '${firstSheetName}' not found`);
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (!jsonData || jsonData.length === 0) {
      throw new Error('No data found in the Excel worksheet');
    }
    
    console.log("Processing BigBasket Excel file with", jsonData.length, "rows");
    
    // Initialize header data
    let header: InsertBigbasketPoHeader = {
      po_number: "",
      po_date: null,
      po_expiry_date: null,
      warehouse_address: "",
      delivery_address: "",
      supplier_name: "",
      supplier_address: "",
      supplier_gstin: "",
      dc_address: "",
      dc_gstin: "",
      total_items: 0,
      total_quantity: 0,
      total_basic_cost: "0",
      total_gst_amount: "0",
      total_cess_amount: "0",
      grand_total: "0",
      status: "pending",
      created_by: uploadedBy
    };
    
    const lines: InsertBigbasketPoLines[] = [];
    
    // Parse header information
    for (let i = 0; i < Math.min(30, jsonData.length); i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const firstCell = String(row[0] || '').trim();
      
      // Extract PO Number, PO Date, and PO Expiry Date from row 17
      if (firstCell.includes('PO Number:')) {
        const poMatch = firstCell.match(/PO Number:(.*?)(?:,|$)/);
        if (poMatch) {
          header.po_number = poMatch[1].trim();
        }
        
        // Check for PO Date in row[3]
        if (row[3] && String(row[3]).includes('PO Date:')) {
          const dateMatch = String(row[3]).match(/PO Date:(.*?)(?:,|$)/);
          if (dateMatch) {
            const dateStr = dateMatch[1].trim();
            header.po_date = parseDate(dateStr);
          }
        }
        
        // Check for PO Expiry Date in row[7]
        if (row[7] && String(row[7]).includes('PO Expiry date:')) {
          const expiryMatch = String(row[7]).match(/PO Expiry date:(.*?)(?:,|$)/);
          if (expiryMatch) {
            const expiryStr = expiryMatch[1].trim();
            header.po_expiry_date = parseDate(expiryStr);
          }
        }
      }
      
      // Extract DC Address (rows 1-4)
      if (i >= 0 && i <= 3 && firstCell && !firstCell.includes('Address') && !firstCell.includes('Warehouse')) {
        if (!header.dc_address) {
          header.dc_address = firstCell;
        } else {
          header.dc_address += ', ' + firstCell;
        }
      }

      // Extract Warehouse Address (row 6, column A)
      if (i === 5 && row[0]) {
        const warehouseCell = String(row[0] || '').trim();
        if (warehouseCell && warehouseCell !== 'Warehouse Address') {
          header.warehouse_address = warehouseCell;
        }
      }

      // Extract Delivery Address (row 6, column H)
      if (i === 5 && row[7]) {
        const deliveryCell = String(row[7] || '').trim();
        if (deliveryCell && deliveryCell !== 'Delivery Address') {
          header.delivery_address = deliveryCell;
        }
      }

      // Extract DC GSTIN (row 10)
      if (i === 9 && firstCell.includes('GSTIN')) {
        const dcGstinMatch = firstCell.match(/GSTIN NO:\s*(.*)/);
        if (dcGstinMatch) {
          header.dc_gstin = dcGstinMatch[1].trim();
        }
      }

      // Extract Supplier info from column H (index 7)
      if (row[7]) {
        const supplierCell = String(row[7] || '').trim();

        // Supplier name (row 12)
        if (i === 11 && supplierCell && !supplierCell.includes('Supplier')) {
          header.supplier_name = supplierCell;
        }

        // Supplier address (row 13)
        if (i === 12 && supplierCell) {
          header.supplier_address = supplierCell;
        }

        // Supplier GSTIN (row 16)
        if (i === 15 && supplierCell.includes('GSTIN No:')) {
          const gstinMatch = supplierCell.match(/GSTIN No:\s*(.*)/);
          if (gstinMatch) {
            header.supplier_gstin = gstinMatch[1].trim();
          }
        }
      }
    }
    
    // Find data rows (starting from row with headers)
    let dataStartRow = -1;
    for (let i = 15; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0] === 'S.No' && row[1] === 'HSN Code') {
        dataStartRow = i + 1;
        break;
      }
    }

    // Fallback: if headers not found, check specific row 18 (index 17)
    if (dataStartRow === -1) {
      const headerRow = jsonData[17];
      if (headerRow && headerRow[0] === 'S.No') {
        dataStartRow = 18; // Start from row 19 (index 18)
      }
    }
    
    if (dataStartRow === -1) {
      console.warn('Data headers not found at expected locations, attempting alternative search...');
      // Alternative search for data start
      for (let i = 0; i < Math.min(50, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && String(row[0]).toLowerCase().includes('s.no') && String(row[1]).toLowerCase().includes('hsn')) {
          dataStartRow = i + 1;
          console.log(`Found alternative data start at row ${dataStartRow}`);
          break;
        }
      }

      if (dataStartRow === -1) {
        throw new Error('Could not find data headers in BigBasket file. Please ensure the file follows the expected format.');
      }
    }
    
    // Parse line items
    let totalQuantity = 0;
    let totalValue = 0;
    let totalGST = 0;
    let totalCess = 0;
    
    for (let i = dataStartRow; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 20) continue;

      // Validate row data
      if (!Array.isArray(row) || row.length < 15) {
        console.log(`Skipping row ${i}: insufficient columns (${row ? row.length : 0})`);
        continue;
      }

      // Check if this is a valid data row (has S.No as number)
      const sNo = parseInt(String(row[0] || ''));
      if (isNaN(sNo) || sNo <= 0) {
        console.log(`Skipping row ${i}: invalid S.No '${row[0]}'`);
        continue;
      }

      // Skip empty rows or rows that look like totals
      const firstCellStr = String(row[0] || '').toLowerCase();
      if (firstCellStr.includes('total') || firstCellStr.includes('grand') || row[0] === '') {
        console.log(`Skipping row ${i}: appears to be total/summary row`);
        continue;
      }
      
      // Helper function to safely parse numeric values
      const safeParseFloat = (value: any, defaultValue: number = 0): string => {
        const parsed = parseFloat(String(value || '0'));
        return isNaN(parsed) ? defaultValue.toFixed(2) : parsed.toFixed(2);
      };

      const safeParseInt = (value: any, defaultValue: number = 0): number => {
        const parsed = parseInt(String(value || '0'));
        return isNaN(parsed) ? defaultValue : parsed;
      };

      const line: InsertBigbasketPoLines = {
        s_no: sNo,
        hsn_code: String(row[1] || '').trim(),
        sku_code: String(row[2] || '').trim(),
        description: String(row[3] || '').trim(),
        ean_upc_code: String(row[4] || '').trim(),
        case_quantity: safeParseInt(row[5], 0),
        quantity: safeParseInt(row[6], 0),
        basic_cost: safeParseFloat(row[7]),
        sgst_percent: safeParseFloat(row[8]),
        sgst_amount: safeParseFloat(row[9]),
        cgst_percent: safeParseFloat(row[10]),
        cgst_amount: safeParseFloat(row[11]),
        igst_percent: safeParseFloat(row[12]),
        igst_amount: safeParseFloat(row[13]),
        gst_percent: safeParseFloat(row[14]),
        gst_amount: safeParseFloat(row[15]),
        cess_percent: safeParseFloat(row[16]),
        cess_value: safeParseFloat(row[17]),
        state_cess_percent: safeParseFloat(row[18]),
        state_cess: safeParseFloat(row[19]),
        landing_cost: safeParseFloat(row[20]),
        mrp: safeParseFloat(row[21]),
        total_value: safeParseFloat(row[22])
      };

      // Validate essential fields
      if (!line.description || line.description === '') {
        console.log(`Warning: Row ${i} has empty description, using placeholder`);
        line.description = `Item ${sNo} - No description`;
      }

      if (line.quantity <= 0) {
        console.log(`Warning: Row ${i} has zero or negative quantity (${line.quantity})`);
      }
      
      lines.push(line);
      
      // Calculate totals
      totalQuantity += line.quantity;
      totalValue += parseFloat(line.total_value || '0');
      totalGST += parseFloat(line.gst_amount || '0');
      totalCess += parseFloat(line.cess_value || '0');
      
      console.log(`Parsed BigBasket line item ${sNo}:`, {
        sku_code: line.sku_code,
        description: line.description?.substring(0, 50),
        quantity: line.quantity,
        total_value: line.total_value
      });
    }
    
    // Update header totals
    header.total_items = lines.length;
    header.total_quantity = totalQuantity;
    header.grand_total = totalValue.toFixed(2);
    header.total_gst_amount = totalGST.toFixed(2);
    header.total_cess_amount = totalCess.toFixed(2);
    header.total_basic_cost = lines.reduce((sum, line) => sum + (parseFloat(line.basic_cost || '0') * line.quantity), 0).toFixed(2);
    
    // Final validation
    if (lines.length === 0) {
      throw new Error('No valid line items found in the BigBasket file');
    }

    // Data quality checks
    const itemsWithMissingData = lines.filter(line =>
      !line.sku_code || !line.hsn_code || line.quantity <= 0 || parseFloat(line.total_value) <= 0
    );

    if (itemsWithMissingData.length > 0) {
      console.warn(`${itemsWithMissingData.length} items have missing or invalid data:`,
        itemsWithMissingData.map(item => ({
          s_no: item.s_no,
          sku_code: item.sku_code,
          quantity: item.quantity,
          total_value: item.total_value
        }))
      );
    }

    console.log("BigBasket PO parsed successfully:", {
      po_number: header.po_number,
      supplier_name: header.supplier_name,
      po_date: header.po_date,
      total_items: header.total_items,
      total_quantity: header.total_quantity,
      grand_total: header.grand_total,
      data_quality: {
        valid_items: lines.length - itemsWithMissingData.length,
        items_with_issues: itemsWithMissingData.length,
        success_rate: `${((lines.length - itemsWithMissingData.length) / lines.length * 100).toFixed(1)}%`
      }
    });

    return {
      header,
      lines,
      totalItems: lines.length,
      totalQuantity,
      totalAmount: totalValue.toFixed(2),
      detectedVendor: 'bigbasket'
    };
    
  } catch (error) {
    console.error("Error parsing BigBasket PO:", error);
    throw new Error(`Failed to parse BigBasket file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Handle DD/MMM/YYYY format (e.g., "08/Aug/2025")
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const month = monthMap[monthStr];
      if (month !== undefined) {
        return new Date(year, month, day);
      }
    }
    
    // Fallback to Date.parse
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? null : new Date(parsed);
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}