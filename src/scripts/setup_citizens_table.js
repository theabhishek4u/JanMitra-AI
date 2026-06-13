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
-- Create citizens table
CREATE TABLE IF NOT EXISTS public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Allow public read access on citizens" ON public.citizens;
DROP POLICY IF EXISTS "Allow public insert on citizens" ON public.citizens;
DROP POLICY IF EXISTS "Allow public update on citizens" ON public.citizens;

-- Create RLS Policies
CREATE POLICY "Allow public read access on citizens"
  ON public.citizens FOR SELECT USING (true);

CREATE POLICY "Allow public insert on citizens"
  ON public.citizens FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on citizens"
  ON public.citizens FOR UPDATE USING (true);
`;

async function main() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📋 Creating citizens table and RLS policies...');
    await client.query(SCHEMA_SQL);
    console.log('✅ Citizens table and policies created successfully!\n');

    // Check tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'citizens';
    `);
    
    if (res.rows.length > 0) {
      console.log('📊 Citizens table successfully verified in database.');
    } else {
      console.error('❌ Verification failed: Citizens table not found.');
    }
    
    console.log('\n🎉 Setup complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
