import { Card, CardTitle, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Info, Lightbulb, ArrowUpRight, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PerformanceInsightsProps {
  insights?: string[];
  recommendations?: string[];
  teamStats?: {
    teamEfficiency: number;
    teamEfficiencyTrend: number;
  };
  isLoading?: boolean;
}

export const PerformanceInsights = ({ 
  insights = [], 
  recommendations = [], 
  teamStats,
  isLoading = false 
}: PerformanceInsightsProps) => {
  // Debug logging
  console.log('PerformanceInsights props:', { insights, recommendations, teamStats, isLoading });
  
  return (
    <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">Performance Insights</CardTitle>
      <CardDescription className="text-xs">
        Team efficiency analysis and recommendations
      </CardDescription>
    </CardHeader>
    <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
              <h3 className="text-xs font-medium">AI-Powered Insights</h3>
          <ul className="space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5 dark:bg-blue-900 dark:text-blue-300">
                <Info className="h-2 w-2" />
              </span>
                    <span className="text-xs leading-relaxed">{insight}</span>
            </li>
                ))}
                {insights.length === 0 && (
                  <li className="text-xs text-muted-foreground">No insights available yet</li>
                )}
          </ul>
        </div>

        <div className="space-y-3">
              <h3 className="text-xs font-medium">Smart Recommendations</h3>
          <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 dark:bg-green-900 dark:text-green-300">
                <Lightbulb className="h-2 w-2" />
              </span>
                    <span className="text-xs leading-relaxed">{recommendation}</span>
            </li>
                ))}
                {recommendations.length === 0 && (
                  <li className="text-xs text-muted-foreground">No recommendations available yet</li>
                )}
          </ul>
        </div>
      </div>
        )}

              {teamStats && (
      <div className="mt-4 pt-4 border-t border-border">
        <h3 className="text-xs font-medium mb-2">Efficiency Trend</h3>
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <div className="font-medium">
                  Current Period:{" "}
                  <span className={teamStats.teamEfficiency > 80 ? "text-green-500" : teamStats.teamEfficiency > 60 ? "text-yellow-500" : "text-red-500"}>
                    {teamStats.teamEfficiency}%
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Trend: {teamStats.teamEfficiencyTrend > 0 ? '+' : ''}{teamStats.teamEfficiencyTrend}%
            </div>
          </div>
          <div>
            <Badge
              variant="outline"
                  className={`text-[10px] ${
                    teamStats.teamEfficiencyTrend > 0 
                      ? "bg-green-50 text-green-600 border-green-200" 
                      : teamStats.teamEfficiencyTrend < 0
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {teamStats.teamEfficiencyTrend > 0 ? (
              <ArrowUpRight className="h-2 w-2 mr-1" />
                  ) : teamStats.teamEfficiencyTrend < 0 ? (
                    <ArrowUpRight className="h-2 w-2 mr-1 rotate-180" />
                  ) : null}
                  {teamStats.teamEfficiencyTrend > 0 ? "Improving" : teamStats.teamEfficiencyTrend < 0 ? "Declining" : "Stable"}
            </Badge>
          </div>
        </div>
      </div>
        )}
    </CardContent>
    <CardFooter>
      <p className="text-xs text-muted-foreground">
        <Target className="h-3 w-3 inline mr-1" />
        Team is on track to meet quarterly objectives with current
        performance
      </p>
    </CardFooter>
  </Card>
  );
};