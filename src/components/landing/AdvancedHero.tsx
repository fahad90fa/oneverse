import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  ShoppingBag,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  Play,
  Check,
  Star,
  TrendingUp,
  MessageSquare,
  CreditCard,
  Shield,
  Zap,
  BarChart3,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdvancedHero = React.memo(() => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState(0);

  const keywords = [
    { text: "Shop", icon: ShoppingBag, color: "from-purple-500 to-blue-500" },
    { text: "Work", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
    { text: "Connect", icon: Users, color: "from-cyan-500 to-pink-500" },
    { text: "Showcase", icon: Sparkles, color: "from-pink-500 to-purple-500" }
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50K+", label: "Products", icon: ShoppingBag },
    { value: "4.9", label: "★ Rating", icon: Star },
    { value: "99%", label: "Uptime", icon: TrendingUp }
  ];

  const floatingBadges = [
    { text: "🛒 E-commerce", position: "top-20 left-20" },
    { text: "💼 Freelancing", position: "top-16 right-24" },
    { text: "👥 Social", position: "top-1/2 left-16" },
    { text: "📊 Portfolio", position: "top-1/2 right-20" },
    { text: "💬 Live Chat", position: "bottom-32 left-24" },
    { text: "⚡ Fast & Secure", position: "bottom-40 right-32" }
  ];

  const springX = useSpring(0, { stiffness: 300, damping: 30 });
  const springY = useSpring(0, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeyword((prev) => (prev + 1) % keywords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [keywords.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const buttonRect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      const mouseXPos = e.clientX - rect.left;
      const mouseYPos = e.clientY - rect.top;

      mouseX.set(mouseXPos);
      mouseY.set(mouseYPos);

      // Magnetic effect for the button
      if (buttonRect && isHovered) {
        const buttonCenterX = buttonRect.left + buttonRect.width / 2 - rect.left;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2 - rect.top;

        const distanceX = mouseXPos - buttonCenterX;
        const distanceY = mouseYPos - buttonCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        const maxDistance = 150; // Maximum distance for magnetic effect
        const strength = Math.max(0, 1 - distance / maxDistance);

        springX.set(distanceX * strength * 0.3);
        springY.set(distanceY * strength * 0.3);
      } else {
        springX.set(0);
        springY.set(0);
      }
    }
  };

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={prefersReducedMotion ? {} : {
            background: [
              "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Particles */}
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={prefersReducedMotion ? {} : {
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: 'perspective(1000px) rotateX(60deg)',
              transformOrigin: 'center top',
            }}
          />
        </div>
      </div>

      {/* Floating Badges */}
      {floatingBadges.map((badge, index) => (
        <motion.div
          key={index}
          className={`absolute ${badge.position} glass-effect px-3 py-2 rounded-full text-sm font-medium`}
          initial={{ opacity: 0, scale: 0 }}
          animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : {
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            delay: 2.5 + index * 0.1,
            duration: 0.6,
            y: {
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          whileHover={{ scale: 1.1 }}
        >
          {badge.text}
        </motion.div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">

          {/* Left Side - Text Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.h1
                className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <motion.span
                  className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent"
                  animate={prefersReducedMotion ? {} : {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  One
                </motion.span>
                <br />
                <motion.span
                  className="text-foreground"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.6, type: "spring" }}
                >
                  Verse
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Subheading with Rotating Keywords */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <div className="flex items-center gap-4 text-xl lg:text-2xl text-muted-foreground">
                <span>Your all-in-one freelance marketplace</span>
              </div>

              {/* Rotating Keywords */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Featuring:</span>
                <motion.div
                  key={currentKeyword}
                  initial={{ opacity: 0, y: 20, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: 90 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    className={`p-2 rounded-lg bg-gradient-to-r ${keywords[currentKeyword].color} text-white`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {React.createElement(keywords[currentKeyword].icon, { className: "h-5 w-5" })}
                  </motion.div>
                  <span className={`font-bold bg-gradient-to-r ${keywords[currentKeyword].color} bg-clip-text text-transparent`}>
                    {keywords[currentKeyword].text}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
            >
              <motion.div
                ref={buttonRef}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  x: springX,
                  y: springY,
                }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="group relative bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                    animate={prefersReducedMotion ? {} : {
                      x: ["0%", "100%", "0%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-effect border-2 border-gradient-to-r from-purple-500 to-blue-500 px-8 py-6 text-lg font-semibold hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.8 }}
            >
              {[
                "✓ Free Forever",
                "✓ No Credit Card",
                "✓ 10K+ Users"
              ].map((text, index) => (
                <motion.div
                  key={index}
                  className="glass-effect px-3 py-2 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
                >
                  {text}
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="glass-effect p-4 rounded-xl text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.0 + index * 0.1, duration: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - 3D Mockup */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
            {/* Main Mockup */}
            <motion.div
              className="relative w-full max-w-lg"
              animate={prefersReducedMotion ? {} : {
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                rotateX: useMotionValue(mouseY.get() * 0.01).get(),
                rotateY: useMotionValue(mouseX.get() * 0.01).get(),
              }}
            >
              {/* Mockup Frame */}
              <div className="glass-effect p-6 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm font-medium">Dashboard</div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-effect p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 mb-2 text-blue-500" />
                      <div className="text-sm font-medium">Analytics</div>
                      <div className="text-xs text-muted-foreground">+12% growth</div>
                    </div>
                    <div className="glass-effect p-3 rounded-lg">
                      <MessageSquare className="h-6 w-6 mb-2 text-green-500" />
                      <div className="text-sm font-medium">Messages</div>
                      <div className="text-xs text-muted-foreground">3 unread</div>
                    </div>
                  </div>

                  <div className="glass-effect p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Recent Activity</div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>Order #1234 completed</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>New message received</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing Orb */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl opacity-30"
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Floating UI Elements */}
            {[
              { icon: ShoppingBag, position: "-top-8 -left-8", color: "text-purple-500" },
              { icon: MessageSquare, position: "-bottom-6 -right-6", color: "text-blue-500" },
              { icon: Star, position: "top-1/2 -right-12", color: "text-yellow-500" },
              { icon: CreditCard, position: "-bottom-8 -left-12", color: "text-green-500" },
            ].map((element, index) => (
              <motion.div
                key={index}
                className={`absolute ${element.position} glass-effect p-3 rounded-xl shadow-lg`}
                initial={{ opacity: 0, scale: 0 }}
                animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  delay: 2.3 + index * 0.1,
                  duration: 0.6,
                  y: {
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                }}
                whileHover={{ scale: 1.2 }}
              >
                <element.icon className={`h-6 w-6 ${element.color}`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.0, duration: 0.8 }}
      >
        <motion.div
          animate={prefersReducedMotion ? {} : {
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
        <span className="text-sm text-muted-foreground">Scroll to explore</span>
      </motion.div>
    </motion.section>
  );
});

AdvancedHero.displayName = 'AdvancedHero';

export default AdvancedHero;