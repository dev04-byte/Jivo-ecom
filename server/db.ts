// server/db.ts
import "dotenv/config";
import sql from "mssql";

console.log('Initializing SQL Server connection to:', `${process.env.MSSQL_HOST || '103.89.44.240'}:${process.env.MSSQL_PORT || '1433'}`);

// SQL Server configuration
const config: sql.config = {
  server: process.env.MSSQL_HOST || '103.89.44.240',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE || process.env.PGDATABASE || 'JivoEcom',
  user: process.env.MSSQL_USER || process.env.PGUSER,
  password: process.env.MSSQL_PASSWORD || process.env.PGPASSWORD,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true' || false, // Use this if you're on Azure
    trustServerCertificate: process.env.MSSQL_TRUST_CERT === 'true' || true, // Change to false for production
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
};

// Create connection pool
export const pool = new sql.ConnectionPool(config);

// Initialize the connection
let isConnecting = false;
const initializeConnection = async () => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    if (!pool.connected && !pool.connecting) {
      await pool.connect();
      console.log('✅ SQL Server connected successfully');
    }
  } catch (error) {
    console.error('❌ SQL Server connection failed:', error);
    isConnecting = false;
    throw error;
  }
  isConnecting = false;
};

// Initialize connection on startup
initializeConnection().catch(console.error);

// Create a simple database interface for SQL Server
export const db = {
  // Helper function to execute SQL queries
  async query(sqlText: string, params: any[] = []): Promise<any> {
    try {
      await initializeConnection();
      const request = pool.request();

      // Add parameters if provided
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });

      const result = await request.query(sqlText);
      return result;
    } catch (error) {
      console.error('SQL query error:', error);
      throw error;
    }
  },

  // Insert into Zepto PO Header
  async insertZeptoPoHeader(data: any): Promise<any> {
    const sql = `
      INSERT INTO zepto_po_header (
        po_number, po_date, status, vendor_code, vendor_name, po_amount,
        delivery_location, po_expiry_date, total_quantity, total_cost_value,
        total_tax_amount, total_amount, unique_brands, created_by, uploaded_by, created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @po_number, @po_date, @status, @vendor_code, @vendor_name, @po_amount,
        @delivery_location, @po_expiry_date, @total_quantity, @total_cost_value,
        @total_tax_amount, @total_amount, @unique_brands, @created_by, @uploaded_by, GETDATE()
      )
    `;

    try {
      await initializeConnection();
      const request = pool.request();

      request.input('po_number', sql.VarChar, data.po_number);
      request.input('po_date', sql.DateTime, data.po_date);
      request.input('status', sql.VarChar, data.status);
      request.input('vendor_code', sql.VarChar, data.vendor_code);
      request.input('vendor_name', sql.VarChar, data.vendor_name);
      request.input('po_amount', sql.Decimal, data.po_amount);
      request.input('delivery_location', sql.VarChar, data.delivery_location);
      request.input('po_expiry_date', sql.DateTime, data.po_expiry_date);
      request.input('total_quantity', sql.Int, data.total_quantity);
      request.input('total_cost_value', sql.Decimal, data.total_cost_value);
      request.input('total_tax_amount', sql.Decimal, data.total_tax_amount);
      request.input('total_amount', sql.Decimal, data.total_amount);
      request.input('unique_brands', sql.NVarChar, JSON.stringify(data.unique_brands));
      request.input('created_by', sql.VarChar, data.created_by);
      request.input('uploaded_by', sql.VarChar, data.uploaded_by);

      const result = await request.query(sql);
      return result.recordset[0];
    } catch (error) {
      console.error('Insert Zepto PO Header error:', error);
      throw error;
    }
  },

  // Insert into Zepto PO Lines
  async insertZeptoPoLines(lines: any[], headerId: number): Promise<any> {
    try {
      await initializeConnection();
      const results = [];

      for (const line of lines) {
        const sql = `
          INSERT INTO zepto_po_lines (
            po_header_id, line_number, po_number, sku, sku_desc, brand, sku_id, sap_id,
            hsn_code, ean_no, po_qty, asn_qty, grn_qty, remaining_qty, cost_price,
            landing_cost, cgst, sgst, igst, cess, mrp, total_value, status, created_by, created_at
          )
          OUTPUT INSERTED.id
          VALUES (
            @po_header_id, @line_number, @po_number, @sku, @sku_desc, @brand, @sku_id, @sap_id,
            @hsn_code, @ean_no, @po_qty, @asn_qty, @grn_qty, @remaining_qty, @cost_price,
            @landing_cost, @cgst, @sgst, @igst, @cess, @mrp, @total_value, @status, @created_by, GETDATE()
          )
        `;

        const request = pool.request();
        request.input('po_header_id', sql.Int, headerId);
        request.input('line_number', sql.Int, line.line_number);
        request.input('po_number', sql.VarChar, line.po_number);
        request.input('sku', sql.VarChar, line.sku);
        request.input('sku_desc', sql.VarChar, line.sku_desc);
        request.input('brand', sql.VarChar, line.brand);
        request.input('sku_id', sql.VarChar, line.sku_id);
        request.input('sap_id', sql.VarChar, line.sap_id);
        request.input('hsn_code', sql.VarChar, line.hsn_code);
        request.input('ean_no', sql.VarChar, line.ean_no);
        request.input('po_qty', sql.Int, line.po_qty);
        request.input('asn_qty', sql.Int, line.asn_qty);
        request.input('grn_qty', sql.Int, line.grn_qty);
        request.input('remaining_qty', sql.Int, line.remaining_qty);
        request.input('cost_price', sql.Decimal, line.cost_price);
        request.input('landing_cost', sql.Decimal, line.landing_cost);
        request.input('cgst', sql.Decimal, line.cgst);
        request.input('sgst', sql.Decimal, line.sgst);
        request.input('igst', sql.Decimal, line.igst);
        request.input('cess', sql.Decimal, line.cess);
        request.input('mrp', sql.Decimal, line.mrp);
        request.input('total_value', sql.Decimal, line.total_value);
        request.input('status', sql.VarChar, line.status);
        request.input('created_by', sql.VarChar, line.created_by);

        const result = await request.query(sql);
        results.push(result.recordset[0]);
      }

      return results;
    } catch (error) {
      console.error('Insert Zepto PO Lines error:', error);
      throw error;
    }
  }
};
