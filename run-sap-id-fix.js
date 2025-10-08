import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixSapIdType() {
  const client = await pool.connect();

  try {
    console.log('🔧 Fixing sap_id column type in pf_item_mst table...');

    // First check current type
    const typeCheck = await client.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'pf_item_mst'
      AND column_name = 'sap_id'
    `);

    console.log('Current sap_id type:', typeCheck.rows[0]?.data_type);

    if (typeCheck.rows[0]?.data_type === 'integer') {
      console.log('⚠️ Type is INTEGER, converting to VARCHAR(50)...');

      await client.query(`
        ALTER TABLE pf_item_mst
        ALTER COLUMN sap_id TYPE VARCHAR(50)
        USING sap_id::VARCHAR
      `);

      console.log('✅ Successfully converted sap_id to VARCHAR(50)');
    } else {
      console.log('✅ sap_id is already VARCHAR, no changes needed');
    }

  } catch (error) {
    console.error('❌ Error fixing sap_id type:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixSapIdType();
