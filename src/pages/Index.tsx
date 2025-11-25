import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShoppingBag,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  Star,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  TrendingUp
} from "lucide-react";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import AdvancedHero from "@/components/landing/AdvancedHero";
import { useTheme } from "next-themes";

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: ShoppingBag,
      title: "E-Commerce",
      description: "Buy and sell products with ease",
      gradient: "from-electric-blue-500 to-sky-blue-500",
      link: "/products"
    },
    {
      icon: Briefcase,
      title: "Freelance Marketplace",
      description: "Find gigs or hire talented workers",
      gradient: "from-blue-500 to-cyan-500",
      link: "/gigs"
    },
    {
      icon: Users,
      title: "Social Network",
      description: "Connect and share with others",
      gradient: "from-cyan-500 to-electric-blue-500",
      link: "/social"
    },
    {
      icon: Sparkles,
      title: "Portfolio Showcase",
      description: "Display your amazing work",
      gradient: "from-electric-blue-500 to-cyan-500",
      link: "/portfolio"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50K+", label: "Products Listed", icon: ShoppingBag },
    { value: "5K+", label: "Services Available", icon: Briefcase },
    { value: "98%", label: "Satisfaction Rate", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ThemeToggle />

      {/* Advanced Hero Section */}
      <AdvancedHero />

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              One Platform,{" "}
              <span className="bg-gradient-to-r from-accent to-cyan-500 bg-clip-text text-transparent">
                Infinite Possibilities
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience seamless integration of commerce, work, and social networking
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card
                  onClick={() => navigate(feature.link)}
                  className="group relative overflow-hidden glass-effect border-border hover:border-primary/50 transition-all duration-300 hover-scale cursor-pointer h-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="p-6 relative z-10 h-full flex flex-col">
                    <motion.div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-accent to-primary rounded-full hidden md:block" />

            <div className="space-y-12">
              {[
                {
                  step: 1,
                  title: "Create Your Account",
                  description: "Sign up and choose your role - buyer, seller, client, or worker",
                  icon: Users,
                  position: "left"
                },
                {
                  step: 2,
                  title: "Explore & Connect",
                  description: "Browse products, gigs, jobs, and connect with the community",
                  icon: Globe,
                  position: "right"
                },
                {
                  step: 3,
                  title: "Start Your Journey",
                  description: "Begin shopping, working, or showcasing your portfolio",
                  icon: Zap,
                  position: "left"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center ${item.position === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:gap-8 gap-4`}
                  initial={{ opacity: 0, x: item.position === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(var(--primary), 0.3)",
                            "0 0 40px rgba(var(--primary), 0.6)",
                            "0 0 20px rgba(var(--primary), 0.3)"
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      >
                        <item.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-white font-bold text-sm"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                      >
                        {item.step}
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`flex-1 ${item.position === 'left' ? 'md:text-right' : 'md:text-left'} text-center md:text-left`}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Card className="glass-effect border-border p-6 hover:shadow-xl transition-all duration-300">
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="glass-effect border-border p-6 hover:shadow-lg transition-all duration-300">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <motion.h3
                    className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5, type: "spring" }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our{" "}
              <span className="bg-gradient-to-r from-electric-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Users Say
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their online experience
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="flex gap-6"
              animate={prefersReducedMotion ? {} : {
                x: [0, -100 * 6] // Move by the width of 6 cards
              }}
              transition={prefersReducedMotion ? {} : {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[
                {
                  name: "Sarah Johnson",
                  role: "Freelance Designer",
                  avatar: "SJ",
                  content: "This platform revolutionized how I find clients and showcase my work. The integrated tools make everything so seamless!",
                  rating: 5
                },
                {
                  name: "Mike Chen",
                  role: "E-commerce Seller",
                  avatar: "MC",
                  content: "From product listings to customer management, everything I need is in one place. My sales have increased by 300%!",
                  rating: 5
                },
                {
                  name: "Emily Rodriguez",
                  role: "Project Manager",
                  avatar: "ER",
                  content: "Finding talented workers has never been easier. The quality of freelancers on this platform is outstanding.",
                  rating: 5
                },
                {
                  name: "David Kim",
                  role: "Software Developer",
                  avatar: "DK",
                  content: "The portfolio showcase helped me land my dream job. The community features are incredibly valuable.",
                  rating: 5
                },
                {
                  name: "Lisa Thompson",
                  role: "Small Business Owner",
                  avatar: "LT",
                  content: "This all-in-one solution saved me hours every week. The interface is intuitive and the support is excellent.",
                  rating: 5
                },
                {
                  name: "Alex Martinez",
                  role: "Digital Marketer",
                  avatar: "AM",
                  content: "The social networking features combined with marketplace tools create endless opportunities for collaboration.",
                  rating: 5
                }
              ].concat([
                {
                  name: "Sarah Johnson",
                  role: "Freelance Designer",
                  avatar: "SJ",
                  content: "This platform revolutionized how I find clients and showcase my work. The integrated tools make everything so seamless!",
                  rating: 5
                },
                {
                  name: "Mike Chen",
                  role: "E-commerce Seller",
                  avatar: "MC",
                  content: "From product listings to customer management, everything I need is in one place. My sales have increased by 300%!",
                  rating: 5
                }
              ]).map((testimonial, index) => (
                <motion.div
                  key={`${testimonial.name}-${index}`}
                  className="flex-shrink-0 w-80"
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card className="glass-effect border-border p-6 h-full hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>

                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1, type: "spring" }}
                          viewport={{ once: true }}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users already experiencing the future of online platforms
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="group bg-gradient-to-r from-primary via-blue-500 to-accent hover:from-primary/90 hover:via-blue-500/90 hover:to-accent/90 text-primary-foreground px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-background/80 backdrop-blur-md border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                oneverse.site
              </h3>
              <p className="text-muted-foreground mb-4">
                The complete solution for e-commerce, freelancing, social networking, and portfolio showcase.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: MessageSquare, label: "Chat" },
                  { icon: Users, label: "Community" },
                  { icon: Shield, label: "Security" },
                  { icon: TrendingUp, label: "Growth" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <item.icon className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                {[
                  { label: "Products", path: "/products" },
                  { label: "Gigs", path: "/gigs" },
                  { label: "Jobs", path: "/jobs" },
                  { label: "Portfolio", path: "/portfolio" },
                  { label: "Social", path: "/social" }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                {[
                  { label: "About", path: "/about" },
                  { label: "Careers", path: "/careers" },
                  { label: "Press", path: "/press" },
                  { label: "Blog", path: "/blog" },
                  { label: "Contact", path: "/contact" }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                {[
                  { label: "Help Center", path: "/help-center" },
                  { label: "Privacy", path: "/privacy" },
                  { label: "Terms", path: "/terms" },
                  { label: "Security", path: "/security" },
                  { label: "Status", path: "/status" }
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              © 2024 oneverse.site. All rights reserved.
            </p>

            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown className="h-5 w-5 rotate-180" />
            </motion.button>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;