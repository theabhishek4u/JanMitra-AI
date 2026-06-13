// ============================================
// JanMitra AI — Daily Complaint Token System
// ============================================
// Anti-spam token engine that limits citizen complaints to N/day
// with automatic 24-hour resets and AI emergency bypass.
// Persisted in localStorage, follows same pattern as complaints.ts.

import type { TokenState, TokenConsumeResult } from "@/types";

const TOKEN_KEY = "janmitra_token_system_v2";
const TOKEN_CONFIG_KEY = "janmitra_token_config";
const isClient = typeof window !== "undefined";

const DEFAULT_MAX_TOKENS = 3;

// ============================================
// Emergency Categories — Critical civic issues
// that bypass the token limit when detected
// ============================================
const EMERGENCY_KEYWORDS_EN = [
  "fire", "blaze", "burning", "flames",
  "water leakage", "water leak", "pipe burst", "pipeline burst", "flooding", "flood",
  "electrocution", "electric shock", "sparking", "live wire", "electrical danger", "short circuit",
  "health emergency", "epidemic", "cholera", "dengue", "medical emergency", "hospital",
  "public safety", "building collapse", "wall collapse", "bridge collapse", "accident", "death",
  "gas leak", "toxic", "poisoning",
];

const EMERGENCY_KEYWORDS_HI = [
  "आग", "ज्वाला", "जल रहा",
  "पाइपलाइन लीक", "पानी लीक", "पाइप फट", "बाढ़", "जलभराव",
  "बिजली का झटका", "चिंगारी", "खुले तार", "बिजली का खतरा", "शॉर्ट सर्किट", "करंट",
  "स्वास्थ्य आपातकाल", "महामारी", "हैजा", "डेंगू", "चिकित्सा आपातकालीन", "अस्पताल",
  "सार्वजनिक सुरक्षा", "भवन गिरा", "दीवार गिरी", "पुल टूटा", "दुर्घटना", "मौत",
  "गैस लीक", "विषैला", "जहर",
];

const EMERGENCY_CATEGORIES = [
  "Electricity",
  "Water Supply",
  "Public Health",
  "Fire",
];

// ============================================
// 1. Get Admin Token Config (max daily limit)
// ============================================
export function getAdminTokenConfig(): number {
  if (!isClient) return DEFAULT_MAX_TOKENS;
  const stored = localStorage.getItem(TOKEN_CONFIG_KEY);
  if (stored) {
    const val = parseInt(stored, 10);
    return isNaN(val) || val < 1 || val > 10 ? DEFAULT_MAX_TOKENS : val;
  }
  return DEFAULT_MAX_TOKENS;
}

export function setAdminTokenConfig(maxTokens: number): void {
  if (!isClient) return;
  const clamped = Math.max(1, Math.min(10, maxTokens));
  localStorage.setItem(TOKEN_CONFIG_KEY, String(clamped));

  // Also update the current token state's maxTokens
  const state = getTokenState();
  state.maxTokens = clamped;
  // If remaining > new max, clamp it
  if (state.tokensRemaining > clamped) {
    state.tokensRemaining = clamped;
  }
  saveTokenState(state);
}

// ============================================
// 2. Token State — Read / Write / Auto-Reset
// ============================================
function getDefaultState(): TokenState {
  const maxTokens = getAdminTokenConfig();
  return {
    tokensRemaining: maxTokens,
    maxTokens,
    lastResetTimestamp: new Date().toISOString(),
    emergencyBypassCount: 0,
    totalComplaintsToday: 0,
  };
}

function saveTokenState(state: TokenState): void {
  if (!isClient) return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(state));
}

