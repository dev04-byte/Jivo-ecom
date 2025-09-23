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
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 10000, // How long to wait for a connection
});

// One Drizzle client for the whole app
export const db = drizzle(pool, { schema });
