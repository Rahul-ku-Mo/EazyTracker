import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationsProps {
  recommendations: string[]; // AI-generated recommendations array
  timeRange: string;
  isLoading?: boolean;
}

export const Recommendations = ({ recommendations, isLoading = false }: RecommendationsProps) => {
  const currentRecs = recommendations || [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Recommendations
        </CardTitle>
        <CardDescription className="text-xs">AI-powered productivity optimization</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
        <ul className="space-y-2">
          {currentRecs.map((rec, index) => (
            <li key={index} className="flex items-start gap-2">
                <span className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 dark:bg-green-900 dark:text-green-300">
                <Lightbulb className="h-2 w-2" />
              </span>
                <span className="text-xs leading-relaxed">{rec}</span>
            </li>
          ))}
          {currentRecs.length === 0 && (
              <li className="text-xs text-muted-foreground">No recommendations available for this time period</li>
          )}
        </ul>
        )}
      </CardContent>
    </Card>
  );
}

