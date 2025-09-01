const { Client } = require('pg');

async function manualInsertTest() {
  console.log('🔍 Manual Database Insert Test...');
  
  // Database connection (using same config as the app)
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Step 1: Check table structure and existing data
    console.log('\n📊 Checking distributors table structure...');
    const distributorColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'distributors' 
      ORDER BY ordinal_position
    `);
    console.log('Distributors columns:', distributorColumns.rows);
    
    console.log('\n📊 Checking existing distributors...');
    const distributors = await client.query('SELECT * FROM distributors ORDER BY id LIMIT 3');
    console.log('Available distributors:', distributors.rows);

    console.log('\n📊 Checking platforms table structure...');
    const platformColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'platforms' 
      ORDER BY ordinal_position
    `);
    console.log('Platform columns:', platformColumns.rows);
    
    console.log('\n📊 Checking existing platforms...');
    const platforms = await client.query('SELECT * FROM platforms ORDER BY id LIMIT 3');
    console.log('Available platforms:', platforms.rows);

    console.log('\n📊 Checking po_master table structure...');
    const poMasterColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'po_master' 
      ORDER BY ordinal_position
    `);
    console.log('po_master columns:', poMasterColumns.rows);
    
    console.log('\n📊 Checking po_lines table structure...');
    const poLinesColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'po_lines' 
      ORDER BY ordinal_position
    `);
    console.log('po_lines columns:', poLinesColumns.rows);
    
    console.log('\n📊 Checking po_attachments table structure...');
    const poAttachmentsColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'po_attachments' 
      ORDER BY ordinal_position
    `);
    console.log('po_attachments columns:', poAttachmentsColumns.rows);
    
    console.log('\n📊 Checking po_attachments constraints...');
    const constraints = await client.query(`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conname = 'check_po_type'
    `);
    console.log('po_type constraints:', constraints.rows);

    // Step 2: Manual raw insert into po_master
    const testPO = {
      platform_id: 1,
      vendor_po_number: 'MANUAL-TEST-' + Date.now(),
      distributor_id: distributors.rows[0]?.id || 9, // Use first available distributor
      series: 'PO',
      company_id: 6,
      po_date: new Date(),
      status_id: 1,
      region: 'TEST REGION',
      area: 'TEST AREA',
      state_id: 1,
      district_id: 1,
      dispatch_from: 'MAYAPURI'
    };

    console.log('\n📝 Inserting PO Master with data:', testPO);
    
    const insertPoQuery = `
      INSERT INTO po_master (
        platform_id, vendor_po_number, distributor_id, series, company_id, 
        po_date, status_id, region, area, state_id, district_id, dispatch_from
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, vendor_po_number
    `;
    
    const poResult = await client.query(insertPoQuery, [
      testPO.platform_id,
      testPO.vendor_po_number,
      testPO.distributor_id,
      testPO.series,
      testPO.company_id,
      testPO.po_date,
      testPO.status_id,
      testPO.region,
      testPO.area,
      testPO.state_id,
      testPO.district_id,
      testPO.dispatch_from
    ]);
    
    const createdPO = poResult.rows[0];
    console.log('✅ Created PO Master:', createdPO);

    // Step 3: Manual raw insert into po_lines (using actual schema)
    const testLine = {
      po_id: createdPO.id,
      platform_product_code_id: 1, // This must be an integer ID
      quantity: 5,
      basic_amount: 100.00,
      tax: 18.00,
      landing_amount: 118.00,
      total_amount: 118.00,
      total_liter: 5.00,
      status: 1,
      remark: 'Manual Test Item - TEST001 - SAP001' // Store text data in remark field
    };

    console.log('\n📝 Inserting PO Line with data:', testLine);
    
    const insertLineQuery = `
      INSERT INTO po_lines (
        po_id, platform_product_code_id, quantity,
        basic_amount, tax, landing_amount, total_amount, total_liter, status, remark
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, remark
    `;
    
    const lineResult = await client.query(insertLineQuery, [
      testLine.po_id,
      testLine.platform_product_code_id,
      testLine.quantity,
      testLine.basic_amount,
      testLine.tax,
      testLine.landing_amount,
      testLine.total_amount,
      testLine.total_liter,
      testLine.status,
      testLine.remark
    ]);
    
    const createdLine = lineResult.rows[0];
    console.log('✅ Created PO Line:', createdLine);

    // Step 4: Manual raw insert into po_attachments
    const testAttachment = {
      po_id: createdPO.id,
      po_type: 'PURCHASE_ORDER',
      file_name: 'manual-test-file.txt',
      original_name: 'manual-test-file.txt',
      file_path: 'attachments/po/manual-test-file.txt',
      file_size: 1024,
      mime_type: 'text/plain',
      uploaded_by: 1,
      is_active: true
    };

    console.log('\n📎 Inserting PO Attachment with data:', testAttachment);
    
    const insertAttachmentQuery = `
      INSERT INTO po_attachments (
        po_id, po_type, file_name, original_name, file_path,
        file_size, mime_type, uploaded_by, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, file_name
    `;
    
    const attachmentResult = await client.query(insertAttachmentQuery, [
      testAttachment.po_id,
      testAttachment.po_type,
      testAttachment.file_name,
      testAttachment.original_name,
      testAttachment.file_path,
      testAttachment.file_size,
      testAttachment.mime_type,
      testAttachment.uploaded_by,
      testAttachment.is_active
    ]);
    
    const createdAttachment = attachmentResult.rows[0];
    console.log('✅ Created PO Attachment:', createdAttachment);

    // Step 5: Verify the complete record
    console.log('\n🔍 Verifying complete PO record...');
    const verifyQuery = `
      SELECT 
        pm.id, pm.vendor_po_number, pm.distributor_id, pm.region, pm.area,
        pl.remark, pl.quantity, pl.total_amount,
        pa.file_name, pa.file_size
      FROM po_master pm
      LEFT JOIN po_lines pl ON pm.id = pl.po_id
      LEFT JOIN po_attachments pa ON pm.id = pa.po_id
      WHERE pm.id = $1
    `;
    
    const verification = await client.query(verifyQuery, [createdPO.id]);
    console.log('🎉 Complete PO Record:', verification.rows);

    console.log('\n✅ MANUAL INSERT TEST SUCCESSFUL!');
    console.log(`📊 Created PO ID: ${createdPO.id}`);
    console.log(`📊 PO Number: ${createdPO.vendor_po_number}`);
    console.log(`📦 Items: ${verification.rows.length}`);
    console.log(`📎 Attachments: ${verification.rows.filter(r => r.file_name).length}`);

  } catch (error) {
    console.error('❌ Manual insert test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
manualInsertTest();