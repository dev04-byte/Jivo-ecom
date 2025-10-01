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
import { BigBasketPODetailView } from "./bigbasket-po-detail-view";
import { AmazonPoDetailView } from "./amazon-po-detail-view";

// Safe number parsing to prevent NaN display issues
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || value === '' || value === 'NaN') return 0;
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

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
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "Upload Amazon PO files",
    endpoint: "/api/amazon-pos",
    queryKey: "/api/amazon-pos"
  }
];

interface UnifiedUploadComponentProps {
  onComplete?: () => void;
}

// Helper function to safely display data without N/A fallbacks
const safeDisplay = (value: any, defaultValue: string = '', type?: 'currency' | 'weight' | 'percent'): string => {
  // Handle null, undefined, empty string, 'N/A', 'Not available', or zero currency values
  if (value === null || value === undefined || value === '' ||
      value === 'N/A' || value === 'Not available' || value === 'Not Available' ||
      (value === '0' && type === 'currency') || (value === 0 && type === 'currency')) {
    return defaultValue;
  }

  const stringValue = String(value).trim();
  if (stringValue === '' || stringValue === 'N/A' ||
      stringValue === 'Not available' || stringValue === 'Not Available') {
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
    if (isNaN(numValue)) return defaultValue;

    // Format percentage with appropriate decimal places
    if (numValue === 0) return '0%';
    if (numValue % 1 === 0) return `${numValue}%`;
    return `${numValue.toFixed(2)}%`;
  }

  return stringValue;
};

