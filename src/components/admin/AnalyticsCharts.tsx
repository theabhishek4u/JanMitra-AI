"use client";

import {
  AreaChart,
  Area,
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
        <div className="lg:col-span-3">
          <Card className="bg-[#12151c] border border-white/10 rounded-xl">
            <CardHeader className="pb-2 border-b border-white/6 mb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                </div>
                Complaint intake & resolution trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.complaintTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181c24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: 12,
                      color: "#f8fafc",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="url(#colorCount)"
                    strokeWidth={2}
                    name="Intake"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10B981"
                    fill="url(#colorResolved)"
                    strokeWidth={2}
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution (pie) */}
        <div className="lg:col-span-2">
          <Card className="bg-[#12151c] border border-white/10 rounded-xl">
            <CardHeader className="pb-2 border-b border-white/6 mb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                  <PieChartIcon className="w-3.5 h-3.5 text-slate-300" />
                </div>
                Department category distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181c24",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: 12,
                      color: "#f8fafc",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend list */}
              <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                {data.categoryDistribution.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                    <span className="ml-auto font-mono text-slate-200">{cat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resolution Speed */}
      <Card className="bg-[#12151c] border border-white/10 rounded-xl">
        <CardHeader className="pb-2 border-b border-white/6 mb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
            <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            Mean resolution turnaround time (SLA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.resolutionSpeed}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} unit="h" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#181c24",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: 12,
                  color: "#f8fafc",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgHours"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 1, r: 3 }}
                name="Avg Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
