import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Upload, Wifi, WifiOff, Battery, BatteryLow } from "lucide-react";

interface MobileUploadOptimizationProps {
  children: React.ReactNode;
  onOptimizationChange?: (isOptimized: boolean) => void;
}

export function MobileUploadOptimization({ children, onOptimizationChange }: MobileUploadOptimizationProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [networkSpeed, setNetworkSpeed] = useState<string>('unknown');

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      onOptimizationChange?.(isMobileDevice);
    };

    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Get network information
    const getNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setNetworkSpeed(connection.effectiveType || 'unknown');
      }
    };

    // Get battery information
    const getBatteryInfo = async () => {
      try {
        const battery = await (navigator as any).getBattery?.();
        if (battery) {
          setBatteryLevel(battery.level * 100);
          setIsLowBattery(battery.level < 0.2);

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level * 100);
            setIsLowBattery(battery.level < 0.2);
          });
        }
      } catch (error) {
        console.log('Battery API not supported');
      }
    };

    checkMobile();
    getNetworkInfo();
    getBatteryInfo();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', checkMobile);
    };
  }, [onOptimizationChange]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Smartphone className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Mobile Optimized</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Network Status */}
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-500">
                {networkSpeed === '4g' ? '4G' : networkSpeed === '3g' ? '3G' : networkSpeed === 'slow-2g' ? '2G' : 'WiFi'}
              </span>
            </div>

            {/* Battery Status */}
            {batteryLevel !== null && (
              <div className="flex items-center space-x-1">
                {isLowBattery ? (
                  <BatteryLow className="h-4 w-4 text-red-500" />
                ) : (
                  <Battery className="h-4 w-4 text-green-500" />
                )}
                <span className="text-xs text-gray-500">{Math.round(batteryLevel)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Optimization Alerts */}
      <div className="px-4 py-2 space-y-2">
        {!isOnline && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">No internet connection. Please connect to upload files.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isLowBattery && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <BatteryLow className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Low battery detected. Consider plugging in your device.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {networkSpeed === 'slow-2g' && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700">Slow network detected. Upload may take longer.</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Optimized Content */}
      <div className="px-2 pb-4">
        <style dangerouslySetInnerHTML={{
          __html: `
          .mobile-optimized {
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .mobile-optimized input[type="file"] {
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .mobile-optimized .drag-area {
            min-height: 200px; /* Larger touch target */
            padding: 2rem;
          }

          .mobile-optimized button {
            min-height: 44px; /* iOS recommended touch target */
            font-size: 16px;
          }

          .mobile-optimized .card {
            margin-bottom: 1rem;
            border-radius: 12px;
          }

          @media (max-width: 640px) {
            .mobile-optimized .grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .mobile-optimized .text-4xl {
              font-size: 2rem;
            }

            .mobile-optimized .text-xl {
              font-size: 1.125rem;
            }
          }
        `
        }} />

        <div className="mobile-optimized">
          {children}
        </div>
      </div>

      {/* Mobile Footer Help */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">📱 Mobile Upload Tips</p>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
            <div>• For best results, use WiFi connection</div>
            <div>• Ensure sufficient battery before large uploads</div>
            <div>• Keep app in foreground during upload</div>
          </div>
        </div>
      </div>
    </div>
  );
}