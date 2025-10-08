import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = (host) => host + '/v2';
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function fixTrigger() {
  try {
    console.log('🔄 Reading SQL file...');
    const sql = readFileSync('./fix-swiggy-trigger.sql', 'utf8');

    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('🔄 Executing trigger fix...');
    await client.query(sql);

    console.log('✅ Swiggy trigger fixed successfully!');
    console.log('\n📋 The trigger now properly handles type conversions:');
    console.log('   - Casts item_code and pf_itemcode to TEXT for comparison');
    console.log('   - Casts unit_base_cost to NUMERIC for calculations');
    console.log('   - Handles NULL values with CASE statements');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing trigger:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    await pool.end();
    process.exit(1);
  }
}

fixTrigger();
