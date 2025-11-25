import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RatingInput } from "./RatingStars";
import { FileUpload } from "@/components/Chat/FileUpload";
import {
  Star,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(10, "Review must be at least 10 characters long").max(1000, "Review must be less than 1000 characters"),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId?: string;
  gigId?: string;
  userId?: string;
  onSubmit: (data: ReviewFormData & { images?: File[] }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const ReviewForm = ({
  productId,
  gigId,
  userId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ""
}: ReviewFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [currentPro, setCurrentPro] = useState("");
  const [currentCon, setCurrentCon] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      pros: [],
      cons: []
    }
  });

  const comment = watch("comment");

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue("rating", newRating);
  };

  const addPro = () => {
    if (currentPro.trim() && !pros.includes(currentPro.trim())) {
      const newPros = [...pros, currentPro.trim()];
      setPros(newPros);
      setValue("pros", newPros);
      setCurrentPro("");
    }
  };

  const addCon = () => {
    if (currentCon.trim() && !cons.includes(currentCon.trim())) {
      const newCons = [...cons, currentCon.trim()];
      setCons(newCons);
      setValue("cons", newCons);
      setCurrentCon("");
    }
  };

  const removePro = (index: number) => {
    const newPros = pros.filter((_, i) => i !== index);
    setPros(newPros);
    setValue("pros", newPros);
  };

  const removeCon = (index: number) => {
    const newCons = cons.filter((_, i) => i !== index);
    setCons(newCons);
    setValue("cons", newCons);
  };

  const handleImageUpload = (file: File) => {
    setUploadedImages(prev => [...prev, file]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: ReviewFormData) => {
    try {
      await onSubmit({
        ...data,
        images: uploadedImages
      });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setRating(0);
      setPros([]);
      setCons([]);
      setUploadedImages([]);
      setValue("rating", 0);
      setValue("comment", "");
      setValue("pros", []);
      setValue("cons", []);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
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
      <Card className="glass-effect border-border p-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
            <p className="text-sm text-muted-foreground">
              Share your experience to help others make informed decisions
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Overall Rating *</label>
            <RatingInput
              value={rating}
              onChange={handleRatingChange}
            />
            {errors.rating && (
              <motion.p
                className="text-sm text-destructive flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AlertCircle className="h-3 w-3" />
                {errors.rating.message}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Review *</label>
              <span className="text-xs text-muted-foreground">
                {comment?.length || 0}/1000
              </span>
            </div>
            <Textarea
              {...register("comment")}
              placeholder="Tell others about your experience..."
              className="min-h-[120px] resize-none"
            />
            {errors.comment && (
              <motion.p
                className="text-sm text-destructive flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AlertCircle className="h-3 w-3" />
                {errors.comment.message}
              </motion.p>
            )}
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced Options
            </Button>
          </div>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Pros */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Pros</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentPro}
                      onChange={(e) => setCurrentPro(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                      placeholder="What did you like?"
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    />
                    <Button
                      type="button"
                      onClick={addPro}
                      disabled={!currentPro.trim()}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {pros.map((pro, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {pro}
                            <button
                              type="button"
                              onClick={() => removePro(index)}
                              className="ml-2 hover:bg-green-500/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Cons */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Cons</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentCon}
                      onChange={(e) => setCurrentCon(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                      placeholder="What could be improved?"
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                    />
                    <Button
                      type="button"
                      onClick={addCon}
                      disabled={!currentCon.trim()}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {cons.map((con, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="bg-red-500/10 text-red-700 border-red-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {con}
                            <button
                              type="button"
                              onClick={() => removeCon(index)}
                              className="ml-2 hover:bg-red-500/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Photos (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        className="relative group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}

                    {uploadedImages.length < 4 && (
                      <FileUpload
                        onFileSelect={handleImageUpload}
                        acceptedTypes="image/*"
                        maxSize={5}
                        className="aspect-square"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
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
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-primary to-blue-500"
            >
              {isSubmitting ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </motion.div>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};