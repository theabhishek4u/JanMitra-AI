-- ========================================================
-- JanMitra AI — Autonomous Governance Platform SQL Schema
-- ========================================================
-- Production-ready database schema for Supabase / PostgreSQL.
-- Includes RLS policies, spatial indices, and automatic triggers.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums for strong typing
CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE complaint_status AS ENUM (
  'submitted', 
  'ai_analyzing', 
  'department_assigned', 
  'officer_reviewing', 
  'action_in_progress', 
  'resolved', 
  'escalated'
);

-- ========================================================
-- 1. USERS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'citizen',
  district VARCHAR(100) DEFAULT 'Lucknow',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 2. DEPARTMENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.departments (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_hi VARCHAR(255) NOT NULL,
  officer_name VARCHAR(255) NOT NULL,
  officer_title VARCHAR(255) NOT NULL,
  avg_resolution_days INTEGER DEFAULT 5 NOT NULL,
  icon_name VARCHAR(50) DEFAULT 'Building2' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to departments" ON public.departments
  FOR SELECT USING (true);

-- ========================================================
-- 3. COMPLAINTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id VARCHAR(50) PRIMARY KEY, -- Formatted as JM-YYYY-XXX
  title VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255),
  description TEXT NOT NULL,
  description_hi TEXT,
  category VARCHAR(100) NOT NULL,
  category_hi VARCHAR(100),
  priority priority_level NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'submitted',
  department_id VARCHAR(100) REFERENCES public.departments(id),
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL,
  area VARCHAR(255) NOT NULL,
  citizen_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  citizen_name VARCHAR(255) NOT NULL,
  citizen_phone VARCHAR(20) NOT NULL,
  image_url TEXT,
  voice_url TEXT,
  ai_summary TEXT,
  ai_summary_hi TEXT,
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0),
  escalation_level INTEGER DEFAULT 0 NOT NULL,
  assigned_officer VARCHAR(255),
  trust_score DECIMAL(3,2) DEFAULT 1.0 CHECK (trust_score >= 0.0 AND trust_score <= 1.0),
  is_spam BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 4. COMPLAINT UPDATES (TIMELINE LOGS) TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id VARCHAR(50) REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status complaint_status NOT NULL,
  message TEXT NOT NULL,
  message_hi TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by_officer VARCHAR(255)
);

-- Enable RLS for updates
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 5. ESCALATIONS LOGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id VARCHAR(50) REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  previous_escalation_level INTEGER DEFAULT 0 NOT NULL,
  new_escalation_level INTEGER DEFAULT 1 NOT NULL,
  escalated_to VARCHAR(255) NOT NULL, -- "Senior Officer", "Commissioner", etc.
  reason TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for escalations
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- INDEXES FOR PERFORMANCE & CLUSTERING
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_complaints_geo ON public.complaints (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints (priority);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON public.complaints (department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints (citizen_id);
CREATE INDEX IF NOT EXISTS idx_updates_complaint ON public.complaint_updates (complaint_id);

-- ========================================================
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_timestamp
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_complaints_timestamp
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ========================================================
-- ROW-LEVEL SECURITY POLICIES
-- ========================================================

-- Users Policies
CREATE POLICY "Allow users to read their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow public inserts on users (signup)" ON public.users
  FOR INSERT WITH CHECK (true);

-- Complaints Policies
CREATE POLICY "Allow citizens to view their own complaints" ON public.complaints
  FOR SELECT USING (
    auth.uid() = citizen_id OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('officer', 'admin')
    )
  );

CREATE POLICY "Allow citizens to file complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Allow officers/admins to edit complaints" ON public.complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('officer', 'admin')
    )
  );

-- Timeline Updates Policies
CREATE POLICY "Allow anyone to read complaint timeline logs" ON public.complaint_updates
  FOR SELECT USING (true);

CREATE POLICY "Allow officers/admins to append logs" ON public.complaint_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role IN ('officer', 'admin')
    )
  );

-- ========================================================
-- SEED DATA (DEPARTMENTS)
-- ========================================================
INSERT INTO public.departments (id, name, name_hi, officer_name, officer_title, avg_resolution_days, icon_name)
VALUES 
  ('nagar-nigam', 'Lucknow Nagar Nigam', 'लखनऊ नगर निगम', 'Shri Rajesh Kumar', 'Municipal Commissioner', 3, 'Building2'),
  ('jal-nigam', 'Jal Nigam', 'उत्तर प्रदेश जल निगम', 'Smt. Priya Sharma', 'Chief Engineer', 5, 'Droplets'),
  ('pwd', 'Public Works Department', 'लोक निर्माण विभाग (PWD)', 'Shri Amit Verma', 'Executive Engineer', 7, 'HardHat'),
  ('power-dept', 'Power Department (UPPCL)', 'विद्युत विभाग (UPPCL)', 'Shri Vikram Singh', 'Superintending Engineer', 2, 'Zap'),
  ('municipal-authority', 'Municipal Authority', 'नगर पालिका प्राधिकरण', 'Shri Deepak Gupta', 'District Magistrate', 10, 'Landmark'),
  ('anti-corruption', 'Anti-Corruption Bureau', 'भ्रष्टाचार निरोधक ब्यूरो', 'Shri Arvind Mishra', 'SP Anti-Corruption', 14, 'Shield'),
  ('lmc', 'Lucknow Municipal Corporation', 'लखनऊ नगर निगम (LMC)', 'Smt. Neha Tripathi', 'Ward Commissioner', 4, 'Lightbulb'),
  ('health-dept', 'Health Department', 'स्वास्थ्य विभाग (CMO)', 'Dr. Sanjay Pandey', 'Chief Medical Officer', 3, 'Heart')
ON CONFLICT (id) DO NOTHING;
