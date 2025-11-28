import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  Star,
  Package,
  Briefcase,
  Trash2
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedNotifications = data?.map((notif: unknown) => ({
        id: notif.id,
        type: notif.type,
        title: getTitle(notif.type),
        message: notif.message,
        icon: getIcon(notif.type),
        color: getColor(notif.type),
        read: notif.read || false,
        created_at: notif.created_at,
        action_url: notif.action_url
      })) || [];

      setNotifications(formattedNotifications);
    } catch (error: unknown) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "message":
        return MessageCircle;
      case "review":
        return Star;
      case "shipping":
        return Package;
      case "job":
        return Briefcase;
      default:
        return Bell;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case "order":
        return "Order Update";
      case "message":
        return "New Message";
      case "review":
        return "New Review";
      case "shipping":
        return "Shipping Update";
      case "job":
        return "Job Alert";
      default:
        return "Notification";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-purple-500/10 text-purple-500";
      case "message":
        return "bg-blue-500/10 text-blue-500";
      case "review":
        return "bg-yellow-500/10 text-yellow-500";
      case "shipping":
        return "bg-cyan-500/10 text-cyan-500";
      case "job":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;
      fetchNotifications();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== id));
      toast({
        title: "Notification deleted"
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in-up">
            Notifications
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Stay updated with all your platform activity
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "order", label: "Orders" },
            { value: "message", label: "Messages" },
            { value: "job", label: "Jobs" }
          ].map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              className={filter === option.value ? "bg-gradient-to-r from-primary to-blue-500" : "glass-effect"}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="glass-effect border-border p-12 text-center animate-fade-in-up">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              {filter === "all" ? "You're all caught up!" : `No ${filter} notifications`}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif, index) => {
              const Icon = notif.icon;
              return (
                <Card
                  key={notif.id}
                  className={`glass-effect border-border hover-scale transition-all animate-fade-in-up p-4 ${
                    !notif.read ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{notif.title}</p>
                            {!notif.read && (
                              <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notif.created_at).toLocaleDateString()} at{" "}
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={() => handleDelete(notif.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {!notif.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-effect"
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        {notif.action_url && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-primary to-blue-500"
                            onClick={() => {
                              navigate(notif.action_url!);
                              handleMarkAsRead(notif.id);
                            }}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
