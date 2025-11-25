import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Filter } from "lucide-react";
import { CheckCircle2, MessageSquare, FolderOpen, DollarSign, FileText, Zap } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  date: string;
  icon: any;
  color: string;
}

const WorkerActivity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [workerId, setWorkerId] = useState<string | undefined>();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (workerId) {
      fetchActivities();
      subscribeToActivities();
    }
  }, [workerId]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "worker")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You need the Worker role to access this page",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setWorkerId(session.user.id);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!workerId) return;
    try {
      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", workerId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!data) return;

      const iconMap: Record<string, any> = {
        milestone: CheckCircle2,
        feedback: MessageSquare,
        file: FolderOpen,
        payment: DollarSign,
        proposal: Zap
      };

      const colorMap: Record<string, string> = {
        milestone: "text-green-500",
        feedback: "text-blue-500",
        file: "text-purple-500",
        payment: "text-emerald-500",
        proposal: "text-yellow-500"
      };

      const transformed = data.map((activity: any) => {
        const createdDate = new Date(activity.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateLabel = "Today";
        if (createdDate.toDateString() === yesterday.toDateString()) {
          dateLabel = "Yesterday";
        } else if (createdDate.toDateString() !== today.toDateString()) {
          dateLabel = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }

        const timeElapsed = Math.floor((today.getTime() - createdDate.getTime()) / 1000);
        let timestamp = "Just now";
        if (timeElapsed > 3600) {
          timestamp = `${Math.floor(timeElapsed / 3600)} hours ago`;
        } else if (timeElapsed > 60) {
          timestamp = `${Math.floor(timeElapsed / 60)} minutes ago`;
        }

        return {
          id: activity.id,
          type: activity.activity_type || "message",
          title: activity.title || "Activity",
          description: activity.description || "",
          timestamp,
          date: dateLabel,
          icon: iconMap[activity.activity_type] || FileText,
          color: colorMap[activity.activity_type] || "text-blue-500"
        };
      });

      setActivities(transformed);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive"
      });
    }
  };

  const subscribeToActivities = () => {
    if (!workerId) return;
    const channel = supabase
      .channel(`activities:${workerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_log",
          filter: `user_id=eq.${workerId}`
        },
        () => {
          fetchActivities();
          toast({
            title: "Activity Updated",
            description: "New activity detected",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredActivities = selectedFilter === "all" 
    ? activities 
    : activities.filter(a => a.type === selectedFilter);

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const filters = [
    { label: "All", value: "all" },
    { label: "Milestones", value: "milestone" },
    { label: "Feedback", value: "feedback" },
    { label: "Payments", value: "payment" },
    { label: "Files", value: "file" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/worker")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Activity Timeline
            </h1>
            <p className="text-muted-foreground">Track all your project activities and updates</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                variant={selectedFilter === filter.value ? "default" : "outline"}
                size="sm"
                className={selectedFilter === filter.value ? "glass-effect" : ""}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{date}</h2>
              <div className="space-y-3">
                {dateActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all cursor-pointer group p-6">
                      <div className="flex items-start gap-4">
                        <div className={`${activity.color} mt-1 p-2 bg-muted/20 rounded-lg group-hover:bg-muted/40 transition-colors`}>
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-lg">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerActivity;
