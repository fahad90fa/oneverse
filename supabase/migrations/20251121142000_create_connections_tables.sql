-- Follow/Connection System tables

-- Connections table (follower/following relationships)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Prevent self-following
  CHECK (follower_id != following_id),
  -- Unique constraint to prevent duplicate follows
  UNIQUE(follower_id, following_id)
);

-- Connection suggestions table
CREATE TABLE public.connection_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggested_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL, -- 'similar_skills', 'mutual_connections', 'location', etc.
  score DECIMAL(3,2) DEFAULT 0.0 CHECK (score >= 0.0 AND score <= 1.0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Prevent suggesting self
  CHECK (user_id != suggested_user_id),
  -- Unique constraint per user-suggestion pair
  UNIQUE(user_id, suggested_user_id)
);

-- Add follower/following counts to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_suggestions ENABLE ROW LEVEL SECURITY;

-- Connections policies
CREATE POLICY "Users can view their own connections and public connections"
  ON public.connections FOR SELECT
  USING (
    auth.uid() = follower_id OR
    auth.uid() = following_id OR
    status = 'active'
  );

CREATE POLICY "Authenticated users can create connections"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update their own connections"
  ON public.connections FOR UPDATE
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own connections"
  ON public.connections FOR DELETE
  USING (auth.uid() = follower_id);

-- Connection suggestions policies
CREATE POLICY "Users can view their own suggestions"
  ON public.connection_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create suggestions"
  ON public.connection_suggestions FOR INSERT
  WITH CHECK (true); -- Allow system/service role to create suggestions

CREATE POLICY "Users can delete their own suggestions"
  ON public.connection_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- Functions to update follower/following counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Increment following count for follower
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    -- Increment followers count for following
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    -- Decrement following count for follower
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    -- Decrement followers count for following
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      -- Unfollowing: decrement counts
      UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
      UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      -- Following: increment counts
      UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
      UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update counts
CREATE TRIGGER update_connection_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Trigger for updated_at on connections
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_connections_follower_id ON public.connections(follower_id);
CREATE INDEX idx_connections_following_id ON public.connections(following_id);
CREATE INDEX idx_connections_status ON public.connections(status);
CREATE INDEX idx_connection_suggestions_user_id ON public.connection_suggestions(user_id);
CREATE INDEX idx_connection_suggestions_score ON public.connection_suggestions(score DESC);