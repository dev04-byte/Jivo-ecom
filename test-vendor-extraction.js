import XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'c:\\Users\\singh\\Downloads\\Purchase Order PO-1357102 (2).xlsx';
const fileBuffer = fs.readFileSync(filePath);

console.log('=== VENDOR INFORMATION EXTRACTION TEST ===');

const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log('\nAnalyzing first 12 rows for vendor info...');

for (let i = 0; i < Math.min(12, rawData.length); i++) {
  const row = rawData[i];
  console.log(`\nRow ${i}:`, row.slice(0, 10));

  // Check specific patterns
  if (row && row.length > 0) {
    const firstCol = String(row[0] || '').toLowerCase().trim();

    if (firstCol.includes('issued to')) {
      console.log(`  🏢 VENDOR NAME FOUND: "${row[4] || row[1] || 'N/A'}"`);
    }
    if (firstCol.includes('vendor code')) {
      console.log(`  🏷️ VENDOR CODE FOUND: "${row[4] || row[1] || 'N/A'}"`);
    }
    if (firstCol === 'gst' && i > 6) {
      console.log(`  📋 VENDOR GST FOUND: "${row[4] || row[1] || 'N/A'}"`);
    }
    if (firstCol.includes('contact person')) {
      console.log(`  👤 CONTACT PERSON: "${row[4] || row[1] || 'N/A'}"`);
    }
    if (firstCol.includes('address')) {
      console.log(`  📍 ADDRESS: "${row[4] || row[1] || 'N/A'}"`);
    }
    if (firstCol.includes('vendor contact')) {
      console.log(`  📞 CONTACT NUMBER: "${row[4] || row[1] || 'N/A'}"`);
    }
  }
}

// Check for PO info
console.log('\n=== PO INFORMATION ===');
for (let i = 0; i < Math.min(20, rawData.length); i++) {
  const row = rawData[i];
  for (let j = 0; j < row.length; j++) {
    const cellValue = String(row[j] || '');
    if (cellValue.includes('Purchase Order PO-')) {
      console.log(`PO INFO FOUND at row ${i}, col ${j}:`);
      console.log(cellValue);
      break;
    }
  }
}