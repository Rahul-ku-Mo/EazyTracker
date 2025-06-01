import { TimeTracker } from "./TimeTracker"
import { TimeSpentPerday } from "./TimeSpentPerday"
import { PerformanceComparison } from "./PerformanceComparison"
import { Insights } from "./Insights"
import { Recommendations } from "./Recommendations"
import { useQuery } from "@tanstack/react-query"
import { cardsService } from "@/services/cards.service"
import { analyticsService, TimeRange } from "@/services/analytics.service"
import { useSearchParams } from "react-router-dom"

const dummySelectedCard = {
  id: 1,
  title: "Task 1: UI Design",
  complexity: "High",
  assignee: "Rahul Kumar Mohanty"
};

const dummyCardTimeData = [
  { day: "Mon", time: 2 },
  { day: "Tue", time: 3 },
  { day: "Wed", time: 1.5 },
  { day: "Thu", time: 4 },
  { day: "Fri", time: 2.5 },
  { day: "Sat", time: 0 },
  { day: "Sun", time: 0 }
];

interface SingleCardAnalyticsProps {
  timeRange: TimeRange;
}

const SingleCardAnalytics = ({ timeRange }: SingleCardAnalyticsProps) => {
    const [searchParams] = useSearchParams();
    const taskId = searchParams.get("task");

    const { data: cardAnalytics, isPending, isError } = useQuery({
        queryKey: ["cardAnalytics", taskId],
        queryFn: async () => {
            if (!taskId) return null;
            const response = await cardsService.getCard(Number(taskId));
            return response.data; // Access the data property from the response
        },
        enabled: !!taskId // Only run query if taskId exists
    });

    const { data: cardTimeData, isPending: isTimeDataPending } = useQuery({
        queryKey: ["cardTimeData", taskId, timeRange],
        queryFn: async () => {
            if (!taskId) return null;
            return analyticsService.getCardTimeData(Number(taskId), timeRange);
        },
        enabled: !!taskId // Only run query if taskId exists
    });

    if(isPending) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if(isError) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                Error loading card analytics. Please try again later.
            </div>
        );
    }

    // Use cardAnalytics data if available, otherwise fall back to dummy data
    const analyticsData = cardAnalytics || dummySelectedCard;

    return (
        <div className="space-y-6">
            <TimeTracker {...analyticsData} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TimeSpentPerday 
                    selectedCard={analyticsData.title} 
                    cardTimeData={cardTimeData?.cardTimeData || dummyCardTimeData}
                    timeRange={timeRange}
                    isLoading={isTimeDataPending}
                />
                <PerformanceComparison 
                    cardId={taskId ? Number(taskId) : 1} 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Insights 
                    insights={cardTimeData?.insights || []} 
                    timeRange={timeRange}
                    isLoading={isTimeDataPending}
                />
                <Recommendations 
                    recommendations={cardTimeData?.recommendations || []}
                    timeRange={timeRange}
                    isLoading={isTimeDataPending}
                />
            </div>
        </div>
    );
};

export { SingleCardAnalytics }