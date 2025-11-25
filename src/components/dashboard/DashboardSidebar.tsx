import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingBag,
  ShoppingCart,
  Package,
  Heart,
  Star,
  BarChart3,
  Plus,
  ClipboardList,
  DollarSign,
  Users,
  Briefcase,
  Search,
  FileText,
  Send,
  CheckCircle,
  TrendingUp,
  PieChart,
  HelpCircle,
  Sparkles
} from "lucide-react";

type UserRole = "buyer" | "seller" | "client" | "worker";

interface DashboardSidebarProps {
  currentRole: UserRole;
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  active?: boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentRole,
  collapsed,
  onToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = (role: UserRole): NavItem[] => {
    const baseItems: Record<UserRole, NavItem[]> = {
      buyer: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: `/dashboard/${role}` },
        { id: 'browse', label: 'Browse Products', icon: ShoppingBag, href: '/products' },
        { id: 'cart', label: 'My Cart', icon: ShoppingCart, href: '/cart', badge: 3 },
        { id: 'orders', label: 'My Orders', icon: Package, href: '/orders' },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/wishlist' },
        { id: 'reviews', label: 'Reviews', icon: Star, href: '/reviews' },
        { id: 'profile', label: 'Profile', icon: Users, href: '/profile' },
        { id: 'settings', label: 'Settings', icon: BarChart3, href: '/settings' }
      ],
      seller: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: `/dashboard/${role}` },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: `/dashboard/${role}/analytics` },
        { id: 'products', label: 'Products', icon: Package, href: '/products/manage' },
        { id: 'add-product', label: 'Add Product', icon: Plus, href: '/products/new' },
        { id: 'orders', label: 'Orders', icon: ClipboardList, href: '/orders/manage', badge: 'New' },
        { id: 'revenue', label: 'Revenue', icon: DollarSign, href: `/dashboard/${role}/revenue` },
        { id: 'customers', label: 'Customers', icon: Users, href: `/dashboard/${role}/customers` },
        { id: 'settings', label: 'Store Settings', icon: BarChart3, href: '/settings/store' }
      ],
      client: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: `/dashboard/${role}` },
        { id: 'post-job', label: 'Post a Job', icon: Plus, href: '/jobs/new' },
        { id: 'projects', label: 'Active Projects', icon: Briefcase, href: '/projects', badge: 3 },
        { id: 'find-workers', label: 'Find Workers', icon: Search, href: '/workers' },
        { id: 'messages', label: 'Messages', icon: Send, href: '/chat' },
        { id: 'payments', label: 'Payments', icon: DollarSign, href: '/payments' },
        { id: 'analytics', label: 'Analytics', icon: PieChart, href: `/dashboard/${role}/analytics` },
        { id: 'settings', label: 'Settings', icon: BarChart3, href: '/settings' }
      ],
      worker: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, href: `/dashboard/${role}` },
        { id: 'browse-jobs', label: 'Browse Jobs', icon: Search, href: '/jobs' },
        { id: 'my-gigs', label: 'My Gigs/Services', icon: FileText, href: '/gigs/manage' },
        { id: 'projects', label: 'Active Projects', icon: Briefcase, href: '/projects/active', badge: 2 },
        { id: 'proposals', label: 'Proposals Sent', icon: Send, href: '/proposals' },
        { id: 'earnings', label: 'Earnings', icon: DollarSign, href: `/dashboard/${role}/earnings` },
        { id: 'reviews', label: 'Reviews', icon: Star, href: '/reviews' },
        { id: 'stats', label: 'Stats', icon: TrendingUp, href: `/dashboard/${role}/stats` },
        { id: 'settings', label: 'Settings', icon: BarChart3, href: '/settings' }
      ]
    };

    return baseItems[role].map(item => ({
      ...item,
      active: location.pathname === item.href
    }));
  };

  const navigationItems = getNavigationItems(currentRole);

  const quickActionLabels = {
    buyer: "Start Shopping",
    seller: "Add New Product",
    client: "Post a Job",
    worker: "Browse Jobs"
  };

  const quickActionIcons = {
    buyer: ShoppingBag,
    seller: Plus,
    client: Briefcase,
    worker: Search
  };

  const QuickActionIcon = quickActionIcons[currentRole];

  return (
    <TooltipProvider>
      <motion.aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] glass-effect border-r border-border/50 backdrop-blur-xl transition-all duration-300 z-40 ${
          collapsed ? 'w-20' : 'w-80'
        }`}
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="p-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full justify-center glass-effect hover:bg-primary/10"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.active;

                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => navigate(item.href)}
                          className={`w-full justify-start glass-effect transition-all duration-200 ${
                            isActive
                              ? 'bg-primary/20 text-primary border-l-2 border-primary'
                              : 'hover:bg-muted/50'
                          } ${collapsed ? 'px-3' : 'px-4'}`}
                        >
                          <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                          <AnimatePresence>
                            {!collapsed && (
                              <motion.span
                                className="flex-1 text-left"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {item.badge && !collapsed && (
                            <Badge
                              variant={typeof item.badge === 'string' && item.badge === 'New' ? 'default' : 'secondary'}
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="glass-effect">
                        <div className="flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </nav>

          {/* Quick Actions Section */}
          <div className="p-4 border-t border-border/50">
            <motion.div
              className={`glass-effect rounded-lg p-4 hover-scale cursor-pointer group ${
                collapsed ? 'p-3' : 'p-4'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (currentRole === 'seller') navigate('/products/new');
                else if (currentRole === 'client') navigate('/jobs/new');
                else if (currentRole === 'worker') navigate('/jobs');
                else navigate('/products');
              }}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative">
                  <QuickActionIcon className={`h-6 w-6 text-primary ${collapsed ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="font-semibold text-sm">{quickActionLabels[currentRole]}</div>
                      <div className="text-xs text-muted-foreground">Quick action</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Help Widget */}
          <div className="p-4 border-t border-border/50">
            <motion.div
              className={`glass-effect rounded-lg p-3 hover-scale cursor-pointer group ${
                collapsed ? 'p-2' : 'p-3'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/help')}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative">
                  <HelpCircle className={`h-5 w-5 text-muted-foreground ${collapsed ? '' : 'group-hover:text-primary transition-colors'}`} />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary/60 rounded-full"
                    animate={{
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-sm font-medium">Need Help?</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};