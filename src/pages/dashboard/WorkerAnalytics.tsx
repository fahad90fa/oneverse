import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/animations/variants";
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const WorkerAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | undefined>();
  const [earningsData, setEarningsData] = useState<Record<string, unknown>[]>([]);
  const [projectData, setProjectData] = useState<Record<string, unknown>[]>([]);
  const [metrics, setMetrics] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    activeProjects: 0,
    completionRate: 0
  });

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (workerId) {
      fetchAnalyticsData();
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

  const fetchAnalyticsData = async () => {
    if (!workerId) return;
    try {
      const [paymentsRes, projectsRes] = await Promise.all([
        supabase
          .from("payments")
          .select("*")
          .eq("worker_id", workerId)
          .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString()),
        supabase
          .from("projects")
          .select("*")
          .eq("worker_id", workerId)
      ]);

      const payments = paymentsRes.data || [];
      const projects = projectsRes.data || [];

      const monthlyEarnings: Record<string, number> = {};
      const currentMonth = new Date();
      let thisMonthTotal = 0;

      payments.forEach((payment: any) => {
        const date = new Date(payment.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

        monthlyEarnings[monthKey] = (monthlyEarnings[monthKey] || 0) + Number(payment.amount || 0);

        if (
          date.getMonth() === currentMonth.getMonth() &&
          date.getFullYear() === currentMonth.getFullYear()
        ) {
          thisMonthTotal += Number(payment.amount || 0);
        }
      });

      const earnings = Object.entries(monthlyEarnings).map(([month, amount]) => ({
        month,
        earnings: amount
      }));

      const categoryEarnings: Record<string, Record<string, number>> = {};
      projects.forEach((project: any) => {
        const category = project.category || "Other";
        if (!categoryEarnings[category]) {
          categoryEarnings[category] = { completed: 0, active: 0, pending: 0 };
        }
        const status = project.status || "pending";
        if (status === "completed") categoryEarnings[category].completed++;
        else if (status === "active") categoryEarnings[category].active++;
        else categoryEarnings[category].pending++;
      });

      const categories = Object.entries(categoryEarnings).map(([name, stats]) => ({
        name,
        ...stats
      }));

      const activeCount = projects.filter((p: any) => p.status === "active").length;
      const completedCount = projects.filter((p: any) => p.status === "completed").length;
      const completionRate = projects.length > 0 
        ? Math.round((completedCount / projects.length) * 100) 
        : 0;
      const totalEarnings = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      setEarningsData(earnings.length > 0 ? earnings : [
        { month: "Jan", earnings: 0 },
        { month: "Feb", earnings: 0 },
        { month: "Mar", earnings: 0 },
        { month: "Apr", earnings: 0 },
        { month: "May", earnings: 0 },
        { month: "Jun", earnings: 0 }
      ]);
      setProjectData(categories.length > 0 ? categories : [
        { name: "Web Development", completed: 0, active: 0, pending: 0 },
        { name: "Design", completed: 0, active: 0, pending: 0 }
      ]);
      setMetrics({
        totalEarnings,
        thisMonth: thisMonthTotal,
        activeProjects: activeCount,
        completionRate
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    }
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
            onClick={() => navigate("/dashboard/worker")}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Earnings Analytics
              </h1>
              <p className="text-muted-foreground">
                Detailed insights into your earnings and performance
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "Total Earnings", value: `$${metrics.totalEarnings.toFixed(0)}`, trend: "+28.3%", positive: true },
            { label: "This Month", value: `$${metrics.thisMonth.toFixed(0)}`, trend: "-5.2%", positive: false },
            { label: "Active Projects", value: metrics.activeProjects.toString(), trend: "+50%", positive: true },
            { label: "Completion Rate", value: `${metrics.completionRate}%`, trend: "+3%", positive: true }
          ].map((metric, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="glass-effect border-border/50 p-6">
                <p className="text-muted-foreground text-sm mb-2">{metric.label}</p>
                <h3 className="text-3xl font-bold mb-3">{metric.value}</h3>
                <div className={`flex items-center gap-2 text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                  {metric.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {metric.trend}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <Card className="glass-effect border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Earnings Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsData}>
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
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-effect border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Projects by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis stroke="rgba(148, 163, 184, 0.5)" dataKey="name" />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                <Bar dataKey="active" stackId="a" fill="#3b82f6" name="Active" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-effect border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Monthly Earnings</h2>
            <ResponsiveContainer width="100%" height={300}>
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
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ fill: "#ec4899", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Monthly Earnings"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkerAnalytics;
