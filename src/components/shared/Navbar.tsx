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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ role: string; email: string } | null>(null);
  useEffect(() => {
    const checkSession = () => {
      const activeSession = getAuthSession();
      setSession(activeSession);
    };

    checkSession();
    
    // Listen for storage, focus, and visibilitychange events to sync active authentication state in real time
    window.addEventListener("storage", checkSession);
    window.addEventListener("focus", checkSession);
    window.addEventListener("visibilitychange", checkSession);
    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("visibilitychange", checkSession);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05070f]/80 backdrop-blur-xl border-b border-[#1e293b]/40 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-gov-blue via-violet-600 to-ai-purple flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black tracking-tight text-white group-hover:text-blue-400 transition-colors duration-300">
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
            
            {/* File Complaint button always visible on desktop */}
            <Link href="/citizen">
              <Button className="h-9 px-4 bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 hover:from-blue-500 hover:via-violet-500 hover:to-pink-500 text-white font-extrabold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-xs tracking-wider gap-1.5 cursor-pointer rounded-lg uppercase">
                <FileText className="w-3.5 h-3.5 text-white animate-pulse" />
                File Complaint
              </Button>
            </Link>

            {/* Admin Portal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 px-4 border border-slate-800 hover:border-slate-700 bg-[#090d16] hover:bg-slate-900 text-gray-200 hover:text-white shadow-[0_0_8px_rgba(255,255,255,0.02)] transition-all duration-300 text-xs font-black tracking-wider uppercase cursor-pointer rounded-lg gap-1.5 focus-visible:ring-0 flex items-center justify-center select-none outline-none">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                Admin Portal
                <span className="ml-1 text-[8px] opacity-60">▼</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#05070f]/95 backdrop-blur-xl border border-slate-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-gray-200 rounded-xl p-1.5 min-w-[200px] mt-1 z-50">
                <DropdownMenuItem asChild>
                  <Link href="/officer" className="flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase text-gray-300 hover:text-white focus:text-white focus:bg-gradient-to-r focus:from-blue-600/20 focus:to-violet-600/20 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-violet-600/20 border border-transparent focus:border-violet-500/30 hover:border-violet-500/30 rounded-lg transition-all duration-200 cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    Officer Console
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase text-gray-300 hover:text-white focus:text-white focus:bg-gradient-to-r focus:from-blue-600/20 focus:to-violet-600/20 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-violet-600/20 border border-transparent focus:border-violet-500/30 hover:border-violet-500/30 rounded-lg transition-all duration-200 cursor-pointer mt-1">
                    <BarChart3 className="w-4 h-4 text-pink-400" />
                    CAG Admin Panel
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {session && (
              <div className="flex items-center gap-2.5 pl-1.5 border-l border-slate-800/80">
                <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 px-3 py-1 border-emerald-500/30 bg-emerald-500/5 text-xs font-extrabold text-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.08)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                  {session.role === "admin" ? "CAG Admin" : "Officer Console"}
                </Badge>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="gap-1.5 text-xs font-extrabold text-red-400 hover:text-red-300 bg-red-950/5 hover:bg-red-950/15 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 cursor-pointer h-9 px-3.5 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.05)] group"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger + theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 cursor-pointer hover:bg-slate-900 rounded-lg"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#05070f]/95 backdrop-blur-lg border-t border-slate-800/60 overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-4 space-y-4">
              {/* File Complaint Link */}
              <Link href="/citizen" onClick={() => setOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 text-white font-extrabold text-sm uppercase tracking-wider py-5 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)] rounded-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  File Complaint
                </Button>
              </Link>

              {/* Admin Portal sub-section */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-2">
                  Admin Portal
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/officer" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full border-slate-800 bg-[#090d16] text-gray-300 hover:text-white justify-center gap-2 text-xs py-4.5 font-bold uppercase cursor-pointer rounded-lg">
                      <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                      Officer Login
                    </Button>
                  </Link>
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full border-slate-800 bg-[#090d16] text-gray-300 hover:text-white justify-center gap-2 text-xs py-4.5 font-bold uppercase cursor-pointer rounded-lg">
                      <BarChart3 className="w-3.5 h-3.5 text-pink-400" />
                      Admin Login
                    </Button>
                  </Link>
                </div>
              </div>

              {session && (
                <div className="pt-2 border-t border-slate-800/60 space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-xs font-extrabold text-emerald-400 uppercase">
                      Logged in: {session.role === "admin" ? "CAG Admin" : "Officer Console"}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-950/40 hover:text-red-300 font-bold gap-2 cursor-pointer py-4 text-xs uppercase rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
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
