import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  MessageCircle,
  Share2,
  MapPin,
  Calendar,
  Star,
  ArrowLeft,
  ExternalLink,
  Award,
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react";
import {
  profileCardVariants,
  counterVariants,
  badgeVariants,
  timelineVariants,
  skillBarVariants,
  cardVariants,
  containerVariants,
  itemVariants
} from "@/animations/variants";
import { ScrollReveal, StaggeredScrollReveal, AnimatedCounter } from "@/animations/scrollAnimations";
import { useAnimatedCounter } from "@/hooks/useScrollAnimation";
import { Profile as ProfileType, Gig, PortfolioItem, Review } from "@/types";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  // Animated counters
  const completedProjects = useAnimatedCounter(gigs.length * 3, 2000);
  const totalReviews = useAnimatedCounter(reviews.length, 2000);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  // Refs for scroll animations
  const statsRef = useRef(null);
  const skillsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const isSkillsInView = useInView(skillsRef, { once: true });

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchGigs();
      fetchPortfolio();
      fetchReviews();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from("gigs")
        .select("*")
        .eq("worker_id", userId)
        .eq("status", "active");

      if (error) throw error;
      setGigs(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          variants={profileCardVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Card className="glass-effect border-border overflow-hidden relative">
            {/* Animated background gradient */}
            <motion.div
              className="h-32 bg-gradient-to-r from-primary via-purple-500 to-accent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            />

            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 mb-6 relative z-10">
                <div className="flex items-end gap-4">
                  {/* Animated Avatar with rotating gradient border */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-purple-500 to-accent animate-spin opacity-75 blur-sm"
                         style={{ animationDuration: '3s' }} />
                    <Avatar className="relative w-32 h-32 border-4 border-background bg-background">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-4xl font-bold">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="pb-2">
                    <motion.h1
                      className="text-3xl font-bold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {profile?.full_name || "User"}
                    </motion.h1>

                    {/* Animated star rating */}
                    <motion.div
                      className="flex items-center gap-1 mt-1"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, rotate: -180 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              i < Math.round(parseFloat(avgRating))
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.p
                      className="text-sm text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      {avgRating} rating
                    </motion.p>
                  </div>
                </div>

                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-primary to-blue-500">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="glass-effect">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* 3D Flip Card Stats */}
              <motion.div
                ref={statsRef}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                variants={containerVariants}
                initial="hidden"
                animate={isStatsInView ? "visible" : "hidden"}
              >
                {[
                  { label: "Title", value: profile?.title || "Professional", icon: Award },
                  { label: "Response Rate", value: "95%", icon: TrendingUp },
                  { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently", icon: Calendar }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{
                      rotateY: 15,
                      scale: 1.05,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                    transition={{ duration: 0.3 }}
                    className="perspective-1000"
                  >
                    <Card className="glass-effect border-border p-4 cursor-pointer transform-gpu">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <stat.icon className="h-5 w-5 text-primary" />
                        </motion.div>
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="font-semibold">{stat.value}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {profile?.bio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-muted-foreground"
                >
                  {profile.bio}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Animated Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TabsList className="glass-effect border-border mb-6 grid w-full grid-cols-4" role="tablist" aria-label="Profile sections">
                <TabsTrigger value="about" aria-label="About section" className="relative">
                  About
                  {activeTab === "about" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="services" aria-label={`Services section with ${gigs.length} services`} className="relative">
                  Services ({gigs.length})
                  {activeTab === "services" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="portfolio" aria-label={`Portfolio section with ${portfolio.length} items`} className="relative">
                  Portfolio ({portfolio.length})
                  {activeTab === "portfolio" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews" aria-label={`Reviews section with ${reviews.length} reviews`} className="relative">
                  Reviews ({reviews.length})
                  {activeTab === "reviews" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Animated Skills with Circular Progress */}
              {profile?.skills && profile.skills.length > 0 && (
                <ScrollReveal>
                  <Card className="glass-effect border-border p-6">
                    <motion.h3
                      className="text-lg font-semibold mb-6 flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Award className="h-5 w-5" />
                      Skills & Expertise
                    </motion.h3>

                    <motion.div
                      ref={skillsRef}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate={isSkillsInView ? "visible" : "hidden"}
                    >
                      {profile.skills.map((skill: string, i: number) => {
                        const skillLevel = Math.floor(Math.random() * 40) + 60; // Random level 60-100%
                        return (
                          <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            className="relative"
                          >
                            <Card className="glass-effect border-border p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary" className="font-medium">
                                  {skill}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-medium">
                                  {skillLevel}%
                                </span>
                              </div>

                              {/* Circular Progress Bar */}
                              <div className="relative w-16 h-16 mx-auto">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-muted-foreground/20"
                                  />
                                  <motion.path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-primary"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: skillLevel / 100 }}
                                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary">
                                    {skillLevel}%
                                  </span>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </Card>
                </ScrollReveal>
              )}

              {/* Location & Experience with Timeline Animation */}
              <ScrollReveal>
                <Card className="glass-effect border-border p-6">
                  <motion.h3
                    className="text-lg font-semibold mb-6 flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Users className="h-5 w-5" />
                    Professional Details
                  </motion.h3>

                  <div className="relative">
                    {/* Timeline line */}
                    <motion.div
                      className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-accent"
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />

                    <div className="space-y-8">
                      {/* Location */}
                      <motion.div
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <motion.div
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <MapPin className="h-6 w-6 text-primary" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold text-lg">Location</h4>
                          <p className="text-muted-foreground">{profile?.location || "Not specified"}</p>
                        </div>
                      </motion.div>

                      {/* Experience */}
                      <motion.div
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <motion.div
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Calendar className="h-6 w-6 text-accent" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold text-lg">Experience</h4>
                          <p className="text-muted-foreground">{profile?.experience_years || "0"} years in the industry</p>
                        </div>
                      </motion.div>

                      {/* Achievements */}
                      <motion.div
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <motion.div
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold text-lg">Achievements</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["Verified Professional", "Top Rated", "Quick Responder"].map((achievement, i) => (
                              <motion.div
                                key={i}
                                variants={badgeVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ scale: 1.1 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                              >
                                <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                                  {achievement}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {gigs.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="md:col-span-3"
                  >
                    <Card className="glass-effect border-border p-8 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No services available yet</p>
                      </motion.div>
                    </Card>
                  </motion.div>
                ) : (
                  gigs.map((gig, index) => (
                    <motion.div
                      key={gig.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className="glass-effect border-border cursor-pointer overflow-hidden group"
                        onClick={() => navigate(`/gig/${gig.id}`)}
                      >
                        <motion.div
                          className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Animated background pattern */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-20"
                            initial={false}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{
                              background: `conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.3), transparent)`,
                            }}
                          />
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <MessageCircle className="h-12 w-12 text-muted-foreground relative z-10" />
                          </motion.div>
                        </motion.div>

                        <div className="p-4">
                          <motion.h3
                            className="font-bold text-lg line-clamp-2 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {gig.title}
                          </motion.h3>

                          <motion.div
                            className="flex items-center justify-between mb-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                          >
                            <motion.p
                              className="text-2xl font-bold text-primary"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              ${parseFloat(gig.price).toFixed(2)}
                            </motion.p>
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            </motion.div>
                          </motion.div>

                          <motion.div
                            className="flex items-center gap-1 text-sm text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <Calendar className="h-3 w-3" />
                            {gig.delivery_days} days delivery
                          </motion.div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {portfolio.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="md:col-span-3"
                  >
                    <Card className="glass-effect border-border p-8 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No portfolio items yet</p>
                      </motion.div>
                    </Card>
                  </motion.div>
                ) : (
                  portfolio.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{
                        y: -8,
                        rotateY: 5,
                        scale: 1.02
                      }}
                      transition={{ duration: 0.3 }}
                      className="perspective-1000"
                    >
                      <Card className="glass-effect border-border overflow-hidden group cursor-pointer">
                        <motion.div
                          className="h-48 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center relative overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Animated overlay */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100"
                            initial={false}
                            transition={{ duration: 0.3 }}
                          />

                          {item.project_url && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-2 right-2"
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="glass-effect hover:bg-white/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(item.project_url, '_blank');
                                }}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          )}

                          {/* Floating animation */}
                          <motion.div
                            animate={{
                              y: [0, -5, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.5,
                            }}
                            className="text-muted-foreground"
                          >
                            <ExternalLink className="h-8 w-8" />
                          </motion.div>
                        </motion.div>

                        <div className="p-4">
                          <motion.h3
                            className="font-bold text-lg line-clamp-1 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {item.title}
                          </motion.h3>

                          <motion.p
                            className="text-sm text-muted-foreground line-clamp-2 mb-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                          >
                            {item.description}
                          </motion.p>

                          {item.tags && (
                            <motion.div
                              className="flex flex-wrap gap-1"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                            >
                              {item.tags.slice(0, 3).map((tag: string, i: number) => (
                                <motion.div
                                  key={i}
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge variant="secondary" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                                    {tag}
                                  </Badge>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-effect border-border p-8 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* Rating Summary */}
                  <motion.div variants={itemVariants}>
                    <Card className="glass-effect border-border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="text-4xl font-bold text-primary"
                          >
                            {avgRating}
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, rotate: -180 }}
                                  animate={{ opacity: 1, rotate: 0 }}
                                  transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      i < Math.round(parseFloat(avgRating))
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                </motion.div>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="text-right"
                        >
                          <AnimatedCounter
                            value={reviews.length}
                            className="text-2xl font-bold text-primary"
                          />
                          <p className="text-sm text-muted-foreground">Total Reviews</p>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Individual Reviews */}
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="glass-effect border-border p-4 group">
                        <div className="flex items-start justify-between mb-3">
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <motion.div whileHover={{ scale: 1.1 }}>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-sm font-medium">
                                  C
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div>
                              <p className="font-medium">Client</p>
                              <motion.div
                                className="flex items-center gap-1"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.1 }}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Star
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-500 text-yellow-500"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                          <motion.p
                            className="text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            {new Date(review.created_at).toLocaleDateString()}
                          </motion.p>
                        </div>
                        <motion.p
                          className="text-sm leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          {review.comment}
                        </motion.p>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
