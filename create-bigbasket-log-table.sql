-- Create missing bigbasket_po_header_log table to fix import error
CREATE TABLE IF NOT EXISTS bigbasket_po_header_log (
  id SERIAL PRIMARY KEY,
  po_header_id INTEGER REFERENCES bigbasket_po_header(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bigbasket_po_header_log_po_id ON bigbasket_po_header_log(po_header_id);
CREATE INDEX IF NOT EXISTS idx_bigbasket_po_header_log_timestamp ON bigbasket_po_header_log(timestamp);