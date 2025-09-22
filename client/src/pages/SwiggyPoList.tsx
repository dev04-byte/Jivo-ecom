import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, Calendar, MapPin, Truck, Eye, Database, RefreshCw, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SwiggyPoDetails } from "@/components/SwiggyPoDetails";

interface SwiggyPo {
  id: number;
  po_number: string;
  entity?: string | null;
  facility_id?: string | null;
  facility_name?: string | null;
  city?: string | null;
  po_date: string | null;
  po_release_date: string | null;
  po_modified_at?: string | null;
  expected_delivery_date: string | null;
  po_expiry_date: string | null;
  supplier_code?: string | null;
  vendor_name: string | null;
  po_amount?: string | null;
  payment_terms: string | null;
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
    hsn_code: string | null;
    quantity: number;
    mrp: string | number | null;
    unit_base_cost: string | number | null;
    taxable_value: string | number | null;
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
    created_at: string;
  }>;
}

export default function SwiggyPoList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPo, setSelectedPo] = useState<SwiggyPo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: swiggyPos = [], isLoading, refetch } = useQuery<SwiggyPo[]>({
    queryKey: ["/api/swiggy-pos"],
  });


  const filteredPos = swiggyPos.filter(po =>
    po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.payment_terms?.toLowerCase().includes(searchTerm.toLowerCase())
  );


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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Swiggy POs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Swiggy Purchase Orders</h1>
          <p className="text-gray-600">Manage and import your Swiggy purchase orders</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Orders ({filteredPos.length})
          </CardTitle>
          <CardDescription>
            View and manage your imported Swiggy purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by PO number, vendor, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Swiggy POs Found</h3>
              <p className="text-gray-600">Upload some Swiggy purchase orders to get started</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>PO Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>HSN Codes</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPos.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium text-blue-600 font-mono max-w-xs">
                        <span className="break-all">{po.po_number}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{po.vendor_name || 'N/A'}</div>
                          {po.facility_name && (
                            <div className="text-sm text-gray-600">{po.facility_name} • {po.city || ''}</div>
                          )}
                          {po.supplier_code && (
                            <div className="text-xs text-gray-500">Code: {po.supplier_code}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {po.po_date ? format(new Date(po.po_date), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-gray-400" />
                          {po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {po.total_items || po.poLines?.length || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {po.unique_hsn_codes && po.unique_hsn_codes.length > 0 && po.unique_hsn_codes.some(hsn => hsn && hsn.trim()) ? (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {po.unique_hsn_codes.filter(hsn => hsn && hsn.trim()).length} HSN{po.unique_hsn_codes.filter(hsn => hsn && hsn.trim()).length > 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Via Platform</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ₹{po.po_amount || po.grand_total ?
                            (typeof (po.po_amount || po.grand_total) === 'string' ?
                              parseFloat((po.po_amount || po.grand_total) as string) :
                              (po.po_amount || po.grand_total)
                            ).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) :
                            '0'}
                        </div>
                        {po.total_quantity && (
                          <div className="text-xs text-gray-500">Qty: {po.total_quantity}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(po.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPo(po);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SwiggyPoDetails
        po={selectedPo}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}