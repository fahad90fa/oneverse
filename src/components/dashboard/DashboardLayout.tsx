import { useState, useEffect, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { motion } from "framer-motion";
import { UserRole, AppUser, Profile, BreadcrumbItem } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentRole,
  title,
  breadcrumbs = []
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
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

      // Check if user has the required role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", currentRole)
        .single();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: `You need the ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} role to access this dashboard`,
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate, currentRole, toast]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader
        user={user}
        profile={profile}
        currentRole={currentRole}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          currentRole={currentRole}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <motion.main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-80"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <motion.nav
                className="flex items-center space-x-2 text-sm text-muted-foreground mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span>Dashboard</span>
                {breadcrumbs.map((crumb, index) => (
                  <Fragment key={index}>
                    <span>/</span>
                    {crumb.href ? (
                      <button
                        onClick={() => navigate(crumb.href!)}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </Fragment>
                ))}
              </motion.nav>
            )}

            {/* Page Title */}
            {title && (
              <motion.h1
                className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h1>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
};