import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  notificationService,
  Notification,
  NotificationType,
} from "@/services/notifications";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  CheckCheck,
  Bell,
  Package,
  MessageSquare,
  Briefcase,
  Star,
  CreditCard,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

const NOTIFICATION_ICONS: { [key in NotificationType]: React.ReactNode } = {
  order: Package,
  message: MessageSquare,
  job: Briefcase,
  review: Star,
  payment: CreditCard,
  follow: UserPlus,
  comment: MessageCircle,
  like: Heart,
  proposal: Briefcase,
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [grouped, setGrouped] = useState<GroupedNotifications>({
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "unread" | NotificationType
  >("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setCurrentUser(data.session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(true);
      setupRealtimeListener();
    }
  }, [currentUser]);

  const fetchNotifications = useCallback(
    async (reset = false) => {
      if (!currentUser || loading) return;

      setLoading(true);
      try {
        const currentOffset = reset ? 0 : offset;
        const data = await notificationService.getNotifications(
          currentUser,
          ITEMS_PER_PAGE,
          currentOffset
        );

        if (data.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }

        if (reset) {
          setNotifications(data);
          setOffset(ITEMS_PER_PAGE);
        } else {
          setNotifications((prev) => [...prev, ...data]);
          setOffset((prev) => prev + ITEMS_PER_PAGE);
        }

        const grouped = notificationService.groupNotificationsByDate(
          data
        );
        setGrouped(grouped);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [currentUser, offset]
  );

  const setupRealtimeListener = () => {
    if (!currentUser) return;

    const channel = notificationService.subscribeToNotifications(
      currentUser,
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        const updated = notificationService.groupNotificationsByDate(
          [newNotification, ...notifications]
        );
        setGrouped(updated);
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNotifications();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchNotifications, hasMore]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await notificationService.markAllAsRead(currentUser);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    const link = notificationService.getNotificationLink(notification);
    navigate(link);
  };

  const getFilteredNotifications = () => {
    switch (selectedTab) {
      case "unread":
        return notifications.filter((n) => !n.is_read);
      case "all":
        return notifications;
      default:
        return notifications.filter((n) => n.type === selectedTab);
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = NOTIFICATION_ICONS[notification.type];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Card
          onClick={() => handleNotificationClick(notification)}
          className={cn(
            "flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50",
            !notification.is_read && "bg-muted/50"
          )}
        >
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            !notification.is_read ? "bg-primary/20" : "bg-muted"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn(
                "text-sm",
                !notification.is_read && "font-semibold"
              )}>
                {notification.title}
              </p>
              {notification.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {notification.type}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {notificationService.formatNotificationTime(
                notification.created_at
              )}
            </p>
            {!notification.is_read && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(notification.id);
          }}
          className="flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={(v: string) => setSelectedTab(v)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {unreadCount > 0 && (
              <TabsTrigger value="unread" className="relative">
                Unread ({unreadCount})
              </TabsTrigger>
            )}
            {(["order", "message", "job", "review", "payment"] as NotificationType[]).map(
              (type) => (
                <TabsTrigger key={type} value={type} className="capitalize">
                  {type}
                </TabsTrigger>
              )
            )}
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4 mt-4">
            {filteredNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {selectedTab === "unread"
                    ? "No unread notifications"
                    : "No notifications"}
                </p>
              </Card>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </AnimatePresence>

                {hasMore && (
                  <div ref={observerTarget} className="h-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
