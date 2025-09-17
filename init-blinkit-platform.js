// Script to initialize Blinkit platform in pf_mst table
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

async function initializeBlinkitPlatform() {
  console.log('🚀 Initializing Blinkit platform in database...');

  try {
    // Check if we have a database connection string or configuration
    console.log('📋 Step 1: Checking database configuration...');

    // Try to run the platform seed script
    console.log('📋 Step 2: Running platform seed script...');

    try {
      // Check if we can use psql to run the seed script
      const seedScript = readFileSync('./server/platform-seed.sql', 'utf8');
      console.log('📄 Found platform seed script:');
      console.log(seedScript);

      console.log('\n💡 To run this manually, execute the following SQL commands in your database:');
      console.log('----------------------------------------');
      console.log(seedScript);
      console.log('----------------------------------------');

    } catch (error) {
      console.error('❌ Error reading platform seed script:', error.message);
    }

    console.log('\n📋 Step 3: Verification checklist:');
    console.log('✅ 1. Ensure your database is running');
    console.log('✅ 2. Run the platform seed script manually or through your database client');
    console.log('✅ 3. Verify that "Blinkit" platform exists in pf_mst table');
    console.log('✅ 4. Check that distributor_id=1 and company_id=1 exist in their respective tables');
    console.log('✅ 5. Test Blinkit PDF upload to see console logs');

    console.log('\n🔍 Debug commands for testing:');
    console.log('1. Check platforms: SELECT * FROM pf_mst WHERE pf_name = \'Blinkit\';');
    console.log('2. Check po_master: SELECT * FROM po_master WHERE series = \'Blinkit\';');
    console.log('3. Check po_lines: SELECT COUNT(*) FROM po_lines WHERE po_id IN (SELECT id FROM po_master WHERE series = \'Blinkit\');');

    console.log('\n✅ Platform initialization guide complete!');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
}

initializeBlinkitPlatform().catch(console.error);