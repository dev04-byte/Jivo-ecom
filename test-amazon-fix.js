const fetch = require('node-fetch');

// Test Amazon PO import with sample data
async function testAmazonImport() {
  console.log('🧪 Testing Amazon PO import fix...');

  try {
    // Sample Amazon PO data with safe date values
    const testData = {
      header: {
        po_number: "TEST664155NW",
        po_date: new Date('2024-09-01'),
        shipment_date: null,
        delivery_date: new Date('2024-10-01'),
        ship_to_location: "Test Location",
        ship_to_address: "Test Address",
        bill_to_location: "Test Bill Location",
        vendor_code: "TEST_VENDOR",
        vendor_name: "Amazon",
        buyer_name: "Test Buyer",
        currency: "INR",
        total_amount: "1000.00",
        tax_amount: "0",
        shipping_cost: "0",
        discount_amount: "0",
        net_amount: "1000.00",
        status: "Open",
        notes: "Test PO for validation fix",
        created_by: "test_user"
      },
      lines: [
        {
          line_number: 1,
          asin: "B00TEST123",
          sku: "TEST-SKU-001",
          product_name: "Test Product 1",
          product_description: "Test Description",
          category: "Test Category",
          brand: "Test Brand",
          upc: "",
          size: "",
          color: "",
          quantity_ordered: 10,
          unit_cost: "50.00",
          total_cost: "500.00",
          tax_rate: "0",
          tax_amount: "0",
          discount_percent: "0",
          discount_amount: "0",
          net_amount: "500.00",
          supplier_reference: "",
          expected_delivery_date: new Date('2024-10-01')
        },
        {
          line_number: 2,
          asin: "B00TEST456",
          sku: "TEST-SKU-002",
          product_name: "Test Product 2",
          product_description: "Test Description 2",
          category: "Test Category",
          brand: "Test Brand",
          upc: "",
          size: "",
          color: "",
          quantity_ordered: 10,
          unit_cost: "50.00",
          total_cost: "500.00",
          tax_rate: "0",
          tax_amount: "0",
          discount_percent: "0",
          discount_amount: "0",
          net_amount: "500.00",
          supplier_reference: "",
          expected_delivery_date: null // Test with null date
        }
      ]
    };

    console.log('📤 Sending test data to Amazon PO import endpoint...');

    const response = await fetch('http://localhost:5000/api/amazon-pos/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Import successful!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ Import failed:', errorText);

      // Try to parse as JSON for better error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('💥 Error details:', JSON.stringify(errorJson, null, 2));
      } catch (parseError) {
        console.error('💥 Raw error response:', errorText);
      }
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testAmazonImport();