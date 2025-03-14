import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { 
  BarChart3, 
  Calendar, 
  Wand2, 
  Image, 
  LineChart, 
  BadgePercent, 
  Settings 
} from "lucide-react";

import {
  SiGoogleanalytics,
  SiGoogleads
} from "react-icons/si";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/user'],
    refetchOnWindowFocus: false,
  });

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (isMobileMenuOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close sidebar when changing routes on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: <BarChart3 className="mr-3 h-5 w-5" /> },
    { title: "Content Calendar", href: "/content-calendar", icon: <Calendar className="mr-3 h-5 w-5" /> },
    { title: "AI Content Generator", href: "/ai-content-generator", icon: <Wand2 className="mr-3 h-5 w-5" /> },
    { title: "AI Image Generator", href: "/ai-image-generator", icon: <Image className="mr-3 h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <LineChart className="mr-3 h-5 w-5" /> },
    { title: "Google Ads", href: "/google-ads", icon: <BadgePercent className="mr-3 h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar toggle button */}
      <button
        type="button"
        className="fixed top-4 right-4 z-50 rounded-md p-2 text-gray-500 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">MarketingAI Hub</h1>
          </div>

          {/* Navigation items */}
          <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href));
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                      isActive 
                        ? "text-white bg-primary" 
                        : "text-gray-medium hover:text-primary"
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* Integrations section */}
            <div className="pt-5">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Integrations
                </h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 flex items-center">
                      <SiGoogleanalytics className="mr-1" /> Google Analytics
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 flex items-center">
                      <SiGoogleads className="mr-1" /> Google Ads
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 mr-2 bg-gray-300 rounded-full"></span>
                    <span className="text-sm text-gray-600">Facebook Ads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {!isUserLoading && user?.name ? user.name.charAt(0) : "U"}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {isUserLoading ? "Loading..." : user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {isUserLoading ? "" : user?.role || "Marketing Professional"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
