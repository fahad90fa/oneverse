import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ThumbsUp, ThumbsDown } from "lucide-react";

const WorkerReviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | undefined>();
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    positivePercentage: 0
  });

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (workerId) {
      fetchReviews();
      subscribeToReviews();
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

  const fetchReviews = async () => {
    if (!workerId) return;
    try {
      const { data } = await supabase
        .from("reviews")
        .select("*,reviewer:reviewer_id(full_name)")
        .eq("reviewee_id", workerId)
        .order("created_at", { ascending: false });

      if (!data) return;

      const transformed = data.map((review: unknown) => {
        const createdDate = new Date(review.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        let dateLabel = "Just now";
        if (diffDays === 1) dateLabel = "1 day ago";
        else if (diffDays > 1 && diffDays < 7) dateLabel = `${diffDays} days ago`;
        else if (diffWeeks > 0 && diffWeeks < 4) dateLabel = diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
        else if (diffMonths > 0) dateLabel = diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;

        return {
          id: review.id,
          client: review.reviewer?.full_name || "Unknown",
          rating: review.rating,
          comment: review.comment || "",
          date: dateLabel,
          helpful: review.helpful_count || 0
        };
      });

      const avgRating = data.length > 0
        ? (data.reduce((sum: number, r: unknown) => sum + (Number(r.rating) || 0), 0) / data.length)
        : 0;

      const positiveCount = data.filter((r: unknown) => Number(r.rating) >= 4).length;
      const positivePercentage = data.length > 0
        ? Math.round((positiveCount / data.length) * 100)
        : 0;

      setReviews(transformed);
      setStats({
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: data.length,
        positivePercentage
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    }
  };

  const subscribeToReviews = () => {
    if (!workerId) return;
    const channel = supabase
      .channel(`reviews:${workerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `reviewee_id=eq.${workerId}`
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Client Reviews
            </h1>
            <p className="text-muted-foreground">Manage and respond to your client feedback</p>
          </div>
        </motion.div>

        {/* Summary */}
        <Card className="glass-effect border-border/50 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-500 mb-1">{stats.avgRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold mb-1">{stats.totalReviews}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold mb-1">{stats.positivePercentage}%</p>
              <p className="text-sm text-muted-foreground">Positive Reviews</p>
            </div>
          </div>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-effect border-border/50 p-6 group hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">{review.client}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(review.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{review.comment}</p>

                <div className="flex items-center gap-4 pt-4 border-t border-border/20">
                  <Button variant="ghost" size="sm" className="gap-2 text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Report
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

export default WorkerReviews;
