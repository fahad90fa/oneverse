import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Folder,
  ExternalLink,
  ArrowLeft,
  Plus
} from "lucide-react";

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolioItems(data || []);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in-up">
                Portfolio Showcase
              </h1>
              <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Browse creative works and projects from talented creators
              </p>
            </div>
            <Button onClick={() => navigate("/projects")} className="bg-gradient-to-r from-green-500 to-emerald-500 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-effect border-border">
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : portfolioItems.length === 0 ? (
          <Card className="glass-effect border-border p-12 text-center animate-fade-in-up">
            <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to showcase your amazing work!
            </p>
            <Button onClick={() => navigate("/projects")} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item, index) => (
              <Card
                key={item.id}
                className="group glass-effect border-border hover-scale cursor-pointer overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Folder className="h-20 w-20 text-muted-foreground" />
                  {item.project_url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 glass-effect"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(item.project_url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {item.description}
                  </p>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      by {item.profiles?.full_name || "Creator"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
