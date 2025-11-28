import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars, RatingDisplay } from "./RatingStars";
import {
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Flag,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from "lucide-react";

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  created_at: string;
  updated_at?: string;
  helpful_count: number;
  verified_purchase?: boolean;
  response?: {
    text: string;
    created_at: string;
    responder_name: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  onHelpfulClick?: (reviewId: string) => void;
  onReportClick?: (reviewId: string) => void;
  showProductInfo?: boolean;
  className?: string;
}

export const ReviewList = ({
  reviews,
  isLoading = false,
  onHelpfulClick,
  onReportClick,
  showProductInfo = false,
  className = ""
}: ReviewListProps) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      default:
        return 0;
    }
  });

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
    onHelpfulClick?.(reviewId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-muted rounded" />
                  <div className="w-24 h-3 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-muted rounded" />
                <div className="w-3/4 h-4 bg-muted rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to leave a review!</p>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with sorting */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Reviews ({reviews.length})
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'helpful' | 'rating')}
            className="text-sm border border-border rounded px-2 py-1 bg-background"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="glass-effect border-border p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white">
                          {review.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user_name}</span>
                          {review.verified_purchase && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <RatingStars rating={review.rating} readonly size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">
                      {review.comment.length > 300 && !expandedReviews.has(review.id)
                        ? `${review.comment.substring(0, 300)}...`
                        : review.comment
                      }
                    </p>

                    {review.comment.length > 300 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(review.id)}
                        className="p-0 h-auto text-primary hover:text-primary/80"
                      >
                        {expandedReviews.has(review.id) ? (
                          <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                        ) : (
                          <>Read More <ChevronDown className="h-3 w-3 ml-1" /></>
                        )}
                      </Button>
                    )}

                    {/* Pros and Cons */}
                    {(review.pros?.length || review.cons?.length) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {review.pros && review.pros.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Pros
                            </h4>
                            <ul className="space-y-1">
                              {review.pros.map((pro, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons && review.cons.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Cons
                            </h4>
                            <ul className="space-y-1">
                              {review.cons.map((con, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {review.images.map((image, i) => (
                          <motion.div
                            key={i}
                            className="w-16 h-16 bg-muted rounded-lg overflow-hidden cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => {
                              // Open image in modal or lightbox
                              window.open(image, '_blank');
                            }}
                          >
                            <img
                              src={image}
                              alt={`Review image ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulClick(review.id)}
                        className={`text-muted-foreground hover:text-foreground ${
                          helpfulReviews.has(review.id) ? 'text-primary' : ''
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful ({review.helpful_count + (helpfulReviews.has(review.id) ? 1 : 0)})
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReportClick?.(review.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    </div>

                    {review.updated_at && review.updated_at !== review.created_at && (
                      <span className="text-xs text-muted-foreground">
                        Edited {formatDate(review.updated_at)}
                      </span>
                    )}
                  </div>

                  {/* Seller Response */}
                  {review.response && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Seller Response
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {review.response.responder_name} • {formatDate(review.response.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{review.response.text}</p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};