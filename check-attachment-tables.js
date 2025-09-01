#!/usr/bin/env node

import pg from "pg";
import "dotenv/config";

async function checkTables() {
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
    console.log("🔄 Checking attachment tables...\n");
    
    // Check which attachment tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%attachment%'
      ORDER BY table_name
    `);
    
    console.log("📋 Existing attachment tables:");
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    } else {
      console.log("   ❌ No attachment tables found");
    }
    
    // Check platform_po_attachments structure if it exists
    const platformPoExists = tablesResult.rows.some(r => r.table_name === 'platform_po_attachments');
    if (platformPoExists) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'platform_po_attachments' 
        ORDER BY ordinal_position
      `);
      
      console.log("\n📋 platform_po_attachments structure:");
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkTables().catch(console.error);