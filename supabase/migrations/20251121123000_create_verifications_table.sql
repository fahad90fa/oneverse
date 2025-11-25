-- Verifications table for worker verification system
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('email', 'phone', 'id_document', 'payment_method', 'top_rated', 'rising_talent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  submitted_data JSONB, -- Store verification data like document URLs, phone numbers, etc.
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id), -- Admin who approved/rejected
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- For time-limited verifications like top_rated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, verification_type)
);

-- Enable RLS
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own verifications"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON public.verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update verifications"
  ON public.verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add trust_score to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_badges TEXT[] DEFAULT '{}';

-- Function to calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  verification_count INTEGER;
  completed_projects INTEGER;
  avg_rating DECIMAL;
BEGIN
  -- Count approved verifications
  SELECT COUNT(*) INTO verification_count
  FROM verifications
  WHERE user_id = user_uuid AND status = 'approved';

  -- Base score from verifications
  score := verification_count * 20;

  -- Bonus for email verification
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'email' AND status = 'approved') THEN
    score := score + 10;
  END IF;

  -- Bonus for phone verification
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'phone' AND status = 'approved') THEN
    score := score + 15;
  END IF;

  -- Bonus for ID verification
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'id_document' AND status = 'approved') THEN
    score := score + 25;
  END IF;

  -- Bonus for payment method verification
  IF EXISTS (SELECT 1 FROM verifications WHERE user_id = user_uuid AND verification_type = 'payment_method' AND status = 'approved') THEN
    score := score + 10;
  END IF;

  -- Get completed projects and rating
  SELECT COUNT(*) INTO completed_projects
  FROM projects
  WHERE worker_id = user_uuid AND status = 'completed';

  SELECT AVG(rating) INTO avg_rating
  FROM reviews
  WHERE reviewee_id = user_uuid;

  -- Add score based on completed projects
  score := score + (completed_projects * 5);

  -- Add score based on rating
  IF avg_rating IS NOT NULL THEN
    score := score + (avg_rating * 10)::INTEGER;
  END IF;

  -- Cap at 100
  IF score > 100 THEN
    score := 100;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update trust score
CREATE OR REPLACE FUNCTION update_user_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET trust_score = calculate_trust_score(NEW.user_id)
  WHERE user_id = NEW.user_id;

  -- Update verification badges
  UPDATE profiles
  SET verification_badges = (
    SELECT ARRAY_AGG(verification_type)
    FROM verifications
    WHERE user_id = NEW.user_id AND status = 'approved'
  )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trust score when verifications change
CREATE TRIGGER update_trust_score_on_verification_change
  AFTER INSERT OR UPDATE OR DELETE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION update_user_trust_score();