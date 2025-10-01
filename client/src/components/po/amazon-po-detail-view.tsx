import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Package, DollarSign, Building, Truck, User, Hash } from "lucide-react";

interface AmazonPoHeaderData {
  po_number?: string;
  po_date?: string | Date;
  shipment_date?: string | Date;
  delivery_date?: string | Date;
  vendor_code?: string;
  vendor_name?: string;
  buyer_name?: string;
  currency?: string;
  total_amount?: string | number;
  tax_amount?: string | number;
  shipping_cost?: string | number;
  discount_amount?: string | number;
  net_amount?: string | number;
  status?: string;
  notes?: string;
  created_by?: string;
}

interface AmazonPoLineData {
  line_number?: number;
  asin?: string;
  sku?: string;
  product_name?: string;
  product_description?: string;
  category?: string;
  brand?: string;
  upc?: string;
  size?: string;
  color?: string;
  quantity_ordered?: number;
  unit_cost?: string | number;
  total_cost?: string | number;
  tax_rate?: string | number;
  tax_amount?: string | number;
  discount_percent?: string | number;
  discount_amount?: string | number;
  net_amount?: string | number;
  supplier_reference?: string;
  expected_delivery_date?: string | Date;
}

interface AmazonPoDetailViewProps {
  header: AmazonPoHeaderData;
  lines: AmazonPoLineData[];
  summary?: {
    totalItems: number;
    totalQuantity: number;
    totalAmount: string;
    detectedVendor?: string;
  };
}

