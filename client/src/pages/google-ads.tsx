import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../App";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const GoogleAds = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Fetch integration status
  const { data: integrations = [] } = useQuery({
    queryKey: ["/api/integrations", { userId: currentUser.id }],
  });
  
  // Find Google Ads integration
  const googleAdsIntegration = Array.isArray(integrations) 
    ? integrations.find((i: any) => i.service === 'google_ads') 
    : undefined;
  
  const isConnected = googleAdsIntegration && googleAdsIntegration.status === 'connected';
  
  // Fetch Google Ads data if connected
  const { data: adsData, isLoading, error } = useQuery({
    queryKey: ["/api/google/ads", { userId: currentUser.id }],
    enabled: isConnected,
  });
  
  // Connect to Google Ads
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/auth/google/google_ads`);
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Error connecting to Google Ads:', error);
      setIsConnecting(false);
    }
  };
  
  if (!isConnected) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Connect to Google Ads</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <i className="ri-google-line text-3xl text-red-500"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Google Ads Integration</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Connect your Google Ads account to view campaign performance, track conversions, and manage your ad spend all in one place.
            </p>
          </div>
          
          <div className="grid gap-6 w-full max-w-md">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-success" /> What you'll get:</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Real-time campaign performance metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Click and conversion tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Ad spend optimization recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Automated reporting and insights</span>
                </li>
              </ul>
            </div>
            
            <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center">
              <i className="ri-google-line mr-2"></i>
              {isConnecting ? 'Connecting...' : 'Connect Google Ads'}
            </Button>
            
            <p className="text-xs text-slate-500 text-center">
              By connecting, you allow MarketingAI to access your Google Ads data. You can disconnect at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>Error loading Google Ads data: {error.message}</p>
        </div>
        <p className="text-slate-600 mb-4">
          This could be due to expired credentials or limited access. Please try reconnecting your account.
        </p>
        <Button onClick={handleConnect}>Reconnect Google Ads</Button>
      </Card>
    );
  }
  
  // Process campaigns data
  const campaigns = adsData?.campaigns || [];
  const metrics = adsData?.metrics || { totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalCost: 0 };
  
  // Prepare campaign performance data for chart
  const campaignPerformanceData = campaigns.map((campaign: any) => ({
    name: campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    conversions: campaign.conversions,
    cost: campaign.cost,
    ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold font-heading">Google Ads</h1>
        <Button variant="outline" size="sm" className="flex items-center">
          <ExternalLink className="h-4 w-4 mr-1" />
          Open Google Ads
        </Button>
      </div>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Impressions</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics.totalImpressions.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <i className="ri-eye-line text-red-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Clicks</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics.totalClicks.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <i className="ri-cursor-line text-red-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Conversions</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics.totalConversions.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <i className="ri-check-double-line text-red-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Cost</p>
                <h3 className="text-2xl font-semibold mt-1">
                  ${metrics.totalCost.toFixed(2)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-red-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Campaign data */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={campaignPerformanceData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill="#4F46E5" />
                    <Bar dataKey="clicks" fill="#0EA5E9" />
                    <Bar dataKey="conversions" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Campaign</th>
                      <th className="text-center py-3 px-4 font-medium text-slate-500">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Impressions</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Clicks</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">CTR</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Conversions</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign: any, index: number) => {
                      const ctr = campaign.impressions > 0 
                        ? (campaign.clicks / campaign.impressions) * 100 
                        : 0;
                      
                      return (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{campaign.name}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              campaign.status === 'ENABLED' 
                                ? 'bg-success bg-opacity-10 text-success' 
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{campaign.impressions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{campaign.clicks.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{ctr.toFixed(2)}%</td>
                          <td className="py-3 px-4 text-right">{campaign.conversions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">${campaign.cost.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleAds;
