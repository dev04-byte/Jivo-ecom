import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { Search, Eye, Edit, Trash2, Filter, Download, RefreshCw, X, Calendar, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from 'xlsx';
import type { PfMst, PfOrderItems } from "@shared/schema";

interface POWithDetails {
  id: number;
  po_number: string;
  status: string;
  order_date: Date;
  expiry_date: Date | null;
  city: string;
  state: string;
  serving_distributor: string | null;
  platform: PfMst;
  orderItems: PfOrderItems[];
}

export function POListView() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [expiryDateFrom, setExpiryDateFrom] = useState("");
  const [expiryDateTo, setExpiryDateTo] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poToDelete, setPOToDelete] = useState<POWithDetails | null>(null);
  
  const { data: pos = [], isLoading, refetch } = useQuery<POWithDetails[]>({
    queryKey: ["/api/pos"],
    staleTime: 0, // Data is immediately stale
    gcTime: 0, // ✅ CORRECT - Garbage collection time
    refetchOnWindowFocus: true,
    refetchOnMount: true

  });

  // Debug logging for received data
  useEffect(() => {
    console.log("🔍 DEBUG: Query data changed - received", pos?.length || 0, "POs");
    if (pos && pos.length > 0) {
      console.log("🔍 DEBUG: All PO numbers:", pos.map(p => p.po_number));
      console.log("🔍 DEBUG: Platforms:", pos.map(p => p.platform?.pf_name));
      console.log("🔍 DEBUG: Recent POs (top 3):", pos.slice(0, 3).map(p => ({
        po_number: p.po_number,
        platform: p.platform?.pf_name,
        created: p.order_date,
        status: p.status
      })));
      
      // Look specifically for Zomato POs
      const zomatoPOs = pos.filter(p => {
        try {
          const platformName = p.platform?.pf_name;
          const poNumber = p.po_number;
          return (
            (platformName && typeof platformName === 'string' && platformName.toLowerCase().includes('zomato')) || 
            (poNumber && poNumber.includes('ZHPGJ26'))
          );
        } catch (error) {
          console.error('Error filtering Zomato POs:', error, { po: p });
          return false;
        }
      });
      console.log("🖕🏼 DEBUG: Found", zomatoPOs.length, "Zomato POs");
    } else {
      console.log("❌ DEBUG: No POs received from query");
    }
  }, [pos]);

  const { data: platforms = [] } = useQuery<PfMst[]>({
    queryKey: ["/api/platforms"]
  });

  // Listen for PO creation events and refetch data
  useEffect(() => {
    const handlePOCreated = () => {
      console.log("📡 PO List: Received po-created event, refetching...");
      refetch();
    };

    window.addEventListener('po-created', handlePOCreated);
    return () => {
      window.removeEventListener('po-created', handlePOCreated);
    };
  }, [refetch]);

  const deletePOMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`🔄 Frontend: Sending DELETE request for PO ID: ${id}`);
      const response = await apiRequest('DELETE', `/api/pos/${id}`);
      console.log(`✅ Frontend: DELETE request successful for PO ID: ${id}`);
      return response;
    },
    onSuccess: async (_, deletedId) => {
      console.log(`✅ Frontend: PO deletion confirmed successful for ID: ${deletedId}`);
      
      // Remove from cache only after confirmed deletion
      queryClient.setQueryData(["/api/pos"], (oldData: POWithDetails[] | undefined) => {
        if (!oldData) return [];
        const filteredData = oldData.filter(p => p.id !== deletedId);
        console.log(`🔄 Frontend: Removed PO ${deletedId} from cache, ${oldData.length} -> ${filteredData.length} items`);
        return filteredData;
      });
      
      // Invalidate queries to ensure fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/order-items"] }),
      ]);
      
      console.log("🔄 Frontend: Cache invalidated after successful deletion");
      
      // Force a manual refetch as backup to ensure consistency
      setTimeout(() => {
        console.log("🔄 Frontend: Backup refetch initiated");
        refetch();
      }, 1000);
      
      toast({
        title: "Purchase Order Deleted",
        description: "The purchase order has been successfully deleted from the database.",
        variant: "default"
      });
    },
    onError: (error: any, failedId) => {
      console.error(`❌ Frontend: PO deletion failed for ID ${failedId}:`, error);
      
      // Check if the error is "PO not found" - this means it was already deleted
      const errorMessage = error?.message || 'Unknown error';
      const isNotFoundError = errorMessage.includes('not found') || errorMessage.includes('404');
      
      if (isNotFoundError) {
        console.log(`ℹ️ Frontend: PO ${failedId} not found in database - likely already deleted, removing from cache`);
        
        // Remove from cache since it doesn't exist in database
        queryClient.setQueryData(["/api/pos"], (oldData: POWithDetails[] | undefined) => {
          if (!oldData) return [];
          const filteredData = oldData.filter(p => p.id !== failedId);
          console.log(`🔄 Frontend: Removed non-existent PO ${failedId} from cache, ${oldData.length} -> ${filteredData.length} items`);
          return filteredData;
        });
        
        // Refresh the data to ensure consistency
        refetch();
        
        toast({
          title: "PO Already Deleted",
          description: "This purchase order was already deleted. The list has been refreshed.",
          variant: "default"
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: `Failed to delete purchase order: ${errorMessage}`,
          variant: "destructive"
        });
      }
    }
  });

  const handleView = (po: POWithDetails) => {
    setLocation(`/po-details/${po.id}`);
  };

  const handleEdit = async (po: POWithDetails) => {
    // Invalidate PO-specific queries to ensure fresh data
    await queryClient.invalidateQueries({ 
      queryKey: [`/api/pos/${po.id}`],
      type: 'all'
    });
    
    // All POs from the unified /api/pos endpoint use the modern edit route
    setLocation(`/po-edit/${po.id}`);
  };

  const handleDeleteClick = (po: POWithDetails) => {
    setPOToDelete(po);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!poToDelete) return;
    
    console.log(`🗑️ Frontend: Starting deletion for PO ${poToDelete.po_number} (ID: ${poToDelete.id})`);
    
    deletePOMutation.mutate(poToDelete.id);
    setDeleteDialogOpen(false);
    setPOToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPOToDelete(null);
  };

  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered, invalidating cache and refetching POs...");
    
    // Force invalidate the cache and refetch
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
      queryClient.refetchQueries({ queryKey: ["/api/pos"] })
    ]);
    
    // Also call the refetch function
    refetch();
    
    toast({
      title: "Refreshed",
      description: "Purchase orders list has been refreshed"
    });
  };

  const handleExport = () => {
    // Prepare PO summary data
    const poSummaryData = filteredPOs.map(po => {
      const { totalQuantity, totalValue } = calculatePOTotals(po.orderItems);
      return {
        'PO Number': po.po_number,
        'Platform': po.platform.pf_name,
        'Status': po.status,
        'Order Date': po.order_date ? (() => {
          try {
            const date = new Date(po.order_date);
            return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'yyyy-MM-dd');
          } catch {
            return 'Invalid Date';
          }
        })() : 'Not set',
        'Expiry Date': po.expiry_date ? (() => {
          try {
            const date = new Date(po.expiry_date);
            return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'yyyy-MM-dd');
          } catch {
            return 'Invalid Date';
          }
        })() : 'Not set',
        'Distributor': po.serving_distributor || 'Not assigned',
        'Total Items': po.orderItems.length,
        'Total Quantity': totalQuantity,
        'Total Value': parseFloat(totalValue.toFixed(2))
      };
    });

    // Prepare detailed order items data
    const orderItemsData: any[] = [];
    filteredPOs.forEach(po => {
      po.orderItems.forEach(item => {
        orderItemsData.push({
          'PO Number': po.po_number,
          'Platform': po.platform.pf_name,
          'Item Name': item.item_name,
          'SAP Code': item.sap_code || 'N/A',
          'Quantity': item.quantity,
          'Basic Rate': parseFloat(item.basic_rate || '0'),
          'GST Rate': parseFloat(item.gst_rate || '0'),
          'Landing Rate': parseFloat(item.landing_rate || '0'),
          'Item Total': parseFloat((parseFloat(item.landing_rate || '0') * item.quantity).toFixed(2)),
          'Status': item.status || 'Pending'
        });
      });
    });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Create PO Summary worksheet
    const poSummaryWorksheet = XLSX.utils.json_to_sheet(poSummaryData);
    const poSummaryColWidths = [
      { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }
    ];
    poSummaryWorksheet['!cols'] = poSummaryColWidths;
    XLSX.utils.book_append_sheet(workbook, poSummaryWorksheet, 'PO Summary');
    
    // Create Order Items worksheet if there are items
    if (orderItemsData.length > 0) {
      const itemsWorksheet = XLSX.utils.json_to_sheet(orderItemsData);
      const itemsColWidths = [
        { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, 
        { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }
      ];
      itemsWorksheet['!cols'] = itemsColWidths;
      XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Order Items');
    }
    
    // Generate filename with current date
    const filename = `purchase-orders-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Export Complete",
      description: `${filteredPOs.length} purchase orders with ${orderItemsData.length} items exported to Excel`
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPlatformFilter("all");
    setOrderDateFrom("");
    setOrderDateTo("");
    setExpiryDateFrom("");
    setExpiryDateTo("");
    setShowFilter(false);
  };

  // Filter POs based on search term and filters
  const filteredPOs = pos.filter(po => {
    // Safety check for required fields
    if (!po || !po.po_number || !po.platform) {
      console.warn("🚨 Invalid PO data:", po);
      return false;
    }
    
    const searchTermLower = searchTerm && typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    let matchesSearch = searchTerm === "" || !searchTermLower;
    
    if (!matchesSearch && searchTermLower) {
      try {
        const poNumber = po.po_number || "";
        const platformName = po.platform?.pf_name || "";
        const status = po.status || "";
        //const location = `${po.city || ""}, ${po.state || ""}`;
        
        matchesSearch = (
          (typeof poNumber === 'string' && poNumber.toLowerCase().includes(searchTermLower)) ||
          (typeof platformName === 'string' && platformName.toLowerCase().includes(searchTermLower)) ||
          (typeof status === 'string' && status.toLowerCase().includes(searchTermLower)) 
          //(typeof location === 'string' && location.toLowerCase().includes(searchTermLower))
        );
      } catch (error) {
        console.error('Error in search filter:', error, { po, searchTerm });
        matchesSearch = false;
      }
    }
    
    const statusFilterLower = statusFilter && typeof statusFilter === 'string' ? statusFilter.toLowerCase() : '';
    let matchesStatus = statusFilter === "all";
    
    if (!matchesStatus && statusFilterLower) {
      try {
        const status = po.status || "";
        matchesStatus = typeof status === 'string' && status.toLowerCase() === statusFilterLower;
      } catch (error) {
        console.error('Error in status filter:', error, { po, statusFilter });
        matchesStatus = false;
      }
    }
    const matchesPlatform = platformFilter === "all" || (po.platform?.id || "").toString() === platformFilter;
    
    // Date filters with safety checks
    let matchesOrderDateFrom = true;
    let matchesOrderDateTo = true;
    
    if (po.order_date) {
      const poOrderDate = new Date(po.order_date);
      if (!isNaN(poOrderDate.getTime())) {
        matchesOrderDateFrom = orderDateFrom === "" || isAfter(poOrderDate, new Date(orderDateFrom)) || isEqual(poOrderDate, new Date(orderDateFrom));
        matchesOrderDateTo = orderDateTo === "" || isBefore(poOrderDate, new Date(orderDateTo)) || isEqual(poOrderDate, new Date(orderDateTo));
      }
    }
    
    let matchesExpiryDateFrom = true;
    let matchesExpiryDateTo = true;
    if (po.expiry_date) {
      const poExpiryDate = new Date(po.expiry_date);
      matchesExpiryDateFrom = expiryDateFrom === "" || isAfter(poExpiryDate, new Date(expiryDateFrom)) || isEqual(poExpiryDate, new Date(expiryDateFrom));
      matchesExpiryDateTo = expiryDateTo === "" || isBefore(poExpiryDate, new Date(expiryDateTo)) || isEqual(poExpiryDate, new Date(expiryDateTo));
    } else {
      // If no expiry date, show the PO unless user specifically filtered for expiry dates
      matchesExpiryDateFrom = expiryDateFrom === "";
      matchesExpiryDateTo = expiryDateTo === "";
      // If both expiry filters are empty, show all POs including those with null expiry
      if (expiryDateFrom === "" && expiryDateTo === "") {
        matchesExpiryDateFrom = true;
        matchesExpiryDateTo = true;
      }
    }
    
    const passes = matchesSearch && matchesStatus && matchesPlatform && 
           matchesOrderDateFrom && matchesOrderDateTo && 
           matchesExpiryDateFrom && matchesExpiryDateTo;
    
    // Debug individual filter failures
    if (!passes) {
      console.log(`🚨 PO ${po.po_number} filtered out:`, {
        matchesSearch,
        matchesStatus,
        matchesPlatform,
        matchesOrderDateFrom,
        matchesOrderDateTo,
        matchesExpiryDateFrom,
        matchesExpiryDateTo,
        po_expiry_date: po.expiry_date
      });
    }
    
    return passes;
  });

  // Debug filtering results
  useEffect(() => {
    console.log(`🔍 FILTER DEBUG: ${pos.length} total POs → ${filteredPOs.length} filtered POs`);
    console.log("🔍 FILTER DEBUG: Filters:", {
      searchTerm,
      statusFilter,
      platformFilter,
      orderDateFrom,
      orderDateTo,
      expiryDateFrom,
      expiryDateTo
    });
    if (pos.length > filteredPOs.length) {
      console.log("🔍 FILTER DEBUG: Some POs were filtered out");
    }
  }, [pos.length, filteredPOs.length, searchTerm, statusFilter, platformFilter, orderDateFrom, orderDateTo, expiryDateFrom, expiryDateTo]);

  const getStatusBadgeVariant = (status: string) => {
    if (!status || typeof status !== 'string') return 'default';
    
    try {
      switch (status.toLowerCase()) {
        case 'open': return 'default';
        case 'closed': return 'secondary';
        case 'cancelled': return 'destructive';
        case 'expired': return 'destructive';
        case 'duplicate': return 'outline';
        default: return 'default';
      }
    } catch (error) {
      console.error('Error in getStatusBadgeVariant:', error, { status });
      return 'default';
    }
  };

  const calculatePOTotals = (items: PfOrderItems[]) => {
    try {
      if (!items || !Array.isArray(items)) {
        console.warn("🚨 calculatePOTotals: Invalid items array", items);
        return { totalQuantity: 0, totalValue: 0 };
      }
      
      const totalQuantity = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
      const totalValue = items.reduce((sum, item) => {
        const landingRate = parseFloat(item?.landing_rate || '0') || 0;
        const quantity = item?.quantity || 0;
        return sum + (landingRate * quantity);
      }, 0);
      return { totalQuantity, totalValue };
    } catch (error) {
      console.error("🚨 Error in calculatePOTotals:", error, "Items:", items);
      return { totalQuantity: 0, totalValue: 0 };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {(statusFilter !== "all" || platformFilter !== "all" || 
                orderDateFrom !== "" || orderDateTo !== "" || 
                expiryDateFrom !== "" || expiryDateTo !== "") && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPOs.length} of {pos.length} orders
            </span>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={filteredPOs.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilter(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Status and Platform Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="duplicate">Duplicate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Platform
                    </Label>
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="All Platforms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id.toString()}>
                            {platform.pf_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Filters */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Date Filters</h4>
                  </div>
                  
                  {/* Order Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Order Date From
                      </Label>
                      <Input
                        type="date"
                        value={orderDateFrom}
                        onChange={(e) => setOrderDateFrom(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Order Date To
                      </Label>
                      <Input
                        type="date"
                        value={orderDateTo}
                        onChange={(e) => setOrderDateTo(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Expiry Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expiry Date From
                      </Label>
                      <Input
                        type="date"
                        value={expiryDateFrom}
                        onChange={(e) => setExpiryDateFrom(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expiry Date To
                      </Label>
                      <Input
                        type="date"
                        value={expiryDateTo}
                        onChange={(e) => setExpiryDateTo(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pos.length}</div>
            <p className="text-xs text-muted-foreground">Total POs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {pos.filter(po => po.status === 'Open').length}
            </div>
            <p className="text-xs text-muted-foreground">Open POs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {pos.filter(po => po.status === 'Closed').length}
            </div>
            <p className="text-xs text-muted-foreground">Closed POs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {pos.filter(po => po.status === 'Cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled POs</p>
          </CardContent>
        </Card>
      </div>

      {/* PO Cards */}
      {pos.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Purchase Orders Found</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
              You haven't created any purchase orders yet. Switch to the "Create PO" tab to get started.
            </p>
          </CardContent>
        </Card>
      ) : filteredPOs.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-orange-500 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Matching Purchase Orders</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
              No purchase orders match your current search and filter criteria.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPOs.map((po, index) => {
            console.log(`🔍 DEBUG: Rendering PO ${index + 1}/${filteredPOs.length}: ${po.po_number} (ID: ${po.id})`);
            const { totalQuantity, totalValue } = calculatePOTotals(po.orderItems || []);
            
            return (
              <Card key={`po-${po.id}-${po.po_number}`} className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{po.po_number}</CardTitle>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{po.platform.pf_name}</p>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(po.status)}
                        className="px-3 py-1 text-xs font-semibold"
                      >
                        {po.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(po)}
                        className="hover:bg-blue-50 border-blue-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(po)}
                        className="hover:bg-green-50 border-green-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteClick(po)}
                        disabled={deletePOMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {po.order_date ? (() => {
                          try {
                            const date = new Date(po.order_date);
                            return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM dd, yyyy');
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })() : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {po.expiry_date ? (() => {
                          try {
                            const date = new Date(po.expiry_date);
                            return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM dd, yyyy');
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })() : 'Not set'}
                      </p>
                    </div>
                    {/*<div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{po.city}, {po.state}</p>
                    </div>*/}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Distributor</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {po.serving_distributor || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Summary Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{po.orderItems.length} items</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Qty: {totalQuantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ₹{totalValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order <strong>{poToDelete?.po_number}</strong>?
              <br />
              <br />
              This action cannot be undone. This will permanently delete the purchase order and all associated order items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletePOMutation.isPending ? "Deleting..." : "Delete PO"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}