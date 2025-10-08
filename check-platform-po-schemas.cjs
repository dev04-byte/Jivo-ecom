const { Pool } = require('pg');

async function checkPlatformSchemas() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    const platforms = [
      { name: 'Amazon', header: 'amazon_po_header', lines: 'amazon_po_lines', id: 6 },
      { name: 'Blinkit', header: 'blinkit_po_header', lines: 'blinkit_po_lines', id: 1 },
      { name: 'Zepto', header: 'zepto_po_header', lines: 'zepto_po_lines', id: 3 },
      { name: 'Zomato', header: 'zomato_po_header', lines: 'zomato_po_lines', id: 15 }
    ];

    for (const platform of platforms) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 ${platform.name} (Platform ID: ${platform.id})`);
      console.log(`${'='.repeat(80)}`);

      // Check header table
      console.log(`\n  ${platform.header} columns:`);
      try {
        const headerSchema = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [platform.header]);

        if (headerSchema.rows.length > 0) {
          console.table(headerSchema.rows);
        } else {
          console.log(`  ❌ Table ${platform.header} does not exist`);
        }
      } catch (e) {
        console.log(`  ❌ Error checking ${platform.header}:`, e.message);
      }

      // Check lines table
      console.log(`\n  ${platform.lines} columns:`);
      try {
        const linesSchema = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [platform.lines]);

        if (linesSchema.rows.length > 0) {
          console.table(linesSchema.rows);
        } else {
          console.log(`  ❌ Table ${platform.lines} does not exist`);
        }
      } catch (e) {
        console.log(`  ❌ Error checking ${platform.lines}:`, e.message);
      }
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkPlatformSchemas();
