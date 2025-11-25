-- Create activity_log table for dashboard activity tracking
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('project_status', 'proposal_accepted', 'proposal_rejected', 'milestone', 'file_upload', 'payment', 'review', 'message')),
  title TEXT NOT NULL,
  description TEXT,
  related_id UUID,
  related_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_client_id ON public.activity_log(client_id);
CREATE INDEX idx_activity_log_worker_id ON public.activity_log(worker_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);
