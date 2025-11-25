import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export const RatingStars = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
  className = ""
}: RatingStarsProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const starSize = sizeClasses[size];

  const handleClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
          >
            <Star
              className={`${starSize} ${
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              } transition-colors duration-150`}
            />

            {/* Animated fill effect */}
            {star <= displayRating && !readonly && (
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: star * 0.05 }}
              >
                <Star
                  className={`${starSize} fill-yellow-400 text-yellow-400`}
                />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {showValue && (
        <motion.span
          className="ml-2 text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {rating.toFixed(1)}
        </motion.span>
      )}
    </div>
  );
};

// Interactive rating input with labels
interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  labels?: string[];
  className?: string;
}

export const RatingInput = ({
  value,
  onChange,
  labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"],
  className = ""
}: RatingInputProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <RatingStars
        rating={value}
        onRatingChange={onChange}
        size="lg"
        showValue
      />

      {value > 0 && labels[value - 1] && (
        <motion.p
          className="text-sm font-medium text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {labels[value - 1]}
        </motion.p>
      )}
    </div>
  );
};

// Read-only rating display with statistics
interface RatingDisplayProps {
  rating: number;
  totalReviews: number;
  distribution?: { [key: number]: number };
  size?: "sm" | "md" | "lg";
  showDistribution?: boolean;
  className?: string;
}

export const RatingDisplay = ({
  rating,
  totalReviews,
  distribution,
  size = "md",
  showDistribution = false,
  className = ""
}: RatingDisplayProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <motion.div
            className="text-3xl font-bold text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            {rating.toFixed(1)}
          </motion.div>
          <RatingStars rating={rating} readonly size={size} />
          <p className="text-sm text-muted-foreground mt-1">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {showDistribution && distribution && (
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-muted-foreground">{stars}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};