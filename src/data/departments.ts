// ============================================
// JanMitra AI — Department Registry & Routing
// ============================================

import { Department, ComplaintCategory } from "@/types";

export const departments: Department[] = [
  {
    id: "nagar-nigam",
    name: "Lucknow Nagar Nigam",
    nameHi: "लखनऊ नगर निगम",
    officerName: "Shri Rajesh Kumar",
    officerTitle: "Municipal Commissioner",
    avgResolutionDays: 3,
    activeComplaints: 47,
    icon: "Building2",
  },
  {
    id: "jal-nigam",
    name: "Jal Nigam",
    nameHi: "जल निगम",
    officerName: "Smt. Priya Sharma",
    officerTitle: "Chief Engineer",
    avgResolutionDays: 5,
    activeComplaints: 32,
    icon: "Droplets",
  },
  {
    id: "pwd",
    name: "Public Works Department",
    nameHi: "लोक निर्माण विभाग",
    officerName: "Shri Amit Verma",
    officerTitle: "Executive Engineer",
    avgResolutionDays: 7,
    activeComplaints: 58,
    icon: "HardHat",
  },
  {
    id: "power-dept",
    name: "Power Department (UPPCL)",
    nameHi: "विद्युत विभाग",
    officerName: "Shri Vikram Singh",
    officerTitle: "Superintending Engineer",
    avgResolutionDays: 2,
    activeComplaints: 23,
    icon: "Zap",
  },
  {
    id: "municipal-authority",
    name: "Municipal Authority",
    nameHi: "नगरपालिका प्राधिकरण",
    officerName: "Shri Deepak Gupta",
    officerTitle: "District Magistrate",
    avgResolutionDays: 10,
    activeComplaints: 15,
    icon: "Landmark",
  },
  {
    id: "anti-corruption",
    name: "Anti-Corruption Bureau",
    nameHi: "भ्रष्टाचार निरोधक ब्यूरो",
    officerName: "Shri Arvind Mishra",
    officerTitle: "SP Anti-Corruption",
    avgResolutionDays: 14,
    activeComplaints: 8,
    icon: "Shield",
  },
  {
    id: "lmc",
    name: "Lucknow Municipal Corporation",
    nameHi: "लखनऊ नगर पालिका निगम",
    officerName: "Smt. Neha Tripathi",
    officerTitle: "Ward Commissioner",
    avgResolutionDays: 4,
    activeComplaints: 39,
    icon: "Lightbulb",
  },
  {
    id: "health-dept",
    name: "Health Department",
    nameHi: "स्वास्थ्य विभाग",
    officerName: "Dr. Sanjay Pandey",
    officerTitle: "Chief Medical Officer",
    avgResolutionDays: 3,
    activeComplaints: 12,
    icon: "Heart",
  },
];

export const categories: ComplaintCategory[] = [
  {
    id: "garbage",
    name: "Garbage / Sanitation",
    nameHi: "कूड़ा / स्वच्छता",
    icon: "Trash2",
    departmentId: "nagar-nigam",
    keywords: ["garbage", "waste", "trash", "dump", "sanitation", "dirty", "cleaning", "sweeping", "dustbin"],
    keywordsHi: ["कूड़ा", "कचरा", "गंदगी", "सफाई", "स्वच्छता", "डस्टबिन", "कूड़ेदान"],
  },
  {
    id: "water-supply",
    name: "Water Supply",
    nameHi: "जल आपूर्ति",
    icon: "Droplets",
    departmentId: "jal-nigam",
    keywords: ["water", "supply", "leakage", "pipeline", "bore", "tanker", "drinking", "tap", "sewage", "drain"],
    keywordsHi: ["पानी", "जल", "नल", "पाइपलाइन", "लीकेज", "सीवर", "नाला", "बोरिंग", "टैंकर"],
  },
  {
    id: "road-damage",
    name: "Road Damage",
    nameHi: "सड़क क्षति",
    icon: "Construction",
    departmentId: "pwd",
    keywords: ["road", "pothole", "broken", "damage", "crack", "highway", "bridge", "footpath"],
    keywordsHi: ["सड़क", "गड्ढा", "टूटी", "क्षतिग्रस्त", "दरार", "पुल", "फुटपाथ"],
  },
  {
    id: "electricity",
    name: "Electricity",
    nameHi: "बिजली",
    icon: "Zap",
    departmentId: "power-dept",
    keywords: ["electricity", "power", "light", "transformer", "wire", "bill", "meter", "outage", "voltage"],
    keywordsHi: ["बिजली", "विद्युत", "ट्रांसफार्मर", "तार", "बिल", "मीटर", "कटौती", "वोल्टेज"],
  },
  {
    id: "street-light",
    name: "Street Light",
    nameHi: "स्ट्रीट लाइट",
    icon: "Lightbulb",
    departmentId: "lmc",
    keywords: ["street", "light", "lamp", "pole", "dark", "night"],
    keywordsHi: ["स्ट्रीट", "लाइट", "लैंप", "खंभा", "अंधेरा", "रात"],
  },
  {
    id: "illegal-construction",
    name: "Illegal Construction",
    nameHi: "अवैध निर्माण",
    icon: "AlertTriangle",
    departmentId: "municipal-authority",
    keywords: ["illegal", "construction", "building", "unauthorized", "encroachment", "violation"],
    keywordsHi: ["अवैध", "निर्माण", "अतिक्रमण", "अनाधिकृत", "कब्जा"],
  },
  {
    id: "encroachment",
    name: "Encroachment",
    nameHi: "अतिक्रमण",
    icon: "Ban",
    departmentId: "municipal-authority",
    keywords: ["encroachment", "illegal", "occupy", "land", "grab", "footpath", "sidewalk"],
    keywordsHi: ["अतिक्रमण", "कब्जा", "भूमि", "फुटपाथ"],
  },
  {
    id: "corruption",
    name: "Corruption",
    nameHi: "भ्रष्टाचार",
    icon: "ShieldAlert",
    departmentId: "anti-corruption",
    keywords: ["corruption", "bribe", "fraud", "scam", "misuse", "nepotism"],
    keywordsHi: ["भ्रष्टाचार", "रिश्वत", "घोटाला", "धोखाधड़ी"],
  },
  {
    id: "health",
    name: "Public Health",
    nameHi: "जन स्वास्थ्य",
    icon: "Heart",
    departmentId: "health-dept",
    keywords: ["health", "hospital", "clinic", "doctor", "medicine", "disease", "epidemic"],
    keywordsHi: ["स्वास्थ्य", "अस्पताल", "क्लिनिक", "डॉक्टर", "दवा", "बीमारी", "महामारी"],
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}

export function getCategoryById(id: string): ComplaintCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function getDepartmentForCategory(categoryId: string): Department | undefined {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  return getDepartmentById(category.departmentId);
}
