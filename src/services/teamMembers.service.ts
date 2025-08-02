import axios from 'axios';
import Cookies from 'js-cookie';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  username?: string;
  imageUrl?: string;
  department?: string;
  role?: string;
}

const getAuthHeaders = () => {
  const accessToken = Cookies.get("accessToken");
  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

/**
 * Fetch team members for mentions
 * @returns Promise<TeamMember[]>
 */
export const getTeamMembersForMentions = async (): Promise<TeamMember[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/teams/members`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200 && response.data.data) {
      // Transform the data to match the expected format
      const teamData = response.data.data;
      
      if (teamData.members && Array.isArray(teamData.members)) {
        return teamData.members.map((member: any) => ({
          id: member.id,
          name: member.name || 'Unknown User',
          email: member.email || '',
          username: member.username || member.name?.toLowerCase().replace(/\s+/g, '') || 'unknown',
          imageUrl: member.imageUrl || '',
          department: member.department || '',
          role: member.role || 'USER'
        }));
      }
      
      // If it's a direct array of members
      if (Array.isArray(teamData)) {
        return teamData.map((member: any) => ({
          id: member.id,
          name: member.name || 'Unknown User',
          email: member.email || '',
          username: member.username || member.name?.toLowerCase().replace(/\s+/g, '') || 'unknown',
          imageUrl: member.imageUrl || '',
          department: member.department || '',
          role: member.role || 'USER'
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching team members for mentions:", error);
    return [];
  }
};

/**
 * Fetch workspace members for mentions (alternative endpoint)
 * @param workspaceId - The workspace ID
 * @returns Promise<TeamMember[]>
 */
export const getWorkspaceMembersForMentions = async (workspaceId: string): Promise<TeamMember[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/teams/workspaces/${workspaceId}/members`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200 && response.data.data) {
      return response.data.data.map((member: any) => ({
        id: member.user.id,
        name: member.user.name || 'Unknown User',
        email: member.user.email || '',
        username: member.user.username || member.user.name?.toLowerCase().replace(/\s+/g, '') || 'unknown',
        imageUrl: member.user.imageUrl || '',
        department: member.user.department || '',
        role: member.role || 'MEMBER'
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching workspace members for mentions:", error);
    return [];
  }
};

/**
 * Search team members by query
 * @param query - Search query
 * @param members - Array of team members
 * @returns TeamMember[]
 */
export const searchTeamMembers = (query: string, members: TeamMember[]): TeamMember[] => {
  if (!query || query.trim() === '') {
    return members;
  }

  const searchTerm = query.toLowerCase();
  
  return members.filter(member => 
    member.name.toLowerCase().includes(searchTerm) ||
    member.username?.toLowerCase().includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm) ||
    member.department?.toLowerCase().includes(searchTerm)
  );
}; 