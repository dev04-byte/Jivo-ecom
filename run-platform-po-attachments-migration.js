#!/usr/bin/env node

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
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
    console.log("🔄 Running platform_po_attachments table migration...");
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-platform-po-attachments.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log("✅ platform_po_attachments table created successfully!");
    
    // Verify the table was created
    const checkResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'platform_po_attachments'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log("✅ Verified: platform_po_attachments table exists");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);