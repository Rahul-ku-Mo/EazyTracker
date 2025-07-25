import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {  useParams } from "react-router-dom";

export const useMembers = () => {
  const accessToken = Cookies.get("accessToken") || "";

  const teamId = localStorage.getItem("teamId");

  const {slug} = useParams();

  const { data: members, isPending } = useQuery({
    queryKey: ["members", teamId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/workspaces/${teamId}/${slug}/members`,
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
