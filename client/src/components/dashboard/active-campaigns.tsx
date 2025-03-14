import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign } from "lucide-react";
import { getCampaigns } from "@/lib/api";
import { formatDate, formatPercentage } from "@/lib/utils";

interface Campaign {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  status: string;
  platform: string;
  metrics?: {
    roas?: number;
    ctr?: number;
    conversionRate?: number;
    progress?: number;
    estReach?: number;
    contentCount?: number;
  };
}

export default function ActiveCampaigns() {
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['/api/campaigns', 1], // Assuming user ID 1 for demo
    queryFn: () => getCampaigns(1),
  });

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'google_ads':
        return 'from-indigo-500 to-purple-600';
      case 'social_media':
        return 'from-green-500 to-emerald-600';
      case 'email':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'google_ads':
        return 'Google Ads';
      case 'social_media':
        return 'Social Media';
      case 'email':
        return 'Email';
      default:
        return platform;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-amber-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getProgressColor = (platform: string) => {
    switch (platform) {
      case 'google_ads':
        return 'bg-primary';
      case 'social_media':
        return 'bg-emerald-500';
      case 'email':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">Active Campaigns</CardTitle>
          <Button>Create Campaign</Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading campaigns...</div>
        ) : campaignsData?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active campaigns found</p>
            <Button className="mt-4">Create your first campaign</Button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaignsData?.map((campaign: Campaign) => (
              <div 
                key={campaign.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div className={`h-32 bg-gradient-to-r ${getPlatformColor(campaign.platform)} p-4`}>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-white bg-opacity-20 rounded-md">
                      {getPlatformLabel(campaign.platform)}
                    </span>
                    <div className={`px-2 py-1 text-xs font-semibold text-white ${getStatusColor(campaign.status)} rounded-md`}>
                      {getStatusLabel(campaign.status)}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                    </div>
                    {campaign.budget && (
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Budget: ${campaign.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {campaign.status === 'scheduled' ? 'Content Ready' : 'Progress'}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPercentage(campaign.metrics?.progress || 0, 0)}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getProgressColor(campaign.platform)} h-2 rounded-full`} 
                        style={{ width: `${campaign.metrics?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    {campaign.status === 'active' ? (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Performance</div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.metrics?.roas ? `${campaign.metrics.roas}x ROAS` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">CTR</div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.metrics?.ctr ? `${campaign.metrics.ctr}%` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Conv. Rate</div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.metrics?.conversionRate ? `${campaign.metrics.conversionRate}%` : '-'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Est. Reach</div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.metrics?.estReach ? `${(campaign.metrics.estReach / 1000).toFixed(0)}K` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Content</div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.metrics?.contentCount ? `${campaign.metrics.contentCount} items` : '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <div className="text-sm font-medium text-gray-900">
                            {getStatusLabel(campaign.status)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
