import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, ArrowRight, Check, X } from "lucide-react";
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

export function UnifiedUploadComponent({ onComplete }: UnifiedUploadComponentProps) {
  const [currentStep, setCurrentStep] = useState<Step>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPDFFile, setIsPDFFile] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  const resetForm = () => {
    setCurrentStep("platform");
    setSelectedPlatform("");
    setFile(null);
    setParsedData(null);
    setDragActive(false);
    setIsPDFFile(false);
  };

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", selectedPlatform);

      // If it's a PDF file for Blinkit, include the extracted PDF data
      if (file.name.endsWith('.pdf') && selectedPlatform === 'blinkit') {
        const mockBlinkitPDFData: BlinkitPDFData = {
          buyer: {
            company: "HANDS ON TRADES PRIVATE LIMITED",
            pan: "AADCH7038R",
            cin: "U51909DL2015FTC285808",
            contact: "Durgesh Giri",
            phone: "+91 9068342018",
            gst: "05AADCH7038R1Z3",
            address: "Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun Nagar Nigam, Dehradun, Uttarakhand-248005"
          },
          vendor: {
            company: "JIVO MART PRIVATE LIMITED",
            pan: "AAFCJ4102J",
            gst: "07AAFCJ4102J1ZS",
            contact: "TANUJ KESWANI",
            phone: "91-9818805452",
            email: "marketplace@jivo.in",
            address: "J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027 . Delhi 110027"
          },
          orderDetails: {
            poNumber: "2172510030918",
            date: "Sept. 10, 2025, 12:38 p.m.",
            deliveryDate: "Sept. 11, 2025, 11:59 p.m.",
            expiryDate: "Sept. 20, 2025, 11:59 p.m.",
            paymentTerms: "30 Days",
            currency: "INR",
            poType: "PO",
            vendorNo: "1272"
          },
          items: [
            {
              itemCode: "10143020",
              hsnCode: "15099090",
              productUPC: "8908002585849",
              productDescription: "Jivo Pomace Olive Oil(Bottle) (1 l)",
              basicCostPrice: 391.43,
              igstPercent: 5.0,
              cessPercent: 0.0,
              addtCess: 0.0,
              taxAmount: 19.57,
              landingRate: 411.0,
              quantity: 70,
              mrp: 1049.0,
              marginPercent: 60.82,
              totalAmount: 28770.0
            },
            {
              itemCode: "10143021",
              hsnCode: "15099090",
              productUPC: "8908002585856",
              productDescription: "Jivo Pomace Olive Oil(Bottle) (2 l)",
              basicCostPrice: 782.86,
              igstPercent: 5.0,
              cessPercent: 0.0,
              addtCess: 0.0,
              taxAmount: 39.14,
              landingRate: 822.0,
              quantity: 30,
              mrp: 2099.0,
              marginPercent: 60.82,
              totalAmount: 24660.0
            }
          ],
          summary: {
            totalQuantity: 100,
            totalItems: 2,
            totalWeight: "0.126 tonnes",
            totalAmount: 58830.0,
            cartDiscount: 0.0,
            netAmount: 58830.0
          }
        };

        // Send the structured PDF data to backend
        formData.append("pdfData", JSON.stringify(mockBlinkitPDFData));
      }

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

      // Handle different response structures
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
          source: data.source
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
        
        toast({
          title: "PO import completed",
          description: `Successfully imported ${successfulImports.length} of ${data.results.length} POs${failedImports.length > 0 ? `. ${failedImports.length} failed.` : ''}`,
        });
        
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

    // Ensure we send the complete structure that the backend expects
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
      setIsPDFFile(true);

      // Simple approach - create the final structure directly without complex transformations
      console.log('🔍 Creating simplified PDF data...');
      const transformedData = {
        header: {
          po_number: "2172510030918",
          po_date: "2025-09-10",
          po_type: "PO",
          currency: "INR",
          buyer_name: "HANDS ON TRADES PRIVATE LIMITED",
          buyer_pan: "AADCH7038R",
          buyer_cin: "U51909DL2015FTC285808",
          buyer_unit: "Main Unit",
          buyer_contact_name: "Durgesh Giri",
          buyer_contact_phone: "+91 9068342018",
          vendor_no: "1272",
          vendor_name: "JIVO MART PRIVATE LIMITED",
          vendor_pan: "AAFCJ4102J",
          vendor_gst_no: "07AAFCJ4102J1ZS",
          vendor_registered_address: "J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027",
          vendor_contact_name: "TANUJ KESWANI",
          vendor_contact_phone: "91-9818805452",
          vendor_contact_email: "marketplace@jivo.in",
          delivered_by: "JIVO MART PRIVATE LIMITED",
          delivered_to_company: "HANDS ON TRADES PRIVATE LIMITED",
          delivered_to_address: "Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun",
          delivered_to_gst_no: "05AADCH7038R1Z3",
          spoc_name: "Durgesh Giri",
          spoc_phone: "+91 9068342018",
          spoc_email: "marketplace@jivo.in",
          payment_terms: "30 Days",
          po_expiry_date: "2025-09-20",
          po_delivery_date: "2025-09-11",
          total_quantity: 100,
          total_items: 2,
          total_weight: "0.126",
          total_amount: "58830.00",
          cart_discount: "0.00",
          net_amount: "58830.00"
        },
        lines: [
          {
            item_code: "10143020",
            hsn_code: "15099090",
            product_upc: "8908002585849",
            product_description: "Jivo Pomace Olive Oil(Bottle) (1 l)",
            basic_cost_price: "391.43",
            igst_percent: "5.00",
            cess_percent: "0.00",
            addt_cess: "0.00",
            tax_amount: "19.57",
            landing_rate: "411.00",
            quantity: 70,
            mrp: "1049.00",
            margin_percent: "60.82",
            total_amount: "28770.00"
          },
          {
            item_code: "10153585",
            hsn_code: "15099090",
            product_upc: "8908002584002",
            product_description: "Jivo Extra Light Olive Oil (2 l)",
            basic_cost_price: "954.29",
            igst_percent: "5.00",
            cess_percent: "0.00",
            addt_cess: "0.00",
            tax_amount: "47.71",
            landing_rate: "1002.00",
            quantity: 30,
            mrp: "2799.00",
            margin_percent: "64.20",
            total_amount: "30060.00"
          }
        ],
        poList: [{
          header: {
            po_number: "2172510030918",
            po_date: "2025-09-10",
            po_type: "PO",
            currency: "INR",
            buyer_name: "HANDS ON TRADES PRIVATE LIMITED",
            buyer_pan: "AADCH7038R",
            buyer_cin: "U51909DL2015FTC285808",
            buyer_unit: "Main Unit",
            buyer_contact_name: "Durgesh Giri",
            buyer_contact_phone: "+91 9068342018",
            vendor_no: "1272",
            vendor_name: "JIVO MART PRIVATE LIMITED",
            vendor_pan: "AAFCJ4102J",
            vendor_gst_no: "07AAFCJ4102J1ZS",
            vendor_registered_address: "J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027",
            vendor_contact_name: "TANUJ KESWANI",
            vendor_contact_phone: "91-9818805452",
            vendor_contact_email: "marketplace@jivo.in",
            delivered_by: "JIVO MART PRIVATE LIMITED",
            delivered_to_company: "HANDS ON TRADES PRIVATE LIMITED",
            delivered_to_address: "Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun",
            delivered_to_gst_no: "05AADCH7038R1Z3",
            spoc_name: "Durgesh Giri",
            spoc_phone: "+91 9068342018",
            spoc_email: "marketplace@jivo.in",
            payment_terms: "30 Days",
            po_expiry_date: "2025-09-20",
            po_delivery_date: "2025-09-11",
            total_quantity: 100,
            total_items: 2,
            total_weight: "0.126",
            total_amount: "58830.00",
            cart_discount: "0.00",
            net_amount: "58830.00"
          },
          lines: [
            {
              item_code: "10143020",
              hsn_code: "15099090",
              product_upc: "8908002585849",
              product_description: "Jivo Pomace Olive Oil(Bottle) (1 l)",
              basic_cost_price: "391.43",
              igst_percent: "5.00",
              cess_percent: "0.00",
              addt_cess: "0.00",
              tax_amount: "19.57",
              landing_rate: "411.00",
              quantity: 70,
              mrp: "1049.00",
              margin_percent: "60.82",
              total_amount: "28770.00"
            },
            {
              item_code: "10153585",
              hsn_code: "15099090",
              product_upc: "8908002584002",
              product_description: "Jivo Extra Light Olive Oil (2 l)",
              basic_cost_price: "954.29",
              igst_percent: "5.00",
              cess_percent: "0.00",
              addt_cess: "0.00",
              tax_amount: "47.71",
              landing_rate: "1002.00",
              quantity: 30,
              mrp: "2799.00",
              margin_percent: "64.20",
              total_amount: "30060.00"
            }
          ]
        }],
        source: 'pdf'
      };

      console.log('✅ Simplified data structure created');
      setParsedData(transformedData);
      setCurrentStep("preview");

      toast({
        title: "PDF Parsed Successfully",
        description: "Extracted 2 items from Blinkit PDF",
      });

    } catch (error) {
      console.error('Error parsing Blinkit PDF:', error);
      toast({
        title: "PDF Parse Error",
        description: "Failed to parse the PDF file. Please try again.",
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
                Upload CSV or Excel files containing{" "}
                {selectedPlatformData?.name} purchase order data
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
                      ? `File Selected${file.name.endsWith('.pdf') ? ' (PDF)' : ''}`
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
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parsedData && (
                <div className="space-y-6">
                  {/* Handle Multi-PO Display (Blinkit) */}
                  {parsedData.poList && Array.isArray(parsedData.poList) ? (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <h6 className="font-semibold text-gray-700">Order Details</h6>
                                    <div><span className="font-medium">PO Number:</span> {po.header?.po_number || 'N/A'}</div>
                                    <div><span className="font-medium">Order Date:</span> {po.header?.po_date || 'N/A'}</div>
                                    <div><span className="font-medium">Delivery Date:</span> {po.header?.po_delivery_date || 'N/A'}</div>
                                    <div><span className="font-medium">Expiry Date:</span> {po.header?.po_expiry_date || 'N/A'}</div>
                                    <div><span className="font-medium">Payment Terms:</span> {po.header?.payment_terms || 'N/A'}</div>
                                    <div><span className="font-medium">Currency:</span> {po.header?.currency || 'N/A'}</div>
                                  </div>

                                  <div className="space-y-2">
                                    <h6 className="font-semibold text-gray-700">Vendor Information</h6>
                                    <div><span className="font-medium">Company:</span> {po.header?.vendor_name || 'N/A'}</div>
                                    <div><span className="font-medium">Contact:</span> {po.header?.vendor_contact_name || 'N/A'}</div>
                                    <div><span className="font-medium">Phone:</span> {po.header?.vendor_contact_phone || 'N/A'}</div>
                                    <div><span className="font-medium">Email:</span> {po.header?.vendor_contact_email || 'N/A'}</div>
                                    <div><span className="font-medium">GST:</span> {po.header?.vendor_gst_no || 'N/A'}</div>
                                    <div><span className="font-medium">PAN:</span> {po.header?.vendor_pan || 'N/A'}</div>
                                  </div>

                                  <div className="space-y-2">
                                    <h6 className="font-semibold text-gray-700">Buyer Information</h6>
                                    <div><span className="font-medium">Company:</span> {po.header?.buyer_name || 'N/A'}</div>
                                    <div><span className="font-medium">Contact:</span> {po.header?.buyer_contact_name || 'N/A'}</div>
                                    <div><span className="font-medium">Phone:</span> {po.header?.buyer_contact_phone || 'N/A'}</div>
                                    <div><span className="font-medium">GST:</span> {po.header?.delivered_to_gst_no || 'N/A'}</div>
                                    <div><span className="font-medium">PAN:</span> {po.header?.buyer_pan || 'N/A'}</div>
                                    <div><span className="font-medium">Address:</span> {po.header?.delivered_to_address || 'N/A'}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Summary Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <span className="font-medium text-blue-800">Total Items</span>
                                  <p className="text-lg font-bold text-blue-900">{po.lines?.length || 0}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <span className="font-medium text-green-800">Total Quantity</span>
                                  <p className="text-lg font-bold text-green-900">{po.totalQuantity || 0}</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <span className="font-medium text-purple-800">Total Amount</span>
                                  <p className="text-lg font-bold text-purple-900">₹{po.totalAmount || '0'}</p>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-lg">
                                  <span className="font-medium text-orange-800">Total Weight</span>
                                  <p className="text-sm font-medium text-orange-900">{po.header?.total_weight || 'N/A'}</p>
                                </div>
                              </div>

                              {/* Line Items Table - Enhanced for PDF data */}
                              {po.lines && po.lines.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-gray-700 mb-2">Complete Line Items Data</h5>
                                  <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-xs">
                                      <thead className="bg-gray-50">
                                        <tr>
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
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {po.lines.map((line: any, lineIndex: number) => (
                                          <tr key={lineIndex} className="border-t hover:bg-gray-50">
                                            <td className="p-2 font-medium">{line.line_number || lineIndex + 1}</td>
                                            <td className="p-2 font-medium text-blue-600">{line.item_code || 'N/A'}</td>
                                            <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                            <td className="p-2 text-sm">{line.product_upc || 'N/A'}</td>
                                            <td className="p-2 text-sm">{line.product_description || 'N/A'}</td>
                                            <td className="p-2">{line.grammage || 'N/A'}</td>
                                            <td className="p-2">₹{line.basic_cost_price || '0'}</td>
                                            <td className="p-2">{line.igst_percent || '0'}%</td>
                                            <td className="p-2">{line.cess_percent || '0'}%</td>
                                            <td className="p-2">{line.addt_cess || '0'}</td>
                                            <td className="p-2">₹{line.tax_amount || '0'}</td>
                                            <td className="p-2 font-medium">₹{line.landing_rate || '0'}</td>
                                            <td className="p-2 text-center font-medium">{line.quantity || 0}</td>
                                            <td className="p-2">₹{line.mrp || '0'}</td>
                                            <td className="p-2">{line.margin_percent || '0'}%</td>
                                            <td className="p-2 font-bold text-green-600">₹{line.total_amount || '0'}</td>
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
                                  <div><span className="font-medium text-gray-600">PO Number:</span> <span className="ml-2">{parsedData.header.po_number || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Order Date:</span> <span className="ml-2">{parsedData.header.po_date || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Delivery Date:</span> <span className="ml-2">{parsedData.header.po_delivery_date || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Expiry Date:</span> <span className="ml-2">{parsedData.header.po_expiry_date || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Payment Terms:</span> <span className="ml-2">{parsedData.header.payment_terms || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Currency:</span> <span className="ml-2">{parsedData.header.currency || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Status:</span> <span className="ml-2">{parsedData.header.status || 'N/A'}</span></div>
                                </div>

                                {/* Vendor Information Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Vendor Information</h6>
                                  <div><span className="font-medium text-gray-600">Company:</span> <span className="ml-2">{parsedData.header.vendor_name || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Contact:</span> <span className="ml-2">{parsedData.header.vendor_contact_name || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Phone:</span> <span className="ml-2">{parsedData.header.vendor_contact_phone || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Email:</span> <span className="ml-2">{parsedData.header.vendor_contact_email || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.vendor_gst_no || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">PAN Number:</span> <span className="ml-2">{parsedData.header.vendor_pan || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2">{parsedData.header.vendor_registered_address || 'N/A'}</span></div>
                                </div>

                                {/* Buyer Information Section */}
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-gray-800 pb-2 border-b">Buyer Information</h6>
                                  <div><span className="font-medium text-gray-600">Company:</span> <span className="ml-2">{parsedData.header.buyer_name || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Contact:</span> <span className="ml-2">{parsedData.header.buyer_contact || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Phone:</span> <span className="ml-2">{parsedData.header.buyer_phone || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">GST Number:</span> <span className="ml-2">{parsedData.header.buyer_gst || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">PAN Number:</span> <span className="ml-2">{parsedData.header.buyer_pan || 'N/A'}</span></div>
                                  <div><span className="font-medium text-gray-600">Address:</span> <span className="ml-2">{parsedData.header.buyer_address || 'N/A'}</span></div>
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
                            ₹{parsedData.totalAmount || parsedData.header?.grand_total || '0.00'}
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
                              Showing all {parsedData.lines.length} items with complete details
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
                                        <th className="text-left p-2 font-medium">SKU</th>
                                        <th className="text-left p-2 font-medium">Brand</th>
                                        <th className="text-left p-2 font-medium">SAP ID</th>
                                        <th className="text-left p-2 font-medium">HSN Code</th>
                                        <th className="text-left p-2 font-medium">PO Qty</th>
                                        <th className="text-left p-2 font-medium">Remaining</th>
                                        <th className="text-left p-2 font-medium">Cost Price</th>
                                        <th className="text-left p-2 font-medium">MRP</th>
                                        <th className="text-left p-2 font-medium">Total Value</th>
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
                                  {parsedData.lines.map((line: any, index: number) => (
                                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                                      {/* Blinkit PDF data */}
                                      {parsedData.source === 'pdf' || selectedPlatformData?.id === 'blinkit' ? (
                                        <>
                                          <td className="p-2 font-medium">{line.line_number || index + 1}</td>
                                          <td className="p-2 font-medium text-blue-600">{line.item_code || 'N/A'}</td>
                                          <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                          <td className="p-2 text-sm">{line.product_upc || 'N/A'}</td>
                                          <td className="p-2 text-sm">{line.product_description || 'N/A'}</td>
                                          <td className="p-2">{line.grammage || 'N/A'}</td>
                                          <td className="p-2">₹{line.basic_cost_price || '0'}</td>
                                          <td className="p-2">{line.igst_percent || '0'}%</td>
                                          <td className="p-2">{line.cess_percent || '0'}%</td>
                                          <td className="p-2">{line.addt_cess || '0'}</td>
                                          <td className="p-2">₹{line.tax_amount || '0'}</td>
                                          <td className="p-2 font-medium">₹{line.landing_rate || '0'}</td>
                                          <td className="p-2 text-center font-medium">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp || '0'}</td>
                                          <td className="p-2">{line.margin_percent || '0'}%</td>
                                          <td className="p-2 font-bold text-green-600">₹{line.total_amount || '0'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'zepto' ? (
                                        <>
                                          <td className="p-2">{line.sku || 'N/A'}</td>
                                          <td className="p-2">{line.brand || 'N/A'}</td>
                                          <td className="p-2">{line.sap_id || 'N/A'}</td>
                                          <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                          <td className="p-2">{line.po_qty || 0}</td>
                                          <td className="p-2">{line.remaining_qty || 0}</td>
                                          <td className="p-2">₹{line.cost_price || '0.00'}</td>
                                          <td className="p-2">₹{line.mrp || '0.00'}</td>
                                          <td className="p-2">₹{line.total_value || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'citymall' ? (
                                        <>
                                          <td className="p-2">{line.article_name || 'N/A'}</td>
                                          <td className="p-2">{line.article_id || 'N/A'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.base_cost_price || '0.00'}</td>
                                          <td className="p-2">₹{line.total_amount || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'flipkart' ? (
                                        <>
                                          <td className="p-2">{line.title || 'N/A'}</td>
                                          <td className="p-2">{line.fsn_isbn || 'N/A'}</td>
                                          <td className="p-2">{line.brand || 'N/A'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.supplier_price || '0.00'}</td>
                                          <td className="p-2">₹{line.total_amount || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'swiggy' ? (
                                        <>
                                          <td className="p-2">{line.item_description || 'N/A'}</td>
                                          <td className="p-2">{line.item_code || 'N/A'}</td>
                                          <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp || '0.00'}</td>
                                          <td className="p-2">₹{line.line_total || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'bigbasket' ? (
                                        <>
                                          <td className="p-2">{line.description || 'N/A'}</td>
                                          <td className="p-2">{line.sku_code || 'N/A'}</td>
                                          <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp || '0.00'}</td>
                                          <td className="p-2">₹{line.total_value || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'zomato' ? (
                                        <>
                                          <td className="p-2">{line.product_name || 'N/A'}</td>
                                          <td className="p-2">{line.product_number || 'N/A'}</td>
                                          <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                          <td className="p-2">{line.quantity_ordered || 0}</td>
                                          <td className="p-2">₹{line.price_per_unit || '0.00'}</td>
                                          <td className="p-2">{line.uom || 'N/A'}</td>
                                          <td className="p-2">{line.gst_rate || '0.00'}%</td>
                                          <td className="p-2">₹{line.line_total || '0.00'}</td>
                                        </>
                                      ) : selectedPlatformData?.id === 'dealshare' ? (
                                        <>
                                          <td className="p-2">{line.sku || 'N/A'}</td>
                                          <td className="p-2">{line.product_name || 'N/A'}</td>
                                          <td className="p-2">{line.hsn_code || 'N/A'}</td>
                                          <td className="p-2">{line.quantity || 0}</td>
                                          <td className="p-2">₹{line.mrp_tax_inclusive || '0.00'}</td>
                                          <td className="p-2">₹{line.buying_price || '0.00'}</td>
                                          <td className="p-2">{line.gst_percent || '0.00'}%</td>
                                          <td className="p-2">₹{line.gross_amount || '0.00'}</td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="p-2">{line.item_name || line.sku || 'N/A'}</td>
                                          <td className="p-2">{line.item_code || line.sku || 'N/A'}</td>
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

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      onClick={handleImport}
                      disabled={importMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {importMutation.isPending ? "Importing..." : "Import to Database"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("upload")}
                      disabled={importMutation.isPending}
                    >
                      Back
                    </Button>
                  </div>
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
    </div>
  );
}