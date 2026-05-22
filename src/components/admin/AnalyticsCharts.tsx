"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";
import type { AnalyticsData } from "@/types";

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsCharts({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* Top row: Trend + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Complaint Trends (wider) */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-premium border border-border/30 shadow-xl shadow-black/5 premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.005]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                <div className="w-7 h-7 rounded-lg bg-gov-blue/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-gov-blue-light" />
                </div>
                Complaint Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.complaintTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      fontSize: 13,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="url(#colorCount)"
                    strokeWidth={2.5}
                    name="Filed"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10B981"
                    fill="url(#colorResolved)"
                    strokeWidth={2.5}
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution (pie) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-premium border border-border/30 shadow-xl shadow-black/5 premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.005]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                <div className="w-7 h-7 rounded-lg bg-ai-purple/10 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4 text-ai-purple-light" />
                </div>
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend grid */}
              <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                {data.categoryDistribution.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs text-muted-foreground/90 font-semibold">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                    <span className="ml-auto font-extrabold text-foreground/90">{cat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Resolution Speed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-premium border border-border/30 shadow-xl shadow-black/5 premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.002]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
              <div className="w-7 h-7 rounded-lg bg-trust-green/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-trust-green" />
              </div>
              Resolution Speed Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.resolutionSpeed}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="#10B981"
                  strokeWidth={3.5}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                  name="Avg Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
