import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = (host) => host + '/v2';
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function addColumn() {
  try {
    console.log('Adding unique_hsn_codes column to swiggy_po_header...');

    await pool.query(`
      ALTER TABLE swiggy_po_header
      ADD COLUMN IF NOT EXISTS unique_hsn_codes text[];
    `);

    console.log('✅ Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addColumn();
