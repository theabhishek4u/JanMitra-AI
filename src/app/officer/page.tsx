"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { mockComplaints, mockStats } from "@/data/complaints";

const statCards = [
  {
    title: "Total Complaints",
    value: mockStats.total,
    icon: LayoutDashboard,
    color: "#3B82F6",
    change: "+12%",
    up: true,
    glowClass: "hover:neon-glow-primary border-gov-blue/20 hover:border-gov-blue/40",
  },
  {
    title: "Pending",
    value: mockStats.pending,
    icon: Clock,
    color: "#F59E0B",
    change: "-8%",
    up: false,
    glowClass: "hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.35)] border-warning-amber/20 hover:border-warning-amber/40",
  },
  {
    title: "Resolved",
    value: mockStats.resolved,
    icon: CheckCircle2,
    color: "#10B981",
    change: "+23%",
    up: true,
    glowClass: "hover:neon-glow-success border-trust-green/20 hover:border-trust-green/40",
  },
  {
    title: "High Priority",
    value: mockStats.highPriority,
    icon: AlertTriangle,
    color: "#EF4444",
    change: "+5%",
    up: true,
    glowClass: "hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.35)] border-danger-red/20 hover:border-danger-red/40",
  },
];

const aiSuggestions = [
  {
    type: "urgent",
    title: "Deploy sanitation team to Gomti Nagar Sector 12",
    reason: "3 garbage complaints in same area within 48 hours",
    confidence: 94,
    icon: Zap,
  },
  {
    type: "escalation",
    title: "Escalate Chinhat construction complaint",
    reason: "No action taken in 10 days — auto-escalation triggered",
    confidence: 88,
    icon: ArrowUpRight,
  },
  {
    type: "prediction",
    title: "Rajajipuram likely to face drainage issues",
    reason: "Historical pattern + monsoon season approaching",
    confidence: 82,
    icon: Brain,
  },
  {
    type: "duplicate",
    title: "Merge 2 similar water supply complaints",
    reason: "Indira Nagar complaints from adjacent blocks",
    confidence: 91,
    icon: Shield,
  },
];

