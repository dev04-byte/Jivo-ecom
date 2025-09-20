import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testSwiggyCSVAPI() {
  console.log('🧪 Testing Swiggy CSV API endpoints...');

  const files = [
    {
      name: 'Working file (PCHPO141863.csv)',
      path: 'c:\\Users\\singh\\Downloads\\PCHPO141863.csv'
    },
    {
      name: 'Problematic file (PO_1758265329897 (1).csv)',
      path: 'c:\\Users\\singh\\Downloads\\PO_1758265329897 (1).csv'
    }
  ];

  for (const file of files) {
    try {
      console.log(`\n📂 Testing ${file.name}`);

      if (!fs.existsSync(file.path)) {
        console.log(`❌ File not found: ${file.path}`);
        continue;
      }

      // Test preview endpoint first
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
        console.error('❌ Preview failed:', errorText.substring(0, 500));
        continue;
      }

      const previewResult = await previewResponse.json();
      console.log('✅ Preview successful!');
      console.log(`📊 Found ${previewResult.data.totalPOs} POs`);

      previewResult.data.poList.forEach((po, index) => {
        console.log(`  PO ${index + 1}: ${po.header.po_number} (${po.lines.length} items, Total: ${po.header.grand_total})`);
      });

      // Test confirm-insert endpoint
      console.log('\n🔄 Testing confirm-insert endpoint...');

      const confirmResponse = await fetch('http://localhost:5000/api/swiggy/confirm-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poList: previewResult.data.poList
        })
      });

      console.log(`📤 Confirm response status: ${confirmResponse.status}`);

      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text();
        console.error('❌ Confirm insert failed:', errorText.substring(0, 1000));

        // Try to parse as JSON for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error('💥 Error details:', JSON.stringify(errorJson, null, 2));
        } catch (parseError) {
          console.error('💥 Raw error response (first 1000 chars):', errorText.substring(0, 1000));
        }
      } else {
        const confirmResult = await confirmResponse.json();
        console.log('✅ Confirm insert successful!');
        console.log(`📊 Results: Success: ${confirmResult.successCount}, Failed: ${confirmResult.failureCount}, Duplicates: ${confirmResult.duplicateCount || 0}`);

        if (confirmResult.results && confirmResult.results.length > 0) {
          console.log('📋 Detailed results:');
          confirmResult.results.forEach(result => {
            console.log(`  ${result.po_number}: ${result.status} - ${result.message}`);
          });
        }
      }

    } catch (error) {
      console.error(`❌ Error testing ${file.name}:`, error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testSwiggyCSVAPI().catch(console.error);