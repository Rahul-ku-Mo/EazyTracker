import { api } from "@/lib/api";

// Get team members with board access info
export const getTeamMembers = async (teamId: string) => {
  try {
    const response = await api.get(
      `/teams/${teamId}/members`,
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return null;
  }
};

// Get workspace members with permissions
export const getWorkspaceMembers = async (workspaceSlug: number) => {
  try {
    const response = await api.get(
      `/teams/workspaces/${workspaceSlug}/members`,
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return null;
  }
};

// Add user to workspace
export const addUserToWorkspace = async (
  workspaceId: number,
  userId: string,
  role: 'ADMIN' | 'MEMBER' = 'MEMBER'
) => {
  try {
    const response = await api.post(
      `/teams/workspaces/${workspaceId}/members/${userId}`,
      { role },
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error adding user to workspace:", error);
    throw error;
  }
};

// Remove user from workspace
export const removeUserFromWorkspace = async (workspaceId: number, userId: string) => {
  try {
    const response = await api.delete(
      `/teams/workspaces/${workspaceId}/members/${userId}`,
    );

    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error removing user from workspace:", error);
    throw error;
  }
};

// Update user permissions on workspace
export const updateUserPermissions = async (
  workspaceId: number,
  userId: string,
  role: 'ADMIN' | 'MEMBER'
) => {
  try {
    const response = await api.patch(
      `/teams/workspaces/${workspaceId}/members/${userId}/permissions`,
      { role },
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error updating workspace user permissions:", error);
    throw error;
  }
};

// Toggle user status (enable/disable)
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const response = await api.patch(
      `/teams/users/${userId}/status`,
      { isActive },
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

// Get team workspaces (both accessible and locked)
export const getTeamWorkspaces = async () => {
  try {
    const response = await api.get(`/teams/workspaces`
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching team workspaces:", error);
    return [];
  }
};

// Send workspace invitation
export const sendWorkspaceInvitation = async (
  workspaceId: number,
  email: string,
  role: 'ADMIN' | 'MEMBER' = 'MEMBER'
) => {
  try {
    const response = await api.post(
      `/teams/workspaces/${workspaceId}/invite`,
      { email, role },

    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error sending workspace invitation:", error);
    throw error;
  }
};

// Get all teams for current user (not related to Team API)
export const getUserTeams = async () => {
  try {
    const response = await api.get(
      `/teams`,
    );

    if (response.status === 200) {
      // The backend returns a single team, but we need an array
      const team = response.data.data;
      return team ? [team] : [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return [];
  }
}; 