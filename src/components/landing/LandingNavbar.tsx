import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
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
  gradient?: string;
}

const publicLinks: NavItem[] = [
  { label: "Marketplace", href: "/products", icon: ShoppingBag, gradient: "from-purple-500 via-pink-500 to-cyan-500" },
  { label: "Hire Talent", href: "/hire", icon: Briefcase, gradient: "from-blue-500 via-cyan-500 to-emerald-400" },
  { label: "Courses", href: "/courses", icon: BookOpen, gradient: "from-indigo-500 via-purple-500 to-pink-500" },
  { label: "Blog", href: "/blog", icon: PenSquare, gradient: "from-amber-500 via-orange-500 to-pink-500" },
  { label: "Careers", href: "/careers", icon: Building2, gradient: "from-rose-500 via-purple-500 to-indigo-500" },
];

const authLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        <NavLink to={link.href} className="relative inline-block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`rounded-full ${user ? "border border-white/15" : `p-[1px] bg-gradient-to-r ${link.gradient ?? "from-primary to-primary"} shadow-[0_10px_40px_rgba(0,0,0,0.2)]`}`}
          >
            <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background/80 text-white">
              <motion.span
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10"
              >
                <Icon className="h-4 w-4" />
              </motion.span>
              <span>{link.label}</span>
            </div>
          </motion.div>
          <AnimatePresence>
            {isActive && (
              <motion.span
                layoutId="navbar-underline"
                className="pointer-events-none absolute inset-0 rounded-full border border-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
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
        className="backdrop-blur-xl bg-background/70 border-b border-white/10"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
            >
              OneVerse
            </motion.button>

            <nav className="hidden lg:flex items-center gap-3">
              <LayoutGroup>
                {links.map((link, index) => renderLink(link, index))}
              </LayoutGroup>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="hidden sm:inline-flex bg-gradient-to-r from-primary to-accent text-white"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Button variant="ghost" onClick={() => navigate("/auth")}>Log In</Button>
                  <Button
                    onClick={() => navigate("/auth")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-full border border-white/20 text-white"
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
              className="lg:hidden border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-3 bg-background/90">
                {links.map((link, index) => (
                  <div key={link.href} onClick={() => setMenuOpen(false)}>
                    {renderLink(link, index)}
                  </div>
                ))}

                {!user ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" onClick={() => { navigate("/auth"); setMenuOpen(false); }}>Log In</Button>
                    <Button onClick={() => { navigate("/auth"); setMenuOpen(false); }} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      Create Account
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>
                    Dashboard
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
};

export default LandingNavbar;
