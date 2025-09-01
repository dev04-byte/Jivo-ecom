#!/usr/bin/env node

import pg from "pg";
import "dotenv/config";

async function verifyTables() {
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
    console.log("🔍 Verifying PO attachment tables...\n");
    
    // Check both attachment tables
    const attachmentTables = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name IN ('po_attachments', 'platform_po_attachments') 
      ORDER BY table_name, ordinal_position
    `);

    if (attachmentTables.rows.length === 0) {
      console.log("❌ No attachment tables found!");
      return;
    }

    // Group by table
    const tables = {};
    attachmentTables.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(row);
    });

    Object.keys(tables).forEach(tableName => {
      console.log(`\n📋 Table: ${tableName}`);
      console.log("=" + "=".repeat(tableName.length + 8));
      tables[tableName].forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '' : ' (required)';
        console.log(`   - ${col.column_name}: ${col.data_type}${nullable}`);
      });
    });

    // Check if there are any existing attachments
    const attachmentCount = await pool.query("SELECT COUNT(*) as count FROM po_attachments WHERE is_active = true");
    console.log(`\n📊 Current attachments in database: ${attachmentCount.rows[0].count}`);

    // Show recent POs to verify structure
    const recentPOs = await pool.query(`
      SELECT id, vendor_po_number, platform_id, created_at 
      FROM po_master 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log("\n📋 Recent POs (for attachment testing):");
    if (recentPOs.rows.length > 0) {
      recentPOs.rows.forEach(po => {
        console.log(`   - ID: ${po.id}, PO#: ${po.vendor_po_number}, Platform: ${po.platform_id}, Created: ${po.created_at.toISOString().split('T')[0]}`);
      });
    } else {
      console.log("   (No POs found)");
    }

    console.log("\n✅ Database verification complete!");
    console.log("\n🎯 Next steps:");
    console.log("   1. Open http://localhost:8000/test-po-attachment.html");
    console.log("   2. Fill the form and upload a file");  
    console.log("   3. Submit to test mandatory attachment");
    console.log("   4. Check this script again to see saved attachments");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

verifyTables().catch(console.error);