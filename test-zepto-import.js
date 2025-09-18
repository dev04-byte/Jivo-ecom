import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testZeptoImport() {
  try {
    console.log('🧪 Testing Zepto PO import functionality...');

    // Read the test CSV file
    const csvContent = fs.readFileSync('./test_zepto_po.csv');

    // Create form data
    const formData = new FormData();
    formData.append('file', csvContent, {
      filename: 'test_zepto_po.csv',
      contentType: 'text/csv'
    });
    formData.append('platform', 'zepto');

    // Upload the file for parsing
    console.log('📤 Uploading CSV file for parsing...');
    const uploadResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const parseResult = await uploadResponse.json();
    console.log('✅ Parse result:', JSON.stringify(parseResult, null, 2));

    // Test importing the parsed data
    if (parseResult.data && parseResult.data.poList) {
      console.log('📥 Importing multiple POs to database...');
      const importResponse = await fetch('http://localhost:5000/api/import/zepto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          poList: parseResult.data.poList
        })
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        throw new Error(`Import failed: ${importResponse.status} - ${errorText}`);
      }

      const importResult = await importResponse.json();
      console.log('🎉 Import result:', JSON.stringify(importResult, null, 2));
    } else if (parseResult.header && parseResult.lines) {
      console.log('📥 Importing single PO to database...');
      const importResponse = await fetch('http://localhost:5000/api/import/zepto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          header: parseResult.header,
          lines: parseResult.lines
        })
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        throw new Error(`Import failed: ${importResponse.status} - ${errorText}`);
      }

      const importResult = await importResponse.json();
      console.log('🎉 Import result:', JSON.stringify(importResult, null, 2));
    }

    console.log('✅ Zepto import test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testZeptoImport();