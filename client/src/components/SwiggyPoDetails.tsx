import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Package, Hash, IndianRupee } from "lucide-react";

interface SwiggyPo {
  id: number;
  po_number: string;
  entity?: string | null;
  facility_id?: string | null;
  facility_name?: string | null;
  city?: string | null;
  po_date: string | null;
  po_modified_at?: string | null;
  po_release_date: string | null;
  expected_delivery_date: string | null;
  po_expiry_date: string | null;
  supplier_code?: string | null;
  vendor_name: string | null;
  po_amount?: string | null;
  payment_terms: string | null;
  otb_reference_number?: string | null;
  internal_external_po?: string | null;
  total_items: number;
  total_quantity: number;
  total_taxable_value: string | number | null;
  total_tax_amount: string | number | null;
  grand_total: string | number | null;
  unique_hsn_codes: string[] | null;
  status: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  poLines: Array<{
    id: number;
    po_id: number;
    line_number: number;
    item_code: string;
    item_description: string;
    category_id?: string | null;
    brand_name?: string | null;
    hsn_code: string | null;
    quantity: number;
    received_qty?: number;
    balanced_qty?: number;
    mrp: string | number | null;
    unit_base_cost: string | number | null;
    taxable_value: string | number | null;
    tax_amount?: string | number | null;
    cgst_rate: string | number | null;
    cgst_amount: string | number | null;
    sgst_rate: string | number | null;
    sgst_amount: string | number | null;
    igst_rate: string | number | null;
    igst_amount: string | number | null;
    cess_rate: string | number | null;
    cess_amount: string | number | null;
    additional_cess: string | number | null;
    total_tax_amount: string | number | null;
    line_total: string | number | null;
    expected_delivery_date?: string | null;
    po_expiry_date?: string | null;
    otb_reference_number?: string | null;
    internal_external_po?: string | null;
    po_ageing?: number;
    reference_po_number?: string | null;
    created_at: string;
  }>;
}

