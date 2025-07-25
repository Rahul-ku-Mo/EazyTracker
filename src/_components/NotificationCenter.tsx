import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Settings,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext";
import { UserContext } from "@/context/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/apis/NotificationApis";
import pusherClient from "@/services/pusherClientService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

type NotificationTab = "all" | "unread" | "archived";

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
      if (metadata.teamName) {
        return `${senderName} joined your team "${metadata.teamName}"`;
      } else if (metadata.boardTitle) {
        return `${senderName} invited you to join "${metadata.boardTitle}"`;
      } else {
        return `${senderName} joined your team`;
      }
    case "FILE_ADDED":
      return `${senderName} added file to File manager`;
    case "PAYMENT_REQUEST":
      return `${senderName} request a payment of $${metadata.amount || '200'}`;
    default:
      return "New notification";
  }
};

const getNotificationCategory = (notification: Notification) => {
  switch (notification.message) {
    case "CARD_ASSIGNED":
    case "CARD_UPDATED":
    case "CARD_COMPLETED":
    case "CARD_COMMENTED":
      return "Project UI";
    case "JOIN":
      return "Communication";
    case "FILE_ADDED":
      return "File manager";
    case "PAYMENT_REQUEST":
      return "File manager";
    default:
      return "General";
  }
};

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onAction 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: number) => void;
  onAction: (action: string, notification: Notification) => void;
}) => {
  const senderName = notification.sender.name || notification.sender.email;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  const category = getNotificationCategory(notification);
  
  const renderActionButtons = () => {
    switch (notification.message) {
      case "JOIN":
        return (
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              className="bg-zinc-900 hover:bg-zinc-800 text-white h-8 px-4"
              onClick={() => onAction('accept', notification)}
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 px-4"
              onClick={() => onAction('decline', notification)}
            >
              Decline
            </Button>
          </div>
        );
      case "CARD_COMMENTED":
        return (
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              className="bg-zinc-900 hover:bg-zinc-800 text-white h-8 px-4"
              onClick={() => onAction('reply', notification)}
            >
              Reply
            </Button>
          </div>
        );
      case "FILE_ADDED":
        return (
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-4"
              onClick={() => onAction('download', notification)}
            >
              Download
            </Button>
          </div>
        );
      case "PAYMENT_REQUEST":
        return (
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              className="bg-zinc-900 hover:bg-zinc-800 text-white h-8 px-4"
              onClick={() => onAction('pay', notification)}
            >
              Pay
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 px-4"
              onClick={() => onAction('decline', notification)}
            >
              Decline
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-4 border-b border-zinc-100 dark:border-zinc-800 relative",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={notification.sender.imageUrl} alt={senderName} />
          <AvatarFallback className="text-sm bg-emerald-600 text-white">
            {senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {getNotificationMessage(notification)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500">
                  {timeAgo.replace('about ', '')} • {category}
                </span>
              </div>
            </div>
            
            {!notification.isRead && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Special content for specific notification types */}
          {notification.message === "CARD_COMMENTED" && (
            <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400">
              @Jaydon Frankie feedback by asking questions or just leave a note of appreciation.
            </div>
          )}
          
          {notification.message === "FILE_ADDED" && (
            <div className="mt-2 flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded">
              <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium">design-suriname-2015.mp...</p>
                <p className="text-xs text-zinc-500">2.3 Mb</p>
              </div>
            </div>
          )}
          
          {notification.message === "FILE_ADDED" && notification.metadata && (
            <div className="mt-2 flex gap-1">
              <Badge variant="outline" className="text-xs">Design</Badge>
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">Dashboard</Badge>
              <Badge variant="outline" className="text-xs">Design system</Badge>
            </div>
          )}
          
          {renderActionButtons()}
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationCenter = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(accessToken || ""),
    enabled: !!accessToken,
    refetchInterval: 30000,
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

  useEffect(() => {
    if (!user?.id) return;

    const channel = pusherClient.subscribe("notification");
    const eventName = `user:${user.id}`;

    const handleNotification = (data: any) => {
      toast.info(getNotificationMessage(data.notification), {
        action: {
          label: "View",
          onClick: () => setIsOpen(true),
        },
      });
      refetch();
    };

    channel.bind(eventName, handleNotification);

    return () => {
      channel.unbind(eventName, handleNotification);
      pusherClient.unsubscribe("notification");
    };
  }, [user?.id, refetch]);

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
  const archivedCount = 0; // Placeholder for archived notifications

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n: Notification) => !n.isRead);
      case "archived":
        return []; // Placeholder for archived notifications
      default:
        return notifications;
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleAction = (action: string, notification: Notification) => {
    console.log(`Action: ${action}`, notification);
    // Handle different actions here
    switch (action) {
      case 'accept':
        // Handle accept logic
        break;
      case 'decline':
        // Handle decline logic
        break;
      case 'reply':
        // Handle reply logic
        break;
      case 'download':
        // Handle download logic
        break;
      case 'pay':
        // Handle payment logic
        break;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        onClick={() => setIsOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[320px] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 h-12">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            {/* Tabs */}
            <div className="flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 h-12">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    activeTab === "all"
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                  )}
                >
                  All
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {notifications.length}
                  </Badge>
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    activeTab === "unread"
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                  )}
                >
                  Unread
                  <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs bg-blue-100 text-blue-700">
                    {unreadCount}
                  </Badge>
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    activeTab === "archived"
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                  )}
                >
                  Archived
                  <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs bg-green-100 text-green-700">
                    {archivedCount}
                  </Badge>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Bell className="size-8 text-zinc-400 mb-2" />
                    <p className="text-zinc-500 text-sm font-medium">
                      {activeTab === "unread" 
                        ? "No unread notifications" 
                        : activeTab === "archived" 
                        ? "No archived notifications" 
                        : "No notifications yet"}
                    </p>
                  </div>
                ) : (
                  <div className="group">
                    <AnimatePresence>
                      {filteredNotifications.map((notification: Notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onAction={handleAction}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-sm text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  View all
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}; 