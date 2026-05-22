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
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/shared/Navbar";
import { mockComplaints, mockStats, analyticsData } from "@/data/complaints";

const statCards = [
  {
    title: "Total Complaints",
    value: mockStats.total,
    icon: LayoutDashboard,
    color: "#3B82F6",
    change: "+12%",
    up: true,
  },
  {
    title: "Pending",
    value: mockStats.pending,
    icon: Clock,
    color: "#F59E0B",
    change: "-8%",
    up: false,
  },
  {
    title: "Resolved",
    value: mockStats.resolved,
    icon: CheckCircle2,
    color: "#10B981",
    change: "+23%",
    up: true,
  },
  {
    title: "High Priority",
    value: mockStats.highPriority,
    icon: AlertTriangle,
    color: "#EF4444",
    change: "+5%",
    up: true,
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
      <main className="min-h-screen pt-20 pb-12 bg-background">
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
                <Card className="glass-card border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${stat.color}12`,
                          border: `1px solid ${stat.color}20`,
                        }}
                      >
                        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                      </div>
                      <span
                        className={`text-xs font-semibold flex items-center gap-0.5 ${
                          stat.up ? "text-trust-green" : "text-danger-red"
                        }`}
                      >
                        {stat.up ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Complaint Queue */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Complaint Queue
                    </CardTitle>
                    <Badge variant="outline">{filteredComplaints.length} complaints</Badge>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search complaints..."
                        className="pl-9 h-9 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-1">
                      {["all", "high", "medium", "low"].map((p) => (
                        <Button
                          key={p}
                          variant={selectedPriority === p ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-9 capitalize"
                          onClick={() => setSelectedPriority(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto space-y-2 px-4 pb-4">
                  {filteredComplaints.map((c, i) => (
                    <motion.div
                      key={c.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 cursor-pointer group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-muted-foreground">
                            {c.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 priority-${c.priority}`}
                          >
                            {c.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto capitalize">
                            {c.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-sm font-medium truncate">{c.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {c.area}
                          <span>•</span>
                          {c.category}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions Panel */}
            <div className="space-y-6">
              <Card className="glass-card border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-ai-purple" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  {aiSuggestions.map((s, i) => (
                    <motion.div
                      key={s.title}
                      className="p-3 rounded-xl bg-muted/40 border border-border/40 hover:border-ai-purple/20 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-ai-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <s.icon className="w-3.5 h-3.5 text-ai-purple" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-snug">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={s.confidence} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">
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
              <Card className="glass-card border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-trust-green" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AI Accuracy</span>
                    <span className="text-sm font-semibold text-ai-purple">{mockStats.aiAccuracy}%</span>
                  </div>
                  <Progress value={mockStats.aiAccuracy} className="h-2" />

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Satisfaction Rate</span>
                    <span className="text-sm font-semibold text-trust-green">{mockStats.satisfactionRate}%</span>
                  </div>
                  <Progress value={mockStats.satisfactionRate} className="h-2" />

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">Avg Resolution</span>
                    <span className="text-sm font-semibold text-gov-blue">{mockStats.avgResolutionHours}h</span>
                  </div>
                  <Progress value={(1 - mockStats.avgResolutionHours / 72) * 100} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
