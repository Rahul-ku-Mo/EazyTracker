import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserTeams } from '@/apis/team-api';
import Cookies from 'js-cookie';
import { generateSlug } from '@/utils';

interface Team {
  id: string;
  name: string;
  joinCode?: string;
  captainId: string;
  teamImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  captain: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string | null;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    imageUrl?: string | null;
  }>;
}

interface TeamContextType {
  currentTeam: Team | null;
  isLoading: boolean;
  error: Error | null;
  refetchTeam: () => void;
  setCurrentTeam: (team: Team | null) => void;
}

const TeamContext = createContext<TeamContextType>({
  currentTeam: null,
  isLoading: false,
  error: null,
  refetchTeam: () => {},
  setCurrentTeam: () => {},
});

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: React.ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const accessToken = Cookies.get("accessToken");

  const {
    data: teamData,
    isLoading,
    error,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['team'],
    queryFn: getUserTeams,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Set current team when data is fetched
  useEffect(() => {
    if (teamData && Array.isArray(teamData) && teamData.length > 0) {
      const team = teamData[0];
      // Validate that we have the required team data
      if (team && team.id && team.name) {
        setCurrentTeam(team);
        
        // Also update localStorage for backward compatibility
        localStorage.setItem("teamId", team.id);
        localStorage.setItem("teamName", generateSlug(team.name));
      }
    } else if (teamData && Array.isArray(teamData) && teamData.length === 0) {
      // No teams found, clear current team
      setCurrentTeam(null);
      localStorage.removeItem("teamId");
      localStorage.removeItem("teamName");
    }
  }, [teamData]);


  const value: TeamContextType = {
    currentTeam,
    isLoading,
    error: error as Error | null,
    refetchTeam,
    setCurrentTeam,
  };



  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}; 