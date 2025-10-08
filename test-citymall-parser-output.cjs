const fs = require('fs');
const path = require('path');

// Dynamically import the TypeScript file
async function testParser() {
  console.log('🧪 Testing CityMall Parser Output\n');
  console.log('='.repeat(80));

  try {
    // We need to use tsx to run the TypeScript file
    const { spawn } = require('child_process');

    // Create a temporary test script that imports and runs the parser
    const testScript = `
import { parseCityMallPO } from './server/citymall-parser';
import fs from 'fs';

const fileBuffer = fs.readFileSync('c:\\\\Users\\\\singh\\\\Downloads\\\\PO-1359161.xlsx');
const result = parseCityMallPO(fileBuffer, 'test-user');

console.log('\\n📊 PARSER OUTPUT:\\n');
console.log('='.repeat(80));
console.log('\\n📋 HEADER DATA:');
console.log(JSON.stringify(result.header, null, 2));

console.log('\\n📦 LINE ITEMS (First 3):');
result.lines.slice(0, 3).forEach((line, idx) => {
  console.log(\`\\nItem \${idx + 1}:\`, JSON.stringify(line, null, 2));
});

console.log('\\n📈 SUMMARY:');
console.log(\`Total Lines: \${result.lines.length}\`);
console.log(\`Total Quantity: \${result.header.total_quantity}\`);
console.log(\`Total Amount: \${result.header.total_amount}\`);
`;

    // Write the test script
    fs.writeFileSync('temp-citymall-test.ts', testScript);

    // Run it with tsx
    const child = spawn('npx', ['tsx', 'temp-citymall-test.ts'], {
      shell: true,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      // Clean up
      try {
        fs.unlinkSync('temp-citymall-test.ts');
      } catch (e) {}

      console.log('\\n='.repeat(80));
      console.log(`\\nTest completed with code: ${code}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

testParser();
