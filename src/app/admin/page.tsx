"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Building2,
  Brain,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/shared/Navbar";
import { mockStats, analyticsData } from "@/data/complaints";

// Dynamic import to avoid SSR issues with recharts
const AnalyticsCharts = dynamic(() => import("@/components/admin/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="skeleton h-[300px] rounded-2xl" />
      <div className="grid grid-cols-2 gap-6">
        <div className="skeleton h-[300px] rounded-2xl" />
        <div className="skeleton h-[300px] rounded-2xl" />
      </div>
    </div>
  ),
});

const adminStats = [
  { label: "Total Complaints", value: "1,247", icon: BarChart3, color: "#3B82F6", change: "+12%", up: true },
  { label: "Resolution Rate", value: "68.6%", icon: TrendingUp, color: "#10B981", change: "+5.2%", up: true },
  { label: "Avg Resolution", value: "36h", icon: Clock, color: "#7C3AED", change: "-18%", up: false },
  { label: "Escalated", value: "23", icon: AlertTriangle, color: "#EF4444", change: "-3%", up: false },
];

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
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ai-purple to-ai-purple-dark flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered insights across all departments
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Brain className="w-3 h-3 text-ai-purple" />
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
                  transition={{ delay: i * 0.1 }}
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

          {/* Charts */}
          <AnalyticsCharts data={analyticsData} />

          {/* Bottom row: Department Efficiency + Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Department Efficiency */}
            <Card className="glass-premium border border-border/30 relative overflow-hidden shadow-xl shadow-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                  <div className="w-7 h-7 rounded-lg bg-gov-blue/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gov-blue-light" />
                  </div>
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4.5 px-4 pb-4">
                {analyticsData.departmentEfficiency.map((dept, i) => (
                  <motion.div
                    key={dept.department}
                    className="space-y-2.5 p-3 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground/90">{dept.department}</span>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-trust-green">{dept.resolved} resolved</span>
                        <span className="text-warning-amber">{dept.pending} pending</span>
                        <span className="text-muted-foreground">Avg: {dept.avgDays}d</span>
                      </div>
                    </div>
                    {/* Multi-segmented custom progress bar track */}
                    <div className="flex gap-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-trust-green to-trust-green-light rounded-l-full"
                        style={{ width: `${(dept.resolved / (dept.resolved + dept.pending)) * 100}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-warning-amber to-warning-amber-light rounded-r-full"
                        style={{ width: `${(dept.pending / (dept.resolved + dept.pending)) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
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
                  Predictive Governance
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
                      transition={{ delay: 0.5 + i * 0.1 }}
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
                    Predictions based on historical data + seasonal patterns
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