// Helper function to calculate total tax amount from line item
const calculateTotalTax = (line: any) => {
  const quantity = parseFloat(line.quantity || line.po_qty || line.quantity_ordered || 0);
  const unitPrice = parseFloat(
    line.basic_cost_price || line.cost_price || line.supplier_price ||
    line.base_cost_price || line.buying_price || line.price_per_unit ||
    line.landing_cost || line.unit_base_cost || 0
  );
  const baseAmount = quantity * unitPrice;

  // If baseAmount is 0, no tax to calculate
  if (baseAmount === 0) {
    return {
      igstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      cessAmount: 0,
      totalTax: 0
    };
  }

  // Get tax percentages - handle string values that might have % already
  const cleanPercentage = (value: any) => {
    if (!value) return 0;
    const str = String(value).replace('%', '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const igst = cleanPercentage(line.igst_percent || line.igst_rate || line.igst);
  const cgst = cleanPercentage(line.cgst_percent || line.cgst_rate || line.cgst);
  const sgst = cleanPercentage(line.sgst_percent || line.sgst_rate || line.sgst);
  const cess = cleanPercentage(line.cess_percent || line.cess_rate || line.cess);

  // Calculate individual tax amounts
  const igstAmount = (baseAmount * igst) / 100;
  const cgstAmount = (baseAmount * cgst) / 100;
  const sgstAmount = (baseAmount * sgst) / 100;
  const cessAmount = (baseAmount * cess) / 100;

  // Total tax is sum of all taxes
  const totalTax = igstAmount + cgstAmount + sgstAmount + cessAmount;

  return {
    igstAmount: Math.round(igstAmount * 100) / 100,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    cessAmount: Math.round(cessAmount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100
  };
};

// Helper function to conditionally render fields (hide empty ones instead of showing "Not available")
const renderField = (label: string, value: any, className: string = '', defaultValue?: string) => {
  // Use safeDisplay to handle empty/null values
  const displayValue = safeDisplay(value, defaultValue || '');

  // Don't render if no meaningful value
  if (!displayValue) {
    return null;
  }

  return (
    <div className={className}>
      <span className="font-medium">{label}:</span> {displayValue}
    </div>
  );
};

export function UnifiedUploadComponent({ onComplete }: UnifiedUploadComponentProps) {
  // Add custom scrollbar styling
  const scrollbarStyles = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e0 #f1f5f9;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
    .custom-scrollbar::-webkit-scrollbar-corner {
      background: #f1f5f9;
    }
    .table-container {
      position: relative;
      overflow: auto;
    }
    .table-container::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 20px;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.8));
      pointer-events: none;
    }
  `;

  const [currentStep, setCurrentStep] = useState<Step>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPDFFile, setIsPDFFile] = useState(false);
  const [importedPOs, setImportedPOs] = useState<Array<{id: number, po_number: string, platform: string}>>([]);
  const [isImporting, setIsImporting] = useState(false);
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
          source: data.data.source, // Use the actual source from the data
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

      // Handle new Blinkit multi-PO response (MUST be before legacy fallback!)
      if (data.poList && data.totalPOs && (data.detectedVendor === 'blinkit' || data.source?.includes('blinkit') || data.source === 'blinkit_excel_multiple_pos' || selectedPlatform === 'blinkit')) {
        toast({
          title: "Blinkit POs Found",
          description: `Found ${data.totalPOs} Blinkit POs in the file`,
        });

        // Store the Blinkit multi-PO data
        setParsedData({
          success: true,
          poList: data.poList,
          detectedVendor: 'blinkit',
          totalPOs: data.totalPOs,
          totalItems: data.totalItems,
          totalAmount: data.totalAmount,
          multiPO: true,
          source: 'blinkit_multiple_pos'
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
        transformedData = {
          ...data,
          // Ensure platform info is preserved
          platform: data.platform,
          detectedVendor: data.detectedVendor
        };
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

  const handleImportData = () => {
    console.log('🚀 Starting database import from preview...');

    if (!parsedData) {
      toast({
        title: "No data to import",
        description: "Please parse the file first before importing",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPlatform) {
      toast({
        title: "Platform not selected",
        description: "Please select a platform before importing",
        variant: "destructive",
      });
      return;
    }

    // Validate data based on platform
    if (selectedPlatform === 'flipkart' && (!parsedData.header || !parsedData.lines || parsedData.lines.length === 0)) {
      toast({
        title: "Invalid data structure",
        description: "Flipkart data requires both header and line items",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Data validation passed, proceeding with import...');
    console.log('📊 Import data:', {
      platform: selectedPlatform,
      headerExists: !!parsedData.header,
      linesCount: parsedData.lines?.length || 0,
      totalAmount: parsedData.header?.total_gross_amount || parsedData.header?.total_amount || parsedData.totalAmount
    });

    // Use the existing handleImport function
    handleImport();
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
                            <div className="overflow-x-auto custom-scrollbar table-container">
                              <table className="w-full text-xs" style={{minWidth: '800px'}}>
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left p-2 font-medium min-w-[80px]">Item Code</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">HSN Code</th>
                                    <th className="text-left p-2 font-medium min-w-[120px]">Product UPC</th>
                                    <th className="text-left p-2 font-medium min-w-[200px]">Description</th>
                                    <th className="text-left p-2 font-medium min-w-[100px]">Basic Cost</th>
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
                                      <td className="p-2">{(() => {
                                        // For Blinkit data, show the exact tax_amount from tax_value column
                                        if (line.tax_amount) {
                                          const taxAmount = parseFloat(line.tax_amount || '0');
                                          return taxAmount.toFixed(0);
                                        }

                                        // Fallback for other platforms - show calculated tax amount
                                        const taxableValue = parseFloat(line.taxable_value || line.basic_value || '0');
                                        const totalAmount = parseFloat(line.total_amount || line.line_total || '0');
                                        const taxAmount = totalAmount - taxableValue;
                                        return taxAmount.toFixed(0);
                                      })()}</td>
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
                              {/* Essential PO Information Only */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div><span className="font-medium">PO Number:</span> {safeDisplay(po.header?.po_number, 'Not specified')}</div>
                                    <div><span className="font-medium">Order Date:</span> {po.header?.po_date ? new Date(po.header.po_date).toLocaleDateString() : 'Not specified'}</div>
                                    {po.header?.po_delivery_date && (
                                      <div><span className="font-medium">Delivery Date:</span> {new Date(po.header.po_delivery_date).toLocaleDateString()}</div>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    {po.header?.vendor_name && (
                                      <div><span className="font-medium">Vendor:</span> {po.header.vendor_name}</div>
                                    )}
                                    {po.header?.vendor_code && (
                                      <div><span className="font-medium">Vendor Code:</span> {po.header.vendor_code}</div>
                                    )}
                                  </div>
                                </div>
                              </div>


                              {/* Complete Line Items Table with All Data */}
                              {po.lines && po.lines.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-gray-700 mb-2">Complete Line Items Data</h5>
                                  <div className="overflow-x-auto overflow-y-auto border rounded-lg max-h-[60vh] bg-white shadow-sm custom-scrollbar table-container">
                                    <table className="w-full text-xs border-collapse" style={{minWidth: '1500px'}}>
                                      <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                                        <tr>
                                          <th className="text-left p-2 font-medium border-r min-w-[50px]">#</th>
                                          <th className="text-left p-2 font-medium border-r min-w-[120px]">Item Code</th>
                                          <th className="text-left p-2 font-medium border-r min-w-[200px]">Description</th>
                                          <th className="text-center p-2 font-medium border-r min-w-[60px]">Qty</th>
                                          <th className="text-left p-2 font-medium border-r min-w-[60px]">UOM</th>
                                          <th className="text-right p-2 font-medium border-r min-w-[100px]">Unit Price</th>
                                          <th className="text-right p-2 font-medium border-r min-w-[100px]">MRP</th>
                                          <th className="text-right p-2 font-medium border-r min-w-[100px]">Tax Amount</th>
                                          <th className="text-right p-2 font-medium min-w-[120px]">Total Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {po.lines.map((line: any, lineIndex: number) => (
                                          <tr key={lineIndex} className="border-b hover:bg-gray-50 text-xs">
                                            <td className="p-2 text-center border-r font-medium">{lineIndex + 1}</td>
                                            <td className="p-2 font-mono border-r">
                                              {safeDisplay(
                                                line.item_code || line.sku || line.article_id || line.fsn_isbn,
                                                `ITEM-${lineIndex + 1}`
                                              )}
                                            </td>
                                            <td className="p-2 border-r">
                                              <div className="max-w-[200px] truncate" title={
                                                line.product_description || line.item_description ||
                                                line.sku_desc || line.article_name || line.title
                                              }>
                                                {safeDisplay(
                                                  line.product_description || line.item_description ||
                                                  line.sku_desc || line.article_name || line.title,
                                                  `Product ${lineIndex + 1}`
                                                )}
                                              </div>
                                            </td>
                                            <td className="p-2 text-center font-medium border-r">
                                              {line.quantity || line.po_qty || 0}
                                            </td>
                                            <td className="p-2 border-r">
                                              {line.uom || line.grammage || 'Unit'}
                                            </td>
                                            <td className="p-2 text-right border-r">
                                              {safeDisplay(
                                                line.basic_cost_price || line.cost_price || line.supplier_price ||
                                                line.base_cost_price || line.buying_price || line.unit_base_cost,
                                                '₹0.00',
                                                'currency'
                                              )}
                                            </td>
                                            <td className="p-2 text-right border-r">
                                              {safeDisplay(
                                                line.mrp || line.supplier_mrp,
                                                '₹0.00',
                                                'currency'
                                              )}
                                            </td>
                                            <td className="p-2 text-right border-r">
                                              {(() => {
                                                // For Blinkit data, show the exact tax_amount from tax_value column
                                                if (line.tax_amount) {
                                                  const taxAmount = parseFloat(line.tax_amount || '0');
                                                  return taxAmount.toFixed(0);
                                                }

                                                // Fallback for other platforms - show calculated tax amount
                                                const taxableValue = parseFloat(line.taxable_value || line.PoLineValueWithoutTax || line.basic_value || '0');
                                                const totalAmount = parseFloat(line.line_total || line.PoLineValueWithTax || line.total_amount || '0');
                                                const taxAmount = totalAmount - taxableValue;
                                                return taxAmount.toFixed(0);
                                              })()}
                                            </td>
                                            <td className="p-2 text-right font-medium text-green-600">
                                              {safeDisplay(
                                                line.total_amount || line.total_value,
                                                '₹0.00',
                                                'currency'
                                              )}
                                            </td>
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
                      {/* Check if this is a BigBasket PO and use the specialized component */}
                      {(parsedData.platform?.pf_name?.toLowerCase().includes('bigbasket') ||
                        parsedData.platform?.pf_name?.toLowerCase() === 'bigbasket' ||
                        parsedData.detectedVendor === 'bigbasket') ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-orange-600">BigBasket PO Preview</h3>
                          <BigBasketPODetailView
                            po={{
                              ...parsedData.header,
                              platform: { pf_name: 'BigBasket' },
                              orderItems: parsedData.lines || []
                            }}
                            orderItems={parsedData.lines || []}
                            showImportButton={true}
                            onImportData={async (data) => {
                              try {
                                setIsImporting(true);

                                // Fix data structure - ensure clean header without extra fields
                                const cleanData = {
                                  header: parsedData.header, // Use original parsed header
                                  lines: parsedData.lines || [] // Use original parsed lines
                                };

                                console.log('📤 Importing BigBasket PO:', cleanData.header?.po_number, 'with', cleanData.lines?.length, 'items');

                                const response = await fetch('/api/bigbasket-pos/import', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify(cleanData)
                                });

                                const result = await response.json();

                                if (!response.ok) {
                                  console.error('❌ Server error:', result);
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

                                // Success - data inserted into bigbasket_po_header and bigbasket_po_lines
                                toast({
                                  title: "Import Successful",
                                  description: `PO ${data.header.po_number} with ${data.lines.length} items imported successfully`,
                                });

                                // Navigate back to platform-po page after short delay
                                setTimeout(() => {
                                  setLocation('/platform-po');
                                  setParsedData(null);
                                  setFile(null);
                                  setCurrentStep('platform');
                                  setSelectedPlatform('');
                                }, 1500);

                              } catch (error) {
                                console.error('❌ Import error:', error);
                                console.error('Error details:', {
                                  message: error instanceof Error ? error.message : 'Unknown error',
                                  stack: error instanceof Error ? error.stack : undefined
                                });

                                toast({
                                  title: "Import Error",
                                  description: error instanceof Error
                                    ? `Network error: ${error.message}`
                                    : "Network error or server unavailable",
                                  variant: "destructive",
                                });
                              } finally {
                                setIsImporting(false);
                              }
                            }}
                          />
                        </div>
                      ) : (parsedData.detectedVendor === 'amazon' || selectedPlatform === 'amazon') ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-yellow-600">Amazon PO Preview</h3>
                          <AmazonPoDetailView
                            header={parsedData.header || {}}
                            lines={parsedData.lines || []}
                            summary={{
                              totalItems: parsedData.totalItems || parsedData.lines?.length || 0,
                              totalQuantity: parsedData.totalQuantity || 0,
                              totalAmount: parsedData.totalAmount || parsedData.header?.total_amount || "0",
                              detectedVendor: parsedData.detectedVendor || "Amazon"
                            }}
                          />
                        </div>
                      ) : (selectedPlatform === 'swiggy' && (parsedData.poList || (parsedData.header && parsedData.lines))) ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-orange-600">
                            {parsedData.poList ? `Swiggy Primary POs Preview (${parsedData.poList.length} POs)` : 'Swiggy Primary PO Preview'}
                          </h3>

                          {/* Summary Statistics for Multiple POs */}
                          {parsedData.poList && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Summary Overview</CardTitle>
                                <CardDescription>
                                  All {parsedData.poList.length} Swiggy POs combined
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                                  <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                      <h4 className="font-medium text-gray-600 mb-1 text-xs">POs</h4>
                                      <p className="text-2xl font-bold text-purple-600">{parsedData.totalPOs}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-300 px-4">
                                      <h4 className="font-medium text-gray-600 mb-1 text-xs">Total Items</h4>
                                      <p className="text-2xl font-bold text-blue-600">{parsedData.totalItems}</p>
                                    </div>
                                    <div className="text-center border-l border-gray-300 px-4">
                                      <h4 className="font-medium text-gray-600 mb-1 text-xs">Total Quantity</h4>
                                      <p className="text-2xl font-bold text-green-600">
                                        {parsedData.poList.reduce((sum: number, po: any) => sum + (po.totalQuantity || 0), 0).toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                    <div className="text-center border-l border-gray-300 px-4">
                                      <h4 className="font-medium text-gray-600 mb-1 text-xs">Total Amount</h4>
                                      <p className="text-xl font-bold text-green-600">
                                        ₹{(() => {
                                          const amount = parseFloat(parsedData.totalAmount || '0');
                                          return isNaN(amount) ? '0.00' : amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Individual PO Details */}
                          {parsedData.poList ? (
                            <div className="space-y-4">
                              {parsedData.poList.slice(0, 3).map((po: any, poIndex: number) => (
                                <Card key={poIndex}>
                                  <CardHeader>
                                    <CardTitle className="text-base">
                                      PO #{po.header.PoNumber || po.header.po_number} - {po.header.VendorName || po.header.vendor_name}
                                    </CardTitle>
                                    <CardDescription>
                                      {po.lines.length} items • Status: {po.header.Status || po.header.status} •
                                      Amount: ₹{parseFloat(po.header.PoAmount || po.header.grand_total || '0').toLocaleString('en-IN')}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="text-left p-2 font-medium">#</th>
                                            <th className="text-left p-2 font-medium">Item Code</th>
                                            <th className="text-left p-2 font-medium">Description</th>
                                            <th className="text-right p-2 font-medium">Qty</th>
                                            <th className="text-right p-2 font-medium">Unit Price</th>
                                            <th className="text-right p-2 font-medium">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {po.lines.slice(0, 5).map((line: any, lineIndex: number) => (
                                            <tr key={lineIndex} className="border-t hover:bg-gray-50">
                                              <td className="p-2 text-center font-medium">{lineIndex + 1}</td>
                                              <td className="p-2 font-mono text-blue-600">{line.SkuCode || line.item_code}</td>
                                              <td className="p-2">
                                                <div className="max-w-[200px] truncate" title={line.SkuDescription || line.item_description}>
                                                  {line.SkuDescription || line.item_description}
                                                </div>
                                              </td>
                                              <td className="p-2 text-right font-medium">{line.OrderedQty || line.quantity}</td>
                                              <td className="p-2 text-right">₹{parseFloat(line.UnitBasedCost || line.unit_base_cost || '0').toFixed(2)}</td>
                                              <td className="p-2 text-right font-medium">₹{parseFloat(line.PoLineValueWithTax || line.total_value || '0').toFixed(2)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      {po.lines.length > 5 && (
                                        <div className="text-center text-gray-500 text-sm py-2">
                                          Showing first 5 items of {po.lines.length} total items in this PO
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {parsedData.poList.length > 3 && (
                                <div className="text-center text-gray-500 text-sm py-4 bg-gray-50 rounded-lg">
                                  Showing first 3 POs of {parsedData.poList.length} total POs. All will be imported to database.
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Single PO View */
                            <div className="space-y-4">
                              {/* Single PO Header Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Swiggy PO Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                      {/* Order Details */}
                                      <div className="space-y-2">
                                        <h6 className="font-semibold text-gray-700 pb-2 border-b">Order Details</h6>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">PO Number:</span> {parsedData.header.PoNumber || parsedData.header.po_number}</div>
                                          <div><span className="font-medium">Status:</span> {parsedData.header.Status || parsedData.header.status}</div>
                                          <div><span className="font-medium">Created:</span> {parsedData.header.PoCreatedAt || parsedData.header.po_date}</div>
                                          <div><span className="font-medium">Modified:</span> {parsedData.header.PoModifiedAt || parsedData.header.po_release_date}</div>
                                          <div><span className="font-medium">Delivery Date:</span> {parsedData.header.ExpectedDeliveryDate || parsedData.header.expected_delivery_date}</div>
                                          <div><span className="font-medium">Expiry Date:</span> {parsedData.header.PoExpiryDate || parsedData.header.po_expiry_date}</div>
                                        </div>
                                      </div>

                                      {/* Vendor Information */}
                                      <div className="space-y-2">
                                        <h6 className="font-semibold text-gray-700 pb-2 border-b">Vendor Information</h6>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Vendor:</span> {parsedData.header.VendorName || parsedData.header.vendor_name}</div>
                                          <div><span className="font-medium">Supplier Code:</span> {parsedData.header.SupplierCode}</div>
                                          <div><span className="font-medium">Entity:</span> {parsedData.header.Entity}</div>
                                        </div>
                                      </div>

                                      {/* Facility Information */}
                                      <div className="space-y-2">
                                        <h6 className="font-semibold text-gray-700 pb-2 border-b">Facility Information</h6>
                                        <div className="space-y-1">
                                          <div><span className="font-medium">Facility:</span> {parsedData.header.FacilityName}</div>
                                          <div><span className="font-medium">Facility ID:</span> {parsedData.header.FacilityId}</div>
                                          <div><span className="font-medium">City:</span> {parsedData.header.City}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Summary Statistics */}
                                    <div className="border-t border-gray-200 my-4"></div>
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg">
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center">
                                          <h4 className="font-medium text-gray-600 mb-1 text-xs">Items</h4>
                                          <p className="text-xl font-bold text-blue-600">{parsedData.lines.length}</p>
                                        </div>
                                        <div className="text-center border-l border-r border-gray-300 px-2">
                                          <h4 className="font-medium text-gray-600 mb-1 text-xs">Quantity</h4>
                                          <p className="text-xl font-bold text-green-600">
                                            {parsedData.lines.reduce((sum: number, line: any) => sum + (parseInt(line.OrderedQty) || 0), 0).toLocaleString('en-IN')}
                                          </p>
                                        </div>
                                        <div className="text-center">
                                          <h4 className="font-medium text-gray-600 mb-1 text-xs">Amount</h4>
                                          <p className="text-lg font-bold text-green-600">
                                            ₹{parseFloat(parsedData.header.PoAmount || parsedData.header.grand_total || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Single PO Line Items */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Line Items ({parsedData.lines.length})</CardTitle>
                                  <CardDescription>
                                    Complete data preview with all fields
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs" style={{minWidth: '1200px'}}>
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="text-left p-2 font-medium">#</th>
                                          <th className="text-left p-2 font-medium">Item Code</th>
                                          <th className="text-left p-2 font-medium">Description</th>
                                          <th className="text-right p-2 font-medium">Qty</th>
                                          <th className="text-left p-2 font-medium">UOM</th>
                                          <th className="text-right p-2 font-medium">Unit Price</th>
                                          <th className="text-right p-2 font-medium">MRP</th>
                                          <th className="text-right p-2 font-medium">Tax Amount</th>
                                          <th className="text-right p-2 font-medium">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {parsedData.lines.slice(0, 10).map((line: any, index: number) => (
                                          <tr key={index} className="border-t hover:bg-gray-50">
                                            <td className="p-2 text-center font-medium">{index + 1}</td>
                                            <td className="p-2 font-mono text-blue-600">{line.SkuCode || line.item_code}</td>
                                            <td className="p-2">
                                              <div className="max-w-[200px] truncate" title={line.SkuDescription || line.item_description}>
                                                {line.SkuDescription || line.item_description}
                                              </div>
                                            </td>
                                            <td className="p-2 text-right font-medium">{line.OrderedQty || line.quantity}</td>
                                            <td className="p-2">Unit</td>
                                            <td className="p-2 text-right">₹{parseFloat(line.UnitBasedCost || line.unit_base_cost || '0').toFixed(2)}</td>
                                            <td className="p-2 text-right">₹{parseFloat(line.Mrp || line.mrp || '0').toFixed(2)}</td>
                                            <td className="p-2 text-right">{(() => {
                                              // For Blinkit data, show the exact tax_amount from tax_value column
                                              if (line.tax_amount) {
                                                const taxAmount = parseFloat(line.tax_amount || '0');
                                                return taxAmount.toFixed(0);
                                              }

                                              // Fallback for other platforms - show calculated tax amount
                                              const taxableValue = parseFloat(line.PoLineValueWithoutTax || line.taxable_value || '0');
                                              const totalAmount = parseFloat(line.PoLineValueWithTax || line.total_value || '0');
                                              const taxAmount = totalAmount - taxableValue;
                                              return taxAmount.toFixed(0);
                                            })()}</td>
                                            <td className="p-2 text-right font-medium">₹{parseFloat(line.PoLineValueWithTax || line.total_value || '0').toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {parsedData.lines.length > 10 && (
                                      <div className="text-center text-gray-500 text-sm py-2">
                                        Showing first 10 items of {parsedData.lines.length} total items
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </div>
                      ) : (
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
                                  {(parsedData.header.po_number || parsedData.header.order_number || parsedData.header.purchase_order_number) && (
                                    <div><span className="font-medium text-gray-600">PO Number:</span> <span className="ml-2 font-mono text-blue-600">{parsedData.header.po_number || parsedData.header.order_number || parsedData.header.purchase_order_number}</span></div>
                                  )}
                                  {(parsedData.header.po_created_date || parsedData.header.po_date || parsedData.header.order_date || parsedData.header.created_at) && (
                                    <div><span className="font-medium text-gray-600">PO Date:</span> <span className="ml-2">
                                      {new Date(parsedData.header.po_created_date || parsedData.header.po_date || parsedData.header.order_date || parsedData.header.created_at).toLocaleDateString()}
                                    </span></div>
                                  )}
                                  {(parsedData.header.po_delivery_date || parsedData.header.delivery_date || parsedData.header.expected_delivery_date) && (
                                    <div><span className="font-medium text-gray-600">Delivery Date:</span> <span className="ml-2">
                                      {new Date(parsedData.header.po_delivery_date || parsedData.header.delivery_date || parsedData.header.expected_delivery_date).toLocaleDateString()}
                                    </span></div>
                                  )}
                                  {(parsedData.header.po_expiry_date || parsedData.header.expiry_date || parsedData.header.valid_till) && (
                                    <div><span className="font-medium text-gray-600">Expiry Date:</span> <span className="ml-2 text-red-600 font-medium">
                                      {new Date(parsedData.header.po_expiry_date || parsedData.header.expiry_date || parsedData.header.valid_till).toLocaleDateString()}
                                    </span></div>
                                  )}
                                  {(parsedData.header.credit_term || parsedData.header.payment_terms) && (
                                    <div><span className="font-medium text-gray-600">Payment Terms:</span> <span className="ml-2">{parsedData.header.credit_term || parsedData.header.payment_terms}</span></div>
                                  )}
                                  {(parsedData.header.reference_number || parsedData.header.ref_no || parsedData.header.order_reference) && (
                                    <div><span className="font-medium text-gray-600">Reference No:</span> <span className="ml-2">{parsedData.header.reference_number || parsedData.header.ref_no || parsedData.header.order_reference}</span></div>
                                  )}
                                  {(parsedData.header.currency || parsedData.header.currency_code) && (
                                    <div><span className="font-medium text-gray-600">Currency:</span> <span className="ml-2">{parsedData.header.currency || parsedData.header.currency_code || 'INR'}</span></div>
                                  )}
                                  {parsedData.header.category && (
                                    <div><span className="font-medium text-gray-600">Category:</span> <span className="ml-2">{parsedData.header.category}</span></div>
                                  )}
                                  {parsedData.header.nature_of_supply && (
                                    <div><span className="font-medium text-gray-600">Nature of Supply:</span> <span className="ml-2">{parsedData.header.nature_of_supply}</span></div>
                                  )}
                                  {parsedData.header.nature_of_transaction && (
                                    <div><span className="font-medium text-gray-600">Nature of Transaction:</span> <span className="ml-2">{parsedData.header.nature_of_transaction}</span></div>
                                  )}
                                  {parsedData.header.contract_ref_id && (
                                    <div><span className="font-medium text-gray-600">Contract Ref ID:</span> <span className="ml-2">{parsedData.header.contract_ref_id}</span></div>
                                  )}
                                  {parsedData.header.contract_version && (
                                    <div><span className="font-medium text-gray-600">Contract Version:</span> <span className="ml-2">{parsedData.header.contract_version}</span></div>
                                  )}
                                  <div><span className="font-medium text-gray-600">Status:</span> <span className="ml-2">{parsedData.header.status || 'Open'}</span></div>

                                  {/* Enhanced Totals Section */}
                                  <div className="border-t border-gray-200 my-4"></div>
                                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                                    <h6 className="font-semibold text-gray-800 mb-3 text-center">Purchase Order Summary</h6>
                                    <div className="grid grid-cols-4 gap-3">
                                      <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                                        <h4 className="font-medium text-gray-600 mb-1 text-xs">Total Lines</h4>
                                        <p className="text-xl font-bold text-blue-600">{parsedData.lines ? parsedData.lines.length : 0}</p>
                                      </div>
                                      <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                                        <h4 className="font-medium text-gray-600 mb-1 text-xs">Total Quantity</h4>
                                        <p className="text-xl font-bold text-green-600">
                                          {(() => {
                                            const headerQty = parseFloat(parsedData.header.total_quantity || '0');
                                            const calculatedQty = parsedData.lines?.reduce((sum: number, line: any) => sum + (parseFloat(line.quantity || line.OrderedQty || '0')), 0) || 0;
                                            return (headerQty > 0 ? headerQty : calculatedQty).toLocaleString('en-IN');
                                          })()}
                                        </p>
                                      </div>
                                      <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                                        <h4 className="font-medium text-gray-600 mb-1 text-xs">Total Amount</h4>
                                        <p className="text-lg font-bold text-green-600">
                                          ₹{(() => {
                                            const headerAmount = parseFloat(parsedData.header.grand_total || parsedData.header.total_amount || parsedData.header.po_amount || '0');
                                            const calculatedAmount = parsedData.lines?.reduce((sum: number, line: any) => sum + (parseFloat(line.total_amount || line.PoLineValueWithTax || line.line_total || '0')), 0) || 0;
                                            return (headerAmount > 0 ? headerAmount : calculatedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                          })()}
                                        </p>
                                      </div>
                                      <div className="text-center bg-white p-3 rounded-lg shadow-sm">
                                        <h4 className="font-medium text-gray-600 mb-1 text-xs">Status</h4>
                                        <p className="text-sm font-bold text-orange-600">{parsedData.header.status || 'Open'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {parsedData.header.comments && (
                                    <>
                                      <div className="border-t border-gray-200 my-4"></div>
                                      <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Comments</h4>
                                        <p className="text-gray-600 text-sm">{parsedData.header.comments}</p>
                                      </div>
                                    </>
                                  )}
                                </div>


                                {/* Vendor Information Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Shipped By (Vendor)</h6>
                                  {(parsedData.header.shipped_by || parsedData.header.vendor_name || parsedData.header.supplier_name) && (
                                    <div><span className="font-medium text-gray-600">Company:</span> <span className="ml-2">{parsedData.header.shipped_by || parsedData.header.vendor_name || parsedData.header.supplier_name}</span></div>
                                  )}
                                  {parsedData.header.vendor_code && (
                                    <div><span className="font-medium text-gray-600">Vendor Code:</span> <span className="ml-2">{parsedData.header.vendor_code}</span></div>
                                  )}
                                  {parsedData.header.shipped_by_phone && (
                                    <div><span className="font-medium text-gray-600">Phone:</span> <span className="ml-2">{parsedData.header.shipped_by_phone}</span></div>
                                  )}
                                  {(parsedData.header.shipped_by_gstin || parsedData.header.vendor_gst_no || parsedData.header.supplier_gstin) && (
                                    <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.shipped_by_gstin || parsedData.header.vendor_gst_no || parsedData.header.supplier_gstin}</span></div>
                                  )}
                                  {(parsedData.header.shipped_by_address || parsedData.header.vendor_registered_address || parsedData.header.supplier_address) && (
                                    <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2 text-xs">{parsedData.header.shipped_by_address || parsedData.header.vendor_registered_address || parsedData.header.supplier_address}</span></div>
                                  )}
                                </div>

                                {/* Buyer Information Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Bill To (Buyer)</h6>
                                  {(parsedData.header.bill_to || parsedData.header.buyer_name) && (
                                    <div><span className="font-medium text-gray-600">Company:</span> <span className="ml-2">{parsedData.header.bill_to || parsedData.header.buyer_name}</span></div>
                                  )}
                                  {(parsedData.header.bill_to_gstin || parsedData.header.buyer_gst || parsedData.header.billed_to_gstin) && (
                                    <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.bill_to_gstin || parsedData.header.buyer_gst || parsedData.header.billed_to_gstin}</span></div>
                                  )}
                                  {(parsedData.header.bill_to_address || parsedData.header.buyer_address || parsedData.header.billed_to_address) && (
                                    <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2 text-xs">{parsedData.header.bill_to_address || parsedData.header.buyer_address || parsedData.header.billed_to_address}</span></div>
                                  )}

                                  {/* Shipped To Section - Only show if any shipped_to data exists */}
                                  {(parsedData.header.shipped_to || parsedData.header.shipped_to_gstin || parsedData.header.shipped_to_address) && (
                                    <div className="mt-4 pt-2 border-t">
                                      <h6 className="font-semibold text-gray-700 text-xs">Shipped To</h6>
                                      {parsedData.header.shipped_to && (
                                        <div className="mt-1"><span className="font-medium text-gray-600">Location:</span> <span className="ml-2">{parsedData.header.shipped_to}</span></div>
                                      )}
                                      {parsedData.header.shipped_to_gstin && (
                                        <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.shipped_to_gstin}</span></div>
                                      )}
                                      {parsedData.header.shipped_to_address && (
                                        <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2 text-xs">{parsedData.header.shipped_to_address}</span></div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}


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
                            {/* Complete data preview with scrolling */}
                            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-blue-800">
                                  Complete data preview with all fields
                                </span>
                                <span className="text-blue-600">
                                  Scroll horizontally & vertically to view all data
                                </span>
                              </div>
                            </div>
                            <div className="overflow-x-auto overflow-y-auto border rounded-lg max-h-[70vh] bg-white shadow-sm custom-scrollbar table-container">
                              <table className="w-full text-xs border-collapse" style={{minWidth: '1500px'}}>
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                                  <tr>
                                    <th className="text-left p-2 font-medium border-r min-w-[50px]">#</th>
                                    <th className="text-left p-2 font-medium border-r min-w-[120px]">Item Code</th>
                                    <th className="text-left p-2 font-medium border-r min-w-[200px]">Description</th>
                                    <th className="text-center p-2 font-medium border-r min-w-[60px]">Qty</th>
                                    <th className="text-left p-2 font-medium border-r min-w-[60px]">UOM</th>
                                    <th className="text-right p-2 font-medium border-r min-w-[100px]">Unit Price</th>
                                    <th className="text-right p-2 font-medium border-r min-w-[100px]">MRP</th>
                                    <th className="text-right p-2 font-medium border-r min-w-[100px]">Tax Amount</th>
                                    <th className="text-right p-2 font-medium min-w-[120px]">Total Amount</th>
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
                                    <tr key={index} className="border-b hover:bg-gray-50 text-xs">
                                      <td className="p-2 text-center border-r font-medium">{index + 1}</td>
                                      <td className="p-2 font-mono border-r">
                                        {safeDisplay(
                                          line.item_code || line.sku || line.article_id || line.fsn_isbn || line.product_number,
                                          `ITEM-${index + 1}`
                                        )}
                                      </td>
                                      <td className="p-2 border-r">
                                        <div className="max-w-[200px] truncate" title={
                                          line.product_description || line.item_description ||
                                          line.sku_desc || line.article_name || line.title || line.product_name
                                        }>
                                          {safeDisplay(
                                            line.product_description || line.item_description ||
                                            line.sku_desc || line.article_name || line.title || line.product_name,
                                            `Product ${index + 1}`
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-2 text-center font-medium border-r">
                                        {line.quantity || line.po_qty || line.quantity_ordered || 0}
                                      </td>
                                      <td className="p-2 border-r">
                                        {line.uom || line.grammage || 'Unit'}
                                      </td>
                                      <td className="p-2 text-right border-r">
                                        {safeDisplay(
                                          line.basic_cost_price || line.cost_price || line.supplier_price ||
                                          line.base_cost_price || line.buying_price || line.price_per_unit ||
                                          line.landing_cost || line.unit_base_cost,
                                          '₹0.00',
                                          'currency'
                                        )}
                                      </td>
                                      <td className="p-2 text-right border-r">
                                        {safeDisplay(
                                          line.mrp || line.supplier_mrp || line.mrp_tax_inclusive,
                                          '₹0.00',
                                          'currency'
                                        )}
                                      </td>
                                      <td className="p-2 text-right border-r">
                                        {(() => {
                                          // For Blinkit data, show the exact tax_amount from tax_value column
                                          if (line.tax_amount) {
                                            const taxAmount = parseFloat(line.tax_amount || '0');
                                            return taxAmount.toFixed(0);
                                          }

                                          // Fallback for other platforms - show calculated tax amount
                                          const taxableValue = parseFloat(line.taxable_value || line.basic_value || line.net_amount || '0');
                                          const totalAmount = parseFloat(line.total_amount || line.line_total || line.grand_total || '0');
                                          const taxAmount = totalAmount - taxableValue;
                                          return taxAmount.toFixed(0);
                                        })()}
                                      </td>
                                      <td className="p-2 text-right font-medium text-green-600">
                                        {safeDisplay(
                                          line.total_amount || line.total_value,
                                          '₹0.00',
                                          'currency'
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Import Data Button - Bottom (only for platforms without specific buttons) */}
                      {!['citymall', 'zepto', 'flipkart', 'swiggy'].includes(selectedPlatformData?.id || '') && (
                        <div className="flex justify-center py-6 mt-4">
                          <Button
                            onClick={() => handleImportData()}
                            disabled={isImporting}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                          >
                            {isImporting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Importing Data...
                              </>
                            ) : (
                              <>
                                <Database className="h-5 w-5 mr-3" />
                                Import Data into Database
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      </div>
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
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
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

      {/* Import Data into Database Button - Bottom of page for Flipkart */}
      {currentStep === 'preview' && selectedPlatformData?.id === 'flipkart' && parsedData && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={() => handleImportData()}
                disabled={importMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                {importMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Import Data into Database
                  </>
                )}
              </Button>
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
              <p>
                This will import PO <strong>{parsedData.header?.po_number}</strong>
                {parsedData.lines && ` with ${parsedData.lines.length} line items`} into the database.
              </p>
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
                  // Handle both single PO and multiple POs
                  let uploadPromise;

                  if (parsedData.poList) {
                    // Multiple POs - import each one separately
                    console.log(`🔄 Importing ${parsedData.poList.length} Swiggy POs...`);

                    uploadPromise = Promise.all(
                      parsedData.poList.map((po: any) =>
                        fetch('/api/swiggy-pos', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            header: po.header,
                            lines: po.lines
                          }),
                        }).then(async (response) => {
                          if (!response.ok) {
                            const error = await response.json();
                            throw new Error(`PO ${po.header.PoNumber}: ${error.message || error.error}`);
                          }
                          return response.json();
                        })
                      )
                    );
                  } else {
                    // Single PO
                    const uploadData = {
                      header: parsedData.header,
                      lines: parsedData.lines
                    };

                    uploadPromise = fetch('/api/swiggy-pos', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(uploadData),
                    })
                  .then(async (response) => {
                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.message || error.error || "Failed to import Swiggy PO");
                    }
                    return response.json();
                  });
                  }

                  uploadPromise
                  .then(data => {
                    if (parsedData.poList) {
                      // Multiple POs success
                      toast({
                        title: "Import Successful",
                        description: `${parsedData.poList.length} Swiggy POs imported successfully with ${parsedData.totalItems} total items`,
                      });
                    } else {
                      // Single PO success
                      toast({
                        title: "Import Successful",
                        description: `Swiggy PO ${parsedData.header?.PoNumber || parsedData.header?.po_number} imported with ${parsedData.lines?.length || 0} items`,
                      });
                    }
                    queryClient.invalidateQueries({ queryKey: ["/api/swiggy-pos"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/pos"] });
                    resetForm();
                    onComplete?.();
                  })
                  .catch(error => {
                    toast({
                      title: "Import Failed",
                      description: error.message || 'Failed to import Swiggy PO(s)',
                      variant: "destructive",
                    });
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <Database className="h-5 w-5 mr-2" />
                📥 {parsedData.poList ? `Import ${parsedData.poList.length} Swiggy POs to Database` : 'Import Swiggy PO to Database'}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {parsedData.poList ? (
                  <>
                    Total POs: <strong>{parsedData.poList.length}</strong> |
                    Total Items: <strong>{parsedData.totalItems}</strong> |
                    Total Amount: <strong>₹{(() => {
                      const amount = parseFloat(parsedData.totalAmount || '0');
                      return isNaN(amount) ? '0' : amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}</strong>
                  </>
                ) : parsedData.header && parsedData.lines ? (
                  <>
                    PO: <strong>{parsedData.header.PoNumber || parsedData.header.po_number}</strong> |
                    Total Items: <strong>{parsedData.lines.length}</strong>
                  </>
                ) : (
                  "Ready to import Swiggy PO data"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Data into Database Button - Bottom of page for Blinkit POs */}
      {currentStep === 'preview' && selectedPlatformData?.id === 'blinkit' && parsedData && parsedData.poList && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  console.log(`🔄 Importing ${parsedData.poList.length} Blinkit POs using standard import...`);

                  // Use the standard import mutation with poList for multiple POs
                  importMutation.mutate({
                    poList: parsedData.poList
                  });
                }}
                disabled={importMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <Database className="h-5 w-5 mr-2" />
                📥 Import {parsedData.poList.length} Blinkit POs to Database
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Total POs: <strong>{parsedData.poList.length}</strong> |
                Total Items: <strong>{parsedData.totalItems}</strong> |
                Total Amount: <strong>₹{(() => {
                  const amount = parseFloat(parsedData.totalAmount || '0');
                  return isNaN(amount) ? '0' : amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                })()}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Data into Database Button - Bottom of page for CityMall POs */}
      {currentStep === 'preview' && selectedPlatformData?.id === 'citymall' && parsedData && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  console.log('🟢 CityMall Import Button Clicked');
                  console.log('📋 Parsed Data:', parsedData);
                  console.log('🏢 Selected Platform:', selectedPlatform);
                  console.log('📊 Data Structure:', {
                    hasHeader: !!parsedData?.header,
                    hasLines: !!parsedData?.lines,
                    linesCount: parsedData?.lines?.length || 0,
                    headerKeys: parsedData?.header ? Object.keys(parsedData.header) : [],
                    firstLineKeys: parsedData?.lines?.[0] ? Object.keys(parsedData.lines[0]) : []
                  });
                  handleImportData();
                }}
                disabled={importMutation.isPending}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                {importMutation.isPending ? (
                  <>
                    <Database className="mr-2 h-5 w-5 animate-spin" />
                    Importing CityMall Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Import Data into Database
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {parsedData.lines?.length ? (
                  <>
                    Ready to import <strong>{parsedData.lines.length}</strong> CityMall line items
                    {parsedData.header?.total_amount && (
                      <> | Total Amount: <strong>₹{Number(parsedData.header.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></>
                    )}
                  </>
                ) : (
                  "Ready to import CityMall PO data"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Data into Database Button - Bottom of page for Amazon POs */}
      {currentStep === 'preview' && selectedPlatformData?.id === 'amazon' && parsedData && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  console.log('🟢 Amazon Import Button Clicked');
                  console.log('📋 Parsed Data:', parsedData);
                  console.log('🏢 Selected Platform:', selectedPlatform);
                  console.log('📊 Data Structure:', {
                    hasHeader: !!parsedData?.header,
                    hasLines: !!parsedData?.lines,
                    linesCount: parsedData?.lines?.length || 0,
                    headerKeys: parsedData?.header ? Object.keys(parsedData.header) : [],
                    firstLineKeys: parsedData?.lines?.[0] ? Object.keys(parsedData.lines[0]) : []
                  });
                  handleImportData();
                }}
                disabled={importMutation.isPending}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                {importMutation.isPending ? (
                  <>
                    <Database className="mr-2 h-5 w-5 animate-spin" />
                    Importing Amazon Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Import Data into Database
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {parsedData.lines?.length ? (
                  <>
                    Ready to import <strong>{parsedData.lines.length}</strong> Amazon line items
                    {parsedData.header?.total_amount && (
                      <> | Total Amount: <strong>${Number(parsedData.header.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></>
                    )}
                  </>
                ) : (
                  "Ready to import Amazon PO data"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}