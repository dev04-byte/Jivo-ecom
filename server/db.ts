// server/db.ts
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

console.log('Initializing PostgreSQL connection...');

// Build a single connection string (prefer DATABASE_URL)
const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}` +
  `@${process.env.PGHOST ?? "127.0.0.1"}:${process.env.PGPORT ?? "5432"}/${process.env.PGDATABASE}`;

// Enable SSL for Render PostgreSQL (required for external connections)
const sslEnabled = process.env.NODE_ENV === 'production' ||
                   (process.env.DATABASE_SSL || "").toLowerCase() === "true" ||
                   connectionString.includes('render.com');

export const pool = new Pool({
  connectionString,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  max: 5, // Further reduce max connections for stability
  min: 1, // Reduce minimum connections
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout
  acquireTimeoutMillis: 10000, // 10 seconds to acquire connection
  // Retry logic for connection failures
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
  // Add statement timeout
  statement_timeout: 30000, // 30 seconds for queries
  query_timeout: 30000, // 30 seconds for queries
});

// One Drizzle client for the whole app
export const db = drizzle(pool, { schema });
