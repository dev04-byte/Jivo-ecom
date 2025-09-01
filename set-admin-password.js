#!/usr/bin/env node

// Script to set admin password to Admin123
// Usage: node set-admin-password.js

import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import pg from "pg";
import "dotenv/config";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function setAdminPassword() {
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
    // Check if admin user exists
    const checkResult = await pool.query(
      "SELECT id, username FROM users WHERE username = $1",
      ["admin"]
    );

    if (checkResult.rows.length > 0) {
      console.log("🔄 Setting admin password to Admin123...");
      
      // Hash the new password with capital A
      const hashedPassword = await hashPassword("Admin123");
      
      // Update both password and password_hash fields
      await pool.query(
        "UPDATE users SET password = $1, password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE username = $2",
        [hashedPassword, "admin"]
      );
      
      console.log("✅ Admin password has been updated!");
      console.log("📝 Login credentials:");
      console.log("   Username: admin");
      console.log("   Password: Admin123");
    } else {
      console.log("❌ Admin user does not exist!");
      console.log("📝 Creating admin user...");
      
      // Hash the password with capital A
      const hashedPassword = await hashPassword("Admin123");
      
      // Create admin user
      await pool.query(
        `INSERT INTO users (username, email, password, password_hash, full_name, role, department, is_active, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          "admin",
          "admin@example.com",
          hashedPassword,
          hashedPassword,
          "Administrator",
          "admin",
          "E-Com",
          true,
          "active"
        ]
      );
      
      console.log("✅ Admin user created successfully!");
      console.log("📝 Login credentials:");
      console.log("   Username: admin");
      console.log("   Password: Admin123");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.detail) {
      console.error("   Details:", error.detail);
    }
  } finally {
    await pool.end();
  }
}

setAdminPassword().catch(console.error);