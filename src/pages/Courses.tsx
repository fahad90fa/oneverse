import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { useCourseQueries } from '@/hooks/useCourseQueries';
import CourseCard from '@/components/Course/CourseCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

const Courses = () => {
  const navigate = useNavigate();
  const { usePublishedCourses } = useCourseQueries();
  const { data: courses = [] } = usePublishedCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesPrice = priceFilter === 'all' ? true :
      priceFilter === 'free' ? course.price === 0 :
      course.price > 0;

    return matchesSearch && matchesLevel && matchesCategory && matchesPrice;
  });

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2">Courses</h1>
              <p className="text-xl text-muted-foreground">
                Learn new skills from industry experts
              </p>
            </div>

            {user && (
              <Button
                onClick={() => navigate('/dashboard/worker/courses')}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Course
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {/* Price Filter */}
              <div className="flex gap-2">
                {(['all', 'free', 'paid'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPriceFilter(filter)}
                    className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                      priceFilter === filter
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {filter === 'all' ? 'All Prices' : filter === 'free' ? 'Free' : 'Paid'}
                  </button>
                ))}
              </div>

              {/* Level Filter */}
              {levels.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedLevel === null
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    All Levels
                  </button>
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                        selectedLevel === level
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedCategory === null
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedCategory === cat
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/course/${course.slug}`)}
                onEnroll={() => {
                  if (!user) {
                    navigate('/auth');
                  } else {
                    navigate(`/course/${course.slug}`);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-2xl text-muted-foreground mb-4">
              {searchTerm || selectedLevel || selectedCategory
                ? 'No courses found matching your filters'
                : 'No courses available yet'}
            </p>
            {!user && (
              <Button onClick={() => navigate('/auth')}>Sign Up to Create a Course</Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;
