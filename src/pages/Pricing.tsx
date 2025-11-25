import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Sparkles, Crown, Zap, Users, ShoppingCart, Briefcase, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PricingPlan, UserRole } from "@/types";

const roleIcons = {
  buyer: ShoppingCart,
  seller: Briefcase,
  client: User,
  worker: Wrench,
};

const roleLabels = {
  buyer: "Buyers",
  seller: "Sellers",
  client: "Clients",
  worker: "Workers",
};

const pricingData: Record<UserRole, PricingPlan[]> = {
  buyer: [
    {
      id: "buyer-free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      ctaText: "Get Started Free",
      ctaLink: "/auth",
      features: [
        { name: "Browse unlimited products", included: true },
        { name: "Add to wishlist", included: true },
        { name: "Basic support", included: true },
        { name: "Standard checkout", included: true },
        { name: "Priority support", included: false },
        { name: "Save payment methods", included: false },
        { name: "Order tracking", included: false },
        { name: "Early access to sales", included: false },
        { name: "5% cashback on purchases", included: false },
        { name: "10% cashback on all purchases", included: false },
        { name: "VIP customer support", included: false },
        { name: "Custom integrations", included: false },
      ],
    },
    {
      id: "buyer-starter",
      name: "Starter",
      description: "For growing individuals",
      monthlyPrice: 9,
      yearlyPrice: 99,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "Browse unlimited products", included: true },
        { name: "Add to wishlist", included: true },
        { name: "Basic support", included: true },
        { name: "Standard checkout", included: true },
        { name: "Priority support", included: true },
        { name: "Save payment methods", included: true },
        { name: "Order tracking", included: true },
        { name: "Early access to sales", included: true },
        { name: "5% cashback on purchases", included: true },
        { name: "10% cashback on all purchases", included: false },
        { name: "VIP customer support", included: false },
        { name: "Custom integrations", included: false },
      ],
    },
    {
      id: "buyer-professional",
      name: "Professional",
      description: "For serious businesses",
      monthlyPrice: 19,
      yearlyPrice: 199,
      popular: true,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "Browse unlimited products", included: true },
        { name: "Add to wishlist", included: true },
        { name: "Basic support", included: true },
        { name: "Standard checkout", included: true },
        { name: "Priority support", included: true },
        { name: "Save payment methods", included: true },
        { name: "Order tracking", included: true },
        { name: "Early access to sales", included: true },
        { name: "5% cashback on purchases", included: true },
        { name: "10% cashback on all purchases", included: true },
        { name: "VIP customer support", included: true },
        { name: "Custom integrations", included: false },
      ],
    },
    {
      id: "buyer-enterprise",
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 49,
      yearlyPrice: 499,
      ctaText: "Contact Sales",
      ctaLink: "/contact",
      features: [
        { name: "Browse unlimited products", included: true },
        { name: "Add to wishlist", included: true },
        { name: "Basic support", included: true },
        { name: "Standard checkout", included: true },
        { name: "Priority support", included: true },
        { name: "Save payment methods", included: true },
        { name: "Order tracking", included: true },
        { name: "Early access to sales", included: true },
        { name: "5% cashback on purchases", included: true },
        { name: "10% cashback on all purchases", included: true },
        { name: "VIP customer support", included: true },
        { name: "Custom integrations", included: true },
      ],
    },
  ],
  seller: [
    {
      id: "seller-free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      ctaText: "Get Started Free",
      ctaLink: "/auth",
      features: [
        { name: "List up to 5 products", included: true },
        { name: "Basic analytics", included: true },
        { name: "Standard support", included: true },
        { name: "Basic storefront", included: true },
        { name: "Priority listing", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Custom storefront", included: false },
        { name: "Marketing tools", included: false },
        { name: "Bulk operations", included: false },
        { name: "API access", included: false },
        { name: "White-label solutions", included: false },
        { name: "Dedicated account manager", included: false },
      ],
    },
    {
      id: "seller-starter",
      name: "Starter",
      description: "For growing sellers",
      monthlyPrice: 19,
      yearlyPrice: 199,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "List up to 5 products", included: true },
        { name: "Basic analytics", included: true },
        { name: "Standard support", included: true },
        { name: "Basic storefront", included: true },
        { name: "Priority listing", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom storefront", included: true },
        { name: "Marketing tools", included: true },
        { name: "Bulk operations", included: false },
        { name: "API access", included: false },
        { name: "White-label solutions", included: false },
        { name: "Dedicated account manager", included: false },
      ],
    },
    {
      id: "seller-professional",
      name: "Professional",
      description: "For serious businesses",
      monthlyPrice: 39,
      yearlyPrice: 399,
      popular: true,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "List up to 5 products", included: true },
        { name: "Basic analytics", included: true },
        { name: "Standard support", included: true },
        { name: "Basic storefront", included: true },
        { name: "Priority listing", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom storefront", included: true },
        { name: "Marketing tools", included: true },
        { name: "Bulk operations", included: true },
        { name: "API access", included: true },
        { name: "White-label solutions", included: false },
        { name: "Dedicated account manager", included: false },
      ],
    },
    {
      id: "seller-enterprise",
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 99,
      yearlyPrice: 999,
      ctaText: "Contact Sales",
      ctaLink: "/contact",
      features: [
        { name: "List up to 5 products", included: true },
        { name: "Basic analytics", included: true },
        { name: "Standard support", included: true },
        { name: "Basic storefront", included: true },
        { name: "Priority listing", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom storefront", included: true },
        { name: "Marketing tools", included: true },
        { name: "Bulk operations", included: true },
        { name: "API access", included: true },
        { name: "White-label solutions", included: true },
        { name: "Dedicated account manager", included: true },
      ],
    },
  ],
  client: [
    {
      id: "client-free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      ctaText: "Get Started Free",
      ctaLink: "/auth",
      features: [
        { name: "Post up to 3 jobs", included: true },
        { name: "Basic job search", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority job posting", included: false },
        { name: "Advanced filtering", included: false },
        { name: "Project management tools", included: false },
        { name: "Team collaboration", included: false },
        { name: "Bulk hiring", included: false },
        { name: "Analytics dashboard", included: false },
        { name: "Custom contracts", included: false },
        { name: "Dedicated success manager", included: false },
      ],
    },
    {
      id: "client-starter",
      name: "Starter",
      description: "For growing clients",
      monthlyPrice: 29,
      yearlyPrice: 299,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "Post up to 3 jobs", included: true },
        { name: "Basic job search", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority job posting", included: true },
        { name: "Advanced filtering", included: true },
        { name: "Project management tools", included: true },
        { name: "Team collaboration", included: true },
        { name: "Bulk hiring", included: false },
        { name: "Analytics dashboard", included: false },
        { name: "Custom contracts", included: false },
        { name: "Dedicated success manager", included: false },
      ],
    },
    {
      id: "client-professional",
      name: "Professional",
      description: "For serious businesses",
      monthlyPrice: 59,
      yearlyPrice: 599,
      popular: true,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "Post up to 3 jobs", included: true },
        { name: "Basic job search", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority job posting", included: true },
        { name: "Advanced filtering", included: true },
        { name: "Project management tools", included: true },
        { name: "Team collaboration", included: true },
        { name: "Bulk hiring", included: true },
        { name: "Analytics dashboard", included: true },
        { name: "Custom contracts", included: false },
        { name: "Dedicated success manager", included: false },
      ],
    },
    {
      id: "client-enterprise",
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 149,
      yearlyPrice: 1499,
      ctaText: "Contact Sales",
      ctaLink: "/contact",
      features: [
        { name: "Post up to 3 jobs", included: true },
        { name: "Basic job search", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority job posting", included: true },
        { name: "Advanced filtering", included: true },
        { name: "Project management tools", included: true },
        { name: "Team collaboration", included: true },
        { name: "Bulk hiring", included: true },
        { name: "Analytics dashboard", included: true },
        { name: "Custom contracts", included: true },
        { name: "Dedicated success manager", included: true },
      ],
    },
  ],
  worker: [
    {
      id: "worker-free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      ctaText: "Get Started Free",
      ctaLink: "/auth",
      features: [
        { name: "Create up to 3 gigs", included: true },
        { name: "Basic profile", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority gig placement", included: false },
        { name: "Advanced portfolio", included: false },
        { name: "Client management tools", included: false },
        { name: "Marketing assistance", included: false },
        { name: "Bulk proposals", included: false },
        { name: "Analytics insights", included: false },
        { name: "Custom branding", included: false },
        { name: "Account management team", included: false },
      ],
    },
    {
      id: "worker-starter",
      name: "Starter",
      description: "For growing freelancers",
      monthlyPrice: 14,
      yearlyPrice: 149,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "Create up to 3 gigs", included: true },
        { name: "Basic profile", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority gig placement", included: true },
        { name: "Advanced portfolio", included: true },
        { name: "Client management tools", included: true },
        { name: "Marketing assistance", included: true },
        { name: "Bulk proposals", included: false },
        { name: "Analytics insights", included: false },
        { name: "Custom branding", included: false },
        { name: "Account management team", included: false },
      ],
    },
    {
      id: "worker-professional",
      name: "Professional",
      description: "For serious freelancers",
      monthlyPrice: 29,
      yearlyPrice: 299,
      popular: true,
      ctaText: "Start Free Trial",
      ctaLink: "/auth",
      features: [
        { name: "Create up to 3 gigs", included: true },
        { name: "Basic profile", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority gig placement", included: true },
        { name: "Advanced portfolio", included: true },
        { name: "Client management tools", included: true },
        { name: "Marketing assistance", included: true },
        { name: "Bulk proposals", included: true },
        { name: "Analytics insights", included: true },
        { name: "Custom branding", included: false },
        { name: "Account management team", included: false },
      ],
    },
    {
      id: "worker-enterprise",
      name: "Enterprise",
      description: "For freelance agencies",
      monthlyPrice: 79,
      yearlyPrice: 799,
      ctaText: "Contact Sales",
      ctaLink: "/contact",
      features: [
        { name: "Create up to 3 gigs", included: true },
        { name: "Basic profile", included: true },
        { name: "Standard support", included: true },
        { name: "Basic proposals", included: true },
        { name: "Priority gig placement", included: true },
        { name: "Advanced portfolio", included: true },
        { name: "Client management tools", included: true },
        { name: "Marketing assistance", included: true },
        { name: "Bulk proposals", included: true },
        { name: "Analytics insights", included: true },
        { name: "Custom branding", included: true },
        { name: "Account management team", included: true },
      ],
    },
  ],
};

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Absolutely. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your data. We're SOC 2 compliant.",
  },
];

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("buyer");
  const [currentPlans, setCurrentPlans] = useState<PricingPlan[]>(pricingData.buyer);

  useEffect(() => {
    setCurrentPlans(pricingData[selectedRole]);
  }, [selectedRole]);

  const formatPrice = (price: number, isYearly: boolean) => {
    if (price === 0) return "Free";
    return isYearly ? `$${Math.round(price * 12)}` : `$${price}`;
  };

  const getPeriodText = (isYearly: boolean) => {
    return isYearly ? "/year" : "/month";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-indigo-500 to-gold-600 bg-clip-text text-transparent"
          >
            Choose Your Perfect Plan
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Start free, upgrade when you need more. Cancel anytime, no questions asked.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className={`text-lg font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ${
                isYearly
                  ? 'bg-gradient-to-r from-indigo-500 to-gold-600 shadow-lg shadow-indigo-500/30'
                  : 'bg-input hover:bg-indigo-100'
              }`}
            >
              <div
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-300 ${
                  isYearly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="bg-gradient-to-r from-indigo-500 to-gold-600 text-white animate-pulse">
              Save 20%
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Role Toggle */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-8"
          >
            <p className="text-muted-foreground mb-4">View plans for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(roleLabels) as UserRole[]).map((role) => {
                const Icon = roleIcons[role];
                return (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    onClick={() => setSelectedRole(role)}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      selectedRole === role
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-md scale-105"
                        : "hover:scale-105"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {roleLabels[role]}
                    {selectedRole === role && (
                      <motion.div
                        layoutId="activeRole"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-md"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="wait">
              {currentPlans.map((plan, index) => (
                <motion.div
                  key={`${selectedRole}-${plan.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative ${plan.popular ? 'lg:scale-105 lg:-mt-4' : ''}`}
                >
                  <Card className={`relative overflow-hidden h-full backdrop-blur-sm bg-card/50 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular
                      ? 'border-gradient-to-r from-electric-blue-500 to-cyan-500 shadow-electric-blue-500/20'
                      : 'border-border hover:border-primary/50'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-electric-blue-500 to-cyan-500 text-white px-4 py-1 shadow-lg">
                          <Star className="w-3 h-3 mr-1" />
                          MOST POPULAR
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className={`text-2xl font-bold ${plan.popular ? 'bg-gradient-to-r from-electric-blue-500 to-cyan-500 bg-clip-text text-transparent' : ''}`}>
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>

                      <div className="mt-4">
                        <div className="flex items-baseline justify-center">
                          <motion.span
                            key={`${plan.id}-${isYearly}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold"
                          >
                            {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice, isYearly)}
                          </motion.span>
                          {plan.monthlyPrice > 0 && (
                            <span className="text-muted-foreground ml-1">
                              {getPeriodText(isYearly)}
                            </span>
                          )}
                        </div>
                        {isYearly && plan.monthlyPrice > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Billed annually (${plan.yearlyPrice}/year)
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <Button
                        className={`w-full transition-all duration-300 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-electric-blue-500 to-cyan-500 hover:from-electric-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            : plan.monthlyPrice === 0
                            ? 'border-2 border-primary/50 hover:bg-primary/10'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                        variant={plan.monthlyPrice === 0 ? "outline" : "default"}
                      >
                        {plan.ctaText}
                      </Button>

                      <div className="space-y-3">
                        {plan.features.slice(0, 5).map((feature, featureIndex) => (
                          <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + featureIndex * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className={`mt-0.5 rounded-full p-1 ${
                              feature.included
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-muted'
                            }`}>
                              <Check className={`w-3 h-3 ${
                                feature.included ? 'text-white' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <span className={`text-sm ${
                              feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                            }`}>
                              {feature.name}
                            </span>
                          </motion.div>
                        ))}

                        <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
                          View all features →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
            <p className="text-muted-foreground">Detailed breakdown of what's included in each plan</p>
          </motion.div>

          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-2">Features</th>
                      {currentPlans.map((plan) => (
                        <th key={plan.id} className="text-center py-4 px-2 min-w-[120px]">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPlans[0]?.features.map((feature, index) => (
                      <motion.tr
                        key={feature.name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50"
                      >
                        <td className="py-4 px-2 font-medium">{feature.name}</td>
                        {currentPlans.map((plan) => (
                          <td key={`${plan.id}-${feature.name}`} className="text-center py-4 px-2">
                            {plan.features[index]?.included ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <div className="w-5 h-5 mx-auto rounded-full bg-muted"></div>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our pricing</p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem value={`item-${index}`} className="backdrop-blur-sm bg-card/50 border border-border/50 rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-muted-foreground">Secure payments, guaranteed satisfaction</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">256-bit SSL encryption, PCI compliant</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Money Back Guarantee</h3>
              <p className="text-sm text-muted-foreground">30-day refund policy, no questions asked</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-electric-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated support team available around the clock</p>
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-sm text-muted-foreground">Accepted Payments:</div>
            <div className="flex gap-4">
              <div className="bg-white rounded px-2 py-1 text-xs font-medium">Visa</div>
              <div className="bg-white rounded px-2 py-1 text-xs font-medium">Mastercard</div>
              <div className="bg-white rounded px-2 py-1 text-xs font-medium">PayPal</div>
              <div className="bg-white rounded px-2 py-1 text-xs font-medium">Apple Pay</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Still not sure?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with our free plan and upgrade anytime. No risk, no commitment.
              Join thousands of satisfied users growing their business with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-electric-blue-500 to-cyan-500 hover:from-electric-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;