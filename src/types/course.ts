export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  instructor_id: string;
  price: number;
  currency: string;
  cover_image_url?: string;
  preview_video_url?: string;
  status: 'draft' | 'pending_approval' | 'published' | 'archived';
  duration_minutes?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags: string[];
  is_featured: boolean;
  requires_approval: boolean;
  total_students: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  video_duration_seconds?: number;
  order_number: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  downloadable_resources?: Array<{
    name: string;
    url: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  progress_percentage: number;
  last_accessed_module_id?: string;
  completed_modules: number;
  is_completed: boolean;
  completed_at?: string;
  refund_status: 'no_refund' | 'requested' | 'approved' | 'completed';
}

export interface CourseModuleProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  is_completed: boolean;
  time_spent_seconds: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseReview {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseQuestion {
  id: string;
  course_id: string;
  module_id?: string;
  user_id: string;
  question_text: string;
  answer_text?: string;
  is_answered: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseWithInstructor extends Course {
  instructor?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  modules?: CourseModule[];
  reviews_count?: number;
}

export interface CourseEnrollmentWithProgress extends CourseEnrollment {
  course?: Course;
  module_progress?: CourseModuleProgress[];
}
