"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Route,
  Languages,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  Building2,
  Activity,
  CheckCircle2,
} from "lucide-react";

const capabilities = [
  {
    icon: Brain,
    title: "Syntactic NLP classification",
    description:
      "Understands grievances submitted in Hindi, colloquial Hinglish, or English. Parses intent, urgency, and municipal domain in under 300 milliseconds.",
    badge: "NLP pipeline",
  },
  {
    icon: Route,
    title: "Deterministic department dispatch",
    description:
      "Routes grievances to the exact nodal authority—Lucknow Nagar Nigam, Jal Nigam, or PWD—based on municipal jurisdiction rules.",
    badge: "Automated routing",
  },
  {
    icon: Languages,
    title: "Voice transcription & vernacular speech",
    description:
      "Speech-to-text engine allows citizens to dictate complaints naturally in regional dialects with live acoustic transcription.",
    badge: "Voice redressal",
  },
  {
    icon: MapPin,
    title: "Geocoded municipal GIS mapping",
    description:
      "Extracts neighborhood landmarks and binds exact GPS coordinates to locate road damage, broken pipelines, or garbage hotspots.",
    badge: "Spatial telemetry",
  },
  {
    icon: Clock,
    title: "Statutory SLA auto-escalation",
    description:
      "Monitors time elapsed against public service guarantee acts. Automatically escalates stalled tickets to senior zonal commissioners.",
    badge: "SLA compliance",
  },
  {
    icon: ShieldCheck,
    title: "Duplicate & fraud mitigation",
    description:
      "Clusters overlapping complaints from the same ward into single incidents, preventing duplicate work orders and resource wastage.",
    badge: "Incident clustering",
  },
];

const standards = [
  { label: "Hindi, Hinglish & English support", icon: Languages },
  { label: "Lucknow municipal ward mapping", icon: Building2 },
  { label: "SMS & digital docket updates", icon: FileText },
  { label: "Field officer verification", icon: CheckCircle2 },
  { label: "Real-time audit log", icon: Activity },
];

export function Features() {
  return (
    <section className="py-20 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0c0e14] transition-colors" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-12 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Engineered for municipal transparency and accountability
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every step—from citizen intake to field resolution—is verified, audited, and tracked through structured municipal protocols.
          </p>
        </div>

        {/* 3x2 Capability Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] p-6 text-left space-y-4 shadow-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/8 px-2 py-0.5 rounded">
                    {cap.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Standards Pill Strip */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {standards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/8 bg-white dark:bg-[#12151e] text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