export function getTokenState(): TokenState {
  if (!isClient) return getDefaultState();

  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) {
    const fresh = getDefaultState();
    saveTokenState(fresh);
    return fresh;
  }

  const state: TokenState = JSON.parse(stored);

  // Auto-reset check: if 24 hours have passed since last reset
  const lastReset = new Date(state.lastResetTimestamp).getTime();
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  if (now - lastReset >= TWENTY_FOUR_HOURS) {
    const maxTokens = getAdminTokenConfig();
    const freshState: TokenState = {
      tokensRemaining: maxTokens,
      maxTokens,
      lastResetTimestamp: new Date().toISOString(),
      emergencyBypassCount: 0,
      totalComplaintsToday: 0,
    };
    saveTokenState(freshState);
    return freshState;
  }

  // Sync maxTokens from admin config in case it changed
  const currentMax = getAdminTokenConfig();
  if (state.maxTokens !== currentMax) {
    state.maxTokens = currentMax;
    saveTokenState(state);
  }

  return state;
}

// ============================================
// 3. Emergency Detection
// ============================================
export function isEmergencyComplaint(text: string, category?: string): boolean {
  const lowerText = text.toLowerCase();

  // Check category match
  if (category && EMERGENCY_CATEGORIES.some((ec) => ec.toLowerCase() === category.toLowerCase())) {
    return true;
  }

  // Check English keywords
  for (const kw of EMERGENCY_KEYWORDS_EN) {
    if (lowerText.includes(kw)) return true;
  }

  // Check Hindi keywords
  for (const kw of EMERGENCY_KEYWORDS_HI) {
    if (text.includes(kw)) return true;
  }

  return false;
}

// ============================================
// 4. Consume Token (Main flow)
// ============================================
export function consumeToken(complaintText: string, category?: string): TokenConsumeResult {
  const state = getTokenState();

  // If tokens available, consume normally
  if (state.tokensRemaining > 0) {
    state.tokensRemaining -= 1;
    state.totalComplaintsToday += 1;
    saveTokenState(state);

    if (isClient) {
      window.dispatchEvent(new CustomEvent("janmitra-token-change"));
    }

    return {
      allowed: true,
      reason: `Token consumed. ${state.tokensRemaining} remaining today.`,
      reasonHi: `टोकन उपयोग किया गया। आज ${state.tokensRemaining} शेष हैं।`,
      isEmergencyBypass: false,
      tokensRemaining: state.tokensRemaining,
    };
  }

  // Tokens exhausted — check emergency bypass
  if (isEmergencyComplaint(complaintText, category)) {
    state.emergencyBypassCount += 1;
    state.totalComplaintsToday += 1;
    saveTokenState(state);

    if (isClient) {
      window.dispatchEvent(new CustomEvent("janmitra-token-change"));
    }

    return {
      allowed: true,
      reason: "Emergency complaint detected — priority access granted.",
      reasonHi: "आपातकालीन शिकायत का पता चला — प्राथमिकता पहुँच प्रदान की गई।",
      isEmergencyBypass: true,
      tokensRemaining: 0,
    };
  }

  // Denied
  return {
    allowed: false,
    reason: "Daily complaint limit reached. Please try again tomorrow.",
    reasonHi: "दैनिक शिकायत सीमा पूरी हो गई है। कृपया कल पुनः प्रयास करें।",
    isEmergencyBypass: false,
    tokensRemaining: 0,
  };
}

// ============================================
// 5. Admin Controls
// ============================================
export function grantExtraTokens(count: number): TokenState {
  const state = getTokenState();
  state.tokensRemaining += Math.max(0, Math.min(count, 10));
  saveTokenState(state);

  if (isClient) {
    window.dispatchEvent(new CustomEvent("janmitra-token-change"));
  }

  return state;
}

export function getCitizenFrequencyReport(): {
  totalComplaintsToday: number;
  emergencyBypassesToday: number;
  tokensRemaining: number;
  maxTokens: number;
  lastReset: string;
  hoursUntilReset: number;
} {
  const state = getTokenState();
  const lastReset = new Date(state.lastResetTimestamp).getTime();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const nextReset = lastReset + TWENTY_FOUR_HOURS;
  const hoursUntilReset = Math.max(0, Math.round((nextReset - Date.now()) / (1000 * 60 * 60)));

  return {
    totalComplaintsToday: state.totalComplaintsToday,
    emergencyBypassesToday: state.emergencyBypassCount,
    tokensRemaining: state.tokensRemaining,
    maxTokens: state.maxTokens,
    lastReset: state.lastResetTimestamp,
    hoursUntilReset,
  };
}
