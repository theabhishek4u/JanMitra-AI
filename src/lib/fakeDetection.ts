// ============================================
// JanMitra AI — Fake Complaint Detection Engine
// ============================================
// AI-powered heuristic analysis to detect suspicious, duplicate,
// spam, or potentially fake complaints. Never blocks — only flags.

import type { Complaint, ComplaintTrustAnalysis, FlagReason, TrustLevel } from "@/types";

// ============================================
// 1. Text Similarity (Jaccard Index)
// ============================================
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, "") // Keep Latin + Devanagari
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

export function computeTextSimilarity(text1: string, text2: string): number {
  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ============================================
// 2. Duplicate Complaint Detection
// ============================================
export function detectDuplicateComplaint(
  complaint: Partial<Complaint>,
  allComplaints: Complaint[]
): { flagged: boolean; reason: string; matchId?: string } {
  const citizenId = complaint.citizenId;
  const text = complaint.description || complaint.title || "";
  const category = complaint.category || "";

  if (!citizenId || !text) return { flagged: false, reason: "" };

  // Check complaints from the same citizen in the same category
  const sameCitizenComplaints = allComplaints.filter(
    (c) =>
      c.citizenId === citizenId &&
      c.category === category &&
      c.status !== "resolved"
  );

  for (const existing of sameCitizenComplaints) {
    const similarity = computeTextSimilarity(text, existing.description);
    if (similarity > 0.55) {
      return {
        flagged: true,
        reason: `Duplicate complaint suspected — ${Math.round(similarity * 100)}% text similarity with complaint ${existing.id}`,
        matchId: existing.id,
      };
    }
  }

  return { flagged: false, reason: "" };
}

// ============================================
// 3. Rapid Submission Detection
// ============================================
export function detectRapidSubmission(
  complaint: Partial<Complaint>,
  allComplaints: Complaint[]
): { flagged: boolean; reason: string; count: number } {
  const citizenId = complaint.citizenId;
  if (!citizenId) return { flagged: false, reason: "", count: 0 };

  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

  const recentFromSameCitizen = allComplaints.filter(
    (c) =>
      c.citizenId === citizenId &&
      new Date(c.createdAt) >= thirtyMinAgo
  );

  if (recentFromSameCitizen.length >= 3) {
    return {
      flagged: true,
      reason: `Repeated complaint submission detected — ${recentFromSameCitizen.length} complaints filed within 30 minutes`,
      count: recentFromSameCitizen.length,
    };
  }

  return { flagged: false, reason: "", count: recentFromSameCitizen.length };
}

// ============================================
// 4. Spam Text Detection
// ============================================
export function detectSpamText(text: string): { flagged: boolean; reason: string } {
  if (!text || text.trim().length === 0) {
    return { flagged: true, reason: "Potential spam detected — empty complaint text" };
  }

  // Very short text
  if (text.trim().length < 15) {
    return { flagged: true, reason: "Potential spam detected — complaint text is too short to be meaningful" };
  }

  // Repeated characters (e.g., aaaaaa, 111111)
  if (/(.)\1{8,}/.test(text)) {
    return { flagged: true, reason: "Potential spam detected — repetitive character patterns found" };
  }

  // All caps (for texts > 20 chars)
  if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return { flagged: true, reason: "Potential spam detected — entire text in uppercase" };
  }

  // Known test/spam phrases
  const spamPhrases = [
    /^test\b/i,
    /^testing\b/i,
    /^asdf/i,
    /^qwerty/i,
    /^hello+$/i,
    /^demo\b/i,
    /^sample/i,
    /^abc\s*$/i,
    /^123\s*$/i,
    /^xxx/i,
    /^aaa/i,
    /^lorem ipsum/i,
    /^placeholder/i,
  ];

  for (const pattern of spamPhrases) {
    if (pattern.test(text.trim())) {
      return { flagged: true, reason: "Potential spam detected — known test/placeholder text detected" };
    }
  }

  // Excessive special characters (>40% non-alphanumeric in non-Devanagari text)
  const alphanumeric = text.replace(/[\s\u0900-\u097F]/g, "");
  const specialCount = alphanumeric.replace(/[a-zA-Z0-9]/g, "").length;
  if (alphanumeric.length > 10 && specialCount / alphanumeric.length > 0.4) {
    return { flagged: true, reason: "Potential spam detected — excessive special characters" };
  }

  // Random gibberish: very low vowel ratio in latin text
  const latinOnly = text.replace(/[^a-zA-Z]/g, "");
  if (latinOnly.length > 15) {
    const vowels = latinOnly.replace(/[^aeiouAEIOU]/g, "").length;
    if (vowels / latinOnly.length < 0.15) {
      return { flagged: true, reason: "Potential spam detected — text appears to be random gibberish" };
    }
  }

  return { flagged: false, reason: "" };
}

