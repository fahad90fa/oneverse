import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  ShoppingBag,
  Briefcase,
  BookOpen,
  PenSquare,
  Building2,
  Menu,
  X,
  User,
  LayoutDashboard,
  Settings
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  label: string;
  href: string;
  icon: typeof ShoppingBag;
}

const publicLinks: NavItem[] = [
  { label: "Marketplace", href: "/products", icon: ShoppingBag },
  { label: "Hire Talent", href: "/hire", icon: Briefcase },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Blog", href: "/blog", icon: PenSquare },
  { label: "Careers", href: "/careers", icon: Building2 },
];

const authLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const links = user ? authLinks : publicLinks;

  const renderLink = (link: NavItem, index: number) => {
    const Icon = link.icon;
    const isActive = location.pathname.startsWith(link.href);

    return (
      <motion.div
        key={link.href}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: "easeInOut" }}
      >
        <NavLink to={link.href} className="relative inline-block group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative rounded-lg overflow-hidden"
          >
            <div className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-indigo-500/40 to-blue-500/40 border border-indigo-400/80 text-indigo-900 dark:text-white dark:border-indigo-400/60 dark:bg-gradient-to-r dark:from-indigo-500/30 dark:to-blue-500/30"
                : "border border-neutral-300 dark:border-white/15 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white bg-white/40 dark:bg-white/5 backdrop-blur-md hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/20 dark:hover:bg-gradient-to-r dark:hover:from-indigo-500/20 dark:hover:to-blue-500/20"
            }`}>
              <motion.span
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`inline-flex h-5 w-5 items-center justify-center transition-colors ${
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-300" 
                    : "text-neutral-600 dark:text-white/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                }`}
              >
                <Icon className="h-4 w-4" />
              </motion.span>
              <span className="tracking-wide">{link.label}</span>
            </div>

            {isActive && (
              <motion.div
                layoutId="navbar-glow"
                className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/10 to-blue-500/10 blur-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        </NavLink>
      </motion.div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="backdrop-blur-xl bg-white/60 dark:bg-black/30 border-b border-neutral-200 dark:border-white/5"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="text-lg font-black tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:via-white/90 dark:to-white/70 bg-clip-text text-transparent"
            >
              OneVerse
            </motion.button>

            <nav className="hidden lg:flex items-center gap-2">
              <LayoutGroup>
                {links.map((link, index) => renderLink(link, index))}
              </LayoutGroup>
            </nav>

            <div className="flex items-center gap-2.5">
              {user ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/dashboard")}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-medium transition-all duration-200 border border-indigo-400/50 dark:border-indigo-400/30 shadow-sm hover:shadow-md"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </motion.button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/auth")}
                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/40 text-sm font-medium transition-all duration-200 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-white/10"
                  >
                    Log In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/auth")}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-medium transition-all duration-200 border border-indigo-400/50 dark:border-indigo-400/30 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-lg border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/40 transition-all duration-200 bg-white/50 dark:bg-white/5"
                aria-label="Toggle navigation"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-neutral-200 dark:border-white/5"
            >
              <div className="px-4 py-4 space-y-2 bg-white/50 dark:bg-black/20">
                {links.map((link, index) => (
                  <div key={link.href} onClick={() => setMenuOpen(false)}>
                    {renderLink(link, index)}
                  </div>
                ))}

                <div className="pt-4 border-t border-neutral-200 dark:border-white/10 space-y-2 mt-4">
                  {!user ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { navigate("/auth"); setMenuOpen(false); }}
                        className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-white/40 text-sm font-medium transition-all duration-200 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-white/10"
                      >
                        Log In
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { navigate("/auth"); setMenuOpen(false); }}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-medium transition-all duration-200 border border-indigo-400/50 dark:border-indigo-400/30 shadow-sm hover:shadow-md"
                      >
                        Create Account
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-medium transition-all duration-200 border border-indigo-400/50 dark:border-indigo-400/30 shadow-sm hover:shadow-md"
                    >
                      Dashboard
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};

export default LandingNavbar;
