import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";
import { sellerSetupSchema, SellerSetupData } from "@/lib/onboarding-schemas";
import { useState } from "react";

interface SellerStepProps {
  defaultValues?: SellerSetupData;
  onNext: (data: SellerSetupData) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Art & Crafts",
  "Beauty",
  "Food & Beverage",
  "Other",
];

const DELIVERY_TIMES = ["1-2 days", "3-5 days", "1 week", "2 weeks"];
const WITHDRAWAL_METHODS = ["Bank Transfer", "PayPal", "Stripe", "Other"];

export const SellerStep = ({
  defaultValues,
  onNext,
  onBack,
  isLoading = false,
}: SellerStepProps) => {
  const { toast } = useToast();
  const [shippingZones, setShippingZones] = useState<string[]>(defaultValues?.shippingZones || []);
  const [newZone, setNewZone] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SellerSetupData>({
    resolver: zodResolver(sellerSetupSchema),
    defaultValues: defaultValues || {
      storeName: "",
      categories: [],
      shippingZones: [],
      deliveryTime: "",
      withdrawalMethod: "",
      businessDescription: "",
    },
  });

  const categories = watch("categories");
  const registeredShippingZones = watch("shippingZones");

  const addZone = () => {
    if (newZone.trim()) {
      const updated = [...(registeredShippingZones || []), newZone.trim()];
      setValue("shippingZones", updated);
      setNewZone("");
    }
  };

  const removeZone = (zone: string) => {
    const updated = (registeredShippingZones || []).filter((z) => z !== zone);
    setValue("shippingZones", updated);
  };

  const onSubmit = async (data: SellerSetupData) => {
    try {
      await onNext(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save seller information";
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
        <h3 className="text-2xl font-bold mb-6">Let's set up your store and inventory! 🏪</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              {...register("storeName")}
              id="storeName"
              placeholder="My Awesome Store"
              className="glass-effect"
            />
            {errors.storeName && (
              <p className="text-sm text-red-500">{errors.storeName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Store Logo/Image URL</Label>
            <Input
              {...register("profileImage")}
              id="profileImage"
              placeholder="https://example.com/logo.jpg"
              className="glass-effect"
              type="url"
            />
            {errors.profileImage && (
              <p className="text-sm text-red-500">{errors.profileImage.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Product Categories *</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const currentCategories = categories || [];
                    const updated = currentCategories.includes(cat)
                      ? currentCategories.filter((c) => c !== cat)
                      : [...currentCategories, cat];
                    setValue("categories", updated);
                  }}
                  className={`p-2 rounded-lg border transition-all ${
                    (categories || []).includes(cat)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-red-500">{errors.categories.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Shipping Zones *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                placeholder="e.g., North America"
                className="glass-effect"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addZone())}
              />
              <Button
                type="button"
                onClick={addZone}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(registeredShippingZones || []).map((zone) => (
                <Badge key={zone} variant="secondary" className="flex items-center gap-1">
                  {zone}
                  <button
                    type="button"
                    onClick={() => removeZone(zone)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.shippingZones && (
              <p className="text-sm text-red-500">{errors.shippingZones.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Average Delivery Time *</Label>
            <select
              {...register("deliveryTime")}
              id="deliveryTime"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select delivery time</option>
              {DELIVERY_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.deliveryTime && (
              <p className="text-sm text-red-500">{errors.deliveryTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalMethod">Payment Withdrawal Method *</Label>
            <select
              {...register("withdrawalMethod")}
              id="withdrawalMethod"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select withdrawal method</option>
              {WITHDRAWAL_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.withdrawalMethod && (
              <p className="text-sm text-red-500">{errors.withdrawalMethod.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description *</Label>
            <Textarea
              {...register("businessDescription")}
              id="businessDescription"
              placeholder="Tell us about your business..."
              className="glass-effect resize-none h-32"
            />
            {errors.businessDescription && (
              <p className="text-sm text-red-500">{errors.businessDescription.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email (Optional)</Label>
            <Input
              {...register("supportEmail")}
              id="supportEmail"
              placeholder="support@mystore.com"
              type="email"
              className="glass-effect"
            />
            {errors.supportEmail && (
              <p className="text-sm text-red-500">{errors.supportEmail.message}</p>
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
