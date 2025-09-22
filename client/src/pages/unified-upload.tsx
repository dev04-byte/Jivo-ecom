import { EnhancedUploadComponent } from "@/components/ui/enhanced-upload-component";
import { MobileUploadOptimization } from "@/components/ui/mobile-upload-optimization";

export default function UnifiedUpload() {
  return (
    <MobileUploadOptimization>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                📊 Purchase Order Upload Center
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload and process purchase orders from all major e-commerce platforms
                with our unified, streamlined interface.
              </p>
            </div>

            {/* Enhanced Upload Component */}
            <EnhancedUploadComponent
              className="max-w-full"
              onComplete={() => {
                // Optional: handle completion
                console.log("Upload process completed successfully");
              }}
            />

            {/* Help Section */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>File Formats:</strong> We support Excel (.xlsx, .xls), CSV (.csv), and PDF files (Blinkit only)
                  </div>
                  <div>
                    <strong>File Size:</strong> Maximum file size is 50-100MB depending on platform
                  </div>
                  <div>
                    <strong>Processing Time:</strong> Most files are processed within 30-60 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileUploadOptimization>
  );
}