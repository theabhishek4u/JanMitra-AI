// Direct PostgreSQL connection to Supabase to create tables
// Uses the database password provided by user

const { Client } = require('pg');

const PROJECT_ID = 'fqqbiwhwpljynpcekpnh';
const DB_PASSWORD = 'nFyfIK2rsLbOwdvj';

const client = new Client({
  host: `db.${PROJECT_ID}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const SCHEMA_SQL = `
-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
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
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  message_hi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow public read access on complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public insert on complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public update on complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public read access on complaint_updates" ON public.complaint_updates;
DROP POLICY IF EXISTS "Allow public insert on complaint_updates" ON public.complaint_updates;

-- Create RLS Policies
CREATE POLICY "Allow public read access on complaints"
  ON public.complaints FOR SELECT USING (true);

CREATE POLICY "Allow public insert on complaints"
  ON public.complaints FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on complaints"
  ON public.complaints FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on complaint_updates"
  ON public.complaint_updates FOR SELECT USING (true);

CREATE POLICY "Allow public insert on complaint_updates"
  ON public.complaint_updates FOR INSERT WITH CHECK (true);
`;

async function main() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📋 Creating tables and RLS policies...');
    await client.query(SCHEMA_SQL);
    console.log('✅ Tables and policies created successfully!\n');

    // Check tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('complaints', 'complaint_updates')
      ORDER BY table_name;
    `);
    console.log('📊 Tables in database:');
    res.rows.forEach(r => console.log(`   - ${r.table_name}`));
    
    console.log('\n🎉 Schema setup complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
