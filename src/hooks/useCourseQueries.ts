import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseModule, CourseEnrollment, CourseReview, CourseWithInstructor } from '@/types/course';

export const useCourseQueries = () => {
  const queryClient = useQueryClient();

  // Get all published courses
  const usePublishedCourses = () =>
    useQuery({
      queryKey: ['courses', 'published'],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });
          
          if (error) throw error;
          return data as CourseWithInstructor[];
        } catch (error) {
          console.error('Error fetching published courses:', error);
          return [];
        }
      }
    });

  // Get course by slug
  const useCourseBySlug = (slug: string) =>
    useQuery({
      queryKey: ['course', slug],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();
          
          if (error) throw error;
          return data as CourseWithInstructor;
        } catch (error) {
          console.error('Error fetching course:', error);
          return null;
        }
      },
      enabled: !!slug
    });

  // Get course modules
  const useCourseModules = (courseId: string) =>
    useQuery({
      queryKey: ['course', courseId, 'modules'],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('course_modules')
            .select('*')
            .eq('course_id', courseId)
            .order('order_number', { ascending: true });
          
          if (error) throw error;
          return data as CourseModule[];
        } catch (error) {
          console.error('Error fetching course modules:', error);
          return [];
        }
      },
      enabled: !!courseId
    });

  // Get user's courses (instructor view)
  const useUserCourses = (instructorId: string) =>
    useQuery({
      queryKey: ['courses', 'instructor', instructorId],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('instructor_id', instructorId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data as Course[];
        } catch (error) {
          console.error('Error fetching user courses:', error);
          return [];
        }
      },
      enabled: !!instructorId
    });

  // Get user's enrollments (learner view)
  const useUserEnrollments = (studentId: string) =>
    useQuery({
      queryKey: ['enrollments', 'student', studentId],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('course_enrollments')
            .select('*, courses(*)')
            .eq('student_id', studentId)
            .order('enrollment_date', { ascending: false });
          
          if (error) throw error;
          return data as any[];
        } catch (error) {
          console.error('Error fetching user enrollments:', error);
          return [];
        }
      },
      enabled: !!studentId
    });

  // Get course reviews
  const useCourseReviews = (courseId: string) =>
    useQuery({
      queryKey: ['course', courseId, 'reviews'],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('course_reviews')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data as CourseReview[];
        } catch (error) {
          console.error('Error fetching course reviews:', error);
          return [];
        }
      },
      enabled: !!courseId
    });

  // Create course
  const createCourseMutation = useMutation({
    mutationFn: async (course: Partial<Course>) => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .insert([course])
          .select()
          .single();
        
        if (error) throw error;
        return data as Course;
      } catch (error) {
        console.error('Error creating course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  // Update course
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as Course;
      } catch (error) {
        console.error('Error updating course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  // Create course module
  const createModuleMutation = useMutation({
    mutationFn: async (module: Partial<CourseModule>) => {
      try {
        const { data, error } = await supabase
          .from('course_modules')
          .insert([module])
          .select()
          .single();
        
        if (error) throw error;
        return data as CourseModule;
      } catch (error) {
        console.error('Error creating module:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_modules'] });
    }
  });

  // Enroll in course
  const enrollCourseMutation = useMutation({
    mutationFn: async ({ courseId, studentId }: { courseId: string; studentId: string }) => {
      try {
        const { data, error } = await supabase
          .from('course_enrollments')
          .insert([{ course_id: courseId, student_id: studentId }])
          .select()
          .single();
        
        if (error) throw error;
        return data as CourseEnrollment;
      } catch (error) {
        console.error('Error enrolling in course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });

  // Add course review
  const addReviewMutation = useMutation({
    mutationFn: async (review: Partial<CourseReview>) => {
      try {
        const { data, error } = await supabase
          .from('course_reviews')
          .insert([review])
          .select()
          .single();
        
        if (error) throw error;
        return data as CourseReview;
      } catch (error) {
        console.error('Error adding review:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_reviews'] });
    }
  });

  // Delete course
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  return {
    usePublishedCourses,
    useCourseBySlug,
    useCourseModules,
    useUserCourses,
    useUserEnrollments,
    useCourseReviews,
    createCourseMutation,
    updateCourseMutation,
    createModuleMutation,
    enrollCourseMutation,
    addReviewMutation,
    deleteCourseMutation
  };
};
