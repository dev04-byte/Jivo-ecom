import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Eye, Database, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BigBasketPO {
  po_number: string;
  po_date: string | Date | null;
  po_expiry_date: string | Date | null;
  supplier_name: string;
  supplier_gstin: string;
  dc_address: string;
  warehouse_address: string;
  status: string;
  platform?: { pf_name: string; id?: number };
}

interface BigBasketOrderItem {
  id?: number;
  s_no: number;
  hsn_code: string;
  sku_code: string;
  description: string;
  ean_upc_code: string;
  case_quantity: number;
  quantity: number;
  basic_cost: string;
  sgst_percent: string;
  sgst_amount: string;
  cgst_percent: string;
  cgst_amount: string;
  igst_percent: string;
  igst_amount: string;
  gst_percent: string;
  gst_amount: string;
  cess_percent: string;
  cess_value: string;
  state_cess_percent: string;
  state_cess: string;
  landing_cost: string;
  mrp: string;
  total_value: string;
  [key: string]: any; // Index signature for dynamic column access
}

interface BigBasketPODetailViewProps {
  po: BigBasketPO;
  orderItems: BigBasketOrderItem[];
  onImportData?: (data: { header: BigBasketPO; lines: BigBasketOrderItem[] }) => Promise<void>;
  showImportButton?: boolean;
  onNavigateBack?: () => void;
}

