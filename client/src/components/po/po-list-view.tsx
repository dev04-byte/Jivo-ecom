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

  const handleExportAmazonDirect = async () => {
    try {
      console.log('🔍 AMAZON DIRECT EXPORT: Button clicked! Starting Amazon RAW export...');
      console.log('🔍 AMAZON DIRECT EXPORT: Fetching Amazon data directly from database...');
      
      // Fetch raw database data from the new Amazon export endpoint
      const response = await apiRequest('GET', '/api/amazon/export/excel');
      console.log('🔍 AMAZON DIRECT EXPORT: API response status:', response.status);
      
      const responseData = await response.json();
      console.log('🔍 AMAZON DIRECT EXPORT: API response data:', responseData);
      
      if (!responseData || !responseData.data) {
        throw new Error('Failed to fetch Amazon export data');
      }

      const poData = responseData.data;
      const itemsData = responseData.itemsData || [];
      
      console.log(`🔍 AMAZON DIRECT EXPORT: Retrieved ${poData.length} Amazon POs with ${itemsData.length} items from database`);
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create Amazon PO Summary worksheet
      const poSummaryWorksheet = XLSX.utils.json_to_sheet(poData);
      const poSummaryColWidths = [
        { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 30 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }
      ];
      poSummaryWorksheet['!cols'] = poSummaryColWidths;
      XLSX.utils.book_append_sheet(workbook, poSummaryWorksheet, 'Amazon PO Summary');
      
      // Create Amazon Items Details worksheet
      if (itemsData.length > 0) {
        const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData);
        const itemsColWidths = [
          { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
          { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
          { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
          { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }
        ];
        itemsWorksheet['!cols'] = itemsColWidths;
        XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Amazon Item Details');
      }
      
      // Generate filename with current date
      const filename = `amazon-purchase-orders-RAW-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      console.log(`🔍 AMAZON DIRECT EXPORT: Writing Excel file: ${filename}`);
      
      // Write file - try multiple methods for better compatibility
      try {
        XLSX.writeFile(workbook, filename);
        console.log('🔍 AMAZON DIRECT EXPORT: Excel file written successfully');
      } catch (writeError) {
        console.error('🔍 AMAZON DIRECT EXPORT: XLSX writeFile error:', writeError);
        // Try alternative download method
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('🔍 AMAZON DIRECT EXPORT: Alternative download method used');
      }
      
      toast({
        title: "Amazon Export Complete",
        description: `${poData.length} Amazon POs with ${itemsData.length} items exported from RAW DATABASE`
      });
      
    } catch (error) {
      console.error('Amazon export error:', error);
      toast({
        title: "Amazon Export Failed",
        description: "Failed to export Amazon purchase orders. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportDealshareRAW = async () => {
    try {
      console.log('🔍 DEALSHARE RAW EXPORT: Button clicked! Starting Dealshare RAW export...');
      console.log('🔍 DEALSHARE RAW EXPORT: Fetching Dealshare data directly from database...');
      
      // Fetch raw database data from the new Dealshare export endpoint
      const response = await apiRequest('GET', '/api/dealshare/export/excel');
      console.log('🔍 DEALSHARE RAW EXPORT: API response status:', response.status);
      
      const responseData = await response.json();
      console.log('🔍 DEALSHARE RAW EXPORT: API response data:', responseData);
      
      if (!responseData || !responseData.data) {
        throw new Error('Failed to fetch Dealshare export data');
      }

      const poData = responseData.data;
      const itemsData = responseData.itemsData || [];
      
      console.log(`🔍 DEALSHARE RAW EXPORT: Retrieved ${poData.length} Dealshare POs with ${itemsData.length} items from database`);
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create Dealshare PO Summary worksheet
      const poSummaryWorksheet = XLSX.utils.json_to_sheet(poData);
      const poSummaryColWidths = [
        { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
      ];
      poSummaryWorksheet['!cols'] = poSummaryColWidths;
      XLSX.utils.book_append_sheet(workbook, poSummaryWorksheet, 'Dealshare PO Summary');
      
      // Create Dealshare Items Details worksheet
      if (itemsData.length > 0) {
        const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData);
        const itemsColWidths = [
          { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 },
          { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
          { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
          { wch: 12 }, { wch: 12 }
        ];
        itemsWorksheet['!cols'] = itemsColWidths;
        XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Dealshare Item Details');
      }
      
      // Generate filename with current date
      const filename = `dealshare-purchase-orders-RAW-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      console.log(`🔍 DEALSHARE RAW EXPORT: Writing Excel file: ${filename}`);
      
      // Write file - try multiple methods for better compatibility
      try {
        XLSX.writeFile(workbook, filename);
        console.log('🔍 DEALSHARE RAW EXPORT: Excel file written successfully');
      } catch (writeError) {
        console.error('🔍 DEALSHARE RAW EXPORT: XLSX writeFile error:', writeError);
        // Try alternative download method
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('🔍 DEALSHARE RAW EXPORT: Alternative download method used');
      }
      
      toast({
        title: "Dealshare Export Complete",
        description: `${poData.length} Dealshare POs with ${itemsData.length} items exported from RAW DATABASE`
      });
      
    } catch (error) {
      console.error('Dealshare export error:', error);
      toast({
        title: "Dealshare Export Failed",
        description: "Failed to export Dealshare purchase orders. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExport = async () => {
    try {
      console.log('🔍 EXPORT: Starting Excel export process...');
      console.log(`🔍 EXPORT: Raw pos data length: ${pos.length}`);
      console.log(`🔍 EXPORT: Filtered POs length: ${filteredPOs.length}`);
      console.log('🔍 EXPORT: First 3 POs in view:', filteredPOs.slice(0, 3).map(po => ({
        id: po.id,
        po_number: po.po_number,
        platform: po.platform?.pf_name,
        items_count: po.orderItems?.length
      })));
      
      // Use the EXACT same filtered data that the view shows
      // Transform the view data to match the expected export format
      const poData = filteredPOs.map((po, index) => {
        console.log(`🔍 EXPORT: Processing PO ${index + 1}/${filteredPOs.length}: ${po.po_number}`);
        
        const totalQuantity = po.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const totalValue = po.orderItems?.reduce((sum, item) => {
          const landingRate = parseFloat(item.landing_rate || '0') || 0;
          const quantity = item.quantity || 0;
          return sum + (landingRate * quantity);
        }, 0);
        
        const poRecord = {
          'PO ID': po.id,
          'PO Number': po.po_number,
          'Platform': po.platform?.pf_name || 'Unknown',
          'Status': po.status || 'Open',
          'Order Date': po.order_date,
          'Expiry Date': po.expiry_date || '',
          'City': po.city || '',
          'State': po.state || '',
          'Distributor': po.serving_distributor || '',
          'Total Items': po.orderItems?.length || 0,
          'Total Quantity': totalQuantity,
          'Total Value': totalValue.toFixed(2)
        };
        
        if (index < 3) {
          console.log(`🔍 EXPORT: PO ${index + 1} export data:`, poRecord);
        }
        
        return poRecord;
      });

      // Also prepare detailed items data for a second sheet - using EXACT same data as view
      const itemsData: any[] = [];
      let itemIndex = 0;
      filteredPOs.forEach((po, poIndex) => {
        console.log(`🔍 EXPORT: Processing items for PO ${poIndex + 1}: ${po.po_number} (${po.orderItems?.length || 0} items)`);
        
        po.orderItems?.forEach((item, itemIndexInPO) => {
          const itemRecord = {
            'PO Number': po.po_number,
            'Platform': po.platform?.pf_name || 'Unknown',
            'Item Name': item.item_name || '',
            'SAP Code': item.sap_code || '',
            'Quantity': item.quantity || 0,
            'Basic Rate': item.basic_rate || '0',
            'GST Rate': item.gst_rate || '0',
            'Landing Rate': item.landing_rate || '0',
            'Status': item.status || 'Pending'
          };
          
          if (itemIndex < 5) {
            console.log(`🔍 EXPORT: Item ${itemIndex + 1} (PO: ${po.po_number}, Item ${itemIndexInPO + 1}):`, itemRecord);
          }
          
          itemsData.push(itemRecord);
          itemIndex++;
        });
      });
      
      console.log(`🔍 EXPORT: Prepared ${poData.length} PO records and ${itemsData.length} item records from filtered view data`);
      console.log('🔍 EXPORT: About to create Excel workbook with this data');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create PO Summary worksheet with raw database data
      const poSummaryWorksheet = XLSX.utils.json_to_sheet(poData);
      const poSummaryColWidths = [
        { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }
      ];
      poSummaryWorksheet['!cols'] = poSummaryColWidths;
      XLSX.utils.book_append_sheet(workbook, poSummaryWorksheet, 'PO Summary');
      
      // Create Items Details worksheet if there are items
      if (itemsData.length > 0) {
        const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData);
        const itemsColWidths = [
          { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
          { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];
        itemsWorksheet['!cols'] = itemsColWidths;
        XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Item Details');
      }
      
      // Generate filename with current date
      const filename = `purchase-orders-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      console.log(`🔍 EXPORT: Writing Excel file: ${filename}`);
      console.log(`🔍 EXPORT: Final data summary:`);
      console.log(`  - ${poData.length} PO records in "PO Summary" sheet`);
      console.log(`  - ${itemsData.length} item records in "Item Details" sheet`);
      console.log('🔍 EXPORT: Sample of what will be written to Excel:');
      console.log('  PO Summary first record:', poData[0]);
      console.log('  Item Details first record:', itemsData[0]);
      
      // Write file
      XLSX.writeFile(workbook, filename);
      
      console.log('✅ EXPORT: Excel file written successfully');
      
      toast({
        title: "Export Complete",
        description: `${poData.length} purchase orders with ${itemsData.length} items exported successfully from VIEW DATA`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export purchase orders. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportSinglePO = async (po: POWithDetails) => {
    try {
      console.log(`🔍 FRONTEND DEBUG: Starting export for PO ${po.po_number} (ID: ${po.id})`);
      
      // Fetch raw database data from the new export endpoint
      const response = await apiRequest('GET', `/api/pos/${po.id}/export`);
      const responseData = await response.json();
      
      console.log(`🔍 FRONTEND DEBUG: API Response:`, responseData);
      
      if (!responseData.success || !responseData.data) {
        throw new Error('Failed to fetch export data');
      }

      const exportData = responseData.data;
      console.log(`🔍 FRONTEND DEBUG: Export data:`, exportData);
      console.log(`🔍 FRONTEND DEBUG: Lines count: ${exportData.lines?.length || 0}`);
      
      if (exportData.lines && exportData.lines.length > 0) {
        console.log(`🔍 FRONTEND DEBUG: First 3 line items:`, exportData.lines.slice(0, 3));
        console.log(`🔍 FRONTEND DEBUG: All line items:`, exportData.lines);
      }
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Create PO Master worksheet
      const poMasterWorksheet = XLSX.utils.json_to_sheet([exportData.master]);
      const poMasterColWidths = [
        { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 20 }
      ];
      poMasterWorksheet['!cols'] = poMasterColWidths;
      XLSX.utils.book_append_sheet(workbook, poMasterWorksheet, 'PO Master');
      
      // Create Order Items worksheet if there are items
      if (exportData.lines && exportData.lines.length > 0) {
        console.log(`🔍 FRONTEND DEBUG: Creating Excel with ${exportData.lines.length} line items`);
        const itemsWorksheet = XLSX.utils.json_to_sheet(exportData.lines);
        const itemsColWidths = [
          { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, 
          { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }
        ];
        itemsWorksheet['!cols'] = itemsColWidths;
        XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'PO Lines');
        
        // Debug what will be written to Excel
        console.log(`🔍 FRONTEND DEBUG: Excel worksheet data preview:`, 
          JSON.stringify(exportData.lines.slice(0, 2), null, 2));
      } else {
        console.log(`🔍 FRONTEND DEBUG: No lines to export`);
      }
      
      // Generate filename with PO number
      const filename = `PO_${po.po_number}_raw_data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      console.log(`🔍 FRONTEND DEBUG: Writing Excel file: ${filename}`);
      
      // Write file
      XLSX.writeFile(workbook, filename);
      
      console.log(`✅ FRONTEND DEBUG: Excel export completed for ${po.po_number}`);
      
      toast({
        title: "PO Exported",
        description: `Purchase order ${po.po_number} exported with raw database data`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export purchase order. Please try again.",
        variant: "destructive"
      });
    }
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

  // Apply filters to show only relevant POs (same logic used by export)
  const filteredPOs = pos.filter(po => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        po.po_number?.toLowerCase().includes(searchLower) ||
        po.platform?.pf_name?.toLowerCase().includes(searchLower) ||
        po.city?.toLowerCase().includes(searchLower) ||
        po.state?.toLowerCase().includes(searchLower) ||
        po.serving_distributor?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all" && po.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Platform filter
    if (platformFilter !== "all" && po.platform?.id.toString() !== platformFilter) {
      return false;
    }

    // Order date filters
    if (orderDateFrom && po.order_date) {
      const poDate = new Date(po.order_date);
      const fromDate = new Date(orderDateFrom);
      if (isBefore(poDate, fromDate)) return false;
    }
    
    if (orderDateTo && po.order_date) {
      const poDate = new Date(po.order_date);
      const toDate = new Date(orderDateTo);
      if (isAfter(poDate, toDate)) return false;
    }

    // Expiry date filters
    if (expiryDateFrom && po.expiry_date) {
      const expiryDate = new Date(po.expiry_date);
      const fromDate = new Date(expiryDateFrom);
      if (isBefore(expiryDate, fromDate)) return false;
    }
    
    if (expiryDateTo && po.expiry_date) {
      const expiryDate = new Date(po.expiry_date);
      const toDate = new Date(expiryDateTo);
      if (isAfter(expiryDate, toDate)) return false;
    }

    return true;
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
            <Button 
              variant="outline" 
              onClick={handleExportAmazonDirect}
              className="flex items-center space-x-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            >
              <Download className="h-4 w-4" />
              <span>Amazon RAW</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportDealshareRAW}
              className="flex items-center space-x-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <Download className="h-4 w-4" />
              <span>Dealshare RAW</span>
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
                        onClick={() => handleExportSinglePO(po)}
                        className="hover:bg-purple-50 border-purple-200"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Excel
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
                        {format(new Date(po.order_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {po.expiry_date ? format(new Date(po.expiry_date), 'MMM dd, yyyy') : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{po.city}, {po.state}</p>
                    </div>
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