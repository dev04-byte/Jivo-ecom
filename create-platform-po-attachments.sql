-- Create Platform PO Attachments Table
CREATE TABLE IF NOT EXISTS platform_po_attachments (
    id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES pf_po(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_platform_po_attachments_po_id ON platform_po_attachments(po_id);
CREATE INDEX IF NOT EXISTS idx_platform_po_attachments_uploaded_by ON platform_po_attachments(uploaded_by);

-- Add comments
COMMENT ON TABLE platform_po_attachments IS 'Stores file attachments for Platform Purchase Orders';
COMMENT ON COLUMN platform_po_attachments.po_id IS 'References pf_po.id';
COMMENT ON COLUMN platform_po_attachments.file_name IS 'Original file name uploaded by user';
COMMENT ON COLUMN platform_po_attachments.file_path IS 'Relative path to file from attachments folder';
COMMENT ON COLUMN platform_po_attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN platform_po_attachments.file_type IS 'MIME type of the file';