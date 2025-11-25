import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, User, Briefcase, Wrench } from "lucide-react";
import { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";

interface FinalStepProps {
  selectedRoles: UserRole[];
  onBack: () => void;
}

const dashboardLinks: Record<UserRole, { icon: typeof ShoppingBag; label: string; path: string }> = {
  buyer: {
    icon: ShoppingBag,
    label: "Buyer Dashboard",
    path: "/dashboard/buyer",
  },
  seller: {
    icon: User,
    label: "Seller Dashboard",
    path: "/dashboard/seller",
  },
  client: {
    icon: Briefcase,
    label: "Client Dashboard",
    path: "/dashboard/client",
  },
  worker: {
    icon: Wrench,
    label: "Worker Dashboard",
    path: "/dashboard/worker",
  },
};

export const FinalStep = ({ selectedRoles, onBack }: FinalStepProps) => {
  const navigate = useNavigate();

  const handleDashboardClick = (path: string) => {
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle2 className="h-24 w-24 text-green-500" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-2"
        >
          Setup Complete! 🎉
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground"
        >
          Your profiles are all set and marketplace-ready
        </motion.p>
      </div>

      <Card className="glass-effect border-border p-8 mb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold mb-6">Where would you like to start?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedRoles.map((role) => {
              const dashboard = dashboardLinks[role];
              const Icon = dashboard.icon;

              return (
                <motion.button
                  key={role}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDashboardClick(dashboard.path)}
                  className="p-6 rounded-lg border-2 border-border hover:border-primary bg-secondary/50 hover:bg-secondary transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold capitalize">{dashboard.label}</p>
                      <p className="text-sm text-muted-foreground">Go to {role} hub</p>
                    </div>
                    <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </Card>

      <Card className="glass-effect border-border p-6 bg-blue-50/10 border-blue-500/20 mb-6">
        <h4 className="font-semibold text-sm mb-3">What's next?</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Your profile is visible on the marketplace</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Complete your verification to unlock more features</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">✓</span>
            <span>Edit your profile anytime from settings</span>
          </li>
        </ul>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3"
      >
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={() => handleDashboardClick(dashboardLinks[selectedRoles[0]].path)}
          className="flex-1 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
        >
          Continue to Dashboard →
        </Button>
      </motion.div>
    </motion.div>
  );
};