interface SwiggyPoDetailsProps {
  po: SwiggyPo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SwiggyPoDetails({ po, open, onOpenChange }: SwiggyPoDetailsProps) {
  if (!po) return null;

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;

    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'delivered':
        return <Badge variant="secondary">Delivered</Badge>;
      case 'imported':
        return <Badge variant="default" className="bg-green-500">Imported</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono break-all">PO #{po.po_number}</DialogTitle>
          <DialogDescription>
            {po.total_items || po.poLines?.length || 0} Items
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Complete PO Header - All CSV Fields</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div>
              <span className="text-xs text-gray-500 block mb-1">PO Number</span>
              <div className="font-semibold text-blue-600 break-all">{po.po_number}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Entity</span>
              <div className="font-medium text-gray-800">{po.entity || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Facility ID</span>
              <div className="font-medium text-gray-800">{po.facility_id || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Facility Name</span>
              <div className="font-medium text-gray-800">{po.facility_name || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">City</span>
              <div className="font-medium text-gray-800">{po.city || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">PO Created At</span>
              <div className="font-medium text-gray-800">{po.po_date ? format(new Date(po.po_date), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">PO Modified At</span>
              <div className="font-medium text-gray-800">{po.po_modified_at ? format(new Date(po.po_modified_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Status</span>
              <div>{getStatusBadge(po.status)}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Supplier Code</span>
              <div className="font-medium text-gray-800">{po.supplier_code || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Vendor Name</span>
              <div className="font-medium text-gray-800">{po.vendor_name || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">PO Amount</span>
              <div className="font-semibold text-green-600">₹{po.po_amount || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Payment Terms</span>
              <div className="font-medium text-gray-800 text-xs">{po.payment_terms || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Expected Delivery</span>
              <div className="font-medium text-gray-800">{po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'MMM dd, yyyy') : 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">PO Expiry Date</span>
              <div className="font-medium text-gray-800">{po.po_expiry_date ? format(new Date(po.po_expiry_date), 'MMM dd, yyyy') : 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">OTB Reference</span>
              <div className="font-medium text-gray-800 text-xs break-all">{po.otb_reference_number || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">Internal/External</span>
              <div className="font-medium text-gray-800">{po.internal_external_po || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-medium text-sm mb-1">Total Items</div>
            <div className="text-2xl font-bold text-blue-700">{po.total_items || po.poLines?.length || 0}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-medium text-sm mb-1">Total Quantity</div>
            <div className="text-2xl font-bold text-green-700">{po.total_quantity || po.poLines?.reduce((sum, line) => sum + (line.quantity || 0), 0) || 0}</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 font-medium text-sm mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-purple-700">
              ₹{(() => {
                // Use po_amount if available (this is the correct total from CSV)
                if (po.po_amount) {
                  return (typeof po.po_amount === 'string' ? parseFloat(po.po_amount) : po.po_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                // Otherwise use grand_total
                if (po.grand_total) {
                  return (typeof po.grand_total === 'string' ? parseFloat(po.grand_total) : po.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                // Calculate from line items as last resort
                const calculatedTotal = po.poLines?.reduce((sum, line) => {
                  if (line.line_total) {
                    return sum + (typeof line.line_total === 'string' ? parseFloat(line.line_total) : line.line_total);
                  }
                  return sum;
                }, 0) || 0;

                return calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-orange-600 font-medium text-sm mb-1">Total Weight</div>
            <div className="text-2xl font-bold text-orange-700">Not available</div>
          </div>
        </div>

        {po.unique_hsn_codes && po.unique_hsn_codes.length > 0 && po.unique_hsn_codes.some(hsn => hsn && hsn.trim()) && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">HSN Codes:</div>
            <div className="flex flex-wrap gap-2">
              {po.unique_hsn_codes.filter(hsn => hsn && hsn.trim()).map((hsn, index) => (
                <Badge key={index} variant="outline">
                  <Hash className="h-3 w-3 mr-1" />
                  {hsn}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {po.payment_terms && (
          <div className="space-y-1 mb-4">
            <div className="text-sm font-medium">Payment Terms</div>
            <div className="text-gray-600">{po.payment_terms}</div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Complete Line Items Data</h3>
        </div>

        {/* Header showing total items count */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Showing all {po.poLines?.length || 0} line items
            </span>
            <span className="text-xs text-blue-600">
              Scroll horizontally and vertically to view all data
            </span>
          </div>
        </div>

        {/* Complete scrollable table with ALL CSV columns */}
        <div className="border border-slate-200 rounded-lg bg-white">
          <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white border-b-2 border-slate-300 z-10">
                <TableRow>
                  <TableHead className="w-12 min-w-[50px] bg-white">#</TableHead>
                  <TableHead className="min-w-[120px] bg-white">Item Code</TableHead>
                  <TableHead className="min-w-[300px] bg-white">Description</TableHead>
                  <TableHead className="min-w-[180px] bg-white">Category</TableHead>
                  <TableHead className="min-w-[100px] bg-white">Brand</TableHead>
                  <TableHead className="text-right min-w-[80px] bg-white">Ordered Qty</TableHead>
                  <TableHead className="text-right min-w-[100px] bg-white">Received Qty</TableHead>
                  <TableHead className="text-right min-w-[100px] bg-white">Balanced Qty</TableHead>
                  <TableHead className="text-right min-w-[100px] bg-white">MRP</TableHead>
                  <TableHead className="text-right min-w-[120px] bg-white">Unit Base Cost</TableHead>
                  <TableHead className="text-right min-w-[120px] bg-white">Taxable Value</TableHead>
                  <TableHead className="text-right min-w-[100px] bg-white">Tax Amount</TableHead>
                  <TableHead className="text-right min-w-[120px] bg-white">Line Total</TableHead>
                  <TableHead className="min-w-[130px] bg-white">Expected Delivery</TableHead>
                  <TableHead className="min-w-[120px] bg-white">PO Expiry</TableHead>
                  <TableHead className="min-w-[180px] bg-white">OTB Reference</TableHead>
                  <TableHead className="min-w-[120px] bg-white">Internal/External</TableHead>
                  <TableHead className="text-right min-w-[80px] bg-white">Ageing</TableHead>
                  <TableHead className="min-w-[120px] bg-white">Reference PO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.poLines.map((line) => (
                  <TableRow key={line.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold">{line.line_number}</TableCell>
                    <TableCell className="font-mono text-xs">{line.item_code}</TableCell>
                    <TableCell title={line.item_description} className="min-w-[300px]">
                      <div className="whitespace-normal break-words">{line.item_description}</div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {line.category_id || 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {line.brand_name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">{line.quantity || 0}</TableCell>
                    <TableCell className="text-right text-gray-600">{line.received_qty || 0}</TableCell>
                    <TableCell className="text-right text-gray-600">{line.balanced_qty || 0}</TableCell>
                    <TableCell className="text-right font-medium text-green-700">
                      {line.mrp ? `₹${(typeof line.mrp === 'string' ? parseFloat(line.mrp) : line.mrp).toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {line.unit_base_cost ? `₹${(typeof line.unit_base_cost === 'string' ? parseFloat(line.unit_base_cost) : line.unit_base_cost).toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {line.taxable_value ? `₹${(typeof line.taxable_value === 'string' ? parseFloat(line.taxable_value) : line.taxable_value).toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {line.total_tax_amount ? `₹${(typeof line.total_tax_amount === 'string' ? parseFloat(line.total_tax_amount) : line.total_tax_amount).toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700 bg-green-50">
                      {line.line_total ? `₹${(typeof line.line_total === 'string' ? parseFloat(line.line_total) : line.line_total).toFixed(2)}` : '₹0.00'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {line.expected_delivery_date ? format(new Date(line.expected_delivery_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {line.po_expiry_date ? format(new Date(line.po_expiry_date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {line.otb_reference_number || 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {line.internal_external_po || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-600">{line.po_ageing || 0}</TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {line.reference_po_number || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500 italic">
          💡 Scroll horizontally to view all CSV fields. All columns from the original CSV are displayed.
        </div>

        {/* Additional Line Item Details Section */}
        {po.poLines.some(line => line.otb_reference_number || line.internal_external_po || line.po_ageing !== undefined) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Line Item Information</h4>
            <div className="space-y-2">
              {po.poLines.map((line, index) => (
                <div key={line.id} className="text-xs border-b pb-2 last:border-0">
                  <div className="font-medium text-gray-800">Item {index + 1}: {line.item_code}</div>
                  <div className="grid grid-cols-3 gap-4 mt-1">
                    {line.otb_reference_number && (
                      <div>
                        <span className="text-gray-500">OTB Reference:</span> {line.otb_reference_number}
                      </div>
                    )}
                    {line.internal_external_po && (
                      <div>
                        <span className="text-gray-500">Type:</span> {line.internal_external_po}
                      </div>
                    )}
                    {line.po_ageing !== undefined && (
                      <div>
                        <span className="text-gray-500">Ageing:</span> {line.po_ageing} days
                      </div>
                    )}
                    {line.expected_delivery_date && (
                      <div>
                        <span className="text-gray-500">Item Delivery:</span> {format(new Date(line.expected_delivery_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {line.reference_po_number && (
                      <div>
                        <span className="text-gray-500">Ref PO:</span> {line.reference_po_number}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-start">
            <div className="space-y-2 text-sm">
              {po.expected_delivery_date && (
                <div>
                  <span className="text-gray-600">Expected Delivery:</span>{' '}
                  {format(new Date(po.expected_delivery_date), 'MMM dd, yyyy')}
                </div>
              )}
              {po.po_expiry_date && (
                <div>
                  <span className="text-gray-600">PO Expiry:</span>{' '}
                  {format(new Date(po.po_expiry_date), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            <div className="space-y-2 text-right">
              {po.total_taxable_value && (typeof po.total_taxable_value === 'string' ? parseFloat(po.total_taxable_value) : po.total_taxable_value) > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-gray-600">Taxable Value:</span>
                  <span className="font-medium">
                    ₹{(typeof po.total_taxable_value === 'string' ? parseFloat(po.total_taxable_value) : po.total_taxable_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {po.total_tax_amount && (typeof po.total_tax_amount === 'string' ? parseFloat(po.total_tax_amount) : po.total_tax_amount) > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="font-medium">
                    ₹{(typeof po.total_tax_amount === 'string' ? parseFloat(po.total_tax_amount) : po.total_tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-8 text-lg font-bold">
                <span>Grand Total:</span>
                <span>
                  ₹{po.grand_total ? (typeof po.grand_total === 'string' ? parseFloat(po.grand_total) : po.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}