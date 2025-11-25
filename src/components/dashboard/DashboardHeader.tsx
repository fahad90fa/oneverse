import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Sparkles,
  MessageSquare,
  CreditCard,
  HelpCircle,
  ChevronDown,
  X,
  Command,
  Heart
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MiniCart } from "@/components/Cart/MiniCart";
import { useWishlist } from "@/hooks/useWishlist";
import { UserRole, AppUser, Profile, Notification } from "@/types";

interface DashboardHeaderProps {
  user: AppUser | null;
  profile: Profile | null;
  currentRole: UserRole;
  onSidebarToggle: () => void;
}



export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  profile,
  currentRole,
  onSidebarToggle
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { getWishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'You have received a new order for your product',
      time: '2 mins ago',
      read: false
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'John Doe sent you a message about your gig',
      time: '15 mins ago',
      read: false
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received $150 for completed work',
      time: '1 hour ago',
      read: true
    }
  ]);

  const searchRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out"
    });
    navigate("/");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <Sparkles className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const roleLabels = {
    buyer: "Buyer",
    seller: "Seller",
    client: "Client",
    worker: "Worker"
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
                Platform
              </span>
            </motion.div>
          </div>

          {/* Center Section - Global Search */}
          <div className="flex-1 max-w-md mx-4 relative">
            <motion.div
              className={`relative transition-all duration-300 ${
                searchFocused ? 'scale-105' : 'scale-100'
              }`}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products, jobs, users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="pl-10 pr-12 glass-effect border-border/50 focus:border-primary/50 transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                  </kbd>
                </div>
              </div>

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 glass-effect border border-border/50 rounded-lg shadow-xl overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4">
                      <div className="text-sm text-muted-foreground mb-3">Quick Results</div>
                      <div className="space-y-2">
                        {/* Mock search results */}
                        <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <div>
                            <div className="text-sm font-medium">Web Development Service</div>
                            <div className="text-xs text-muted-foreground">Service • $50</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                          <User className="h-4 w-4 text-primary" />
                          <div>
                            <div className="text-sm font-medium">John Developer</div>
                            <div className="text-xs text-muted-foreground">Freelancer • 4.9★</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Add New Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="glass-effect border-border/50 hover:bg-primary/10 text-foreground"
                onClick={() => {
                  // Handle add new based on role
                  if (currentRole === 'seller') navigate('/products/new');
                  else if (currentRole === 'client') navigate('/jobs/new');
                  else if (currentRole === 'worker') navigate('/gigs/new');
                  else navigate('/products');
                }}
              >
                <Plus className="h-4 w-4 text-foreground" />
                <span className="hidden sm:inline ml-2">Add New</span>
              </Button>
            </motion.div>

            {/* Messages */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="relative glass-effect text-foreground"
                onClick={() => navigate('/chat')}
              >
                <MessageSquare className="h-5 w-5 text-foreground" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  3
                </Badge>
              </Button>
            </motion.div>

            {/* Wishlist */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="relative glass-effect text-foreground"
                onClick={() => navigate('/wishlist')}
              >
                <Heart className="h-5 w-5 text-foreground" />
                {getWishlistCount() > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {getWishlistCount()}
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* Cart */}
            <MiniCart />

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative glass-effect text-foreground"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 text-foreground" />
                  {unreadNotifications > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {unreadNotifications}
                    </motion.div>
                  )}
                </Button>
              </motion.div>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-80 glass-effect border border-border/50 rounded-lg shadow-xl overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all read
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          className={`p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'order' ? 'bg-blue-500/10 text-blue-500' :
                              notification.type === 'message' ? 'bg-green-500/10 text-green-500' :
                              notification.type === 'payment' ? 'bg-purple-500/10 text-purple-500' :
                              'bg-gray-500/10 text-gray-500'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-border/50">
                      <Button variant="ghost" className="w-full text-sm">
                        View all notifications
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Section */}
            <div className="relative" ref={profileRef}>
              <motion.div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">{profile?.full_name || "User"}</div>
                  <div className="text-xs text-muted-foreground capitalize">{roleLabels[currentRole]}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </motion.div>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-56 glass-effect border border-border/50 rounded-lg shadow-xl overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{profile?.full_name || "User"}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/profile')}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/billing')}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Billing
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/help')}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help Center
                      </Button>

                      <div className="border-t border-border/50 my-2"></div>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="glass-effect"
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};