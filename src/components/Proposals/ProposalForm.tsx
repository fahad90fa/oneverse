import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/Chat/FileUpload";
import {
  Plus,
  X,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const proposalSchema = z.object({
  coverLetter: z.string().min(100, "Cover letter must be at least 100 characters").max(2000, "Cover letter must be less than 2000 characters"),
  proposedPrice: z.number().min(1, "Proposed price must be greater than 0"),
  estimatedDuration: z.string().min(1, "Estimated duration is required"),
  milestones: z.array(z.object({
    title: z.string().min(1, "Milestone title is required"),
    description: z.string().min(10, "Milestone description must be at least 10 characters"),
    amount: z.number().min(1, "Milestone amount must be greater than 0"),
    dueDate: z.string().min(1, "Due date is required"),
  })).min(1, "At least one milestone is required"),
  attachments: z.array(z.any()).optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  jobId: string;
  jobTitle: string;
  onSubmit: (data: ProposalFormData & { attachments?: File[] }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const ProposalForm = ({
  jobId,
  jobTitle,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ""
}: ProposalFormProps) => {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      coverLetter: "",
      proposedPrice: 0,
      estimatedDuration: "",
      milestones: [{
        title: "",
        description: "",
        amount: 0,
        dueDate: "",
      }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones"
  });

  const coverLetter = watch("coverLetter");
  const proposedPrice = watch("proposedPrice");
  const milestones = watch("milestones");

  const totalMilestoneAmount = milestones?.reduce((sum, milestone) => sum + (milestone.amount || 0), 0) || 0;

  const addMilestone = () => {
    append({
      title: "",
      description: "",
      amount: 0,
      dueDate: "",
    });
  };

  const handleFileSelect = (file: File) => {
    setAttachments(prev => [...prev, file]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: ProposalFormData) => {
    try {
      await onSubmit({
        ...data,
        attachments
      });

      toast({
        title: "Proposal submitted",
        description: "Your proposal has been sent to the client",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="glass-effect border-border p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Submit Proposal</h2>
            <p className="text-muted-foreground">
              for <span className="font-medium text-foreground">{jobTitle}</span>
            </p>
          </div>

          {/* Cover Letter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <label className="text-lg font-semibold">Cover Letter *</label>
            </div>
            <Textarea
              {...register("coverLetter")}
              placeholder="Introduce yourself and explain why you're the perfect fit for this job..."
              className="min-h-[150px] resize-none"
            />
            <div className="flex justify-between items-center">
              <div>
                {errors.coverLetter && (
                  <motion.p
                    className="text-sm text-destructive flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.coverLetter.message}
                  </motion.p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {coverLetter?.length || 0}/2000
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <label className="text-lg font-semibold">Proposed Price *</label>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("proposedPrice", { valueAsNumber: true })}
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  min="1"
                  step="0.01"
                />
              </div>
              {errors.proposedPrice && (
                <motion.p
                  className="text-sm text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.proposedPrice.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <label className="text-lg font-semibold">Estimated Duration *</label>
              </div>
              <Input
                {...register("estimatedDuration")}
                placeholder="e.g., 2 weeks, 1 month"
              />
              {errors.estimatedDuration && (
                <motion.p
                  className="text-sm text-destructive flex items-center gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.estimatedDuration.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <label className="text-lg font-semibold">Project Milestones *</label>
              </div>
              <Button
                type="button"
                onClick={addMilestone}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border border-border rounded-lg relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          {...register(`milestones.${index}.title`)}
                          placeholder="Milestone title"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount ($)</label>
                        <Input
                          {...register(`milestones.${index}.amount`, { valueAsNumber: true })}
                          type="number"
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          {...register(`milestones.${index}.description`)}
                          placeholder="Describe what will be delivered in this milestone"
                          className="min-h-[80px] resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          {...register(`milestones.${index}.dueDate`)}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Milestone Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Milestone Amount:</span>
                <span className="font-bold text-primary">${totalMilestoneAmount.toFixed(2)}</span>
              </div>
              {proposedPrice > 0 && totalMilestoneAmount !== proposedPrice && (
                <motion.p
                  className="text-sm text-amber-600 mt-2 flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle className="h-3 w-3" />
                  Milestone total (${totalMilestoneAmount.toFixed(2)}) doesn't match proposed price (${proposedPrice.toFixed(2)})
                </motion.p>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <label className="text-lg font-semibold">Attachments (Optional)</label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {attachments.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group"
                >
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                </motion.div>
              ))}

              {attachments.length < 5 && (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  acceptedTypes="image/*,.pdf,.doc,.docx,.txt,.zip"
                  maxSize={10}
                  className="aspect-square"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-border">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-blue-500"
            >
              {isSubmitting ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Proposal...
                </motion.div>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};