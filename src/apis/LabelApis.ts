import { api } from "@/lib/api";

export interface Label {
  id: string;
  name: string;
  color?: string;
  teamId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch labels for a team
export const fetchTeamLabels = async (
  teamId: string
): Promise<Label[] | undefined> => {
  try {
    const response = await api.get(`/labels/team/${teamId}`);

    return response.data.data;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

// Fetch labels used in a workspace
export const fetchWorkspaceLabels = async (
  workspaceId: string
): Promise<Label[] | undefined> => {
  try {
    const response = await api.get(`/labels/workspace/${workspaceId}`);

    return response.data.data;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

// Create a new label for a team
export const createLabel = async (
  teamId: string,
  data: { name: string; color?: string }
): Promise<Label | undefined> => {
  try {
    const response = await api.post(`/labels/team/${teamId}`, data);

    return response.data.data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

// Update a label
export const updateLabel = async (
  labelId: string,
  data: { name?: string; color?: string }
): Promise<Label | undefined> => {
  try {
    const response = await api.put(`/labels/${labelId}`, data);

    return response.data.data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

export const deleteLabel = async (
  labelId: string
): Promise<any> => {
  try {
    const response = await api.delete(`/labels/${labelId}`);

    return response;
  } catch (error) {
    console.log(error);
  }
};
