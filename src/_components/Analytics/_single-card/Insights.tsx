import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsProps {
  insights: string[]; // AI-generated insights array
  timeRange?: string;
  isLoading?: boolean;
}

export const Insights = ({ insights, isLoading = false }: InsightsProps) => {
  const currentInsights = insights || [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Insights
        </CardTitle>
        <CardDescription className="text-xs">AI-powered work pattern analysis</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ul className="space-y-2">
            {currentInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5 dark:bg-blue-900 dark:text-blue-300">
                  <Info className="h-2 w-2" />
                </span>
                <span className="text-xs leading-relaxed">{insight}</span>
              </li>
            ))}
            {currentInsights.length === 0 && (
              <li className="text-xs text-muted-foreground">No insights available for this time period</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

