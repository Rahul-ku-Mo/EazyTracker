
import { useQuery } from "@tanstack/react-query";
import { getTeamMembers } from "@/apis/team-api";
import { getProjects } from "@/apis/project";


export const useFetchTeamMemberOrProject = () => {
    const teamId = localStorage.getItem("teamId") as string;

    const { data: allProjects, isPending: isPendingProjects } = useQuery({
        queryKey: ["projects", teamId],
        queryFn: () => getProjects(teamId),
    });

    const { data: teamData, isPending: isPendingTeamMembers } = useQuery({
        queryKey: ["team-members", teamId],
        queryFn: () => getTeamMembers(teamId),
    })

    return {
        allProjects,
        isPendingProjects,

        teamData,
        isPendingTeamMembers
    };
};

