import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { connectionService } from "@/services/connections";
import { FollowButton } from "@/components/Social/FollowButton";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Users, MessageCircle } from "lucide-react";

interface UserWithConnection {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  trust_score?: number;
  created_at: string;
}

const Connections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followers, setFollowers] = useState<UserWithConnection[]>([]);
  const [following, setFollowing] = useState<UserWithConnection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followersOffset, setFollowersOffset] = useState(0);
  const [followingOffset, setFollowingOffset] = useState(0);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const observerTarget = useRef(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setCurrentUserId(data.session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchFollowers = useCallback(async () => {
    if (!currentUserId || loadingFollowers) return;

    setLoadingFollowers(true);
    try {
      const data = await connectionService.getFollowers(
        currentUserId,
        ITEMS_PER_PAGE,
        followersOffset
      );

      if (data.length < ITEMS_PER_PAGE) {
        setHasMoreFollowers(false);
      }

      const users = data.map((item: any) => ({
        id: item.id,
        user_id: item.profiles?.user_id,
        full_name: item.profiles?.full_name,
        avatar_url: item.profiles?.avatar_url,
        trust_score: item.profiles?.trust_score,
        created_at: item.created_at,
      }));

      setFollowers((prev) => [...prev, ...users]);
      setFollowersOffset((prev) => prev + ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching followers:", error);
      toast({
        title: "Error",
        description: "Failed to load followers",
        variant: "destructive",
      });
    } finally {
      setLoadingFollowers(false);
    }
  }, [currentUserId, followersOffset]);

  const fetchFollowing = useCallback(async () => {
    if (!currentUserId || loadingFollowing) return;

    setLoadingFollowing(true);
    try {
      const data = await connectionService.getFollowing(
        currentUserId,
        ITEMS_PER_PAGE,
        followingOffset
      );

      if (data.length < ITEMS_PER_PAGE) {
        setHasMoreFollowing(false);
      }

      const users = data.map((item: any) => ({
        id: item.id,
        user_id: item.profiles?.user_id,
        full_name: item.profiles?.full_name,
        avatar_url: item.profiles?.avatar_url,
        trust_score: item.profiles?.trust_score,
        created_at: item.created_at,
      }));

      setFollowing((prev) => [...prev, ...users]);
      setFollowingOffset((prev) => prev + ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching following:", error);
      toast({
        title: "Error",
        description: "Failed to load following",
        variant: "destructive",
      });
    } finally {
      setLoadingFollowing(false);
    }
  }, [currentUserId, followingOffset]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreFollowers) {
          fetchFollowers();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchFollowers, hasMoreFollowers]);

  useEffect(() => {
    if (currentUserId && followers.length === 0) {
      fetchFollowers();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId && following.length === 0) {
      fetchFollowing();
    }
  }, [currentUserId]);

  const filteredFollowers = followers.filter((user) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter((user) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({ user, showFollowButton = true }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => navigate(`/profile/${user.user_id}`)}
          >
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{user.full_name}</h3>
              {user.trust_score && (
                <Badge variant="secondary" className="text-xs mt-1">
                  Trust Score: {user.trust_score}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate("/chat", {
                  state: { selectedUserId: user.user_id },
                })
              }
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            {showFollowButton && (
              <FollowButton targetUserId={user.user_id} size="sm" />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Connections</h1>
            <p className="text-muted-foreground">Manage your followers and following</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="followers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="followers" className="gap-2">
              <Users className="w-4 h-4" />
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <Users className="w-4 h-4" />
              Following ({following.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="space-y-4">
            {filteredFollowers.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {followers.length === 0
                    ? "No followers yet"
                    : "No results found"}
                </p>
              </Card>
            ) : (
              <>
                {filteredFollowers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
                {hasMoreFollowers && (
                  <div ref={observerTarget} className="h-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {filteredFollowing.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {following.length === 0
                    ? "Not following anyone yet"
                    : "No results found"}
                </p>
              </Card>
            ) : (
              <>
                {filteredFollowing.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
                {hasMoreFollowing && (
                  <div ref={observerTarget} className="h-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connections;
