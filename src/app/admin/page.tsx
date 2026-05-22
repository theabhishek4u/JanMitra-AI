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
            {adminStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card border-0">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}20` }}
                      >
                        <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                      </div>
                      <span className={`text-xs font-semibold flex items-center gap-0.5 ${stat.up ? "text-trust-green" : "text-trust-green"}`}>
                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <AnalyticsCharts data={analyticsData} />

          {/* Bottom row: Department Efficiency + Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Department Efficiency */}
            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gov-blue" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                {analyticsData.departmentEfficiency.map((dept, i) => (
                  <motion.div
                    key={dept.department}
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{dept.department}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="text-trust-green">{dept.resolved} resolved</span>
                        <span className="text-warning-amber">{dept.pending} pending</span>
                        <span>Avg: {dept.avgDays}d</span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div
                        className="rounded-full bg-trust-green"
                        style={{ width: `${(dept.resolved / (dept.resolved + dept.pending)) * 100}%` }}
                      />
                      <div
                        className="rounded-full bg-warning-amber"
                        style={{ width: `${(dept.pending / (dept.resolved + dept.pending)) * 100}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Predictive Insights */}
            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-ai-purple" />
                  Predictive Governance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {predictions.map((p, i) => (
                  <motion.div
                    key={p.area}
                    className="p-4 rounded-xl bg-muted/40 border border-border/40"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{p.area}</span>
                      <Badge
                        variant="outline"
                        className={`ml-auto text-[10px] ${
                          p.risk === "high" ? "priority-high" : "priority-medium"
                        }`}
                      >
                        {p.risk} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{p.prediction}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={p.confidence} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{p.confidence}%</span>
                    </div>
                  </motion.div>
                ))}

                <div className="p-3 rounded-xl bg-ai-purple/5 border border-ai-purple/15 text-center">
                  <p className="text-xs text-ai-purple/70">
                    <Brain className="w-3 h-3 inline mr-1" />
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
