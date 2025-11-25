import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  ArrowLeft,
  Filter
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  rating: number;
  status: "active" | "inactive";
}

const SellerCustomers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const mockCustomers: Customer[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1 (555) 123-4567",
          avatar: "👨",
          totalOrders: 12,
          totalSpent: 2450.00,
          lastOrder: new Date().toLocaleDateString(),
          rating: 5,
          status: "active"
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1 (555) 234-5678",
          avatar: "👩",
          totalOrders: 8,
          totalSpent: 1890.50,
          lastOrder: new Date(Date.now() - 86400000).toLocaleDateString(),
          rating: 4,
          status: "active"
        },
        {
          id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          phone: "+1 (555) 345-6789",
          avatar: "👨",
          totalOrders: 5,
          totalSpent: 950.00,
          lastOrder: new Date(Date.now() - 259200000).toLocaleDateString(),
          rating: 4,
          status: "active"
        },
        {
          id: "4",
          name: "Alice Williams",
          email: "alice@example.com",
          phone: "+1 (555) 456-7890",
          avatar: "👩",
          totalOrders: 1,
          totalSpent: 89.99,
          lastOrder: new Date(Date.now() - 604800000).toLocaleDateString(),
          rating: 3,
          status: "inactive"
        }
      ];

      setCustomers(mockCustomers);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    inactive: customers.filter(c => c.status === "inactive").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  if (loading) {
    return (
      <DashboardLayout currentRole="seller">
        <div className="flex items-center justify-center h-96">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentRole="seller"
      title="Customers"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard/seller" },
        { label: "Customers" }
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Customers", value: stats.total, icon: Users, color: "from-blue-500 to-cyan-500" },
          { label: "Active", value: stats.active, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
          { label: "Inactive", value: stats.inactive, icon: Filter, color: "from-amber-500 to-orange-500" },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "from-purple-500 to-pink-500" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-border p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <motion.div
        className="mb-6 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers by name or email..."
          className="pl-10 glass-effect border-border"
        />
      </motion.div>

      {/* Customers Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-effect border-border p-6 hover:border-border transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-accent text-white">
                            {customer.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              customer.status === "active"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {customer.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{customer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="text-lg font-bold">{customer.totalOrders}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="text-lg font-bold">${customer.totalSpent.toFixed(0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-bold">{customer.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        View
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="glass-effect border-border p-12 text-center col-span-full">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No customers found</p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default SellerCustomers;
