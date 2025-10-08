import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkSwiggyData() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking Swiggy data in database...');
    console.log('📊 Database:', process.env.DATABASE_URL);

    // Check count
    const countResult = await client.query('SELECT COUNT(*) as count FROM swiggy_pos');
    console.log(`\n✅ Total Swiggy POs: ${countResult.rows[0].count}`);

    // Check recent POs
    if (parseInt(countResult.rows[0].count) > 0) {
      const posResult = await client.query(`
        SELECT po_number, vendor_name, created_at
        FROM swiggy_pos
        ORDER BY created_at DESC
        LIMIT 5
      `);

      console.log('\n📋 Recent Swiggy POs:');
      posResult.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. PO: ${row.po_number} | Vendor: ${row.vendor_name} | Created: ${row.created_at}`);
      });
    } else {
      console.log('\n❌ No Swiggy POs found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSwiggyData();
