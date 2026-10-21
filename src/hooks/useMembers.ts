import { api } from "@/lib/api";
import useProjectSlugStore from "@/store/projectSlugStore";
import { useQuery } from "@tanstack/react-query";

export const useMembers = () => {
  const teamId = localStorage.getItem("teamId");

  const { currentProjectSlug: projectSlug } = useProjectSlugStore();

  const { data: members, isPending } = useQuery({
    queryKey: ["members", teamId],
    queryFn: async () => {
      try {
        const response = await api.get(`/projects/${projectSlug}`)
        // Transform the data to flatten the user object
        const membersData = response.data.data.members;

        return membersData
          .map((member: any) => ({
            id: member.user.id,
            name: member.user.name || 'Unknown User',
            email: member.user.email || '',
            imageUrl: member.user.imageUrl || '',
            username: member.user.name || 'Unknown User', // Use name as username for display
            role: member.role || 'MEMBER',
          }));
      } catch (err: any) {
        throw new Error(err.response.data.message);
      }
    },
    enabled: !!projectSlug
  });

  return { members, isPending };
};


