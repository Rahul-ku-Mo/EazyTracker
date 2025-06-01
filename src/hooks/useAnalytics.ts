import { useQuery, useMutation } from "@tanstack/react-query";
import { analyticsService, TimeRange } from "../services/analytics.service";

export const useCardAnalytics = (cardId: number, timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["cardAnalytics", cardId, timeRange],
    queryFn: () => analyticsService.getCardAnalytics(cardId, timeRange),
    enabled: !!cardId,
  });
};

export const useTeamAnalytics = (teamId: string, timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["teamAnalytics", teamId, timeRange],
    queryFn: () => analyticsService.getTeamAnalytics(teamId, timeRange),
    enabled: !!teamId,
  });
};

export const useBoardAnalytics = (boardId: number, timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["boardAnalytics", boardId, timeRange],
    queryFn: () => analyticsService.getBoardAnalytics(boardId, timeRange),
    enabled: !!boardId,
  });
};

export const useUpdatePerformanceMetrics = () => {
  return useMutation({
    mutationFn: analyticsService.updatePerformanceMetrics,
  });
};

export const useCardPerformanceComparison = (cardId: number) => {
  return useQuery({
    queryKey: ["cardPerformanceComparison", cardId],
    queryFn: () => analyticsService.getCardPerformanceComparison(cardId),
    enabled: !!cardId,
  });
};