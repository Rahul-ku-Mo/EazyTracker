import { UserTable } from "@/_components/Table/user-table";
import { columns } from "@/_components/Table/user-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import Container from "@/layouts/Container";

const TeamMembersPage = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/member`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Container title="Team Members">
      <UserTable columns={columns} data={data} />
    </Container>
  );
};

export default TeamMembersPage;
