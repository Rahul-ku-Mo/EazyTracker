import { apiClient } from "./config";

export interface Workspace {
  id: string;
  title: string;
  slug?: string;
  userId: string;
  colorId: string;
  colorValue: string;
  colorName: string;
  createdAt: string;
  updatedAt: string;
  userRole?: string;
  isFavorite?: boolean;
  user?: {
    name: string;
    email: string;
  };
}

export const fetchWorkspaces = async (): Promise<Workspace[] | undefined> => {
  try {
    const response = await apiClient.get(`/workspaces`);

    if (response.status === 200) return response.data.data;
    return undefined;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const fetchWorkspace = async (workspaceId: string): Promise<Workspace> => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}`);

    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const createWorkspace = async (data: Partial<Workspace>): Promise<Workspace> => {
  try {
    const response = await apiClient.post(`/workspaces`, data);

    if (response.status === 201) return response.data.data;
    throw new Error("Failed to create workspace");
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteWorkspace = async (workspaceId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/workspaces/${workspaceId}`);

    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>): Promise<Workspace> => {
  try {
    const response = await apiClient.put(`/workspaces/${workspaceId}`, data);

    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const toggleWorkspaceFavorite = async (workspaceId: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/workspaces/${workspaceId}/favorite`);

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getFavoriteWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await apiClient.get(`/workspaces/favorites`);

    if (response.status === 200) return response.data.data;
    return [];
  } catch (error) {
    console.error("Error fetching favorite workspaces:", error);
    return [];
  }
};

export const getAccessibleWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await apiClient.get(`/workspaces/accessible`);

    if (response.status === 200) return response.data.data;
    return [];
  } catch (error) {
    console.error("Error fetching accessible workspaces:", error);
    return [];
  }
}; 