import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { connectionService } from "@/services/connections";
import { FollowButton } from "./FollowButton";
import { motion } from "framer-motion";
import { X, Sparkles, TrendingUp } from "lucide-react";

interface SuggestionWithProfile {
  id: string;
  suggested_user_id: string;
  reason: string;
  score: number;
  profile?: {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url: string;
    trust_score: number;
  };
}

export const ConnectionSuggestions = ({ limit = 5 }) => {
  const [suggestions, setSuggestions] = useState<SuggestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await connectionService.getConnectionSuggestions(limit);
        
        const suggestionsWithProfiles = await Promise.all(
          data.map(async (suggestion) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", suggestion.suggested_user_id)
              .single();

            return {
              ...suggestion,
              profile,
            };
          })
        );

        setSuggestions(suggestionsWithProfiles.filter((s) => s.profile));
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        toast({
          title: "Error",
          description: "Failed to load connection suggestions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [limit, toast]);

  const handleDismiss = async (suggestionId: string) => {
    try {
      await connectionService.dismissSuggestion(suggestionId);
      setSuggestions((prev) =>
        prev.filter((s) => s.id !== suggestionId)
      );
    } catch (error) {
      console.error("Error dismissing suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to dismiss suggestion",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Suggested Connections</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={suggestion.profile?.avatar_url || ""} />
                <AvatarFallback>
                  {suggestion.profile?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {suggestion.profile?.full_name}
                </p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {suggestion.reason
                      .split("_")
                      .join(" ")
                      .charAt(0)
                      .toUpperCase() +
                      suggestion.reason
                        .split("_")
                        .join(" ")
                        .slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-1 flex-shrink-0">
              <FollowButton
                targetUserId={suggestion.suggested_user_id}
                showText={false}
                size="sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(suggestion.id)}
                className="h-9 w-9 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
