import { apiClient } from "./config";

export interface WorkspacePermission {
  id: string;
  workspaceId: string;
  userId: string;
  permission: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchWorkspacePermissions = async (workspaceId: string): Promise<WorkspacePermission[]> => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}/permissions`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const grantWorkspacePermission = async (workspaceId: string, userId: string, permission: string): Promise<WorkspacePermission> => {
  try {
    const response = await apiClient.post(`/workspaces/${workspaceId}/permissions`, {
      userId: userId,
      permission: permission
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const revokeWorkspacePermission = async (workspaceId: string, userId: string, permission: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/workspaces/${workspaceId}/permissions`, {
      data: {
        userId: userId,
        permission: permission
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const checkWorkspacePermission = async (workspaceId: string, permission: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}/permissions/check`, {
      params: { permission }
    });
    return response.data.hasPermission;
  } catch (error: any) {
    return false;
  }
}; 