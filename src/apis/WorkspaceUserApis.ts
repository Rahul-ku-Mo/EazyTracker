import { apiClient } from "./config";

export interface WorkspaceUser {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

export const fetchWorkspaceUsers = async (workspaceId: string): Promise<WorkspaceUser[]> => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}/users`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const addUserToWorkspace = async (workspaceId: string, userEmail: string, role: string = 'MEMBER'): Promise<WorkspaceUser> => {
  try {
    const response = await apiClient.post(`/workspaces/${workspaceId}/users`, {
      email: userEmail,
      role: role
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const removeUserFromWorkspace = async (workspaceId: string, userId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/workspaces/${workspaceId}/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateWorkspaceUserRole = async (workspaceId: string, userId: string, role: string): Promise<WorkspaceUser> => {
  try {
    const response = await apiClient.put(`/workspaces/${workspaceId}/users/${userId}`, {
      role: role
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const inviteUserToWorkspace = async (workspaceId: string, userEmail: string, role: string = 'MEMBER'): Promise<any> => {
  try {
    const response = await apiClient.post(`/workspaces/${workspaceId}/invite`, {
      email: userEmail,
      role: role
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
}; 