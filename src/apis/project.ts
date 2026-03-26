import { apiClient } from "./config";

export interface MilestoneItem {
  id: string;
  title: string;
  description?: string;
  status: 'INCOMPLETE' | 'COMPLETE';
  targetDate?: Date;
  notes?: string; // For budget info, tasks, etc.
  order?: number;
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
  userAccess?: {
    hasAccess: boolean;
    isLead: boolean;
    isMember: boolean;
    isTeamAdmin: boolean;
    role: 'MEMBER' | 'ADMIN' | null;
  };
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
  slug: string;
  colorName?: string;
  colorValue?: string;
}

export interface TeamProject {
  id: string;
  title: string;
  slug: string;
  status: string;
  priority?: string;
  targetDate?: Date;
  leadId?: string;
  createdBy: string;
  hasAccess: boolean;
  isOwner: boolean;
  userRole: 'MEMBER' | 'ADMIN' | null;
  members: any[];
  lead: any;
}

export const getProjects = async (teamId: string): Promise<Project[]> => {
  try {
    const params = new URLSearchParams();
    params.append('teamId', teamId);

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

// New milestone API functions
export const getProjectMilestones = async (projectSlug: string): Promise<{ milestones: MilestoneItem[] }> => {
  try {
    const response = await apiClient.get(`/milestones/project/${projectSlug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project milestones:', error);
    throw error;
  }
};

export const createMilestone = async (projectSlug: string, milestoneData: Partial<MilestoneItem>): Promise<MilestoneItem> => {
  try {
    const response = await apiClient.post(`/milestones/project/${projectSlug}`, milestoneData);
    return response.data;
  } catch (error) {
    console.error('Error creating milestone:', error);
    throw error;
  }
};

export const updateMilestone = async (projectSlug: string, milestoneId: string, milestoneData: Partial<MilestoneItem>): Promise<MilestoneItem> => {
  try {
    const response = await apiClient.put(`/milestones/${milestoneId}/project/${projectSlug}`, milestoneData);
    return response.data;
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

export const deleteMilestone = async (projectSlug: string, milestoneId: string): Promise<void> => {
  try {
    await apiClient.delete(`/milestones/${milestoneId}/project/${projectSlug}`);
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

export const updateMilestoneStatus = async (projectSlug: string, milestoneId: string, isCompleted: boolean): Promise<MilestoneItem> => {
  try {
    const response = await apiClient.patch(`/milestones/${milestoneId}/project/${projectSlug}/completion`, {
      isCompleted
    });
    return response.data;
  } catch (error) {
    console.error('Error updating milestone status:', error);
    throw error;
  }
};

export const reorderMilestones = async (projectSlug: string, milestoneIds: string[]): Promise<void> => {
  try {
    await apiClient.post(`/milestones/project/${projectSlug}/reorder`, {
      milestoneIds
    });
  } catch (error) {
    console.error('Error reordering milestones:', error);
    throw error;
  }
};

export const bulkUpdateMilestones = async (projectSlug: string, milestones: MilestoneItem[]): Promise<{ milestones: MilestoneItem[] }> => {
  try {
    const response = await apiClient.put(`/milestones/project/${projectSlug}/bulk`, {
      milestones
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating milestones:', error);
    throw error;
  }
}; 