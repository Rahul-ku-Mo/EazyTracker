import { createContext, useState, useEffect, useContext } from "react";
import { useNotifications } from "../hooks/useQueries";
import Cookies from "js-cookie";
import pusherClient from "../services/pusherClientService";
import { useQueryClient } from "@tanstack/react-query";
import { UserContext } from "./UserContext";

interface NotificationContextType {
  isNewNotification: boolean;
  setIsNewNotification: (isNewNotification: boolean) => void;
  notifications: any;
  isPending: boolean;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

const NotificationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const accessToken = Cookies.get("accessToken");

  const { user } = useContext(UserContext);

  const { data: notifications, isPending } = useNotifications(accessToken || "");

  const [isNewNotification, setIsNewNotification] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    pusherClient.subscribe("notification");

    let timeoutId: NodeJS.Timeout; // Declare timeoutId

    const messageHandler = (data: any) => {
      const oldData = notifications;

      setIsNewNotification(true);

      queryClient.setQueryData(
        ["notifications"],
        [data.notification, ...oldData]
      );

      timeoutId = setTimeout(() => {
        setIsNewNotification(false);
      }, 10000);
    };

    pusherClient.bind(`invite:${user?.id}`, messageHandler);

    return () => {
      clearTimeout(timeoutId); 
      pusherClient.unsubscribe("notification");
      pusherClient.unbind(`invite:${user?.id}`, messageHandler);
    };
  }, [notifications, queryClient, user]);

  return (
    <NotificationContext.Provider
      value={{
        isNewNotification,
        setIsNewNotification,
        notifications,
        isPending
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContextProvider, NotificationContext };
