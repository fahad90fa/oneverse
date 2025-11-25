import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/animations/variants";
import { ArrowLeft, Filter } from "lucide-react";
import {
  AlertCircle,
  Plus,
  Star,
  DollarSign,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";

interface Activity {
  id: string;
  type: "project_status" | "proposal_accepted" | "milestone" | "file_upload" | "payment" | "message";
  title: string;
  description: string;
  timestamp: string;
  date: string;
  icon: any;
  color: string;
  user?: string;
}

const ClientActivity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [activities] = useState<Activity[]>([
    {
      id: "1",
      type: "project_status",
      title: "Project Status Updated",
      description: "Website Redesign moved to In Progress",
      timestamp: "2 hours ago",
      date: "Today",
      icon: AlertCircle,
      color: "text-blue-500",
      user: "Sarah Chen"
    },
    {
      id: "2",
      type: "proposal_accepted",
      title: "Proposal Accepted",
      description: "Your proposal for Mobile App Development was accepted",
      timestamp: "4 hours ago",
      date: "Today",
      icon: CheckCircle,
      color: "text-green-500",
      user: "Mike Johnson"
    },
    {
      id: "3",
      type: "milestone",
      title: "Milestone Completed",
      description: "Design Phase milestone completed successfully",
      timestamp: "Yesterday",
      date: "Yesterday",
      icon: Star,
      color: "text-yellow-500",
      user: "Emma Wilson"
    },
    {
      id: "4",
      type: "payment",
      title: "Payment Received",
      description: "Received $2,500 for completed Mobile App project",
      timestamp: "3 days ago",
      date: "Nov 20",
      icon: DollarSign,
      color: "text-emerald-500"
    },
    {
      id: "5",
      type: "file_upload",
      title: "File Upload",
      description: "New files uploaded to Website Redesign project",
      timestamp: "4 days ago",
      date: "Nov 19",
      icon: FileText,
      color: "text-purple-500",
      user: "Alex Rodriguez"
    },
    {
      id: "6",
      type: "message",
      title: "New Message",
      description: "James Park sent a message about Infrastructure Setup",
      timestamp: "5 days ago",
      date: "Nov 18",
      icon: Plus,
      color: "text-orange-500",
      user: "James Park"
    },
    {
      id: "7",
      type: "project_status",
      title: "Project Created",
      description: "New project 'Brand Identity Design' created",
      timestamp: "1 week ago",
      date: "Nov 17",
      icon: AlertCircle,
      color: "text-blue-500"
    },
    {
      id: "8",
      type: "milestone",
      title: "Milestone Created",
      description: "Phase 2 - Development milestone added to Website Redesign",
      timestamp: "1 week ago",
      date: "Nov 17",
      icon: Clock,
      color: "text-cyan-500"
    }
  ]);

  useEffect(() => {
    checkAccess();
  }, []);

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
        .eq("role", "client")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You need the Client role to access this page",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
    { label: "Project Status", value: "project_status" },
    { label: "Proposals", value: "proposal_accepted" },
    { label: "Milestones", value: "milestone" },
    { label: "Payments", value: "payment" },
    { label: "Files", value: "file_upload" }
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
            onClick={() => navigate("/dashboard/client")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
                Activity Timeline
              </h1>
              <p className="text-muted-foreground">
                Track all your project activities and updates
              </p>
            </div>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{date}</h2>
              <div className="space-y-3">
                {dateActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                  >
                    <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="p-6">
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
                            {activity.user && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                  {activity.user.split(" ").map(n => n[0]).join("")}
                                </div>
                                <span className="text-sm text-muted-foreground">{activity.user}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No activities found for the selected filter.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientActivity;
