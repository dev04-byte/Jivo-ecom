import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, Upload, ArrowRight, Check, X, Database, Eye, ExternalLink,
  Loader2, AlertTriangle, RefreshCw, Download, Zap, Sparkles, CheckCircle2
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Step = "platform" | "upload" | "preview" | "success";

interface Platform {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  queryKey: string;
  icon: string;
  color: string;
  supportedFormats: string[];
  maxFileSize: number; // in MB
}

const PLATFORMS: Platform[] = [
  {
    id: "flipkart",
    name: "Flipkart Grocery",
    description: "Upload Flipkart Grocery PO Excel/CSV files",
    endpoint: "/api/flipkart-grocery-pos",
    queryKey: "/api/flipkart-grocery-pos",
    icon: "🛒",
    color: "bg-orange-500",
    supportedFormats: [".xlsx", ".xls", ".csv"],
    maxFileSize: 50
  },
  {
    id: "zepto",
    name: "Zepto",
    description: "Upload Zepto PO Excel/CSV files with real-time validation",
    endpoint: "/api/zepto-pos",
    queryKey: "/api/zepto-pos",
    icon: "⚡",
    color: "bg-purple-500",
    supportedFormats: [".xlsx", ".xls", ".csv"],
    maxFileSize: 50
  },
  {
    id: "blinkit",
    name: "Blinkit",
    description: "Upload Blinkit PO files (Excel, CSV, or PDF)",
    endpoint: "/api/blinkit-pos",
    queryKey: "/api/blinkit-pos",
    icon: "🚚",
    color: "bg-yellow-500",
    supportedFormats: [".xlsx", ".xls", ".csv", ".pdf"],
    maxFileSize: 100
  },
  {
    id: "swiggy",
    name: "Swiggy Instamart",
    description: "Upload Swiggy PO Excel/CSV files",
    endpoint: "/api/swiggy-pos",
    queryKey: "/api/swiggy-pos",
    icon: "🍔",
    color: "bg-orange-600",
    supportedFormats: [".xlsx", ".xls", ".csv"],
    maxFileSize: 50
  },
  {
    id: "bigbasket",
    name: "BigBasket",
    description: "Upload BigBasket PO Excel/CSV files",
    endpoint: "/api/bigbasket-pos",
    queryKey: "/api/bigbasket-pos",
    icon: "🛍️",
    color: "bg-red-500",
    supportedFormats: [".xlsx", ".xls", ".csv"],
    maxFileSize: 50
  },
  {
    id: "zomato",
    name: "Zomato",
    description: "Upload Zomato PO Excel/CSV files",
    endpoint: "/api/zomato-pos",
    queryKey: "/api/zomato-pos",
    icon: "🍽️",
    color: "bg-red-600",
    supportedFormats: [".xlsx", ".xls", ".csv"],
    maxFileSize: 50
  }
];

interface EnhancedUploadComponentProps {
  onComplete?: () => void;
  className?: string;
}

interface UploadProgress {
  step: string;
  progress: number;
  message: string;
}

