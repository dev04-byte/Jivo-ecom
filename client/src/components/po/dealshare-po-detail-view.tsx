import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Building, MapPin, Phone, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DealsharePoHeader, DealsharePoLines } from "@/types";

interface DealsharePO {
  po_number: string;
  po_created_date: string | Date | null;
  po_delivery_date: string | Date | null;
  po_expiry_date: string | Date | null;
  shipped_by: string;
  shipped_by_address: string;
  shipped_by_gstin: string;
  shipped_by_phone: string;
  vendor_code: string;
  shipped_to: string;
  shipped_to_address: string;
  shipped_to_gstin: string;
  bill_to: string;
  bill_to_address: string;
  bill_to_gstin: string;
  comments: string;
  total_items: number;
  total_quantity: string;
  total_gross_amount: string;
  status: string;
  platform?: { pf_name: string; id?: number };
}

interface DealshareOrderItem {
  id?: number;
  line_number: number;
  sku: string;
  product_name: string;
  hsn_code: string;
  quantity: number;
  mrp_tax_inclusive: string;
  buying_price: string;
  gst_percent: string;
  cess_percent: string;
  gross_amount: string;
  [key: string]: any; // Index signature for dynamic column access
}

interface DealsharePODetailViewProps {
  po: DealsharePO;
  orderItems: DealshareOrderItem[];
  showImportButton?: boolean;
  onNavigateBack?: () => void;
}

export function DealsharePODetailView({ po, orderItems, showImportButton = false, onNavigateBack }: DealsharePODetailViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return orderItems;

    return orderItems.filter(item =>
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderItems, searchTerm]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalAmount += parseFloat(item.gross_amount || '0');
      return acc;
    }, { totalQuantity: 0, totalAmount: 0 });
  }, [filteredItems]);

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '₹0.00' : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* PO Header Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-blue-500" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Shipped By</h4>
              <p className="text-gray-900">{po.shipped_by || 'N/A'}</p>
              <p className="text-gray-600 text-sm mt-1">{po.shipped_by_address || 'N/A'}</p>
              {po.shipped_by_gstin && (
                <p className="text-gray-600 text-sm">GSTIN: {po.shipped_by_gstin}</p>
              )}
              {po.shipped_by_phone && (
                <p className="text-gray-600 text-sm flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  {po.shipped_by_phone}
                </p>
              )}
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Shipped To</h4>
              <p className="text-gray-900">{po.shipped_to || 'N/A'}</p>
              <p className="text-gray-600 text-sm mt-1">{po.shipped_to_address || 'N/A'}</p>
              {po.shipped_to_gstin && (
                <p className="text-gray-600 text-sm">GSTIN: {po.shipped_to_gstin}</p>
              )}
            </div>
            {po.vendor_code && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Vendor Information</h4>
                  <p className="text-gray-600">Code: {po.vendor_code}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-500" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Created Date</h4>
                <p className="text-gray-900">{formatDate(po.po_created_date)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Delivery Date</h4>
                <p className="text-gray-900">{formatDate(po.po_delivery_date)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Expiry Date</h4>
                <p className="text-gray-900">{formatDate(po.po_expiry_date)}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Status</h4>
                <Badge variant="secondary">{po.status || 'Active'}</Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Total Items</h4>
                <p className="text-2xl font-bold text-blue-600">{po.total_items || 0}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Total Quantity</h4>
                <p className="text-2xl font-bold text-green-600">{po.total_quantity || 0}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Total Amount</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(po.total_gross_amount || '0')}</p>
              </div>
            </div>
            {po.comments && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Comments</h4>
                  <p className="text-gray-600 text-sm">{po.comments}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bill To Information */}
      {(po.bill_to || po.bill_to_address || po.bill_to_gstin) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-orange-500" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Bill To</h4>
              <p className="text-gray-900">{po.bill_to || 'N/A'}</p>
              <p className="text-gray-600 text-sm mt-1">{po.bill_to_address || 'N/A'}</p>
              {po.bill_to_gstin && (
                <p className="text-gray-600 text-sm">GSTIN: {po.bill_to_gstin}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Order Items ({filteredItems.length})
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search by SKU, product name, or HSN..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64"
              />
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No order items found</p>
              <p className="text-gray-400 text-sm">This purchase order doesn't have any line items</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-lg font-semibold">{filteredItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Quantity</p>
                    <p className="text-lg font-semibold">{totals.totalQuantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(totals.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Line #</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">SKU</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Product Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">HSN Code</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">Quantity</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">MRP (Tax Incl.)</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">Buying Price</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">GST %</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">CESS %</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">Gross Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{item.line_number}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">{item.sku || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{item.product_name || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">{item.hsn_code || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">{item.quantity?.toLocaleString() || 0}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.mrp_tax_inclusive || '0')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.buying_price || '0')}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">{item.gst_percent || '0'}%</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900 text-right">{item.cess_percent || '0'}%</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.gross_amount || '0')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}