export function AmazonPoDetailView({ header, lines, summary }: AmazonPoDetailViewProps) {
  // Debug logging
  console.log('🔍 AmazonPoDetailView - Header:', header);
  console.log('🔍 AmazonPoDetailView - Lines:', lines);
  console.log('🔍 AmazonPoDetailView - Summary:', summary);

  // Safety checks
  if (!header) {
    console.error('❌ AmazonPoDetailView - No header data provided');
    return <div>Error: No header data provided</div>;
  }

  if (!lines) {
    console.error('❌ AmazonPoDetailView - No lines data provided');
    return <div>Error: No lines data provided</div>;
  }
  const formatCurrency = (value: string | number | undefined, currency = 'INR'): string => {
    if (!value || value === '0' || value === 0) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '-';

    // Clean currency code (remove whitespace and normalize)
    const cleanCurrency = typeof currency === 'string' ? currency.trim().toUpperCase() : 'INR';

    // Format for Indian currency (always use manual formatting for INR to avoid locale issues)
    if (cleanCurrency === 'INR' || !cleanCurrency) {
      return '₹' + numValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // For other currencies, use safe Intl formatting with fallback
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: cleanCurrency,
        minimumFractionDigits: 2
      }).format(numValue);
    } catch (error) {
      console.warn('Currency formatting failed for:', cleanCurrency, 'Using fallback');
      // Fallback to simple formatting
      return cleanCurrency + ' ' + numValue.toFixed(2);
    }
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const parseAdditionalData = (supplierRef: string): any => {
    try {
      return JSON.parse(supplierRef);
    } catch {
      return null;
    }
  };

  try {
    return (
      <div className="space-y-6">
        {/* Header Information */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Amazon Purchase Order Details
          </CardTitle>
          <CardDescription>
            PO: {header.po_number || 'N/A'} | Status: <Badge variant="secondary">{header.status || 'Open'}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* PO Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Purchase Order Info
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">PO Number:</span> {header.po_number || '-'}</div>
                <div><span className="font-medium">Currency:</span> {header.currency || 'INR'}</div>
                <div><span className="font-medium">Created By:</span> {header.created_by || '-'}</div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Important Dates
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">PO Date:</span> {formatDate(header.po_date)}</div>
                <div><span className="font-medium">Shipment Date:</span> {formatDate(header.shipment_date)}</div>
                <div><span className="font-medium">Delivery Date:</span> {formatDate(header.delivery_date)}</div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Subtotal:</span> {formatCurrency(header.total_amount, header.currency)}</div>
                <div><span className="font-medium">Tax:</span> {formatCurrency(header.tax_amount, header.currency)}</div>
                <div><span className="font-medium">Shipping:</span> {formatCurrency(header.shipping_cost, header.currency)}</div>
                <div><span className="font-medium">Discount:</span> {formatCurrency(header.discount_amount, header.currency)}</div>
                <div className="border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-green-600 ml-2">
                    {formatCurrency(header.net_amount || header.total_amount, header.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Vendor Details
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Vendor Code:</span> {header.vendor_code || '-'}</div>
                <div><span className="font-medium">Vendor Name:</span> {header.vendor_name || '-'}</div>
                <div><span className="font-medium">Buyer:</span> {header.buyer_name || '-'}</div>
              </div>
            </div>

            {/* Summary Stats */}
            {summary && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Total Items:</span> {summary.totalItems}</div>
                  <div><span className="font-medium">Total Quantity:</span> {summary.totalQuantity.toLocaleString()}</div>
                  <div><span className="font-medium">Order Value:</span> {formatCurrency(summary.totalAmount, header.currency)}</div>
                  {summary.detectedVendor && (
                    <div><span className="font-medium">Detected Vendor:</span> {summary.detectedVendor}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {header.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Notes:</h4>
              <p className="text-sm text-gray-700">{header.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items ({lines.length})</CardTitle>
          <CardDescription>
            Detailed breakdown of all items in this Amazon purchase order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto overflow-y-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead className="min-w-[120px]">ASIN</TableHead>
                  <TableHead className="min-w-[120px]">SKU</TableHead>
                  <TableHead className="min-w-[300px]">Product Name</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="min-w-[120px]">Category</TableHead>
                  <TableHead className="min-w-[100px]">Brand</TableHead>
                  <TableHead className="min-w-[80px]">Size</TableHead>
                  <TableHead className="min-w-[80px]">Color</TableHead>
                  <TableHead className="min-w-[120px]">UPC</TableHead>
                  <TableHead className="text-right min-w-[80px]">Qty</TableHead>
                  <TableHead className="text-right min-w-[100px]">Unit Cost</TableHead>
                  <TableHead className="text-right min-w-[100px]">Total Cost</TableHead>
                  <TableHead className="text-right min-w-[80px]">Tax</TableHead>
                  <TableHead className="text-right min-w-[100px]">Net Amount</TableHead>
                  <TableHead className="min-w-[120px]">Delivery Date</TableHead>
                  <TableHead className="min-w-[150px]">Supplier Ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => {
                  const additionalData = line.supplier_reference ? parseAdditionalData(line.supplier_reference) : null;

                  return (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{line.line_number || index + 1}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {line.asin || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {line.sku || '-'}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="break-words" title={line.product_name}>
                          {line.product_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="break-words" title={line.product_description}>
                          {line.product_description || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{line.category || '-'}</TableCell>
                      <TableCell>{line.brand || '-'}</TableCell>
                      <TableCell>{line.size || '-'}</TableCell>
                      <TableCell>{line.color || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{line.upc || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {line.quantity_ordered?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.unit_cost, header.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(line.total_cost, header.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.tax_amount, header.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(line.net_amount || line.total_cost, header.currency)}
                      </TableCell>
                      <TableCell>{formatDate(line.expected_delivery_date)}</TableCell>
                      <TableCell className="max-w-[150px]">
                        <div className="truncate" title={line.supplier_reference}>
                          {line.supplier_reference || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {lines.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No line items found in this purchase order.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  } catch (error) {
    console.error('❌ AmazonPoDetailView - Render error:', error);
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-medium">Amazon PO Display Error</h3>
        <p className="text-red-600 text-sm mt-1">
          Unable to display Amazon PO details. Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <div className="mt-2 text-xs text-gray-600">
          <p>Header data: {header ? 'Available' : 'Missing'}</p>
          <p>Lines data: {lines ? `${lines.length} items` : 'Missing'}</p>
        </div>
      </div>
    );
  }
}