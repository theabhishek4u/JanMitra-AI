"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Clock, ShieldCheck, Activity } from "lucide-react";

interface LiveResolution {
  district: string;
  category: string;
  time: string;
  id: string;
  department: string;
}

const mockLiveResolutions: LiveResolution[] = [
  { id: "RES-941", district: "Hazratganj, Ward 12", category: "Water pipeline leak", time: "12m ago", department: "Jal Nigam" },
  { id: "RES-942", district: "Gomti Nagar, Ward 42", category: "Garbage collection backlog", time: "34m ago", department: "Nagar Nigam" },
  { id: "RES-943", district: "Alambagh, Ward 08", category: "Faulty transformer repair", time: "1h ago", department: "UPPCL" },
  { id: "RES-944", district: "Indira Nagar, Ward 19", category: "Pothole surface patching", time: "2h ago", department: "PWD" },
  { id: "RES-945", district: "Chowk, Ward 03", category: "Drainage desilting & clearing", time: "3h ago", department: "Jal Nigam" },
  { id: "RES-946", district: "Rajajipuram, Ward 24", category: "Street light pole restoration", time: "4h ago", department: "Nagar Nigam" },
];

const telemetryStats = [
  { label: "Grievances resolved", value: "10,247", delta: "+12% vs last month" },
  { label: "Routing accuracy", value: "98.4%", delta: "+1.2% model gain" },
  { label: "Mean resolution SLA", value: "14.5h", delta: "-3.2h reduction" },
  { label: "Active citizen audit", value: "92.8%", delta: "Direct citizen verification" },
];

export function Statistics() {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % mockLiveResolutions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0c0e14] transition-colors" id="stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-12 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Operational Telemetry
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Civic redressal metrics at state scale
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Real-time performance indicators measuring turnaround velocity, departmental compliance, and citizen satisfaction across Uttar Pradesh.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {telemetryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] p-5 sm:p-6 text-left space-y-2 shadow-xs transition-colors"
            >
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium pt-1">
                {stat.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Live Resolution Audit Ledger Ticker */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] p-5 text-left shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Live Redressal Ledger
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Auto-sync active • Lucknow District
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((offset) => {
              const item = mockLiveResolutions[(tickerIndex + offset) % mockLiveResolutions.length];
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-100 dark:border-white/6 bg-slate-50 dark:bg-white/[0.02] p-3 text-xs space-y-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      {item.id}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {item.time}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.category}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="truncate">{item.district}</span>
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 shrink-0">
                      {item.department}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
