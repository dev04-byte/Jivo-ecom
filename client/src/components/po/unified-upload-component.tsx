import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, ArrowRight, Check, X, Database, Eye, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AutoPopulateWidget } from "@/components/ui/auto-populate-widget";
import { BlinkitPDFParser, type BlinkitPDFData } from "./blinkit-pdf-parser";

type Step = "platform" | "upload" | "preview";

interface Platform {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  queryKey: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "flipkart",
    name: "Flipkart Grocery",
    description: "Upload Flipkart Grocery PO files",
    endpoint: "/api/flipkart-grocery-pos",
    queryKey: "/api/flipkart-grocery-pos"
  },
  {
    id: "zepto",
    name: "Zepto",
    description: "Upload Zepto PO files",
    endpoint: "/api/zepto-pos",
    queryKey: "/api/zepto-pos"
  },
  {
    id: "citymall",
    name: "City Mall",
    description: "Upload City Mall PO files",
    endpoint: "/api/city-mall-pos",
    queryKey: "/api/city-mall-pos"
  },
  {
    id: "blinkit",
    name: "Blinkit",
    description: "Upload Blinkit PO files",
    endpoint: "/api/blinkit-pos",
    queryKey: "/api/blinkit-pos"
  },
  {
    id: "swiggy",
    name: "Swiggy Instamart",
    description: "Upload Swiggy PO files",
    endpoint: "/api/swiggy-pos",
    queryKey: "/api/swiggy-pos"
  },
  {
    id: "bigbasket",
    name: "BigBasket",
    description: "Upload BigBasket PO files",
    endpoint: "/api/bigbasket-pos",
    queryKey: "/api/bigbasket-pos"
  },
  {
    id: "zomato",
    name: "Zomato",
    description: "Upload Zomato PO files",
    endpoint: "/api/zomato-pos",
    queryKey: "/api/zomato-pos"
  },
  {
    id: "dealshare",
    name: "Dealshare",
    description: "Upload Dealshare PO files",
    endpoint: "/api/dealshare-pos",
    queryKey: "/api/dealshare-pos"
  }
];

interface UnifiedUploadComponentProps {
  onComplete?: () => void;
}

// Helper function to safely display data without N/A fallbacks
const safeDisplay = (value: any, defaultValue: string = '', type?: 'currency' | 'weight' | 'percent'): string => {
  if (value === null || value === undefined || value === '' || value === 'N/A' || (value === '0' && type === 'currency')) {
    return defaultValue;
  }

  const stringValue = String(value).trim();
  if (stringValue === '' || stringValue === 'N/A') {
    return defaultValue;
  }

  if (type === 'currency') {
    const numValue = parseFloat(stringValue.replace(/[^0-9.-]/g, ''));
    return isNaN(numValue) || numValue === 0 ? defaultValue : `₹${numValue.toLocaleString('en-IN')}`;
  }

  if (type === 'weight') {
    // Clean weight value and ensure it shows with units
    const cleanValue = stringValue.replace(/[^0-9.-]/g, '');
    const numValue = parseFloat(cleanValue);
    if (isNaN(numValue) || numValue === 0) return defaultValue;

    // If original value had units, preserve them, otherwise add 'kg'
    if (stringValue.toLowerCase().includes('tonnes') || stringValue.toLowerCase().includes('ton')) {
      return `${numValue} tonnes`;
    } else if (stringValue.toLowerCase().includes('kg')) {
      return `${numValue} kg`;
    } else {
      return `${numValue} kg`; // Default to kg
    }
  }

  if (type === 'percent') {
    const numValue = parseFloat(stringValue.replace(/[^0-9.-]/g, ''));
    return isNaN(numValue) ? defaultValue : `${numValue}%`;
  }

  return stringValue;
};

// Helper function to conditionally render fields (hide empty ones instead of showing "Not available")
const renderField = (label: string, value: any, className: string = '') => {
  if (!value || value === '' || value === 'Not available') {
    return null; // Don't render empty fields
  }
  return (
    <div className={className}>
      <span className="font-medium">{label}:</span> {value}
    </div>
  );
};

