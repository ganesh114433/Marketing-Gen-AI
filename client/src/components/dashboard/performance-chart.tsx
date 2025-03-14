import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ChartData {
  name: string;
  Impressions: number;
  Clicks: number;
  Conversions: number;
}

interface PerformanceChartProps {
  data?: ChartData[];
  isLoading?: boolean;
}

export default function PerformanceChart({ data, isLoading = false }: PerformanceChartProps) {
  const [activeMetric, setActiveMetric] = useState<"Impressions" | "Clicks" | "Conversions">("Impressions");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Generate sample data if none provided
  useEffect(() => {
    if (!isLoading && !data) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const sampleData = days.map(day => ({
        name: day,
        Impressions: Math.floor(Math.random() * 1000) + 500,
        Clicks: Math.floor(Math.random() * 200) + 50,
        Conversions: Math.floor(Math.random() * 50) + 10
      }));
      setChartData(sampleData);
    } else if (data) {
      setChartData(data);
    }
  }, [data, isLoading]);

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            Campaign Performance
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={activeMetric === "Impressions" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveMetric("Impressions")}
              className="text-xs"
            >
              Impressions
            </Button>
            <Button 
              variant={activeMetric === "Clicks" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveMetric("Clicks")}
              className="text-xs"
            >
              Clicks
            </Button>
            <Button 
              variant={activeMetric === "Conversions" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveMetric("Conversions")}
              className="text-xs"
            >
              Conversions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-[300px] w-full mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={activeMetric} 
                  fill="hsl(238, 77%, 59%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
