const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env variables
const envLocal = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = envLocal.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

// Coordinates mapping
const areaCoords = {
  "Hazratganj, Lucknow": { lat: 26.8467, lng: 80.9462 },
  "Gomti Nagar, Lucknow": { lat: 26.8567, lng: 80.9762 },
  "Aliganj, Lucknow": { lat: 26.8833, lng: 80.9333 },
  "Indira Nagar, Lucknow": { lat: 26.8878, lng: 80.9631 },
  "Aminabad, Lucknow": { lat: 26.8439, lng: 80.9255 }
};

// Department details mapping
function getDeptDetails(category) {
  switch (category) {
    case "Garbage / Sanitation":
      return { id: "nagar-nigam", officer: "Shri Rajesh Kumar" };
    case "Water Supply":
      return { id: "jal-nigam", officer: "Smt. Priya Sharma" };
    case "Road Damage":
      return { id: "pwd", officer: "Shri Amit Verma" };
    case "Electricity":
      return { id: "power-dept", officer: "Shri Vikram Singh" };
    case "Street Light":
      return { id: "lmc", officer: "Smt. Neha Tripathi" };
    case "Illegal Construction":
      return { id: "municipal-authority", officer: "Shri Deepak Gupta" };
    case "Encroachment":
      return { id: "municipal-authority", officer: "Shri Deepak Gupta" };
    case "Corruption":
      return { id: "anti-corruption", officer: "Shri Arvind Mishra" };
    case "Public Health":
      return { id: "health-dept", officer: "Dr. Sanjay Pandey" };
    default:
      return { id: "nagar-nigam", officer: "Shri Rajesh Kumar" };
  }
}

// Category image mapping
const categoryImages = {
  "Garbage / Sanitation": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=400&fit=crop",
  "Water Supply": "https://images.unsplash.com/photo-1581244904349-8e47cb23e59b?w=600&h=400&fit=crop",
  "Road Damage": "https://images.unsplash.com/photo-1599740831119-072d5257af53?w=600&h=400&fit=crop",
  "Electricity": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop",
  "Street Light": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=400&fit=crop",
  "Illegal Construction": "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600&h=400&fit=crop",
  "Encroachment": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
  "Corruption": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
  "Public Health": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&h=400&fit=crop"
};

