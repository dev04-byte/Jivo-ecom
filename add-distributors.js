import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  console.error('Make sure you have a .env file with DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const distributors = [
  'EVARA ENTERPRISES',
  'CHIRAG ENTERPRISES',
  'JIVO MART PRIVATE LIMITED',
  'BABA LOKENATH',
  'SUSTAINQUEST PRIVATE LIMITED',
  'KNOWTABLE',
  'KNOWTABLE ONLINE SERVICES PRIVATE LIMITED',
  'SHIV SHAKTI'
];

async function addDistributors() {
  const client = await pool.connect();

  try {
    console.log('🔍 Adding distributors to database...\n');

    for (const distributorName of distributors) {
      try {
        const result = await client.query(
          `INSERT INTO distributors (distributor_name)
           VALUES ($1)
           ON CONFLICT (distributor_name) DO NOTHING
           RETURNING id, distributor_name`,
          [distributorName]
        );

        if (result.rows.length > 0) {
          console.log(`✅ Added: ${result.rows[0].distributor_name} (ID: ${result.rows[0].id})`);
        } else {
          console.log(`ℹ️  Already exists: ${distributorName}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${distributorName}:`, error.message);
      }
    }

    console.log('\n✅ All distributors processed successfully!');

    // Verify by listing all distributors
    const allDistributors = await client.query('SELECT id, distributor_name FROM distributors ORDER BY distributor_name');
    console.log(`\n📋 Total distributors in database: ${allDistributors.rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addDistributors();