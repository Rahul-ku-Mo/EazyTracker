import { api } from "@/lib/api";

export type TimeRange = "day" | "week" | "month" | "quarter";

export interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  lastResumeTime?: string;
  totalDuration: number;
  isPaused: boolean;
  cardId: number;
  user: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface CardAnalytics {
  timeEntries: TimeEntry[];
  timeDistribution: Record<string, number>;
  peakProductivity: {
    hour: string;
    value: number;
  };
  totalHours: number;
  insights: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
}

export interface TeamMemberPerformance {
  id: string;
  name: string;
  imageUrl: string | null;
  efficiency: number;
  tasksCompleted: number;
  totalHours: number;
  avgTimePerTask: number;
}

export interface TeamAnalytics {
  memberPerformance: TeamMemberPerformance[];
  teamStats: {
    velocity: number;
    velocityTrend: number;
    completionRate: number;
    completionRateTrend: number;
    avgCompletionTime: number;
    avgCompletionTimeTrend: number;
    teamEfficiency: number;
    teamEfficiencyTrend: number;
  };
  velocityData: Array<{
    week: string;
    planned: number;
    completed: number;
  }>;
  completionRateData: Array<{
    name: string;
    value: number;
  }>;
  insights: string[];
  recommendations: string[];
  timeRange: string;
}

export interface BoardAnalytics {
  completionRates: {
    total: number;
    completed: number;
    onTime: number;
    delayed: number;
  };
  velocity: Array<{
    name: string;
    planned: number;
    completed: number;
    efficiency: number;
  }>;
  totalCards: number;
  averageTimePerCard: number;
}

export interface CardTimeData {
  timeRange: TimeRange;
  cardTimeData: Array<{
    period: string;
    time: number;
  }>;
  totalEntries: number;
  totalTime: number;
  insights: string[];
  recommendations: string[];
}

export interface CardPerformanceComparison {
  cardId: number;
  title: string;
  priority: string;
  status: string;
  timeEfficiency: {
    estimatedHours: number;
    actualHours: number;
    efficiency: number;
    displayEfficiency: number;
    isUnderBudget: boolean;
    efficiencyPercentage: number;
    label: string;
  };
  complexity: {
    level: string;
    score: number;
    avgScore: number;
    comparisonPercentage: number;
    isHigherThanAverage: boolean;
  };
  completion: {
    isCompleted: boolean;
    isOnTime: boolean;
    daysEarly: number;
    daysLate: number;
    status: string;
  };
  assignees: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    efficiency: number;
    hoursWorked: number;
    trend: "up" | "down";
    role: string;
  }>;
  similarCardsCount: number;
  createdAt: string;
  completedAt: string | null;
  dueDate: string | null;
}

export const analyticsService = {
  getCardAnalytics: async (cardId: number, timeRange: TimeRange) => {
    const { data } = await api.get(`/analytics/card/${cardId}?timeRange=${timeRange}`);
    return data.data;
  },

  getCardTimeData: async (cardId: number, timeRange: TimeRange) => {
    const { data } = await api.get(`/analytics/card/${cardId}/time-data?timeRange=${timeRange}`);
    return data.data;
  },

  getCardPerformanceComparison: async (cardId: number) => {
    const { data } = await api.get(`/analytics/card/${cardId}/performance-comparison`);
    return data.data;
  },

  getTeamAnalytics: async (teamId: string, timeRange: TimeRange) => {
    const { data } = await api.get(`/analytics/team/${teamId}?timeRange=${timeRange}`);
    return data.data;
  },

  getBoardAnalytics: async (boardId: number, timeRange: TimeRange) => {
    const { data } = await api.get(`/analytics/board/${boardId}?timeRange=${timeRange}`);
    return data.data;
  },

  updatePerformanceMetrics: async (metrics: {
    metricType: string;
    value: number;
    target?: number;
    notes?: string;
    userId?: string;
    teamId?: string;
    sprintId?: string;
  }) => {
    const { data } = await api.post('/analytics/metrics', metrics);
    return data.data;
  },
};

export const timeEntryService = {
  startTimeEntry: async (cardId: number) => {
    const { data } = await api.post('/time-entries/start', { cardId });
    return data.data;
  },

  pauseTimeEntry: async (timeEntryId: string) => {
    const { data } = await api.post(`/time-entries/${timeEntryId}/pause`);
    return data.data;
  },

  resumeTimeEntry: async (timeEntryId: string) => {
    const { data } = await api.post(`/time-entries/${timeEntryId}/resume`);
    return data.data;
  },

  stopTimeEntry: async (timeEntryId: string) => {
    const { data } = await api.post(`/time-entries/${timeEntryId}/stop`);
    return data.data;
  },

  getTimeEntries: async (cardId: number) => {
    const { data } = await api.get(`/time-entries?cardId=${cardId}`);
    return data.data;
  },

  getCurrentActiveTimeEntry: async () => {
    const { data } = await api.get('/time-entries/current-active');
    return data.data;
  }
};
