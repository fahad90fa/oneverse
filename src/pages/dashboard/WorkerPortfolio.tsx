import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Eye, TrendingUp } from "lucide-react";

const WorkerPortfolio = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | undefined>();
  const [portfolioItems, setPortfolioItems] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (workerId) {
      fetchPortfolioItems();
      subscribeToPortfolio();
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
    } catch (error: unknown) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioItems = async () => {
    if (!workerId) return;
    try {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", workerId)
        .order("created_at", { ascending: false });

      setPortfolioItems(data || []);
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      toast({
        title: "Error",
        description: "Failed to load portfolio items",
        variant: "destructive"
      });
    }
  };

  const subscribeToPortfolio = () => {
    if (!workerId) return;
    const channel = supabase
      .channel(`portfolio:${workerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "portfolio_items",
          filter: `user_id=eq.${workerId}`
        },
        () => {
          fetchPortfolioItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully"
      });
      await fetchPortfolioItems();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to delete portfolio item",
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/dashboard/worker")} className="glass-effect mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Portfolio
              </h1>
              <p className="text-muted-foreground">Showcase your best work and attract clients</p>
            </div>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
              <Plus className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-effect border-border/50 overflow-hidden group hover:border-primary/50 transition-all">
                <div className="h-40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-5xl">
                  {item.image}
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground uppercase mb-1">{item.category}</p>
                  <h3 className="font-bold text-lg mb-4">{item.title}</h3>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/20">
                    <div className="text-center">
                      <p className="font-bold">{item.views}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{item.clicks}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Stats
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2 text-red-500"
                      onClick={() => handleDeleteItem(item.id as string)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerPortfolio;
