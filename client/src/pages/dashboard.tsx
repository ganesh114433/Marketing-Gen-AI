import React from "react";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../App";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import CampaignPerformance from "../components/dashboard/CampaignPerformance";
import ContentCalendar from "../components/dashboard/ContentCalendar";
import RecentContent from "../components/dashboard/RecentContent";
import IntegrationStatus from "../components/dashboard/IntegrationStatus";
import GenerationShortcuts from "../components/dashboard/GenerationShortcuts";

const Dashboard = () => {
  const userId = currentUser.id;

  return (
    <div className="space-y-6">
      {/* Dashboard summary cards */}
      <DashboardSummary userId={userId} />

      {/* Main dashboard sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Campaign performance chart */}
        <CampaignPerformance userId={userId} />
        
        {/* Upcoming content calendar */}
        <ContentCalendar userId={userId} />
      </div>
      
      {/* Additional dashboard sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent content generations */}
        <RecentContent userId={userId} />
        
        {/* Integration status */}
        <IntegrationStatus userId={userId} />
        
        {/* Content generation shortcuts */}
        <GenerationShortcuts />
      </div>
    </div>
  );
};

export default Dashboard;
