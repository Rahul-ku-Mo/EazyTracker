import { useQuery  } from "@tanstack/react-query";
import { fetchCard, fetchCards } from "../apis/CardApis";
import { fetchColumn, fetchColumns } from "../apis/ColumnApis";

import { fetchWorkspaces, fetchWorkspace } from "../apis/WorkspaceApis";
import { fetchUserProfile, fetchUsers } from "../apis/userApis";
import {  fetchWorkspaceLabels } from "@/apis/LabelApis";

import { fetchNotifications } from "../apis/NotificationApis";

const useCard = (accessToken: string, cardId: string) => {
  return useQuery({
    queryKey: ["cards", cardId],
    queryFn: async () => await fetchCard(accessToken, parseInt(cardId)),
  });
};

const useCards = (accessToken: string, columnId: string) => {
  return useQuery({
    queryKey: ["cards", "columns", columnId],
    queryFn: async () => await fetchCards(accessToken, columnId),
  });
};

const useColumns = (workspaceId: string | null | undefined) => {
  const [teamId] = workspaceId?.split("/") || [""];

  return useQuery({
    queryKey: ["columns", "workspaces", teamId],
    queryFn: async () => await fetchColumns(workspaceId!),
    enabled: !!workspaceId, // Only run query when workspaceId is available
  });
};
const useColumn = (accessToken: string, columnId: string) => {
  return useQuery({
    queryKey: ["columns", columnId],
    queryFn: async () => await fetchColumn(accessToken, columnId),
  });
};


const useWorkspace = (workspaceIdentifier: string) => {
  return useQuery({
    queryKey: ["workspaces", workspaceIdentifier],
    queryFn: async () => await fetchWorkspace(workspaceIdentifier),
  });
};

const useWorkspaces = (teamId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["workspaces", teamId],
    queryFn: async () => await fetchWorkspaces(teamId),
    enabled: options?.enabled !== undefined ? options.enabled : !!teamId,
  });
};

const useUser = (accessToken: string) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => await fetchUserProfile(accessToken),
  });
};

const useUsers = (accessToken: string) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => await fetchUsers(accessToken),
  });
};


const useWorkspaceLabels = (workspaceId: string) => {
  return useQuery({
    queryKey: ["labels", "workspace", workspaceId],
    queryFn: async () => await fetchWorkspaceLabels(workspaceId),
    enabled: !!workspaceId,
  });
};



const useNotifications = (accessToken: string) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => await fetchNotifications(accessToken),
  });
};

export {
  useCard,
  useCards,
  useColumn,
  useColumns,
  useWorkspace,
  useWorkspaces,
  useUser,
  useUsers,
  useWorkspaceLabels,
  useNotifications,
};
