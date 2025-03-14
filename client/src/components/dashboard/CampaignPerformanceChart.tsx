import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartData {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export default function CampaignPerformanceChart() {
  const [timeRange, setTimeRange] = useState<string>('Last 7 days');
  
  const { data, isLoading } = useQuery<ChartData[]>({
    queryKey: ['/api/analytics', 1, timeRange],
    queryFn: async () => {
      // In a real application, this would use the analytics data from API
      // For this demo, we're generating sample data
      return [
        { name: 'Mon', impressions: 120000, clicks: 8000, conversions: 300 },
        { name: 'Tue', impressions: 140000, clicks: 9000, conversions: 400 },
        { name: 'Wed', impressions: 180000, clicks: 11000, conversions: 500 },
        { name: 'Thu', impressions: 160000, clicks: 10000, conversions: 450 },
        { name: 'Fri', impressions: 190000, clicks: 12000, conversions: 600 },
        { name: 'Sat', impressions: 130000, clicks: 7000, conversions: 250 },
        { name: 'Sun', impressions: 100000, clicks: 6000, conversions: 200 }
      ];
    }
  });

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const chartData = data || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Campaign Performance</h2>
            <div className="flex items-center space-x-2">
              <select className="text-sm border-gray-300 rounded-md">
                <option>Last 7 days</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <span className="text-gray-500">Loading chart data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Campaign Performance</h2>
          <div className="flex items-center space-x-2">
            <select 
              className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={timeRange}
              onChange={handleRangeChange}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last quarter</option>
              <option>This year</option>
            </select>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <i className="ri-download-line text-gray-500"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-center mb-4 space-x-8 text-sm">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-primary-500 mr-2"></span>
            <span className="text-gray-600">Impressions</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-secondary-500 mr-2"></span>
            <span className="text-gray-600">Clicks</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-accent-500 mr-2"></span>
            <span className="text-gray-600">Conversions</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="impressions" 
                name="Impressions" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                barSize={8}
              />
              <Bar 
                dataKey="clicks" 
                name="Clicks" 
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]} 
                barSize={8}
              />
              <Bar 
                dataKey="conversions" 
                name="Conversions" 
                fill="hsl(var(--accent))" 
                radius={[4, 4, 0, 0]} 
                barSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
