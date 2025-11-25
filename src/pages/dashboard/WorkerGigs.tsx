import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Edit2, Trash2, Eye } from "lucide-react";

const WorkerGigs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | undefined>();
  const [gigs, setGigs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (workerId) {
      fetchGigs();
      subscribeToGigs();
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

  const fetchGigs = async () => {
    if (!workerId) return;
    try {
      const { data } = await supabase
        .from("gigs")
        .select("*")
        .eq("worker_id", workerId)
        .order("created_at", { ascending: false });

      setGigs(data || []);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      toast({
        title: "Error",
        description: "Failed to load gigs",
        variant: "destructive"
      });
    }
  };

  const subscribeToGigs = () => {
    if (!workerId) return;
    const channel = supabase
      .channel(`gigs:${workerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gigs",
          filter: `worker_id=eq.${workerId}`
        },
        () => {
          fetchGigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDeleteGig = async (gigId: string) => {
    try {
      const { error } = await supabase
        .from("gigs")
        .delete()
        .eq("id", gigId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Gig deleted successfully"
      });
      await fetchGigs();
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast({
        title: "Error",
        description: "Failed to delete gig",
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
                My Gigs
              </h1>
              <p className="text-muted-foreground">Manage your service offerings</p>
            </div>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
              <Plus className="mr-2 h-4 w-4" />
              Create New Gig
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig, index) => (
            <motion.div key={gig.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-effect border-border/50 p-6 group hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">{gig.status}</p>
                    <h3 className="font-bold text-lg mt-1">{gig.title}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${gig.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-yellow-500/20 text-yellow-600'}`}>
                    {gig.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-border/20">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Price</span>
                    <span className="font-bold">${gig.price}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Views</span>
                    <span className="font-bold">{gig.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Orders</span>
                    <span className="font-bold">{gig.orders}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 text-red-500"
                    onClick={() => handleDeleteGig(gig.id as string)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerGigs;
