import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/animations/pageTransitions";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load all page components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BuyerDashboard = lazy(() => import("./pages/dashboard/BuyerDashboard"));
const SellerDashboard = lazy(() => import("./pages/dashboard/SellerDashboard"));
const ClientDashboard = lazy(() => import("./pages/dashboard/ClientDashboard"));
const ClientAnalytics = lazy(() => import("./pages/dashboard/ClientAnalytics"));
const ClientActivity = lazy(() => import("./pages/dashboard/ClientActivity"));
const ClientProposals = lazy(() => import("./pages/dashboard/ClientProposals"));
const ClientMilestones = lazy(() => import("./pages/dashboard/ClientMilestones"));
const WorkerDashboard = lazy(() => import("./pages/dashboard/WorkerDashboard"));
const WorkerAnalytics = lazy(() => import("./pages/dashboard/WorkerAnalytics"));
const WorkerActivity = lazy(() => import("./pages/dashboard/WorkerActivity"));
const WorkerGigs = lazy(() => import("./pages/dashboard/WorkerGigs"));
const WorkerReviews = lazy(() => import("./pages/dashboard/WorkerReviews"));
const WorkerPortfolio = lazy(() => import("./pages/dashboard/WorkerPortfolio"));
const Products = lazy(() => import("./pages/marketplace/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Gigs = lazy(() => import("./pages/marketplace/Gigs"));
const GigDetail = lazy(() => import("./pages/GigDetail"));
const Social = lazy(() => import("./pages/Social"));
const Feed = lazy(() => import("./pages/Feed"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Cart = lazy(() => import("./pages/Cart"));
const Proposals = lazy(() => import("./pages/Proposals"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Admin = lazy(() => import("./pages/Admin"));
const Verification = lazy(() => import("./pages/Verification"));
const Connections = lazy(() => import("./pages/Connections"));
const Search = lazy(() => import("./pages/Search"));
const TwoFactorSetup = lazy(() => import("./pages/TwoFactorSetup"));
const BuyerSettings = lazy(() => import("./pages/BuyerSettings"));
const BuyerProfile = lazy(() => import("./pages/BuyerProfile"));
const BuyerReviews = lazy(() => import("./pages/BuyerReviews"));
const SellerRevenue = lazy(() => import("./pages/seller/SellerRevenue"));
const SellerAnalytics = lazy(() => import("./pages/seller/SellerAnalytics"));
const SellerCustomers = lazy(() => import("./pages/seller/SellerCustomers"));
const ProductNew = lazy(() => import("./pages/ProductNew"));
const ProductManage = lazy(() => import("./pages/ProductManage"));
const OrdersManage = lazy(() => import("./pages/OrdersManage"));
const StoreSettings = lazy(() => import("./pages/StoreSettings"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const Press = lazy(() => import("./pages/Press"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Security = lazy(() => import("./pages/Security"));
const Status = lazy(() => import("./pages/Status"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Courses = lazy(() => import("./pages/Courses"));
const WorkerBlogs = lazy(() => import("./pages/dashboard/WorkerBlogs"));
const WorkerCourses = lazy(() => import("./pages/dashboard/WorkerCourses"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/dashboard/buyer" element={<PageTransition><BuyerDashboard /></PageTransition>} />
        <Route path="/dashboard/seller" element={<PageTransition><SellerDashboard /></PageTransition>} />
        <Route path="/dashboard/client" element={<PageTransition><ClientDashboard /></PageTransition>} />
        <Route path="/dashboard/client/analytics" element={<PageTransition><ClientAnalytics /></PageTransition>} />
        <Route path="/dashboard/client/activity" element={<PageTransition><ClientActivity /></PageTransition>} />
        <Route path="/dashboard/client/proposals" element={<PageTransition><ClientProposals /></PageTransition>} />
        <Route path="/dashboard/client/milestones" element={<PageTransition><ClientMilestones /></PageTransition>} />
        <Route path="/dashboard/worker" element={<PageTransition><WorkerDashboard /></PageTransition>} />
        <Route path="/dashboard/worker/analytics" element={<PageTransition><WorkerAnalytics /></PageTransition>} />
        <Route path="/dashboard/worker/activity" element={<PageTransition><WorkerActivity /></PageTransition>} />
        <Route path="/dashboard/worker/gigs" element={<PageTransition><WorkerGigs /></PageTransition>} />
        <Route path="/dashboard/worker/reviews" element={<PageTransition><WorkerReviews /></PageTransition>} />
        <Route path="/dashboard/worker/portfolio" element={<PageTransition><WorkerPortfolio /></PageTransition>} />
        <Route path="/dashboard/worker/blogs" element={<PageTransition><WorkerBlogs /></PageTransition>} />
        <Route path="/dashboard/worker/courses" element={<PageTransition><WorkerCourses /></PageTransition>} />
        <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/gigs" element={<PageTransition><Gigs /></PageTransition>} />
        <Route path="/gig/:id" element={<PageTransition><GigDetail /></PageTransition>} />
        <Route path="/social" element={<PageTransition><Social /></PageTransition>} />
        <Route path="/feed" element={<PageTransition><Feed /></PageTransition>} />
        <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
        <Route path="/chat" element={<PageTransition><Chat /></PageTransition>} />
        <Route path="/profile/:userId" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/profile/edit" element={<PageTransition><EditProfile /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><Orders /></PageTransition>} />
        <Route path="/order/:id" element={<PageTransition><OrderDetail /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/proposals/:jobId" element={<PageTransition><Proposals /></PageTransition>} />
        <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
        <Route path="/job/:id" element={<PageTransition><JobDetail /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/project/:id" element={<PageTransition><ProjectDetail /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/verification" element={<PageTransition><Verification /></PageTransition>} />
        <Route path="/connections" element={<PageTransition><Connections /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/2fa-setup" element={<PageTransition><TwoFactorSetup /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><BuyerSettings /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><BuyerProfile /></PageTransition>} />
        <Route path="/reviews" element={<PageTransition><BuyerReviews /></PageTransition>} />
        <Route path="/dashboard/seller/revenue" element={<PageTransition><SellerRevenue /></PageTransition>} />
        <Route path="/dashboard/seller/analytics" element={<PageTransition><SellerAnalytics /></PageTransition>} />
        <Route path="/dashboard/seller/customers" element={<PageTransition><SellerCustomers /></PageTransition>} />
        <Route path="/products/new" element={<PageTransition><ProductNew /></PageTransition>} />
        <Route path="/products/manage" element={<PageTransition><ProductManage /></PageTransition>} />
        <Route path="/orders/manage" element={<PageTransition><OrdersManage /></PageTransition>} />
        <Route path="/settings/store" element={<PageTransition><StoreSettings /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/press" element={<PageTransition><Press /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/security" element={<PageTransition><Security /></PageTransition>} />
        <Route path="/status" element={<PageTransition><Status /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
        <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
