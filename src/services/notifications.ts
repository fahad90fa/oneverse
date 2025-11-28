import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

/** Supported notification types in the system */
export type NotificationType =
  | "order"
  | "message"
  | "job"
  | "review"
  | "payment"
  | "follow"
  | "comment"
  | "like"
  | "proposal";

/** Core notification data structure */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  description?: string;
  related_id?: string;
  related_type?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

/** User's notification preferences and settings */
export interface NotificationPreference {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  notification_types?: Record<NotificationType, boolean>;
  updated_at: string;
}

/** Grouped notifications organized by date */
export interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
}

/** Service error with standardized format */
export interface NotificationError {
  message: string;
  code?: string;
  originalError?: Error;
}

const handleSupabaseError = (error: Error | null): never => {
  if (!error) throw new Error("Unknown error occurred");
  throw error;
};

export const notificationService = {
  /**
   * Create a new notification
   * @param data - Notification data (excluding id, created_at, updated_at)
   * @returns The created notification
   * @throws Error if creation fails
   */
  async createNotification(
    data: Omit<Notification, "id" | "created_at" | "updated_at">
  ): Promise<Notification> {
    const result = await (supabase
      .from("notifications" as never)
      .insert(data as never)
      .select()
      .single() as unknown);

    const { data: notification, error } = result as {
      data: unknown;
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
    return notification as Notification;
  },

  /**
   * Fetch notifications for a user with optional filtering
   * @param userId - User ID to fetch notifications for
   * @param limit - Maximum notifications to fetch (default: 20)
   * @param offset - Pagination offset (default: 0)
   * @param filter - Optional notification type filter
   * @returns Array of notifications
   */
  async getNotifications(
    userId: string,
    limit = 20,
    offset = 0,
    filter?: NotificationType
  ): Promise<Notification[]> {
    if (!userId) return [];

    let query = supabase
      .from("notifications" as never)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1) as unknown;

    if (filter) {
      query = query.eq("type", filter);
    }

    const { data, error } = (await query) as {
      data: unknown;
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
    return (data as Notification[]) || [];
  },

  /**
   * Get count of unread notifications for a user
   * @param userId - User ID
   * @returns Count of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) return 0;

    const { count, error } = (await supabase
      .from("notifications" as never)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)) as {
      count: number | null;
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
    return count || 0;
  },

  /**
   * Mark a single notification as read
   * @param notificationId - Notification ID
   * @throws Error if operation fails
   */
  async markAsRead(notificationId: string): Promise<void> {
    if (!notificationId) return;

    const { error } = (await supabase
      .from("notifications" as never)
      .update({ is_read: true } as never)
      .eq("id", notificationId)) as {
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
  },

  /**
   * Mark all unread notifications as read for a user
   * @param userId - User ID
   * @throws Error if operation fails
   */
  async markAllAsRead(userId: string): Promise<void> {
    if (!userId) return;

    const { error } = (await supabase
      .from("notifications" as never)
      .update({ is_read: true } as never)
      .eq("user_id", userId)
      .eq("is_read", false)) as {
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
  },

  /**
   * Delete a single notification
   * @param notificationId - Notification ID
   * @throws Error if operation fails
   */
  async deleteNotification(notificationId: string): Promise<void> {
    if (!notificationId) return;

    const { error } = (await supabase
      .from("notifications" as never)
      .delete()
      .eq("id", notificationId)) as {
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
  },

  /**
   * Delete all notifications of a specific type for a user
   * @param userId - User ID
   * @param type - Notification type to delete
   * @throws Error if operation fails
   */
  async deleteNotificationsOfType(
    userId: string,
    type: NotificationType
  ): Promise<void> {
    if (!userId || !type) return;

    const { error } = (await supabase
      .from("notifications" as never)
      .delete()
      .eq("user_id", userId)
      .eq("type", type)) as {
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
  },

  /**
   * Get notification preferences for a user
   * @param userId - User ID
   * @returns User's notification preferences or null if not found
   */
  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreference | null> {
    if (!userId) return null;

    const { data, error } = (await supabase
      .from("notification_preferences" as never)
      .select("*")
      .eq("user_id", userId)
      .single()) as {
      data: unknown;
      error: { code?: string } | null;
    };

    if (error && error.code !== "PGRST116")
      handleSupabaseError(error as Error | null);
    return (data as NotificationPreference) || null;
  },

  /**
   * Update notification preferences for a user
   * @param userId - User ID
   * @param preferences - Preferences to update
   * @returns Updated notification preferences
   * @throws Error if operation fails
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    if (!userId) throw new Error("User ID is required");

    const { data, error } = (await supabase
      .from("notification_preferences" as never)
      .upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        } as never
      )
      .select()
      .single()) as {
      data: unknown;
      error: unknown;
    };

    if (error) handleSupabaseError(error as Error | null);
    return data as NotificationPreference;
  },

  /**
   * Subscribe to real-time notifications for a user
   * @param userId - User ID
   * @param callback - Function to call when new notification arrives
   * @returns RealtimeChannel for subscription management
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): RealtimeChannel {
    return supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  },

  /**
   * Request user permission for browser push notifications
   * @returns True if permission granted, false otherwise
   */
  async requestPushPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch {
      return false;
    }
  },

  /**
   * Send a browser push notification
   * @param title - Notification title
   * @param options - Notification options
   * @returns The browser Notification object or null if not supported/allowed
   */
  sendPushNotification(
    title: string,
    options?: NotificationOptions
  ): globalThis.Notification | null {
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return null;
    }

    try {
      return new Notification(title, options);
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to push notifications via service worker
   * @returns PushSubscription or null if not supported/failed
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        console.warn("VAPID public key not configured");
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const userId = (session as unknown)?.user?.id;
      
      if (userId) {
        await (supabase.from("push_subscriptions" as never).upsert({
          user_id: userId,
          subscription: JSON.stringify(subscription),
          updated_at: new Date().toISOString(),
        } as never) as unknown);
      }

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  },

  /**
   * Get the appropriate link for a notification based on its type
   * @param notification - The notification object
   * @returns URL path for the notification
   */
  getNotificationLink(notification: Notification): string {
    const { type, related_id } = notification;

    const linkMap: Record<NotificationType, string> = {
      order: `/order/${related_id}`,
      message: "/chat",
      job: `/job/${related_id}`,
      proposal: `/proposals/${related_id}`,
      review: `/profile/${related_id}`,
      payment: "/orders",
      follow: `/profile/${related_id}`,
      comment: "/social",
      like: "/social",
    };

    return linkMap[type] || "/notifications";
  },

  /**
   * Format a timestamp as a relative time string
   * @param createdAt - ISO timestamp string
   * @returns Human-readable relative time (e.g., "2m ago")
   */
  formatNotificationTime(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - created.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return created.toLocaleDateString();
  },

  /**
   * Group notifications by date (today, yesterday, this week, earlier)
   * @param notifications - Array of notifications to group
   * @returns Grouped notifications organized by date
   */
  groupNotificationsByDate(
    notifications: Notification[]
  ): GroupedNotifications {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return notifications.reduce<GroupedNotifications>(
      (acc, notification) => {
        const created = new Date(notification.created_at);
        const createdDate = new Date(
          created.getFullYear(),
          created.getMonth(),
          created.getDate()
        );

        if (createdDate.getTime() === today.getTime()) {
          acc.today.push(notification);
        } else if (createdDate.getTime() === yesterday.getTime()) {
          acc.yesterday.push(notification);
        } else if (createdDate.getTime() >= weekAgo.getTime()) {
          acc.thisWeek.push(notification);
        } else {
          acc.earlier.push(notification);
        }

        return acc;
      },
      {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: [],
      }
    );
  },
};
