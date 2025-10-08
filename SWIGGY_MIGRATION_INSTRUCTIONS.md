# Swiggy PO Database Migration Instructions

## Issue Fixed
The "operator does not exist: character varying = integer" error has been resolved!

## What Was Done
1. ✅ Added `unique_hsn_codes` field to the Swiggy PO header schema
2. ✅ Added `hsn_code` field to the Swiggy PO lines schema
3. ✅ Temporarily commented out both fields in database insertions to allow immediate PO uploads
4. ✅ Fixed all total amount calculation issues in parsers and database operations

## Your Swiggy POs Can Now Be Uploaded! 🎉

The app will work immediately for uploading Swiggy POs. The `unique_hsn_codes` and `hsn_code` fields are optional and commented out.

## Optional: Add Missing Columns to Database

If you want to store HSN codes for Swiggy POs, run these SQL commands in your PostgreSQL database:

```sql
-- Add unique_hsn_codes to header table
ALTER TABLE swiggy_po_header
ADD COLUMN IF NOT EXISTS unique_hsn_codes text[];

-- Add hsn_code to lines table
ALTER TABLE swiggy_po_lines
ADD COLUMN IF NOT EXISTS hsn_code varchar(20);
```

### How to Run the Migration

**Option 1: Using your database admin tool (pgAdmin, DBeaver, etc.)**
1. Connect to your database
2. Run the SQL command above

**Option 2: Using psql command line**
```bash
psql $DATABASE_URL -c "ALTER TABLE swiggy_po_header ADD COLUMN IF NOT EXISTS unique_hsn_codes text[]; ALTER TABLE swiggy_po_lines ADD COLUMN IF NOT EXISTS hsn_code varchar(20);"
```

**Option 3: Uncomment in Code (after adding the columns)**
After adding both columns to your database, uncomment these fields:
1. `unique_hsn_codes` in `server/swiggy-db-operations.ts` (lines 221-228)
2. `hsn_code` in `server/swiggy-db-operations.ts` (lines 281-283)

## Summary of All Fixes

### 1. Total Amount Display
- ✅ Fixed CSV parser to prioritize `PoAmount` from CSV
- ✅ Fixed Excel parser to set both `po_amount` and `grand_total`
- ✅ Updated database operations to trust parser values
- ✅ Enhanced frontend display with multiple fallbacks

### 2. Type Mismatch Errors
- ✅ Fixed `unique_hsn_codes` to always convert to string array
- ✅ Fixed `hsn_code` to always convert to string
- ✅ Temporarily disabled both fields in insertion until database migration

### 3. Database Schema
- ✅ Added `unique_hsn_codes text[]` to swiggyPos (header) schema
- ✅ Added `hsn_code varchar(20)` to swiggyPoLines schema

All Swiggy PO uploads should now work correctly with proper total amounts displayed! 🚀
