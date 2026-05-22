"use client";

export interface AuthSession {
  role: "officer" | "admin";
  email: string;
  authenticatedAt: string;
}

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

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  
  // 1. Try local storage
  const lsVal = localStorage.getItem("janmitra_auth");
  if (lsVal) {
    try {
      const parsed = JSON.parse(lsVal);
      if (parsed && (parsed.role === "officer" || parsed.role === "admin")) {
        // Keep cookie in sync
        setCookie("janmitra_auth", lsVal, 7);
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem("janmitra_auth");
    }
  }

  // 2. Try cookie
  const cookieVal = getCookie("janmitra_auth");
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      if (parsed && (parsed.role === "officer" || parsed.role === "admin")) {
        // Keep local storage in sync
        localStorage.setItem("janmitra_auth", cookieVal);
        return parsed;
      }
    } catch (e) {
      eraseCookie("janmitra_auth");
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

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("janmitra_auth");
  eraseCookie("janmitra_auth");
}
