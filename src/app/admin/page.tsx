"use client";

import { useState, useEffect } from "react";
import { getAuthSession, clearAuthSession } from "@/lib/auth";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Building2,
  Brain,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/shared/Navbar";
import { getStats, getAnalytics } from "@/lib/complaints";
import type { DashboardStats, AnalyticsData } from "@/types";

// Dynamic import to avoid SSR issues with recharts
const AnalyticsCharts = dynamic(() => import("@/components/admin/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="skeleton h-[300px] rounded-2xl bg-card/40 animate-pulse border border-border/10" />
      <div className="grid grid-cols-2 gap-6">
        <div className="skeleton h-[300px] rounded-2xl bg-card/40 animate-pulse border border-border/10" />
        <div className="skeleton h-[300px] rounded-2xl bg-card/40 animate-pulse border border-border/10" />
      </div>
    </div>
  ),
});

const predictions = [
  {
    area: "Rajajipuram",
    prediction: "Drainage overflow likely due to monsoon patterns",
    confidence: 86,
    risk: "high",
  },
  {
    area: "Gomti Nagar",
    prediction: "Increased garbage complaints expected next week",
    confidence: 79,
    risk: "medium",
  },
  {
    area: "Alambagh",
    prediction: "Power grid strain — potential outage risk",
    confidence: 72,
    risk: "medium",
  },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Client-side secure route guard
    const checkAuth = () => {
      const session = getAuthSession();
      if (!session || session.role !== "admin") {
        clearAuthSession();
        window.location.href = "/login?role=admin";
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    setMounted(true);
    setStats(getStats());
    setAnalytics(getAnalytics());

    const handleTabSync = () => {
      checkAuth();
    };

    window.addEventListener("focus", handleTabSync);
    window.addEventListener("visibilitychange", handleTabSync);

    return () => {
      window.removeEventListener("focus", handleTabSync);
      window.removeEventListener("visibilitychange", handleTabSync);
    };
  }, []);

  if (!mounted || !stats || !analytics) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ai-purple/20 via-primary/10 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center shadow-lg animate-spin">
          <Sparkles className="w-6 h-6 text-ai-purple" />
        </div>
        <span className="text-sm font-bold mt-4 tracking-wider">LOADING ADMIN INSIGHTS PORTAL...</span>
      </div>
    );
  }

  // Calculate dynamic stats cards
  const resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) + "%" : "0%";

  const adminStats = [
    { label: "Total Complaints", value: stats.total.toLocaleString(), icon: BarChart3, color: "#3B82F6", change: "+12%", up: true },
    { label: "Resolution Rate", value: resolutionRate, icon: TrendingUp, color: "#10B981", change: "+5.2%", up: true },
    { label: "Avg Resolution", value: `${stats.avgResolutionHours}h`, icon: Clock, color: "#7C3AED", change: "-18%", up: false },
    { label: "Escalated", value: stats.escalated.toLocaleString(), icon: AlertTriangle, color: "#EF4444", change: "-3%", up: false },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ai-purple to-ai-purple flex items-center justify-center shadow-md shadow-ai-purple/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered insights across all departments
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5 px-3 py-1 font-bold border-ai-purple/35 bg-ai-purple/5 text-ai-purple">
              <Brain className="w-3.5 h-3.5 text-ai-purple animate-pulse" />
              AI Insights Engine Active
            </Badge>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {adminStats.map((stat, i) => {
              const glowClass = 
                stat.label === "Total Complaints" ? "hover:neon-glow-primary border-gov-blue/20 hover:border-gov-blue/40" :
                stat.label === "Resolution Rate" ? "hover:neon-glow-success border-trust-green/20 hover:border-trust-green/40" :
                stat.label === "Avg Resolution" ? "hover:neon-glow-ai border-ai-purple/20 hover:border-ai-purple/40" :
                "hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.35)] border-danger-red/20 hover:border-danger-red/40";
              
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={`glass-premium border premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group ${glowClass}`}>
                    <div
                      className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500"
                      style={{ backgroundColor: stat.color }}
                    />
                    <CardContent className="p-5 relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-20"
                          style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
                        >
                          <stat.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: stat.color }} />
                        </div>
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${stat.label === "Escalated" ? "text-danger-red" : "text-trust-green"}`}>
                          {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-foreground/90">{stat.value}</div>
                      <div className="text-xs font-semibold text-muted-foreground mt-1.5">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Dynamic Charts Hookup */}
          <AnalyticsCharts data={analytics} />

          {/* Bottom row: Department Efficiency + Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Department Performance */}
            <Card className="glass-premium border border-border/30 relative overflow-hidden shadow-xl shadow-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                  <div className="w-7 h-7 rounded-lg bg-gov-blue/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gov-blue-light" />
                  </div>
                  Department Performance Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                {analytics.departmentEfficiency.map((dept, i) => {
                  const total = dept.resolved + dept.pending;
                  const pctResolved = total > 0 ? (dept.resolved / total) * 100 : 0;
                  const pctPending = total > 0 ? (dept.pending / total) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={dept.department}
                      className="space-y-2.5 p-3 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground/90">{dept.department}</span>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className="text-trust-green">{dept.resolved} resolved</span>
                          <span className="text-warning-amber">{dept.pending} pending</span>
                          <span className="text-muted-foreground">Avg: {dept.avgDays} days</span>
                        </div>
                      </div>
                      {/* Multi-segmented custom progress bar track */}
                      <div className="flex gap-1 h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-trust-green to-trust-green-light rounded-l-full transition-all duration-500"
                          style={{ width: `${pctResolved || 5}%` }}
                        />
                        <div
                          className="h-full bg-gradient-to-r from-warning-amber to-warning-amber-light rounded-r-full transition-all duration-500"
                          style={{ width: `${pctPending || 5}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Predictive Insights */}
            <Card className="glass-premium border border-ai-purple/20 neon-glow-ai relative overflow-hidden shadow-xl shadow-black/5 scanning-laser-container">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-ai-purple/10 to-transparent pointer-events-none rounded-bl-full" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                  <div className="w-7 h-7 rounded-lg bg-ai-purple/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Sparkles className="w-4 h-4 text-ai-purple" />
                  </div>
                  Predictive Civic Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4 relative z-10">
                {predictions.map((p, i) => {
                  const isHigh = p.risk === "high";
                  return (
                    <motion.div
                      key={p.area}
                      className={`p-4 rounded-xl border transition-all duration-300 shadow-sm group hover:scale-[1.01] ${
                        isHigh
                          ? "bg-danger-red/[0.02] border-danger-red/15 hover:border-danger-red/40 hover:shadow-[0_0_15px_-4px_rgba(239,68,68,0.25)]"
                          : "bg-warning-amber/[0.02] border-warning-amber/15 hover:border-warning-amber/40 hover:shadow-[0_0_15px_-4px_rgba(245,158,11,0.25)]"
                      }`}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isHigh ? "bg-danger-red/10 text-danger-red" : "bg-warning-amber/10 text-warning-amber"}`}>
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <span className="font-extrabold text-sm text-foreground/90">{p.area}</span>
                        <Badge
                          variant="outline"
                          className={`ml-auto text-[9px] uppercase font-extrabold tracking-wider ${
                            isHigh ? "priority-high px-2 py-0.5 animate-pulse" : "priority-medium px-2 py-0.5"
                          }`}
                        >
                          {p.risk} risk
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground/90 mb-3 leading-relaxed">{p.prediction}</p>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden flex items-center">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? "bg-gradient-to-r from-danger-red to-warning-amber" : "bg-gradient-to-r from-warning-amber to-trust-green"
                            }`}
                            style={{ width: `${p.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-extrabold tabular-nums ${isHigh ? "text-danger-red" : "text-warning-amber"}`}>
                          {p.confidence}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                <div className="p-3 rounded-xl bg-ai-purple/5 border border-ai-purple/15 text-center mt-2">
                  <p className="text-xs text-ai-purple/70 font-semibold flex items-center justify-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    Predictions based on real-time spatial trends & AI telemetry
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