// 45 Mock complaints raw data
const rawComplaints = [
  // 1. Garbage / Sanitation
  {
    category: "Garbage / Sanitation",
    category_hi: "कचरा / स्वच्छता",
    area: "Hazratganj, Lucknow",
    title: "Uncontrolled dumping behind Hazratganj Market",
    title_hi: "हजरतगंज बाजार के पीछे अनियंत्रित कूड़ा डंपिंग",
    description: "Piles of plastic waste and food containers have accumulated behind the main shopping lane. It's attracting pests and stray animals.",
    description_hi: "मुख्य शॉपिंग लेन के पीछे प्लास्टिक कचरे और खाद्य डिब्बों के ढेर जमा हो गए हैं। यह कीटों और आवारा जानवरों को आकर्षित कर रहा है।",
    priority: "high"
  },
  {
    category: "Garbage / Sanitation",
    category_hi: "कचरा / स्वच्छता",
    area: "Gomti Nagar, Lucknow",
    title: "Overflowing public dustbins in Patrakar Puram",
    title_hi: "पत्रकार पुरम में सार्वजनिक डस्टबिन का ओवरफ्लो होना",
    description: "The large green community dustbins near Patrakar Puram crossing have not been emptied for 4 days, resulting in waste spilling onto the main road.",
    description_hi: "पत्रकार पुरम चौराहे के पास बड़े हरे सामुदायिक डस्टबिन 4 दिनों से खाली नहीं किए गए हैं, जिससे कचरा मुख्य सड़क पर फैल रहा है।",
    priority: "medium"
  },
  {
    category: "Garbage / Sanitation",
    category_hi: "कचरा / स्वच्छता",
    area: "Aliganj, Lucknow",
    title: "Clogged open drain near Sector H market",
    title_hi: "सेक्टर एच बाजार के पास बंद खुला नाला",
    description: "Garbage and plastic bottles have choked the open stormwater drain, causing dirty water to overflow onto the walking path.",
    description_hi: "कचरे और प्लास्टिक की बोतलों ने खुले तूफान के पानी के नाले को अवरुद्ध कर दिया है, जिससे गंदा पानी चलने वाले रास्ते पर बह रहा है।",
    priority: "high"
  },
  {
    category: "Garbage / Sanitation",
    category_hi: "कचरा / स्वच्छता",
    area: "Indira Nagar, Lucknow",
    title: "Unattended municipal waste pile in Sector 14",
    title_hi: "सेक्टर 14 में लावारिस नगर निगम कचरे का ढेर",
    description: "A large heap of dry leaves and household waste has been dumped at the corner of Sector 14 park, causing breathing issues for visiting elders.",
    description_hi: "सेक्टर 14 पार्क के कोने में सूखी पत्तियों और घरेलू कचरे का एक बड़ा ढेर लगा दिया गया है, जिससे आने वाले बुजुर्गों को सांस लेने में समस्या हो रही है।",
    priority: "low"
  },
  {
    category: "Garbage / Sanitation",
    category_hi: "कचरा / स्वच्छता",
    area: "Aminabad, Lucknow",
    title: "Accumulated market waste blocking pedestrian path",
    title_hi: "पैदल पथ को अवरुद्ध करने वाला बाजार का संचित कचरा",
    description: "Vegetable market refuse is dumped daily near the pavement. No municipal sweeper has cleaned the area since Monday.",
    description_hi: "सब्जी मंडी का कचरा रोजाना पटरी के पास फेंक दिया जाता है। सोमवार से किसी भी नगर निगम के सफाई कर्मचारी ने क्षेत्र की सफाई नहीं की है।",
    priority: "medium"
  },

  // 2. Water Supply
  {
    category: "Water Supply",
    category_hi: "जल आपूर्ति",
    area: "Gomti Nagar, Lucknow",
    title: "Contaminated muddy water supply in Vipul Khand",
    title_hi: "विपुल खंड में प्रदूषित मटमैले पानी की आपूर्ति",
    description: "Residents of Vipul Khand are receiving highly turbid, brownish mud water in their taps, making it completely unfit for drinking or cooking.",
    description_hi: "विपुल खंड के निवासियों को अपने नलों में अत्यधिक गंदा, भूरे रंग का कीचड़ का पानी मिल रहा है, जिससे यह पीने या खाना पकाने के लिए पूरी तरह से अनुपयुक्त हो गया है।",
    priority: "high"
  },
  {
    category: "Water Supply",
    category_hi: "जल आपूर्ति",
    area: "Indira Nagar, Lucknow",
    title: "Low water pressure in Sector C block",
    title_hi: "सेक्टर सी ब्लॉक में पानी का कम दबाव",
    description: "The municipal water supply pressure is extremely low, making it impossible to fill overhead tanks even with booster pumps.",
    description_hi: "नगर निगम की जलापूर्ति का दबाव बेहद कम है, जिससे बूस्टर पंपों के बाद भी ओवरहेड टैंकों को भरना असंभव हो गया है।",
    priority: "medium"
  },
  {
    category: "Water Supply",
    category_hi: "जल आपूर्ति",
    area: "Aliganj, Lucknow",
    title: "Water pipeline leakage at Kapoorthala crossing",
    title_hi: "कपूरथला चौराहे पर पानी की पाइपलाइन लीक",
    description: "A major joint leak in the main pipeline is spraying clean drinking water onto the street, flooding the lane and causing traffic delays.",
    description_hi: "मुख्य पाइपलाइन में एक बड़ा संयुक्त रिसाव सड़क पर पीने का साफ पानी बिखेर रहा है, जिससे गली में पानी भर गया है और यातायात में देरी हो रही है।",
    priority: "high"
  },
  {
    category: "Water Supply",
    category_hi: "जल आपूर्ति",
    area: "Hazratganj, Lucknow",
    title: "Irregular water supply timings in Lalbagh",
    title_hi: "लालबाग में जलापूर्ति का अनियमित समय",
    description: "Water is only supplied for 10-15 minutes daily at random morning hours, causing severe inconvenience to office-going residents.",
    description_hi: "पानी केवल 10-15 मिनट के लिए दैनिक रूप से सुबह के यादृच्छिक घंटों में आपूर्ति किया जाता है, जिससे कार्यालय जाने वाले निवासियों को गंभीर असुविधा होती है।",
    priority: "medium"
  },
  {
    category: "Water Supply",
    category_hi: "जल आपूर्ति",
    area: "Aminabad, Lucknow",
    title: "Leaking water valve causing street waterlogging",
    title_hi: "सड़क पर जलभराव का कारण बना पानी का रिसाव वाल्व",
    description: "The main pipeline control valve near Aminabad temple is leaking constantly, causing a huge puddle that damages the local road surface.",
    description_hi: "अमीनाबाद मंदिर के पास मुख्य पाइपलाइन नियंत्रण वाल्व लगातार लीक हो रहा है, जिससे एक बड़ा गड्ढा बन गया है जो स्थानीय सड़क की सतह को नुकसान पहुंचाता है।",
    priority: "low"
  },

  // 3. Road Damage
  {
    category: "Road Damage",
    category_hi: "सड़क मरम्मत / गड्ढे",
    area: "Indira Nagar, Lucknow",
    title: "Deep potholes on Sector 11 main street",
    title_hi: "सेक्टर 11 मुख्य मार्ग पर गहरे गड्ढे",
    description: "Several deep potholes have formed on the main road, making commuting dangerous, especially for two-wheelers during night hours.",
    description_hi: "मुख्य सड़क पर कई गहरे गड्ढे बन गए हैं, जिससे यात्रा करना खतरनाक हो गया है, खासकर रात के समय दोपहिया वाहनों के लिए।",
    priority: "high"
  },
  {
    category: "Road Damage",
    category_hi: "सड़क मरम्मत / गड्ढे",
    area: "Aliganj, Lucknow",
    title: "Damaged asphalt on Kapoorthala main road",
    title_hi: "कपूरथला मुख्य मार्ग पर क्षतिग्रस्त डामर",
    description: "The upper layer of the road has completely eroded, leaving sharp stones loose and creating severe dust pollution in the market area.",
    description_hi: "सड़क की ऊपरी परत पूरी तरह से नष्ट हो गई है, जिससे नुकीले पत्थर ढीले हो गए हैं और बाजार क्षेत्र में धूल का भारी प्रदूषण हो रहा है।",
    priority: "medium"
  },
  {
    category: "Road Damage",
    category_hi: "सड़क मरम्मत / गड्ढे",
    area: "Hazratganj, Lucknow",
    title: "Caved-in road surface near GPO crossing",
    title_hi: "जीपीओ चौराहे के पास धंसी सड़क की सतह",
    description: "A portion of the road surface has caved in near the GPO, creating a major traffic hazard. Needs immediate barricading and repair.",
    description_hi: "जीपीओ के पास सड़क की सतह का एक हिस्सा धंस गया है, जिससे यातायात को बड़ा खतरा हो गया है। तत्काल बैरिकेडिंग और मरम्मत की आवश्यकता है।",
    priority: "high"
  },
  {
    category: "Road Damage",
    category_hi: "सड़क मरम्मत / गड्ढे",
    area: "Gomti Nagar, Lucknow",
    title: "Uneven road patching near Manoj Pandey Chauraha",
    title_hi: "मनोज पांडे चौराहा के पास असमान सड़क पैचिंग",
    description: "The road was patched after pipeline work but left uneven, causing vehicles to lose control at normal speed limits.",
    description_hi: "पाइपलाइन के काम के बाद सड़क को पैच किया गया था लेकिन असमान छोड़ दिया गया, जिससे वाहन सामान्य गति सीमा पर नियंत्रण खो रहे हैं।",
    priority: "low"
  },
  {
    category: "Road Damage",
    category_hi: "सड़क मरम्मत / गड्ढे",
    area: "Aminabad, Lucknow",
    title: "Broken concrete slabs on market lane",
    title_hi: "बाजार की गली में टूटे कंक्रीट के स्लैब",
    description: "The main market lane concrete road has cracked and broken, causing shoppers and older citizens to trip and fall regularly.",
    description_hi: "मुख्य बाजार की गली की कंक्रीट सड़क टूट गई है, जिससे खरीदार और वरिष्ठ नागरिक नियमित रूप से गिर रहे हैं।",
    priority: "medium"
  },

  // 4. Electricity
  {
    category: "Electricity",
    category_hi: "बिजली / विद्युत",
    area: "Gomti Nagar, Lucknow",
    title: "Frequent voltage fluctuations in Vivek Khand",
    title_hi: "विवेक खंड में बार-बार वोल्टेज में उतार-चढ़ाव",
    description: "Severe voltage fluctuations are occurring multiple times a day, damaging home appliances like air conditioners and refrigerators.",
    description_hi: "दिन में कई बार गंभीर वोल्टेज उतार-चढ़ाव हो रहा है, जिससे एयर कंडीशनर और रेफ्रिजरेटर जैसे घरेलू उपकरणों को नुकसान पहुंच रहा है।",
    priority: "high"
  },
  {
    category: "Electricity",
    category_hi: "बिजली / विद्युत",
    area: "Aliganj, Lucknow",
    title: "Snapping of overhead cable in Sector J",
    title_hi: "सेक्टर जे में ओवरहेड केबल का टूटना",
    description: "A secondary overhead power cable snapped and fell on the street. Fortunately, power was cut, but it needs urgent replacement and tying.",
    description_hi: "एक सेकेंडरी ओवरहेड बिजली का तार टूटकर गली में गिर गया। सौभाग्य से, बिजली काट दी गई थी, लेकिन इसे तत्काल बदलने और बांधने की आवश्यकता है।",
    priority: "high"
  },
  {
    category: "Electricity",
    category_hi: "बिजली / विद्युत",
    area: "Hazratganj, Lucknow",
    title: "Sparking transformer near Janpath Market",
    title_hi: "जनपथ मार्केट के पास चिंगारी छोड़ता ट्रांसफार्मर",
    description: "The commercial transformer is frequently sparking and emitting loud crackling noises, causing panic and temporary power outages.",
    description_hi: "व्यावसायिक ट्रांसफार्मर अक्सर चिंगारी छोड़ रहा है और तेज आवाजें निकाल रहा है, जिससे दहशत और अस्थायी बिजली कटौती हो रही है।",
    priority: "high"
  },
  {
    category: "Electricity",
    category_hi: "बिजली / विद्युत",
    area: "Indira Nagar, Lucknow",
    title: "Unscheduled 6-hour power outage in Sector 18",
    title_hi: "सेक्टर 18 में बिना सूचना के 6 घंटे की बिजली कटौती",
    description: "Residents are experiencing long power cuts daily without any prior notice or scheduled maintenance logs, affecting student studies.",
    description_hi: "निवासी बिना किसी पूर्व सूचना या निर्धारित रखरखाव लॉग के दैनिक रूप से लंबी बिजली कटौती का सामना कर रहे हैं, जिससे छात्रों की पढ़ाई प्रभावित हो रही है।",
    priority: "medium"
  },
  {
    category: "Electricity",
    category_hi: "बिजली / विद्युत",
    area: "Aminabad, Lucknow",
    title: "Low hanging high-tension wires in busy market",
    title_hi: "व्यस्त बाजार में नीचे लटकते हाई-टेंशन तार",
    description: "HT electric wires are hanging extremely low, barely 8 feet above the commercial street, posing a major risk of electrocution during monsoons.",
    description_hi: "एचटी बिजली के तार बेहद नीचे लटके हुए हैं, व्यावसायिक गली से बमुश्किल 8 फीट ऊपर, जिससे मानसून के दौरान बिजली के झटके का बड़ा खतरा है।",
    priority: "high"
  },

  // 5. Street Light
  {
    category: "Street Light",
    category_hi: "स्ट्रीट लाइट",
    area: "Hazratganj, Lucknow",
    title: "Dark street stretch behind GPO",
    title_hi: "जीपीओ के पीछे अंधेरा सड़क खंड",
    description: "About 5 consecutive street light poles are non-functional, making the stretch completely dark and unsafe for women walking home.",
    description_hi: "लगभग 5 लगातार स्ट्रीट लाइट पोल काम नहीं कर रहे हैं, जिससे घर जाने वाली महिलाओं के लिए यह खंड पूरी तरह से अंधेरा और असुरक्षित हो गया है।",
    priority: "medium"
  },
  {
    category: "Street Light",
    category_hi: "स्ट्रीट लाइट",
    area: "Gomti Nagar, Lucknow",
    title: "Flickering street lights near Marine Drive",
    title_hi: "मरीन ड्राइव के पास टिमटिमाती स्ट्रीट लाइटें",
    description: "Multiple street lights on the bypass road are flickering constantly, causing visibility issues for evening joggers and drivers.",
    description_hi: "बाईपास रोड पर कई स्ट्रीट लाइटें लगातार टिमटिमा रही हैं, जिससे शाम के धावकों और वाहन चालकों के लिए दृश्यता की समस्या हो रही है।",
    priority: "low"
  },
  {
    category: "Street Light",
    category_hi: "स्ट्रीट लाइट",
    area: "Aliganj, Lucknow",
    title: "Broken street light dome in Sector F",
    title_hi: "सेक्टर एफ में टूटी हुई स्ट्रीट लाइट गुंबद",
    description: "The protective casing and LED bulb of the street light pole near post office are broken due to falling tree branch.",
    description_hi: "पेड़ की शाखा गिरने के कारण डाकघर के पास स्ट्रीट लाइट पोल का सुरक्षात्मक आवरण और एलईडी बल्ब टूट गया है।",
    priority: "low"
  },
  {
    category: "Street Light",
    category_hi: "स्ट्रीट लाइट",
    area: "Indira Nagar, Lucknow",
    title: "No street lights on Sector 12 bypass road",
    title_hi: "सेक्टर 12 बाईपास मार्ग पर कोई स्ट्रीट लाइट नहीं",
    description: "The newly constructed bypass road has light poles installed but they have not been connected to the power line yet, causing darkness.",
    description_hi: "नवनिर्मित बाईपास रोड पर लाइट पोल स्थापित हैं लेकिन उन्हें अभी तक बिजली लाइन से नहीं जोड़ा गया है, जिससे अंधेरा रहता है।",
    priority: "medium"
  },
  {
    category: "Street Light",
    category_hi: "स्ट्रीट लाइट",
    area: "Aminabad, Lucknow",
    title: "Non-functional lights in busy shopping lane",
    title_hi: "व्यस्त शॉपिंग गली में गैर-कार्यात्मक लाइटें",
    description: "The central shopping lane has no working street lights, forcing shop owners to shut early or rely on backup generators.",
    description_hi: "केंद्रीय शॉपिंग लेन में कोई भी स्ट्रीट लाइट काम नहीं कर रही है, जिससे दुकान मालिकों को जल्दी बंद करने या बैकअप जनरेटर पर भरोसा करने के लिए मजबूर होना पड़ रहा है।",
    priority: "medium"
  },

  // 6. Illegal Construction
  {
    category: "Illegal Construction",
    category_hi: "अवैध निर्माण",
    area: "Gomti Nagar, Lucknow",
    title: "Unauthorized floor construction in residential zone",
    title_hi: "आवासीय क्षेत्र में अनधिकृत मंजिल का निर्माण",
    description: "A builder is constructing a 4th floor in a residential colony that is only approved for 2 floors, violating structural regulations.",
    description_hi: "एक बिल्डर एक आवासीय कॉलोनी में चौथी मंजिल का निर्माण कर रहा है जो केवल 2 मंजिलों के लिए स्वीकृत है, जो संरचनात्मक नियमों का उल्लंघन है।",
    priority: "medium"
  },
  {
    category: "Illegal Construction",
    category_hi: "अवैध निर्माण",
    area: "Aliganj, Lucknow",
    title: "Commercial shop being built in public park area",
    title_hi: "सार्वजनिक पार्क क्षेत्र में बनाई जा रही व्यावसायिक दुकान",
    description: "Part of the public park boundary wall has been demolished to construct a commercial kiosk without permission from authorities.",
    description_hi: "अधिकारियों की अनुमति के बिना व्यावसायिक कियोस्क के निर्माण के लिए सार्वजनिक पार्क की सीमा की दीवार के हिस्से को ध्वस्त कर दिया गया है।",
    priority: "high"
  },
  {
    category: "Illegal Construction",
    category_hi: "अवैध निर्माण",
    area: "Hazratganj, Lucknow",
    title: "Illegal building extension blocking service lane",
    title_hi: "सेवा मार्ग को अवरुद्ध करने वाला अवैध भवन विस्तार",
    description: "A restaurant owner has constructed a permanent concrete extension that extends 5 feet into the narrow service lane, blocking traffic.",
    description_hi: "एक रेस्तरां मालिक ने एक स्थायी कंक्रीट विस्तार का निर्माण किया है जो संकीर्ण सेवा गली में 5 फीट तक फैला हुआ है, जिससे यातायात बाधित हो रहा है।",
    priority: "medium"
  },
  {
    category: "Illegal Construction",
    category_hi: "अवैध निर्माण",
    area: "Indira Nagar, Lucknow",
    title: "Basement excavation without safety retaining walls",
    title_hi: "सुरक्षा दीवारों के बिना बेसमेंट की खुदाई",
    description: "A deep basement is being excavated next to residential houses without retaining walls, risking structural collapse of neighboring properties.",
    description_hi: "आवासीय घरों के बगल में बिना रिटेनिंग दीवारों के एक गहरे बेसमेंट की खुदाई की जा रही है, जिससे पड़ोसी संपत्तियों के गिरने का खतरा है।",
    priority: "high"
  },
  {
    category: "Illegal Construction",
    category_hi: "अवैध निर्माण",
    area: "Aminabad, Lucknow",
    title: "Unlicensed temporary shops blocking emergency exit",
    title_hi: "आपातकालीन निकास को अवरुद्ध करने वाली बिना लाइसेंस की अस्थायी दुकानें",
    description: "Temporary steel structures are being constructed in the narrow fire access lane of the central market without approval.",
    description_hi: "बिना मंजूरी के केंद्रीय बाजार के संकीर्ण अग्नि पहुंच मार्ग में अस्थायी स्टील संरचनाओं का निर्माण किया जा रही है।",
    priority: "high"
  },

  // 7. Encroachment
  {
    category: "Encroachment",
    category_hi: "अतिक्रमण",
    area: "Hazratganj, Lucknow",
    title: "Footpath occupied by unauthorized street vendors",
    title_hi: "अनधिकृत रेहड़ी-पटरी वालों द्वारा कब्जा किया गया फुटपाथ",
    description: "The entire footpath along the main road is occupied by unauthorized stalls, forcing pedestrians to walk on the busy road asphalt.",
    description_hi: "मुख्य सड़क के किनारे पूरा फुटपाथ अनधिकृत स्टालों के कब्जे में है, जिससे राहगीर व्यस्त सड़क के डामर पर चलने को मजबूर हैं।",
    priority: "medium"
  },
  {
    category: "Encroachment",
    category_hi: "अतिक्रमण",
    area: "Gomti Nagar, Lucknow",
    title: "Commercial vehicle display blocking public sidewalk",
    title_hi: "सार्वजनिक फुटपाथ को अवरुद्ध करने वाला व्यावसायिक वाहन प्रदर्शन",
    description: "A showroom is displaying cars and heavy equipment directly on the public sidewalk, completely blocking pedestrian access.",
    description_hi: "एक शोरूम सार्वजनिक फुटपाथ पर सीधे कारों और भारी उपकरणों का प्रदर्शन कर रहा है, जिससे पैदल यात्रियों की पहुंच पूरी तरह से अवरुद्ध हो गई है।",
    priority: "low"
  },
  {
    category: "Encroachment",
    category_hi: "अतिक्रमण",
    area: "Aliganj, Lucknow",
    title: "Illegal private parking lot on vacant public plot",
    title_hi: "खाली पड़े सार्वजनिक भूखंड पर अवैध निजी पार्किंग स्थल",
    description: "A private agent has set up ropes and is charging unauthorized parking fees on a vacant government-owned plot near Kapoorthala.",
    description_hi: "एक निजी एजेंट ने रस्सियाँ स्थापित कर ली हैं और कपूरथला के पास एक खाली सरकारी भूखंड पर अनधिकृत पार्किंग शुल्क वसूल कर रहा है।",
    priority: "low"
  },
  {
    category: "Encroachment",
    category_hi: "अतिक्रमण",
    area: "Indira Nagar, Lucknow",
    title: "Permanent ramps built over open drain covers",
    title_hi: "खुले नाले के ढक्कनों पर बने स्थायी रैंप",
    description: "Shop owners have constructed high concrete ramps extending over the public drains, preventing cleaning access by sanitation workers.",
    description_hi: "दुकान मालिकों ने सार्वजनिक नालों के ऊपर ऊंचे कंक्रीट के रैंप बना लिए हैं, जिससे सफाई कर्मचारियों को सफाई करने से रोका जा रहा है।",
    priority: "medium"
  },
  {
    category: "Encroachment",
    category_hi: "अतिक्रमण",
    area: "Aminabad, Lucknow",
    title: "Hawkers permanently blocking main market crossing",
    title_hi: "मुख्य बाजार चौराहे को स्थायी रूप से अवरुद्ध करने वाले फेरीवाले",
    description: "Illegal cart vendors are permanently stationed at the junction, causing severe traffic jams and blocking ambulance movement during peak hours.",
    description_hi: "अवैध ठेला विक्रेता स्थायी रूप से जंक्शन पर तैनात हैं, जिससे भारी ट्रैफिक जाम हो रहा है और व्यस्त घंटों के दौरान एम्बुलेंस की आवाजाही अवरुद्ध हो रही है।",
    priority: "high"
  },

  // 8. Corruption
  {
    category: "Corruption",
    category_hi: "भ्रष्टाचार / रिश्वत",
    area: "Hazratganj, Lucknow",
    title: "Bribe demanded for birth certificate verification",
    title_hi: "जन्म प्रमाण पत्र सत्यापन के लिए रिश्वत की मांग",
    description: "An official at the local ward desk is demanding a bribe of 2000 INR to process and verify the submitted birth certificate document.",
    description_hi: "स्थानीय वार्ड डेस्क के एक अधिकारी ने प्रस्तुत जन्म प्रमाण पत्र दस्तावेज को संसाधित करने और सत्यापित करने के लिए 2000 रुपये की रिश्वत की मांग की है।",
    priority: "medium"
  },
  {
    category: "Corruption",
    category_hi: "भ्रष्टाचार / रिश्वत",
    area: "Gomti Nagar, Lucknow",
    title: "Favored allocation of commercial cart licenses",
    title_hi: "व्यावसायिक कार्ट लाइसेंस का पसंदीदा आवंटन",
    description: "Local supervisor is allegedly taking cash bribes under-the-table to allocate prime street vendor spots to select unauthorized hawkers.",
    description_hi: "स्थानीय पर्यवेक्षक कथित तौर पर चुनिंदा अनधिकृत फेरीवालों को प्रमुख स्ट्रीट वेंडर स्पॉट आवंटित करने के लिए नकद रिश्वत ले रहे हैं।",
    priority: "medium"
  },
  {
    category: "Corruption",
    category_hi: "भ्रष्टाचार / रिश्वत",
    area: "Aliganj, Lucknow",
    title: "Ransom demand for releasing seized shop tools",
    title_hi: "जब्त किए गए दुकान के उपकरण छोड़ने के लिए रिश्वत की मांग",
    description: "Municipal squad demanded cash without invoice to return display tables and tools seized during the routine clearance drive.",
    description_hi: "नगर निगम के दस्ते ने नियमित निकासी अभियान के दौरान जब्त किए गए डिस्प्ले टेबल और उपकरण वापस करने के लिए बिना चालान के नकद की मांग की।",
    priority: "high"
  },
  {
    category: "Corruption",
    category_hi: "भ्रष्टाचार / रिश्वत",
    area: "Indira Nagar, Lucknow",
    title: "Corruption in sewer pipeline quality inspection",
    title_hi: "सीवर पाइपलाइन गुणवत्ता निरीक्षण में भ्रष्टाचार",
    description: "Contractor is using inferior quality clay pipes, and municipal inspectors are allegedly bribed to sign off on completion certificates.",
    description_hi: "ठेकेदार घटिया गुणवत्ता वाले मिट्टी के पाइप का उपयोग कर रहा है, और नगर निगम निरीक्षकों को कथित तौर पर पूर्णता प्रमाणपत्रों पर हस्ताक्षर करने के लिए रिश्वत दी जाती है।",
    priority: "high"
  },
  {
    category: "Corruption",
    category_hi: "भ्रष्टाचार / रिश्वत",
    area: "Aminabad, Lucknow",
    title: "Bribe requested for trade license renewal",
    title_hi: "व्यापार लाइसेंस नवीनीकरण के लिए रिश्वत का अनुरोध",
    description: "Clerks are intentionally delaying the trade license renewal requests of shop owners until an illegal payment is made.",
    description_hi: "लिपिक जानबूझकर दुकान मालिकों के व्यापार लाइसेंस नवीनीकरण अनुरोधों में देरी कर रहे हैं जब तक कि एक अवैध भुगतान नहीं किया जाता है।",
    priority: "medium"
  },

  // 9. Public Health
  {
    category: "Public Health",
    category_hi: "जन स्वास्थ्य",
    area: "Aliganj, Lucknow",
    title: "Dengue breeding site at abandoned builder plot",
    title_hi: "परित्यक्त बिल्डर भूखंड पर डेंगू प्रजनन स्थल",
    description: "Rainwater has accumulated in a large open foundation hole for months, creating a mosquito breeding ground. Multiple dengue cases reported.",
    description_hi: "महीनों से एक बड़े खुले फाउंडेशन के गड्ढे में बारिश का पानी जमा हो गया है, जिससे मच्छरों के पनपने की जगह बन गई है। कई डेंगू मामलों की सूचना मिली है।",
    priority: "high"
  },
  {
    category: "Public Health",
    category_hi: "जन स्वास्थ्य",
    area: "Gomti Nagar, Lucknow",
    title: "Medical waste dumped behind community clinic",
    title_hi: "सामुदायिक क्लिनिक के पीछे फेंका गया चिकित्सा कचरा",
    description: "Used syringes, cotton swabs, and expired medicine bottles are dumped in an open general bin outside, easily accessible to street dogs.",
    description_hi: "इस्तेमाल की गई सीरिंज, कॉटन स्वैब और एक्सपायर्ड दवा की बोतलें बाहर एक खुले सामान्य डिब्बे में फेंक दी जाती हैं, जो आवारा कुत्तों के लिए आसानी से सुलभ हैं।",
    priority: "high"
  },
  {
    category: "Public Health",
    category_hi: "जन स्वास्थ्य",
    area: "Hazratganj, Lucknow",
    title: "Unhygienic food preparation at street stalls",
    title_hi: "सड़क के स्टालों पर अस्वास्थ्यकर भोजन तैयार करना",
    description: "Vendors near the market are preparing food using stagnant tap water and raw ingredients exposed to heavy road dust and flies.",
    description_hi: "बाजार के पास विक्रेता स्थिर नल के पानी और भारी सड़क की धूल और मक्खियों के संपर्क में आने वाली कच्ची सामग्री का उपयोग करके भोजन तैयार कर रहे हैं।",
    priority: "medium"
  },
  {
    category: "Public Health",
    category_hi: "जन स्वास्थ्य",
    area: "Indira Nagar, Lucknow",
    title: "Stagnant sewage water in Sector D residential lane",
    title_hi: "सेक्टर डी आवासीय गली में स्थिर सीवेज का पानी",
    description: "A broken sewer pipe has flooded the residential lane, creating an extremely unhygienic environment with severe foul odor.",
    description_hi: "टूटी हुई सीवर लाइन ने आवासीय गली में पानी भर दिया है, जिससे तीव्र दुर्गंध के साथ एक अत्यंत अस्वास्थ्यकर वातावरण बन गया है।",
    priority: "high"
  },
  {
    category: "Public Health",
    category_hi: "जन स्वास्थ्य",
    area: "Aminabad, Lucknow",
    title: "Lack of public toilet cleaning and sanitization",
    title_hi: "सार्वजनिक शौचालय की सफाई और स्वच्छता का अभाव",
    description: "The main community toilet is in a completely blocked, unusable state with no running water, creating a major public health hazard.",
    description_hi: "मुख्य सामुदायिक शौचालय पूरी तरह से अवरुद्ध, अनुपयोगी स्थिति में है और बहता पानी नहीं है, जिससे सार्वजनिक स्वास्थ्य के लिए एक बड़ा खतरा पैदा हो गया है।",
    priority: "medium"
  }
];

