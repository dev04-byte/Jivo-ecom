import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Edit, Trash2, Download, Mail, Phone, Calendar, MapPin, Package, DollarSign, Clock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BigBasketPODetailView } from "@/components/po/bigbasket-po-detail-view";
import { DealsharePODetailView } from "@/components/po/dealshare-po-detail-view";
import { AmazonPoDetailView } from "@/components/po/amazon-po-detail-view";
import { ZomatoPODetailView } from "@/components/po/zomato-po-detail-view";
import type { PfPo, PfMst, PfOrderItems } from "@shared/schema";

interface POWithDetails extends Omit<PfPo, 'platform'> {
  platform: PfMst;
  orderItems: PfOrderItems[];
}

export default function PODetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const poId = params.id;

  // Determine PO type by ID range
  // Amazon: IDs >= 10000000 and < 11000000
  // BigBasket: IDs >= 12000000 and < 13000000
  const isAmazonPo = poId && parseInt(poId) >= 10000000 && parseInt(poId) < 11000000;
  const isBigBasketPo = poId && parseInt(poId) >= 12000000 && parseInt(poId) < 13000000;
  const amazonId = isAmazonPo ? parseInt(poId) - 10000000 : null;
  const bigbasketId = isBigBasketPo ? parseInt(poId) - 12000000 : null;

  // First fetch to get basic PO info
  const { data: initialPo, isLoading: initialLoading, error: initialError } = useQuery<any>({
    queryKey: isAmazonPo ? [`/api/amazon-pos/${amazonId}`] :
              isBigBasketPo ? [`/api/bigbasket-pos/${bigbasketId}`] :
              [`/api/pos/${poId}`],
    enabled: !!poId
  });

  // Check if it's a BigBasket PO by platform name and fetch detailed data
  const isBigBasketByPlatform = !isAmazonPo && !isBigBasketPo &&
    initialPo?.platform?.pf_name?.toLowerCase().includes('bigbasket');

  const { data: bigbasketDetailedPo, isLoading: bigbasketLoading } = useQuery<any>({
    queryKey: [`/api/bigbasket-pos/by-number/${initialPo?.po_number}`],
    enabled: !!initialPo?.po_number && isBigBasketByPlatform,
  });

  // Use detailed BigBasket data if available, otherwise use initial data
  const po = isBigBasketByPlatform && bigbasketDetailedPo ? bigbasketDetailedPo : initialPo;
  const isLoading = initialLoading || (isBigBasketByPlatform && bigbasketLoading);
  const error = initialError;

  // Check if we have the complete BigBasket data structure
  const hasBigBasketDetailedData = (isBigBasketPo || isBigBasketByPlatform) &&
    ((po?.header && po?.lines) || (isBigBasketPo && po));

  const handleEdit = () => {
    setLocation(`/po-edit/${poId}`);
  };

  const handleDelete = async () => {
    if (!po) return;
    
    if (confirm(`Are you sure you want to delete PO ${po.po_number}?`)) {
      try {
        console.log("✅ Starting PO deletion from details page...");
        await apiRequest('DELETE', `/api/pos/${poId}`);
        
        // Invalidate all related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/order-items"] }),
          queryClient.invalidateQueries({ queryKey: [`/api/pos/${poId}`] })
        ]);
        
        console.log("🔄 Cache invalidated after deletion");
        
        toast({
          title: "Success",
          description: "Purchase order deleted successfully"
        });
        setLocation("/platform-po");
      } catch (error) {
        console.error("❌ PO deletion failed:", error);
        toast({
          title: "Error",
          description: "Failed to delete purchase order",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownload = () => {
    if (!po) return;
    
    // Generate and download PO as PDF or CSV
    toast({
      title: "Download Started",
      description: `Downloading PO ${po.po_number}`
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'open': return 'default';
      case 'closed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'expired': return 'destructive';
      case 'duplicate': return 'outline';
      default: return 'default';
    }
  };

  const calculatePOTotals = (items: PfOrderItems[] | any[]) => {
    if (isAmazonPo && (po as any)?.poLines) {
      // Calculate for Amazon PO structure
      const amazonLines = (po as any).poLines;
      const totalQuantity = amazonLines.reduce((sum: number, item: any) => sum + (item.quantity_ordered || 0), 0);
      const totalValue = amazonLines.reduce((sum: number, item: any) => {
        const total = parseFloat(item.total_cost || '0');
        return sum + (isNaN(total) ? 0 : total);
      }, 0);
      return { totalQuantity, totalValue };
    } else {
      // Calculate for regular PO structure
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalValue = items.reduce((sum, item) => {
        const rate = parseFloat(item.landing_rate || '0');
        const qty = item.quantity || 0;
        return sum + (isNaN(rate) ? 0 : rate * qty);
      }, 0);
      return { totalQuantity, totalValue };
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading purchase order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Not Found</h2>
            <p className="text-gray-600 mb-4">The requested purchase order could not be found.</p>
            <Button onClick={() => setLocation("/platform-po")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Purchase Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { totalQuantity, totalValue } = calculatePOTotals(
    isAmazonPo ? (po as any).poLines || [] :
    hasBigBasketDetailedData ? po.lines || [] :
    po.orderItems || []
  );

  // Get display data based on PO type
  const displayPoNumber = hasBigBasketDetailedData ? po.header?.po_number : po.po_number;
  const displayPlatform = hasBigBasketDetailedData ? 'BigBasket' : isAmazonPo ? 'Amazon' : po.platform?.pf_name;
  const displayDate = hasBigBasketDetailedData ? po.header?.po_date : (po.order_date || po.created_at);
  const displayStatus = hasBigBasketDetailedData ? po.header?.status : po.status;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border-b border-blue-100 dark:border-gray-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/platform-po")}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {displayPoNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {displayPlatform} • Created {displayDate ? format(new Date(displayDate), 'MMM dd, yyyy') : 'Date not available'}
              </p>
            </div>
            <Badge
              variant={getStatusBadgeVariant(displayStatus)}
              className="px-3 py-1 text-sm font-semibold"
            >
              {displayStatus}
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* PO Overview - Skip for BigBasket as it has its own detail view */}
          {!hasBigBasketDetailedData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Purchase Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show all actual table columns */}
                    {Object.entries(po).filter(([key, value]) =>
                      key !== 'platform' &&
                      key !== 'orderItems' &&
                      key !== 'poLines' &&
                      value !== null &&
                      value !== undefined &&
                      value !== ''
                    ).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                        <div className="flex items-center">
                          <span className="font-semibold text-sm break-words">{String(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-semibold">{isAmazonPo ? (po as any).poLines?.length || 0 : po.orderItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Quantity</span>
                      <span className="font-semibold">{totalQuantity}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-lg font-medium">Total Value</span>
                      <span className="text-lg font-bold text-primary">₹{totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Order Items - Use platform-specific views */}
          {hasBigBasketDetailedData ? (
            <BigBasketPODetailView po={po.header} orderItems={po.lines} />
          ) : !isAmazonPo && !isBigBasketPo && po.platform?.pf_name?.toLowerCase().includes('dealshare') ||
               !isAmazonPo && po.platform?.pf_name?.toLowerCase() === 'dealshare' ? (
            <DealsharePODetailView po={po as any} orderItems={po.orderItems as any} />
          ) : !isAmazonPo && po.platform?.pf_name?.toLowerCase().includes('zomato') ||
               !isAmazonPo && po.platform?.pf_name?.toLowerCase() === 'zomato' ? (
            <ZomatoPODetailView po={po as any} orderItems={po.orderItems as any} />
          ) : isAmazonPo ||
               (!isAmazonPo && po.platform?.pf_name?.toLowerCase().includes('amazon')) ||
               (!isAmazonPo && po.platform?.pf_name?.toLowerCase() === 'amazon') ? (
            <AmazonPoDetailView
              header={{
                po_number: po.po_number,
                po_date: po.po_date,
                shipment_date: (po as any).shipment_date,
                delivery_date: (po as any).delivery_date,
                ship_to_address: (po as any).ship_to_address,
                vendor_code: (po as any).vendor_code,
                vendor_name: (po as any).vendor_name,
                buyer_name: (po as any).buyer_name,
                currency: (po as any).currency,
                total_amount: (po as any).total_amount,
                tax_amount: (po as any).tax_amount,
                shipping_cost: (po as any).shipping_cost,
                discount_amount: (po as any).discount_amount,
                net_amount: (po as any).net_amount,
                status: po.status,
                notes: (po as any).notes,
                created_by: (po as any).created_by
              }}
              lines={isAmazonPo ? (po as any).poLines || [] : po.orderItems as any}
              summary={{
                totalItems: isAmazonPo ? (po as any).poLines?.length || 0 : po.orderItems.length,
                totalQuantity: totalQuantity,
                totalAmount: totalValue.toString(),
                detectedVendor: 'amazon'
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({isAmazonPo ? (po as any).poLines?.length || 0 : po.orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(isAmazonPo ? (po as any).poLines?.length === 0 : po.orderItems.length === 0) ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No items in this purchase order</p>
                    </div>
                  ) : (
                    <>
                      {/* Show all columns dynamically */}
                      {(isAmazonPo ? (po as any).poLines || [] : po.orderItems).map((item: any, index: number) => (
                        <div key={item.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                          <h4 className="font-medium text-lg">Item {index + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(item).filter(([key, value]) =>
                              value !== null &&
                              value !== undefined &&
                              value !== ''
                            ).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                                <p className="font-semibold text-sm break-words">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}