const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = envLocal.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log('🌱 Seeding complaints data...\n');

  // First check if complaints table exists and has data
  const { data: existing, error: checkErr } = await supabase.from('complaints').select('id').limit(1);
  if (checkErr) {
    console.error('❌ Table does not exist yet. Please run schema.sql first in Supabase SQL Editor.');
    console.error('Error:', checkErr.message);
    return;
  }

  if (existing && existing.length > 0) {
    console.log('⚠️ Data already exists. Skipping seed to avoid duplicates.');
    console.log('If you want to re-seed, clear the tables first.');
    return;
  }

  // Insert complaints
  const complaints = [
    {
      id: 'JM-2026-001-999',
      title: 'Massive garbage pile near bus stand',
      title_hi: 'बस स्टैंड के पास भारी कचरे का ढेर',
      description: 'There is a huge pile of garbage that has not been collected for a week. The smell is unbearable and it is becoming a health hazard.',
      description_hi: 'बस स्टैंड के पास एक सप्ताह से कचरा नहीं उठाया गया है। बदबू असहनीय है और यह स्वास्थ्य के लिए खतरा बन रहा है।',
      category: 'Garbage / Sanitation',
      category_hi: 'कचरा / स्वच्छता',
      priority: 'high',
      status: 'department_assigned',
      department_id: 'nagar-nigam',
      latitude: 26.8500,
      longitude: 80.9500,
      area: 'Alambagh, Lucknow',
      citizen_id: 'user-1',
      citizen_name: 'Aman Singh',
      citizen_phone: '+91 98765 43210',
      image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop',
      ai_summary: 'Severe sanitation hazard reported near Alambagh bus stand.',
      ai_summary_hi: 'आलमबाग बस स्टैंड के पास गंभीर स्वच्छता खतरा।',
      ai_confidence: 0.95,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.05 },
      trust_score: 0.95,
      assigned_officer: 'Shri Rajesh Kumar'
    },
    {
      id: 'JM-2026-002-888',
      title: 'Street light not working in sector 4',
      title_hi: 'सेक्टर 4 में स्ट्रीट लाइट काम नहीं कर रही',
      description: 'Street light has been broken for 3 days, causing accidents in the dark.',
      description_hi: '3 दिन से स्ट्रीट लाइट खराब है, जिससे अंधेरे में दुर्घटनाएं हो रही हैं।',
      category: 'Street Light',
      category_hi: 'स्ट्रीट लाइट',
      priority: 'medium',
      status: 'resolved',
      department_id: 'lesa',
      latitude: 26.8400,
      longitude: 80.9600,
      area: 'Gomti Nagar, Lucknow',
      citizen_id: 'user-2',
      citizen_name: 'Priya Verma',
      citizen_phone: '+91 87654 32109',
      image_url: 'https://images.unsplash.com/photo-1517789490516-fb46487e49ba?w=600&h=400&fit=crop',
      ai_summary: 'Street light outage reported in Gomti Nagar.',
      ai_summary_hi: 'गोमती नगर में स्ट्रीट लाइट खराब होने की रिपोर्ट।',
      ai_confidence: 0.92,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.02 },
      trust_score: 0.98,
      assigned_officer: 'Smt. Meena Devi'
    },
    {
      id: 'JM-2026-003-777',
      title: 'Major water pipe burst on Main Road',
      title_hi: 'मुख्य मार्ग पर पानी की पाइपलाइन फटी',
      description: 'A major water pipeline has burst, causing severe waterlogging and wastage of clean drinking water.',
      description_hi: 'एक प्रमुख पानी की पाइपलाइन फट गई है, जिससे भारी जलभराव और पीने के साफ पानी की बर्बादी हो रही है।',
      category: 'Water Supply',
      category_hi: 'जल आपूर्ति',
      priority: 'high',
      status: 'submitted',
      department_id: 'jal-sansthan',
      latitude: 26.8600,
      longitude: 80.9400,
      area: 'Hazratganj, Lucknow',
      citizen_id: 'user-3',
      citizen_name: 'Rahul Sharma',
      citizen_phone: '+91 91234 56780',
      image_url: 'https://images.unsplash.com/photo-1541888075765-a81062b08a54?w=600&h=400&fit=crop',
      ai_summary: 'Major pipeline burst causing waterlogging in Hazratganj.',
      ai_summary_hi: 'हजरतगंज में पाइपलाइन फटने से जलभराव की समस्या।',
      ai_confidence: 0.96,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.01 },
      trust_score: 0.99,
      assigned_officer: 'Shri Anil Dubey'
    },
    {
      id: 'JM-2026-004-666',
      title: 'Pothole causing accidents',
      title_hi: 'गड्ढे के कारण हो रही दुर्घटनाएं',
      description: 'Large pothole in the middle of the road has caused two bike accidents today alone. Please fix urgently.',
      description_hi: 'सड़क के बीच में बड़े गड्ढे के कारण आज ही दो बाइक दुर्घटनाएं हुई हैं। कृपया तत्काल ठीक करें।',
      category: 'Roads / Potholes',
      category_hi: 'सड़कें / गड्ढे',
      priority: 'high',
      status: 'department_assigned',
      department_id: 'pwd',
      latitude: 26.8700,
      longitude: 80.9300,
      area: 'Indira Nagar, Lucknow',
      citizen_id: 'user-4',
      citizen_name: 'Sneha Gupta',
      citizen_phone: '+91 99887 76655',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop',
      ai_summary: 'Dangerous pothole causing accidents in Indira Nagar.',
      ai_summary_hi: 'इंदिरा नगर में गड्ढे के कारण दुर्घटनाओं की रिपोर्ट।',
      ai_confidence: 0.94,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.04 },
      trust_score: 0.96,
      assigned_officer: 'Shri R. K. Singh'
    },
    {
      id: 'JM-2026-005-555',
      title: 'Stray dogs attacking pedestrians',
      title_hi: 'आवारा कुत्ते राहगीरों पर हमला कर रहे हैं',
      description: 'A pack of stray dogs is acting aggressively and has bitten a child yesterday. Immediate action required.',
      description_hi: 'आवारा कुत्तों का एक झुंड आक्रामक हो रहा है और कल एक बच्चे को काट लिया है। तत्काल कार्रवाई की आवश्यकता है।',
      category: 'Animal Control',
      category_hi: 'पशु नियंत्रण',
      priority: 'medium',
      status: 'submitted',
      department_id: 'animal-control',
      latitude: 26.8550,
      longitude: 80.9650,
      area: 'Mahanagar, Lucknow',
      citizen_id: 'user-5',
      citizen_name: 'Vikram Singh',
      citizen_phone: '+91 88776 65544',
      image_url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&h=400&fit=crop',
      ai_summary: 'Aggressive stray dogs reported in Mahanagar.',
      ai_summary_hi: 'महानगर में आक्रामक आवारा कुत्तों की शिकायत।',
      ai_confidence: 0.88,
      trust_analysis: { trustLevel: 'medium', spamProbability: 0.1 },
      trust_score: 0.85,
      assigned_officer: 'Dr. Vivek Sharma'
    },
    {
      id: 'JM-2026-006-444',
      title: 'Open manhole on footpath',
      title_hi: 'फुटपाथ पर खुला मैनहोल',
      description: 'The manhole cover is missing near the park gate. It is very dangerous for children playing nearby.',
      description_hi: 'पार्क के गेट के पास मैनहोल का ढक्कन गायब है। यह पास में खेलने वाले बच्चों के लिए बहुत खतरनाक है।',
      category: 'Public Infrastructure',
      category_hi: 'सार्वजनिक बुनियादी ढांचा',
      priority: 'high',
      status: 'resolved',
      department_id: 'nagar-nigam',
      latitude: 26.8450,
      longitude: 80.9350,
      area: 'Aashiana, Lucknow',
      citizen_id: 'user-6',
      citizen_name: 'Kavita Tiwari',
      citizen_phone: '+91 77665 54433',
      image_url: 'https://images.unsplash.com/photo-1621245781440-101f3db3e6ba?w=600&h=400&fit=crop',
      ai_summary: 'Dangerous open manhole near park in Aashiana.',
      ai_summary_hi: 'आशियाना में पार्क के पास खतरनाक खुला मैनहोल।',
      ai_confidence: 0.97,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.01 },
      trust_score: 0.99,
      assigned_officer: 'Shri Rajesh Kumar'
    },
    {
      id: 'JM-2026-007-333',
      title: 'Illegal construction blocking drain',
      title_hi: 'अवैध निर्माण से नाला बंद',
      description: 'Someone is building a ramp over the public drain, which is causing sewage water to overflow onto the street.',
      description_hi: 'कोई सार्वजनिक नाले के ऊपर रैंप बना रहा है, जिससे सीवर का पानी सड़क पर बह रहा है।',
      category: 'Encroachment',
      category_hi: 'अतिक्रमण',
      priority: 'low',
      status: 'department_assigned',
      department_id: 'nagar-nigam',
      latitude: 26.8350,
      longitude: 80.9550,
      area: 'Rajajipuram, Lucknow',
      citizen_id: 'user-7',
      citizen_name: 'Mohammad Arif',
      citizen_phone: '+91 66554 43322',
      image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356f12?w=600&h=400&fit=crop',
      ai_summary: 'Drain blocked by illegal construction in Rajajipuram.',
      ai_summary_hi: 'राजाजीपुरम में अवैध निर्माण के कारण नाला अवरुद्ध।',
      ai_confidence: 0.91,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.08 },
      trust_score: 0.92,
      assigned_officer: 'Smt. Sunita Yadav'
    },
    {
      id: 'JM-2026-008-222',
      title: 'Dead animal on the road',
      title_hi: 'सड़क पर मृत जानवर',
      description: 'A dead cow is lying on the bypass road since morning. Please send a vehicle to pick it up.',
      description_hi: 'सुबह से बाईपास रोड पर एक मृत गाय पड़ी है। कृपया इसे उठाने के लिए वाहन भेजें।',
      category: 'Garbage / Sanitation',
      category_hi: 'कचरा / स्वच्छता',
      priority: 'medium',
      status: 'submitted',
      department_id: 'nagar-nigam',
      latitude: 26.8800,
      longitude: 80.9200,
      area: 'Jankipuram, Lucknow',
      citizen_id: 'user-8',
      citizen_name: 'Alok Pandey',
      citizen_phone: '+91 55443 32211',
      image_url: 'https://images.unsplash.com/photo-1596781206132-75ebdb5952d4?w=600&h=400&fit=crop',
      ai_summary: 'Dead animal removal requested in Jankipuram.',
      ai_summary_hi: 'जानकीपुरम में मृत जानवर उठाने का अनुरोध।',
      ai_confidence: 0.93,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.03 },
      trust_score: 0.97,
      assigned_officer: 'Shri Rajesh Kumar'
    },
    {
      id: 'JM-2026-009-111',
      title: 'Park poorly maintained',
      title_hi: 'पार्क का रखरखाव खराब है',
      description: 'The swings in the local park are broken and the grass has not been cut for months.',
      description_hi: 'स्थानीय पार्क में झूले टूटे हुए हैं और महीनों से घास नहीं काटी गई है।',
      category: 'Parks & Recreation',
      category_hi: 'पार्क और मनोरंजन',
      priority: 'low',
      status: 'resolved',
      department_id: 'nagar-nigam',
      latitude: 26.8300,
      longitude: 80.9600,
      area: 'Vikas Nagar, Lucknow',
      citizen_id: 'user-9',
      citizen_name: 'Neha Singh',
      citizen_phone: '+91 44332 21100',
      image_url: 'https://images.unsplash.com/photo-1500367215255-0e0b2148b556?w=600&h=400&fit=crop',
      ai_summary: 'Poor park maintenance and broken swings in Vikas Nagar.',
      ai_summary_hi: 'विकास नगर में पार्क का खराब रखरखाव और टूटे झूले।',
      ai_confidence: 0.85,
      trust_analysis: { trustLevel: 'medium', spamProbability: 0.15 },
      trust_score: 0.80,
      assigned_officer: 'Shri Sanjay Mishra'
    },
    {
      id: 'JM-2026-010-000',
      title: 'Live electric wire hanging low',
      title_hi: 'बिजली का खुला तार नीचे लटक रहा है',
      description: 'A live electric wire has snapped and is hanging dangerously low near the school gate. Highly dangerous!',
      description_hi: 'एक खुला बिजली का तार टूट गया है और स्कूल के गेट के पास खतरनाक रूप से नीचे लटक रहा है। अत्यधिक खतरनाक!',
      category: 'Electricity',
      category_hi: 'बिजली',
      priority: 'high',
      status: 'department_assigned',
      department_id: 'lesa',
      latitude: 26.8650,
      longitude: 80.9450,
      area: 'Chowk, Lucknow',
      citizen_id: 'user-10',
      citizen_name: 'Syed Ali',
      citizen_phone: '+91 33221 10099',
      image_url: 'https://images.unsplash.com/photo-1544257124-74bf5fbfe4b2?w=600&h=400&fit=crop',
      ai_summary: 'Dangerous live wire hanging near school in Chowk.',
      ai_summary_hi: 'चौक में स्कूल के पास लटकता हुआ खतरनाक खुला तार।',
      ai_confidence: 0.98,
      trust_analysis: { trustLevel: 'high', spamProbability: 0.00 },
      trust_score: 1.00,
      assigned_officer: 'Smt. Meena Devi'
    }
  ];

  const { data: insertedComplaints, error: insertErr } = await supabase
    .from('complaints')
    .insert(complaints)
    .select();

  if (insertErr) {
    console.error('❌ Error inserting complaints:', insertErr.message);
    return;
  }
  console.log(`✅ Inserted ${insertedComplaints.length} complaints successfully!`);

  // Insert timeline updates
  const updates = [
    { complaint_id: 'JM-2026-001-999', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-001-999', status: 'department_assigned', message: 'Routed to department automatically.', message_hi: 'स्वचालित रूप से आवंटित।' },
    { complaint_id: 'JM-2026-002-888', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-002-888', status: 'resolved', message: 'Issue resolved completely. Resolution verified by department.', message_hi: 'समस्या का पूर्ण निवारण हो चुका है। विभाग द्वारा निवारण की पुष्टि की गई है।' },
    { complaint_id: 'JM-2026-003-777', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-004-666', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-004-666', status: 'department_assigned', message: 'Routed to PWD for road repairs.', message_hi: 'सड़क मरम्मत के लिए लोक निर्माण विभाग को भेजा गया।' },
    { complaint_id: 'JM-2026-005-555', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-006-444', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-006-444', status: 'department_assigned', message: 'Routed to department automatically.', message_hi: 'स्वचालित रूप से आवंटित।' },
    { complaint_id: 'JM-2026-006-444', status: 'resolved', message: 'Manhole cover has been replaced.', message_hi: 'मैनहोल का ढक्कन बदल दिया गया है।' },
    { complaint_id: 'JM-2026-007-333', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-007-333', status: 'department_assigned', message: 'Routed to encroachment cell.', message_hi: 'अतिक्रमण सेल को भेजा गया।' },
    { complaint_id: 'JM-2026-008-222', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-009-111', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-009-111', status: 'resolved', message: 'Park cleaned and swings repaired.', message_hi: 'पार्क की सफाई की गई और झूले की मरम्मत की गई।' },
    { complaint_id: 'JM-2026-010-000', status: 'submitted', message: 'Complaint submitted successfully by citizen.', message_hi: 'नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।' },
    { complaint_id: 'JM-2026-010-000', status: 'department_assigned', message: 'Priority routing to electricity department.', message_hi: 'बिजली विभाग को प्राथमिकता से भेजा गया।' },
  ];

  const { data: insertedUpdates, error: updateErr } = await supabase
    .from('complaint_updates')
    .insert(updates)
    .select();

  if (updateErr) {
    console.error('❌ Error inserting updates:', updateErr.message);
    return;
  }
  console.log(`✅ Inserted ${insertedUpdates.length} timeline updates successfully!`);
  
  console.log('\n🎉 Database setup complete! Your JanMitra AI app is now connected to Supabase!');
}

seedData().catch(console.error);
