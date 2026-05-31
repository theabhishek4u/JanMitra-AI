"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bot,
  ArrowRight,
  Brain,
  Building2,
  Bell,
  Shield,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Search,
  FileText,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketState {
  id: string;
  status: string;
  statusColor: string;
  citizen: string;
  desc: string;
  category: string;
  assigned: string;
  step: number;
}

const mockTicketCycle: TicketState[] = [
  {
    id: "JM-2026-948",
    status: "SUBMITTED",
    statusColor: "#3B82F6",
    citizen: "Rahul Sharma (Gomti Nagar)",
    desc: "Gomti Nagar main crossing ke pass drinking water pipeline leak ho gayi hai, subah se paani beh raha hai.",
    category: "Awaiting AI Categorization...",
    assigned: "Pending...",
    step: 1
  },
  {
    id: "JM-2026-948",
    status: "AI ANALYZING...",
    statusColor: "#7C3AED",
    citizen: "Rahul Sharma (Gomti Nagar)",
    desc: "Gomti Nagar main crossing ke pass drinking water pipeline leak ho gayi hai, subah se paani beh raha hai.",
    category: "Water Supply & Sewage (CRITICAL)",
    assigned: "Matching closest officer...",
    step: 2
  },
  {
    id: "JM-2026-948",
    status: "ASSIGNED & DISPATCHED",
    statusColor: "#F59E0B",
    citizen: "Rahul Sharma (Gomti Nagar)",
    desc: "Gomti Nagar main crossing ke pass drinking water pipeline leak ho gayi hai, subah se paani beh raha hai.",
    category: "Water Supply & Sewage (CRITICAL)",
    assigned: "Lucknow Jal Nigam (Er. Alok Srivastava)",
    step: 3
  },
  {
    id: "JM-2026-948",
    status: "RESOLVED",
    statusColor: "#10B981",
    citizen: "Rahul Sharma (Gomti Nagar)",
    desc: "Gomti Nagar main crossing ke pass drinking water pipeline leak ho gayi hai, subah se paani beh raha hai.",
    category: "Water Supply & Sewage (CRITICAL)",
    assigned: "Lucknow Jal Nigam (Er. Alok Srivastava)",
    step: 4
  }
];

