import { Link, useLocation } from "wouter";
import { 
  ChartLine, 
  ShoppingCart, 
  Truck, 
  Upload, 
  Package, 
  Store, 
  User,
  Database,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  active: boolean;
  description?: string;
  comingSoon?: boolean;
};

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: ChartLine,
    active: true
  },
  {
    name: "Platform PO",
    href: "/platform-po",
    icon: ShoppingCart,
    active: true,
    description: "Create, upload & manage platform orders"
  },
  {
    name: "Distributor PO",
    href: "/distributor-po",
    icon: Truck,
    active: true,
    description: "Create & manage distributor purchase orders"
  },
  {
    name: "Secondary Sales",
    href: "/secondary-sales",
    icon: Upload,
    active: true,
    description: "Upload & manage secondary sales data from platforms"
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    active: true,
    description: "Upload & manage inventory data from platforms"
  },
  {
    name: "Create PF Item",
    href: "/pf-item-creation",
    icon: Plus,
    active: true,
    description: "Create new platform items"
  },
  {
    name: "SAP Sync",
    href: "/sap-sync", 
    icon: Database,
    active: true,
    description: "Sync item master data from SAP B1 Hanna ERP"
  },
  {
    name: "SQL Query",
    href: "/sql-query",
    icon: Database,
    active: true,
    description: "Execute custom SQL queries and generate reports"
  },

];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Store className="text-white text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Jivo E-Com</h1>
          </div>
        </div>
      </div>
      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-scroll" style={{scrollbarWidth: 'thin'}}>
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} to={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200",
                isActive ? "text-primary bg-blue-50 border border-blue-200 font-medium" : "text-gray-700 hover:bg-gray-50 hover:text-primary",
                !item.active && "opacity-50 pointer-events-none"
              )}>
                <Icon size={20} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.comingSoon && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Coming Soon</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}