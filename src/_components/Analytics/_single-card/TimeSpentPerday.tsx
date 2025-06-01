import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import { TimeRange } from "@/services/analytics.service";

// Helper function to format decimal hours to "Xh Ym" format
const formatTimeDisplay = (decimalHours: number): string => {
  if (decimalHours === 0) return "0h";
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

// Custom Y-axis tick formatter
const formatYAxisTick = (value: number): string => {
  const hours = Math.floor(value);
  if (value === hours) {
    return `${hours}h`;
  }
  return formatTimeDisplay(value);
};

// Custom tooltip formatter
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timeValue = payload[0].value;
    return (
      <div className="bg-background border border-border rounded-md p-2 shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">
          Time: {formatTimeDisplay(timeValue)}
        </p>
      </div>
    );
  }
  return null;
};

export function TimeSpentPerday({
  selectedCard,
  cardTimeData,
  timeRange,
  isLoading = false,
}: {
  selectedCard: string;
  cardTimeData: any;
  timeRange: TimeRange;
  isLoading?: boolean;
}) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-sm">
            Time Spent - {timeRange === 'day' ? 'Hourly' : timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Per Period' : 'Monthly'} View
          </CardTitle>
          <CardDescription className="text-xs">
            {timeRange === 'day' ? 'Hourly breakdown' : timeRange === 'week' ? 'Daily hours' : timeRange === 'month' ? '5-day periods' : 'Monthly hours'} spent on {selectedCard}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cardTimeData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" tick={{ fontSize: 12, fontWeight: 500 }} />
              <YAxis
                label={{
                  value: "Time",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fontWeight: 500 },
                }}
                tick={{ fontSize: 12, fontWeight: 500 }}
                tickFormatter={formatYAxisTick}
              />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <Tooltip 
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="time"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTime)"
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          <Info className="h-3 w-3 inline mr-1" />
          Peak time was on Thursday (4h), 84% higher than average
        </p>
      </CardFooter>
    </Card>
  );
}
