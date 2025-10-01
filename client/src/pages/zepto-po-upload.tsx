import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Eye, Database } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ParsedPOData {
  header?: any;
  lines?: any[];
  poList?: Array<{
    header: any;
    lines: any[];
  }>;
  totalItems?: number;
  totalQuantity?: number;
  totalAmount?: string;
  detectedVendor?: string;
  totalPOs?: number;
  source?: string;
}

export default function ZeptoPoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedPOData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform', 'zepto');
      
      const response = await fetch('/api/po/preview', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to preview file');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Preview data received:', data);
      setParsedData(data.data || data);
      setShowPreview(true);
      const message = data.data?.poList
        ? `Found ${data.data.totalPOs || data.data.poList.length} POs with ${data.data.poList.reduce((sum: number, po: any) => sum + (po.lines?.length || 0), 0)} total items`
        : `Found ${data.totalItems || data.lines?.length || 0} items`;

      toast({
        title: "File previewed successfully",
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Preview failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      // Handle both single PO and multiple POs
      if (data.poList) {
        // Multiple POs - import each one
        const results = [];
        for (const po of data.poList) {
          const response = await fetch('/api/zepto/confirm-insert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              po_header: po.header,
              po_lines: po.lines
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to import PO ${po.header.po_number}: ${error.error || 'Unknown error'}`);
          }

          results.push(await response.json());
        }
        return { results, totalPOs: data.poList.length };
      } else {
        // Single PO
        const response = await fetch('/api/zepto/confirm-insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            po_header: data.header,
            po_lines: data.lines
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to import PO');
        }

        return response.json();
      }
    },
    onSuccess: (data) => {
      if (data.results) {
        // Multiple POs imported
        toast({
          title: "Multiple POs imported successfully",
          description: `${data.totalPOs} Zepto POs have been imported`,
        });
      } else {
        // Single PO imported
        toast({
          title: "PO imported successfully",
          description: `PO has been created`,
        });
      }
      setFile(null);
      setParsedData(null);
      setShowPreview(false);
      queryClient.invalidateQueries({ queryKey: ["/api/zepto-pos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    const isValidFile = validTypes.includes(selectedFile.type) || 
                       selectedFile.name.endsWith('.csv') || 
                       selectedFile.name.endsWith('.xls') || 
                       selectedFile.name.endsWith('.xlsx');

    if (isValidFile) {
      setFile(selectedFile);
      setParsedData(null);
      setShowPreview(false);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to preview",
        variant: "destructive",
      });
      return;
    }

    previewMutation.mutate(file);
  };

  const handleImport = () => {
    if (!parsedData) {
      toast({
        title: "No data to import",
        description: "Please preview the file first",
        variant: "destructive",
      });
      return;
    }

    // Pass the entire parsedData which could contain either single PO or poList
    importMutation.mutate(parsedData);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Zepto PO Upload</h1>
            <p className="text-gray-600">Upload, review, and import Zepto purchase orders</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Zepto PO File
              </CardTitle>
              <CardDescription>
                Upload CSV or Excel files containing Zepto purchase order data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {file ? "File Selected" : "Drop your Zepto CSV/Excel file here"}
                  </p>
                  <p className="text-sm text-gray-500">
                    or{" "}
                    <Label htmlFor="file-upload" className="text-blue-600 hover:underline cursor-pointer">
                      browse to choose a file
                    </Label>
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports .csv, .xls, and .xlsx files
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{file.name}</p>
                    <p className="text-sm text-green-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setParsedData(null);
                      setShowPreview(false);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handlePreview}
                  disabled={!file || previewMutation.isPending}
                  className="flex-1"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMutation.isPending ? "Analyzing..." : "Preview & Review"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {showPreview && parsedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  File Preview & Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced Summary Totals */}
                {parsedData.poList ? (
                  /* Multiple POs Summary */
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Found {parsedData.poList.length} Zepto Purchase Orders</h4>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-purple-600 font-medium text-sm mb-1">Total POs</div>
                        <div className="text-2xl font-bold text-purple-700">{parsedData.poList.length}</div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-blue-600 font-medium text-sm mb-1">Total Line Items</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {parsedData.poList.reduce((sum: number, po: any) => sum + (po.lines?.length || 0), 0)}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-green-600 font-medium text-sm mb-1">Total Quantity</div>
                        <div className="text-2xl font-bold text-green-700">
                          {parsedData.poList.reduce((sum: number, po: any) => {
                            return sum + (po.lines?.reduce((lineSum: number, line: any) => lineSum + (parseInt(line.po_qty) || 0), 0) || 0);
                          }, 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="text-emerald-600 font-medium text-sm mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-emerald-700">
                          ₹{(() => {
                            const totalAmount = parsedData.poList.reduce((sum: number, po: any) => {
                              const poAmount = parseFloat(po.header?.total_amount || po.header?.po_amount || '0');
                              return sum + poAmount;
                            }, 0);
                            return totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single PO Summary */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-lg">PO: {parsedData.header?.po_number || "N/A"}</h4>
                      <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                        {parsedData.lines?.length || 0} line items
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border mb-4">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">PO Number</span>
                        <div className="font-semibold text-blue-600">
                          {parsedData.header?.po_number || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">PO Date</span>
                        <div className="font-semibold">
                          {parsedData.header?.po_date || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Vendor</span>
                        <div className="font-semibold">
                          {parsedData.header?.vendor_name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Status</span>
                        <div className="font-semibold text-green-600">
                          {parsedData.header?.status || 'Open'}
                        </div>
                      </div>
                    </div>

                    {/* Summary Totals Cards for Single PO */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-blue-600 font-medium text-sm mb-1">Total Line Items</div>
                        <div className="text-2xl font-bold text-blue-700">{parsedData.lines?.length || 0}</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-green-600 font-medium text-sm mb-1">Total Quantity</div>
                        <div className="text-2xl font-bold text-green-700">
                          {parsedData.lines?.reduce((sum: number, line: any) => sum + (parseInt(line.po_qty) || 0), 0).toLocaleString('en-IN') || 0}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-purple-600 font-medium text-sm mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-purple-700">
                          ₹{(() => {
                            if (parsedData.header?.total_amount || parsedData.header?.po_amount) {
                              const amount = parseFloat(parsedData.header.total_amount || parsedData.header.po_amount);
                              return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                            const calculatedTotal = parsedData.lines?.reduce((sum: number, line: any) => sum + (parseFloat(line.total_value) || 0), 0) || 0;
                            return calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PO Header Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium">
                    {parsedData.poList ? `PO Headers (${parsedData.poList.length} POs)` : "PO Header Information"}
                  </h4>

                  {parsedData.poList ? (
                    <div className="space-y-3">
                      {parsedData.poList.slice(0, 3).map((po, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium text-sm">PO #{index + 1}</h5>
                            <Badge variant="secondary">{po.lines?.length || 0} items</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div><strong>PO Number:</strong> {po.header?.po_number || "N/A"}</div>
                            <div><strong>PO Date:</strong> {po.header?.po_date || "N/A"}</div>
                            <div><strong>Status:</strong> <Badge variant="outline">{po.header?.status || "Open"}</Badge></div>
                            <div><strong>Vendor Code:</strong> {po.header?.vendor_code || "N/A"}</div>
                            <div><strong>Vendor Name:</strong> {po.header?.vendor_name || "N/A"}</div>
                            <div><strong>PO Amount:</strong> ₹{po.header?.po_amount || po.header?.total_amount || "N/A"}</div>
                            <div><strong>Delivery Location:</strong> {po.header?.delivery_location || "N/A"}</div>
                            <div><strong>Total Quantity:</strong> {po.header?.total_quantity || 0}</div>
                            <div><strong>Brands:</strong> {po.header?.unique_brands?.length || 0} unique</div>
                          </div>
                        </div>
                      ))}
                      {parsedData.poList.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          Showing first 3 of {parsedData.poList.length} POs. All POs will be imported.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div><strong>PO Number:</strong> {parsedData.header?.po_number || "N/A"}</div>
                        <div><strong>PO Date:</strong> {parsedData.header?.po_date || "N/A"}</div>
                        <div><strong>Status:</strong> <Badge variant="outline">{parsedData.header?.status || "Open"}</Badge></div>
                        <div><strong>Vendor Code:</strong> {parsedData.header?.vendor_code || "N/A"}</div>
                        <div><strong>Vendor Name:</strong> {parsedData.header?.vendor_name || "N/A"}</div>
                        <div><strong>PO Amount:</strong> ₹{parsedData.header?.po_amount || "N/A"}</div>
                        <div><strong>Delivery Location:</strong> {parsedData.header?.delivery_location || "N/A"}</div>
                        <div><strong>PO Expiry Date:</strong> {parsedData.header?.po_expiry_date || "N/A"}</div>
                        <div><strong>Total Brands:</strong> {parsedData.header?.unique_brands?.length || 0}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Items Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium">Line Items Preview</h4>
                  <div className="border rounded-lg overflow-x-auto max-w-full">
                    <Table className="min-w-full whitespace-nowrap">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">PO No</TableHead>
                          <TableHead className="min-w-[120px]">SKU</TableHead>
                          <TableHead className="min-w-[250px]">SKU Desc</TableHead>
                          <TableHead className="min-w-[100px]">Brand</TableHead>
                          <TableHead className="min-w-[120px]">EAN</TableHead>
                          <TableHead className="min-w-[100px]">HSN</TableHead>
                          <TableHead className="min-w-[100px]">MRP</TableHead>
                          <TableHead className="min-w-[80px]">Qty</TableHead>
                          <TableHead className="min-w-[120px]">Unit Base Cost</TableHead>
                          <TableHead className="min-w-[120px]">Landing Cost</TableHead>
                          <TableHead className="min-w-[120px]">Total Amount</TableHead>
                          <TableHead className="min-w-[80px]">CGST %</TableHead>
                          <TableHead className="min-w-[80px]">SGST %</TableHead>
                          <TableHead className="min-w-[80px]">IGST %</TableHead>
                          <TableHead className="min-w-[80px]">CESS %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const allLines = parsedData.poList
                            ? parsedData.poList.flatMap((po, poIndex) =>
                                po.lines?.map((line: any, lineIndex: number) => ({
                                  ...line,
                                  po_number_display: po.header.po_number,
                                  display_key: `${poIndex}-${lineIndex}`
                                })) || []
                              )
                            : parsedData.lines || [];

                          return allLines.slice(0, 10).map((line: any, index: number) => (
                            <TableRow key={line.display_key || index}>
                              <TableCell className="min-w-[100px] font-medium">{line.po_number || line.po_number_display || "-"}</TableCell>
                              <TableCell className="min-w-[120px] font-mono text-xs" title={line.sku}>
                                {line.sku ? `${line.sku.substring(0, 12)}...` : "-"}
                              </TableCell>
                              <TableCell className="min-w-[250px]" title={line.sku_desc}>
                                <div className="max-w-[250px] truncate">
                                  {line.sku_desc || "-"}
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[100px]">{line.brand || "-"}</TableCell>
                              <TableCell className="min-w-[120px] font-mono text-xs">{line.ean_no || "-"}</TableCell>
                              <TableCell className="min-w-[100px]">{line.hsn_code || "-"}</TableCell>
                              <TableCell className="min-w-[100px] text-right">{line.mrp && Number(line.mrp) > 0 ? `₹${Number(line.mrp).toFixed(2)}` : "-"}</TableCell>
                              <TableCell className="min-w-[80px] text-center">{line.po_qty || "-"}</TableCell>
                              <TableCell className="min-w-[120px] text-right">{line.cost_price && Number(line.cost_price) > 0 ? `₹${Number(line.cost_price).toFixed(2)}` : "-"}</TableCell>
                              <TableCell className="min-w-[120px] text-right">{line.landing_cost && Number(line.landing_cost) > 0 ? `₹${Number(line.landing_cost).toFixed(2)}` : "-"}</TableCell>
                              <TableCell className="min-w-[120px] text-right font-medium">{line.total_value && Number(line.total_value) > 0 ? `₹${Number(line.total_value).toFixed(2)}` : "-"}</TableCell>
                              <TableCell className="min-w-[80px] text-center">{line.cgst && Number(line.cgst) > 0 ? `${Number(line.cgst).toFixed(0)}%` : "0%"}</TableCell>
                              <TableCell className="min-w-[80px] text-center">{line.sgst && Number(line.sgst) > 0 ? `${Number(line.sgst).toFixed(0)}%` : "0%"}</TableCell>
                              <TableCell className="min-w-[80px] text-center">{line.igst && Number(line.igst) > 0 ? `${Number(line.igst).toFixed(0)}%` : "0%"}</TableCell>
                              <TableCell className="min-w-[80px] text-center">{line.cess && Number(line.cess) > 0 ? `${Number(line.cess).toFixed(0)}%` : "0%"}</TableCell>
                            </TableRow>
                          ));
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                  {(() => {
                    const totalLines = parsedData.poList
                      ? parsedData.poList.reduce((sum, po) => sum + (po.lines?.length || 0), 0)
                      : parsedData.lines?.length || 0;

                    return totalLines > 10 ? (
                      <p className="text-sm text-gray-500 text-center">
                        Showing first 10 of {totalLines} line items across {parsedData.poList?.length || 1} PO(s). All items will be imported.
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Import Action */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleImport}
                    disabled={importMutation.isPending}
                    className="flex-1"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {importMutation.isPending ? "Importing..." : "Import to Database"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-medium mb-1">Upload File</h4>
                    <p className="text-gray-600">Upload your Zepto CSV or Excel file</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-medium mb-1">Preview & Review</h4>
                    <p className="text-gray-600">Review the parsed data to ensure accuracy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-medium mb-1">Import to Database</h4>
                    <p className="text-gray-600">Import the validated data into the system</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> Please ensure your CSV file follows the standard Zepto format.
                        Review all data before importing to maintain data integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}