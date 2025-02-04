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
          `${import.meta.env.VITE_API_URL}/boards/${id}/members`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data.data;
      } catch (err: any) {
        throw new Error(err.response.data.message);
      }
    },
  });

  return { members, isPending };
};
