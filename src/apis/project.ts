import { apiClient } from "./config";

export interface MilestoneItem {
  id: string;
  milestoneValue: string;
  isCompletedMilestone: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  startDate?: Date;
  targetDate?: Date;
  milestones: MilestoneItem[];
  priority?: string;
  status: string;
  teamId: string;
  leadId?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  workspaces: {
    workspace: {
      id: number;
      title: string;
      colorName?: string;
      colorValue?: string;
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
  milestones?: MilestoneItem[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  slug: string;
}

export interface ProjectWorkspace {
  id: number;
  title: string;
  colorName?: string;
  colorValue?: string;
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

export const getProjectWorkspaces = async (projectSlug: string): Promise<{
  projectId: string;
  projectTitle: string;
  workspaces: ProjectWorkspace[];
}> => {
  try {
    const response = await apiClient.get(`/projects/${projectSlug}/workspaces`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project workspaces:', error);
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

export const updateProjectTargetDate = async (projectSlug: string, targetDate: string | null): Promise<Project> => {
  try {
    const response = await apiClient.patch(`/projects/${projectSlug}/target-date`, { targetDate });
    return response.data;
  } catch (error) {
    console.error('Error updating project target date:', error);
    throw error;
  }
};

export const updateProjectPriority = async (projectSlug: string, priority: string): Promise<Project> => {
  try {
    const response = await apiClient.patch(`/projects/${projectSlug}/priority`, { priority });
    return response.data;
  } catch (error) {
    console.error('Error updating project priority:', error);
    throw error;
  }
};
export const updateProjectLead = async (projectSlug: string, leadId: string | null): Promise<Project> => {
  try {
    const response = await apiClient.patch(`/projects/${projectSlug}/lead`, { leadId });
    return response.data;
  } catch (error) {
    console.error('Error updating project lead:', error);
    throw error;
  }
};

export const updateProjectMembers = async (projectSlug: string, memberIds: string[]): Promise<Project> => {
  try {
    const response = await apiClient.patch(`/projects/${projectSlug}/members`, { memberIds });
    return response.data;
  } catch (error) {
    console.error('Error updating project members:', error);
    throw error;
  }
};

export const updateMilestoneCompletion = async (
  projectSlug: string, 
  milestoneId: string, 
  isCompleted: boolean
): Promise<Project> => {
  try {
    const response = await apiClient.patch(`/projects/${projectSlug}/milestone/completion`, {
      milestoneId,
      isCompleted
    });
    return response.data;
  } catch (error) {
    console.error('Error updating milestone completion:', error);
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