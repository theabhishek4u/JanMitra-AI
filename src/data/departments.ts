// ============================================
// JanMitra AI — Department Registry & Routing (English)
// ============================================

import { Department, ComplaintCategory } from "@/types";

export const departments: Department[] = [
  {
    id: "nagar-nigam",
    name: "Lucknow Nagar Nigam",
    nameHi: "Lucknow Nagar Nigam",
    officerName: "Shri Rajesh Kumar",
    officerTitle: "Municipal Commissioner",
    avgResolutionDays: 3,
    activeComplaints: 47,
    icon: "Building2",
  },
  {
    id: "jal-nigam",
    name: "Jal Nigam",
    nameHi: "Jal Nigam",
    officerName: "Smt. Priya Sharma",
    officerTitle: "Chief Engineer",
    avgResolutionDays: 5,
    activeComplaints: 32,
    icon: "Droplets",
  },
  {
    id: "pwd",
    name: "Public Works Department",
    nameHi: "Public Works Department",
    officerName: "Shri Amit Verma",
    officerTitle: "Executive Engineer",
    avgResolutionDays: 7,
    activeComplaints: 58,
    icon: "HardHat",
  },
  {
    id: "power-dept",
    name: "Power Department (UPPCL)",
    nameHi: "Power Department (UPPCL)",
    officerName: "Shri Vikram Singh",
    officerTitle: "Superintending Engineer",
    avgResolutionDays: 2,
    activeComplaints: 23,
    icon: "Zap",
  },
  {
    id: "municipal-authority",
    name: "Municipal Authority",
    nameHi: "Municipal Authority",
    officerName: "Shri Deepak Gupta",
    officerTitle: "District Magistrate",
    avgResolutionDays: 10,
    activeComplaints: 15,
    icon: "Landmark",
  },
  {
    id: "anti-corruption",
    name: "Anti-Corruption Bureau",
    nameHi: "Anti-Corruption Bureau",
    officerName: "Shri Arvind Mishra",
    officerTitle: "SP Anti-Corruption",
    avgResolutionDays: 14,
    activeComplaints: 8,
    icon: "Shield",
  },
  {
    id: "lmc",
    name: "Lucknow Municipal Corporation",
    nameHi: "Lucknow Municipal Corporation",
    officerName: "Smt. Neha Tripathi",
    officerTitle: "Ward Commissioner",
    avgResolutionDays: 4,
    activeComplaints: 39,
    icon: "Lightbulb",
  },
  {
    id: "health-dept",
    name: "Health Department",
    nameHi: "Health Department",
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
    nameHi: "Garbage / Sanitation",
    icon: "Trash2",
    departmentId: "nagar-nigam",
    keywords: ["garbage", "waste", "trash", "dump", "sanitation", "dirty", "cleaning", "sweeping", "dustbin"],
    keywordsHi: ["garbage", "waste", "trash", "dump", "sanitation", "dirty", "cleaning", "sweeping", "dustbin"],
  },
  {
    id: "water-supply",
    name: "Water Supply",
    nameHi: "Water Supply",
    icon: "Droplets",
    departmentId: "jal-nigam",
    keywords: ["water", "supply", "leakage", "pipeline", "bore", "tanker", "drinking", "tap", "sewage", "drain"],
    keywordsHi: ["water", "supply", "leakage", "pipeline", "bore", "tanker", "drinking", "tap", "sewage", "drain"],
  },
  {
    id: "road-damage",
    name: "Road Damage",
    nameHi: "Road Damage",
    icon: "Construction",
    departmentId: "pwd",
    keywords: ["road", "pothole", "broken", "damage", "crack", "highway", "bridge", "footpath"],
    keywordsHi: ["road", "pothole", "broken", "damage", "crack", "highway", "bridge", "footpath"],
  },
  {
    id: "electricity",
    name: "Electricity",
    nameHi: "Electricity",
    icon: "Zap",
    departmentId: "power-dept",
    keywords: ["electricity", "power", "light", "transformer", "wire", "bill", "meter", "outage", "voltage"],
    keywordsHi: ["electricity", "power", "light", "transformer", "wire", "bill", "meter", "outage", "voltage"],
  },
  {
    id: "street-light",
    name: "Street Light",
    nameHi: "Street Light",
    icon: "Lightbulb",
    departmentId: "lmc",
    keywords: ["street", "light", "lamp", "pole", "dark", "night"],
    keywordsHi: ["street", "light", "lamp", "pole", "dark", "night"],
  },
  {
    id: "illegal-construction",
    name: "Illegal Construction",
    nameHi: "Illegal Construction",
    icon: "AlertTriangle",
    departmentId: "municipal-authority",
    keywords: ["illegal", "construction", "building", "unauthorized", "encroachment", "violation"],
    keywordsHi: ["illegal", "construction", "building", "unauthorized", "encroachment", "violation"],
  },
  {
    id: "encroachment",
    name: "Encroachment",
    nameHi: "Encroachment",
    icon: "Ban",
    departmentId: "municipal-authority",
    keywords: ["encroachment", "illegal", "occupy", "land", "grab", "footpath", "sidewalk"],
    keywordsHi: ["encroachment", "illegal", "occupy", "land", "grab", "footpath", "sidewalk"],
  },
  {
    id: "corruption",
    name: "Corruption",
    nameHi: "Corruption",
    icon: "ShieldAlert",
    departmentId: "anti-corruption",
    keywords: ["corruption", "bribe", "fraud", "scam", "misuse", "nepotism"],
    keywordsHi: ["corruption", "bribe", "fraud", "scam", "misuse", "nepotism"],
  },
  {
    id: "health",
    name: "Public Health",
    nameHi: "Public Health",
    icon: "Heart",
    departmentId: "health-dept",
    keywords: ["health", "hospital", "clinic", "doctor", "medicine", "disease", "epidemic"],
    keywordsHi: ["health", "hospital", "clinic", "doctor", "medicine", "disease", "epidemic"],
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
