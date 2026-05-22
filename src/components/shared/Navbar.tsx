"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/citizen", label: "File Complaint", icon: FileText },
  { href: "/officer", label: "Officer Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin Panel", icon: BarChart3 },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

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
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" className="gap-2 text-sm font-medium hover:bg-primary/8">
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
