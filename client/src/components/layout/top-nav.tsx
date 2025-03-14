import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TopNav() {
  const [location] = useLocation();
  const [dateRange, setDateRange] = useState("last30Days");

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/content-calendar": "Content Calendar",
    "/ai-content-generator": "AI Content Generator",
    "/ai-image-generator": "AI Image Generator",
    "/analytics": "Analytics",
    "/google-ads": "Google Ads",
    "/settings": "Settings",
  };

  const pageTitle = pageTitles[location] || "Page Not Found";

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <div className="flex space-x-3">
            {/* Only show on Dashboard */}
            {location === "/" && (
              <>
                <Button variant="default" className="hidden sm:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M10.5 20.5 3 13l7.5-7.5"></path>
                    <path d="m20.5 13-7.5 7.5"></path>
                    <path d="M9.17 4.51 3 13l6.17 8.49"></path>
                    <path d="M21 13H3"></path>
                  </svg>
                  Generate Content
                </Button>
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-[180px] bg-white border border-gray-200 shadow-sm">
                    <SelectValue placeholder="Select Date Range">
                      {dateRange === "last30Days" && "Last 30 Days"}
                      {dateRange === "last7Days" && "Last 7 Days"}
                      {dateRange === "lastMonth" && "Last Month"}
                      {dateRange === "lastQuarter" && "Last Quarter"}
                      {dateRange === "lastYear" && "Last Year"}
                      {dateRange === "custom" && "Custom Range"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last30Days">Last 30 Days</SelectItem>
                    <SelectItem value="last7Days">Last 7 Days</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                    <SelectItem value="lastYear">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Content generator button */}
            {(location === "/content-calendar" || location === "/ai-content-generator") && (
              <Button variant="default">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M10.5 20.5 3 13l7.5-7.5"></path>
                  <path d="m20.5 13-7.5 7.5"></path>
                  <path d="M9.17 4.51 3 13l6.17 8.49"></path>
                  <path d="M21 13H3"></path>
                </svg>
                Generate Content
              </Button>
            )}

            {/* Image generator button */}
            {location === "/ai-image-generator" && (
              <Button variant="default">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M15 8h.01"></path>
                  <rect width="16" height="16" x="4" y="4" rx="3"></rect>
                  <path d="m4 15 4-4 12 12"></path>
                  <path d="m14 14 1-1 5 5"></path>
                </svg>
                Generate Image
              </Button>
            )}

            {/* Campaign button */}
            {(location === "/google-ads" || location === "/analytics") && (
              <Button variant="default">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
