import { Card, CardContent } from "@/components/ui/card";
import MetricCards from "@/components/dashboard/MetricCards";
import CampaignPerformanceChart from "@/components/dashboard/CampaignPerformanceChart";
import UpcomingContentList from "@/components/dashboard/UpcomingContentList";
import AIContentGenerator from "@/components/dashboard/AIContentGenerator";
import CalendarEvents from "@/components/dashboard/CalendarEvents";
import AIImageGenerator from "@/components/dashboard/AIImageGenerator";

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h2>
            <p className="mt-1 text-gray-500 text-sm">Overview of your marketing performance and upcoming content</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <i className="ri-add-line mr-2"></i>
              Create Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Overview metrics */}
      <MetricCards />

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign performance chart */}
          <CampaignPerformanceChart />

          {/* Upcoming Content */}
          <UpcomingContentList />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Content Generator */}
          <AIContentGenerator />

          {/* Calendar Events */}
          <CalendarEvents />

          {/* AI Image Generator */}
          <AIImageGenerator />
        </div>
      </div>
    </div>
  );
}
