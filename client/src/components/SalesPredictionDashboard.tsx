
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SalesPredictionDashboard() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['/api/sales/predictions'],
    queryFn: async () => {
      const res = await fetch('/api/sales/predictions');
      return res.json();
    }
  });

  if (isLoading) {
    return <div>Loading predictions...</div>;
  }

  const channelData = predictions?.channelBreakdown 
    ? Object.entries(predictions.channelBreakdown).map(([channel, data]: [string, any]) => ({
        name: channel,
        spend: data.spend,
        predictedRevenue: data.predicted_revenue,
        roas: data.roas
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Predicted Revenue</h3>
          <p className="text-2xl font-bold">${predictions?.predictedRevenue?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Predicted ROAS</h3>
          <p className="text-2xl font-bold">{predictions?.predictedROAS?.toFixed(2)}x</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Marketing Spend</h3>
          <p className="text-2xl font-bold">${predictions?.marketingSpend?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Confidence Score</h3>
          <p className="text-2xl font-bold">{(predictions?.confidenceScore * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Channel Performance Prediction</h3>
        <BarChart width={800} height={400} data={channelData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="spend" fill="#8884d8" name="Spend" />
          <Bar dataKey="predictedRevenue" fill="#82ca9d" name="Predicted Revenue" />
        </BarChart>
      </div>
    </div>
  );
}
