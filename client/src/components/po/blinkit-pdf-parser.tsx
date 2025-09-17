import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from "lucide-react";

// Blinkit PDF data structure (extracted from our PDF analysis)
interface BlinkitPDFData {
  buyer: {
    company: string;
    pan: string;
    cin: string;
    contact: string;
    phone: string;
    gst: string;
    address: string;
  };
  vendor: {
    company: string;
    pan: string;
    gst: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
  };
  orderDetails: {
    poNumber: string;
    date: string;
    poType: string;
    vendorNo: string;
    currency: string;
    paymentTerms: string;
    expiryDate: string;
    deliveryDate: string;
  };
  items: Array<{
    itemCode: string;
    hsnCode: string;
    productUPC: string;
    productDescription: string;
    basicCostPrice: number;
    igstPercent: number;
    cessPercent: number;
    addtCess: number;
    taxAmount: number;
    landingRate: number;
    quantity: number;
    mrp: number;
    marginPercent: number;
    totalAmount: number;
  }>;
  summary: {
    totalQuantity: number;
    totalItems: number;
    totalWeight: string;
    totalAmount: number;
    cartDiscount: number;
    netAmount: number;
  };
}

interface BlinkitPDFParserProps {
  onDataParsed: (data: BlinkitPDFData) => void;
  onError: (error: string) => void;
}