export function Hero() {
  const [currentStep, setCurrentStep] = useState(0);
  const [complaintCount, setComplaintCount] = useState(200);

  // Cycle the live ticket representation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % mockTicketCycle.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Live incoming complaints counter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setComplaintCount((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeTicket = mockTicketCycle[currentStep];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-24 pb-20">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)",
            top: "5%",
            left: "-10%",
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            bottom: "10%",
            right: "-10%",
          }}
          animate={{
            x: [0, -35, 0],
            y: [0, 35, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #10B981 0%, transparent 70%)",
            bottom: "20%",
            left: "25%",
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -25, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block">Fixing Citizen Grievances</span>
              <span className="block gradient-text mt-2 pb-1.5">
                with Next-Gen AI Routing
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Resolve municipal issues in seconds. JanMitra parses complaints in Hindi or Hinglish, detects severity levels, and smart-routes to nodal officers automatically.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/citizen">
                <Button
                  size="lg"
                  className="relative overflow-hidden z-10 bg-gradient-to-r from-gov-blue to-gov-blue-light text-white shadow-xl shadow-gov-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-13 px-8 text-base font-semibold group rounded-xl cursor-pointer before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-blue-600 before:via-violet-600 before:to-pink-600 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-500"
                >
                  <Bot className="w-5 h-5 mr-2 animate-pulse" />
                  File a Complaint
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/citizen?tab=track">
                <Button
                  size="lg"
                  variant="outline"
                  className="relative overflow-hidden z-10 bg-[#090d16]/40 border-2 border-slate-800/80 text-gray-200 hover:text-white hover:border-violet-500/50 shadow-lg shadow-black/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-13 px-8 text-base font-semibold rounded-xl cursor-pointer before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-blue-950/50 before:to-violet-950/50 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-500"
                >
                  <Search className="w-5 h-5 mr-2 text-ai-purple" />
                  My Complaints
                </Button>
              </Link>
            </motion.div>

            {/* Premium Trust Indicators / Live Nodal Stats Row */}
            <motion.div
              className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-2.5 pt-6 border-t border-border/40 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* Stat 1: Complaints Filed Today */}
              <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:scale-[1.03] hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 select-none whitespace-nowrap">
                <FileText className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="flex items-center gap-1">
                  <motion.span
                    key={complaintCount}
                    animate={{ scale: [1, 1.25, 1], color: ["#10b981", "#34d399", "#10b981"] }}
                    transition={{ duration: 0.4 }}
                    className="inline-block font-mono font-black"
                  >
                    {complaintCount}
                  </motion.span>
                  Complaints Filed Today
                </span>
              </div>

              {/* Stat 2: Issues Resolved */}
              <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:scale-[1.03] hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-300 select-none whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>10,000+ Issues Resolved</span>
              </div>

              {/* Stat 3: Districts (UP) */}
              <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:scale-[1.03] hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 select-none whitespace-nowrap">
                <MapPin className="w-4 h-4 text-indigo-500 animate-bounce" style={{ animationDuration: '3s' }} />
                <span>75 Districts (UP)</span>
              </div>

              {/* Stat 4: AI Engine Status */}
              <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200 shadow-sm hover:scale-[1.03] hover:border-purple-500/30 dark:hover:border-purple-500/20 transition-all duration-300 select-none whitespace-nowrap">
                <Activity className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>24/7 AI Engine Active</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Floating Live Mockup */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            {/* Holographic background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-ai-purple/10 to-gov-blue/10 rounded-3xl blur-2xl transform rotate-3" />
            
            <motion.div
              className="relative w-full max-w-[420px] glass-premium rounded-2xl p-6 shadow-2xl shadow-gov-blue/10 border-border/60 backdrop-blur-xl hover:scale-[1.01] transition-transform duration-300 active:scale-95"
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Header block */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">JanMitra Live Router</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">Real-Time Grievance Feed</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-trust-green/10 text-trust-green text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-trust-green animate-ping" />
                  LIVE RUN
                </div>
              </div>

              {/* Grievance Visual Card */}
              <div className="space-y-4">
                {/* ID and Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground font-semibold">TICKET ID: {activeTicket.id}</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeTicket.status}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${activeTicket.statusColor}12`,
                        color: activeTicket.statusColor,
                        borderColor: `${activeTicket.statusColor}30`
                      }}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTicket.status}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Citizen Details */}
                <div className="bg-muted/30 border border-border/30 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gov-blue" /> Citizen & Location
                  </div>
                  <div className="text-xs font-semibold text-foreground/90">{activeTicket.citizen}</div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    &ldquo;{activeTicket.desc}&rdquo;
                  </p>
                </div>

                {/* AI Diagnostics details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 border border-border/30 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-ai-purple" /> AI Category Match
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTicket.category}
                        className="text-xs font-bold text-foreground/90 line-clamp-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeTicket.category}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="bg-muted/30 border border-border/30 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-warning-amber" /> Smart Routing
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTicket.assigned}
                        className="text-xs font-bold text-foreground/90 line-clamp-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeTicket.assigned}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Progress bar visual stepper */}
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                    <span>AI LIFECYCLE PROCESSING</span>
                    <span>{Math.round((activeTicket.step / 4) * 100)}% Complete</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((stepIdx) => (
                      <div
                        key={stepIdx}
                        className={`h-full flex-1 transition-all duration-500 ${
                          activeTicket.step >= stepIdx
                            ? activeTicket.step === 4
                              ? "bg-trust-green"
                              : "bg-primary"
                            : "bg-muted-foreground/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive soundwave mock for voice input */}
              <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 h-7">
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground font-mono">Hinglish NLP Model V2</span>
                </div>
                <div className="text-[10px] font-semibold text-trust-green flex items-center gap-1">
                  <Clock className="w-3 h-3 text-trust-green" /> 0.8s Classification
                </div>
              </div>
            </motion.div>

            {/* Micro decoration: Floating Mini Metric Card */}
            <motion.div
              className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 p-3.5 bg-background/85 border border-border/80 rounded-xl shadow-xl backdrop-blur-md pointer-events-none"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-9 h-9 rounded-lg bg-trust-green/10 flex items-center justify-center text-trust-green">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Resolution Rate</div>
                <div className="text-sm font-bold text-foreground">94.8% (Fast Path)</div>
              </div>
            </motion.div>

            {/* Micro decoration: Floating Smart-Escalation Badge */}
            <motion.div
              className="absolute -top-6 -right-6 hidden sm:flex items-center gap-3 p-3.5 bg-background/85 border border-border/80 rounded-xl shadow-xl backdrop-blur-md pointer-events-none"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-9 h-9 rounded-lg bg-ai-purple/10 flex items-center justify-center text-ai-purple animate-pulse">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Auto Escalation</div>
                <div className="text-sm font-bold text-foreground">Active (District)</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
