"use client";

import { supabase } from "./supabaseClient";

export interface AuthSession {
  role: "officer" | "admin" | "citizen";
  email: string;
  authenticatedAt: string;
  id?: string;
  name?: string;
  mobile?: string;
}

export interface CitizenRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  createdAt?: string;
}

const isClient = typeof window !== "undefined";
const CITIZENS_STORAGE_KEY = "janmitra_registered_citizens_v2";

const defaultDemoCitizens: CitizenRecord[] = [
  {
    id: "cit-001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    mobile: "9876543210",
    password: "1234",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "cit-002",
    name: "Priya Verma",
    email: "priya@gmail.com",
    mobile: "9876543211",
    password: "1234",
    createdAt: "2026-05-02T10:00:00Z",
  },
  {
    id: "cit-003",
    name: "Amit Patel",
    email: "amit@gmail.com",
    mobile: "9876543212",
    password: "1234",
    createdAt: "2026-05-03T10:00:00Z",
  },
];

let memoryCitizens: CitizenRecord[] = JSON.parse(JSON.stringify(defaultDemoCitizens));

export function getLocalCitizens(): CitizenRecord[] {
  if (!isClient) {
    return memoryCitizens;
  }
  try {
    const raw = localStorage.getItem(CITIZENS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CITIZENS_STORAGE_KEY, JSON.stringify(defaultDemoCitizens));
      return JSON.parse(JSON.stringify(defaultDemoCitizens));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(CITIZENS_STORAGE_KEY, JSON.stringify(defaultDemoCitizens));
    return JSON.parse(JSON.stringify(defaultDemoCitizens));
  } catch (err) {
    return JSON.parse(JSON.stringify(defaultDemoCitizens));
  }
}

export function saveLocalCitizens(citizens: CitizenRecord[]) {
  if (!isClient) {
    memoryCitizens = citizens;
    return;
  }
  try {
    localStorage.setItem(CITIZENS_STORAGE_KEY, JSON.stringify(citizens));
  } catch (err) {
    console.warn("Failed to persist citizens locally:", err);
  }
}

// Keeping these for legacy compat if any components read them directly
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
}

export function eraseCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Max-Age=-99999999";
}

/**
 * Gets the current auth session from Supabase or Local Storage.
 */
export async function getAuthSessionAsync(): Promise<AuthSession | null> {
  const local = getAuthSession();
  if (local) return local;

  if (typeof window === "undefined") return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return {
      role: userData.role as "officer" | "admin" | "citizen",
      email: session.user.email || "",
      authenticatedAt: new Date().toISOString(),
      id: session.user.id,
      name: userData.name
    };
  } catch (err) {
    return null;
  }
}

/**
 * Legacy synchronous getter - relies on local storage cache
 */
export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const lsVal = localStorage.getItem("janmitra_auth");
  if (lsVal) {
    try {
      const parsed = JSON.parse(lsVal);
      if (parsed && (parsed.role === "officer" || parsed.role === "admin" || parsed.role === "citizen")) {
        return parsed;
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  const str = JSON.stringify(session);
  localStorage.setItem("janmitra_auth", str);
  setCookie("janmitra_auth", str, 7);
}

export async function clearAuthSessionAsync() {
  if (typeof window === "undefined") return;
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  clearAuthSession();
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("janmitra_auth");
  eraseCookie("janmitra_auth");
}

export async function registerCitizen(
  name: string,
  email: string,
  mobile: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();
    const cleanName = name.trim();

    // 1. Check local citizens cache first
    const localCitizens = getLocalCitizens();
    if (localCitizens.some(c => c.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "Email ID is already registered." };
    }
    if (localCitizens.some(c => c.mobile === cleanMobile)) {
      return { success: false, error: "Mobile number is already registered." };
    }

    // 2. Try Supabase verification if online
    try {
      const { data: existingEmail } = await supabase
        .from("citizens")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        return { success: false, error: "Email ID is already registered." };
      }

      const { data: existingMobile } = await supabase
        .from("citizens")
        .select("id")
        .eq("mobile", cleanMobile)
        .maybeSingle();

      if (existingMobile) {
        return { success: false, error: "Mobile number is already registered." };
      }
    } catch {
      // Supabase offline, proceed with local check
    }

    // 3. Create new citizen record
    const newId = `cit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newCitizen: CitizenRecord = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      password,
      createdAt: new Date().toISOString(),
    };

    saveLocalCitizens([...localCitizens, newCitizen]);

    // 4. Try background insert to Supabase
    try {
      await supabase.from("citizens").insert({
        id: newId,
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password: password,
      });
    } catch {
      // Supabase offline, local record is safe
    }

    const session: AuthSession = {
      role: "citizen",
      email: newCitizen.email,
      name: newCitizen.name,
      id: newCitizen.id,
      mobile: newCitizen.mobile,
      authenticatedAt: new Date().toISOString(),
    };

    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function loginCitizen(
  identifier: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  try {
    const cleanId = identifier.trim();
    const cleanLower = cleanId.toLowerCase();

    // 1. Try Supabase first if available
    try {
      const { data: citizen, error } = await supabase
        .from("citizens")
        .select("*")
        .or(`email.eq.${cleanLower},mobile.eq.${cleanId}`)
        .maybeSingle();

      if (!error && citizen) {
        if (citizen.password !== password) {
          return { success: false, error: "Incorrect security credentials." };
        }

        const session: AuthSession = {
          role: "citizen",
          email: citizen.email,
          name: citizen.name,
          id: citizen.id,
          mobile: citizen.mobile,
          authenticatedAt: new Date().toISOString(),
        };

        return { success: true, session };
      }
    } catch {
      // Supabase unreachable, fallback to local store
    }

    // 2. Check local citizens storage
    const localCitizens = getLocalCitizens();
    const matched = localCitizens.find(
      c => c.email.toLowerCase() === cleanLower || c.mobile === cleanId
    );

    if (!matched) {
      return { success: false, error: "Invalid credentials or account does not exist." };
    }

    if (matched.password !== password) {
      return { success: false, error: "Incorrect security credentials." };
    }

    const session: AuthSession = {
      role: "citizen",
      email: matched.email,
      name: matched.name,
      id: matched.id,
      mobile: matched.mobile,
      authenticatedAt: new Date().toISOString(),
    };

    return { success: true, session };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function resetCitizenPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const localCitizens = getLocalCitizens();
    const index = localCitizens.findIndex(c => c.email.toLowerCase() === cleanEmail);

    if (index === -1) {
      // Try checking Supabase
      try {
        const { data: citizen } = await supabase
          .from("citizens")
          .select("id")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (!citizen) {
          return { success: false, error: "No registered citizen account found with this email." };
        }
      } catch {
        return { success: false, error: "No registered citizen account found with this email." };
      }
    } else {
      localCitizens[index].password = newPassword;
      saveLocalCitizens(localCitizens);
    }

    // Attempt Supabase update
    try {
      await supabase
        .from("citizens")
        .update({ password: newPassword })
        .eq("email", cleanEmail);
    } catch {
      // ignore
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

/**
 * Fetch all registered citizens.
 */
export async function getRegisteredCitizens(): Promise<any[]> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from("citizens")
      .select("id, name, email, mobile, created_at")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // fallback
  }

  // Fallback to local citizens
  const locals = getLocalCitizens();
  return locals.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    mobile: c.mobile,
    created_at: c.createdAt || new Date().toISOString(),
  }));
}
