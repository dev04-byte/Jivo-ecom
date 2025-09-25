import XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'c:\\Users\\singh\\Downloads\\Purchase Order PO-1357102 (2).xlsx';
const fileBuffer = fs.readFileSync(filePath);

console.log('=== XLSX.js Data Analysis ===');
console.log('=' * 80);

const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Get all data as array of arrays (like our parser does)
const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log(`Total rows: ${allData.length}`);

// Check header row (row 12 in XLSX.js, which is row 13 in Excel)
console.log('\nHeader row (index 12):');
const headerRow = allData[12];
console.log('Length:', headerRow.length);
for (let i = 0; i < headerRow.length; i++) {
  if (headerRow[i]) {
    console.log(`  Index ${i}: "${headerRow[i]}"`);
  }
}

// Check data rows
console.log('\nData rows:');
for (let rowIdx = 13; rowIdx <= 17; rowIdx++) {
  console.log(`\nRow ${rowIdx} (Excel row ${rowIdx + 1}):`);
  const row = allData[rowIdx];
  if (row) {
    console.log('Length:', row.length);
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== undefined && row[i] !== null && row[i] !== '') {
        console.log(`  Index ${i}: ${row[i]}`);
      }
    }
  }
}

console.log('\n=== CORRECT MAPPING FOR PARSER ===');
const firstDataRow = allData[13];
if (firstDataRow) {
  // Find the correct indices
  let sNoIdx = -1, articleIdIdx = -1, articleNameIdx = -1, hsnIdx = -1;
  let mrpIdx = -1, baseCostIdx = -1, quantityIdx = -1, baseAmountIdx = -1;
  let igstCessIdx = -1, igstCessAmountIdx = -1, totalIdx = -1;

  for (let i = 0; i < firstDataRow.length; i++) {
    const val = firstDataRow[i];
    if (val !== undefined && val !== null && val !== '') {
      if (i === 0) sNoIdx = i;
      else if (i === 1) articleIdIdx = i;
      else if (typeof val === 'string' && val.includes('Jivo')) articleNameIdx = i;
      else if (typeof val === 'string' && val.length === 8 && /^\d+$/.test(val)) hsnIdx = i;
      else if (val === 560) mrpIdx = i;
      else if (val === 159.05) baseCostIdx = i;
      else if (val === 160) quantityIdx = i;
      else if (val === 25448) baseAmountIdx = i;
      else if (typeof val === 'string' && val.includes('5.00')) igstCessIdx = i;
      else if (typeof val === 'string' && val.includes('1272.40')) igstCessAmountIdx = i;
      else if (val === 26720.4) totalIdx = i;
    }
  }

  console.log(`S.No: row[${sNoIdx}]`);
  console.log(`Article ID: row[${articleIdIdx}]`);
  console.log(`Article Name: row[${articleNameIdx}]`);
  console.log(`HSN Code: row[${hsnIdx}]`);
  console.log(`MRP: row[${mrpIdx}]`);
  console.log(`Base Cost Price: row[${baseCostIdx}]`);
  console.log(`Quantity: row[${quantityIdx}]`);
  console.log(`Base Amount: row[${baseAmountIdx}]`);
  console.log(`IGST/CESS %: row[${igstCessIdx}]`);
  console.log(`IGST/CESS Amount: row[${igstCessAmountIdx}]`);
  console.log(`Total: row[${totalIdx}]`);
}