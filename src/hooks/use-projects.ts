import { getProjects } from "@/apis/project";
import { useQuery } from "@tanstack/react-query";

export const useProjects = () => {
    const teamId = localStorage.getItem("teamId") as string;

    const { data: projects, isPending, error } = useQuery({
        queryKey: ["projects"],
        queryFn: () => getProjects(teamId!),
        enabled: !!teamId,
    });

    return { projects, isPending, error }
}