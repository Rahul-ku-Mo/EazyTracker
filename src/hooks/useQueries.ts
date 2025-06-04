import { useQuery  } from "@tanstack/react-query";
import { fetchCard, fetchCards } from "../apis/CardApis";
import { fetchColumn, fetchColumns } from "../apis/ColumnApis";
import { fetchBoards, fetchBoard } from "../apis/BoardApis";
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

const useColumns = (accessToken: string, boardId: string) => {
  return useQuery({
    queryKey: ["columns", "boards", boardId],
    queryFn: async () => await fetchColumns(accessToken, boardId),
  });
};
const useColumn = (accessToken: string, columnId: string) => {
  return useQuery({
    queryKey: ["columns", columnId],
    queryFn: async () => await fetchColumn(accessToken, columnId),
  });
};

const useBoard = (accessToken: string, boardId: string) => {
  return useQuery({
    queryKey: ["boards", boardId],
    queryFn: async () => await fetchBoard(accessToken, boardId),
  });
};

const useBoards = (accessToken: string) => {
  return useQuery({
    queryKey: ["boards"],
    queryFn: async () => await fetchBoards(accessToken),
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
  useBoard,
  useBoards,
  useUser,
  useUsers,
  useLabels,
  useNotifications,
};
