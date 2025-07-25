import { useQuery  } from "@tanstack/react-query";
import { fetchCard, fetchCards } from "../apis/CardApis";
import { fetchColumn, fetchColumns } from "../apis/ColumnApis";

import { fetchWorkspaces, fetchWorkspace } from "../apis/WorkspaceApis";
import { fetchUserProfile, fetchUsers } from "../apis/userApis";
import { fetchLabels } from "../apis/LabelApis";

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

const useColumns = (accessToken: string, workspaceId: string) => {
  return useQuery({
    queryKey: ["columns", "workspaces", workspaceId],
    queryFn: async () => await fetchColumns(accessToken, workspaceId),
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

const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => await fetchWorkspaces(),
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

const useLabels = (accessToken: string, cardId: string) => {
  return useQuery({
    queryKey: ["labels", cardId],
    queryFn: async () => await fetchLabels(accessToken, cardId),
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
  useLabels,
  useNotifications,
};
