import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag,
  Store,
  Briefcase,
  Wrench,
  LogOut
} from "lucide-react";
import { UserRole, AppUser, Profile } from "@/types";
import { useSEO } from "@/hooks/useSEO";

const Dashboard = () => {
  useSEO('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfile(profileData);

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesData) {
        const roles = rolesData.map(r => r.role as UserRole);
        setUserRoles(roles);

        // Auto-redirect to primary role dashboard if user has only one role
        if (roles.length === 1) {
          navigate(`/dashboard/${roles[0]}`);
          return;
        }
      }
    } catch (error: unknown) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out"
    });
    navigate("/");
  };

  const roleCards = [
    {
      role: "buyer" as UserRole,
      title: "Buyer Dashboard",
      description: "Browse products, manage orders, and track deliveries",
      icon: ShoppingBag,
      gradient: "from-electric-blue-500 to-sky-blue-500",
      features: ["Order History", "Wishlist", "Track Orders", "Reviews"]
    },
    {
      role: "seller" as UserRole,
      title: "Seller Dashboard",
      description: "Manage inventory, process orders, and view analytics",
      icon: Store,
      gradient: "from-blue-500 to-cyan-500",
      features: ["Product Management", "Sales Analytics", "Orders", "Customers"]
    },
    {
      role: "client" as UserRole,
      title: "Client Dashboard",
      description: "Post jobs, hire workers, and manage projects",
      icon: Briefcase,
      gradient: "from-cyan-500 to-electric-blue-500",
      features: ["Post Jobs", "Find Workers", "Projects", "Payments"]
    },
    {
      role: "worker" as UserRole,
      title: "Worker Dashboard",
      description: "Offer services, apply for jobs, and showcase portfolio",
      icon: Wrench,
      gradient: "from-electric-blue-500 to-cyan-500",
      features: ["My Gigs", "Job Search", "Active Projects", "Earnings"]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRoles.length > 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || "User"}!
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Select your dashboard to continue
            </p>
          </div>

          <div className="space-y-2 md:space-y-3">
            {roleCards
              .filter(card => userRoles.includes(card.role))
              .map((card) => {
                const CardIcon = card.icon;
                return (
                  <Card
                    key={card.role}
                    className="glass-effect border-border hover-scale cursor-pointer transition-all duration-200 hover:border-primary/50 min-h-[60px] md:min-h-[80px] flex items-center"
                    onClick={() => navigate(`/dashboard/${card.role}`)}
                  >
                    <div className="p-3 md:p-4 w-full">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 md:w-12 h-10 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}>
                          <CardIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base truncate">{card.title}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{card.description}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>

          <div className="mt-6 md:mt-8 text-center">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-sm md:text-base text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to the Platform
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            You don't have any active roles yet. Please contact an administrator to assign roles.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="glass-effect border border-border rounded-lg p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-base mb-2">Available Roles</h3>
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
              {roleCards.map((card) => (
                <div key={card.role} className="text-muted-foreground">
                  {card.title}
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-sm md:text-base text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
