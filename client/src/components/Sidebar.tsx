import { Link, useLocation } from "wouter";
import { currentUser } from "../App";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/content-generator", label: "Content Generation", icon: "ri-ai-generate" },
    { path: "/image-generator", label: "Image Generation", icon: "ri-image-add-line" },
    { path: "/content-calendar", label: "Content Calendar", icon: "ri-calendar-line" },
    { path: "/campaign-analytics", label: "Campaign Analytics", icon: "ri-line-chart-line" },
  ];

  const integrationItems = [
    { path: "/google-ads", label: "Google Ads", icon: "ri-google-line" },
    { path: "/google-analytics", label: "Google Analytics", icon: "ri-bar-chart-box-line" },
  ];

  return (
    <div 
      className={`${
        isOpen ? "fixed inset-0 z-50 md:relative" : "hidden md:flex"
      } flex-col w-64 bg-white border-r border-slate-200 h-full transition-all duration-300`}
    >
      {/* Brand logo */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="ri-ai-generate text-2xl text-primary"></i>
          <h1 className="text-xl font-semibold text-dark font-heading">MarketingAI</h1>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="rounded-full h-8 w-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <i className="ri-menu-line"></i>
        </button>
      </div>
      
      {/* Navigation menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a 
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location === item.path 
                  ? "bg-primary bg-opacity-10 text-primary font-medium" 
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
        
        {/* Integrations section */}
        <div className="pt-4">
          <div className="px-4 py-2 text-xs font-semibold uppercase text-slate-500">Integrations</div>
          {integrationItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  location === item.path 
                    ? "bg-primary bg-opacity-10 text-primary font-medium" 
                    : "text-slate-600 hover:bg-slate-100 font-medium"
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* User profile section */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 p-2">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {currentUser.fullName.split(" ").map(name => name[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{currentUser.fullName}</p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
