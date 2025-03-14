import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../App";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const GoogleAnalytics = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Fetch integration status
  const { data: integrations = [] } = useQuery({
    queryKey: ["/api/integrations", { userId: currentUser.id }],
  });
  
  // Find Google Analytics integration
  const googleAnalyticsIntegration = Array.isArray(integrations) 
    ? integrations.find((i: any) => i.service === 'google_analytics') 
    : undefined;
  
  const isConnected = googleAnalyticsIntegration && googleAnalyticsIntegration.status === 'connected';
  
  // Fetch Google Analytics data if connected
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["/api/google/analytics", { userId: currentUser.id }],
    enabled: isConnected,
  });
  
  // Connect to Google Analytics
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/auth/google/google_analytics`);
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Error connecting to Google Analytics:', error);
      setIsConnecting(false);
    }
  };
  
  if (!isConnected) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Connect to Google Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
              <i className="ri-bar-chart-box-line text-3xl text-blue-500"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Google Analytics Integration</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Connect your Google Analytics account to gain insights into your website traffic, user behavior, and campaign performance.
            </p>
          </div>
          
          <div className="grid gap-6 w-full max-w-md">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-success" /> What you'll get:</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>User engagement metrics and trends</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Traffic source analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Content performance insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Campaign attribution data</span>
                </li>
              </ul>
            </div>
            
            <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center">
              <i className="ri-bar-chart-box-line mr-2"></i>
              {isConnecting ? 'Connecting...' : 'Connect Google Analytics'}
            </Button>
            
            <p className="text-xs text-slate-500 text-center">
              By connecting, you allow MarketingAI to access your Google Analytics data. You can disconnect at any time.
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
          <p>Error loading Google Analytics data: {error.message}</p>
        </div>
        <p className="text-slate-600 mb-4">
          This could be due to expired credentials or limited access. Please try reconnecting your account.
        </p>
        <Button onClick={handleConnect}>Reconnect Google Analytics</Button>
      </Card>
    );
  }
  
  // Extract data
  const { visitors, pageviews, sessions, bounceRate, avgSessionDuration, topPages, trafficSources } = analyticsData || {};
  
  // Prepare source data for pie chart
  const trafficSourceData = trafficSources?.map((source: any) => ({
    name: source.source.charAt(0).toUpperCase() + source.source.slice(1),
    value: source.sessions,
  })) || [];
  
  // Prepare top pages data for bar chart
  const topPagesData = topPages?.map((page: any) => ({
    name: page.path === '/' ? 'Home' : page.path.replace(/^\/|\/$/g, ''),
    views: page.views,
  })) || [];
  
  const COLORS = ['#4F46E5', '#0EA5E9', '#F59E0B', '#10B981'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold font-heading">Google Analytics</h1>
        <Button variant="outline" size="sm" className="flex items-center">
          <ExternalLink className="h-4 w-4 mr-1" />
          Open Analytics
        </Button>
      </div>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Visitors</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {visitors?.total?.toLocaleString() || 0}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                  <span>New: {visitors?.newUsers?.toLocaleString() || 0}</span>
                  <span>Returning: {visitors?.returningUsers?.toLocaleString() || 0}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="ri-user-line text-blue-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Page Views</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {pageviews?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="ri-file-list-line text-blue-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Sessions</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {sessions?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="ri-focus-3-line text-blue-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Bounce Rate</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {bounceRate?.toFixed(1) || 0}%
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Avg. Session: {formatTime(avgSessionDuration || 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="ri-time-line text-blue-500"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed analytics */}
      <Tabs defaultValue="traffic">
        <TabsList className="mb-4">
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traffic" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Source Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value.toLocaleString()} sessions`, props.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Referring Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources?.map((source: any, index: number) => {
                    const percentage = (source.sessions / sessions) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{source.source}</span>
                          <span className="text-sm text-slate-500">{source.sessions.toLocaleString()} sessions</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPagesData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="name" type="category" scale="band" stroke="#64748b" fontSize={12} />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Page Views']} />
                    <Bar dataKey="views" fill="#4F46E5" barSize={20} />
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

// Helper function to format time in seconds to minutes and seconds
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export default GoogleAnalytics;
