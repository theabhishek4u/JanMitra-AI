"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Route,
  Languages,
  MapPin,
  BellRing,
  BarChart3,
  Sparkles,
  Shield,
  Mic,
  Image as ImageIcon,
  Clock,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Classification Engine",
    description:
      "Automatically understands complaints in Hindi, English, or Urdu. Detects category, priority, and urgency in milliseconds.",
    color: "#7C3AED",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
  {
    icon: Route,
    title: "Smart Department Routing",
    description:
      "AI routes complaints to the correct department — Nagar Nigam, Jal Nigam, PWD, or others — with 94% accuracy.",
    color: "#1D4ED8",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description:
      "Submit in Hindi, Hinglish, Urdu, or English. Get updates in your preferred language. Voice input supported.",
    color: "#10B981",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    icon: MapPin,
    title: "Live Complaint Tracking",
    description:
      "Amazon/Swiggy-style tracking timeline. Know exactly where your complaint stands — from submission to resolution.",
    color: "#F59E0B",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    icon: BellRing,
    title: "Autonomous Follow-Ups",
    description:
      "AI agent automatically reminds departments, escalates overdue complaints, and keeps citizens updated.",
    color: "#EF4444",
    gradient: "from-red-500/20 to-red-600/5",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description:
      "Heatmaps, trend analysis, and predictive governance. Know where problems will arise before they happen.",
    color: "#06B6D4",
    gradient: "from-cyan-500/20 to-cyan-600/5",
  },
];

const extraFeatures = [
  { icon: Mic, label: "Multilingual Voice Input" },
  { icon: ImageIcon, label: "Multimodal Photo Analysis" },
  { icon: Shield, label: "AI-Powered Fraud Detection" },
  { icon: Clock, label: "Autonomous Escalation Engine" },
  { icon: Sparkles, label: "Nodal Officer AI Summaries" },
  { icon: TrendingUp, label: "District Analytics Heatmap" },
];

export function Features() {
  return (
    <section className="py-24 relative" id="features">
      {/* Decorative blurred dot */}
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] rounded-full bg-gov-blue/5 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-purple/8 border border-ai-purple/15 text-xs font-semibold text-ai-purple uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Citizens
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything You Need for{" "}
            <span className="gradient-text">Smart Governance</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From complaint submission to real-time resolution — every step is automated,
            transparent, and powered by advanced AI.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card premium-glow-border rounded-2xl p-6 group cursor-default backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ 
                y: -6,
                boxShadow: "0 12px 24px -4px rgba(29, 78, 216, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
              }}
            >
              {/* Icon container */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4.5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                  border: `1px solid ${feature.color}25`,
                }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>

              {/* Title & subtitle */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Extra features strip */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-3.5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {extraFeatures.map((f) => (
            <motion.span
              key={f.label}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-muted/40 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-border/80 transition-all cursor-default"
              whileHover={{ scale: 1.03 }}
            >
              <f.icon className="w-4 h-4 text-primary/85" />
              {f.label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
