import { api } from "@/lib/api";

// Grant project access to a user
export const grantProjectAccess = async (
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER' | 'OBSERVER' = 'MEMBER'
) => {
  const response = await api.post(`/project-permissions/${projectId}/permissions`, { userId, role });
  return response.data.data;
};

// Revoke project access from a user
export const revokeProjectAccess = async (projectId: string, memberId: string) => {
  const response = await api.delete(`/project-permissions/${projectId}/permissions/${memberId}`);
  return response.data.data;
};

// Update user's project role
export const updateProjectRole = async (
  projectId: string,
  memberId: string,
  role: 'ADMIN' | 'MEMBER' | 'OBSERVER'
) => {
  const response = await api.patch(`/project-permissions/${projectId}/permissions/${memberId}`, { role });
  return response.data.data;
};

// Get user's accessible projects
export const getUserAccessibleProjects = async () => {
try {
    const response = await api.get(`/project-permissions/accessible`);

    if (response.status === 200) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching accessible projects:", error);
    return [];
  }
};

export const getProjectMembersWithAccess = async (projectId: string) => {
  try {
    const response = await api.get(`project-permissions/${projectId}/permissions`)

    return response.data.data;
  } catch (error) {
    console.error("Error fetching project members with access.", error)
    return []
  }
} 