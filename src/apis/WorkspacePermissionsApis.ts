import { apiClient } from "./config";

export interface WorkspacePermission {
  id: string;
  workspaceId: string;
  userId: string;
  permission: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchWorkspacePermissions = async (workspaceIdentifier: string): Promise<WorkspacePermission[]> => {
  try {
    let url: string;
    if (workspaceIdentifier.includes('/')) {
      const [teamId, slug] = workspaceIdentifier.split('/');
      url = `/workspaces/${teamId}/${slug}/permissions`;
    } else {
      throw new Error("Workspace identifier must be in teamId/slug format");
    }

    const response = await apiClient.get(url);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const grantWorkspacePermission = async (workspaceIdentifier: string, userId: string, permission: string): Promise<WorkspacePermission> => {
  try {
    let url: string;
    if (workspaceIdentifier.includes('/')) {
      const [teamId, slug] = workspaceIdentifier.split('/');
      url = `/workspaces/${teamId}/${slug}/permissions`;
    } else {
      throw new Error("Workspace identifier must be in teamId/slug format");
    }

    const response = await apiClient.post(url, {
      userId: userId,
      permission: permission
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

// Note: revokeWorkspacePermission and checkWorkspacePermission methods 
// removed as they don't have corresponding backend controller methods 