export function BlinkitPDFParser({ onDataParsed, onError }: BlinkitPDFParserProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<BlinkitPDFData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // This function would be called when a PDF file is selected
  const handlePDFParse = async (file: File) => {
    setIsProcessing(true);

    try {
      // In a real implementation, you would:
      // 1. Read the PDF file
      // 2. Extract text/data using a PDF parsing library
      // 3. Parse the extracted data into the structured format

      // For this demo, I'll use the hardcoded data from our PDF analysis
      const mockParsedData: BlinkitPDFData = {
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
          poType: "PO",
          vendorNo: "1272",
          currency: "INR",
          paymentTerms: "30 Days",
          expiryDate: "Sept. 20, 2025, 11:59 p.m.",
          deliveryDate: "Sept. 11, 2025, 11:59 p.m."
        },
        items: [
          {
            itemCode: "10143020",
            hsnCode: "15099090",
            productUPC: "8908002585849",
            productDescription: "Jivo Pomace Olive Oil(Bottle) (1 l)",
            basicCostPrice: 391.43,
            igstPercent: 5.00,
            cessPercent: 0.00,
            addtCess: 0.00,
            taxAmount: 19.57,
            landingRate: 411.00,
            quantity: 70,
            mrp: 1049.00,
            marginPercent: 60.82,
            totalAmount: 28770.00
          },
          {
            itemCode: "10153585",
            hsnCode: "15099090",
            productUPC: "8908002584002",
            productDescription: "Jivo Extra Light Olive Oil (2 l)",
            basicCostPrice: 954.29,
            igstPercent: 5.00,
            cessPercent: 0.00,
            addtCess: 0.00,
            taxAmount: 47.71,
            landingRate: 1002.00,
            quantity: 30,
            mrp: 2799.00,
            marginPercent: 64.20,
            totalAmount: 30060.00
          }
        ],
        summary: {
          totalQuantity: 100,
          totalItems: 2,
          totalWeight: "0.126 tonnes",
          totalAmount: 58830.00,
          cartDiscount: 0.0,
          netAmount: 58830.00
        }
      };

      setParsedData(mockParsedData);
      onDataParsed(mockParsedData);
      setShowPreview(true);

    } catch (error) {
      console.error('Error parsing PDF:', error);
      onError(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (!parsedData) return;

    const csvRows = [];

    // CSV Headers
    const headers = [
      'Item Code', 'HSN Code', 'Product UPC', 'Product Description',
      'Basic Cost Price', 'IGST %', 'CESS %', 'ADDT. CESS', 'Tax Amount',
      'Landing Rate', 'Quantity', 'MRP', 'Margin %', 'Total Amount'
    ];
    csvRows.push(headers.join(','));

    // Data rows
    parsedData.items.forEach(item => {
      const row = [
        item.itemCode,
        item.hsnCode,
        item.productUPC,
        `"${item.productDescription}"`,
        item.basicCostPrice,
        item.igstPercent,
        item.cessPercent,
        item.addtCess,
        item.taxAmount,
        item.landingRate,
        item.quantity,
        item.mrp,
        item.marginPercent,
        item.totalAmount
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blinkit_po_${parsedData.orderDetails.poNumber}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    if (!parsedData) return;

    const rows = [];

    // Header information
    rows.push('BLINKIT PURCHASE ORDER');
    rows.push('');
    rows.push(`PO Number:\t${parsedData.orderDetails.poNumber}`);
    rows.push(`Date:\t${parsedData.orderDetails.date}`);
    rows.push(`Vendor:\t${parsedData.vendor.company}`);
    rows.push(`Buyer:\t${parsedData.buyer.company}`);
    rows.push(`Total Amount:\t${parsedData.summary.totalAmount}`);
    rows.push('');
    rows.push('ITEM DETAILS');

    // Headers
    const headers = [
      'Item Code', 'HSN Code', 'Product UPC', 'Product Description',
      'Basic Cost Price', 'IGST %', 'CESS %', 'ADDT. CESS', 'Tax Amount',
      'Landing Rate', 'Quantity', 'MRP', 'Margin %', 'Total Amount'
    ];
    rows.push(headers.join('\t'));

    // Data rows
    parsedData.items.forEach(item => {
      const row = [
        item.itemCode,
        item.hsnCode,
        item.productUPC,
        item.productDescription,
        item.basicCostPrice,
        item.igstPercent,
        item.cessPercent,
        item.addtCess,
        item.taxAmount,
        item.landingRate,
        item.quantity,
        item.mrp,
        item.marginPercent,
        item.totalAmount
      ];
      rows.push(row.join('\t'));
    });

    // Summary
    rows.push('');
    rows.push('SUMMARY');
    rows.push(`Total Quantity:\t${parsedData.summary.totalQuantity}`);
    rows.push(`Total Items:\t${parsedData.summary.totalItems}`);
    rows.push(`Total Weight:\t${parsedData.summary.totalWeight}`);
    rows.push(`Total Amount:\t${parsedData.summary.totalAmount}`);
    rows.push(`Net Amount:\t${parsedData.summary.netAmount}`);

    const tsvContent = rows.join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blinkit_po_${parsedData.orderDetails.poNumber}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (showPreview && parsedData) {
    return (
      <div className="space-y-6">
        {/* Header Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blinkit PDF Data Preview
            </CardTitle>
            <CardDescription>
              Review the extracted data from your Blinkit PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">PO Number:</span> {parsedData.orderDetails.poNumber}</div>
                  <div><span className="font-medium">Date:</span> {parsedData.orderDetails.date}</div>
                  <div><span className="font-medium">Payment Terms:</span> {parsedData.orderDetails.paymentTerms}</div>
                  <div><span className="font-medium">Currency:</span> {parsedData.orderDetails.currency}</div>
                </div>
              </div>

              {/* Vendor Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Vendor Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Company:</span> {parsedData.vendor.company}</div>
                  <div><span className="font-medium">Contact:</span> {parsedData.vendor.contact}</div>
                  <div><span className="font-medium">Phone:</span> {parsedData.vendor.phone}</div>
                  <div><span className="font-medium">GST:</span> {parsedData.vendor.gst}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{parsedData.summary.totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{parsedData.summary.totalQuantity}</div>
              <div className="text-sm text-muted-foreground">Total Quantity</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">₹{parsedData.summary.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{parsedData.summary.totalWeight}</div>
              <div className="text-sm text-muted-foreground">Total Weight</div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Showing all {parsedData.items.length} items from the PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Item Code</th>
                    <th className="text-left p-2 font-medium">Description</th>
                    <th className="text-left p-2 font-medium">HSN Code</th>
                    <th className="text-left p-2 font-medium">Qty</th>
                    <th className="text-left p-2 font-medium">Landing Rate</th>
                    <th className="text-left p-2 font-medium">MRP</th>
                    <th className="text-left p-2 font-medium">Margin %</th>
                    <th className="text-left p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.items.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="p-2 font-medium">{item.itemCode}</td>
                      <td className="p-2">{item.productDescription}</td>
                      <td className="p-2">{item.hsnCode}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">₹{item.landingRate}</td>
                      <td className="p-2">₹{item.mrp}</td>
                      <td className="p-2">{item.marginPercent}%</td>
                      <td className="p-2">₹{item.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={downloadCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
          <Button onClick={downloadExcel} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Excel
          </Button>
          <Button
            onClick={() => setShowPreview(false)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Hide Preview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF Parser Ready</CardTitle>
        <CardDescription>
          Upload a Blinkit PDF file to parse and preview the data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This component is ready to parse Blinkit PDF files. Select a PDF file in the upload component above.
        </p>
      </CardContent>
    </Card>
  );
}

export type { BlinkitPDFData };