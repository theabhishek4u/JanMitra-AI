"use client";

import { supabase } from "./supabaseClient";

export interface AuthSession {
  role: "officer" | "admin" | "citizen";
  email: string;
  authenticatedAt: string;
  id?: string;
  name?: string;
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
 * Gets the current auth session from Supabase.
 * Returns null if not authenticated or if an error occurs.
 */
export async function getAuthSessionAsync(): Promise<AuthSession | null> {
  if (typeof window === "undefined") return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }

    // Determine role based on user metadata or a dedicated 'users' table
    // For simplicity, falling back to local storage sync if metadata isn't set,
    // but ideally we fetch the user's role from public.users
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
    console.error("Error fetching session:", err);
    return null;
  }
}

/**
 * Legacy synchronous getter - relies on local storage cache
 * Only use for initial renders where async isn't possible yet.
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
  await supabase.auth.signOut();
  clearAuthSession();
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("janmitra_auth");
  eraseCookie("janmitra_auth");
}
