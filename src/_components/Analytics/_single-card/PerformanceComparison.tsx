import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertTriangle, TrendingUp, Users, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useCardPerformanceComparison } from "@/hooks/useAnalytics";
import { CardPerformanceComparison as CardPerformanceComparisonType } from "@/services/analytics.service";

interface PerformanceComparisonProps {
  cardId: number;
}

export function PerformanceComparison({ cardId }: PerformanceComparisonProps) {
  const { data: comparisonData, isLoading, error } = useCardPerformanceComparison(cardId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Comparison</CardTitle>
          <CardDescription className="text-xs">Loading comparison data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !comparisonData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Comparison</CardTitle>
          <CardDescription className="text-xs">Error loading comparison data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load performance comparison data'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    timeEfficiency,
    complexity,
    completion,
    assignees,
    similarCardsCount
  } = comparisonData as CardPerformanceComparisonType;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Performance Comparison</CardTitle>
        <CardDescription className="text-xs">Compared to similar complexity tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Time Efficiency */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium">Time Efficiency</span>
              </div>
              <span className="text-xs text-muted-foreground">vs. estimated time</span>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                      timeEfficiency.isUnderBudget 
                        ? "text-green-600 bg-green-100" 
                        : "text-amber-600 bg-amber-100"
                    }`}
                  >
                    {timeEfficiency.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold inline-block ${
                    timeEfficiency.isUnderBudget ? "text-green-600" : "text-amber-600"
                  }`}>
                    {timeEfficiency.efficiencyPercentage}% {timeEfficiency.isUnderBudget ? "under" : "over"} estimate
                  </span>
                </div>
              </div>
              <div
                className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                  timeEfficiency.isUnderBudget ? "bg-green-200" : "bg-amber-200"
                }`}
              >
                <div
                  style={{
                    width: `${timeEfficiency.displayEfficiency}%`,
                  }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    timeEfficiency.isUnderBudget ? "bg-green-500" : "bg-amber-500"
                  }`}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated: {timeEfficiency.estimatedHours}h | Actual: {timeEfficiency.actualHours}h
              </div>
            </div>
          </div>

          {/* Complexity Comparison */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-medium">Complexity</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {complexity.isHigherThanAverage ? "Higher" : "Lower"} than average
              </span>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-100">
                    {complexity.level}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    {complexity.comparisonPercentage}% {complexity.isHigherThanAverage ? "higher" : "lower"}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <div
                  style={{
                    width: `${Math.min((complexity.score / 3) * 100, 100)}%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                Score: {complexity.score}/3 | Average: {complexity.avgScore}/3
              </div>
            </div>
          </div>

          {/* Completion Time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium">Completion</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {completion.isOnTime ? "On time" : "Delayed"}
                {completion.daysEarly > 0 && ` by ${completion.daysEarly} days`}
                {completion.daysLate > 0 && ` by ${completion.daysLate} days`}
              </span>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                      completion.isOnTime 
                        ? "text-green-600 bg-green-100" 
                        : "text-red-600 bg-red-100"
                    }`}
                  >
                    {completion.status}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-semibold inline-block ${
                      completion.isOnTime ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {completion.daysEarly > 0 && `${completion.daysEarly} days early`}
                    {completion.daysLate > 0 && `${completion.daysLate} days late`}
                    {completion.daysEarly === 0 && completion.daysLate === 0 && "On schedule"}
                  </span>
                </div>
              </div>
              <div
                className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                  completion.isOnTime ? "bg-green-200" : "bg-red-200"
                }`}
              >
                <div
                  style={{
                    width: `${completion.isOnTime ? 100 : Math.max(100 - completion.daysLate * 10, 30)}%`,
                  }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    completion.isOnTime ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Assignee Performance */}
          {assignees.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium">Assignees</span>
                </div>
                <span className="text-xs text-muted-foreground">{assignees.length} member{assignees.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {assignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                      <AvatarImage src={assignee.imageUrl || undefined} alt={assignee.name} />
                <AvatarFallback className="text-[10px]">
                  {assignee.name?.split(" ").map((n) => n[0]).join("") || "??"}
                </AvatarFallback>
              </Avatar>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{assignee.name || "Unknown"}</div>
                <div className="text-[10px] text-muted-foreground">
                        {assignee.role} • {assignee.hoursWorked}h worked
                </div>
              </div>
              <div className="ml-auto">
                <Badge
                  variant="outline"
                        className={`text-[10px] ${
                          assignee.trend === "up" 
                            ? "bg-green-50 text-green-600 border-green-200" 
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                >
                        {assignee.trend === "up" ? (
                    <ArrowUpRight className="h-2 w-2 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-2 w-2 mr-1" />
                  )}
                        {assignee.efficiency}% efficient
                </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          <Info className="h-3 w-3 inline mr-1" />
          {similarCardsCount} similar {similarCardsCount === 1 ? "task" : "tasks"} with{" "}
          {complexity.level.toLowerCase()} complexity found for comparison
        </p>
      </CardFooter>
    </Card>
  );
}
