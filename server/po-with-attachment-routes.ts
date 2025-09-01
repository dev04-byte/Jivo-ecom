import { Express } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import { z } from "zod";

// Configure multer for PO attachments
const poAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "attachments", "po");
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// File filter for PO attachments
const poFileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = [
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv",
    ".png", ".jpg", ".jpeg", ".txt", ".zip"
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed types: ${allowedExtensions.join(", ")}`), false);
  }
};

// Create multer instance for PO attachments
const uploadPoAttachment = multer({
  storage: poAttachmentStorage,
  fileFilter: poFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

export function setupPoWithAttachmentRoutes(app: Express) {
  // New PO creation endpoint with mandatory attachment
  app.post("/api/pos-with-attachment", 
    uploadPoAttachment.single("attachment"),
    async (req, res) => {
      try {
        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({ 
            error: "Attachment is required. Please upload a file with your PO submission." 
          });
        }

        // Parse the PO data from the request body
        let poData;
        try {
          // If the PO data is sent as a JSON string in a form field
          poData = typeof req.body.poData === 'string' 
            ? JSON.parse(req.body.poData) 
            : req.body;
        } catch (parseError) {
          return res.status(400).json({ 
            error: "Invalid PO data format. Please send valid JSON." 
          });
        }

        // Validate PO data structure
        if (!poData.master || !poData.lines) {
          return res.status(400).json({ 
            error: "Invalid PO structure. 'master' and 'lines' fields are required.",
            received: Object.keys(poData),
            expected: ["master", "lines"]
          });
        }

        // Create the PO first
        const createdPo = await storage.createPoInExistingTables(poData.master, poData.lines);

        // Save attachment information to database
        const attachmentData = {
          po_id: createdPo.id,
          po_type: 'platform', // or determine from poData
          file_name: req.file.filename,
          original_name: req.file.originalname,
          file_path: path.join("attachments", "po", req.file.filename),
          file_size: req.file.size,
          mime_type: req.file.mimetype,
          uploaded_by: req.user?.id || null, // Get from auth context
          is_active: true
        };

        // Store attachment info in database
        await storage.addPoAttachment(attachmentData);

        res.status(201).json({
          message: "PO created successfully with attachment",
          po: createdPo,
          attachment: {
            filename: req.file.originalname,
            size: req.file.size,
            path: attachmentData.file_path
          }
        });
      } catch (error) {
        // If PO creation fails, delete the uploaded file
        if (req.file) {
          const filePath = path.join(process.cwd(), "attachments", "po", req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        console.error("Error creating PO with attachment:", error);
        
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            error: "Validation error", 
            details: error.errors 
          });
        }
        
        res.status(500).json({ 
          error: "Failed to create PO with attachment",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  );

  // Endpoint to check if a PO has attachments
  app.get("/api/pos/:id/has-attachment", async (req, res) => {
    try {
      const poId = parseInt(req.params.id);
      const attachments = await storage.getPoAttachments(poId, 'platform');
      
      res.json({
        hasAttachment: attachments.length > 0,
        attachmentCount: attachments.length,
        attachments: attachments.map(a => ({
          id: a.id,
          filename: a.original_name,
          uploadedAt: a.uploaded_at,
          size: a.file_size
        }))
      });
    } catch (error) {
      console.error("Error checking PO attachments:", error);
      res.status(500).json({ error: "Failed to check attachments" });
    }
  });

  // Download PO attachment
  app.get("/api/pos/:id/attachments/:attachmentId/download", async (req, res) => {
    try {
      const attachmentId = parseInt(req.params.attachmentId);
      const attachment = await storage.getPoAttachmentById(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      const filePath = path.join(process.cwd(), attachment.file_path);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      res.download(filePath, attachment.original_name);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ error: "Failed to download attachment" });
    }
  });
}