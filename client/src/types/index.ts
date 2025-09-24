export interface ApiError {
  message: string;
  errors?: any[];
}

export interface SearchableItem {
  id: number;
  name: string;
  code: string;
  category?: string;
  subcategory?: string;
  gstRate?: number;
}

export interface POSummary {
  totalItems: number;
  totalQuantity: number;
  totalValueWithoutTax: number;
  totalValueWithTax: number;
}

export interface FlipkartGroceryPoHeader {
  id: number;
  po_number: string;
  supplier_name: string;
  supplier_address?: string | null;
  supplier_contact?: string | null;
  supplier_email?: string | null;
  supplier_gstin?: string | null;
  billed_to_address?: string | null;
  billed_to_gstin?: string | null;
  shipped_to_address?: string | null;
  shipped_to_gstin?: string | null;
  nature_of_supply?: string | null;
  nature_of_transaction?: string | null;
  po_expiry_date?: Date | null;
  category?: string | null;
  order_date: Date;
  mode_of_payment?: string | null;
  contract_ref_id?: string | null;
  contract_version?: string | null;
  credit_term?: string | null;
  total_quantity?: number | null;
  total_taxable_value?: string | null;
  total_tax_amount?: string | null;
  total_amount?: string | null;
  status: string;
  distributor?: string | null;
  area?: string | null;
  city?: string | null;
  region?: string | null;
  state?: string | null;
  dispatch_from?: string | null;
  created_by?: string | null;
  uploaded_by?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface FlipkartGroceryPoLines {
  id: number;
  header_id: number;
  line_number: number;
  title: string;
  brand?: string | null;
  fsn_isbn?: string | null;
  item_code?: string | null;
  hsn_code?: string | null;
  quantity: number;
  uom?: string | null;
  supplier_price?: string | null;
  tax_percentage?: string | null;
  tax_amount?: string | null;
  taxable_value?: string | null;
  total_amount?: string | null;
  pending_quantity?: number | null;
  required_by_date?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export type FlipkartGroceryPO = FlipkartGroceryPoHeader & {
  poLines: FlipkartGroceryPoLines[]
};

export interface DealsharePoHeader {
  id: number;
  po_number: string;
  po_created_date?: Date | null;
  po_delivery_date?: Date | null;
  po_expiry_date?: Date | null;
  shipped_by?: string | null;
  shipped_by_address?: string | null;
  shipped_by_gstin?: string | null;
  shipped_by_phone?: string | null;
  vendor_code?: string | null;
  shipped_to?: string | null;
  shipped_to_address?: string | null;
  shipped_to_gstin?: string | null;
  bill_to?: string | null;
  bill_to_address?: string | null;
  bill_to_gstin?: string | null;
  comments?: string | null;
  total_items?: number | null;
  total_quantity?: string | null;
  total_gross_amount?: string | null;
  uploaded_by?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface DealsharePoLines {
  id: number;
  po_header_id: number;
  line_number: number;
  sku?: string | null;
  product_name?: string | null;
  hsn_code?: string | null;
  quantity?: number | null;
  mrp_tax_inclusive?: string | null;
  buying_price?: string | null;
  gst_percent?: string | null;
  cess_percent?: string | null;
  gross_amount?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export type DealsharePO = DealsharePoHeader & {
  poItems: DealsharePoLines[]
};
