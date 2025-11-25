import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { clientSetupSchema, ClientSetupData } from "@/lib/onboarding-schemas";

interface ClientStepProps {
  defaultValues?: ClientSetupData;
  onNext: (data: ClientSetupData) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const INDUSTRIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Other",
];

const PROJECT_TYPES = [
  "Web Development",
  "Mobile App",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Video Production",
  "Other",
];

const COMMUNICATION_STYLES = [
  "Chat",
  "Video Calls",
  "Email",
  "Project Management Tools",
  "Mixed",
];

const BUDGET_RANGES = [
  "Under $500",
  "$500 - $2,500",
  "$2,500 - $10,000",
  "$10,000+",
  "Not sure yet",
];

const PAYMENT_METHODS = ["Credit Card", "Bank Transfer", "PayPal", "Other"];

export const ClientStep = ({
  defaultValues,
  onNext,
  onBack,
  isLoading = false,
}: ClientStepProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientSetupData>({
    resolver: zodResolver(clientSetupSchema),
    defaultValues: defaultValues || {
      companyName: "",
      industry: "",
      projectTypes: [],
      communicationStyle: "",
      budgetRange: "",
      paymentMethod: "",
      billingInfo: "",
    },
  });

  const projectTypes = watch("projectTypes");

  const toggleProjectType = (type: string) => {
    const current = projectTypes || [];
    setValue(
      "projectTypes",
      current.includes(type) ? current.filter((p) => p !== type) : [...current, type]
    );
  };

  const onSubmit = async (data: ClientSetupData) => {
    try {
      await onNext(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save client preferences";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-effect border-border p-8">
        <h3 className="text-2xl font-bold mb-6">Ready to hire? Let's customize your needs! 🎯</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company or Client Name *</Label>
            <Input
              {...register("companyName")}
              id="companyName"
              placeholder="Your Company Name"
              className="glass-effect"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry/Focus Area *</Label>
            <select
              {...register("industry")}
              id="industry"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-sm text-red-500">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Common Project Types *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleProjectType(type)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    (projectTypes || []).includes(type)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.projectTypes && (
              <p className="text-sm text-red-500">{errors.projectTypes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="communicationStyle">Preferred Communication Style *</Label>
            <select
              {...register("communicationStyle")}
              id="communicationStyle"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select communication style</option>
              {COMMUNICATION_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            {errors.communicationStyle && (
              <p className="text-sm text-red-500">{errors.communicationStyle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetRange">Typical Project Budget Range *</Label>
            <select
              {...register("budgetRange")}
              id="budgetRange"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select budget range</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            {errors.budgetRange && (
              <p className="text-sm text-red-500">{errors.budgetRange.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <select
              {...register("paymentMethod")}
              id="paymentMethod"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select payment method</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingInfo">Billing Information (Optional)</Label>
            <Textarea
              {...register("billingInfo")}
              id="billingInfo"
              placeholder="Add any additional billing information..."
              className="glass-effect resize-none h-24"
            />
            {errors.billingInfo && (
              <p className="text-sm text-red-500">{errors.billingInfo.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isSubmitting || isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-blue-500"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? "Saving..." : "Next →"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};
