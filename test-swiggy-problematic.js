import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testProblematicFile() {
  console.log('🧪 Testing problematic CSV file...');

  const file = {
    name: 'Problematic file (PO_1758265329897 (1).csv)',
    path: 'c:\\Users\\singh\\Downloads\\PO_1758265329897 (1).csv'
  };

  try {
    console.log(`\n📂 Testing ${file.name}`);

    if (!fs.existsSync(file.path)) {
      console.log(`❌ File not found: ${file.path}`);
      return;
    }

    // Test preview endpoint
    console.log('📋 Testing preview endpoint...');

    const csvBuffer = fs.readFileSync(file.path);
    const formData = new FormData();
    formData.append('file', csvBuffer, {
      filename: file.path.split('\\').pop(),
      contentType: 'text/csv'
    });

    const previewResponse = await fetch('http://localhost:5000/api/swiggy-pos/preview', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`📤 Preview response status: ${previewResponse.status}`);

    if (!previewResponse.ok) {
      const errorText = await previewResponse.text();
      console.error('❌ Preview failed:', errorText.substring(0, 1000));
      return;
    }

    const previewResult = await previewResponse.json();
    console.log('✅ Preview successful!');
    console.log(`📊 Found ${previewResult.totalPOs} POs`);

    // Show PO summary
    previewResult.poList.forEach((po, index) => {
      console.log(`  PO ${index + 1}: ${po.header.po_number} (${po.lines.length} items, Total: ${po.header.grand_total})`);
    });

    // Test confirm-insert endpoint with the problematic file
    console.log('\n🔄 Testing confirm-insert endpoint...');

    const confirmResponse = await fetch('http://localhost:5000/api/swiggy/confirm-insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        poList: previewResult.poList
      })
    });

    console.log(`📤 Confirm response status: ${confirmResponse.status}`);

    const responseText = await confirmResponse.text();
    console.log('📄 Raw confirm response (first 2000 chars):', responseText.substring(0, 2000));

    try {
      const confirmResult = JSON.parse(responseText);

      if (confirmResponse.ok) {
        console.log('✅ Confirm insert successful!');
        console.log(`📊 Results: Success: ${confirmResult.successCount}, Failed: ${confirmResult.failureCount}, Duplicates: ${confirmResult.duplicateCount || 0}`);
      } else {
        console.log('❌ Confirm insert failed!');
        console.log('💥 Error details:', JSON.stringify(confirmResult, null, 2));
      }

      if (confirmResult.results && confirmResult.results.length > 0) {
        console.log('📋 Detailed results:');
        confirmResult.results.forEach(result => {
          console.log(`  ${result.po_number}: ${result.status} - ${result.message?.substring(0, 100)}`);
        });
      }

    } catch (parseError) {
      console.error('❌ Failed to parse JSON response');
      console.error('💥 Parse error:', parseError.message);
    }

  } catch (error) {
    console.error(`❌ Error testing ${file.name}:`, error.message);
    console.error('Stack:', error.stack);
  }
}

testProblematicFile().catch(console.error);