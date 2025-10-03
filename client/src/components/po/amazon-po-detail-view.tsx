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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PO Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                <Hash className="h-4 w-4" />
                Purchase Order Info
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">PO Number:</span> <span className="text-blue-600 font-semibold">{header.po_number || '-'}</span></div>
                <div><span className="font-medium">Status:</span> <Badge variant="secondary">{header.status || 'Open'}</Badge></div>
                <div><span className="font-medium">Currency:</span> {header.currency || 'INR'}</div>
                <div><span className="font-medium">Vendor Code:</span> {header.vendor_code || '-'}</div>
                <div><span className="font-medium">Vendor Name:</span> {header.vendor_name || '-'}</div>
                <div><span className="font-medium">Created By:</span> {header.created_by || '-'}</div>
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-green-700">
                <Truck className="h-4 w-4" />
                Shipping & Delivery
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Ship To Location:</span> <span className="text-xs">{header.ship_to_location || '-'}</span></div>
                <div><span className="font-medium">Ship To Address:</span> <span className="text-xs">{header.ship_to_address || '-'}</span></div>
                <div><span className="font-medium">Bill To Location:</span> <span className="text-xs">{header.bill_to_location || '-'}</span></div>
                <div><span className="font-medium">Freight Terms:</span> {header.notes?.match(/Freight Terms: ([^.]+)/)?.[1] || '-'}</div>
                <div><span className="font-medium">Delivery Date:</span> {formatDate(header.delivery_date)}</div>
              </div>
            </div>

            {/* Dates & Timeline */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-orange-700">
                <CalendarDays className="h-4 w-4" />
                Important Dates
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Ordered On:</span> {formatDate(header.po_date)}</div>
                <div><span className="font-medium">Ship Window:</span> <span className="text-xs">{header.notes?.match(/Ship Window: ([^.]+)/)?.[1] || '-'}</span></div>
                <div><span className="font-medium">Shipment Date:</span> {formatDate(header.shipment_date)}</div>
                <div><span className="font-medium">Delivery Date:</span> {formatDate(header.delivery_date)}</div>
              </div>
            </div>

            {/* Payment & Financial */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-purple-700">
                <DollarSign className="h-4 w-4" />
                Payment & Financial
              </h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Payment Terms:</span> <span className="text-xs">{header.notes?.match(/Payment Terms: ([^.]+)/)?.[1] || '-'}</span></div>
                <div><span className="font-medium">Payment Method:</span> {header.notes?.match(/Payment Method: ([^.]+)/)?.[1] || '-'}</div>
                <div><span className="font-medium">Purchasing Entity:</span> <span className="text-xs">{header.buyer_name || '-'}</span></div>
                <div className="border-t pt-2">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-bold text-green-600 ml-2 text-lg">
                    {formatCurrency(header.net_amount || header.total_amount, header.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Stats */}
          {summary && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3 text-center">Order Summary Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Submitted</p>
                  <p className="text-xl font-bold text-blue-600">{summary.totalItems}</p>
                  <p className="text-xs text-gray-500">items</p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Total Quantity</p>
                  <p className="text-xl font-bold text-green-600">{summary.totalQuantity.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Accepted</p>
                  <p className="text-xl font-bold text-green-600">
                    {lines.reduce((sum, line) => {
                      const additionalData = line.supplier_reference ? parseAdditionalData(line.supplier_reference) : null;
                      return sum + (additionalData?.quantity_accepted || 0);
                    }, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Order Value</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(summary.totalAmount, header.currency)}</p>
                </div>
              </div>
            </div>
          )}

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
                  <TableHead className="min-w-[130px]">ASIN</TableHead>
                  <TableHead className="min-w-[150px]">External ID/SKU</TableHead>
                  <TableHead className="min-w-[150px]">Model Number</TableHead>
                  <TableHead className="min-w-[100px]">HSN Code</TableHead>
                  <TableHead className="min-w-[350px]">Title/Description</TableHead>
                  <TableHead className="min-w-[120px]">Window Type</TableHead>
                  <TableHead className="min-w-[120px]">Expected Date</TableHead>
                  <TableHead className="text-right min-w-[100px]">Qty Requested</TableHead>
                  <TableHead className="text-right min-w-[100px]">Qty Accepted</TableHead>
                  <TableHead className="text-right min-w-[100px]">Qty Received</TableHead>
                  <TableHead className="text-right min-w-[110px]">Qty Outstanding</TableHead>
                  <TableHead className="text-right min-w-[120px]">Unit Cost</TableHead>
                  <TableHead className="text-right min-w-[80px]">IGST %</TableHead>
                  <TableHead className="text-right min-w-[80px]">CESS %</TableHead>
                  <TableHead className="text-right min-w-[100px]">Tax Amt</TableHead>
                  <TableHead className="text-right min-w-[120px]">Landing Rate</TableHead>
                  <TableHead className="text-right min-w-[100px]">MRP</TableHead>
                  <TableHead className="text-right min-w-[100px]">Margin %</TableHead>
                  <TableHead className="text-right min-w-[130px]">Total Cost</TableHead>
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
                        <div className="max-w-[150px] break-words text-xs">
                          {line.sku || additionalData?.external_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="max-w-[150px] break-words text-xs">
                          {additionalData?.model_number || line.product_description || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {additionalData?.hsn_code || line.category || '-'}
                      </TableCell>
                      <TableCell className="max-w-[350px]">
                        <div className="break-words text-xs" title={line.product_name}>
                          {line.product_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {additionalData?.window_type || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {additionalData?.expected_date ? formatDate(additionalData.expected_date) : (line.expected_delivery_date ? formatDate(line.expected_delivery_date) : '-')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {additionalData?.quantity_requested?.toLocaleString() || line.quantity_ordered?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.quantity_accepted?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.quantity_received?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.quantity_outstanding?.toLocaleString() || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.unit_cost, header.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.igst_percent ? `${parseFloat(additionalData.igst_percent).toFixed(2)}%` : (line.tax_rate ? `${parseFloat(line.tax_rate.toString()).toFixed(2)}%` : '-')}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.cess_percent ? `${parseFloat(additionalData.cess_percent).toFixed(2)}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.tax_amount, header.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.landing_rate ? formatCurrency(additionalData.landing_rate, header.currency) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.mrp ? formatCurrency(additionalData.mrp, header.currency) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {additionalData?.margin_percent ? `${parseFloat(additionalData.margin_percent).toFixed(2)}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(line.total_cost, header.currency)}
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