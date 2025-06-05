import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Bell, 
  Check, 
  CheckCheck, 
  Archive, 
  Filter, 
  Search,
  Users, 
  MessageCircle, 
  Trophy, 
  Clock,

  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext";
import { UserContext } from "@/context/UserContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/apis/NotificationApis";
import pusherClient from "@/services/pusherClientService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/layouts/Container";

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
      return <Users className="h-4 w-4 text-emerald-500" />;
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

const InboxPage = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "mentions" | "assignments">("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch, isFetching } = useQuery({
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

  // Set up Pusher subscription for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = pusherClient.subscribe("notification");
    const eventName = `user:${user.id}`;

    const handleNotification = (data: any) => {
      toast.info(getNotificationMessage(data.notification), {
        action: {
          label: "View",
          onClick: () => window.location.href = "/inbox",
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

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (searchQuery && !getNotificationMessage(notification).toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    switch (filterType) {
      case "unread":
        return !notification.isRead;
      case "mentions":
        return notification.message === "CARD_COMMENTED" || notification.message === "MENTION";
      case "assignments":
        return notification.message === "CARD_ASSIGNED";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleMarkAsRead = (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const metadata = notification.metadata ? JSON.parse(notification.metadata) : {};
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={cn(
          "group flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer",
          !notification.isRead && "bg-muted/30 border-l-4 border-l-emerald-500"
        )}
        onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
      >
        {/* Notification Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.message)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn(
                "text-sm",
                !notification.isRead ? "font-medium text-foreground" : "text-muted-foreground"
              )}>
                {getNotificationMessage(notification)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {metadata.cardTitle && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    {metadata.cardTitle}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                  className="h-7 w-7 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
        )}
      </motion.div>
    );
  };

  return (
    <MainLayout title="Inbox" fwdClassName="flex flex-col h-full p-0">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Inbox className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Inbox</h1>
              <p className="text-sm text-muted-foreground">
                Stay on top of everything that needs your attention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read ({unreadCount})
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  <Inbox className="h-4 w-4 mr-2" />
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("unread")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Unread only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("mentions")}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mentions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("assignments")}>
                  <Users className="h-4 w-4 mr-2" />
                  Assignments
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mentions" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Mentions
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assignments
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <AnimatePresence mode="wait">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification: Notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-96 text-center"
              >
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || filterType !== "all" 
                    ? "No notifications found" 
                    : "You're all caught up!"
                  }
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery || filterType !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "All notifications have been read. New ones will appear here as they come in."
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </MainLayout>
  );
};

export default InboxPage; 