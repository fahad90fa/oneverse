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

      if (buttonRect && isHovered) {
        const buttonCenterX = buttonRect.left + buttonRect.width / 2 - rect.left;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2 - rect.top;

        const distanceX = mouseXPos - buttonCenterX;
        const distanceY = mouseYPos - buttonCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        const maxDistance = 150;
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
      className="relative min-h-screen flex items-center overflow-hidden pt-20 md:pt-0"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0">
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

        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 md:w-2 md:h-2 bg-white/20 rounded-full"
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

        <div className="absolute inset-0 opacity-10 hidden md:block">
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

      {floatingBadges.map((badge, index) => (
        <motion.div
          key={index}
          className={`absolute ${badge.position} glass-effect px-2 py-1 md:px-3 md:py-2 rounded-full text-xs md:text-sm font-medium hidden lg:block`}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-screen py-12 md:py-20">

          <div className="space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight"
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

            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <div className="flex items-center gap-2 md:gap-4 text-base md:text-xl lg:text-2xl text-muted-foreground">
                <span>Your all-in-one freelance marketplace</span>
              </div>

              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="text-muted-foreground">Featuring:</span>
                <motion.div
                  key={currentKeyword}
                  initial={{ opacity: 0, y: 20, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: 90 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex items-center gap-1 md:gap-2"
                >
                  <motion.div
                    className={`p-1.5 md:p-2 rounded-lg bg-gradient-to-r ${keywords[currentKeyword].color} text-white`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {React.createElement(keywords[currentKeyword].icon, { className: "h-4 w-4 md:h-5 md:w-5" })}
                  </motion.div>
                  <span className={`font-bold bg-gradient-to-r ${keywords[currentKeyword].color} bg-clip-text text-transparent text-sm md:text-base`}>
                    {keywords[currentKeyword].text}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
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
                  className="group relative w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 md:px-8 py-3 md:py-6 text-sm md:text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
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
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
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
                  className="group relative w-full sm:w-auto glass-effect border-2 border-gradient-to-r from-purple-500 to-blue-500 px-4 md:px-8 py-3 md:py-6 text-sm md:text-lg font-semibold hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300"
                >
                  <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-2 md:gap-3"
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
                  className="glass-effect px-2 md:px-3 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
                >
                  {text}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="glass-effect p-2 md:p-4 rounded-xl text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.0 + index * 0.1, duration: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <stat.icon className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-primary" />
                  <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground line-clamp-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative flex items-center justify-center hidden lg:flex"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
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
            >
              <div className="relative w-80 h-96 md:w-96 md:h-full mx-auto">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl"
                  animate={prefersReducedMotion ? {} : {
                    boxShadow: [
                      "0 0 60px rgba(168, 85, 247, 0.3)",
                      "0 0 100px rgba(59, 130, 246, 0.5)",
                      "0 0 60px rgba(168, 85, 247, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="relative z-10 w-full h-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-purple-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-sm md:text-lg text-white/80 font-medium">OneVerse Platform</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
});

AdvancedHero.displayName = "AdvancedHero";
export default AdvancedHero;
