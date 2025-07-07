import { apiClient } from "./config";

interface Board {
  id: string;
  title: string;
  imageId?: string;
  imageFullUrl?: string;
  imageUserName?: string;
  colorId?: string;
  colorValue?: string;
  colorName?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const fetchWorkspaces = async (): Promise<Board[] | undefined> => {
  try {
    const response = await apiClient.get(`/workspaces`);

    if (response.status === 200) return response.data.data;
    return undefined;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export const fetchWorkspace = async (workspaceId: string): Promise<Board> => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}`);

    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const createWorkspace = async (data: Partial<Board>): Promise<Board> => {
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

export const updateWorkspace = async (
  workspaceId: string,
  data: Partial<Board>
): Promise<Board | undefined> => {
  try {
    const response = await apiClient.patch(`/workspaces/${workspaceId}`, data);

    if (response.status === 200) return response.data.data;
    return undefined;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

// Backward compatibility - keep old function names for existing code
export const fetchBoards = fetchWorkspaces;
export const fetchBoard = fetchWorkspace;
export const createBoard = createWorkspace;
export const deleteBoard = deleteWorkspace;
export const updateBoard = updateWorkspace;
