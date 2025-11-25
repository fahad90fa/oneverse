import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, User, Briefcase, Wrench } from "lucide-react";
import { UserRole } from "@/types";

interface WelcomeStepProps {
  fullName: string;
  selectedRoles: UserRole[];
  onNext: () => void;
}

const roleDescriptions: Record<UserRole, { icon: typeof ShoppingBag; description: string }> = {
  buyer: {
    icon: ShoppingBag,
    description: "Browse and purchase products from verified sellers",
  },
  seller: {
    icon: User,
    description: "Manage inventory and sell products to customers",
  },
  client: {
    icon: Briefcase,
    description: "Post jobs and hire skilled freelancers",
  },
  worker: {
    icon: Wrench,
    description: "Offer services and apply for projects",
  },
};

export const WelcomeStep = ({ fullName, selectedRoles, onNext }: WelcomeStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome, {fullName}! 👋
        </h2>
        <p className="text-lg text-muted-foreground">
          Let's get your profile set up for the roles you've selected
        </p>
      </div>

      <Card className="glass-effect border-border p-8">
        <h3 className="text-xl font-semibold mb-6">Your Selected Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedRoles.map((role) => {
            const { icon: Icon, description } = roleDescriptions[role];
            return (
              <motion.div
                key={role}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-secondary/50"
              >
                <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold capitalize text-primary">{role}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Card className="glass-effect border-border p-6 bg-blue-50/10 border-blue-500/20">
        <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>We'll guide you through role-specific setup questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>You'll configure preferences and initial content</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>Your profile will be marketplace-ready immediately</span>
          </li>
        </ul>
      </Card>

      <motion.div whileHover={{ scale: 1.02 }}>
        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-lg py-6"
        >
          Begin Setup →
        </Button>
      </motion.div>
    </motion.div>
  );
};
