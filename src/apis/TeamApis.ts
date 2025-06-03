import axios from "axios";
import Cookies from "js-cookie";

const getAuthHeaders = () => {
  const accessToken = Cookies.get("accessToken");
  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

// Get team members with board access info
export const getTeamMembers = async (teamId: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/teams/${teamId}/members`,
      {
        headers: getAuthHeaders(),
      }
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

// Get board members with permissions
export const getBoardMembers = async (boardId: number) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching board members:", error);
    return null;
  }
};

// Add user to board
export const addUserToBoard = async (
  boardId: number,
  userId: string,
  role: 'ADMIN' | 'MEMBER' = 'MEMBER'
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members/${userId}`,
      { role },
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error adding user to board:", error);
    throw error;
  }
};

// Remove user from board
export const removeUserFromBoard = async (boardId: number, userId: string) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members/${userId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error removing user from board:", error);
    throw error;
  }
};

// Update user permissions on board
export const updateUserPermissions = async (
  boardId: number,
  userId: string,
  role: 'ADMIN' | 'MEMBER'
) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/members/${userId}/permissions`,
      { role },
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error updating user permissions:", error);
    throw error;
  }
};

// Toggle user status (enable/disable)
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/teams/users/${userId}/status`,
      { isActive },
      {
        headers: getAuthHeaders(),
      }
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

// Send board invitation
export const sendBoardInvitation = async (
  boardId: number,
  email: string,
  role: 'ADMIN' | 'MEMBER' = 'MEMBER'
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/teams/boards/${boardId}/invite`,
      { email, role },
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error sending board invitation:", error);
    throw error;
  }
};

// Get all teams for current user
export const getUserTeams = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/teams`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 200) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return [];
  }
}; 