import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { ArrowLeft, Package, Calendar, User, Hash, Banknote, Eye, CheckCircle, AlertCircle } from "lucide-react";

interface ZeptoPoDetails {
  id: number;
  po_number: string;
  po_date?: string;
  status: string;
  vendor_code?: string;
  vendor_name?: string;
  po_amount?: string;
  delivery_location?: string;
  po_expiry_date?: string;
  total_quantity: number;
  total_cost_value: string;
  total_tax_amount: string;
  total_amount: string;
  unique_brands: string[];
  created_by: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  poLines: Array<{
    id: number;
    po_header_id: number;
    line_number: number;
    po_number: string;
    sku: string;
    sku_desc?: string;
    brand: string;
    sku_id: string;
    sap_id: string;
    hsn_code: string;
    ean_no: string;
    po_qty: number;
    asn_qty: number;
    grn_qty: number;
    remaining_qty: number;
    cost_price: string;
    landing_cost?: string;
    cgst: string;
    sgst: string;
    igst: string;
    cess: string;
    mrp: string;
    total_value: string;
    status: string;
    created_by: string;
    created_at: string;
  }>;
}

export default function ZeptoPoDetails() {
  const [match, params] = useRoute("/zepto-pos/:id");
  const poId = params?.id ? parseInt(params.id) : 0;

  const { data: po, isLoading, error } = useQuery<ZeptoPoDetails>({
    queryKey: [`/api/zepto-pos/${poId}`],
    enabled: !!poId,
  });

  // Debug logging
  console.log('ZeptoPoDetails component:', { poId, queryKey: `/api/zepto-pos/${poId}` });
  if (po) {
    console.log('Zepto PO data loaded:', { id: po.id, po_number: po.po_number });
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <h3 className="mt-4 text-lg font-semibold">Loading PO Details...</h3>
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
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold">PO Not Found</h3>
            <p className="text-muted-foreground">The purchase order you're looking for doesn't exist.</p>
            <Link href="/zepto-pos">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to POs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Open': 'bg-green-100 text-green-800 border-green-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PENDING_ACKNOWLEDGEMENT': 'bg-orange-100 text-orange-800 border-orange-200',
      'PENDING_ASN_CREATION': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
      <Badge
        variant="outline"
        className={statusColors[status as keyof typeof statusColors] || 'bg-blue-100 text-blue-800 border-blue-200'}
      >
        {status}
      </Badge>
    );
  };

  const getLineStatusBadge = (status: string) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Received': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge 
        variant="outline" 
        className={statusColors[status as keyof typeof statusColors] || 'bg-blue-100 text-blue-800 border-blue-200'}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/zepto-pos">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{po.po_number}</h1>
                <p className="text-muted-foreground">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">Zepto</span> Purchase Order Details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(po.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* PO Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{po.total_quantity.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Items ordered
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost Value</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Number(po.total_cost_value).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Cost price total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Amount</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Number(po.total_tax_amount).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total taxes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Number(po.total_amount).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Final amount
                </p>
              </CardContent>
            </Card>
          </div>

          {/* PO Details */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                  <p className="text-lg font-semibold">{po.po_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PO Date</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{po.po_date ? new Date(po.po_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(po.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor Code</label>
                  <p className="text-lg">{po.vendor_code || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                  <p className="text-lg">{po.vendor_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PO Amount</label>
                  <p className="text-lg font-semibold">
                    {po.po_amount && Number(po.po_amount) > 0 ? `₹${Number(po.po_amount).toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Location</label>
                  <p className="text-lg">{po.delivery_location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PO Expiry Date</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{po.po_expiry_date ? new Date(po.po_expiry_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Number of Brands</label>
                  <p className="text-lg">{po.unique_brands.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Line Items</label>
                  <p className="text-lg">{po.poLines.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="text-lg">{po.created_by || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(po.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mt-6">
                <label className="text-sm font-medium text-muted-foreground">Brands</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {po.unique_brands.map((brand, index) => (
                    <Badge key={index} variant="outline">{brand}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items ({po.poLines.length})</CardTitle>
              <CardDescription>
                Detailed breakdown of all items in this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {po.poLines.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No line items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product Description</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>EAN</TableHead>
                        <TableHead>HSN</TableHead>
                        <TableHead>MRP</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Base Cost</TableHead>
                        <TableHead>Landing Cost</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>CGST %</TableHead>
                        <TableHead>SGST %</TableHead>
                        <TableHead>IGST %</TableHead>
                        <TableHead>CESS %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {po.poLines.map((line, index) => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-mono text-xs truncate" title={line.sku}>
                                {line.sku ? `${line.sku.substring(0, 8)}...` : `Line ${index + 1}`}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p className="text-sm" title={line.sku_desc}>
                                {line.sku_desc || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{line.brand || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {line.ean_no && line.ean_no !== '0' ? line.ean_no : '-'}
                          </TableCell>
                          <TableCell>{line.hsn_code || '-'}</TableCell>
                          <TableCell className="text-right">
                            {line.mrp && Number(line.mrp) > 0 ? `₹${Number(line.mrp).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {line.po_qty && line.po_qty > 0 ? line.po_qty.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.cost_price && Number(line.cost_price) > 0 ? `₹${Number(line.cost_price).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.landing_cost && Number(line.landing_cost) > 0 ? `₹${Number(line.landing_cost).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {line.total_value && Number(line.total_value) > 0 ? `₹${Number(line.total_value).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.cgst && Number(line.cgst) > 0 ? `${Number(line.cgst).toFixed(0)}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.sgst && Number(line.sgst) > 0 ? `${Number(line.sgst).toFixed(0)}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.igst && Number(line.igst) > 0 ? `${Number(line.igst).toFixed(0)}%` : '0%'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.cess && Number(line.cess) > 0 ? `${Number(line.cess).toFixed(0)}%` : '0%'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}