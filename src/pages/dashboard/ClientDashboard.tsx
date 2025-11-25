import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cardVariants, containerVariants, itemVariants } from "@/animations/variants";
import { useDashboardQueries } from "@/hooks/useDashboardQueries";
import {
  Briefcase,
  Users,
  FolderOpen,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Plus,
  MessageSquare,
  BarChart3,
  ClipboardList,
  FileText,
  Activity,
  Clock,
  Star,
  ChevronRight,
  MoreVertical,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  DoughnutChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ClientStats {
  totalJobs: number;
  activeProjects: number;
  totalSpent: number;
  pendingProposals: number;
  topWorker: string | null;
  successRate: number;
}

interface ProjectMilestone {
  projectId: string;
  projectName: string;
  progress: number;
  dueDate: string;
  workerId: string;
}

interface RecentActivity {
  id: string;
  type: "project_status" | "proposal_accepted" | "milestone" | "file_upload" | "payment";
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

interface ProposalData {
  id: string;
  workerName: string;
  title: string;
  budget: number;
  deliveryTime: number;
  status: "pending" | "accepted" | "rejected";
  rating?: number;
}

interface TopWorker {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  trustScore: number;
  lastProject: string;
  verified: boolean;
  topRated: boolean;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | undefined>();
  const [stats, setStats] = useState<ClientStats>({
    totalJobs: 0,
    activeProjects: 0,
    totalSpent: 0,
    pendingProposals: 0,
    topWorker: null,
    successRate: 0
  });

  const { useClientStats, useClientProjects, useClientProposals, useClientActivity, subscribeToClientStats } = useDashboardQueries();
  
  const statsQuery = useClientStats(clientId);
  const projectsQuery = useClientProjects(clientId);
  const proposalsQuery = useClientProposals(clientId);
  const activityQuery = useClientActivity(clientId);

  const [spendingData, setSpendingData] = useState([
    { month: "Jan", amount: 0 },
    { month: "Feb", amount: 0 },
    { month: "Mar", amount: 0 },
    { month: "Apr", amount: 0 },
    { month: "May", amount: 0 },
    { month: "Jun", amount: 0 }
  ]);

  const [projectTypesData] = useState([
    { name: "Web Development", value: 35 },
    { name: "Design", value: 25 },
    { name: "Content Writing", value: 20 },
    { name: "Marketing", value: 15 },
    { name: "Consulting", value: 5 }
  ]);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "project_status",
      title: "Project Status Updated",
      description: "Website Redesign moved to In Progress",
      timestamp: "2 hours ago",
      icon: AlertCircle,
      color: "text-blue-500"
    },
    {
      id: "2",
      type: "proposal_accepted",
      title: "Proposal Accepted",
      description: "Sarah Chen accepted your Mobile App proposal",
      timestamp: "4 hours ago",
      icon: Plus,
      color: "text-green-500"
    },
    {
      id: "3",
      type: "milestone",
      title: "Milestone Completed",
      description: "Design Phase complete - Mobile App Development",
      timestamp: "Yesterday",
      icon: Star,
      color: "text-yellow-500"
    },
    {
      id: "4",
      type: "payment",
      title: "Payment Received",
      description: "Received $2,500 for completed project",
      timestamp: "3 days ago",
      icon: DollarSign,
      color: "text-emerald-500"
    }
  ]);

  const [topWorkers, setTopWorkers] = useState<TopWorker[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestone[]>([]);
  const [proposals, setProposals] = useState<ProposalData[]>([]);

  useEffect(() => {
    if (!projectsQuery.data) return;
    const milestones = projectsQuery.data.map((project: any) => ({
      projectId: project.id,
      projectName: project.title,
      progress: Math.floor(Math.random() * 100),
      dueDate: project.created_at,
      workerId: project.worker_id
    }));
    setProjectMilestones(milestones);
  }, [projectsQuery.data]);

  useEffect(() => {
    if (!proposalsQuery.data) return;
    const transformedProposals = proposalsQuery.data.map((proposal: any) => ({
      id: proposal.id,
      workerName: proposal.worker?.full_name || 'Unknown',
      title: proposal.job?.title || 'Untitled',
      budget: Number(proposal.amount) || 0,
      deliveryTime: proposal.delivery_days || 0,
      status: proposal.status as "pending" | "accepted" | "rejected",
      rating: 4.5
    }));
    setProposals(transformedProposals);
  }, [proposalsQuery.data]);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (!statsQuery.data) return;
    setStats(statsQuery.data);
  }, [statsQuery.data]);

  useEffect(() => {
    if (!activityQuery.data) return;
    const transformedActivities = activityQuery.data.map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description || '',
      timestamp: new Date(activity.created_at).toLocaleDateString(),
      icon: AlertCircle,
      color: 'text-blue-500'
    }));
    setRecentActivities(transformedActivities);
  }, [activityQuery.data]);

  useEffect(() => {
    const unsubscribe = subscribeToClientStats(clientId, () => {
      toast({
        title: "Dashboard Updated",
        description: "Real-time data has been refreshed",
      });
    });
    return unsubscribe;
  }, [clientId]);

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
          description: "You need the Client role to access this dashboard",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setClientId(session.user.id);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive"
      });
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const metricCards = [
    {
      title: "Total Jobs Posted",
      value: stats.totalJobs,
      icon: Briefcase,
      gradient: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: FolderOpen,
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(0)}`,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Pending Proposals",
      value: stats.pendingProposals,
      icon: MessageSquare,
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Top Rated Worker",
      value: stats.topWorker || "N/A",
      icon: Star,
      gradient: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Project Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      gradient: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-500/10"
    }
  ];

  const quickActions = [
    { icon: Briefcase, label: "Post New Job", action: () => navigate("/jobs"), gradient: "from-cyan-500 to-blue-500" },
    { icon: Users, label: "Browse Workers", action: () => navigate("/gigs"), gradient: "from-purple-500 to-pink-500" },
    { icon: FolderOpen, label: "Manage Projects", action: () => navigate("/projects"), gradient: "from-green-500 to-emerald-500" },
    { icon: MessageSquare, label: "Review Proposals", action: () => navigate("/dashboard/client/proposals"), gradient: "from-orange-500 to-red-500" },
    { icon: BarChart3, label: "Analyze Progress", action: () => navigate("/dashboard/client/analytics"), gradient: "from-indigo-500 to-purple-500" },
    { icon: ClipboardList, label: "Contracts Summary", action: () => navigate("/projects"), gradient: "from-rose-500 to-pink-500" }
  ];

  const isLoading = statsQuery.isLoading || projectsQuery.isLoading || proposalsQuery.isLoading;
  const hasError = statsQuery.isError || projectsQuery.isError || proposalsQuery.isError;

  if (isLoading && !statsQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Failed to load your dashboard data. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
                Client Executive Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your projects, workers, and business growth
              </p>
            </div>
            <Button 
              onClick={() => navigate("/jobs")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {metricCards.map((metric, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden">
                <div className="p-6 relative">
                  <div className={`absolute inset-0 ${metric.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}>
                        <metric.icon className="h-6 w-6 text-white" />
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Analytics Overview</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/client/analytics")}
                  className="glass-effect"
                >
                  View All Analytics
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Spending Chart */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Monthly Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={spendingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis stroke="rgba(148, 163, 184, 0.5)" />
                      <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "8px"
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Project Types Distribution */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Project Types Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={projectTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          borderRadius: "8px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="glass-effect border-border/50 hover:border-primary/50 cursor-pointer transition-all group"
                  onClick={action.action}
                >
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">Manage and track</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & Top Workers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Recent Activity */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/client/activity")}
                  className="glass-effect"
                >
                  See All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0"
                  >
                    <div className={`${activity.color} mt-1`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Top Workers Carousel */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Top Workers</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/gigs")}
                  className="glass-effect"
                >
                  Browse All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topWorkers.map((worker, index) => (
                  <motion.div
                    key={worker.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {worker.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{worker.name}</p>
                          {worker.verified && (
                            <span className="text-blue-500 text-xs">✓</span>
                          )}
                          {worker.topRated && (
                            <span className="text-yellow-500 text-xs">★</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{worker.role}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-sm">{worker.trustScore}</p>
                      <p className="text-xs text-muted-foreground">Trust Score</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Project Milestones & Proposals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Project Milestones */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Active Project Milestones</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/client/milestones")}
                  className="glass-effect"
                >
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-5">
                {projectMilestones.map((milestone) => (
                  <motion.div
                    key={milestone.projectId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{milestone.projectName}</p>
                      <span className="text-sm font-bold text-cyan-500">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${milestone.progress}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      ></motion.div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Latest Proposals */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Latest Proposals</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/client/proposals")}
                  className="glass-effect"
                >
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {proposals.slice(0, 3).map((proposal, index) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold">{proposal.workerName}</p>
                        <p className="text-sm text-muted-foreground">{proposal.title}</p>
                      </div>
                      {proposal.rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {proposal.rating}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-cyan-500">${proposal.budget}</span>
                      <span className="text-muted-foreground">{proposal.deliveryTime} days</span>
                      <Badge status={proposal.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

function Badge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  const statusConfig = {
    pending: "bg-yellow-500/20 text-yellow-600",
    accepted: "bg-green-500/20 text-green-600",
    rejected: "bg-red-500/20 text-red-600"
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusConfig[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default ClientDashboard;
