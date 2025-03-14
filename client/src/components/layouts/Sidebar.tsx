import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { name: "Calendar", path: "/calendar", icon: "ri-calendar-line" },
    { name: "Content", path: "/content", icon: "ri-article-line" },
    { name: "Images", path: "/images", icon: "ri-image-line" },
    { name: "Ads", path: "/ads", icon: "ri-advertisement-line" },
    { name: "Analytics", path: "/analytics", icon: "ri-line-chart-line" },
    { name: "Settings", path: "/settings", icon: "ri-settings-line" },
  ];

  const integrationItems = [
    { name: "Google Ads", icon: "ri-google-line", status: "connected" },
    { name: "Analytics", icon: "ri-pie-chart-line", status: "connected" },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-white border-r border-gray-200 h-full transition-all duration-300 ease-in-out",
        {
          "fixed inset-y-0 left-0 z-50": isOpen,
          "hidden md:flex": !isOpen,
        }
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600 flex items-center">
          <i className="ri-rocket-2-fill mr-2 text-2xl"></i>
          MarketingAI
        </h1>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    location === item.path
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={onClose}
                >
                  <i className={`${item.icon} mr-3 text-lg`}></i>
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Integrations
          </h3>
          <div className="mt-2 space-y-1">
            {integrationItems.map((item) => (
              <a
                key={item.name}
                href="#"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>
                {item.name}
                <span className="ml-auto h-2 w-2 bg-green-500 rounded-full"></span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <i className="ri-user-line text-primary-700"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Sarah Johnson</p>
            <p className="text-xs text-gray-500">Marketing Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
