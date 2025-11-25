import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useCourseQueries } from '@/hooks/useCourseQueries';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import CourseEditor from '@/components/Course/CourseEditor';
import { Course } from '@/types/course';
import type { User } from '@supabase/supabase-js';

const WorkerCourses = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { useUserCourses, createCourseMutation, updateCourseMutation, deleteCourseMutation } = useCourseQueries();
  const { data: courses = [], isLoading } = useUserCourses(user?.id || '');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleCreateCourse = (courseData: Partial<Course>) => {
    createCourseMutation.mutate({
      ...courseData,
      instructor_id: user.id
    });
    setShowEditor(false);
  };

  const handleUpdateCourse = (courseData: Partial<Course>) => {
    if (editingCourse) {
      updateCourseMutation.mutate({
        ...courseData,
        id: editingCourse.id
      });
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  if (showEditor || editingCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </h1>
          <CourseEditor
            initialCourse={editingCourse || undefined}
            onSave={editingCourse ? handleUpdateCourse : handleCreateCourse}
            onCancel={() => {
              setShowEditor(false);
              setEditingCourse(null);
            }}
            isLoading={createCourseMutation.isPending || updateCourseMutation.isPending}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">Create and manage your online courses</p>
          </div>
          <Button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Course
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-2xl text-muted-foreground mb-4">No courses yet</p>
          <Button onClick={() => setShowEditor(true)}>Create Your First Course</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
            >
              {course.cover_image_url && (
                <img
                  src={course.cover_image_url}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold flex-1">{course.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                    course.status === 'published' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                    course.status === 'draft' ? 'bg-gray-500/20 text-gray-700 dark:text-gray-400' :
                    course.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {course.status}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2">
                  {course.description || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-primary">{course.level}</span>
                  </span>
                  {course.price > 0 && (
                    <span className="font-semibold">{course.currency} {course.price}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                  <span>{course.total_students || 0} students</span>
                  <span>⭐ {(course.average_rating || 0).toFixed(1)}</span>
                  {course.duration_minutes && (
                    <span>{course.duration_minutes} min</span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {course.status === 'published' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/courses`)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors flex-1 text-center"
                      title="View Course"
                    >
                      <Eye className="h-5 w-5 inline" />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingCourse(course)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors flex-1 text-center"
                    title="Edit Course"
                  >
                    <Edit className="h-5 w-5 inline" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors flex-1 text-center"
                    title="Delete Course"
                  >
                    <Trash2 className="h-5 w-5 inline" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerCourses;
