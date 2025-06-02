"use client";

import { useState } from "react";
import {
  Calendar,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTeamAnalytics } from "@/hooks/useAnalytics";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { TeamStats } from "./_team-performance/TeamStats";
import { TeamPerformance } from "./_team-performance/TeamPerformance";
import { PerformanceInsights } from "./_team-performance/PerformanceInsights";

import { SingleCardAnalytics } from "./_single-card";

interface VelocityData {
  week: string;
  planned: number;
  completed: number;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  tasksCompleted: number;
  avgTime: number;
  efficiency: number;
  trend: "up" | "down";
}

// Hook to get current user's team
const useCurrentTeam = () => {
  const accessToken = Cookies.get("accessToken") || "";
  
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.data;
    },
    enabled: !!accessToken
  });
};

const CardCompletionAnalysis = () => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "quarter">("week");
  
  // Get current user's team dynamically
  const { data: teamData, isLoading: isLoadingTeam, error: teamError } = useCurrentTeam();
  const teamId = teamData?.id;

  const { data: teamAnalytics, isLoading: isLoadingAnalytics, error: analyticsError } = useTeamAnalytics(teamId || "", timeRange);

  // Debug logging
  console.log('Team Analytics Data:', { teamAnalytics, teamData, isLoadingAnalytics, isLoadingTeam, analyticsError, teamError, teamId, timeRange });

  // Transform team data for components - now using real dynamic data
  const teamMembers: TeamMember[] = teamAnalytics?.memberPerformance || [];
  const velocityData: VelocityData[] = teamAnalytics?.velocityData || [];
  const teamStatsData = teamAnalytics?.teamStats;

  // Show loading state
  if (isLoadingTeam || (teamId && isLoadingAnalytics)) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Loading Analytics</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {isLoadingTeam ? "Getting your team information..." : "Loading team analytics data..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (teamError || analyticsError) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-red-600">Error Loading Analytics</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {teamError 
              ? "Failed to load team information" 
              : analyticsError instanceof Error ? analyticsError.message : 'Failed to load team analytics data'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please ensure you're part of a team and the backend is running properly.
          </p>
        </div>
      </div>
    );
  }

  // Show no team state
  if (!teamId) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold">No Team Found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            You need to be part of a team to view analytics.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please join or create a team to access team analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Card Completion Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Track time spent and identify optimization opportunities for {teamData?.name || 'your team'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: "day" | "week" | "month" | "quarter") => setTimeRange(value)}>
            <SelectTrigger className="w-[180px] text-xs">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day" className="text-xs">Today</SelectItem>
              <SelectItem value="week" className="text-xs">This Week</SelectItem>
              <SelectItem value="month" className="text-xs">This Month</SelectItem>
              <SelectItem value="quarter" className="text-xs">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Filter className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Calendar className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full md:w-[500px] grid-cols-2">
          <TabsTrigger value="single" className="text-xs">Task Performance</TabsTrigger>
          <TabsTrigger value="team" className="text-xs">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
        
          <SingleCardAnalytics timeRange={timeRange} />

          
        </TabsContent>

        

        <TabsContent value="team" className="space-y-6">
          <TeamStats 
            data={teamStatsData}
          />
          <TeamPerformance 
            teamMembers={teamMembers}
            velocityData={velocityData}
            completionRateData={teamAnalytics?.completionRateData || []}
            timeRange={timeRange}
          />
          
          <PerformanceInsights 
            insights={teamAnalytics?.insights || []}
            recommendations={teamAnalytics?.recommendations || []}
            teamStats={teamAnalytics?.teamStats}
            isLoading={isLoadingAnalytics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardCompletionAnalysis;
