import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Clock, Users, MessageCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext";
import { UserContext } from "@/context/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/apis/NotificationApis";
import pusherClient from "@/services/pusherClientService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: number;
  message: string;
  metadata?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "CARD_ASSIGNED":
      return <Users className="h-4 w-4 text-blue-500" />;
    case "CARD_UPDATED":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "CARD_COMPLETED":
      return <Trophy className="h-4 w-4 text-green-500" />;
    case "CARD_COMMENTED":
      return <MessageCircle className="h-4 w-4 text-purple-500" />;
    case "CARD_DUE_SOON":
      return <Clock className="h-4 w-4 text-orange-500" />;
    case "CARD_OVERDUE":
      return <Clock className="h-4 w-4 text-red-500" />;
    case "JOIN":
      return <Users className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationMessage = (notification: Notification) => {
  const metadata = notification.metadata ? JSON.parse(notification.metadata) : {};
  const senderName = notification.sender.name || notification.sender.email;

  switch (notification.message) {
    case "CARD_ASSIGNED":
      return `${senderName} assigned you to "${metadata.cardTitle}"`;
    case "CARD_UPDATED":
      return `${senderName} updated "${metadata.cardTitle}"${metadata.changes ? ` (${metadata.changes})` : ""}`;
    case "CARD_COMPLETED":
      return `${senderName} completed "${metadata.cardTitle}"`;
    case "CARD_COMMENTED":
      return `${senderName} commented on "${metadata.cardTitle}"`;
    case "CARD_DUE_SOON":
      return `Card "${metadata.cardTitle}" is due soon`;
    case "CARD_OVERDUE":
      return `Card "${metadata.cardTitle}" is ${metadata.daysPastDue} days overdue`;
    case "JOIN":
      return `${senderName} invited you to join "${metadata.boardTitle}"`;
    default:
      return "New notification";
  }
};



export const NotificationCenter = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(accessToken || ""),
    enabled: !!accessToken,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      markNotificationAsRead(accessToken || "", notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(accessToken || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // Set up Pusher subscription for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = pusherClient.subscribe("notification");
    const eventName = `user:${user.id}`;

    const handleNotification = (data: any) => {
      // Show toast notification
      toast.info(getNotificationMessage(data.notification), {
        action: {
          label: "View",
          onClick: () => setIsOpen(true),
        },
      });

      // Refetch notifications to update the list
      refetch();
    };

    channel.bind(eventName, handleNotification);

    return () => {
      channel.unbind(eventName, handleNotification);
      pusherClient.unsubscribe("notification");
    };
  }, [user?.id, refetch]);

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleMarkAsRead = (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96"
        sideOffset={4}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-6 px-2"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="py-2">
              <AnimatePresence>
                {notifications.map((notification: Notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-l-2 mx-2 my-1 rounded-r-md",
                      notification.isRead
                        ? "border-l-transparent"
                        : "border-l-primary bg-muted/25"
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.message)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        notification.isRead 
                          ? "text-muted-foreground" 
                          : "text-foreground font-medium"
                      )}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-sm text-muted-foreground cursor-default">
              {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 