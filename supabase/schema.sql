-- Create complaints table
CREATE TABLE public.complaints (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description TEXT,
  description_hi TEXT,
  category TEXT NOT NULL,
  category_hi TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'submitted',
  department_id TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  area TEXT,
  citizen_id TEXT,
  citizen_name TEXT,
  citizen_phone TEXT,
  image_url TEXT,
  voice_url TEXT,
  ai_summary TEXT,
  ai_summary_hi TEXT,
  ai_confidence DOUBLE PRECISION,
  trust_analysis JSONB,
  trust_score DOUBLE PRECISION,
  escalation_level INTEGER DEFAULT 0,
  assigned_officer TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_proof JSONB,
  citizen_verification JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create complaint updates timeline table
CREATE TABLE public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  message_hi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS Policies for complaints table
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for demo purposes
CREATE POLICY "Allow public read access on complaints"
  ON public.complaints
  FOR SELECT
  USING (true);

-- Allow anonymous insert access for demo purposes
CREATE POLICY "Allow public insert on complaints"
  ON public.complaints
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous update access for demo purposes
CREATE POLICY "Allow public update on complaints"
  ON public.complaints
  FOR UPDATE
  USING (true);

-- Allow anonymous read access for updates
CREATE POLICY "Allow public read access on complaint_updates"
  ON public.complaint_updates
  FOR SELECT
  USING (true);

-- Allow anonymous insert access for updates
CREATE POLICY "Allow public insert on complaint_updates"
  ON public.complaint_updates
  FOR INSERT
  WITH CHECK (true);
