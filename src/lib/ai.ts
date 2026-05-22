// ============================================
// JanMitra AI — AI Classification Engine (English)
// ============================================
// Uses keyword-based classifier with optional Gemini API integration

import { AIClassification, Priority } from "@/types";
import { categories, getDepartmentById } from "@/data/departments";

// Keyword-based classifier (works without any API key)
export function classifyComplaint(text: string): AIClassification {
  const lowerText = text.toLowerCase();

  // Score each category
  let bestCategory = categories[0];
  let bestScore = 0;

  for (const cat of categories) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (lowerText.includes(kw)) score += 2;
    }
    for (const kw of cat.keywordsHi) {
      if (text.includes(kw) || lowerText.includes(kw)) score += 3; // Higher weight for Hindi keywords if entered
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  const department = getDepartmentById(bestCategory.departmentId);
  const priority = detectPriority(text);
  const urgency = detectUrgency(text, priority);
  const confidence = Math.min(0.65 + bestScore * 0.05, 0.98);

  const englishSummary = generateSummary(text, bestCategory.name, department?.name || "General Administration");
  const hindiSummary = generateSummaryHi(text, bestCategory.id, department?.nameHi || "सामान्य प्रशासन");

  return {
    category: bestCategory.name,
    categoryHi: bestCategory.nameHi,
    priority,
    urgency,
    department: department?.name || "General Administration",
    departmentHi: department?.nameHi || "सामान्य प्रशासन",
    summary: englishSummary,
    summaryHi: hindiSummary,
    confidence,
    fraudRisk: detectFraudRisk(text),
    predictedResolutionDays: department?.avgResolutionDays || 5,
  };
}

function detectPriority(text: string): Priority {
  const highKeywords = [
    "emergency", "urgent", "danger", "death", "accident", "fire", "flood",
    "collapse", "sparking", "broken", "health", "children", "hospital",
    "खतरनाक", "आपातकालीन", "तत्काल", "मौत", "दुर्घटना", "आग", "बाढ़",
    "चिंगारी", "बच्चे", "अस्पताल", "टूटी", "बहुत", "खतरा", "गंभीर",
    "उफन", "भर गया", "बहुत बड़ा",
  ];

  const mediumKeywords = [
    "problem", "issue", "complaint", "broken", "not working", "delay",
    "समस्या", "शिकायत", "खराब", "नहीं", "परेशान", "दिनों से",
  ];

  const lowerText = text.toLowerCase();

  for (const kw of highKeywords) {
    if (lowerText.includes(kw) || text.includes(kw)) return "high";
  }

  for (const kw of mediumKeywords) {
    if (lowerText.includes(kw) || text.includes(kw)) return "medium";
  }

  return "low";
}

function detectUrgency(text: string, priority: Priority): string {
  if (priority === "high") return "Requires immediate attention";
  if (priority === "medium") return "Should be addressed within 48 hours";
  return "Standard processing timeline";
}

function detectFraudRisk(text: string): number {
  // Simple heuristic fraud detection
  const suspiciousPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /test|testing|demo/i, // Test submissions
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) return 0.7;
  }

  if (text.length < 10) return 0.5;
  return 0.05;
}

function generateSummary(text: string, category: string, department: string): string {
  const summaries: Record<string, string> = {
    "Garbage / Sanitation": `Sanitation complaint reported. Garbage collection failure requiring immediate attention from ${department}. Citizens report health and hygiene concerns in the affected area.`,
    "Water Supply": `Water supply disruption reported. Citizens facing water shortage requiring pipeline inspection and emergency water supply deployment by ${department}.`,
    "Road Damage": `Road damage complaint with safety hazard. Potholes and broken road surface causing vehicle damage. Requires urgent repair by ${department}.`,
    "Electricity": `Electrical infrastructure issue reported. Power supply problem requiring immediate technical inspection by ${department} for public safety.`,
    "Street Light": `Street lighting failure reported. Dark areas creating safety concerns at night. Requires electrical inspection and lamp replacement by ${department}.`,
    "Illegal Construction": `Unauthorized construction activity reported. Requires site inspection and legal compliance verification by ${department}.`,
    "Encroachment": `Public space encroachment reported. Unauthorized occupation of government/public land requiring enforcement action by ${department}.`,
    "Corruption": `Corruption complaint filed. Alleged misconduct by public official requiring investigation by ${department}.`,
    "Public Health": `Public health concern reported. Potential health hazard requiring medical team inspection by ${department}.`,
  };

  return summaries[category] || `Citizen complaint categorized under ${category}. Assigned to ${department} for review and action.`;
}

function generateSummaryHi(text: string, categoryId: string, departmentHi: string): string {
  const summariesHi: Record<string, string> = {
    "garbage": `सफाई एवं स्वच्छता से संबंधित शिकायत। कचरा संग्रहण की विफलता के कारण तत्काल ${departmentHi} का हस्तक्षेप आवश्यक है। क्षेत्र के नागरिकों ने स्वास्थ्य और स्वच्छता के खतरों की सूचना दी है।`,
    "water-supply": `पानी की आपूर्ति में व्यवधान की शिकायत। नागरिकों को पानी की तीव्र कमी का सामना करना पड़ रहा है, जिसके लिए ${departmentHi} द्वारा तत्काल पाइपलाइन निरीक्षण और आपातकालीन वाटर टैंकर की आवश्यकता है।`,
    "road-damage": `सड़क क्षति और गड्ढों के कारण सुरक्षा का खतरा। सड़क पर बड़े गड्ढों से वाहनों को नुकसान हो रहा है। ${departmentHi} द्वारा इसे जल्द से जल्द ठीक करने की आवश्यकता है।`,
    "electricity": `विद्युत बुनियादी ढांचे से संबंधित समस्या। नागरिकों की सुरक्षा हेतु ${departmentHi} द्वारा तत्काल तकनीकी निरीक्षण और बिजली बहाल करने की आवश्यकता है।`,
    "street-light": `स्ट्रीट लाइट खराब होने की शिकायत। रात में अत्यधिक अंधेरा होने के कारण सुरक्षा की चिंता बनी हुई है। ${departmentHi} द्वारा विद्युत निरीक्षण और बल्ब बदलने की आवश्यकता है।`,
    "illegal-construction": `अनाधिकृत निर्माण की शिकायत। ${departmentHi} द्वारा स्थल निरीक्षण और कानूनी अनुपालन की जांच आवश्यक है।`,
    "encroachment": `सार्वजनिक भूमि पर अवैध अतिक्रमण। ${departmentHi} द्वारा तत्काल अतिक्रमण हटाने की कार्रवाई की आवश्यकता है।`,
    "corruption": `भ्रष्टाचार और रिश्वतखोरी से संबंधित गंभीर शिकायत। ${departmentHi} द्वारा मामले की त्वरित जांच की आवश्यकता है।`,
    "health": `जन स्वास्थ्य संबंधी गंभीर समस्या। ${departmentHi} के चिकित्सा दल द्वारा स्थल निरीक्षण और त्वरित कार्रवाई की आवश्यकता है।`,
  };

  return summariesHi[categoryId] || `नागरिक द्वारा दर्ज शिकायत (${categoryId})। आवश्यक कार्रवाई हेतु इसे ${departmentHi} को अग्रेषित किया गया है।`;
}

// Simulate AI processing delay for demo effect
export function simulateAIProcessing(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 2500));
}
