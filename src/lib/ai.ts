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
      if (text.includes(kw)) score += 3; // Higher weight for Hindi keywords if entered
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

  return {
    category: bestCategory.name,
    categoryHi: bestCategory.name, // Make identical to avoid Hindi in UI
    priority,
    urgency,
    department: department?.name || "General Administration",
    departmentHi: department?.name || "General Administration",
    summary: englishSummary,
    summaryHi: englishSummary, // Make identical to avoid Hindi in UI
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

// Simulate AI processing delay for demo effect
export function simulateAIProcessing(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 2500));
}
