-- Project Tasks table for Kanban board
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  position INTEGER DEFAULT 0, -- For ordering within columns
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Project participants can view tasks"
  ON public.project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
  );

CREATE POLICY "Project participants can create tasks"
  ON public.project_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Project participants can update tasks"
  ON public.project_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
  );

CREATE POLICY "Project participants can delete tasks"
  ON public.project_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Time tracking table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Calculated field
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own time entries"
  ON public.time_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
  ON public.time_entries FOR UPDATE
  USING (user_id = auth.uid());

-- Function to calculate duration
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate duration
CREATE TRIGGER calculate_time_entry_duration
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION calculate_duration();

-- Project files table
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version INTEGER DEFAULT 1,
  parent_file_id UUID REFERENCES public.project_files(id), -- For versioning
  folder_path TEXT DEFAULT '/', -- Virtual folder structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Project participants can view files"
  ON public.project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
  );

CREATE POLICY "Project participants can upload files"
  ON public.project_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
    AND uploaded_by = auth.uid()
  );

-- Activity log table
CREATE TABLE public.project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'task_created', 'task_updated', 'file_uploaded', 'time_logged', etc.
  description TEXT NOT NULL,
  metadata JSONB, -- Additional data like old_value, new_value, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Project participants can view activities"
  ON public.project_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_activities.project_id
      AND (projects.client_id = auth.uid() OR projects.worker_id = auth.uid())
    )
  );

CREATE POLICY "System can create activities"
  ON public.project_activities FOR INSERT
  WITH CHECK (true); -- Allow inserts for activity logging