import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { buyerSetupSchema, BuyerSetupData } from "@/lib/onboarding-schemas";

interface BuyerStepProps {
  defaultValues?: BuyerSetupData;
  onNext: (data: BuyerSetupData) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const INTEREST_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Art & Crafts",
  "Beauty",
  "Food & Beverage",
];

const PAYMENT_METHODS = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer"];
const NOTIFICATION_OPTIONS = ["Email", "In-App", "SMS"];

export const BuyerStep = ({
  defaultValues,
  onNext,
  onBack,
  isLoading = false,
}: BuyerStepProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BuyerSetupData>({
    resolver: zodResolver(buyerSetupSchema),
    defaultValues: defaultValues || {
      fullName: "",
      shippingAddress: "",
      preferenceType: "delivery",
      interestCategories: [],
      wantRecommendations: false,
      paymentMethod: "",
      notificationPreferences: [],
    },
  });

  const interestCategories = watch("interestCategories");
  const notificationPrefs = watch("notificationPreferences");
  const wantRecommendations = watch("wantRecommendations");

  const toggleCategory = (cat: string) => {
    const current = interestCategories || [];
    setValue(
      "interestCategories",
      current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat]
    );
  };

  const toggleNotification = (pref: string) => {
    const current = notificationPrefs || [];
    setValue(
      "notificationPreferences",
      current.includes(pref) ? current.filter((p) => p !== pref) : [...current, pref]
    );
  };

  const onSubmit = async (data: BuyerSetupData) => {
    try {
      await onNext(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save buyer preferences";
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
        <h3 className="text-2xl font-bold mb-6">Let's set up your buying preferences! 🛍</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (for deliveries) *</Label>
            <Input
              {...register("fullName")}
              id="fullName"
              placeholder="John Doe"
              className="glass-effect"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address *</Label>
            <Input
              {...register("shippingAddress")}
              id="shippingAddress"
              placeholder="123 Main St, City, State, ZIP"
              className="glass-effect"
            />
            {errors.shippingAddress && (
              <p className="text-sm text-red-500">{errors.shippingAddress.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Prefer delivery or pickup? *</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "delivery", label: "Delivery" },
                { value: "pickup", label: "Pickup" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    watch("preferenceType") === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <input
                    {...register("preferenceType")}
                    type="radio"
                    value={option.value}
                    className="hidden"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Interest Categories *</Label>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`p-2 rounded-lg border transition-all text-left ${
                    (interestCategories || []).includes(cat)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.interestCategories && (
              <p className="text-sm text-red-500">{errors.interestCategories.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Default Payment Method *</Label>
            <select
              {...register("paymentMethod")}
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

          <div className="space-y-3">
            <Label>Notification Preferences *</Label>
            <div className="space-y-2">
              {NOTIFICATION_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(notificationPrefs || []).includes(option)}
                    onCheckedChange={() => toggleNotification(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {errors.notificationPreferences && (
              <p className="text-sm text-red-500">{errors.notificationPreferences.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={wantRecommendations}
                onCheckedChange={(checked) => setValue("wantRecommendations", checked as boolean)}
              />
              <span className="text-sm">Get personalized recommendations</span>
            </label>
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
