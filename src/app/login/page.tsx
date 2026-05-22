"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  User,
  Shield,
  BarChart3,
  Bot,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const roles = [
    {
      id: "citizen",
      title: "Citizen Portal",
      titleHi: "नागरिक पोर्टल",
      description: "File multi-lingual grievances, trigger holographic hazard scanning, and monitor real-time AI resolution progress.",
      href: "/citizen",
      icon: User,
      color: "#3B82F6",
      glowClass: "shadow-[0_0_20px_-5px_rgba(59,130,246,0.45)] border-gov-blue/30 hover:border-gov-blue",
      badge: "Public Access",
    },
    {
      id: "officer",
      title: "Officer Console",
      titleHi: "अधिकारी कंसोल",
      description: "Manage city-wide queues, override route assignments, inspect STT transcripts, and join Consolidated Action Files.",
      href: "/officer",
      icon: Shield,
      color: "#F59E0B",
      glowClass: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.45)] border-warning-amber/30 hover:border-warning-amber",
      badge: "Official Credentials Required",
    },
    {
      id: "admin",
      title: "Admin Panel",
      titleHi: "प्रशासक पैनल",
      description: "Audit department performance metrics, monitor SLA escalations, and review predictive municipal diagnostics.",
      href: "/admin",
      icon: BarChart3,
      color: "#7C3AED",
      glowClass: "shadow-[0_0_20px_-5px_rgba(124,58,237,0.45)] border-ai-purple/30 hover:border-ai-purple",
      badge: "Secretariat & CAG Audit",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Holographic HUD Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
      
      {/* Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gov-blue/10 filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-ai-purple/10 filter blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-4xl w-full z-10 space-y-8 text-center px-2">
        {/* Brand Header */}
        <motion.div
          className="space-y-3 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gov-blue via-primary to-ai-purple flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-trust-green rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            JanMitra AI — Autonomous Governance Platform
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-semibold max-w-lg leading-relaxed">
            Welcome to Uttar Pradesh&apos;s next-generation smart grievance system. Choose your operational access portal below.
          </p>

          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-extrabold border-primary/30 bg-primary/5 text-primary animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Gemini 2.5 Flash
          </Badge>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {roles.map((role, i) => {
            const isHovered = hoveredRole === role.id;
            
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <Link href={role.href} className="block group">
                  <Card
                    className={`h-full glass-premium border relative overflow-hidden transition-all duration-300 hover:scale-[1.03] text-left cursor-pointer flex flex-col justify-between ${
                      isHovered ? role.glowClass : "border-border/30 shadow-md"
                    }`}
                  >
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/20 group-hover:border-primary/50 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/20 group-hover:border-primary/50 transition-colors" />
                    
                    <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        {/* Role Icon */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                          style={{
                            background: isHovered ? `${role.color}15` : "rgba(255, 255, 255, 0.02)",
                            borderColor: isHovered ? role.color : "rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <role.icon className="w-6 h-6 transition-transform duration-300" style={{ color: isHovered ? role.color : "var(--muted-foreground)" }} />
                        </div>

                        {/* Text */}
                        <div className="space-y-1">
                          <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0">
                            {role.badge}
                          </Badge>
                          <h3 className="text-lg font-extrabold text-white group-hover:text-primary transition-colors flex items-center gap-1.5 mt-2">
                            {role.title}
                          </h3>
                          <span className="text-[10px] text-muted-foreground font-bold block">
                            {role.titleHi}
                          </span>
                          <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed pt-1.5">
                            {role.description}
                          </p>
                        </div>
                      </div>

                      {/* Link Action */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-primary transition-colors border-t border-border/20 pt-4 mt-auto">
                        <span>Enter Accessway</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer credentials alert */}
        <motion.div
          className="text-[11px] text-muted-foreground font-semibold flex items-center justify-center gap-1.5 bg-slate-900/50 border border-border/20 px-4 py-2.5 rounded-full w-fit mx-auto mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Lock className="w-3.5 h-3.5 text-warning-amber" />
          <span>Demo environment loaded with active persistent localStorage database. Credentials bypass active.</span>
        </motion.div>
      </div>
    </main>
  );
}