// ============================================
// 5. Low Confidence Detection
// ============================================
export function detectLowConfidence(
  aiConfidence: number
): { flagged: boolean; reason: string } {
  if (aiConfidence < 0.60) {
    return {
      flagged: true,
      reason: `Suspicious or low-confidence complaint — AI confidence score is only ${Math.round(aiConfidence * 100)}%`,
    };
  }
  return { flagged: false, reason: "" };
}

// ============================================
// 6. Abusive / Irrelevant Content Detection
// ============================================
export function detectAbusiveContent(text: string): { flagged: boolean; reason: string } {
  const lowerText = text.toLowerCase();

  // English abusive/irrelevant keywords
  const abuseKeywords = [
    "stupid government",
    "waste of time",
    "you are useless",
    "bloody hell",
    "go to hell",
    "nonsense",
    "fraud government",
    "total waste",
    "scam portal",
    "fake portal",
    "hate you",
    "shut down",
  ];

  // Hindi abusive keywords
  const abuseKeywordsHi = [
    "बेवकूफ",
    "निकम्मे",
    "चोर सरकार",
    "बेकार",
    "धोखा",
    "पागल",
  ];

  for (const kw of abuseKeywords) {
    if (lowerText.includes(kw)) {
      return { flagged: true, reason: "Abuse or irrelevant content detected — complaint contains abusive language" };
    }
  }

  for (const kw of abuseKeywordsHi) {
    if (text.includes(kw)) {
      return { flagged: true, reason: "Abuse or irrelevant content detected — complaint contains abusive language (Hindi)" };
    }
  }

  return { flagged: false, reason: "" };
}

// ============================================
// 7. Master Orchestrator — Full Trust Analysis
// ============================================
export function analyzeComplaintTrust(
  complaint: Partial<Complaint>,
  allComplaints: Complaint[]
): ComplaintTrustAnalysis {
  const flags: FlagReason[] = [];
  const reasons: string[] = [];
  let penaltyScore = 0; // Accumulate penalties, subtract from 100

  const text = complaint.description || complaint.title || "";

  // --- Run all detectors ---

  // 1. Duplicate check
  const dupResult = detectDuplicateComplaint(complaint, allComplaints);
  if (dupResult.flagged) {
    flags.push("duplicate");
    reasons.push(dupResult.reason);
    penaltyScore += 30;
  }

  // 2. Rapid submission check
  const rapidResult = detectRapidSubmission(complaint, allComplaints);
  if (rapidResult.flagged) {
    flags.push("rapid_submission");
    reasons.push(rapidResult.reason);
    penaltyScore += 25;
  }

  // 3. Spam text check
  const spamResult = detectSpamText(text);
  if (spamResult.flagged) {
    flags.push("spam_text");
    reasons.push(spamResult.reason);
    penaltyScore += 35;
  }

  // 4. Low confidence check
  const confidenceResult = detectLowConfidence(complaint.aiConfidence || 0.90);
  if (confidenceResult.flagged) {
    flags.push("low_confidence");
    reasons.push(confidenceResult.reason);
    penaltyScore += 20;
  }

  // 5. Abusive content check
  const abuseResult = detectAbusiveContent(text);
  if (abuseResult.flagged) {
    flags.push("abuse_irrelevant");
    reasons.push(abuseResult.reason);
    penaltyScore += 25;
  }

  // 6. Text similarity check against all recent complaints (not just same citizen)
  const recentComplaints = allComplaints
    .filter((c) => c.status !== "resolved")
    .slice(0, 20); // Limit for performance

  for (const existing of recentComplaints) {
    if (existing.citizenId === complaint.citizenId) continue; // Skip same citizen (handled by dup detector)
    const similarity = computeTextSimilarity(text, existing.description);
    if (similarity > 0.7) {
      if (!flags.includes("similar_text")) {
        flags.push("similar_text");
        reasons.push(
          `High text similarity detected — ${Math.round(similarity * 100)}% match with complaint ${existing.id} from another citizen`
        );
        penaltyScore += 15;
      }
      break;
    }
  }

  // --- Compute final trust score ---
  const trustScore = Math.max(0, Math.min(100, 100 - penaltyScore));

  let trustLevel: TrustLevel;
  if (trustScore >= 70) {
    trustLevel = "high";
  } else if (trustScore >= 40) {
    trustLevel = "medium";
  } else {
    trustLevel = "low";
  }

  return {
    trustLevel,
    trustScore,
    flags,
    reasons,
    analyzedAt: new Date().toISOString(),
    reviewedByOfficer: false,
  };
}