export function EnhancedUploadComponent({ onComplete, className }: EnhancedUploadComponentProps) {
  const [currentStep, setCurrentStep] = useState<Step>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedPOs, setImportedPOs] = useState<any[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (!selectedPlatformData) return "Please select a platform first";

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!selectedPlatformData.supportedFormats.includes(fileExtension)) {
      return `Unsupported file format. Supported formats: ${selectedPlatformData.supportedFormats.join(", ")}`;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > selectedPlatformData.maxFileSize) {
      return `File too large. Maximum size: ${selectedPlatformData.maxFileSize}MB`;
    }

    return null;
  }, [selectedPlatformData]);

  // Enhanced preview mutation with progress tracking
  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedPlatformData) throw new Error("No platform selected");

      setIsProcessing(true);
      setUploadProgress({ step: "Uploading", progress: 20, message: "Uploading file to server..." });

      const formData = new FormData();
      formData.append("file", file);

      await new Promise(resolve => setTimeout(resolve, 500)); // Smooth UX
      setUploadProgress({ step: "Processing", progress: 50, message: "Processing file data..." });

      const response = await fetch(`${selectedPlatformData.endpoint}/preview`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process file");
      }

      setUploadProgress({ step: "Validating", progress: 80, message: "Validating data structure..." });
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await response.json();
      setUploadProgress({ step: "Complete", progress: 100, message: "File processed successfully!" });

      return result;
    },
    onSuccess: (data) => {
      setParsedData(data);
      setCurrentStep("preview");
      setIsProcessing(false);
      setUploadProgress(null);

      toast({
        title: "✅ File Processed Successfully",
        description: `Found ${data.totalItems || data.lines?.length || 0} items in ${data.totalPOs || 1} PO(s)`,
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      setUploadProgress(null);

      toast({
        title: "❌ Processing Failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Enhanced import mutation
  const importMutation = useMutation({
    mutationFn: async (importData: any) => {
      if (!selectedPlatformData) throw new Error("No platform selected");

      setUploadProgress({ step: "Importing", progress: 30, message: "Importing data to database..." });

      const response = await fetch(`${selectedPlatformData.endpoint}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import data");
      }

      setUploadProgress({ step: "Finalizing", progress: 90, message: "Finalizing import..." });
      await new Promise(resolve => setTimeout(resolve, 500));

      return response.json();
    },
    onSuccess: (result) => {
      setUploadProgress({ step: "Complete", progress: 100, message: "Import completed successfully!" });

      // Store imported PO details
      if (result.data) {
        setImportedPOs(prev => [...prev, result.data]);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [selectedPlatformData?.queryKey] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos"] });

      setCurrentStep("success");

      toast({
        title: "🎉 Import Successful!",
        description: `PO ${parsedData.header?.po_number || 'data'} imported successfully`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/platform-po')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View All POs
          </Button>
        ),
      });
    },
    onError: (error: Error) => {
      setUploadProgress(null);

      toast({
        title: "❌ Import Failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const validationError = validateFile(files[0]);
      if (validationError) {
        toast({
          title: "Invalid File",
          description: validationError,
          variant: "destructive",
        });
        return;
      }
      setFile(files[0]);
    }
  }, [validateFile, toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const validationError = validateFile(e.target.files[0]);
      if (validationError) {
        toast({
          title: "Invalid File",
          description: validationError,
          variant: "destructive",
        });
        return;
      }
      setFile(e.target.files[0]);
    }
  }, [validateFile, toast]);

  const resetForm = () => {
    setCurrentStep("platform");
    setSelectedPlatform("");
    setFile(null);
    setParsedData(null);
    setUploadProgress(null);
    setIsProcessing(false);
    setImportedPOs([]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "platform":
        return (
          <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-500" />
                Choose Your Platform
              </CardTitle>
              <CardDescription className="text-lg">
                Select the e-commerce platform to upload PO files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => (
                  <Card
                    key={platform.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      selectedPlatform === platform.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${platform.color}`}>
                          <span className="text-2xl">{platform.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{platform.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                          <div className="flex items-center mt-2 gap-2">
                            <Badge variant="outline" className="text-xs">
                              {platform.supportedFormats.join(", ")}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Max {platform.maxFileSize}MB
                            </Badge>
                          </div>
                        </div>
                        {selectedPlatform === platform.id && (
                          <CheckCircle2 className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedPlatform && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => setCurrentStep("upload")}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    Continue with {selectedPlatformData?.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "upload":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${selectedPlatformData?.color}`}>
                  <span>{selectedPlatformData?.icon}</span>
                </div>
                Upload {selectedPlatformData?.name} File
              </CardTitle>
              <CardDescription>
                Upload your {selectedPlatformData?.name} purchase order file for processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${selectedPlatformData?.color || 'bg-gray-400'}`}>
                    <Upload className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <p className="text-xl font-medium">
                      {file ? (
                        <span className="text-green-600">✅ {file.name}</span>
                      ) : (
                        `Drop your ${selectedPlatformData?.name} file here`
                      )}
                    </p>
                    <p className="text-gray-500 mt-2">
                      or{" "}
                      <Label
                        htmlFor="file-upload"
                        className="text-blue-600 hover:underline cursor-pointer font-medium"
                      >
                        browse to choose a file
                      </Label>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Supports {selectedPlatformData?.supportedFormats.join(", ")} • Max {selectedPlatformData?.maxFileSize}MB
                    </p>
                  </div>
                </div>

                <Input
                  id="file-upload"
                  type="file"
                  accept={selectedPlatformData?.supportedFormats.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* File Info */}
              {file && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Processing Progress */}
              {isProcessing && uploadProgress && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{uploadProgress.step}</span>
                    <span className="text-sm text-gray-500">{uploadProgress.progress}%</span>
                  </div>
                  <Progress value={uploadProgress.progress} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">{uploadProgress.message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => file && previewMutation.mutate(file)}
                  disabled={!file || previewMutation.isPending || isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  {previewMutation.isPending || isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Process File
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("platform")}
                  disabled={previewMutation.isPending || isProcessing}
                  size="lg"
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "preview":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Preview & Confirm Import
              </CardTitle>
              <CardDescription>
                Review your {selectedPlatformData?.name} PO data before importing to database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parsedData && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {parsedData.totalPOs || 1}
                        </div>
                        <div className="text-sm text-blue-600">Total POs</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {parsedData.totalItems || parsedData.lines?.length || 0}
                        </div>
                        <div className="text-sm text-green-600">Total Items</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {parsedData.totalQuantity || 0}
                        </div>
                        <div className="text-sm text-purple-600">Total Quantity</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          ₹{parsedData.totalAmount || 0}
                        </div>
                        <div className="text-sm text-orange-600">Total Value</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* PO Header Info */}
                  {parsedData.header && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">PO Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">PO Number:</span>
                            <span className="ml-2">{parsedData.header.po_number || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Date:</span>
                            <span className="ml-2">{parsedData.header.po_date || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Vendor:</span>
                            <span className="ml-2">{parsedData.header.vendor_name || 'N/A'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Line Items Preview */}
                  {parsedData.lines && parsedData.lines.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Line Items ({parsedData.lines.length})</span>
                          <Badge variant="outline">{selectedPlatformData?.name}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {parsedData.lines.slice(0, 10).map((item: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-lg">Item {index + 1}</h4>
                                {item.line_total && (
                                  <span className="text-green-600 font-bold">
                                    ₹{parseFloat(item.line_total).toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(item).filter(([key, value]) =>
                                  value !== null && value !== undefined && value !== '' && !['id'].includes(key)
                                ).map(([key, value]) => (
                                  <div key={key} className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 capitalize">
                                      {key.replace(/_/g, ' ')}
                                    </p>
                                    <p className="font-semibold text-sm break-words">
                                      {String(value)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {parsedData.lines.length > 10 && (
                            <div className="text-center py-4 border-t">
                              <p className="text-sm text-gray-500">
                                Showing first 10 of {parsedData.lines.length} items.
                                All items will be imported to database.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Import Progress */}
                  {uploadProgress && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{uploadProgress.step}</span>
                        <span className="text-sm text-gray-500">{uploadProgress.progress}%</span>
                      </div>
                      <Progress value={uploadProgress.progress} className="w-full" />
                      <p className="text-sm text-gray-600 text-center">{uploadProgress.message}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={() => importMutation.mutate(parsedData)}
                      disabled={importMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {importMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing to Database...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Import to Database
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("upload")}
                      disabled={importMutation.isPending}
                      size="lg"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    🎉 Import Successful!
                  </h3>
                  <p className="text-green-700">
                    Your {selectedPlatformData?.name} PO data has been successfully imported to the database.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setLocation('/platform-po')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View All POs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Upload Another File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case "platform": return 25;
      case "upload": return 50;
      case "preview": return 75;
      case "success": return 100;
      default: return 0;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">PO Upload Wizard</h2>
              <Badge variant="outline">{getStepProgress()}% Complete</Badge>
            </div>

            <Progress value={getStepProgress()} className="w-full" />

            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${currentStep === "platform" ? "text-blue-600 font-medium" : (currentStep === "upload" || currentStep === "preview" || currentStep === "success") ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === "platform" ? "bg-blue-100 text-blue-600" : (currentStep === "upload" || currentStep === "preview" || currentStep === "success") ? "bg-green-100 text-green-600" : "bg-gray-100"}`}>
                  1
                </div>
                Select Platform
              </div>
              <div className={`flex items-center gap-2 ${currentStep === "upload" ? "text-blue-600 font-medium" : ["preview", "success"].includes(currentStep) ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === "upload" ? "bg-blue-100 text-blue-600" : ["preview", "success"].includes(currentStep) ? "bg-green-100 text-green-600" : "bg-gray-100"}`}>
                  2
                </div>
                Upload File
              </div>
              <div className={`flex items-center gap-2 ${currentStep === "preview" ? "text-blue-600 font-medium" : currentStep === "success" ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === "preview" ? "bg-blue-100 text-blue-600" : currentStep === "success" ? "bg-green-100 text-green-600" : "bg-gray-100"}`}>
                  3
                </div>
                Preview & Import
              </div>
              <div className={`flex items-center gap-2 ${currentStep === "success" ? "text-green-600 font-medium" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === "success" ? "bg-green-100 text-green-600" : "bg-gray-100"}`}>
                  ✓
                </div>
                Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}