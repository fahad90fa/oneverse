import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  Award,
  Plus
} from "lucide-react";

interface Review {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_avatar?: string;
  product_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
  helpful_count: number;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

const BuyerReviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average_rating: 0,
    total_reviews: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0
  });
  const [selectedRating, setSelectedRating] = useState(0);
  const [newReview, setNewReview] = useState({
    title: "",
    comment: "",
    rating: 5
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);

      const ratings = reviewsData || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      const statCounts = {
        five_star: ratings.filter(r => r.rating === 5).length,
        four_star: ratings.filter(r => r.rating === 4).length,
        three_star: ratings.filter(r => r.rating === 3).length,
        two_star: ratings.filter(r => r.rating === 2).length,
        one_star: ratings.filter(r => r.rating === 1).length,
      };

      setStats({
        average_rating: avgRating,
        total_reviews: ratings.length,
        ...statCounts
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("reviews")
        .insert({
          buyer_id: session.user.id,
          title: newReview.title,
          comment: newReview.comment,
          rating: newReview.rating,
          is_verified_purchase: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review posted successfully"
      });

      setNewReview({ title: "", comment: "", rating: 5 });
      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      toast({
        title: "Success",
        description: "Review deleted successfully"
      });

      fetchReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive"
      });
    }
  };

  const filteredReviews = selectedRating === 0
    ? reviews
    : reviews.filter(r => r.rating === selectedRating);

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-bold">My Reviews</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect border-border max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>
                    Share your experience with us
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`p-1 transition-colors ${
                            star <= newReview.rating ? "text-yellow-500" : "text-muted-foreground"
                          }`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      placeholder="e.g., Great quality!"
                      className="glass-effect border-border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Share your experience..."
                      className="glass-effect border-border"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleAddReview}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    Post Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect border-border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{stats.average_rating.toFixed(1)}</span>
                  <span className="text-xl text-muted-foreground">/5</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(stats.average_rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {stats.total_reviews} reviews
                </p>
              </div>

              <div className="md:col-span-2 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats[`${rating}_star` as keyof ReviewStats] as number;
                  const percentage = stats.total_reviews > 0
                    ? (count / stats.total_reviews) * 100
                    : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({stats.total_reviews})</TabsTrigger>
              <TabsTrigger value="5">5★ ({stats.five_star})</TabsTrigger>
              <TabsTrigger value="4">4★ ({stats.four_star})</TabsTrigger>
              <TabsTrigger value="3">3★ ({stats.three_star})</TabsTrigger>
              <TabsTrigger value="2">2★ ({stats.two_star})</TabsTrigger>
              <TabsTrigger value="1">1★ ({stats.one_star})</TabsTrigger>
            </TabsList>

            {["all", "5", "4", "3", "2", "1"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredReviews.length > 0 ? (
                    filteredReviews
                      .filter(r => tab === "all" || r.rating === parseInt(tab))
                      .map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="glass-effect border-border p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <Avatar>
                                  <AvatarImage src={review.seller_avatar} />
                                  <AvatarFallback>
                                    {review.seller_name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{review.seller_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingId(review.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.is_verified_purchase && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>

                            <h4 className="font-semibold mb-2">{review.title}</h4>
                            <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>

                            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                Reply
                              </button>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {review.helpful_count} found this helpful
                              </span>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                  ) : (
                    <Card className="glass-effect border-border p-12 text-center">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No reviews yet</p>
                    </Card>
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyerReviews;
