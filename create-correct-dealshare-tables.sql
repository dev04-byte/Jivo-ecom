-- Drop the incorrect table if it exists and create the correct one
DROP TABLE IF EXISTS dealshare_po_items CASCADE;

-- Create DealShare tables with correct names
CREATE TABLE IF NOT EXISTS dealshare_po_header (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(100) NOT NULL UNIQUE,
  po_created_date TIMESTAMP,
  po_delivery_date TIMESTAMP,
  po_expiry_date TIMESTAMP,
  shipped_by TEXT,
  shipped_by_address TEXT,
  shipped_by_gstin VARCHAR(20),
  shipped_by_phone VARCHAR(20),
  vendor_code VARCHAR(50),
  shipped_to TEXT,
  shipped_to_address TEXT,
  shipped_to_gstin VARCHAR(20),
  bill_to TEXT,
  bill_to_address TEXT,
  bill_to_gstin VARCHAR(20),
  comments TEXT,
  total_items INTEGER DEFAULT 0,
  total_quantity DECIMAL(15, 2) DEFAULT 0,
  total_gross_amount DECIMAL(15, 2) DEFAULT 0,
  uploaded_by VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealshare_po_lines (
  id SERIAL PRIMARY KEY,
  po_header_id INTEGER NOT NULL REFERENCES dealshare_po_header(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  sku VARCHAR(100),
  product_name TEXT,
  hsn_code VARCHAR(20),
  quantity INTEGER,
  mrp_tax_inclusive DECIMAL(10, 2),
  buying_price DECIMAL(10, 2),
  gst_percent DECIMAL(5, 2),
  cess_percent DECIMAL(5, 2),
  gross_amount DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);