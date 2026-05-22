"use client";

import { useState, useEffect } from "react";
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

const navLinks = [
  { href: "/citizen", label: "File Complaint", icon: FileText },
  { href: "/officer", label: "Officer Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin Panel", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<{ role: string; email: string } | null>(null);

  useEffect(() => {
    const checkSession = () => {
      const auth = localStorage.getItem("janmitra_auth");
      if (auth) {
        try {
          setSession(JSON.parse(auth));
        } catch (e) {
          setSession(null);
        }
      } else {
        setSession(null);
      }
    };

    checkSession();
    
    // Listen for storage events to sync active authentication state
    window.addEventListener("storage", checkSession);
    return () => {
      window.removeEventListener("storage", checkSession);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("janmitra_auth");
    setSession(null);
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center shadow-lg shadow-gov-blue/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-trust-green rounded-full border-2 border-background animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight gradient-text-blue">
                JanMitra
              </span>
              <span className="text-[10px] font-medium text-muted-foreground -mt-1 tracking-wider uppercase">
                AI Governance
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`gap-2 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                        : "hover:bg-primary/8 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${isActive ? "text-primary animate-pulse" : ""}`} />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {session ? (
              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 px-3 py-1 border-primary/20 bg-slate-900/40 text-xs font-extrabold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-trust-green animate-pulse" />
                  {session.role === "admin" ? "CAG Admin" : "Officer Console"}
                </Badge>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-500/10 hover:border-red-500/30 transition-all cursor-pointer h-9 px-3"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/citizen?demo=true" className="hidden sm:block">
                  <Button className="bg-gradient-to-r from-gov-blue via-ai-purple to-gov-blue-light text-white border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_22px_rgba(124,58,237,0.5)] transition-all duration-300 text-sm font-bold gap-1.5 animate-pulse cursor-pointer">
                    <Sparkles className="w-4 h-4 animate-spin-slow text-white" />
                    Live AI Demo
                  </Button>
                </Link>
                <Link href="/citizen" className="hidden sm:block">
                  <Button className="bg-gradient-to-r from-gov-blue to-gov-blue-light text-white shadow-lg shadow-gov-blue/25 hover:shadow-gov-blue/40 transition-all duration-300 text-sm cursor-pointer">
                    <Shield className="w-4 h-4 mr-1.5" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
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
            className="md:hidden glass border-t border-border/50 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 text-sm font-bold ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                          : "hover:bg-primary/8 text-muted-foreground hover:text-white"
                      }`}
                    >
                      <link.icon className={`w-4 h-4 ${isActive ? "text-primary animate-pulse" : ""}`} />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              <Link href="/citizen?demo=true" onClick={() => setOpen(false)}>
                <Button className="w-full mt-2 bg-gradient-to-r from-gov-blue via-ai-purple to-gov-blue-light text-white border border-primary/20 gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4 animate-spin-slow text-white" />
                  Live AI Demo Tour
                </Button>
              </Link>
              <Link href="/citizen" onClick={() => setOpen(false)}>
                <Button className="w-full mt-2 bg-gradient-to-r from-gov-blue to-gov-blue-light text-white cursor-pointer">
                  <Shield className="w-4 h-4 mr-2" />
                  File a Complaint
                </Button>
              </Link>
              
              {session && (
                <Button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full mt-3 bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-950/40 hover:text-red-300 font-bold gap-2 cursor-pointer py-5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout ({session.role === "admin" ? "Admin" : "Officer"})
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
