const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function run() {
  const newRow = {
    id: 'JM-test-123',
    title: 'test',
    title_hi: 'test',
    description: 'test',
    description_hi: 'test',
    category: 'test',
    category_hi: 'test',
    priority: 'medium',
    status: 'submitted',
    department_id: 'nagar-nigam',
    latitude: 26.8467,
    longitude: 80.9462,
    area: 'test',
    citizen_id: null,
    citizen_name: 'test',
    citizen_phone: 'test',
    image_url: null,
    voice_url: null,
    ai_summary: 'test',
    ai_summary_hi: 'test',
    ai_confidence: 0.9,
    trust_analysis: { trustScore: 100 },
    trust_score: 1.0,
    escalation_level: 0,
    assigned_officer: 'test'
  };
  const { data, error } = await supabase.from('complaints').insert(newRow).select().single();
  console.log('Result:', JSON.stringify({ data, error }));
}
run();
