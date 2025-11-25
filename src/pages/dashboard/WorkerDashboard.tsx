import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/animations/variants";
import { useDashboardQueries } from "@/hooks/useDashboardQueries";
import {
  Wrench,
  Briefcase,
  FolderOpen,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Plus,
  Star,
  MessageSquare,
  Code,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  ChevronRight
} from "lucide-react";
import {
  LineChart,
  Line,
  DoughnutChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WorkerStats {
  gigsCreated: number;
  activeProjects: number;
  totalEarnings: number;
  avgRating: number;
  totalReviews: number;
  topSkill: string;
}

interface Proposal {
  id: string;
  projectTitle: string;
  clientName: string;
  status: "pending" | "accepted" | "rejected" | "in_review";
  budget: number;
  submitDate: string;
}

interface Activity {
  id: string;
  type: "milestone" | "feedback" | "file" | "payment" | "message";
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

interface Project {
  id: string;
  title: string;
  clientName: string;
  status: "active" | "completed" | "pending";
  progress: number;
  dueDate: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workerId, setWorkerId] = useState<string | undefined>();
  const [stats, setStats] = useState<WorkerStats>({
    gigsCreated: 0,
    activeProjects: 0,
    totalEarnings: 0,
    avgRating: 0,
    totalReviews: 0,
    topSkill: ""
  });

  const { useWorkerStats, useWorkerGigs, useWorkerProposals, useWorkerReviews, subscribeToWorkerStats } = useDashboardQueries();
  
  const statsQuery = useWorkerStats(workerId);
  const gigsQuery = useWorkerGigs(workerId);
  const proposalsQuery = useWorkerProposals(workerId);
  const reviewsQuery = useWorkerReviews(workerId);

  const [earningsData, setEarningsData] = useState<Record<string, unknown>[]>([]);
  const [earningsByCategory, setEarningsByCategory] = useState<Record<string, unknown>[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [skillsData, setSkillsData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!statsQuery.data) return;
    setStats(statsQuery.data);
  }, [statsQuery.data]);

  useEffect(() => {
    if (!gigsQuery.data) return;
    const projects = gigsQuery.data.map((gig: any) => ({
      id: gig.id,
      title: gig.title,
      clientName: 'Client',
      status: gig.status === 'active' ? 'active' : 'completed',
      progress: Math.floor(Math.random() * 100),
      dueDate: gig.created_at
    }));
    setActiveProjects(projects);
  }, [gigsQuery.data]);

  useEffect(() => {
    if (!proposalsQuery.data) return;
    const transformed = proposalsQuery.data.map((proposal: any) => ({
      id: proposal.id,
      projectTitle: proposal.job?.title || 'Untitled',
      clientName: proposal.client?.full_name || 'Unknown',
      status: proposal.status,
      budget: Number(proposal.amount) || 0,
      submitDate: new Date(proposal.created_at).toLocaleDateString()
    }));
    setProposals(transformed);
  }, [proposalsQuery.data]);

  useEffect(() => {
    if (!reviewsQuery.data) return;
    const transformed = reviewsQuery.data.map((review: any) => ({
      id: review.id,
      clientName: review.reviewer?.full_name || 'Unknown',
      rating: review.rating,
      comment: review.comment || '',
      date: new Date(review.created_at).toLocaleDateString()
    }));
    setReviews(transformed);
  }, [reviewsQuery.data]);

  useEffect(() => {
    fetchEarningsData();
  }, [workerId]);

  useEffect(() => {
    fetchActivityLogs();
  }, [workerId]);

  useEffect(() => {
    fetchSkillsData();
  }, [workerId]);

  const fetchEarningsData = async () => {
    if (!workerId) return;
    try {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('worker_id', workerId)
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      if (!paymentsData) return;

      const monthlyEarnings: Record<string, number> = {};
      const categoryEarnings: Record<string, number> = {};

      paymentsData.forEach((payment: any) => {
        const date = new Date(payment.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        const category = payment.category || 'Other';

        monthlyEarnings[monthKey] = (monthlyEarnings[monthKey] || 0) + Number(payment.amount || 0);
        categoryEarnings[category] = (categoryEarnings[category] || 0) + Number(payment.amount || 0);
      });

      const earnings = Object.entries(monthlyEarnings).map(([month, earnings]) => ({
        month,
        earnings
      }));

      const totalCategoryEarnings = Object.values(categoryEarnings).reduce((a: number, b: number) => a + b, 0);
      const categories = Object.entries(categoryEarnings).map(([name, value]) => ({
        name,
        value: totalCategoryEarnings > 0 ? Math.round((value / totalCategoryEarnings) * 100) : 0
      }));

      setEarningsData(earnings);
      setEarningsByCategory(categories);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchActivityLogs = async () => {
    if (!workerId) return;
    try {
      const { data: activities } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', workerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!activities) return;

      const iconMap: Record<string, any> = {
        milestone: CheckCircle2,
        feedback: MessageSquare,
        file: FolderOpen,
        payment: DollarSign,
        message: MessageSquare
      };

      const colorMap: Record<string, string> = {
        milestone: 'text-green-500',
        feedback: 'text-blue-500',
        file: 'text-purple-500',
        payment: 'text-emerald-500',
        message: 'text-blue-500'
      };

      const transformed = activities.map((activity: any) => ({
        id: activity.id,
        type: activity.activity_type || 'message',
        title: activity.title || 'Activity',
        description: activity.description || '',
        timestamp: new Date(activity.created_at).toLocaleDateString(),
        icon: iconMap[activity.activity_type] || MessageSquare,
        color: colorMap[activity.activity_type] || 'text-blue-500'
      }));

      setRecentActivities(transformed);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchSkillsData = async () => {
    if (!workerId) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills')
        .eq('user_id', workerId)
        .single();

      if (profile?.skills && Array.isArray(profile.skills)) {
        const skills = profile.skills.slice(0, 5).map((skill: any) => ({
          skill: typeof skill === 'string' ? skill : skill.name || 'Unknown',
          level: typeof skill === 'object' ? skill.level || 85 : 85
        }));
        setSkillsData(skills);
      } else {
        setSkillsData([
          { skill: 'Web Development', level: 90 },
          { skill: 'Design', level: 85 },
          { skill: 'Communication', level: 88 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkillsData([
        { skill: 'Web Development', level: 90 },
        { skill: 'Design', level: 85 },
        { skill: 'Communication', level: 88 }
      ]);
    }
  };

  const unsubscribeActivities = () => {
    if (!workerId) return () => {};
    const channel = supabase
      .channel(`activities:${workerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_log',
          filter: `user_id=eq.${workerId}`
        },
        () => {
          fetchActivityLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (!workerId) return;
    const unsubscribe = unsubscribeActivities();
    return unsubscribe;
  }, [workerId]);

  useEffect(() => {
    const unsubscribe = subscribeToWorkerStats(workerId, () => {
      toast({
        title: "Dashboard Updated",
        description: "Real-time data has been refreshed",
      });
    });
    return unsubscribe;
  }, [workerId]);

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
        .eq("role", "worker")
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You need the Worker role to access this dashboard",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      setWorkerId(session.user.id);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive"
      });
    }
  };

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

  const metricCards = [
    { title: "Gigs Created", value: stats.gigsCreated, icon: Wrench, gradient: "from-pink-500 to-purple-500", bgColor: "bg-pink-500/10" },
    { title: "Active Jobs Applied", value: proposals.filter((p: Proposal) => p.status === 'pending').length, icon: Briefcase, gradient: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
    { title: "Active Projects", value: stats.activeProjects, icon: FolderOpen, gradient: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10" },
    { title: "Total Earnings", value: `$${stats.totalEarnings.toFixed(0)}`, icon: DollarSign, gradient: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
    { title: "Avg Client Rating", value: `${stats.avgRating}⭐`, icon: Star, gradient: "from-yellow-500 to-amber-500", bgColor: "bg-yellow-500/10" },
    { title: "Top Skill", value: stats.topSkill || "N/A", icon: Code, gradient: "from-indigo-500 to-purple-500", bgColor: "bg-indigo-500/10" }
  ];

  const quickActions = [
    { icon: Plus, label: "Create New Gig", action: () => navigate("/gigs"), gradient: "from-pink-500 to-purple-500" },
    { icon: Briefcase, label: "Find Jobs", action: () => navigate("/jobs"), gradient: "from-blue-500 to-cyan-500" },
    { icon: Zap, label: "Submit Proposal", action: () => navigate("/jobs"), gradient: "from-purple-500 to-pink-500" },
    { icon: FolderOpen, label: "Manage Active Gigs", action: () => navigate("/dashboard/worker/gigs"), gradient: "from-orange-500 to-red-500" },
    { icon: Eye, label: "View Portfolio", action: () => navigate("/dashboard/worker/portfolio"), gradient: "from-green-500 to-emerald-500" },
    { icon: Award, label: "Recommended Jobs", action: () => navigate("/jobs"), gradient: "from-indigo-500 to-purple-500" }
  ];

  const isLoading = statsQuery.isLoading || gigsQuery.isLoading || proposalsQuery.isLoading;
  const criticalError = (statsQuery.isError && !statsQuery.data) || (!workerId && !statsQuery.data);

  useEffect(() => {
    if (statsQuery.isError) {
      console.error('Stats query error:', statsQuery.error);
    }
    if (gigsQuery.isError) {
      console.error('Gigs query error:', gigsQuery.error);
    }
    if (proposalsQuery.isError) {
      console.error('Proposals query error:', proposalsQuery.error);
    }
  }, [statsQuery.isError, gigsQuery.isError, proposalsQuery.isError]);

  if (isLoading && !statsQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (criticalError) {
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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Freelancer Command Center
              </h1>
              <p className="text-muted-foreground">
                Manage gigs, track earnings, and grow your freelance business
              </p>
            </div>
            <Button 
              onClick={() => navigate("/gigs")}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Gig
            </Button>
          </div>
        </motion.div>

        {/* Advanced Metrics Grid */}
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

        {/* Earnings Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Earnings Insights</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/worker/analytics")}
                  className="glass-effect"
                >
                  View All Analytics
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Earnings */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Monthly Earnings Growth</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={earningsData}>
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
                        dataKey="earnings"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Earnings by Category */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Earnings by Category</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={earningsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {earningsByCategory.map((entry, index) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/20">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Payment</p>
                  <p className="text-2xl font-bold">$1,500</p>
                  <p className="text-xs text-muted-foreground mt-1">TechCorp Inc - 3 days ago</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Highest Paying Client (This Month)</p>
                  <p className="text-2xl font-bold">StartupX</p>
                  <p className="text-xs text-muted-foreground mt-1">$2,800 pending</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
                    <p className="text-sm text-muted-foreground">Manage & grow</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Recent Proposals */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-border/50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Recent Proposals</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/dashboard/worker/activity")}
                    className="glass-effect"
                  >
                    View All
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {proposals.map((proposal, index) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{proposal.projectTitle}</p>
                          <p className="text-sm text-muted-foreground">{proposal.clientName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{proposal.submitDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-cyan-500">${proposal.budget}</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                            proposal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                            proposal.status === 'accepted' ? 'bg-green-500/20 text-green-600' :
                            'bg-blue-500/20 text-blue-600'
                          }`}>
                            {proposal.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Ratings & Reviews */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Ratings</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/worker/reviews")}
                  className="glass-effect"
                >
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-border/20">
                  <p className="text-5xl font-bold text-yellow-500 mb-1">4.8</p>
                  <p className="text-sm text-muted-foreground">Based on 12 reviews</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{review.clientName}</p>
                        <span className="text-xs text-yellow-500">{"★".repeat(Math.round(review.rating))}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-xs mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Active Projects & Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Active Projects */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Active Projects</h2>

              <div className="space-y-5">
                {activeProjects.filter(p => p.status === 'active').map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.clientName}</p>
                      </div>
                      <span className="text-sm font-bold text-cyan-500">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                      ></motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* Skill Heatmap */}
          <Card className="glass-effect border-border/50">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Top Skills</h2>

              <div className="space-y-4">
                {skillsData.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{skill.skill}</span>
                      <span className="text-xs text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 glass-effect"
                onClick={() => navigate("/dashboard/worker/portfolio")}
              >
                Configure Portfolio
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
