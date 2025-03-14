import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../../App";
import { Download, ArrowDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface CampaignPerformanceProps {
  userId: number;
}

const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({ userId }) => {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/metrics", { userId }],
  });

  // Process data for chart
  const processDataForChart = () => {
    if (!data || !Array.isArray(data)) return [];
    
    // Group by date
    const groupedByDate = data.reduce((acc, metric) => {
      const date = new Date(metric.date);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!acc[dateString]) {
        acc[dateString] = {
          date: dateString,
          impressions: 0,
          clicks: 0,
          conversions: 0,
        };
      }
      
      acc[dateString].impressions += metric.impressions;
      acc[dateString].clicks += metric.clicks;
      acc[dateString].conversions += metric.conversions;
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-parseInt(timeRange)); // Get only the last N days
  };

  const chartData = processDataForChart();
  
  if (isLoading) {
    return (
      <Card className="p-5 xl:col-span-2 animate-pulse h-80">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-slate-100 rounded"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-5 xl:col-span-2">
        <p className="text-red-600">Error loading campaign performance data: {error.message}</p>
      </Card>
    );
  }

  return (
    <Card className="xl:col-span-2">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg font-heading">Campaign Performance</h3>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-9 bg-slate-100 rounded-lg text-sm w-36">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" className="bg-slate-100 border-none h-9 w-9">
              <Download className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="impressions" stroke="#4F46E5" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#0EA5E9" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex space-x-6 mt-4 justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-slate-600">Impressions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-sm text-slate-600">Clicks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-sm text-slate-600">Conversions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignPerformance;
