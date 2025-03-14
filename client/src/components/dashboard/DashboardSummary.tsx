import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../../App";

interface Metric {
  value: string | number;
  change?: string;
  recent?: number;
  nextIn?: string;
}

interface DashboardSummaryProps {
  userId: number;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/summary", { userId }],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-5 mb-6 text-red-600">
        <p>Error loading dashboard data: {error.message}</p>
      </Card>
    );
  }

  const metrics = data?.metrics || {
    campaignPerformance: { value: "0", change: "0%" },
    contentCount: { value: 0, recent: 0 },
    adSpend: { value: "0", change: "0%" },
    scheduledPosts: { value: 0, nextIn: "N/A" },
  };

  const metricConfigs = [
    {
      title: "Campaign Performance",
      value: metrics.campaignPerformance.value + "%",
      badge: metrics.campaignPerformance.change,
      badgeColor: "bg-success bg-opacity-10 text-success",
      footer: "vs last month",
      icon: "ri-arrow-up-line text-success ml-1",
    },
    {
      title: "Content Created",
      value: metrics.contentCount.value,
      badge: `+${metrics.contentCount.recent} Today`,
      badgeColor: "bg-primary bg-opacity-10 text-primary",
      footer: "This month",
    },
    {
      title: "Ad Spend",
      value: `$${metrics.adSpend.value}`,
      badge: metrics.adSpend.change,
      badgeColor: "bg-danger bg-opacity-10 text-danger",
      footer: "vs budget",
      icon: "ri-arrow-up-line text-danger ml-1",
    },
    {
      title: "Scheduled Posts",
      value: metrics.scheduledPosts.value,
      badge: `Next: ${metrics.scheduledPosts.nextIn}`,
      badgeColor: "bg-warning bg-opacity-10 text-warning",
      footer: "Upcoming",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricConfigs.map((metric, index) => (
        <Card key={index} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-500">{metric.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${metric.badgeColor}`}>
              {metric.badge}
            </span>
          </div>
          <p className="text-2xl font-semibold mb-1">{metric.value}</p>
          <div className="flex items-center text-xs text-slate-500">
            <span>{metric.footer}</span>
            {metric.icon && <i className={metric.icon}></i>}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummary;