export function BigBasketPODetailView({ po, orderItems, onImportData, showImportButton = false, onNavigateBack }: BigBasketPODetailViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Handle data import
  const handleImportData = async () => {
    if (!onImportData) {
      // Default API call to import into bigbasket_po_header and bigbasket_po_lines
      try {
        setIsImporting(true);

        const response = await fetch('/api/bigbasket-pos/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            header: po,
            lines: orderItems
          })
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            // Duplicate PO
            toast({
              title: "Duplicate PO",
              description: result.error || "This PO already exists in the database",
              variant: "destructive",
            });
          } else {
            // Other errors
            toast({
              title: "Import Failed",
              description: result.error || "Failed to import data",
              variant: "destructive",
            });
          }
          return;
        }

        // Success
        toast({
          title: "Import Successful",
          description: `PO ${po.po_number} with ${orderItems.length} items imported successfully`,
        });

        // Navigate back after short delay to show success message
        setTimeout(() => {
          if (onNavigateBack) {
            onNavigateBack();
          }
        }, 1500);

      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Error",
          description: "Network error or server unavailable",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    } else {
      // Use custom import handler
      try {
        setIsImporting(true);
        await onImportData({ header: po, lines: orderItems });

        toast({
          title: "Import Successful",
          description: `PO ${po.po_number} with ${orderItems.length} items imported successfully`,
        });

        // Navigate back after short delay to show success message
        setTimeout(() => {
          if (onNavigateBack) {
            onNavigateBack();
          }
        }, 1500);
      } catch (error) {
        console.error('Import error:', error);
        if (error instanceof Error && error.message.includes('already exists')) {
          toast({
            title: "Duplicate PO",
            description: "This PO already exists in the database",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Failed to import data",
            variant: "destructive",
          });
        }
      } finally {
        setIsImporting(false);
      }
    }
  };

  // Filter and paginate items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return orderItems;
    return orderItems.filter(item =>
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderItems, searchTerm]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Generate columns dynamically from the actual data to show ALL fields
  const lineItemColumns = useMemo(() => {
    if (!orderItems || orderItems.length === 0) return [];

    // Get all unique keys from all order items
    const allKeys = new Set<string>();
    orderItems.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    // Filter out internal fields and sort for better presentation
    const excludedKeys = ['id', 'po_id', 'created_at', 'updated_at'];
    const filteredKeys = Array.from(allKeys).filter(key => !excludedKeys.includes(key));

    // Define preferred order and widths for common fields
    const fieldOrder = [
      's_no', 'hsn_code', 'sku_code', 'description', 'ean_upc_code',
      'case_quantity', 'quantity', 'basic_cost', 'mrp', 'landing_cost',
      'sgst_percent', 'sgst_amount', 'cgst_percent', 'cgst_amount',
      'igst_percent', 'igst_amount', 'gst_percent', 'gst_amount',
      'cess_percent', 'cess_value', 'state_cess_percent', 'state_cess',
      'total_value'
    ];

    const fieldWidths: Record<string, string> = {
      's_no': '80px',
      'hsn_code': '120px',
      'sku_code': '120px',
      'description': '350px',
      'ean_upc_code': '150px',
      'case_quantity': '100px',
      'quantity': '100px',
      'basic_cost': '120px',
      'sgst_percent': '90px',
      'sgst_amount': '120px',
      'cgst_percent': '90px',
      'cgst_amount': '120px',
      'igst_percent': '90px',
      'igst_amount': '120px',
      'gst_percent': '90px',
      'gst_amount': '120px',
      'cess_percent': '90px',
      'cess_value': '120px',
      'state_cess_percent': '120px',
      'state_cess': '120px',
      'landing_cost': '130px',
      'mrp': '120px',
      'total_value': '140px'
    };

    // Sort keys according to preferred order, then alphabetically for any extra fields
    const sortedKeys = [
      ...fieldOrder.filter(key => filteredKeys.includes(key)),
      ...filteredKeys.filter(key => !fieldOrder.includes(key)).sort()
    ];

    return sortedKeys.map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      width: fieldWidths[key] || '120px'
    }));
  }, [orderItems]);

  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalBasicCost = 0;
    let totalGST = 0;
    let totalCess = 0;
    let grandTotal = 0;

    orderItems.forEach(item => {
      // Safely parse numeric values, handling both string and number types
      const quantity = Number(item.quantity) || 0;
      const basicCost = Number(item.basic_cost) || 0;
      const gstAmount = Number(item.gst_amount) || 0;
      const cessValue = Number(item.cess_value) || 0;
      const stateCess = Number(item.state_cess) || 0;
      const totalValue = Number(item.total_value) || 0;

      totalQuantity += quantity;
      totalBasicCost += basicCost * quantity;
      totalGST += gstAmount;
      totalCess += cessValue + stateCess;
      grandTotal += totalValue;
    });

    return {
      totalQuantity,
      totalBasicCost: Number(totalBasicCost.toFixed(2)),
      totalGST: Number(totalGST.toFixed(2)),
      totalCess: Number(totalCess.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2))
    };
  };

  const totals = calculateTotals();
  const filteredTotals = useMemo(() => {
    let totalQuantity = 0;
    let totalBasicCost = 0;
    let totalGST = 0;
    let totalCess = 0;
    let grandTotal = 0;

    filteredItems.forEach(item => {
      // Safely parse numeric values, handling both string and number types
      const quantity = Number(item.quantity) || 0;
      const basicCost = Number(item.basic_cost) || 0;
      const gstAmount = Number(item.gst_amount) || 0;
      const cessValue = Number(item.cess_value) || 0;
      const stateCess = Number(item.state_cess) || 0;
      const totalValue = Number(item.total_value) || 0;

      totalQuantity += quantity;
      totalBasicCost += basicCost * quantity;
      totalGST += gstAmount;
      totalCess += cessValue + stateCess;
      grandTotal += totalValue;
    });

    return {
      totalQuantity,
      totalBasicCost: Number(totalBasicCost.toFixed(2)),
      totalGST: Number(totalGST.toFixed(2)),
      totalCess: Number(totalCess.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2))
    };
  }, [filteredItems]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              BigBasket PO Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">PO Number</p>
                <p className="font-semibold text-blue-700">{po.po_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={po.status === 'pending' ? 'default' : po.status === 'completed' ? 'secondary' : 'outline'}>
                  {po.status || 'Unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">PO Date</p>
                <p className="font-semibold">
                  {po.po_date ? new Date(po.po_date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-semibold text-red-600">
                  {po.po_expiry_date ? new Date(po.po_expiry_date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier & Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Supplier Name</p>
              <p className="font-semibold text-green-700">{po.supplier_name || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier GSTIN</p>
              <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{po.supplier_gstin || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">DC Address</p>
              <p className="text-sm leading-5 max-w-xs">{po.dc_address || 'Address not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Warehouse Address</p>
              <p className="text-sm leading-5 max-w-xs">{po.warehouse_address || 'Warehouse address not available'}</p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Summary Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-bold text-blue-600">{orderItems.length}</p>
              {searchTerm && (
                <p className="text-xs text-blue-500">({filteredItems.length} filtered)</p>
              )}
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-xl font-bold text-green-600">{totals.totalQuantity}</p>
              {searchTerm && (
                <p className="text-xs text-green-500">({filteredTotals.totalQuantity} filtered)</p>
              )}
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600">Basic Cost</p>
              <p className="text-xl font-bold text-purple-600">₹{totals.totalBasicCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {searchTerm && (
                <p className="text-xs text-purple-500">₹{filteredTotals.totalBasicCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              )}
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600">Total GST</p>
              <p className="text-xl font-bold text-orange-600">₹{totals.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {searchTerm && (
                <p className="text-xs text-orange-500">₹{filteredTotals.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              )}
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600">Grand Total</p>
              <p className="text-xl font-bold text-indigo-600">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              {searchTerm && (
                <p className="text-xs text-indigo-500">₹{filteredTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items Cards (like other platforms) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Order Items ({orderItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No items in this purchase order</p>
              </div>
            ) : (
              <>
                {/* Show all columns dynamically in card format */}
                {paginatedItems.map((item, globalIndex) => {
                  const index = (currentPage - 1) * itemsPerPage + globalIndex;
                  return (
                    <div key={item.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-lg flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                          Item {item.s_no || index + 1}
                        </span>
                        <span className="text-green-600 font-bold">
                          ₹{item.total_value ? parseFloat(String(item.total_value)).toFixed(2) : '0.00'}
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(item).filter(([key, value]) =>
                          value !== null &&
                          value !== undefined &&
                          value !== '' &&
                          !['id', 'po_id'].includes(key) // Exclude internal fields
                        ).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 capitalize">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className={`font-semibold text-sm break-words ${
                              key.includes('cost') || key.includes('amount') || key.includes('value') || key === 'mrp'
                                ? 'text-green-600 font-mono'
                                : key.includes('percent')
                                ? 'text-blue-600 font-mono'
                                : key === 'description'
                                ? 'text-gray-800'
                                : key.includes('code')
                                ? 'font-mono text-xs bg-gray-100 px-2 py-1 rounded'
                                : ''
                            }`}>
                              {key.includes('cost') || key.includes('amount') || key.includes('value') || key === 'mrp'
                                ? (value && !isNaN(parseFloat(String(value))) ? `₹${parseFloat(String(value)).toFixed(2)}` : '₹0.00')
                                : key.includes('percent')
                                ? (value && !isNaN(parseFloat(String(value))) ? `${parseFloat(String(value)).toFixed(1)}%` : '0.0%')
                                : String(value)
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination if needed */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
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
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Button */}
      {showImportButton && (
        <div className="mt-6">
          <Button
            onClick={handleImportData}
            disabled={isImporting || orderItems.length === 0}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Database className="mr-2 h-5 w-5" />
                Import Data into Database
              </>
            )}
          </Button>
        </div>
      )}

      {/* Description Modal */}
      <Dialog open={!!selectedDescription} onOpenChange={() => setSelectedDescription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Description</DialogTitle>
            <DialogDescription>
              Full product description details
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm leading-6 whitespace-pre-wrap">{selectedDescription}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}