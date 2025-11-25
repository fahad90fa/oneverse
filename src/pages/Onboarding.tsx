import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { onboardingService, OnboardingData } from "@/services/onboarding";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { SellerStep } from "@/components/onboarding/SellerStep";
import { BuyerStep } from "@/components/onboarding/BuyerStep";
import { ClientStep } from "@/components/onboarding/ClientStep";
import { WorkerStep } from "@/components/onboarding/WorkerStep";
import { FinalStep } from "@/components/onboarding/FinalStep";
import { UserRole } from "@/types";
import { SellerSetupData } from "@/lib/onboarding-schemas";
import { BuyerSetupData } from "@/lib/onboarding-schemas";
import { ClientSetupData } from "@/lib/onboarding-schemas";
import { WorkerSetupData } from "@/lib/onboarding-schemas";

type StepType = "welcome" | "seller" | "buyer" | "client" | "worker" | "final";

interface OnboardingState {
  seller?: SellerSetupData;
  buyer?: BuyerSetupData;
  client?: ClientSetupData;
  worker?: WorkerSetupData;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<StepType>("welcome");
  const [userId, setUserId] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingState>({});
  const [isSaving, setIsSaving] = useState(false);

  const steps: StepType[] = ["welcome"];
  selectedRoles.forEach((role) => {
    if (role === "seller") steps.push("seller");
    if (role === "buyer") steps.push("buyer");
    if (role === "client") steps.push("client");
    if (role === "worker") steps.push("worker");
  });
  steps.push("final");

  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate("/auth");
          return;
        }

        const isComplete = await onboardingService.checkOnboardingStatus(session.user.id);
        if (isComplete) {
          navigate("/dashboard");
          return;
        }

        const roles = await onboardingService.getUserRoles(session.user.id);
        if (roles.length === 0) {
          navigate("/auth");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .single();

        setUserId(session.user.id);
        setFullName(profileData?.full_name || session.user.user_metadata?.full_name || "User");
        setSelectedRoles(roles);

        const existingData = await onboardingService.getOnboardingData(session.user.id);
        setOnboardingData(existingData);

        setLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize onboarding";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    initializeOnboarding();
  }, [navigate, toast]);

  const handleWelcomeNext = () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Error",
        description: "No roles selected",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(steps[1] || "final");
  };

  const handleSellerNext = async (data: SellerSetupData) => {
    setIsSaving(true);
    try {
      await onboardingService.saveSellerSetup(userId, data);
      setOnboardingData((prev) => ({ ...prev, seller: data }));

      const nextIndex = steps.indexOf("seller") + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }

      toast({
        title: "Success",
        description: "Seller information saved",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save seller information";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuyerNext = async (data: BuyerSetupData) => {
    setIsSaving(true);
    try {
      await onboardingService.saveBuyerSetup(userId, data);
      setOnboardingData((prev) => ({ ...prev, buyer: data }));

      const nextIndex = steps.indexOf("buyer") + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }

      toast({
        title: "Success",
        description: "Buyer preferences saved",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save buyer preferences";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientNext = async (data: ClientSetupData) => {
    setIsSaving(true);
    try {
      await onboardingService.saveClientSetup(userId, data);
      setOnboardingData((prev) => ({ ...prev, client: data }));

      const nextIndex = steps.indexOf("client") + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }

      toast({
        title: "Success",
        description: "Client preferences saved",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save client preferences";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkerNext = async (data: WorkerSetupData) => {
    setIsSaving(true);
    try {
      await onboardingService.saveWorkerSetup(userId, data);
      setOnboardingData((prev) => ({ ...prev, worker: data }));

      const nextIndex = steps.indexOf("worker") + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }

      toast({
        title: "Success",
        description: "Worker information saved",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save worker information";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalBack = () => {
    const currentIdx = steps.indexOf("final");
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1]);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSaving(true);
    try {
      await onboardingService.markOnboardingComplete(userId);
      toast({
        title: "Onboarding Complete!",
        description: "Your profile is ready to use",
      });
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete onboarding";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Preparing onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Platform Onboarding
          </h1>
          <p className="text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Progress value={progressPercentage} className="h-2" />
        </motion.div>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-12 overflow-x-auto pb-2"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={step}
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                idx <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </motion.div>
          ))}
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "welcome" && (
            <WelcomeStep
              key="welcome"
              fullName={fullName}
              selectedRoles={selectedRoles}
              onNext={handleWelcomeNext}
            />
          )}

          {currentStep === "seller" && (
            <SellerStep
              key="seller"
              defaultValues={onboardingData.seller}
              onNext={handleSellerNext}
              onBack={handleBack}
              isLoading={isSaving}
            />
          )}

          {currentStep === "buyer" && (
            <BuyerStep
              key="buyer"
              defaultValues={onboardingData.buyer}
              onNext={handleBuyerNext}
              onBack={handleBack}
              isLoading={isSaving}
            />
          )}

          {currentStep === "client" && (
            <ClientStep
              key="client"
              defaultValues={onboardingData.client}
              onNext={handleClientNext}
              onBack={handleBack}
              isLoading={isSaving}
            />
          )}

          {currentStep === "worker" && (
            <WorkerStep
              key="worker"
              defaultValues={onboardingData.worker}
              onNext={handleWorkerNext}
              onBack={handleBack}
              isLoading={isSaving}
            />
          )}

          {currentStep === "final" && (
            <motion.div key="final">
              <FinalStep selectedRoles={selectedRoles} onBack={handleFinalBack} />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSaving}
                  className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all"
                >
                  {isSaving ? "Finalizing..." : "Complete & Go to Dashboard"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p>Your data is secure and only visible to you</p>
        </motion.div>
      </div>
    </div>
  );
}
