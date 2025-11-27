-- Role Applications Table for Worker/Seller Approval System

CREATE TABLE IF NOT EXISTS role_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('worker', 'seller')) DEFAULT 'worker',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  -- Personal Information
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  
  -- Documents (file paths)
  profile_image_url TEXT,
  resume_url TEXT,
  cnic_url TEXT, -- National ID/CNIC document
  linkedin_url TEXT,
  website_url TEXT,
  
  -- Professional Information
  bio TEXT,
  
  -- For Workers: skills
  skills TEXT[] DEFAULT '{}',
  
  -- For Sellers: business info
  business_name TEXT,
  product_categories TEXT[] DEFAULT '{}',
  
  -- Admin Review
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  submission_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one pending/approved application per user per role
  UNIQUE(user_id, role, status)
);

-- Indexes for better query performance
CREATE INDEX idx_role_applications_user_id ON role_applications(user_id);
CREATE INDEX idx_role_applications_status ON role_applications(status);
CREATE INDEX idx_role_applications_role ON role_applications(role);
CREATE INDEX idx_role_applications_created_at ON role_applications(created_at DESC);
CREATE INDEX idx_role_applications_user_role_status ON role_applications(user_id, role, status);

-- RLS Policies
ALTER TABLE role_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own role applications"
  ON role_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "Users can create role applications"
  ON role_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their pending applications
CREATE POLICY "Users can update own pending applications"
  ON role_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON role_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON role_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));
