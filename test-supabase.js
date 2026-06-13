const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = envLocal.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    const { data, error } = await supabase.from('complaints').select('*').limit(1);
    if (error) {
      console.error('API Error:', error.message);
      if (error.code === '42P01') {
        console.log('\n❌ SUCCESS connecting to Supabase, but the "complaints" table does NOT exist yet. Please run the schema.sql in your Supabase SQL editor.');
      }
    } else {
      console.log('\n✅ API is working perfectly!');
      console.log('Data fetched:', data);
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
