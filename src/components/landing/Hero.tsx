"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bot,
  ArrowRight,
  Sparkles,
  ChevronRight,
  FileText,
  Brain,
  Building2,
  CheckCircle2,
  Bell,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const workflowSteps = [
  { icon: FileText, label: "Submit", color: "#3B82F6" },
  { icon: Brain, label: "AI Analyzes", color: "#7C3AED" },
  { icon: Building2, label: "Routes", color: "#F59E0B" },
  { icon: CheckCircle2, label: "Resolved", color: "#10B981" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-16">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)",
            top: "10%",
            left: "5%",
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
            top: "40%",
            right: "5%",
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #10B981 0%, transparent 70%)",
            bottom: "10%",
            left: "30%",
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              AI-Powered Governance Platform
              <ChevronRight className="w-3 h-3" />
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block">Fixing Citizen Complaints</span>
            <span className="block gradient-text mt-2">
              with AI-Powered Governance
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Resolve grievances faster with intelligent routing, autonomous follow-ups,
            and multilingual updates. Built for Uttar Pradesh&apos;s Jansunwai system.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/citizen">
              <Button
                size="lg"
                className="bg-gradient-to-r from-gov-blue to-gov-blue-light text-white shadow-xl shadow-gov-blue/30 hover:shadow-gov-blue/50 transition-all duration-300 h-12 px-8 text-base group"
              >
                <Shield className="w-5 h-5 mr-2" />
                File a Complaint
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/officer">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-2 hover:bg-primary/5"
              >
                <Bot className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* AI Workflow Visualization */}
          <motion.div
            className="pt-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                AI Workflow — Real-Time Processing
              </div>
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {workflowSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    className="flex flex-col items-center gap-2 flex-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.15, duration: 0.4 }}
                  >
                    <motion.div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                        border: `1px solid ${step.color}30`,
                      }}
                      animate={i < 3 ? { scale: [1, 1.05, 1] } : {}}
                      transition={{
                        delay: 1.5 + i * 0.3,
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    >
                      <step.icon
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        style={{ color: step.color }}
                      />
                    </motion.div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {step.label}
                    </span>
                    {i < workflowSteps.length - 1 && (
                      <motion.div
                        className="absolute hidden sm:block"
                        style={{
                          left: `${(100 / workflowSteps.length) * (i + 1) - 2}%`,
                          top: "50%",
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Live demo indicator */}
              <motion.div
                className="mt-6 flex items-center justify-center gap-2 text-xs text-trust-green"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell className="w-3 h-3" />
                <span>Live AI Processing — 94% Classification Accuracy</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-trust-green rounded-full" />
              <span>10,000+ Complaints Resolved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gov-blue rounded-full" />
              <span>75 Districts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ai-purple rounded-full" />
              <span>24/7 AI Active</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
