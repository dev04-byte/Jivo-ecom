import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle, Eye, Database } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SwiggyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/swiggy-pos/preview', {
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
      console.log('📊 Preview data received:', data);
      if (data.poList && data.poList.length > 0) {
        console.log('📅 First PO date:', data.poList[0].header.po_date);
        console.log('📅 Date type:', typeof data.poList[0].header.po_date);
      } else if (data.header) {
        console.log('📅 PO date:', data.header.po_date);
        console.log('📅 Date type:', typeof data.header.po_date);
      }
      setPreviewData(data);
      toast({
        title: "Preview Generated",
        description: `Found ${data.totalPOs || 1} PO(s). Review the data before importing.`,
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

  const confirmMutation = useMutation({
    mutationFn: async (data: any) => {
      // Send data directly to API as the API handles both single and multiple POs
      const response = await fetch('/api/swiggy/confirm-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to import PO');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.totalPOs && data.totalPOs > 1) {
        // Multiple POs imported
        toast({
          title: "Multiple POs imported successfully",
          description: `${data.successCount || data.totalPOs} Swiggy POs have been imported`,
        });
      } else {
        // Single PO imported
        toast({
          title: "Import Successful",
          description: data.message || `Swiggy PO imported successfully!`,
        });
      }
      setFile(null);
      setPreviewData(null);
      queryClient.invalidateQueries({ queryKey: ["/api/swiggy-pos"] });
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
      const selectedFile = files[0];
      if (selectedFile.type === "application/vnd.ms-excel" ||
          selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "text/csv" ||
          selectedFile.name.endsWith('.xls') ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xls, .xlsx) or CSV file (.csv)",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      if (selectedFile.type === "application/vnd.ms-excel" ||
          selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "text/csv" ||
          selectedFile.name.endsWith('.xls') ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xls, .xlsx) or CSV file (.csv)",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreview = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel or CSV file to preview",
        variant: "destructive",
      });
      return;
    }

    previewMutation.mutate(file);
  };

  const handleImport = () => {
    if (!previewData) {
      toast({
        title: "No data to import",
        description: "Please preview the file first",
        variant: "destructive",
      });
      return;
    }

    // Prepare data structure to match what the API expects
    if (previewData.poList) {
      // Multiple POs from CSV - send as poList
      confirmMutation.mutate({
        poList: previewData.poList
      });
    } else {
      // Single PO from Excel - send as po_header and po_lines
      confirmMutation.mutate({
        po_header: previewData.header,
        po_lines: previewData.lines
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Swiggy PO Upload</h1>
          <p className="text-gray-600">Upload and process Swiggy purchase order Excel files</p>
        </div>
      </div>

      {/* MASSIVE IMPORT BUTTON AT THE TOP - ALWAYS VISIBLE */}
      <div style={{
        backgroundColor: '#10b981',
        padding: '30px',
        borderRadius: '12px',
        border: '4px solid #059669',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        marginBottom: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px'
          }}>
            IMPORT DATA INTO DATABASE
          </h1>
          <button
            onClick={() => {
              if (!file) {
                alert('Please select a file first!');
                return;
              }
              const formData = new FormData();
              formData.append('file', file);

              fetch('/api/swiggy-pos/upload', {
                method: 'POST',
                body: formData,
              })
              .then(response => response.json())
              .then(data => {
                alert(`Success! PO Number: ${data.po_number}`);
                setFile(null);
                setPreviewData(null);
                window.location.reload();
              })
              .catch(error => {
                alert('Upload failed: ' + error.message);
              });
            }}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              padding: '20px 60px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            🚀 CLICK HERE TO IMPORT TO DATABASE 🚀
          </button>
          {file && (
            <p style={{ color: 'white', marginTop: '15px', fontSize: '18px' }}>
              Selected file: {file.name}
            </p>
          )}
        </div>
      </div>

      {/* SECONDARY IMPORT BUTTON - ALSO ALWAYS VISIBLE */}
      <Button
        onClick={() => {
          if (!file) {
            toast({
              title: "No File Selected",
              description: "Please select a Swiggy PO file first",
              variant: "destructive",
            });
            return;
          }
          const formData = new FormData();
          formData.append('file', file);

          fetch('/api/swiggy-pos/upload', {
            method: 'POST',
            body: formData,
          })
          .then(response => response.json())
          .then(data => {
            toast({
              title: "Success",
              description: `Swiggy PO imported successfully! PO Number: ${data.po_number}`,
            });
            setFile(null);
            setPreviewData(null);
          })
          .catch(error => {
            toast({
              title: "Upload failed",
              description: error.message,
              variant: "destructive",
            });
          });
        }}
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4"
      >
        <Database className="h-6 w-6 mr-3" />
        ALTERNATIVE: Import Data into Database
      </Button>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Swiggy PO File
            </CardTitle>
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
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {file ? "File Selected" : "Drop your Excel file here"}
                </p>
                <p className="text-sm text-gray-500">
                  or{" "}
                  <Label htmlFor="file-upload" className="text-blue-600 hover:underline cursor-pointer">
                    browse to choose a file
                  </Label>
                </p>
                <p className="text-xs text-gray-400">
                  Supports .xls, .xlsx, and .csv files
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
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
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}

            {/* Simple Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePreview}
                disabled={!file || previewMutation.isPending}
                className="flex-1"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMutation.isPending ? "Generating Preview..." : "Preview Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Data Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previewData.poList ? (
                  // Multiple POs from CSV
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg">
                        Found {previewData.totalPOs} Purchase Orders
                      </h4>
                      <div className="text-sm text-gray-600">
                        Ready to import {previewData.totalPOs} PO(s)
                      </div>
                    </div>

                    {/* Summary Totals Cards for Multiple POs */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-purple-600 font-medium text-sm mb-1">Total POs</div>
                        <div className="text-2xl font-bold text-purple-700">{previewData.totalPOs || 0}</div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-blue-600 font-medium text-sm mb-1">Total Line Items</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {previewData.poList?.reduce((sum: number, po: any) => sum + (po.lines?.length || 0), 0) || 0}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-green-600 font-medium text-sm mb-1">Total Quantity</div>
                        <div className="text-2xl font-bold text-green-700">
                          {previewData.poList?.reduce((sum: number, po: any) => {
                            return sum + (po.lines?.reduce((lineSum: number, line: any) => lineSum + (parseInt(line.quantity) || 0), 0) || 0);
                          }, 0).toLocaleString('en-IN') || 0}
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="text-emerald-600 font-medium text-sm mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-emerald-700">
                          ₹{(() => {
                            const totalAmount = previewData.poList?.reduce((sum: number, po: any) => {
                              const rawAmount = po.header?.grand_total || po.header?.total_amount || 0;
                              const poAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^\d.-]/g, ''));
                              return sum + (isNaN(poAmount) ? 0 : poAmount);
                            }, 0) || 0;
                            return totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                          <div>PO Number</div>
                          <div>PO Date</div>
                          <div>Vendor</div>
                          <div>Items Count</div>
                          <div>Total Amount</div>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {previewData.poList.slice(0, 10).map((po: any, index: number) => (
                          <div key={index} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                            <div className="font-medium text-blue-600">
                              {po.header.po_number}
                            </div>
                            <div className="text-sm text-gray-600">
                              {(() => {
                                if (!po.header.po_date) return 'N/A';
                                try {
                                  const date = new Date(po.header.po_date);
                                  if (isNaN(date.getTime())) return 'Invalid Date';
                                  return date.toLocaleDateString('en-IN');
                                } catch (e) {
                                  console.error('Error parsing date:', po.header.po_date, e);
                                  return 'Error';
                                }
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {po.header.vendor_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {po.lines?.length || 0} items
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              ₹{(parseFloat(po.header.grand_total || po.header.total_amount || '0')).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        ))}
                        {previewData.totalPOs > 10 && (
                          <div className="text-center text-sm text-gray-500 py-3 bg-gray-50">
                            ... and {previewData.totalPOs - 10} more POs
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Single PO from Excel
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg">
                        PO: {previewData.po_number || previewData.header?.po_number}
                      </h4>
                      <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                        {previewData.lines?.length || 0} line items
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border mb-4">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">PO Number</span>
                        <div className="font-semibold text-blue-600">
                          {previewData.header?.po_number || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">PO Date</span>
                        <div className="font-semibold">
                          {(() => {
                            if (!previewData.header?.po_date) return 'N/A';
                            try {
                              const date = new Date(previewData.header.po_date);
                              if (isNaN(date.getTime())) return 'Invalid Date';
                              return date.toLocaleDateString('en-IN');
                            } catch (e) {
                              console.error('Error parsing date:', previewData.header.po_date, e);
                              return 'Error';
                            }
                          })()}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Vendor</span>
                        <div className="font-semibold">
                          {previewData.header?.vendor_name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Total Amount</span>
                        <div className="font-semibold text-green-600">
                          ₹{previewData.header?.grand_total?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Summary Totals Cards */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-blue-600 font-medium text-sm mb-1">Total Line Items</div>
                        <div className="text-2xl font-bold text-blue-700">{previewData.lines?.length || 0}</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-green-600 font-medium text-sm mb-1">Total Quantity</div>
                        <div className="text-2xl font-bold text-green-700">
                          {previewData.lines?.reduce((sum: number, line: any) => sum + (parseInt(line.quantity) || 0), 0).toLocaleString('en-IN') || 0}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-purple-600 font-medium text-sm mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-purple-700">
                          ₹{(() => {
                            if (previewData.header?.grand_total) {
                              return previewData.header.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                            const calculatedTotal = previewData.lines?.reduce((sum: number, line: any) => {
                              const rawTotal = line.total_amount || line.line_total || 0;
                              const lineTotal = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal).replace(/[^\d.-]/g, ''));
                              return sum + (isNaN(lineTotal) ? 0 : lineTotal);
                            }, 0) || 0;
                            return calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Line Items Preview Table */}
                    {previewData.lines && previewData.lines.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Line Items Preview (showing first 5)</h5>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b">
                            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
                              <div>Item Code</div>
                              <div>Description</div>
                              <div>Quantity</div>
                              <div>Unit Price</div>
                              <div>Total</div>
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {previewData.lines.slice(0, 5).map((line: any, index: number) => (
                              <div key={index} className="grid grid-cols-5 gap-4 px-4 py-2 border-b border-gray-100 text-sm">
                                <div className="font-medium text-blue-600">
                                  {line.item_code || 'N/A'}
                                </div>
                                <div className="text-gray-600 truncate">
                                  {line.item_description || 'N/A'}
                                </div>
                                <div className="text-gray-600">
                                  {line.quantity || 0}
                                </div>
                                <div className="text-gray-600">
                                  ₹{line.unit_price?.toLocaleString() || '0'}
                                </div>
                                <div className="text-gray-600 font-medium">
                                  ₹{line.total_amount?.toLocaleString() || '0'}
                                </div>
                              </div>
                            ))}
                            {previewData.lines.length > 5 && (
                              <div className="text-center text-sm text-gray-500 py-2 bg-gray-50">
                                ... and {previewData.lines.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Action Section like Zepto */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleImport}
                    disabled={confirmMutation.isPending}
                    className="flex-1"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {confirmMutation.isPending ? "Importing..." : "Import to Database"}
                  </Button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <p className="text-green-800 font-semibold text-lg">
                        Data Preview Complete - Ready to Import!
                      </p>
                    </div>
                    <p className="text-green-700 text-sm mb-6">
                      Review the data above and click the button below to import the PO(s) to your database.
                    </p>

                    {/* Import Button in Preview Section */}
                    <Button
                      onClick={handleImport}
                      disabled={confirmMutation.isPending}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                    >
                      <Database className="h-6 w-6 mr-3" />
                      {confirmMutation.isPending ? "Importing to Database..." : "Import Data into Database"}
                    </Button>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        {previewData.poList ?
                          `Ready to import ${previewData.totalPOs} Swiggy PO(s) to your database` :
                          `Ready to import PO ${previewData.header?.po_number || ''} with ${previewData.lines?.length || 0} line items`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Import Button - Bottom of page */}
        {previewData && (
          <Card className="mt-6 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Alternative Import Option
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  You can also import from here if you missed the button above
                </p>
                <Button
                  onClick={handleImport}
                  disabled={confirmMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  size="lg"
                >
                  <Database className="h-5 w-5 mr-2" />
                  {confirmMutation.isPending ? "Importing to Database..." : "Import Data into Database"}
                </Button>
                <div className="text-center mt-3">
                  <p className="text-sm text-gray-600">
                    {previewData.poList ?
                      `Ready to import ${previewData.totalPOs} Swiggy PO(s) to your database` :
                      `Ready to import PO ${previewData.header?.po_number || ''} with ${previewData.lines?.length || 0} line items`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>File Format Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-2">Supported Format:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Excel files (.xls, .xlsx)</li>
                  <li>CSV files (.csv)</li>
                  <li>XML-based Excel format from Swiggy</li>
                  <li>Files should contain PO header and line item details</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Expected Data:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>PO Number (should contain "SOTY-" pattern)</li>
                  <li>PO Date</li>
                  <li>Item codes and descriptions</li>
                  <li>Quantities and pricing information</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> The system will automatically extract PO details from the Excel structure.
                  Make sure your file follows the standard Swiggy PO format.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}