import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ZomatoPO {
  po_number: string;
  po_date: string | Date | null;
  expected_delivery_date?: string | Date | null;
  account_number?: string;
  vendor_id?: string;
  bill_from_name?: string;
  bill_from_address?: string;
  bill_from_gstin?: string;
  ship_to_name?: string;
  ship_to_address?: string;
  ship_to_gstin?: string;
  total_items?: number;
  total_quantity?: string;
  grand_total?: string;
  total_tax_amount?: string;
  status: string;
  platform?: { pf_name: string; id?: number };
}

interface ZomatoOrderItem {
  id?: number;
  line_number?: number;
  product_number?: string;
  product_name?: string;
  hsn_code?: string;
  quantity_ordered?: string;
  price_per_unit?: string;
  uom?: string;
  gst_rate?: string;
  total_tax_amount?: string;
  line_total?: string;
  total_amount?: string;
  quantity?: number;
  sap_code?: string;
  item_name?: string;
  basic_rate?: string;
  landing_rate?: string;
  [key: string]: any;
}

interface ZomatoPODetailViewProps {
  po: ZomatoPO;
  orderItems: ZomatoOrderItem[];
}

export function ZomatoPODetailView({ po, orderItems }: ZomatoPODetailViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Filter and paginate items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return orderItems;
    return orderItems.filter(item =>
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sap_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderItems, searchTerm]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Define Zomato-specific columns (excluding mrp, cess, gross_amount)
  const lineItemColumns = useMemo(() => {
    const columns = [
      { key: 'line_number', label: 'Line No', width: '100px' },
      { key: 'product_number', label: 'Product Number', width: '140px' },
      { key: 'sap_code', label: 'SAP Code', width: '140px' },
      { key: 'product_name', label: 'Product Name', width: '350px' },
      { key: 'item_name', label: 'Item Name', width: '350px' },
      { key: 'hsn_code', label: 'HSN Code', width: '120px' },
      { key: 'quantity_ordered', label: 'Quantity', width: '100px' },
      { key: 'quantity', label: 'Qty', width: '100px' },
      { key: 'uom', label: 'UoM', width: '100px' },
      { key: 'price_per_unit', label: 'Price Per Unit', width: '130px' },
      { key: 'basic_rate', label: 'Basic Rate', width: '130px' },
      { key: 'gst_rate', label: 'GST Rate (%)', width: '120px' },
      { key: 'total_tax_amount', label: 'Tax Amount', width: '130px' },
      { key: 'line_total', label: 'Line Total', width: '140px' },
      { key: 'total_amount', label: 'Total', width: '140px' },
      { key: 'landing_rate', label: 'Landing Rate', width: '140px' }
    ];

    // Filter to only show columns that have data
    return columns.filter(col =>
      orderItems.some(item => item[col.key] !== null && item[col.key] !== undefined && item[col.key] !== '')
    );
  }, [orderItems]);

  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalBasicAmount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    orderItems.forEach(item => {
      const quantity = parseFloat(String(item.quantity_ordered || item.quantity || 0));
      const pricePerUnit = parseFloat(String(item.price_per_unit || item.basic_rate || '0'));
      const taxAmount = parseFloat(String(item.total_tax_amount || '0'));
      const lineTotal = parseFloat(String(item.line_total || item.total_amount || item.landing_rate || '0'));

      totalQuantity += quantity;
      totalBasicAmount += pricePerUnit * quantity;
      totalTax += taxAmount;
      grandTotal += lineTotal;
    });

    return {
      totalQuantity: totalQuantity.toFixed(2),
      totalBasicAmount: totalBasicAmount.toFixed(2),
      totalTax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const totals = calculateTotals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Order Items ({orderItems.length})
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64"
            />
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
                <SelectItem value="500">500 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderItems.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.totalQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tax</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totals.totalTax}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Grand Total</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{totals.grandTotal}</p>
            </div>
          </div>

          <Separator />

          {/* Table with horizontal scroll */}
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  {lineItemColumns.map(col => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                      style={{ minWidth: col.width }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={lineItemColumns.length} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No items match your search' : 'No items in this purchase order'}
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
                    >
                      {lineItemColumns.map(col => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-gray-900 dark:text-gray-100"
                          style={{ minWidth: col.width }}
                        >
                          {col.key === 'gst_rate' && item[col.key]
                            ? (parseFloat(String(item[col.key])) * 100).toFixed(2) + '%'
                            : String(item[col.key] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
