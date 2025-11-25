import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { notificationService, Notification } from "@/services/notifications";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data?.session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    fetchNotifications();
    setupRealtimeListener();
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(currentUser, 5),
        notificationService.getUnreadCount(currentUser),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!currentUser) return;

    const channel = notificationService.subscribeToNotifications(
      currentUser,
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev].slice(0, 5));
        setUnreadCount((prev) => prev + 1);

        if ("Notification" in window && Notification.permission === "granted") {
          notificationService.sendPushNotification(newNotification.title, {
            body: newNotification.description,
            icon: "/favicon.ico",
          });
        }
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    const link = notificationService.getNotificationLink(notification);
    navigate(link);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/notifications")}
          >
            View All
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                    !notification.is_read && "bg-muted/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {!notification.is_read && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                      {notification.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {notificationService.formatNotificationTime(
                          notification.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
