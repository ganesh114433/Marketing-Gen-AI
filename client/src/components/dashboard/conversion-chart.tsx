import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { formatPercentage } from "@/lib/utils";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

interface ConversionData {
  name: string;
  value: number;
  rate: number;
}

interface ConversionChartProps {
  data?: ConversionData[];
  avgRate?: number;
  isLoading?: boolean;
}

export default function ConversionChart({ data, avgRate = 0, isLoading = false }: ConversionChartProps) {
  // Default data if none provided
  const chartData = data || [
    { name: 'Search', value: 2.8, rate: 2.8 },
    { name: 'Social', value: 5.3, rate: 5.3 },
    { name: 'Email', value: 6.5, rate: 6.5 },
    { name: 'Direct', value: 3.2, rate: 3.2 },
  ];

  // Calculate average if not provided
  const calculatedAvgRate = avgRate || 
    chartData.reduce((sum, item) => sum + item.rate, 0) / chartData.length;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(238, 77%, 59%)"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            Conversion Rate by Channel
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="relative h-[300px] w-full mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                <div className="text-2xl font-bold text-gray-900">{formatPercentage(calculatedAvgRate)}</div>
                <div className="text-xs text-gray-500">Avg. Rate</div>
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value, entry, index) => {
                      return (
                        <span className="text-gray-600">
                          {value} ({formatPercentage(chartData[index].rate)})
                        </span>
                      );
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Conversion Rate']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