export default function OfficerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const filteredComplaints = mockComplaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "all" || c.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-gov-blue-light flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Officer Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, Shri Rajesh Kumar — Municipal Commissioner
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-trust-green">
                <span className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
                AI Agent Active
              </span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`glass-premium border premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group ${stat.glowClass}`}>
                  {/* Subtle dynamic background glow */}
                  <div
                    className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500"
                    style={{ backgroundColor: stat.color }}
                  />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-20"
                        style={{
                          background: `${stat.color}15`,
                          border: `1px solid ${stat.color}25`,
                        }}
                      >
                        <stat.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: stat.color }} />
                      </div>
                      <span
                        className={`text-xs font-bold flex items-center gap-0.5 ${
                          stat.up ? "text-trust-green" : "text-danger-red"
                        }`}
                      >
                        {stat.up ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-foreground/90">{stat.value.toLocaleString()}</div>
                    <div className="text-xs font-semibold text-muted-foreground mt-1.5">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Complaint Queue */}
            <div className="lg:col-span-2">
              <Card className="glass-premium border border-border/30 relative overflow-hidden shadow-xl shadow-black/5">
                {/* Accent light ray at the top */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 font-extrabold text-foreground/90">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      Complaint Queue
                    </CardTitle>
                    <Badge variant="outline" className="font-semibold">{filteredComplaints.length} complaints</Badge>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search complaints..."
                        className="pl-9 h-9 text-sm glass-premium border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {["all", "high", "medium", "low"].map((p) => (
                        <Button
                          key={p}
                          variant={selectedPriority === p ? "default" : "outline"}
                          size="sm"
                          className={`text-xs h-9 px-3.5 capitalize transition-all duration-300 ${
                            selectedPriority === p
                              ? "bg-gradient-to-r from-gov-blue via-primary to-ai-purple border-0 text-white font-bold shadow-md shadow-primary/20"
                              : "glass-premium hover:bg-muted/60 border-border/40 text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setSelectedPriority(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto space-y-3 px-4 pb-4">
                  {filteredComplaints.map((c, i) => (
                    <motion.div
                      key={c.id}
                      className="flex items-center gap-4 p-4.5 rounded-2xl bg-muted/20 hover:bg-primary/[0.02] border border-border/10 hover:border-primary/20 hover:scale-[1.01] hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, ease: "easeOut" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                        style={{
                          backgroundColor:
                            c.priority === "high"
                              ? "#EF4444"
                              : c.priority === "medium"
                              ? "#F59E0B"
                              : "#10B981",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-muted-foreground/70">
                            {c.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 priority-${c.priority}`}
                          >
                            {c.priority}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground ml-auto capitalize bg-muted/40 border border-border/20 px-2 py-0.5 rounded-md">
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors line-clamp-1">{c.title}</div>
                        <div className="text-xs text-muted-foreground/80 font-medium flex items-center gap-2 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{c.area}</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="bg-primary/5 border border-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{c.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions Panel */}
            <div className="space-y-6">
              <Card className="glass-premium border border-ai-purple/30 neon-glow-ai relative overflow-hidden scanning-laser-container">
                {/* Subtle digital backdrop indicator */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-ai-purple/10 to-transparent pointer-events-none rounded-bl-full" />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground/90 font-extrabold">
                    <div className="w-7 h-7 rounded-lg bg-ai-purple/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Sparkles className="w-4 h-4 text-ai-purple" />
                    </div>
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 px-4 pb-4 relative z-10">
                  {aiSuggestions.map((s, i) => (
                    <motion.div
                      key={s.title}
                      className="p-4 rounded-xl bg-muted/40 hover:bg-ai-purple/[0.02] border border-border/20 hover:border-ai-purple/35 transition-all duration-300 cursor-pointer shadow-sm group"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ai-purple/10 border border-ai-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <s.icon className="w-4 h-4 text-ai-purple" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground/90 leading-snug group-hover:text-ai-purple transition-colors">{s.title}</p>
                          <p className="text-xs text-muted-foreground/80 font-medium mt-1 leading-normal">{s.reason}</p>
                          <div className="flex items-center gap-3 mt-3">
                            {/* Premium inline custom progress bar */}
                            <div className="h-1.5 flex-1 bg-ai-purple/10 rounded-full overflow-hidden flex items-center">
                              <div
                                className="h-full bg-gradient-to-r from-ai-purple to-ai-purple-light rounded-full transition-all duration-500"
                                style={{ width: `${s.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-extrabold text-ai-purple tabular-nums">
                              {s.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-premium border border-border/30 relative overflow-hidden shadow-xl shadow-black/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 font-extrabold text-foreground/90">
                    <div className="w-7 h-7 rounded-lg bg-trust-green/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-trust-green" />
                    </div>
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 px-4 pb-4">
                  {/* Accuracy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">AI Accuracy</span>
                      <span className="font-extrabold text-ai-purple">{mockStats.aiAccuracy}%</span>
                    </div>
                    <div className="h-2 w-full bg-ai-purple/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-ai-purple to-ai-purple-light rounded-full"
                        style={{ width: `${mockStats.aiAccuracy}%` }}
                      />
                    </div>
                  </div>

                  {/* Satisfaction */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Satisfaction Rate</span>
                      <span className="font-extrabold text-trust-green">{mockStats.satisfactionRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-trust-green/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-trust-green to-trust-green-light rounded-full"
                        style={{ width: `${mockStats.satisfactionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Resolution time */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Avg Resolution</span>
                      <span className="font-extrabold text-gov-blue-light">{mockStats.avgResolutionHours}h</span>
                    </div>
                    <div className="h-2 w-full bg-gov-blue-light/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gov-blue to-gov-blue-light rounded-full"
                        style={{ width: `${(1 - mockStats.avgResolutionHours / 72) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
