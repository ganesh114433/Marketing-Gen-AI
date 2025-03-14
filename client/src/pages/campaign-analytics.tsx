import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../App";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const CampaignAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [campaign, setCampaign] = useState("all");
  
  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ["/api/metrics", { userId: currentUser.id }],
  });
  
  // Process data for overview metrics
  const calculateOverviewMetrics = () => {
    if (!metricsData || !Array.isArray(metricsData)) {
      return {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
        adSpend: 0,
      };
    }
    
    // Filter by selected campaign if needed
    const filteredData = campaign === "all" 
      ? metricsData 
      : metricsData.filter((metric: any) => metric.campaignName === campaign);
    
    // Calculate totals
    const totals = filteredData.reduce((acc: any, metric: any) => {
      acc.impressions += metric.impressions;
      acc.clicks += metric.clicks;
      acc.conversions += metric.conversions;
      acc.adSpend += metric.adSpend;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, adSpend: 0 });
    
    // Calculate rates
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
    
    return {
      ...totals,
      ctr,
      conversionRate,
      // Convert adSpend from cents to dollars
      adSpend: totals.adSpend / 100,
    };
  };
  
  // Process data for charts
  const processChartData = () => {
    if (!metricsData || !Array.isArray(metricsData)) return [];
    
    // Filter by selected campaign if needed
    const filteredData = campaign === "all" 
      ? metricsData 
      : metricsData.filter((metric: any) => metric.campaignName === campaign);
    
    // Sort by date and limit to selected time range
    return filteredData
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-parseInt(timeRange))
      .map((metric: any) => ({
        date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
        adSpend: metric.adSpend / 100, // Convert cents to dollars
        ctr: metric.impressions > 0 ? (metric.clicks / metric.impressions) * 100 : 0,
        conversionRate: metric.clicks > 0 ? (metric.conversions / metric.clicks) * 100 : 0,
      }));
  };
  
  // Extract unique campaign names for filter
  const getCampaignOptions = () => {
    if (!metricsData || !Array.isArray(metricsData)) return [];
    
    const uniqueCampaigns = new Set(metricsData.map((metric: any) => metric.campaignName));
    return Array.from(uniqueCampaigns);
  };
  
  // Prepare source data for pie chart
  const getSourceData = () => {
    if (!metricsData || !Array.isArray(metricsData)) return [];
    
    // Filter by selected campaign if needed
    const filteredData = campaign === "all" 
      ? metricsData 
      : metricsData.filter((metric: any) => metric.campaignName === campaign);
    
    const sourceMap = filteredData.reduce((acc: any, metric: any) => {
      if (!acc[metric.source]) {
        acc[metric.source] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          adSpend: 0,
        };
      }
      
      acc[metric.source].impressions += metric.impressions;
      acc[metric.source].clicks += metric.clicks;
      acc[metric.source].conversions += metric.conversions;
      acc[metric.source].adSpend += metric.adSpend;
      
      return acc;
    }, {});
    
    return Object.entries(sourceMap).map(([source, data]: [string, any]) => ({
      name: source === "google_ads" ? "Google Ads" : 
            source === "facebook" ? "Facebook" :
            source === "instagram" ? "Instagram" : source,
      value: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      adSpend: data.adSpend / 100,
    }));
  };
  
  const overviewMetrics = calculateOverviewMetrics();
  const chartData = processChartData();
  const campaignOptions = getCampaignOptions();
  const sourceData = getSourceData();
  
  const COLORS = ['#4F46E5', '#0EA5E9', '#F59E0B', '#10B981'];
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error loading campaign metrics: {error.message}</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold font-heading">Campaign Analytics</h1>
        
        <div className="flex flex-wrap gap-3">
          <Select value={campaign} onValueChange={setCampaign}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaignOptions.map((camp: string) => (
                <SelectItem key={camp} value={camp}>
                  {camp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Overview metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Impressions</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {overviewMetrics.impressions.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                <i className="ri-eye-line text-primary"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Clicks</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {overviewMetrics.clicks.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center">
                <i className="ri-cursor-line text-secondary"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Conversions</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {overviewMetrics.conversions.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                <i className="ri-check-double-line text-success"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">CTR</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {overviewMetrics.ctr.toFixed(2)}%
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                <i className="ri-percentage-line text-accent"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {overviewMetrics.conversionRate.toFixed(2)}%
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                <i className="ri-exchange-funds-line text-primary"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Ad Spend</p>
                <h3 className="text-2xl font-semibold mt-1">
                  ${overviewMetrics.adSpend.toFixed(2)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-secondary"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="performance">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="spend">Ad Spend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="impressions" 
                      stackId="1"
                      stroke="#4F46E5" 
                      fill="#4F46E5" 
                      fillOpacity={0.2} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stackId="2"
                      stroke="#0EA5E9" 
                      fill="#0EA5E9" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversions" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#10B981" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="#F59E0B" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value.toLocaleString()}`, props.payload.name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="spend" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Ad Spend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ad Spend']} />
                    <Legend />
                    <Bar dataKey="adSpend" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignAnalytics;
