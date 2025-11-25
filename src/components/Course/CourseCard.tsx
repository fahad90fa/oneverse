import { motion } from 'framer-motion';
import { Star, Users, Clock, BookOpen } from 'lucide-react';
import { CourseWithInstructor } from '@/types/course';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: CourseWithInstructor;
  onClick?: () => void;
  onEnroll?: () => void;
  isEnrolled?: boolean;
  isPurchased?: boolean;
}

const CourseCard = ({
  course,
  onClick,
  onEnroll,
  isEnrolled = false,
  isPurchased = false
}: CourseCardProps) => {
  const isPaid = course.price > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group cursor-pointer h-full"
    >
      <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          {course.cover_image_url ? (
            <img
              src={course.cover_image_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/20" />
            </div>
          )}

          {course.is_featured && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-accent text-white text-xs font-bold rounded">
              Featured
            </div>
          )}

          {isPaid && (
            <div className="absolute top-2 left-2 px-3 py-1 bg-primary text-white text-sm font-bold rounded">
              ${course.price}
            </div>
          )}

          {!isPaid && (
            <div className="absolute top-2 left-2 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded">
              Free
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          {/* Category & Level */}
          <div className="flex items-center gap-2 mb-2">
            {course.category && (
              <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                {course.category}
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              course.level === 'beginner' ? 'bg-blue-500/10 text-blue-500' :
              course.level === 'intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {course.level}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={onClick}
            className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
          >
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
              {course.description}
            </p>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {course.instructor?.user_metadata?.full_name?.charAt(0) || 'I'}
            </div>
            <span className="text-sm font-semibold">
              {course.instructor?.user_metadata?.full_name || 'Unknown'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between gap-2 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.total_students} students</span>
            </div>

            {course.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{Math.ceil(course.duration_minutes / 60)}h</span>
              </div>
            )}

            {course.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-auto"
          >
            {isEnrolled ? (
              <Button
                onClick={onClick}
                variant="outline"
                className="w-full"
              >
                Continue Learning
              </Button>
            ) : (
              <Button
                onClick={onEnroll}
                className="w-full"
              >
                {isPurchased ? 'Start Learning' : isPaid ? 'Enroll Now' : 'Enroll Free'}
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
