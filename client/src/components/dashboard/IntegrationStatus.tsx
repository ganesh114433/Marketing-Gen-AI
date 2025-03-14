import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "../../App";
import { formatDistanceToNow } from "date-fns";

interface IntegrationStatusProps {
  userId: number;
}

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/integrations", { userId }],
  });

  const getServiceInfo = (service: string) => {
    switch (service) {
      case 'google_ads':
        return {
          icon: "ri-google-line",
          name: "Google Ads",
          bgColor: "bg-red-100",
          textColor: "text-red-500"
        };
      case 'google_analytics':
        return {
          icon: "ri-line-chart-line",
          name: "Google Analytics",
          bgColor: "bg-blue-100",
          textColor: "text-blue-500"
        };
      case 'facebook':
        return {
          icon: "ri-facebook-circle-fill",
          name: "Facebook Ads",
          bgColor: "bg-blue-100",
          textColor: "text-blue-600"
        };
      case 'instagram':
        return {
          icon: "ri-instagram-line",
          name: "Instagram",
          bgColor: "bg-pink-100",
          textColor: "text-pink-600"
        };
      default:
        return {
          icon: "ri-global-line",
          name: service,
          bgColor: "bg-slate-100",
          textColor: "text-slate-500"
        };
    }
  };

  const getLastSyncedText = (integration: any) => {
    if (!integration.lastSynced) return "Not connected";
    return `Last synced: ${formatDistanceToNow(new Date(integration.lastSynced), { addSuffix: true })}`;
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
          </div>
          
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-red-600">Error loading integrations: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Services to display
  const integrationServices = [
    { service: 'google_ads' },
    { service: 'google_analytics' },
    { service: 'facebook' },
    { service: 'instagram' }
  ];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg font-heading">Connected Services</h3>
          <Button variant="link" className="text-primary p-0 h-auto">Manage</Button>
        </div>
        
        <div className="space-y-4">
          {integrationServices.map(service => {
            const serviceInfo = getServiceInfo(service.service);
            const integration = Array.isArray(data) 
              ? data.find(i => i.service === service.service) 
              : undefined;
            
            const isConnected = integration && integration.status === 'connected';
            
            return (
              <div key={service.service} className="p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full ${serviceInfo.bgColor} flex items-center justify-center`}>
                    <i className={`${serviceInfo.icon} ${serviceInfo.textColor} text-xl`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{serviceInfo.name}</h4>
                    <p className="text-xs text-slate-500">
                      {integration ? getLastSyncedText(integration) : "Not connected"}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <span className="inline-flex px-2 py-1 rounded-full bg-success bg-opacity-10 text-success text-xs font-medium">Connected</span>
                ) : (
                  <Button variant="link" className="inline-flex px-2 py-1 rounded-full bg-primary bg-opacity-10 text-primary text-xs font-medium">Connect</Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationStatus;