// Seed function
async function runSeed() {
  console.log("Starting batch import of 45 mock complaints...");
  
  // Get base count to avoid ID overlaps
  const { count } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
  const startNum = (count || 0) + 1;
  console.log(`Current DB complaints count: ${count}. Next index will be: ${startNum}`);
  
  const toInsert = [];
  const updatesToInsert = [];
  
  const statuses = ["submitted", "department_assigned", "officer_reviewing", "resolved"];

  for (let i = 0; i < rawComplaints.length; i++) {
    const raw = rawComplaints[i];
    const indexStr = String(startNum + i).padStart(3, "0");
    const uniqueId = `JM-2026-${indexStr}-${Math.floor(100 + Math.random() * 900)}`;
    const dept = getDeptDetails(raw.category);
    const coords = areaCoords[raw.area] || { lat: 26.8467, lng: 80.9462 };
    
    // Assign status sequentially to maintain a nice spread
    const status = statuses[i % statuses.length];
    
    // Slight random variation in AI confidence
    const aiConfidence = parseFloat((0.80 + Math.random() * 0.19).toFixed(2));
    
    // Trust score is linked to confidence, but add fraud profiles for Corruption/Construction
    let trustLevel = "high";
    let spamProbability = parseFloat((Math.random() * 0.05).toFixed(2));
    
    if (raw.category === "Corruption" || raw.category === "Illegal Construction") {
      // Create some suspicious ones (medium or low trust)
      const rand = Math.random();
      if (rand < 0.4) {
        trustLevel = "low";
        spamProbability = parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
      } else if (rand < 0.7) {
        trustLevel = "medium";
        spamProbability = parseFloat((0.35 + Math.random() * 0.25).toFixed(2));
      }
    }
    
    const trustAnalysis = {
      trustLevel: trustLevel,
      spamProbability: spamProbability,
      reviewedByOfficer: false,
      officerVerdict: null
    };

    const row = {
      id: uniqueId,
      title: raw.title,
      title_hi: raw.title_hi,
      description: raw.description,
      description_hi: raw.description_hi,
      category: raw.category,
      category_hi: raw.category_hi,
      priority: raw.priority,
      status: status,
      department_id: dept.id,
      latitude: coords.lat + (Math.random() - 0.5) * 0.005, // minor scatter
      longitude: coords.lng + (Math.random() - 0.5) * 0.005,
      area: raw.area,
      citizen_id: `user-${10 + (i % 25)}`,
      citizen_name: ["Abhishek Mishra", "Rajesh Pandey", "Sunita Rao", "Fatima Zaidi", "Karan Johar", "Vikram Rathore", "Divya Joshi", "Mohd Sajid", "Pradeep Sen", "Pooja Vashisht"][i % 10],
      citizen_phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      image_url: categoryImages[raw.category],
      ai_summary: `AI auto-summary for ${raw.title.toLowerCase()} in ${raw.area.split(",")[0]}.`,
      ai_summary_hi: `${raw.area.split(",")[0]} में ${raw.title_hi} का स्व-निर्मित सारांश।`,
      ai_confidence: aiConfidence,
      trust_analysis: trustAnalysis,
      trust_score: parseFloat((1 - spamProbability).toFixed(2)),
      escalation_level: 0,
      assigned_officer: dept.officer
    };
    
    toInsert.push(row);
    
    // Timeline updates
    updatesToInsert.push({
      complaint_id: uniqueId,
      status: "submitted",
      message: "Complaint submitted successfully by citizen.",
      message_hi: "नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।"
    });
    
    if (status !== "submitted") {
      updatesToInsert.push({
        complaint_id: uniqueId,
        status: "department_assigned",
        message: `Routed to ${dept.id === "nagar-nigam" ? "Lucknow Nagar Nigam" : dept.id.toUpperCase()} automatically.`,
        message_hi: `स्वचालित रूप से विभाग को आवंटित।`
      });
    }
    
    if (status === "officer_reviewing" || status === "resolved") {
      updatesToInsert.push({
        complaint_id: uniqueId,
        status: "officer_reviewing",
        message: `Officer ${dept.officer} has begun reviewing the grievance.`,
        message_hi: `अधिकारी ${dept.officer} ने शिकायत की समीक्षा शुरू कर दी है।`
      });
    }
    
    if (status === "resolved") {
      updatesToInsert.push({
        complaint_id: uniqueId,
        status: "resolved",
        message: "Issue resolved completely. Resolution verified by department.",
        message_hi: "समस्या का पूर्ण निवारण हो चुका है। विभाग द्वारा निवारण की पुष्टि की गई है।"
      });
    }
  }

  // Insert complaints in batch
  const { data: cData, error: cErr } = await supabase
    .from('complaints')
    .insert(toInsert)
    .select();
    
  if (cErr) {
    console.error("Error inserting complaints:", cErr.message);
    return;
  }
  
  console.log(`Inserted ${cData.length} complaints into the DB.`);
  
  // Insert updates
  const { data: uData, error: uErr } = await supabase
    .from('complaint_updates')
    .insert(updatesToInsert)
    .select();
    
  if (uErr) {
    console.error("Error inserting complaint updates:", uErr.message);
    return;
  }
  
  console.log(`Inserted ${uData.length} timeline updates into the DB.`);
  console.log("Seeding finished successfully!");
}

runSeed().catch(console.error);
