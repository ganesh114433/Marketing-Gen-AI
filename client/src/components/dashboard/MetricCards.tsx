import { useQuery } from "@tanstack/react-query";

interface MetricCardProps {
  title: string;
  value: string;
  previousValue: string;
  percentChange: number;
  progressValue: number;
  colorClass: string;
}

function MetricCard({ 
  title, 
  value, 
  previousValue, 
  percentChange, 
  progressValue, 
  colorClass 
}: MetricCardProps) {
  const isPositive = percentChange >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span 
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <i className={`${isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
          {Math.abs(percentChange)}%
        </span>
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="ml-2 text-sm text-gray-500">from {previousValue}</p>
      </div>
      <div className="mt-4 h-10">
        <div className="relative h-1 w-full bg-gray-200 rounded-full">
          <div 
            className={`absolute h-1 ${colorClass} rounded-full`} 
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function MetricCards() {
  // In a real app, this would fetch from your API
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/seed'],
    queryFn: async () => {
      const response = await fetch('/api/seed', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to seed data');
      }
      
      // Return some sample metrics after seeding
      return {
        impressions: { 
          current: '1.2M', 
          previous: '1.1M', 
          change: 12, 
          progress: 78 
        },
        clicks: { 
          current: '85.4K', 
          previous: '79.2K', 
          change: 8, 
          progress: 65 
        },
        conversions: { 
          current: '3.2K', 
          previous: '3.3K', 
          change: -3, 
          progress: 42 
        },
        revenue: { 
          current: '$42.5K', 
          previous: '$37K', 
          change: 15, 
          progress: 85 
        }
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard 
        title="Impressions" 
        value={metrics?.impressions.current || '0'} 
        previousValue={metrics?.impressions.previous || '0'} 
        percentChange={metrics?.impressions.change || 0} 
        progressValue={metrics?.impressions.progress || 0} 
        colorClass="bg-primary-500"
      />
      <MetricCard 
        title="Clicks" 
        value={metrics?.clicks.current || '0'} 
        previousValue={metrics?.clicks.previous || '0'} 
        percentChange={metrics?.clicks.change || 0} 
        progressValue={metrics?.clicks.progress || 0} 
        colorClass="bg-secondary-500"
      />
      <MetricCard 
        title="Conversions" 
        value={metrics?.conversions.current || '0'} 
        previousValue={metrics?.conversions.previous || '0'} 
        percentChange={metrics?.conversions.change || 0} 
        progressValue={metrics?.conversions.progress || 0} 
        colorClass="bg-accent-500"
      />
      <MetricCard 
        title="Revenue" 
        value={metrics?.revenue.current || '0'} 
        previousValue={metrics?.revenue.previous || '0'} 
        percentChange={metrics?.revenue.change || 0} 
        progressValue={metrics?.revenue.progress || 0} 
        colorClass="bg-primary-600"
      />
    </div>
  );
}
