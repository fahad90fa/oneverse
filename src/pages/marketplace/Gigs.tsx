import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import {
  Wrench,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  Star
} from "lucide-react";
import CreateGigModal from "@/components/gigs/CreateGigModal";
import { Gig } from "@/types";
import { useSEO } from "@/hooks/useSEO";

const Gigs = () => {
  useSEO('hire');
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewer, setViewer] = useState<User | null>(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setViewer(session?.user ?? null);
      }
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setViewer(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from("gigs")
        .select(`
          *,
          profiles:worker_id (full_name, avatar_url)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGigs(data || []);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const requireAuth = (description: string) => {
    if (viewer) {
      return true;
    }

    toast({
      title: "Login required",
      description,
      variant: "destructive",
    });
    navigate("/auth");
    return false;
  };

  const navigateWithAuth = (path: string, description: string) => {
    if (!requireAuth(description)) return;
    navigate(path);
  };

  const handleContactWorker = (gig: Gig) => {
    if (!requireAuth("Please log in to contact workers")) return;
    navigate(`/gig/${gig.id}`);
  };

  const filteredGigs = gigs.filter(gig =>
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gig.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigateWithAuth("/dashboard", "Log in to access your dashboard")}
            className="glass-effect mb-3 md:mb-4 text-sm md:text-base"
          >
            <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent animate-fade-in-up">
            Freelance Services
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-effect border-border text-sm md:text-base"
              />
            </div>
            <Button className="glass-effect text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5">
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-effect border-border overflow-hidden">
                <div className="h-40 md:h-48 bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse" />
                <div className="p-3 md:p-4 space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 md:h-8 w-6 md:w-8 bg-muted/50 rounded-full animate-pulse" />
                    <div className="h-3 md:h-4 bg-muted/50 rounded animate-pulse w-24" />
                  </div>
                  <div className="h-4 md:h-5 bg-muted/50 rounded animate-pulse w-3/4" />
                  <div className="h-3 md:h-4 bg-muted/50 rounded animate-pulse w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 md:h-6 bg-muted/50 rounded animate-pulse w-16" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <div key={starIndex} className="h-3 md:h-4 w-3 md:w-4 bg-muted/50 rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredGigs.length === 0 ? (
          <Card className="glass-effect border-border p-6 md:p-12 text-center animate-fade-in-up">
            <Wrench className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-3 md:mb-4 text-muted-foreground" />
            <h3 className="text-xl md:text-2xl font-bold mb-2">No Services Found</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              {searchTerm ? "Try adjusting your search" : "Be the first to offer a service!"}
            </p>
            {!searchTerm && (
              viewer ? (
                <CreateGigModal>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-sm md:text-base">
                    Create Your Gig
                  </Button>
                </CreateGigModal>
              ) : (
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-sm md:text-base"
                  onClick={() => requireAuth("Please log in to post a gig")}
                >
                  Create Your Gig
                </Button>
              )
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGigs.map((gig, index) => (
              <Card
                key={gig.id}
                className="group glass-effect border-border hover-scale cursor-pointer overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <Wrench className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <div className="p-4">
                  {/* Seller info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs">
                        {gig.profiles?.full_name?.charAt(0) || "W"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {gig.profiles?.full_name || "Worker"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">5.0</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {gig.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {gig.description}
                  </p>
                  
                  {gig.skills && gig.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {gig.skills.slice(0, 3).map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{gig.delivery_days} days</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Starting at</span>
                      <p className="text-xl font-bold text-primary">
                        ${parseFloat(gig.price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactWorker(gig);
                    }}
                  >
                    Hire Talent
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gigs;
