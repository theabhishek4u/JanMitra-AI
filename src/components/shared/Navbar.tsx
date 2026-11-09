"use client";

import { useState, useEffect } from "react";
import { getAuthSession, clearAuthSession } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Shield,
  BarChart3,
  LogOut,
  Bell,
  Trash2,
  Inbox,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  getCitizenNotifications,
  markNotificationAsRead,
  clearNotifications,
} from "@/lib/complaints";
import type { Notification } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const isHi = language === "hi";

  useEffect(() => {
    const checkSession = () => {
      const activeSession = getAuthSession();
      setSession(activeSession);
    };

    const checkLanguage = () => {
      const saved = localStorage.getItem("janmitra-language");
      if (saved === "hi") {
        setLanguage("hi");
      } else {
        setLanguage("en");
      }
    };

    const syncNotifications = () => {
      const activeSession = getAuthSession();
      if (activeSession && activeSession.role === "citizen") {
        setNotifications(getCitizenNotifications());
      } else {
        setNotifications([]);
      }
    };

    checkSession();
    checkLanguage();
    syncNotifications();

    window.addEventListener("storage", checkSession);
    window.addEventListener("storage", checkLanguage);
    window.addEventListener("storage", syncNotifications);
    window.addEventListener("focus", checkSession);
    window.addEventListener("visibilitychange", checkSession);
    window.addEventListener("janmitra-db-change", syncNotifications);
    window.addEventListener("janmitra-language-change", checkLanguage);

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("storage", checkLanguage);
      window.removeEventListener("storage", syncNotifications);
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("visibilitychange", checkSession);
      window.removeEventListener("janmitra-db-change", syncNotifications);
      window.removeEventListener("janmitra-language-change", checkLanguage);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/";
  };

  const handleClearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotifications("citizen");
    setNotifications([]);
    window.dispatchEvent(new Event("janmitra-db-change"));
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationAsRead(n.id, "citizen");
    setNotifications(getCitizenNotifications());
    setShowNotifications(false);

    window.dispatchEvent(new CustomEvent("janmitra-track-complaint", { detail: n.complaintId }));
    window.dispatchEvent(new Event("janmitra-db-change"));

    if (window.location.pathname !== "/citizen") {
      window.location.href = `/citizen?tab=track&complaintId=${n.complaintId}`;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-600/25 transition-colors">
              <Landmark className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  JanMitra
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded text-slate-600 dark:text-slate-400">
                  UP
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                Municipal Grievance System
              </span>
            </div>
          </Link>

          {/* Center Links (Quiet & Purposeful) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Link
              href="/citizen"
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                pathname === "/citizen" ? "text-slate-900 dark:text-slate-100 font-semibold" : ""
              }`}
            >
              {isHi ? "नागरिक पोर्टल" : "Citizen portal"}
            </Link>
            <Link
              href="/officer"
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                pathname === "/officer" ? "text-slate-900 dark:text-slate-100 font-semibold" : ""
              }`}
            >
              {isHi ? "अधिकारी डैशबोर्ड" : "Officer command"}
            </Link>
            <Link
              href="/admin"
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                pathname === "/admin" ? "text-slate-900 dark:text-slate-100 font-semibold" : ""
              }`}
            >
              {isHi ? "प्रशासनिक निगरानी" : "Governance audit"}
            </Link>
            <Link
              href="/help"
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors ${
                pathname === "/help" ? "text-slate-900 dark:text-slate-100 font-semibold" : ""
              }`}
            >
              {isHi ? "सहायता" : "Help"}
            </Link>
          </div>

          {/* Desktop Right Area */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {/* Notification Bell */}
            {session && session.role === "citizen" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 top-10 w-80 max-h-[380px] overflow-y-auto z-50 rounded-xl p-3 shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] text-slate-900 dark:text-slate-200">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-white/5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                          {isHi ? "अधिसूचनाएं" : "Notifications"}
                        </span>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllNotifications}
                            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            {isHi ? "साफ़ करें" : "Clear"}
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 gap-1.5">
                          <Inbox className="w-6 h-6 opacity-40" />
                          <p className="text-xs">{isHi ? "कोई सूचना नहीं" : "No notifications"}</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-col gap-1 text-left ${
                                n.read
                                  ? "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                                  : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/15"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  {n.complaintId}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {formatTime(n.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                                {isHi ? n.messageHi : n.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href={
                    session.role === "admin"
                      ? "/admin"
                      : session.role === "officer"
                      ? "/officer"
                      : "/citizen"
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>
                    {session.name || session.email?.split("@")[0] || "Dashboard"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-1.5 transition-colors"
                >
                  {isHi ? "लॉगिन" : "Sign in"}
                </Link>
                <Link
                  href="/citizen"
                  className="inline-flex items-center text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  {isHi ? "शिकायत दर्ज करें" : "File grievance"}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0c0e14] px-4 py-4 space-y-3">
          <Link
            href="/citizen"
            onClick={() => setOpen(false)}
            className="block text-sm text-slate-300 py-1.5"
          >
            {isHi ? "नागरिक पोर्टल" : "Citizen portal"}
          </Link>
          <Link
            href="/officer"
            onClick={() => setOpen(false)}
            className="block text-sm text-slate-300 py-1.5"
          >
            {isHi ? "अधिकारी डैशबोर्ड" : "Officer command"}
          </Link>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block text-sm text-slate-300 py-1.5"
          >
            {isHi ? "प्रशासनिक निगरानी" : "Governance audit"}
          </Link>
          <Link
            href="/help"
            onClick={() => setOpen(false)}
            className="block text-sm text-slate-300 py-1.5"
          >
            {isHi ? "सहायता" : "Help"}
          </Link>

          <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
            {session ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-left text-sm text-red-400 py-1.5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {isHi ? "लॉग आउट" : "Sign out"}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm text-slate-300 py-2 rounded-lg border border-white/10"
                >
                  {isHi ? "लॉगिन" : "Sign in"}
                </Link>
                <Link
                  href="/citizen"
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm font-medium text-white bg-blue-600 py-2 rounded-lg"
                >
                  {isHi ? "शिकायत दर्ज करें" : "File grievance"}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