export function UnifiedUploadComponent({ onComplete }: UnifiedUploadComponentProps) {
  const [currentStep, setCurrentStep] = useState<Step>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPDFFile, setIsPDFFile] = useState(false);
  const [importedPOs, setImportedPOs] = useState<Array<{id: number, po_number: string, platform: string}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  const resetForm = () => {
    setCurrentStep("platform");
    setSelectedPlatform("");
    setFile(null);
    setParsedData(null);
    setDragActive(false);
    setIsPDFFile(false);
  };

  const handleZeptoImport = async (importData: { header: any, lines: any[] }) => {
    try {
      console.log('🔄 Importing Zepto PO to database...');
      console.log('📦 Frontend sending data:', JSON.stringify({
        po_header: importData.header,
        po_lines: importData.lines
      }, null, 2));

      const response = await fetch('/api/zepto/confirm-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          po_header: importData.header,
          po_lines: importData.lines
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        console.error('📄 Raw response was:', responseText);
        throw new Error('Server returned invalid JSON response');
      }

      if (!response.ok) {
        console.error('Server response:', result);

        // Check if it's a duplicate PO error
        if (response.status === 409 || result.type === 'duplicate_po') {
          toast({
            title: "Duplicate PO Detected",
            description: result.message || `PO ${importData.header.po_number} already exists in the database`,
            variant: "destructive",
          });
          return result;
        }

        const errorMessage = result.error || result.message || 'Failed to import PO to database';
        const errorDetails = result.details ? JSON.stringify(result.details, null, 2) : '';

        if (errorDetails) {
          console.error('Error details:', errorDetails);
        }

        throw new Error(errorMessage);
      }

      // Only show success if the response was actually successful
      if (response.ok && result.success !== false) {
        // Store imported PO details for navigation
        if (result.data && result.data.zepto_header_id) {
          const importedPO = {
            id: result.data.zepto_header_id,
            po_number: importData.header.po_number,
            platform: 'zepto'
          };
          setImportedPOs(prev => [...prev, importedPO]);
        }

        toast({
          title: "Import successful!",
          description: `PO ${importData.header.po_number} has been imported to the database and will appear in Platform Purchase Orders`,
        action: (
          <div className="flex gap-2">
            {result.data?.zepto_header_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/zepto-pos/${result.data.zepto_header_id}`)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/platform-po')}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              All POs
            </Button>
          </div>
        ),
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/zepto-pos"] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos"] }); // For Platform Purchase Orders page

        console.log('✅ Import completed successfully');
      } else {
        // Handle case where response is ok but success is false
        toast({
          title: "Import Failed",
          description: result.message || "Failed to import PO",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Import failed:', error);

      // Get more detailed error information
      let errorMessage = "Unknown error occurred";
      let errorDetails = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.stack) {
          errorDetails = error.stack.split('\n').slice(0, 3).join('\n');
          console.error('Error stack:', errorDetails);
        }
      }

      // Show detailed error in console for debugging
      console.error('🔍 Detailed error breakdown:');
      console.error('- Error message:', errorMessage);
      console.error('- Error details:', errorDetails);
      console.error('- Full error object:', error);

      toast({
        title: "Import failed",
        description: `${errorMessage}${errorDetails ? '\nCheck console for more details.' : ''}`,
        variant: "destructive",
      });
    }
  };

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", selectedPlatform);

      // Note: For PDF files, the server will handle extraction automatically
      // No need to send static data anymore

      const response = await fetch("/api/po/preview", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to preview file");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('🔍 Preview response received:', JSON.stringify(data, null, 2));

      // Handle new real data extraction response (PDF or Excel)
      if (data.success && data.data && (data.data.source === 'pdf_real_data_extracted' || data.data.source === 'excel_real_data_extracted')) {
        toast({
          title: "Data Extracted Successfully",
          description: `Extracted real data for PO ${data.data.po_header.po_number} with ${data.data.po_lines.length} items`,
        });

        // Store the real extracted data for confirmation
        setParsedData({
          success: true,
          po_header: data.data.po_header,
          po_lines: data.data.po_lines,
          summary: data.data.summary,
          validation: data.data.validation,
          source: 'pdf_real_data_extracted',
          message: data.message
        });

        setCurrentStep("preview");
        return;
      }

      // Handle new Zepto multiple PO response
      if (data.success && data.data && data.data.source === 'zepto_multiple_pos') {
        toast({
          title: "Zepto POs Found",
          description: `Found ${data.data.totalPOs} Zepto POs in the file`,
        });

        // Store the Zepto multi-PO data
        setParsedData({
          success: true,
          poList: data.data.poList,
          detectedVendor: data.data.detectedVendor,
          totalPOs: data.data.totalPOs,
          source: data.data.source,
          message: data.message
        });

        setCurrentStep("preview");
        return;
      }

      // Handle single Zepto PO response
      if (data.source === 'zepto_single_po' || (data.header && data.lines && selectedPlatform === 'zepto')) {
        toast({
          title: "Zepto PO Parsed Successfully",
          description: `Zepto PO ${data.header?.po_number || 'Unknown'} with ${data.lines?.length || 0} items`,
        });

        // Store the single Zepto PO data with proper structure
        setParsedData({
          success: true,
          header: data.header,
          lines: data.lines,
          detectedVendor: 'zepto',
          totalItems: data.lines?.length || 0,
          totalQuantity: data.totalQuantity || 0,
          totalAmount: data.totalAmount || '0.00',
          source: 'zepto_single_po'
        });

        setCurrentStep("preview");
        return;
      }

      // Show success toast for PDF to Excel conversion (legacy)
      if (data.source === 'pdf_to_excel') {
        toast({
          title: "PDF Converted Successfully",
          description: `PDF converted to Excel format with ${data.excelData?.rows?.length || 0} items extracted`,
        });
      }

      // Handle new Swiggy multi-PO response
      if (data.multiPO && data.poList && data.totalPOs) {
        toast({
          title: "Swiggy POs Found",
          description: `Found ${data.totalPOs} Swiggy POs in the file`,
        });

        // Store the Swiggy multi-PO data
        setParsedData({
          success: true,
          poList: data.poList,
          detectedVendor: data.detectedVendor,
          totalPOs: data.totalPOs,
          multiPO: true,
          source: 'swiggy_multiple_pos'
        });

        setCurrentStep("preview");
        return;
      }

      // Handle different response structures (legacy)
      let transformedData;
      if (data.poList && Array.isArray(data.poList) && data.poList.length > 0) {
        // Multi-PO response structure (like Blinkit)
        const firstPO = data.poList[0];
        transformedData = {
          header: firstPO.header,
          lines: firstPO.lines,
          poList: data.poList,
          detectedVendor: data.detectedVendor,
          totalPOs: data.totalPOs,
          source: data.source,
          excelData: data.excelData // Include Excel data if available
        };
      } else {
        // Single PO response structure (fallback)
        transformedData = data;
      }

      console.log('🔍 Transformed data for frontend:', JSON.stringify(transformedData, null, 2));
      setParsedData(transformedData);
      setCurrentStep("preview");
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
    mutationFn: async (data: { header?: any; lines?: any[]; poList?: any[] }) => {
      const response = await fetch(`/api/po/import/${selectedPlatform}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409 && error.type === 'duplicate_po') {
          throw new Error(error.error);
        }
        throw new Error(error.error || "Failed to import PO");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      console.log("🔍 Upload response data:", data);
      
      // Handle both single PO response and multi-PO response
      if (data.results && Array.isArray(data.results)) {
        // Multi-PO response (Blinkit)
        const successfulImports = data.results.filter((r: any) => r.status === 'success');
        const failedImports = data.results.filter((r: any) => r.status === 'failed');
        const duplicateImports = data.results.filter((r: any) => r.status === 'duplicate');

        // Check if we have a summary in the response
        if (data.summary) {
          const { success, duplicates, failed, total } = data.summary;

          if (success === 0 && duplicates > 0) {
            // All were duplicates
            toast({
              title: "Duplicate POs Detected",
              description: data.message || `All ${duplicates} PO(s) already exist in the database. No new POs were imported.`,
              variant: "destructive",
            });
          } else if (success === 0 && failed > 0) {
            // All failed
            toast({
              title: "Import Failed",
              description: data.message || `Failed to import all ${total} POs`,
              variant: "destructive",
            });
          } else if (success < total) {
            // Partial success
            toast({
              title: "Partial Import Success",
              description: data.message || `Imported ${success} of ${total} POs. ${duplicates > 0 ? `${duplicates} duplicates found. ` : ''}${failed > 0 ? `${failed} failed.` : ''}`,
              variant: "default",
            });
          } else {
            // All successful
            toast({
              title: "Import Successful",
              description: data.message || `Successfully imported all ${success} POs`,
            });
          }
        } else {
          // Fallback to old logic if no summary
          toast({
            title: duplicateImports.length > 0 ? "Import Completed with Issues" : "PO import completed",
            description: `Successfully imported ${successfulImports.length} of ${data.results.length} POs${duplicateImports.length > 0 ? `. ${duplicateImports.length} duplicates found.` : ''}${failedImports.length > 0 ? `. ${failedImports.length} failed.` : ''}`,
            variant: successfulImports.length === 0 ? "destructive" : "default",
          });
        }
        
        // For multi-PO imports, just update the list instead of redirecting to edit
        if (successfulImports.length > 0) {
          console.log("✅ Multi-PO upload successful, updating PO list");
          // Invalidate and refetch queries immediately to ensure POs appear in list
          console.log("🔄 Aggressively refreshing all queries...");
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: [selectedPlatformData!.queryKey] }),
            queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
            queryClient.invalidateQueries({ queryKey: ["/api/order-items"] })
          ]);
          
          // Clear the cache completely and refetch
          await queryClient.refetchQueries({ queryKey: ["/api/pos"] });
          
          // Show additional success information
          setTimeout(() => {
            toast({
              title: "POs added to system",
              description: `${successfulImports.length} PO${successfulImports.length > 1 ? 's are' : ' is'} now available in your PO list.`,
              duration: 4000,
            });
          }, 1500);
        }
      } else {
        // Single PO response
        toast({
          title: "PO imported successfully",
          description: `PO ${data.po_number || data.po?.po_number || 'Unknown'} has been created`,
        });
        
        // Extract PO ID and redirect to edit if callback provided
        // Handle multiple response formats: direct ID, nested po.id, or other structures
        let poId = data.id || data.po?.id || data.poId || data.po_id;
        console.log("🔍 Extracted PO ID:", poId, "from data:", data);
        console.log("🔍 Data keys:", Object.keys(data));
        console.log("🔍 Data.po keys:", data.po ? Object.keys(data.po) : "no po object");
        
        // Instead of redirecting to edit (which has ID issues), just update the list
        console.log("✅ Upload successful, updating PO list");
        // Invalidate and refetch queries immediately to ensure PO appears in list
        console.log("🔄 Single PO: Aggressively refreshing all queries...");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [selectedPlatformData!.queryKey] }),
          queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
          queryClient.invalidateQueries({ queryKey: ["/api/order-items"] })
        ]);
        
        // Clear the cache completely and refetch
        await queryClient.refetchQueries({ queryKey: ["/api/pos"] });
        
        // Show additional success information
        setTimeout(() => {
          toast({
            title: "PO added to system",
            description: "The PO is now available in your PO list. You can edit it from the View POs tab.",
            duration: 4000,
          });
        }, 1500);
      }
      
      resetForm();
      // Invalidate both platform-specific and unified PO queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [selectedPlatformData!.queryKey] }),
        queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/order-items"] }),
        queryClient.refetchQueries({ queryKey: ["/api/pos"] })
      ]);
      onComplete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // NEW: Confirmation mutation for Blinkit PO database insertion
  const confirmMutation = useMutation({
    mutationFn: async (data: { po_header: any; po_lines: any[] }) => {
      const response = await fetch('/api/blinkit/confirm-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        // Check if it's a duplicate PO error
        if (response.status === 409 || error.type === 'duplicate_po') {
          throw new Error(error.message || `PO already exists in the database`);
        }

        throw new Error(error.message || error.error || 'Failed to insert data into database');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      console.log('✅ Database insertion successful:', data);

      toast({
        title: "PO Inserted Successfully!",
        description: `PO ${data.data.po_number} inserted into database with ${data.data.total_items} items`,
      });

      // Reset form and show completion
      resetForm();

      // Invalidate queries to refresh PO list
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/pos"] }),
        queryClient.invalidateQueries({ queryKey: ["blinkit"] })
      ]);

      onComplete?.();
    },
    onError: (error: Error) => {
      console.error('❌ Database insertion failed:', error);
      toast({
        title: "Database Insertion Failed",
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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf"
    ];

    const isValidFile =
      validTypes.includes(selectedFile.type) ||
      selectedFile.name.endsWith(".csv") ||
      selectedFile.name.endsWith(".xls") ||
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".pdf");

    if (isValidFile) {
      setFile(selectedFile);
      setParsedData(null);

      // If it's a PDF file for Blinkit, handle it specially
      if (selectedFile.name.endsWith(".pdf") && selectedPlatform === "blinkit") {
        console.log('🔍 PDF file detected, calling handleBlinkitPDFParse');
        handleBlinkitPDFParse(selectedFile);
      }
    } else {
      toast({
        title: "Invalid file type",
        description: selectedPlatform === "blinkit"
          ? "Please upload a CSV, Excel, or PDF file"
          : "Please upload a CSV or Excel file",
        variant: "destructive",
      });
    }
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setCurrentStep("upload");
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

    // If it's a PDF file for Blinkit, we already parsed it locally
    if (file.name.endsWith('.pdf') && selectedPlatform === 'blinkit' && parsedData) {
      setCurrentStep("preview");
      return;
    }

    // Otherwise, use the regular preview mutation for CSV/Excel files
    previewMutation.mutate(file);
  };

  const handleImport = () => {
    if (!parsedData) return;

    console.log('🔍 Importing data structure:', JSON.stringify(parsedData, null, 2));
    console.log('🔍 Platform:', selectedPlatform);

    // Special handling for Zepto POs - use dedicated Zepto endpoint
    if (selectedPlatform === 'zepto') {
      console.log('🔍 Using Zepto-specific import endpoint');

      // Handle multiple POs
      if (parsedData.poList && Array.isArray(parsedData.poList)) {
        console.log('🔍 Importing multiple Zepto POs:', parsedData.poList.length);

        // Import each PO individually
        const importPromises = parsedData.poList.map(async (po: any) => {
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
            throw new Error(`Failed to import PO ${po.header?.po_number}: ${error.message || error.error}`);
          }

          return response.json();
        });

        Promise.all(importPromises).then((results) => {
          toast({
            title: "All Zepto POs Imported Successfully!",
            description: `${parsedData.poList.length} POs imported to database`,
          });
          resetForm();
          queryClient.invalidateQueries({ queryKey: ["/api/pos"] });
          onComplete?.();
        }).catch((error) => {
          toast({
            title: "Import failed",
            description: error.message,
            variant: "destructive",
          });
        });

        return;
      }

      // Handle single PO
      if (parsedData.header && parsedData.lines) {
        const response = fetch('/api/zepto/confirm-insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            po_header: parsedData.header,
            po_lines: parsedData.lines
          }),
        }).then(async (response) => {
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || "Failed to import Zepto PO");
          }
          return response.json();
        }).then((data) => {
          toast({
            title: "Zepto PO Imported Successfully!",
            description: `PO ${parsedData.header?.po_number} imported to database with ${parsedData.lines?.length || 0} items`,
          });
          resetForm();
          queryClient.invalidateQueries({ queryKey: ["/api/pos"] });
          onComplete?.();
        }).catch((error) => {
          toast({
            title: "Import failed",
            description: error.message,
            variant: "destructive",
          });
        });

        return;
      }
    }

    // Regular import for other platforms
    const dataToImport = {
      header: parsedData.header,
      lines: parsedData.lines,
      poList: parsedData.poList,
      vendor: selectedPlatform // Add the required vendor field
    };

    console.log('🔍 Final import data:', JSON.stringify(dataToImport, null, 2));
    console.log('🔍 Header fields count:', parsedData.header ? Object.keys(parsedData.header).length : 0);
    console.log('🔍 Lines count:', parsedData.lines ? parsedData.lines.length : 0);

    importMutation.mutate(dataToImport);
  };

  const handleAutoPopulatedData = (data: any, source: string) => {
    // Handle the auto-populated data - set it as parsedData and move to preview
    console.log('✅ Auto-populated data received:', { data, source });

    // Transform the data to match expected format if needed
    const transformedData = {
      header: data,
      lines: Array.isArray(data) ? data : [data],
      source: source,
      autoPopulated: true
    };

    setParsedData(transformedData);
    setCurrentStep("preview");

    toast({
      title: "Data Auto-Populated",
      description: `Successfully loaded data from ${source}`,
    });
  };

  const handleBlinkitPDFParse = async (pdfFile: File) => {
    try {
      console.log('🔍 Starting Blinkit PDF parse...');
      console.log('📄 PDF file details:', {
        name: pdfFile.name,
        size: pdfFile.size,
        type: pdfFile.type
      });
      setIsPDFFile(true);

      // Show processing toast for PDF to Excel conversion
      toast({
        title: "Converting PDF to Excel",
        description: "Converting PDF to Excel format and extracting data, please wait...",
      });

      // Use the preview mutation to send PDF to server for processing
      // The server will convert PDF to Excel format and extract structured data
      previewMutation.mutate(pdfFile);

    } catch (error) {
      console.error('Error parsing Blinkit PDF:', error);
      toast({
        title: "PDF to Excel Conversion Error",
        description: "Failed to convert PDF to Excel format. Please try again.",
        variant: "destructive",
      });
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case "platform":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Select Platform
              </CardTitle>
              <CardDescription>
                Choose the e-commerce platform for your purchase order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className="h-20 text-left justify-start p-4 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => handlePlatformSelect(platform.id)}
                  >
                    <div>
                      <div className="font-medium text-base">
                        {platform.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Upload {platform.name} PO files
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "upload":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload {selectedPlatformData?.name} PO File
              </CardTitle>
              <CardDescription>
                Upload CSV, Excel, or PDF files containing{" "}
                {selectedPlatformData?.name} purchase order data.
                {selectedPlatform === "blinkit" && " PDF files will be automatically converted to Excel format for processing."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-populate widget */}
              <AutoPopulateWidget
                uploadType="po"
                onDataPopulated={handleAutoPopulatedData}
                platforms={[selectedPlatformData?.name || selectedPlatform]}
                searchLabel={`Search Existing ${selectedPlatformData?.name} POs`}
                placeholder="Enter PO number, series, or item code..."
                className="mb-4"
              />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or upload new file</span>
                </div>
              </div>

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
                    {file
                      ? `File Selected${file.name.endsWith('.pdf') ? ' (PDF - will be converted to Excel)' : ''}`
                      : `Drop your ${selectedPlatformData?.name} ${selectedPlatform === 'blinkit' ? 'CSV/Excel/PDF' : 'CSV/Excel'} file here`}
                  </p>
                  <p className="text-sm text-gray-500">
                    or{" "}
                    <Label
                      htmlFor="file-upload"
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      browse to choose a file
                    </Label>
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedPlatform === "blinkit"
                      ? "Supports .csv, .xls, .xlsx, and .pdf files"
                      : "Supports .csv, .xls, and .xlsx files"
                    }
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept={selectedPlatform === "blinkit" ? ".csv,.xls,.xlsx,.pdf" : ".csv,.xls,.xlsx"}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{file.name}</p>
                        <p className="text-sm text-green-600">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handlePreview}
                      disabled={previewMutation.isPending}
                      className="flex-1"
                    >
                      {previewMutation.isPending ? "Processing..." : "Preview File"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("platform")}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "preview":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Preview & Import
              </CardTitle>
              <CardDescription>
                Review the parsed data before importing to database
                {(parsedData?.source === 'pdf_real_data_extracted' || parsedData?.source === 'excel_real_data_extracted') &&
                  <span className="block text-green-600 font-medium mt-1">
                    ✅ Real data extracted from {parsedData?.source === 'pdf_real_data_extracted' ? 'PDF' : 'Excel'} ready for database insertion
                  </span>
                }
                {parsedData?.source === 'pdf_to_excel' &&
                  <span className="block text-blue-600 font-medium mt-1">
                    ✅ Data extracted from PDF converted to Excel format
                  </span>
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parsedData && (
                <div className="space-y-6">
                  {/* Handle NEW Real Data Extraction from PDF or Excel */}
                  {(parsedData.source === 'pdf_real_data_extracted' || parsedData.source === 'excel_real_data_extracted') ? (
                    <div className="space-y-6">
                      {/* Header Information */}
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>PO #{parsedData.po_header?.po_number || 'Unknown'}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Real {parsedData.source === 'pdf_real_data_extracted' ? 'PDF' : 'Excel'} Data
                              </Badge>
                            </div>
                          </CardTitle>
                          <CardDescription>
                            Extracted real data from PDF - {parsedData.po_lines?.length || 0} items found
                          </CardDescription>
                        </CardHeader>
                        <CardContent>

                          {/* Complete Header Information */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h5 className="font-medium text-gray-800 mb-3">Complete Purchase Order Information</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                              {/* Order Details */}
                              <div className="space-y-2">
                                <h6 className="font-semibold text-gray-700 pb-2 border-b">Order Details</h6>
                                {renderField("PO Number", parsedData.po_header?.po_number)}
                                {renderField("PO Date", parsedData.po_header?.po_date)}
                                {renderField("PO Type", parsedData.po_header?.po_type)}
                                {renderField("Currency", parsedData.po_header?.currency)}
                                {renderField("Payment Terms", parsedData.po_header?.payment_terms)}
                                {renderField("Expiry Date", parsedData.po_header?.po_expiry_date)}
                                {renderField("Delivery Date", parsedData.po_header?.po_delivery_date)}
                              </div>

                              {/* Vendor Information */}
                              <div className="space-y-2">
                                <h6 className="font-semibold text-gray-700 pb-2 border-b">Vendor Information</h6>
                                {renderField("Company", parsedData.po_header?.vendor_name)}
                                {renderField("Vendor No", parsedData.po_header?.vendor_no)}
                                {renderField("Contact", parsedData.po_header?.vendor_contact_name)}
                                {renderField("Phone", parsedData.po_header?.vendor_contact_phone)}
                                {renderField("Email", parsedData.po_header?.vendor_contact_email)}
                                {renderField("GST", parsedData.po_header?.vendor_gst_no)}
                                {renderField("PAN", parsedData.po_header?.vendor_pan)}
                              </div>

                              {/* Buyer Information */}
                              <div className="space-y-2">
                                <h6 className="font-semibold text-gray-700 pb-2 border-b">Buyer Information</h6>
                                {renderField("Company", parsedData.po_header?.buyer_name)}
                                {renderField("Unit", parsedData.po_header?.buyer_unit)}
                                {renderField("Contact", parsedData.po_header?.buyer_contact_name)}
                                {renderField("Phone", parsedData.po_header?.buyer_contact_phone)}
                                {renderField("PAN", parsedData.po_header?.buyer_pan)}
                                {renderField("CIN", parsedData.po_header?.buyer_cin)}
                              </div>
                            </div>
                          </div>

                          {/* Summary Cards */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <span className="font-medium text-blue-800">Total Items</span>
                              <p className="text-lg font-bold text-blue-900">{parsedData.po_header?.total_items || parsedData.po_lines?.length || 0}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <span className="font-medium text-green-800">Total Quantity</span>
                              <p className="text-lg font-bold text-green-900">{parsedData.po_header?.total_quantity || 0}</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <span className="font-medium text-purple-800">Total Amount</span>
                              <p className="text-lg font-bold text-purple-900">{safeDisplay(parsedData.po_header?.total_amount, '₹0.00', 'currency')}</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <span className="font-medium text-orange-800">Net Amount</span>
                              <p className="text-sm font-medium text-orange-900">{safeDisplay(parsedData.po_header?.net_amount, '₹0.00', 'currency')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Line Items Table */}
                      {parsedData.po_lines && parsedData.po_lines.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Line Items ({parsedData.po_lines.filter((line: any) => {
                              // Filter out terms & conditions and non-product items
                              const itemCode = (line.item_code || '').toString().toLowerCase();
                              const description = (line.product_description || '').toString().toLowerCase();

                              return !itemCode.includes('terms') &&
                                     !itemCode.includes('condition') &&
                                     !itemCode.includes('total') &&
                                     !itemCode.includes('advise') &&
                                     !description.includes('terms') &&
                                     !description.includes('condition') &&
                                     !description.includes('total') &&
                                     itemCode.length <= 50;
                            }).length})</CardTitle>
                            <CardDescription>
                              Product line items only (terms & conditions excluded)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left p-2 font-medium min-w-[80px]">Item Code</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">HSN Code</th>
                                    <th className="text-left p-2 font-medium min-w-[120px]">Product UPC</th>
                                    <th className="text-left p-2 font-medium min-w-[200px]">Description</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">Basic Cost</th>
                                    <th className="text-left p-2 font-medium min-w-[80px]">IGST %</th>
                                    <th className="text-left p-2 font-medium min-w-[80px]">CESS %</th>
                                    <th className="text-left p-2 font-medium min-w-[80px]">ADDT CESS</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">Tax Amount</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">Landing Rate</th>
                                    <th className="text-left p-2 font-medium min-w-[80px]">Quantity</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">MRP</th>
                                    <th className="text-left p-2 font-medium min-w-[80px]">Margin %</th>
                                    <th className="text-left p-2 font-medium min-w-[120px]">Total Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsedData.po_lines
                                    .filter((line: any) => {
                                      // Filter out terms & conditions and non-product items
                                      const itemCode = (line.item_code || '').toString().toLowerCase();
                                      const description = (line.product_description || '').toString().toLowerCase();

                                      return !itemCode.includes('terms') &&
                                             !itemCode.includes('condition') &&
                                             !itemCode.includes('total') &&
                                             !itemCode.includes('advise') &&
                                             !description.includes('terms') &&
                                             !description.includes('condition') &&
                                             !description.includes('total') &&
                                             itemCode.length <= 50;
                                    })
                                    .map((line: any, index: number) => (
                                    <tr key={index} className="border-t hover:bg-gray-50">
                                      <td className="p-2 font-medium text-blue-600">{line.item_code || ''}</td>
                                      <td className="p-2">{line.hsn_code || ''}</td>
                                      <td className="p-2 text-sm">{line.product_upc || ''}</td>
                                      <td className="p-2 text-sm">{line.product_description || ''}</td>
                                      <td className="p-2">{safeDisplay(line.basic_cost_price, '₹0.00', 'currency')}</td>
                                      <td className="p-2">{safeDisplay(line.igst_percent, '0%', 'percent')}</td>
                                      <td className="p-2">{line.cess_percent || '0'}%</td>
                                      <td className="p-2">{line.addt_cess || '0'}</td>
                                      <td className="p-2">₹{line.tax_amount || '0'}</td>
                                      <td className="p-2 font-medium">₹{line.landing_rate || '0'}</td>
                                      <td className="p-2 text-center font-medium">{line.quantity || 0}</td>
                                      <td className="p-2">{safeDisplay(line.mrp, '₹0.00', 'currency')}</td>
                                      <td className="p-2">{line.margin_percent || '0'}%</td>
                                      <td className="p-2 font-bold text-green-600">{safeDisplay(line.total_amount, '₹0.00', 'currency')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Import to Database Button */}
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button
                          onClick={() => {
                            // Use the Blinkit confirm-insert endpoint directly
                            confirmMutation.mutate({
                              po_header: parsedData.po_header,
                              po_lines: parsedData.po_lines
                            });
                          }}
                          disabled={confirmMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {confirmMutation.isPending ? "Importing to Database..." : "Import to Database"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep("upload")}
                          disabled={confirmMutation.isPending}
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  ) : parsedData.poList && Array.isArray(parsedData.poList) ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Multiple POs Found</h3>
                        <Badge variant="secondary">
                          {parsedData.poList.length} POs detected
                        </Badge>
                      </div>
                      

                      {parsedData.poList.map((po: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                PO #{po.header?.po_number || `Unknown ${index + 1}`}
                              </CardTitle>
                              <Badge variant="outline">
                                {po.lines?.length || 0} items
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Detailed Header Information */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h5 className="font-medium text-gray-800 mb-3">Complete Order Information</h5>
                                {selectedPlatformData?.id === 'zepto' ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                      <h6 className="font-semibold text-gray-700">Order Details</h6>
                                      <div><span className="font-medium">PO Number:</span> {po.header?.po_number || '-'}</div>
                                      <div><span className="font-medium">PO Date:</span> {po.header?.po_date || '-'}</div>
                                      <div><span className="font-medium">Status:</span> {po.header?.status || '-'}</div>
                                      <div><span className="font-medium">PO Amount:</span> {po.header?.po_amount || po.header?.total_amount || '-'}</div>
                                      <div><span className="font-medium">Delivery Location:</span> {po.header?.delivery_location || '-'}</div>
                                      <div><span className="font-medium">PO Expiry Date:</span> {po.header?.po_expiry_date || '-'}</div>
                                    </div>

                                    <div className="space-y-2">
                                      <h6 className="font-semibold text-gray-700">Vendor Information</h6>
                                      <div><span className="font-medium">Vendor Code:</span> {po.header?.vendor_code || '-'}</div>
                                      <div><span className="font-medium">Vendor Name:</span> {po.header?.vendor_name || '-'}</div>
                                      <div><span className="font-medium">Created By:</span> {po.header?.created_by || '-'}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div className="space-y-2">
                                      <h6 className="font-semibold text-gray-700">Order Details</h6>
                                      <div><span className="font-medium">PO Number:</span> {po.header?.po_number || 'N/A'}</div>
                                      <div><span className="font-medium">Order Date:</span> {po.header?.po_date ? new Date(po.header.po_date).toLocaleDateString() : 'Date not specified'}</div>
                                      <div><span className="font-medium">Delivery Date:</span> {po.header?.po_delivery_date ? new Date(po.header.po_delivery_date).toLocaleDateString() : po.header?.expected_delivery_date ? new Date(po.header.expected_delivery_date).toLocaleDateString() : 'Date not specified'}</div>
                                      <div><span className="font-medium">Expiry Date:</span> {po.header?.po_expiry_date ? new Date(po.header.po_expiry_date).toLocaleDateString() : 'Date not specified'}</div>
                                      <div><span className="font-medium">Payment Terms:</span> {po.header?.payment_terms || 'Terms via platform'}</div>
                                      <div><span className="font-medium">Currency:</span> {po.header?.currency || 'INR'}</div>
                                    </div>

                                    <div className="space-y-2">
                                      <h6 className="font-semibold text-gray-700">Vendor Information</h6>
                                      <div><span className="font-medium">Company:</span> {po.header?.vendor_name || 'Vendor details via platform'}</div>
                                      <div><span className="font-medium">Contact:</span> {po.header?.vendor_contact_name || 'Contact via platform'}</div>
                                      <div><span className="font-medium">Phone:</span> {po.header?.vendor_contact_phone || 'Contact via platform'}</div>
                                      <div><span className="font-medium">Email:</span> {po.header?.vendor_contact_email || 'Contact via platform'}</div>
                                      <div><span className="font-medium">GST:</span> {po.header?.vendor_gst_no || 'GST info via platform'}</div>
                                      <div><span className="font-medium">PAN:</span> {po.header?.vendor_pan || 'PAN info via platform'}</div>
                                    </div>

                                    <div className="space-y-2">
                                      <h6 className="font-semibold text-gray-700">Buyer Information</h6>
                                      <div><span className="font-medium">Company:</span> {po.header?.buyer_name || 'Buyer details via platform'}</div>
                                      <div><span className="font-medium">Contact:</span> {po.header?.buyer_contact_name || 'Contact via platform'}</div>
                                      <div><span className="font-medium">Phone:</span> {po.header?.buyer_contact_phone || 'Contact via platform'}</div>
                                      <div><span className="font-medium">GST:</span> {po.header?.delivered_to_gst_no || 'GST info via platform'}</div>
                                      <div><span className="font-medium">PAN:</span> {po.header?.buyer_pan || 'PAN info via platform'}</div>
                                      <div><span className="font-medium">Address:</span> {po.header?.delivered_to_address || 'Address via platform'}</div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Summary Grid */}
                              <div className={`grid gap-4 text-sm ${selectedPlatformData?.id === 'zepto' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <span className="font-medium text-blue-800">Total Items</span>
                                  <p className="text-lg font-bold text-blue-900">{po.lines?.length || 0}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <span className="font-medium text-green-800">Total Quantity</span>
                                  <p className="text-lg font-bold text-green-900">{po.totalQuantity || po.header?.total_quantity || 0}</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <span className="font-medium text-purple-800">Total Amount</span>
                                  <p className="text-lg font-bold text-purple-900">{safeDisplay(po.totalAmount || po.header?.total_amount, '₹0.00', 'currency')}</p>
                                </div>
                                {selectedPlatformData?.id !== 'zepto' && (
                                  <div className="bg-orange-50 p-3 rounded-lg">
                                    <span className="font-medium text-orange-800">Total Weight</span>
                                    <p className="text-sm font-medium text-orange-900">{safeDisplay(po.header?.total_weight, 'Not available', 'weight')}</p>
                                  </div>
                                )}
                              </div>

                              {/* Line Items Table - Enhanced for PDF data */}
                              {po.lines && po.lines.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-gray-700 mb-2">Complete Line Items Data</h5>
                                  <div className="overflow-x-auto border rounded-lg max-w-full">
                                    <table className="min-w-full text-xs whitespace-nowrap">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          {selectedPlatformData?.id === 'zepto' ? (
                                            <>
                                              <th className="text-left p-2 font-medium min-w-[100px]">PO No</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">SKU</th>
                                              <th className="text-left p-2 font-medium min-w-[250px]">SKU Desc</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">Brand</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">EAN</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">HSN</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">MRP</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">Qty</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">Unit Base Cost</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">Landing Cost</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">Total Amount</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">CGST %</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">SGST %</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">IGST %</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">CESS %</th>
                                            </>
                                          ) : (
                                            <>
                                              <th className="text-left p-2 font-medium min-w-[80px]">Line #</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">Item Code</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">HSN Code</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">Product UPC</th>
                                              <th className="text-left p-2 font-medium min-w-[200px]">Product Description</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">UOM</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">Basic Cost</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">IGST %</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">CESS %</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">ADDT CESS</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">Tax Amount</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">Landing Rate</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">Quantity</th>
                                              <th className="text-left p-2 font-medium min-w-[100px]">MRP</th>
                                              <th className="text-left p-2 font-medium min-w-[80px]">Margin %</th>
                                              <th className="text-left p-2 font-medium min-w-[120px]">Total Amount</th>
                                            </>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {po.lines.map((line: any, lineIndex: number) => (
                                          <tr key={lineIndex} className="border-t hover:bg-gray-50">
                                            {selectedPlatformData?.id === 'zepto' ? (
                                              <>
                                                <td className="p-2 min-w-[100px]">{line.po_number || line.po_number_display || '-'}</td>
                                                <td className="p-2 min-w-[120px] font-mono text-xs" title={line.sku}>
                                                  {line.sku ? `${line.sku.substring(0, 12)}...` : '-'}
                                                </td>
                                                <td className="p-2 min-w-[250px]" title={line.sku_desc}>
                                                  <div className="max-w-[250px] truncate">
                                                    {line.sku_desc || '-'}
                                                  </div>
                                                </td>
                                                <td className="p-2 min-w-[100px]">{line.brand || '-'}</td>
                                                <td className="p-2 min-w-[120px] font-mono text-xs">{line.ean_no || '-'}</td>
                                                <td className="p-2 min-w-[100px]">{line.hsn_code || '-'}</td>
                                                <td className="p-2 min-w-[100px] text-right">{line.mrp && Number(line.mrp) > 0 ? `₹${Number(line.mrp).toFixed(2)}` : '-'}</td>
                                                <td className="p-2 min-w-[80px] text-center">{line.po_qty || '-'}</td>
                                                <td className="p-2 min-w-[120px] text-right">{line.cost_price && Number(line.cost_price) > 0 ? `₹${Number(line.cost_price).toFixed(2)}` : '-'}</td>
                                                <td className="p-2 min-w-[120px] text-right">{line.landing_cost && Number(line.landing_cost) > 0 ? `₹${Number(line.landing_cost).toFixed(2)}` : '-'}</td>
                                                <td className="p-2 min-w-[120px] text-right font-medium">{line.total_value && Number(line.total_value) > 0 ? `₹${Number(line.total_value).toFixed(2)}` : '-'}</td>
                                                <td className="p-2 min-w-[80px] text-center">{line.cgst && Number(line.cgst) > 0 ? `${Number(line.cgst).toFixed(0)}%` : '0%'}</td>
                                                <td className="p-2 min-w-[80px] text-center">{line.sgst && Number(line.sgst) > 0 ? `${Number(line.sgst).toFixed(0)}%` : '0%'}</td>
                                                <td className="p-2 min-w-[80px] text-center">{line.igst && Number(line.igst) > 0 ? `${Number(line.igst).toFixed(0)}%` : '0%'}</td>
                                                <td className="p-2 min-w-[80px] text-center">{line.cess && Number(line.cess) > 0 ? `${Number(line.cess).toFixed(0)}%` : '0%'}</td>
                                              </>
                                            ) : (
                                              <>
                                                <td className="p-2 font-medium">{line.line_number || lineIndex + 1}</td>
                                                <td className="p-2 font-medium text-blue-600">{line.item_code || 'SKU-N/A'}</td>
                                                <td className="p-2">{line.hsn_code || line.category_id || 'HSN via system'}</td>
                                                <td className="p-2 text-sm">{line.product_upc || line.item_code || 'UPC via system'}</td>
                                                <td className="p-2 text-sm">{line.product_description || line.item_description || 'Description via system'}</td>
                                                <td className="p-2">{line.grammage || 'Unit'}</td>
                                                <td className="p-2">{safeDisplay(line.basic_cost_price, '₹0.00', 'currency')}</td>
                                                <td className="p-2">{safeDisplay(line.igst_percent, '0%', 'percent')}</td>
                                                <td className="p-2">{line.cess_percent || '0'}%</td>
                                                <td className="p-2">{line.addt_cess || '0'}</td>
                                                <td className="p-2">₹{line.tax_amount || '0'}</td>
                                                <td className="p-2 font-medium">₹{line.landing_rate || '0'}</td>
                                                <td className="p-2 text-center font-medium">{line.quantity || 0}</td>
                                                <td className="p-2">{safeDisplay(line.mrp, '₹0.00', 'currency')}</td>
                                                <td className="p-2">{line.margin_percent || '0'}%</td>
                                                <td className="p-2 font-bold text-green-600">{safeDisplay(line.total_amount, '₹0.00', 'currency')}</td>
                                              </>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>

                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    /* Handle Single PO Display */
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">PO Details</h3>
                      
                      {/* Complete Header Information */}
                      {parsedData.header && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Complete Purchase Order Information</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                {/* Order Details Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Order Details</h6>
                                  <div><span className="font-medium text-gray-600">PO Number:</span> <span className="ml-2">{parsedData.header.po_number || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Order Date:</span> <span className="ml-2">{parsedData.header.po_date || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Delivery Date:</span> <span className="ml-2">{parsedData.header.po_delivery_date || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Expiry Date:</span> <span className="ml-2">{parsedData.header.po_expiry_date || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Payment Terms:</span> <span className="ml-2">{parsedData.header.payment_terms || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Currency:</span> <span className="ml-2">{parsedData.header.currency || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Status:</span> <span className="ml-2">{parsedData.header.status || 'Not available'}</span></div>
                                </div>

                                {/* Vendor Information Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Vendor Information</h6>
                                  <div><span className="font-medium text-gray-600">Company:</span> <span className="ml-2">{parsedData.header.vendor_name || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Contact:</span> <span className="ml-2">{parsedData.header.vendor_contact_name || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Phone:</span> <span className="ml-2">{parsedData.header.vendor_contact_phone || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Email:</span> <span className="ml-2">{parsedData.header.vendor_contact_email || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.vendor_gst_no || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">PAN Number:</span> <span className="ml-2">{parsedData.header.vendor_pan || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2">{parsedData.header.vendor_registered_address || 'Not available'}</span></div>
                                </div>

                                {/* Buyer Information Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Buyer Information</h6>
                                  <div><span className="font-medium text-gray-600">Company:</span> <span className="ml-2">{parsedData.header.buyer_name || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Contact:</span> <span className="ml-2">{parsedData.header.buyer_contact || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Phone:</span> <span className="ml-2">{parsedData.header.buyer_phone || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.buyer_gst || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">PAN Number:</span> <span className="ml-2">{parsedData.header.buyer_pan || 'Not available'}</span></div>
                                  <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2">{parsedData.header.buyer_address || 'Not available'}</span></div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {parsedData.totalItems || parsedData.lines?.length || 0}
                          </div>
                          <div className="text-sm text-blue-600">Total Items</div>
                        </div>
                        {parsedData.totalQuantity && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {parsedData.totalQuantity}
                            </div>
                            <div className="text-sm text-green-600">Total Quantity</div>
                          </div>
                        )}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {safeDisplay(parsedData.totalAmount || parsedData.header?.grand_total, '₹0.00', 'currency')}
                          </div>
                          <div className="text-sm text-purple-600">Total Amount</div>
                        </div>
                      </div>

                      {/* Complete Line Items Preview */}
                      {parsedData.lines && parsedData.lines.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Complete Line Items Data</CardTitle>
                            <CardDescription>
                              Showing {parsedData.lines.filter((line: any) => {
                                const itemCode = (line.item_code || '').toString().toLowerCase();
                                const description = (line.product_description || '').toString().toLowerCase();
                                return !itemCode.includes('terms') &&
                                       !itemCode.includes('condition') &&
                                       !itemCode.includes('total') &&
                                       !itemCode.includes('advise') &&
                                       !description.includes('terms') &&
                                       !description.includes('condition') &&
                                       !description.includes('total') &&
                                       itemCode.length <= 50;
                              }).length} product items (terms & conditions excluded)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                  <tr className="border-b">
                                    {/* Check if this is Blinkit PDF data */}
                                    {parsedData.source === 'pdf' || selectedPlatformData?.id === 'blinkit' ? (
                                      <>
                                        <th className="text-left p-2 font-medium min-w-[60px]">Line #</th>
                                        <th className="text-left p-2 font-medium min-w-[100px]">Item Code</th>
                                        <th className="text-left p-2 font-medium min-w-[100px]">HSN Code</th>
                                        <th className="text-left p-2 font-medium min-w-[120px]">Product UPC</th>
                                        <th className="text-left p-2 font-medium min-w-[200px]">Product Description</th>
                                        <th className="text-left p-2 font-medium min-w-[80px]">UOM</th>
                                        <th className="text-left p-2 font-medium min-w-[100px]">Basic Cost</th>
                                        <th className="text-left p-2 font-medium min-w-[80px]">IGST %</th>
                                        <th className="text-left p-2 font-medium min-w-[80px]">CESS %</th>
                                        <th className="text-left p-2 font-medium min-w-[80px]">ADDT CESS</th>
                                        <th className="text-left p-2 font-medium min-w-[100px]">Tax Amount</th>
                                        <th className="text-left p-2 font-medium min-w-[100px]">Landing Rate</th>
                                        <th className="text-left p-2 font-medium min-w-[80px]">Quantity</th>
                                        <th className="text-left p-2 font-medium min-w-[100px]">MRP</th>
                                        <th className="text-left p-2 font-medium min-w-[80px]">Margin %</th>
                                        <th className="text-left p-2 font-medium min-w-[120px]">Total Amount</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'zepto' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">PO No</th>
                                        <th className="text-left p-2 font-medium">SKU</th>
                                        <th className="text-left p-2 font-medium">SKU Desc</th>
                                        <th className="text-left p-2 font-medium">Brand</th>
                                        <th className="text-left p-2 font-medium">EAN</th>
                                        <th className="text-left p-2 font-medium">HSN</th>
                                        <th className="text-left p-2 font-medium">MRP</th>
                                        <th className="text-left p-2 font-medium">Qty</th>
                                        <th className="text-left p-2 font-medium">Unit Base Cost</th>
                                        <th className="text-left p-2 font-medium">Landing Cost</th>
                                        <th className="text-left p-2 font-medium">Total Amount</th>
                                        <th className="text-left p-2 font-medium">CGST %</th>
                                        <th className="text-left p-2 font-medium">SGST %</th>
                                        <th className="text-left p-2 font-medium">IGST %</th>
                                        <th className="text-left p-2 font-medium">CESS %</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'citymall' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">Item</th>
                                        <th className="text-left p-2 font-medium">Code</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">Price</th>
                                        <th className="text-left p-2 font-medium">Total</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'flipkart' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">Title</th>
                                        <th className="text-left p-2 font-medium">FSN/ISBN</th>
                                        <th className="text-left p-2 font-medium">Brand</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">Supplier Price</th>
                                        <th className="text-left p-2 font-medium">Total</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'swiggy' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">Item Description</th>
                                        <th className="text-left p-2 font-medium">Item Code</th>
                                        <th className="text-left p-2 font-medium">HSN Code</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">MRP</th>
                                        <th className="text-left p-2 font-medium">Line Total</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'bigbasket' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">Description</th>
                                        <th className="text-left p-2 font-medium">SKU Code</th>
                                        <th className="text-left p-2 font-medium">HSN Code</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">MRP</th>
                                        <th className="text-left p-2 font-medium">Total Value</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'zomato' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">Product Name</th>
                                        <th className="text-left p-2 font-medium">Product Number</th>
                                        <th className="text-left p-2 font-medium">HSN Code</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">Price Per Unit</th>
                                        <th className="text-left p-2 font-medium">UoM</th>
                                        <th className="text-left p-2 font-medium">GST Rate</th>
                                        <th className="text-left p-2 font-medium">Line Total</th>
                                      </>
                                    ) : selectedPlatformData?.id === 'dealshare' ? (
                                      <>
                                        <th className="text-left p-2 font-medium">SKU</th>
                                        <th className="text-left p-2 font-medium">Product Name</th>
                                        <th className="text-left p-2 font-medium">HSN Code</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">MRP</th>
                                        <th className="text-left p-2 font-medium">Buying Price</th>
                                        <th className="text-left p-2 font-medium">GST %</th>
                                        <th className="text-left p-2 font-medium">Gross Amount</th>
                                      </>
                                    ) : (
                                      <>
                                        <th className="text-left p-2 font-medium">Item</th>
                                        <th className="text-left p-2 font-medium">Code</th>
                                        <th className="text-left p-2 font-medium">Quantity</th>
                                        <th className="text-left p-2 font-medium">Price</th>
                                        <th className="text-left p-2 font-medium">Total</th>
                                      </>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsedData.lines
                                    .filter((line: any) => {
                                      // Filter out terms & conditions and non-product items
                                      const itemCode = (line.item_code || '').toString().toLowerCase();
                                      const description = (line.product_description || '').toString().toLowerCase();

                                      return !itemCode.includes('terms') &&
                                             !itemCode.includes('condition') &&
                                             !itemCode.includes('total') &&
                                             !itemCode.includes('advise') &&
                                             !description.includes('terms') &&
                                             !description.includes('condition') &&
                                             !description.includes('total') &&
                                             itemCode.length <= 50;
                                    })
                                    .map((line: any, index: number) => (
                                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                                      {/* Blinkit PDF data */}
                                      {parsedData.source === 'pdf' || selectedPlatformData?.id === 'blinkit' ? (
                                        <>
                                          <td className="p-2 font-medium">{line.line_number || index + 1}</td>
                                          <td className="p-2 font-medium text-blue-600">{line.item_code || 'Not available'}</td>
                                          <td className="p-2">{line.hsn_code || 'Not available'}</td>
                                          <td className="p-2 text-sm">{line.product_upc || 'Not available'}</td>
                                          <td className="p-2 text-sm">{line.product_description || 'Not available'}</td>
                                          <td className="p-2">{line.grammage || 'Not available'}</td>
                                          <td className="p-2">{safeDisplay(line.basic_cost_price, '₹0.00', 'currency')}</td>
                                          <td className="p-2">{safeDisplay(line.igst_percent, '0%', 'percent')}</td>
                                          <td className="p-2">{line.cess_percent || '0'}%</td>
                                          <td className="p-2">{line.addt_cess || '0'}</td>
                                          <td className="p-2">₹{line.tax_amount || '0'}</td>
                                          <td className="p-2 font-medium">₹{line.landing_rate || '0'}</td>
                                          <td className="p-2 text-center font-medium">{line.quantity || 0}</td>
                                          <td className="p-2">{safeDisplay(line.mrp, '₹0.00', 'currency')}</td>
                                          <td className="p-2">{line.margin_percent || '0'}%</td>
                                          <td className="p-2 font-bold text-green-600">{safeDisplay(line.total_amount, '₹0.00', 'currency')}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'zepto' ? (
                                        <>
                                          <td className="p-2">{line.po_number || line.po_number_display || '-'}</td>
                                          <td className="p-2 font-mono text-xs" title={line.sku}>
                                            {line.sku ? `${line.sku.substring(0, 8)}...` : '-'}
                                          </td>
                                          <td className="p-2 max-w-[200px] truncate" title={line.sku_desc}>
                                            {line.sku_desc || '-'}
                                          </td>
                                          <td className="p-2">{line.brand || '-'}</td>
                                          <td className="p-2 font-mono text-xs">{line.ean_no || '-'}</td>
                                          <td className="p-2">{line.hsn_code || '-'}</td>
                                          <td className="p-2">{line.mrp && Number(line.mrp) > 0 ? `₹${Number(line.mrp).toFixed(2)}` : '-'}</td>
                                          <td className="p-2 text-center">{line.po_qty || '-'}</td>
                                          <td className="p-2">{line.cost_price && Number(line.cost_price) > 0 ? `₹${Number(line.cost_price).toFixed(2)}` : '-'}</td>
                                          <td className="p-2">{line.landing_cost && Number(line.landing_cost) > 0 ? `₹${Number(line.landing_cost).toFixed(2)}` : '-'}</td>
                                          <td className="p-2 font-medium">{line.total_value && Number(line.total_value) > 0 ? `₹${Number(line.total_value).toFixed(2)}` : '-'}</td>
                                          <td className="p-2">{line.cgst && Number(line.cgst) > 0 ? `${Number(line.cgst).toFixed(0)}%` : '0%'}</td>
                                          <td className="p-2">{line.sgst && Number(line.sgst) > 0 ? `${Number(line.sgst).toFixed(0)}%` : '0%'}</td>
                                          <td className="p-2">{line.igst && Number(line.igst) > 0 ? `${Number(line.igst).toFixed(0)}%` : '0%'}</td>
                                          <td className="p-2">{line.cess && Number(line.cess) > 0 ? `${Number(line.cess).toFixed(0)}%` : '0%'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'citymall' ? (
                                        <>
                                          <td className="p-2">{line.article_name || 'Not available'}</td>
                                          <td className="p-2">{line.article_id || 'Not available'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.base_cost_price || '0.00'}</td>
                                          <td className="p-2">₹{line.total_amount || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'flipkart' ? (
                                        <>
                                          <td className="p-2">{line.title || 'Not available'}</td>
                                          <td className="p-2">{line.fsn_isbn || 'Not available'}</td>
                                          <td className="p-2">{line.brand || 'Not available'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.supplier_price || '0.00'}</td>
                                          <td className="p-2">₹{line.total_amount || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'swiggy' ? (
                                        <>
                                          <td className="p-2">{line.item_description || 'Not available'}</td>
                                          <td className="p-2">{line.item_code || 'Not available'}</td>
                                          <td className="p-2">{line.hsn_code || 'Not available'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp || '0.00'}</td>
                                          <td className="p-2">₹{line.line_total || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'bigbasket' ? (
                                        <>
                                          <td className="p-2">{line.description || 'Not available'}</td>
                                          <td className="p-2">{line.sku_code || 'Not available'}</td>
                                          <td className="p-2">{line.hsn_code || 'Not available'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp || '0.00'}</td>
                                          <td className="p-2">₹{line.total_value || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'zomato' ? (
                                        <>
                                          <td className="p-2">{line.product_name || 'Not available'}</td>
                                          <td className="p-2">{line.product_number || 'Not available'}</td>
                                          <td className="p-2">{line.hsn_code || 'Not available'}</td>
                                          <td className="p-2">{line.quantity_ordered || 0}</td>
                                          <td className="p-2">₹{line.price_per_unit || '0.00'}</td>
                                          <td className="p-2">{line.uom || 'Not available'}</td>
                                          <td className="p-2">{line.gst_rate || '0.00'}%</td>
                                          <td className="p-2">₹{line.line_total || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'dealshare' ? (
                                        <>
                                          <td className="p-2">{line.sku || 'Not available'}</td>
                                          <td className="p-2">{line.product_name || 'Not available'}</td>
                                          <td className="p-2">{line.hsn_code || 'Not available'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp_tax_inclusive || '0.00'}</td>
                                          <td className="p-2">₹{line.buying_price || '0.00'}</td>
                                          <td className="p-2">{line.gst_percent || '0.00'}%</td>
                                          <td className="p-2">₹{line.gross_amount || '0.00'}</td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="p-2">{line.item_name || line.sku || 'Not available'}</td>
                                          <td className="p-2">{line.item_code || line.sku || 'Not available'}</td>
                                          <td className="p-2">{line.quantity || line.po_qty || 0}</td>
                                          <td className="p-2">₹{line.cost_price || line.mrp || '0.00'}</td>
                                          <td className="p-2">₹{line.total_value || line.total_amount || '0.00'}</td>
                                        </>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                            </div>
                          </CardContent>
                        </Card>
                      )}

                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center gap-2 ${currentStep === "platform" ? "text-blue-600" : currentStep === "upload" || currentStep === "preview" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === "platform" ? "bg-blue-100 text-blue-600" : currentStep === "upload" || currentStep === "preview" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                1
              </div>
              <span className="font-medium">Select Platform</span>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div
              className={`flex items-center gap-2 ${currentStep === "upload" ? "text-blue-600" : currentStep === "preview" ? "text-green-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === "upload" ? "bg-blue-100 text-blue-600" : currentStep === "preview" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                2
              </div>
              <span className="font-medium">Upload File</span>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400" />

            <div
              className={`flex items-center gap-2 ${currentStep === "preview" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === "preview" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
              >
                3
              </div>
              <span className="font-medium">Preview & Import</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Import Data into Database Button - Bottom of page for Zepto POs */}
      {currentStep === 'preview' && selectedPlatformData?.id === 'zepto' && parsedData && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  // Import single PO or multiple POs to database
                  if (parsedData.poList && parsedData.poList.length > 0) {
                    // Multiple POs - import all
                    parsedData.poList.forEach((po: any) => {
                      if (po.header && po.lines) {
                        const importData = {
                          header: po.header,
                          lines: po.lines
                        };
                        handleZeptoImport(importData);
                      }
                    });
                  } else if (parsedData.header && parsedData.lines) {
                    // Single PO
                    const importData = {
                      header: parsedData.header,
                      lines: parsedData.lines
                    };
                    handleZeptoImport(importData);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <Database className="h-5 w-5 mr-2" />
                Import Data into Database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Data into Database Button - Bottom of page for Swiggy POs */}
      {currentStep === 'preview' && selectedPlatformData?.id === 'swiggy' && parsedData && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  const uploadData = { poList: parsedData.poList };

                  fetch('/api/swiggy/confirm-insert', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(uploadData),
                  })
                  .then(response => response.json())
                  .then(data => {
                    toast({
                      title: "Import Successful",
                      description: `${parsedData.poList?.length || 1} Swiggy PO(s) imported to swiggy_po_header and swiggy_po_lines tables`,
                    });
                    queryClient.invalidateQueries({ queryKey: ["/api/pos"] });
                    resetForm();
                    onComplete?.();
                  })
                  .catch(error => {
                    toast({
                      title: "Import Failed",
                      description: error.message || 'Failed to import Swiggy POs',
                      variant: "destructive",
                    });
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <Database className="h-5 w-5 mr-2" />
                📥 Import All Swiggy Data into Database
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {parsedData.poList?.length ? (
                  <>
                    Total POs: <strong>{parsedData.poList.length}</strong> |
                    Total Items: <strong>{parsedData.poList.reduce((acc: number, po: any) => acc + (po.lines?.length || 0), 0)}</strong>
                  </>
                ) : (
                  "Ready to import Swiggy PO data"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}