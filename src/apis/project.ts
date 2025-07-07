import { apiClient } from "./config";

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  startDate?: Date;
  targetDate?: Date;
  milestones: string[];
  priority?: string;
  status: string;
  teamId: string;
  leadId?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  boards: {
    board: {
      id: number;
      title: string;
    };
  }[];
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string;
    };
  }[];
  lead?: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  cards: any[]; // Type this based on your Card type
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  workspaceIds?: number[];
  teamId: string;
  leadId?: string;
  members?: string[];
  startDate?: Date;
  targetDate?: Date;
  priority?: string;
  status?: string;
  summary?: string;
  milestones?: string[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  slug: string;
}

export const getProjects = async (teamId: string, boardId?: number): Promise<Project[]> => {
  try {
    const params = new URLSearchParams();
    params.append('teamId', teamId);
    if (boardId) params.append('boardId', boardId.toString());

    const response = await apiClient.get(`/projects?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getProject = async (projectSlug: string): Promise<Project> => {
  try {
    const response = await apiClient.get(`/projects/${projectSlug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

export const createProject = async (data: CreateProjectInput): Promise<Project> => {
  try {
    const response = await apiClient.post(`/projects`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (data: UpdateProjectInput): Promise<Project> => {
  try {
    const { slug, ...updateData } = data;
    const response = await apiClient.put(`/projects/${slug}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectSlug: string): Promise<void> => {
  try {
    await apiClient.delete(`/projects/${projectSlug}`);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}; 