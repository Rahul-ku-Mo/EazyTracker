import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
export const useMembers = (id: string) => {
  const accessToken = Cookies.get("accessToken") || "";

  const { data: members, isPending } = useQuery({
    queryKey: ["members", id],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/workspaces/${id}/members`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Transform the data to flatten the user object
        const membersData = response.data.data;
        return membersData
          .filter((member: any) => member && member.user) // Filter out invalid members
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
  });

  return { members, isPending };
};
