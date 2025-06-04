"use client";

import { useState } from "react";
import {
  Calendar,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { SingleCardAnalytics } from "./_single-card";

// Hook to get current user's team
const useCurrentTeam = () => {
  const accessToken = Cookies.get("accessToken");
  
  return useQuery({
    queryKey: ["current-team"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!accessToken,
  });
};

const CardCompletionAnalysis = () => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "quarter">("week");
  
  // Get current user's team dynamically
  const { data: teamData, isLoading: isLoadingTeam, error: teamError } = useCurrentTeam();

  // Show loading state
  if (isLoadingTeam) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Loading Analytics</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Getting your team information...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (teamError) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-red-600">Error Loading Analytics</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Failed to load team information
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please ensure you're part of a team and the backend is running properly.
          </p>
        </div>
      </div>
    );
  }

  // Show no team state
  if (!teamData?.id) {
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
          <h1 className="text-xl font-bold">Task Performance Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Analyze individual task performance and identify optimization opportunities
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 For team-wide analytics, visit Team Management → Performance
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

      <SingleCardAnalytics timeRange={timeRange} />
    </div>
  );
};

export default CardCompletionAnalysis;
