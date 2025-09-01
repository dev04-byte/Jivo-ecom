-- Create PO Attachments Table
CREATE TABLE IF NOT EXISTS po_attachments (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL,
    po_type VARCHAR(50) NOT NULL, -- 'platform' or 'distributor'
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_po_attachments_po_id ON po_attachments(po_id);
CREATE INDEX IF NOT EXISTS idx_po_attachments_po_type ON po_attachments(po_type);
CREATE INDEX IF NOT EXISTS idx_po_attachments_uploaded_by ON po_attachments(uploaded_by);

-- Add constraint to ensure po_type is valid
ALTER TABLE po_attachments ADD CONSTRAINT check_po_type 
CHECK (po_type IN ('platform', 'distributor'));

-- Add comment to table
COMMENT ON TABLE po_attachments IS 'Stores file attachments for Purchase Orders';
COMMENT ON COLUMN po_attachments.po_id IS 'References either pf_po.id or distributor_po.id based on po_type';
COMMENT ON COLUMN po_attachments.po_type IS 'Indicates whether this is for platform PO or distributor PO';
COMMENT ON COLUMN po_attachments.file_name IS 'Stored file name (usually a UUID)';
COMMENT ON COLUMN po_attachments.original_name IS 'Original file name uploaded by user';
COMMENT ON COLUMN po_attachments.file_path IS 'Relative path to file from attachments folder';
COMMENT ON COLUMN po_attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN po_attachments.mime_type IS 'MIME type of the file';