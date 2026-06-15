"use client";

import { useState, useEffect } from "react";
import { getAuthSession, clearAuthSession } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Shield,
  BarChart3,
  Sparkles,
  LogOut,
  Bell,
  Trash2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
    
    // Listen for storage, focus, and visibilitychange events to sync active authentication state in real time
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
    
    // Dispatch custom event to track complaint on the citizen page if active
    window.dispatchEvent(new CustomEvent("janmitra-track-complaint", { detail: n.complaintId }));
    window.dispatchEvent(new Event("janmitra-db-change"));
    
    // Redirect if they are not already on the citizen page
    if (window.location.pathname !== "/citizen") {
      window.location.href = `/citizen?tab=track&complaintId=${n.complaintId}`;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-[#05070f]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-[#1e293b]/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]">

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-gov-blue via-violet-600 to-ai-purple flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                JANMITRA
              </span>
              <span className="text-[8.5px] font-bold text-gray-500 tracking-wider uppercase leading-none mt-0.5">
                AI SMART GOVERNANCE
              </span>
            </div>
          </Link>

          {/* Desktop Actions Area (Left and Center are clean and elegant) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {/* Notification Bell in Navbar */}
            {session && session.role === "citizen" && (
              <div className="relative flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                    showNotifications 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-primary/10 text-slate-700 dark:text-gray-300"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white dark:border-[#05070f] animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <div className="absolute right-0 top-11 w-80 max-h-[420px] overflow-y-auto z-50 rounded-2xl p-4 shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3 mb-3">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {isHi ? "सूचनाएं" : "Notifications"}
                        </h4>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllNotifications}
                            className="text-[10px] font-black text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isHi ? "साफ़ करें" : "Clear All"}
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center text-gray-500 gap-2">
                          <Inbox className="w-8 h-8 opacity-40" />
                          <p className="text-xs font-semibold">
                            {isHi ? "कोई नई सूचना नहीं" : "No new notifications"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 text-left ${
                                n.read
                                  ? "bg-slate-50/40 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/30"
                                  : "bg-indigo-500/5 border-indigo-500/20 dark:border-indigo-500/25 hover:bg-indigo-500/10 shadow-sm hover:border-indigo-500/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-gray-400 uppercase tracking-wider font-mono">
                                  {n.complaintId}
                                </span>
                                <span className="text-[9px] text-gray-500 font-semibold">
                                  {formatTime(n.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-gray-300 leading-normal">
                                {isHi ? n.messageHi : n.message}
                              </p>
                              {!n.read && (
                                <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 self-end animate-pulse">
                                  {isHi ? "● नया" : "● New"}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* File Complaint button always visible on desktop */}
            <Link href="/citizen">
              <Button className="h-9 px-4 bg-linear-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-500 hover:via-violet-500 hover:to-pink-500 text-white font-extrabold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs tracking-wider gap-1.5 cursor-pointer rounded-full uppercase">
                <FileText className="w-3.5 h-3.5 text-white animate-pulse" />
                File Complaint
              </Button>
            </Link>

            {/* Admin Portal Dropdown */}
            {(!session || session.role !== "citizen") && (
              <DropdownMenu>
                <DropdownMenuTrigger className="h-9 px-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-[#090d16] hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white shadow-[0_0_8px_rgba(0,0,0,0.02)] dark:shadow-[0_0_8px_rgba(255,255,255,0.02)] transition-all duration-300 text-xs font-black tracking-wider uppercase cursor-pointer rounded-full gap-1.5 focus-visible:ring-0 flex items-center justify-center select-none outline-none">
                  <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
                  Admin Portal
                  <span className="ml-1 text-[8px] opacity-60">▼</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-[#05070f]/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-slate-800 dark:text-gray-200 rounded-xl p-1.5 min-w-[200px] mt-1 z-50">
                  <DropdownMenuItem render={<Link href="/officer" className="flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white focus:text-slate-900 dark:focus:text-white focus:bg-linear-to-r focus:from-blue-600/10 dark:focus:from-blue-600/20 focus:to-violet-600/10 dark:focus:to-violet-600/20 hover:bg-linear-to-r hover:from-blue-600/10 dark:hover:from-blue-600/20 hover:to-violet-600/10 dark:hover:to-violet-600/20 border border-transparent focus:border-violet-500/20 dark:focus:border-violet-500/30 hover:border-violet-500/20 dark:hover:border-violet-500/30 rounded-lg transition-all duration-200 cursor-pointer" />}>
                    <LayoutDashboard className="w-4 h-4 text-sky-550 dark:text-sky-400" />
                    Officer Console
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white focus:text-slate-900 dark:focus:text-white focus:bg-linear-to-r focus:from-blue-600/10 dark:focus:from-blue-600/20 focus:to-violet-600/10 dark:focus:to-violet-600/20 hover:bg-linear-to-r hover:from-blue-600/10 dark:hover:from-blue-600/20 hover:to-violet-600/10 dark:hover:to-violet-600/20 border border-transparent focus:border-violet-500/20 dark:focus:border-violet-500/30 hover:border-violet-500/20 dark:hover:border-violet-500/30 rounded-lg transition-all duration-200 cursor-pointer mt-1" />}>
                    <BarChart3 className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                    CAG Admin Panel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Go to Dashboard button (only visible on landing page '/') */}
            {session && pathname === "/" && (
              <Link href={session.role === "admin" ? "/admin" : session.role === "officer" ? "/officer" : "/citizen"}>
                <Button className="h-9 px-4 bg-linear-to-r from-blue-600 via-violet-600 to-indigo-600 hover:from-blue-500 hover:via-violet-500 hover:to-indigo-500 text-white font-extrabold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs tracking-wider gap-1.5 cursor-pointer rounded-full uppercase">
                  <LayoutDashboard className="w-3.5 h-3.5 text-white" />
                  Go to Dashboard
                </Button>
              </Link>
            )}

            {/* Logout button (only visible on subpages) */}
            {session && pathname !== "/" && (
              <div className="flex items-center gap-2.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
                <Button
                  onClick={handleLogout}
                  className="h-9 px-4 bg-red-50 dark:bg-red-950/35 hover:bg-linear-to-r hover:from-red-600 hover:to-rose-600 text-red-600 dark:text-red-400 hover:text-white font-black tracking-wider uppercase border border-red-200 dark:border-red-500/30 hover:border-transparent rounded-full transition-all duration-300 text-xs gap-2 cursor-pointer shadow-[0_2px_10px_rgba(239,68,68,0.05)] hover:shadow-[0_0_18px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_18px_rgba(239,68,68,0.35)] hover:scale-[1.03] active:scale-[0.97] group"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {/* Notification Bell in Navbar for Mobile */}
            {session && session.role === "citizen" && (
              <div className="relative flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                    showNotifications 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-primary/10 text-slate-700 dark:text-gray-300"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white dark:border-[#05070f] animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <div className="absolute right-0 top-11 w-76 max-h-[360px] overflow-y-auto z-50 rounded-2xl p-4 shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3 mb-3">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {isHi ? "सूचनाएं" : "Notifications"}
                        </h4>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllNotifications}
                            className="text-[10px] font-black text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isHi ? "साफ़ करें" : "Clear All"}
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center text-gray-500 gap-2">
                          <Inbox className="w-8 h-8 opacity-40" />
                          <p className="text-xs font-semibold">
                            {isHi ? "कोई नई सूचना नहीं" : "No new notifications"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 text-left ${
                                n.read
                                  ? "bg-slate-50/40 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/30"
                                  : "bg-indigo-500/5 border-indigo-500/20 dark:border-indigo-500/25 hover:bg-indigo-500/10 shadow-sm hover:border-indigo-500/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-gray-450 uppercase tracking-wider font-mono">
                                  {n.complaintId}
                                </span>
                                <span className="text-[9px] text-gray-500 font-semibold">
                                  {formatTime(n.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-gray-300 leading-normal">
                                {isHi ? n.messageHi : n.message}
                              </p>
                              {!n.read && (
                                <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 self-end animate-pulse">
                                  {isHi ? "● नया" : "● New"}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-700 dark:text-gray-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-[#05070f]/95 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-4 space-y-4">
              {/* File Complaint Link */}
              <Link href="/citizen" onClick={() => setOpen(false)}>
                <Button className="w-full bg-linear-to-r from-blue-600 via-violet-600 to-pink-600 text-white font-extrabold text-sm uppercase tracking-wider py-5 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)] rounded-full">
                  <FileText className="w-4 h-4 mr-2" />
                  File Complaint
                </Button>
              </Link>

              {/* Admin Portal sub-section */}
              {(!session || session.role !== "citizen") && (
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2">
                    Admin Portal
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/officer" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#090d16] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white justify-center gap-2 text-xs py-4.5 font-bold uppercase cursor-pointer rounded-full">
                        <LayoutDashboard className="w-3.5 h-3.5 text-sky-550 dark:text-sky-400" />
                        Officer Login
                      </Button>
                    </Link>
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#090d16] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white justify-center gap-2 text-xs py-4.5 font-bold uppercase cursor-pointer rounded-full">
                        <BarChart3 className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                        Admin Login
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Go to Dashboard button (only visible on landing page '/') */}
              {session && pathname === "/" && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <Link href={session.role === "admin" ? "/admin" : session.role === "officer" ? "/officer" : "/citizen"} onClick={() => setOpen(false)}>
                    <Button className="w-full bg-linear-to-r from-blue-600 via-violet-600 to-indigo-600 text-white font-extrabold text-sm uppercase tracking-wider py-5 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)] rounded-full">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {/* Logout button (only visible on subpages) */}
              {session && pathname !== "/" && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <Button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full bg-red-50 dark:bg-red-950/30 hover:bg-linear-to-r hover:from-red-600 hover:to-rose-600 text-red-600 dark:text-red-400 hover:text-white font-black tracking-wider uppercase border border-red-200 dark:border-red-500/30 hover:border-transparent rounded-full transition-all duration-300 py-4.5 text-xs gap-2 cursor-pointer shadow-[0_2px_10px_rgba(239,68,68,0.05)] hover:shadow-[0_0_18px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_18px_rgba(239,68,68,0.35)] hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                    <span>Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
