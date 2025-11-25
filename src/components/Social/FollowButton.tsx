import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, UserCheck, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { connectionService } from "@/services/connections";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  targetUserId: string;
  showText?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton = ({
  targetUserId,
  showText = true,
  variant = "default",
  size = "default",
  onFollowChange,
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsBack, setFollowsBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data?.session?.user?.id || null);
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser === targetUserId) return;

    const checkFollowStatus = async () => {
      try {
        const status = await connectionService.checkFollowStatus(
          targetUserId
        );
        setIsFollowing(status.isFollowing);
        setFollowsBack(status.followsBack);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [currentUser, targetUserId]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "Please login to follow users",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await connectionService.unfollowUser(targetUserId);
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user",
        });
      } else {
        await connectionService.followUser(targetUserId);
        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }
      onFollowChange?.(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser === targetUserId) {
    return null;
  }

  const getButtonState = () => {
    if (isFollowing && followsBack) {
      return {
        label: "Following Back",
        icon: <UserCheck className="w-4 h-4" />,
        bgColor: "bg-blue-600 hover:bg-blue-700",
      };
    } else if (isFollowing) {
      return {
        label: "Following",
        icon: <UserCheck className="w-4 h-4" />,
        bgColor: "bg-blue-600 hover:bg-blue-700",
      };
    } else {
      return {
        label: "Follow",
        icon: <UserPlus className="w-4 h-4" />,
        bgColor: "bg-primary hover:bg-primary/90",
      };
    }
  };

  const state = getButtonState();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={handleToggleFollow}
        disabled={loading}
        variant={isFollowing ? "outline" : variant}
        size={size}
        className={
          variant === "default" && isFollowing
            ? "gap-2 relative"
            : "gap-2"
        }
      >
        <motion.div
          animate={loading ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.5, repeat: loading ? Infinity : 0 }}
        >
          {state.icon}
        </motion.div>
        {showText && <span>{state.label}</span>}
        {isFollowing && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
          >
            <Heart className="w-3 h-3 text-white fill-white" />
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
};
