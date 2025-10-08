// Test Excel date serial number conversion
function parseExcelDate(dateValue) {
  if (!dateValue || typeof dateValue !== 'number') {
    return null;
  }

  console.log(`🔍 Converting Excel serial number: ${dateValue}`);

  // Excel stores dates as serial numbers starting from January 1, 1900 (= day 1)
  // But Excel has a bug where it treats 1900 as a leap year (it's not)
  // This means for dates after Feb 28, 1900, the serial number is off by 1

  // Create a base date of January 1, 1900
  const baseDate = new Date(1900, 0, 1); // January 1, 1900

  // Add the days (minus 1 because Excel counts from day 1, not day 0)
  let daysToAdd = dateValue - 1;

  // Account for Excel's leap year bug - if after day 59 (Feb 28, 1900), subtract 1
  if (dateValue > 59) {
    daysToAdd = dateValue - 2; // Subtract 2 to account for both day 1 offset and leap year bug
  }

  const jsDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

  console.log(`📅 Converted ${dateValue} to: ${jsDate.toISOString()}`);
  console.log(`📅 Human readable: ${jsDate.toDateString()}`);

  return jsDate;
}

// Test with the Excel serial number from the Amazon PO
console.log("Testing Excel date conversion for Amazon PO:");
const testDate = parseExcelDate(45926);
console.log("Expected around: October 2025");