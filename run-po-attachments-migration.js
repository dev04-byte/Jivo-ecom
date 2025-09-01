#!/usr/bin/env node

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Build connection string
  const connectionString =
    process.env.DATABASE_URL ??
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}` +
    `@${process.env.PGHOST ?? "127.0.0.1"}:${process.env.PGPORT ?? "5432"}/${process.env.PGDATABASE}`;

  const sslEnabled = (process.env.DATABASE_SSL || "").toLowerCase() === "true";

  const pool = new pg.Pool({
    connectionString,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log("🔄 Running PO attachments table migration...");
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-po-attachments-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log("✅ PO attachments table created successfully!");
    
    // Verify the table was created
    const checkResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'po_attachments'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log("✅ Verified: po_attachments table exists");
      
      // Get column information
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'po_attachments' 
        ORDER BY ordinal_position
      `);
      
      console.log("\n📋 Table structure:");
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
      });
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.detail) {
      console.error("   Details:", error.detail);
    }
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);