import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";
import { workerSetupSchema, WorkerSetupData } from "@/lib/onboarding-schemas";
import { useState } from "react";

interface WorkerStepProps {
  defaultValues?: WorkerSetupData;
  onNext: (data: WorkerSetupData) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const WORKER_CATEGORIES = [
  "Web Development",
  "Mobile App",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Video Production",
  "Customer Support",
  "Data Analysis",
  "UI/UX Design",
  "Other",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Portuguese",
  "Other",
];

const TIMEZONES = [
  "UTC-12",
  "UTC-8",
  "UTC-5",
  "UTC-0",
  "UTC+1",
  "UTC+2",
  "UTC+5",
  "UTC+8",
  "UTC+12",
  "Remote",
];

export const WorkerStep = ({
  defaultValues,
  onNext,
  onBack,
  isLoading = false,
}: WorkerStepProps) => {
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkerSetupData>({
    resolver: zodResolver(workerSetupSchema),
    defaultValues: defaultValues || {
      tagline: "",
      categories: [],
      skills: [],
      languages: [],
      hourlyRate: 0,
      location: "",
      portfolioItems: [],
      cvLink: "",
    },
  });

  const categories = watch("categories");
  const languages = watch("languages");
  const skills = watch("skills");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setValue("skills", [...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setValue("skills", skills.filter((s) => s !== skill));
  };

  const toggleCategory = (cat: string) => {
    const current = categories || [];
    setValue(
      "categories",
      current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat]
    );
  };

  const toggleLanguage = (lang: string) => {
    const current = languages || [];
    setValue(
      "languages",
      current.includes(lang) ? current.filter((l) => l !== lang) : [...current, lang]
    );
  };

  const onSubmit = async (data: WorkerSetupData) => {
    try {
      await onNext(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save worker information";
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
        <h3 className="text-2xl font-bold mb-6">Let's help you get discovered and hired! 🧑‍🎨</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tagline">Professional Tagline *</Label>
            <Input
              {...register("tagline")}
              id="tagline"
              placeholder="e.g., Full-Stack Developer & UX Designer"
              className="glass-effect"
            />
            <p className="text-xs text-muted-foreground">
              A brief line that describes your expertise
            </p>
            {errors.tagline && (
              <p className="text-sm text-red-500">{errors.tagline.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Work Categories *</Label>
            <div className="grid grid-cols-2 gap-2">
              {WORKER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`p-2 rounded-lg border transition-all text-sm ${
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
            <Label>Skills & Tools *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., React, TypeScript"
                className="glass-effect"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.skills && (
              <p className="text-sm text-red-500">{errors.skills.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Languages *</Label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`p-2 rounded-lg border transition-all text-sm ${
                    (languages || []).includes(lang)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-500">{errors.languages.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
            <Input
              {...register("hourlyRate", { valueAsNumber: true })}
              id="hourlyRate"
              type="number"
              placeholder="50"
              min="1"
              max="10000"
              step="0.01"
              className="glass-effect"
            />
            {errors.hourlyRate && (
              <p className="text-sm text-red-500">{errors.hourlyRate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location/Timezone *</Label>
            <select
              {...register("location")}
              id="location"
              className="w-full px-3 py-2 rounded-md border border-input bg-background glass-effect"
            >
              <option value="">Select location/timezone</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvLink">CV/Resume Link (Optional)</Label>
            <Input
              {...register("cvLink")}
              id="cvLink"
              placeholder="https://example.com/resume.pdf"
              type="url"
              className="glass-effect"
            />
            {errors.cvLink && (
              <p className="text-sm text-red-500">{errors.cvLink.message}</p>
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
