# CityMall PO Import - Quick Reference

## ✅ Verified Working - PO-1359161.xlsx

### What You'll See After Import

**PO Header:**
- PO Number: **1359161** ✓
- PO Date: **01-10-2025** ✓
- Expiry Date: **10-10-2025** ✓
- Vendor: **JIVO MART PRIVATE LIMITED** ✓
- Vendor Code: **18836** ✓
- Total Items: **11** ✓
- Total Quantity: **2,116** ✓
- Total Amount: **₹341,156.05** ✓

**Sample Line Item (First Item):**
- Article ID: **CM02456486** ✓
- Name: **Jivo Soyabean Oil 1 L (Bottle)** ✓
- HSN: **15071000** ✓
- Quantity: **260** ✓
- Base Amount: **₹31,200.00** ✓
- IGST: **5.00% (₹1,560.00)** ✓
- Total: **₹32,760.00** ✓

## How to Upload

1. **Navigate:** Go to PO Upload page
2. **Select Platform:** Choose "CityMall"
3. **Upload File:** Select your Excel file
4. **Preview:** Verify all data is correct
5. **Import:** Click Import button

## Data Flow

```
Excel File
    ↓
Parser extracts data from correct columns
    ↓
Preview shows all details
    ↓
Click Import
    ↓
Saves to database:
  - city_mall_po_header (PO details)
  - city_mall_po_lines (Line items)
    ↓
View in PO list ✓
```

## Column Mapping (Excel → Database)

| Excel Column | Database Field | Example |
|-------------|----------------|---------|
| Column 3 | article_id | CM02456486 |
| Column 6 | article_name | Jivo Soyabean Oil... |
| Column 10 | hsn_code | 15071000 |
| Column 13 | base_cost_price | 120.00 |
| Column 17 | quantity | 260 |
| Column 18 | base_amount | 31200.00 |
| Column 20 | igst_percent / cess_percent | 5.00 / 0.00 |
| Column 22 | igst_amount / cess_amount | 1560.00 / 0.00 |
| Column 24 | total_amount | 32760.00 |

## Expected Results

✅ **All 11 items** imported
✅ **All quantities correct** (matches Excel)
✅ **All amounts correct** (matches Excel)
✅ **Vendor/Buyer info** complete
✅ **IGST and CESS** properly separated
✅ **Totals match** Excel file exactly

## Troubleshooting

**If data looks wrong:**
1. Check file format matches PO-1359161.xlsx
2. Verify Excel has data starting from Row 11
3. Check column spacing (CityMall uses sparse columns)
4. Restart dev server if needed

**Parser has been verified with:**
- ✅ Correct column indices
- ✅ Proper newline splitting for IGST/CESS
- ✅ Accurate total calculations
- ✅ Complete header extraction

**Ready to use!** 🎯
