import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Wrench,
  MessageCircle,
  Share2,
  Star,
  ArrowLeft,
  Clock,
  Zap
} from "lucide-react";

const GigDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gig, setGig] = useState<Record<string, unknown>>(null);
  const [reviews, setReviews] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGig();
      fetchReviews();
    }
  }, [id]);

  const fetchGig = async () => {
    try {
      const { data, error } = await supabase
        .from("gigs")
        .select(`
          *,
          worker:worker_id (full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setGig(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Gig not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          buyer:buyer_id (full_name, avatar_url)
        `)
        .eq("gig_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: unknown) {
      console.error("Error:", error);
    }
  };

  const handleContact = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      navigate("/chat");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
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

  if (!gig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-effect border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">Gig not found</p>
          <Button onClick={() => navigate("/gigs")}>
            Back to Gigs
          </Button>
        </Card>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/gigs")}
          className="glass-effect mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gigs
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Gig Info */}
          <div className="md:col-span-2 space-y-6 animate-fade-in-up">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{gig.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(avgRating as unknown)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating} ({reviews.length} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <Card className="glass-effect border-border p-6">
              <h3 className="text-lg font-semibold mb-3">About this gig</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{gig.description}</p>
            </Card>

            {/* Features */}
            {gig.features && gig.features.length > 0 && (
              <Card className="glass-effect border-border p-6">
                <h3 className="text-lg font-semibold mb-3">What's included</h3>
                <ul className="space-y-2">
                  {gig.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Skills */}
            {gig.skills && gig.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <Card className="glass-effect border-border p-6">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review this gig!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <Card
                      key={review.id}
                      className="glass-effect border-border p-4 animate-fade-in-up"
                      style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                              {review.buyer?.full_name?.charAt(0) || "B"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{review.buyer?.full_name || "Buyer"}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Worker Info & Pricing */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            {/* Worker Card */}
            <Card className="glass-effect border-border p-6">
              <div className="text-center mb-4">
                <Avatar className="w-16 h-16 mx-auto mb-3">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-lg">
                    {gig.worker?.full_name?.charAt(0) || "W"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{gig.worker?.full_name || "Worker"}</h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Pro Member</p>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-blue-500 mb-2"
                onClick={handleContact}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Worker
              </Button>
              <Button variant="outline" className="w-full glass-effect">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </Card>

            {/* Pricing Card */}
            <Card className="glass-effect border-border p-6 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Starting Price</p>
                  <p className="text-4xl font-bold text-primary">
                    ${parseFloat(gig.price).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{gig.delivery_days} days</span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-blue-500 h-12 text-lg">
                  Contact for Custom Offer
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Fast communication</p>
                  <p>✓ Quality guaranteed</p>
                  <p>✓ Revisions included</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
