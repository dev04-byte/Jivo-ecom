import fs from 'fs';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

dotenv.config();

async function testAPIEndpoint() {
  try {
    console.log('📁 Reading CSV file...');
    const csvBuffer = fs.readFileSync('C:\\Users\\singh\\Downloads\\PO_5e98b644b15d1b70.csv');

    console.log('🚀 Testing upload endpoint...');

    // First test the upload/parse endpoint
    const formData = new FormData();
    formData.append('file', csvBuffer, {
      filename: 'PO_5e98b644b15d1b70.csv',
      contentType: 'text/csv'
    });
    formData.append('platform', 'zepto');

    const uploadResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`📤 Upload response status: ${uploadResponse.status}`);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload failed:', errorText);
      return;
    }

    const uploadText = await uploadResponse.text();
    console.log('📄 Raw response:', uploadText.substring(0, 500));

    let uploadResult;
    try {
      uploadResult = JSON.parse(uploadText);
      console.log('✅ Upload successful!');
      console.log('📊 Upload result:', JSON.stringify(uploadResult, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response');
      console.error('💥 Response was HTML/other format');
      return;
    }

    // If multiple POs, test the confirm-insert endpoint
    if (uploadResult.data && uploadResult.data.poList && uploadResult.data.poList.length > 0) {
      console.log('\n🔄 Testing confirm-insert endpoint...');

      for (let i = 0; i < uploadResult.data.poList.length; i++) {
        const po = uploadResult.data.poList[i];
        console.log(`\n📦 Inserting PO ${i + 1}/${uploadResult.data.poList.length}: ${po.header.po_number}`);

        const confirmResponse = await fetch('http://localhost:5000/api/zepto/confirm-insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            po_header: po.header,
            po_lines: po.lines
          })
        });

        console.log(`📤 Confirm response status: ${confirmResponse.status}`);

        if (!confirmResponse.ok) {
          const errorText = await confirmResponse.text();
          console.error(`❌ Confirm insert failed for PO ${po.header.po_number}:`, errorText);

          // Try to parse as JSON for more details
          try {
            const errorJson = JSON.parse(errorText);
            console.error('💥 Error details:', errorJson);
          } catch (parseError) {
            console.error('💥 Raw error response:', errorText);
          }
        } else {
          const confirmResult = await confirmResponse.json();
          console.log(`✅ Confirm insert successful for PO ${po.header.po_number}!`);
          console.log('📊 Confirm result:', JSON.stringify(confirmResult, null, 2));
        }
      }
    } else if (uploadResult.header && uploadResult.lines) {
      // Single PO case
      console.log('\n🔄 Testing confirm-insert endpoint for single PO...');

      const confirmResponse = await fetch('http://localhost:5000/api/zepto/confirm-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          po_header: uploadResult.header,
          po_lines: uploadResult.lines
        })
      });

      console.log(`📤 Confirm response status: ${confirmResponse.status}`);

      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text();
        console.error('❌ Confirm insert failed:', errorText);

        try {
          const errorJson = JSON.parse(errorText);
          console.error('💥 Error details:', errorJson);
        } catch (parseError) {
          console.error('💥 Raw error response:', errorText);
        }
      } else {
        const confirmResult = await confirmResponse.json();
        console.log('✅ Confirm insert successful!');
        console.log('📊 Confirm result:', JSON.stringify(confirmResult, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testAPIEndpoint();