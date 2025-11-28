import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/animations/variants";
import { ArrowLeft, Calendar, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface Milestone {
  id: string;
  projectName: string;
  projectId: string;
  title: string;
  description: string;
  progress: number;
  status: "completed" | "in_progress" | "pending" | "at_risk";
  startDate: string;
  dueDate: string;
  completedDate?: string;
  deliverables: string[];
  assignee: string;
}

const ClientMilestones = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "completed" | "in_progress" | "pending" | "at_risk">("all");

  const [milestones] = useState<Milestone[]>([
    {
      id: "1",
      projectName: "Website Redesign",
      projectId: "1",
      title: "Design Phase",
      description: "Complete design and mockups for all pages",
      progress: 100,
      status: "completed",
      startDate: "2025-01-01",
      dueDate: "2025-01-10",
      completedDate: "2025-01-08",
      deliverables: ["Wireframes", "Mockups", "Design System"],
      assignee: "Sarah Chen"
    },
    {
      id: "2",
      projectName: "Website Redesign",
      projectId: "1",
      title: "Frontend Development",
      description: "Build responsive frontend components",
      progress: 75,
      status: "in_progress",
      startDate: "2025-01-11",
      dueDate: "2025-01-25",
      deliverables: ["React Components", "Responsive Design", "Accessibility"],
      assignee: "Sarah Chen"
    },
    {
      id: "3",
      projectName: "Website Redesign",
      projectId: "1",
      title: "Backend Integration",
      description: "API integration and backend setup",
      progress: 0,
      status: "pending",
      startDate: "2025-01-26",
      dueDate: "2025-02-10",
      deliverables: ["API Endpoints", "Database", "Authentication"],
      assignee: "Mike Johnson"
    },
    {
      id: "4",
      projectName: "Mobile App Development",
      projectId: "2",
      title: "Project Setup",
      description: "React Native project initialization and setup",
      progress: 100,
      status: "completed",
      startDate: "2025-01-02",
      dueDate: "2025-01-05",
      completedDate: "2025-01-04",
      deliverables: ["Project Structure", "Dependencies", "Build Config"],
      assignee: "Alex Rodriguez"
    },
    {
      id: "5",
      projectName: "Mobile App Development",
      projectId: "2",
      title: "UI Implementation",
      description: "Implement all screens and navigation",
      progress: 60,
      status: "in_progress",
      startDate: "2025-01-06",
      dueDate: "2025-01-25",
      deliverables: ["Screens", "Navigation", "Animations"],
      assignee: "Alex Rodriguez"
    },
    {
      id: "6",
      projectName: "Mobile App Development",
      projectId: "2",
      title: "Backend Connection",
      description: "Connect to backend APIs",
      progress: 20,
      status: "at_risk",
      startDate: "2025-01-20",
      dueDate: "2025-02-05",
      deliverables: ["API Integration", "Error Handling", "State Management"],
      assignee: "James Park"
    },
    {
      id: "7",
      projectName: "Brand Identity Design",
      projectId: "3",
      title: "Logo Design",
      description: "Create multiple logo variations",
      progress: 90,
      status: "in_progress",
      startDate: "2024-12-20",
      dueDate: "2025-01-05",
      deliverables: ["Logo Variations", "Logo Guidelines", "Favicon"],
      assignee: "Emma Wilson"
    },
    {
      id: "8",
      projectName: "Brand Identity Design",
      projectId: "3",
      title: "Brand Guidelines",
      description: "Comprehensive brand guidelines document",
      progress: 0,
      status: "pending",
      startDate: "2025-01-06",
      dueDate: "2025-01-20",
      deliverables: ["Color Palette", "Typography", "Imagery Rules"],
      assignee: "Lisa Zhang"
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

    } catch (error: unknown) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "at_risk":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "in_progress":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-600";
      case "at_risk":
        return "bg-red-500/20 text-red-600";
      case "in_progress":
        return "bg-blue-500/20 text-blue-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredMilestones = selectedStatus === "all" 
    ? milestones 
    : milestones.filter(m => m.status === selectedStatus);

  const statusCounts = {
    all: milestones.length,
    completed: milestones.filter(m => m.status === "completed").length,
    in_progress: milestones.filter(m => m.status === "in_progress").length,
    pending: milestones.filter(m => m.status === "pending").length,
    at_risk: milestones.filter(m => m.status === "at_risk").length
  };

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

          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
              Project Milestones
            </h1>
            <p className="text-muted-foreground">
              Track all your project milestones and deliverables
            </p>
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: "all" as const, count: statusCounts.all },
              { label: "Completed", value: "completed" as const, count: statusCounts.completed },
              { label: "In Progress", value: "in_progress" as const, count: statusCounts.in_progress },
              { label: "Pending", value: "pending" as const, count: statusCounts.pending },
              { label: "At Risk", value: "at_risk" as const, count: statusCounts.at_risk }
            ].map((tab) => (
              <Button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                variant={selectedStatus === tab.value ? "default" : "outline"}
                className={`${selectedStatus === tab.value ? "glass-effect" : ""}`}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-70">({tab.count})</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Milestones Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6"
        >
          {filteredMilestones.map((milestone) => {
            const daysLeft = Math.ceil((new Date(milestone.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <motion.div key={milestone.id} variants={itemVariants}>
                <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(milestone.status)}
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">{milestone.projectName}</p>
                            <h3 className="text-lg font-semibold">{milestone.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{milestone.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ml-4 ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${milestone.progress}%` }}
                          transition={{ delay: 0.2, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="mb-4 pb-4 border-b border-border/20">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">DELIVERABLES</p>
                      <div className="flex flex-wrap gap-2">
                        {milestone.deliverables.map((deliverable, idx) => (
                          <span key={idx} className="px-2 py-1 bg-muted/30 rounded text-xs">
                            {deliverable}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Assigned to: {milestone.assignee}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                          {daysLeft > 0 && (
                            <span className={daysLeft <= 3 ? "text-red-500" : ""}>
                              {daysLeft} days left
                            </span>
                          )}
                          {milestone.completedDate && (
                            <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredMilestones.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No milestones found.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientMilestones;
