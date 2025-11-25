import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/animations/variants";
import { useDashboardQueries } from "@/hooks/useDashboardQueries";
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

interface AnalyticsData {
  revenue: Array<{ month: string; amount: number }>;
  spending: Array<{ month: string; amount: number }>;
  projects: Array<{ name: string; completed: number; active: number; pending: number }>;
}

const ClientAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData] = useState<AnalyticsData>({
    revenue: [
      { month: "Jan", amount: 5000 },
      { month: "Feb", amount: 7200 },
      { month: "Mar", amount: 6800 },
      { month: "Apr", amount: 9500 },
      { month: "May", amount: 8900 },
      { month: "Jun", amount: 11200 }
    ],
    spending: [
      { month: "Jan", amount: 1200 },
      { month: "Feb", amount: 2000 },
      { month: "Mar", amount: 1800 },
      { month: "Apr", amount: 2500 },
      { month: "May", amount: 3000 },
      { month: "Jun", amount: 2800 }
    ],
    projects: [
      { name: "Web Development", completed: 12, active: 3, pending: 2 },
      { name: "Design", completed: 8, active: 2, pending: 1 },
      { name: "Content Writing", completed: 15, active: 4, pending: 3 },
      { name: "Marketing", completed: 6, active: 2, pending: 1 },
      { name: "Consulting", completed: 4, active: 1, pending: 0 }
    ]
  });

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
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground">
                Detailed insights into your spending and project performance
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
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
            { label: "Total Spent", value: "$29,100", trend: "+12.5%", positive: true },
            { label: "Total Revenue", value: "$48,600", trend: "+28.3%", positive: true },
            { label: "Active Projects", value: "12", trend: "+3", positive: true },
            { label: "Success Rate", value: "87%", trend: "+5%", positive: true }
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
          {/* Revenue vs Spending */}
          <Card className="glass-effect border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Revenue vs Spending</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenue.map((item, idx) => ({
                ...item,
                spending: analyticsData.spending[idx].amount
              }))}>
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
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  name="Spending"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Project Performance */}
          <Card className="glass-effect border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Project Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.projects}>
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

        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-effect border-border/50 p-6">
            <h2 className="text-xl font-bold mb-6">Spending Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.spending}>
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
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Monthly Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientAnalytics;
