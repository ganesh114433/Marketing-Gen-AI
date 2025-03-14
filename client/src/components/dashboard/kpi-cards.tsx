import { useState, useEffect } from "react";
import { Eye, MousePointer, ShoppingCart, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatCurrency } from "@/lib/utils";

type KpiMetric = {
  value: number;
  change: number;
};

type KpiData = {
  impressions: KpiMetric;
  clicks: KpiMetric;
  conversions: KpiMetric;
  revenue: KpiMetric;
};

interface KpiCardsProps {
  data?: {
    impressions?: number;
    impressionsChange?: number;
    clicks?: number;
    clicksChange?: number;
    conversions?: number;
    conversionsChange?: number;
    revenue?: number;
    revenueChange?: number;
  };
  isLoading?: boolean;
}

export default function KpiCards({ data, isLoading = false }: KpiCardsProps) {
  const [metrics, setMetrics] = useState<KpiData>({
    impressions: { value: 0, change: 0 },
    clicks: { value: 0, change: 0 },
    conversions: { value: 0, change: 0 },
    revenue: { value: 0, change: 0 },
  });

  useEffect(() => {
    if (data && !isLoading) {
      setMetrics({
        impressions: { 
          value: data.impressions || 0, 
          change: data.impressionsChange || 0 
        },
        clicks: { 
          value: data.clicks || 0, 
          change: data.clicksChange || 0 
        },
        conversions: { 
          value: data.conversions || 0, 
          change: data.conversionsChange || 0 
        },
        revenue: { 
          value: data.revenue || 0, 
          change: data.revenueChange || 0 
        },
      });
    }
  }, [data, isLoading]);

  const renderChangeIndicator = (change: number) => {
    if (change === 0) return null;
    
    return change > 0 ? (
      <div className="flex items-baseline ml-2 text-sm font-semibold text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="m18 15-6-6-6 6"></path>
        </svg>
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    ) : (
      <div className="flex items-baseline ml-2 text-sm font-semibold text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="m6 9 6 6 6-6"></path>
        </svg>
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Impressions */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 bg-opacity-10 rounded-full">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Impressions</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {isLoading ? "Loading..." : formatNumber(metrics.impressions.value)}
                  </div>
                  {!isLoading && renderChangeIndicator(metrics.impressions.change)}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clicks */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-500 bg-opacity-10 rounded-full">
              <MousePointer className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Clicks</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {isLoading ? "Loading..." : formatNumber(metrics.clicks.value)}
                  </div>
                  {!isLoading && renderChangeIndicator(metrics.clicks.change)}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversions */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-amber-500 bg-opacity-10 rounded-full">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Conversions</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {isLoading ? "Loading..." : formatNumber(metrics.conversions.value)}
                  </div>
                  {!isLoading && renderChangeIndicator(metrics.conversions.change)}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-emerald-500 bg-opacity-10 rounded-full">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Revenue</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {isLoading ? "Loading..." : formatCurrency(metrics.revenue.value)}
                  </div>
                  {!isLoading && renderChangeIndicator(metrics.revenue.change)}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
