"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";

interface DocketStep {
  id: string;
  status: string;
  badgeClass: string;
  department: string;
  officer: string;
  ward: string;
  citizen: string;
  note: string;
  elapsedHours: number;
}

const docketCycle: DocketStep[] = [
  {
    id: "UP-JM-2026-0948",
    status: "Case registered",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    department: "Classification in progress",
    officer: "Awaiting nodal assignment",
    ward: "Gomti Nagar, Ward 42",
    citizen: "Rahul Sharma",
    note: "Drinking water pipeline leakage near Mithai Chauraha. Thousands of gallons overflowing onto main road since 06:00 AM.",
    elapsedHours: 0,
  },
  {
    id: "UP-JM-2026-0948",
    status: "Assigned & dispatched",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    department: "Uttar Pradesh Jal Nigam (Zone 1)",
    officer: "Er. Alok Srivastava (Executive Engineer)",
    ward: "Gomti Nagar, Ward 42",
    citizen: "Rahul Sharma",
    note: "Water distribution main isolated. Repair crew #04 dispatched with suction pumps and replacement valves.",
    elapsedHours: 2,
  },
  {
    id: "UP-JM-2026-0948",
    status: "Resolved & verified",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    department: "Uttar Pradesh Jal Nigam (Zone 1)",
    officer: "Er. Alok Srivastava (Executive Engineer)",
    ward: "Gomti Nagar, Ward 42",
    citizen: "Rahul Sharma",
    note: "150mm pipeline joint welded and pressure-tested. Road surface cleared. Citizen confirmed resolution.",
    elapsedHours: 14,
  },
];

export function Hero() {
  const [stepIndex, setStepIndex] = useState(1);
  const [session, setSession] = useState<{ role: string; email: string } | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % docketCycle.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const docket = docketCycle[stepIndex];

  return (
    <section className="relative min-h-[90vh] flex items-center bg-slate-50 dark:bg-[#0c0e14] pt-28 pb-20 border-b border-slate-200 dark:border-white/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Clear Copy & Direct Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 px-3 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span>Government of Uttar Pradesh • Jansunwai AI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
              Public grievances redressed directly by local municipal bodies
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Citizens file reports in Hindi, Hinglish, or English. JanMitra categorizes the issue, geocodes coordinates, and routes tickets to Nagar Nigam, Jal Nigam, or PWD in seconds.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/citizen">
                <Button className="h-11 px-5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm">
                  <span>File a grievance</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/citizen?tab=track">
                <Button
                  variant="outline"
                  className="h-11 px-5 rounded-lg text-sm font-medium border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  <span>Track existing case</span>
                </Button>
              </Link>
            </div>

            {/* Quiet Nodal Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200 dark:border-white/[0.06]">
              <div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  10,247
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Resolved cases</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  98.4%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Routing accuracy</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  14.5h
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg resolution time</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  75
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Districts active</div>
              </div>
            </div>
          </div>

          {/* Right Column: The Hero Moment (Authentic Municipal Case Docket) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] shadow-xl dark:shadow-2xl p-6 text-left space-y-5 transition-colors">
              
              {/* Docket Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                      {docket.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Public Docket</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{docket.ward}</span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${docket.badgeClass} transition-colors`}
                >
                  {docket.status}
                </span>
              </div>

              {/* Citizen Incident Excerpt */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Citizen Report ({docket.citizen})
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg p-3">
                  &ldquo;{docket.note}&rdquo;
                </p>
              </div>

              {/* Department Routing Metadata */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Assigned Authority
                  </span>
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{docket.department}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Nodal Officer
                  </span>
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="truncate">{docket.officer}</span>
                  </div>
                </div>
              </div>

              {/* SLA & Dispatch Timeline Indicator */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>SLA target: 48h</span>
                </div>
                <span className="tabular-nums">
                  {docket.elapsedHours > 0 ? `${docket.elapsedHours}h elapsed` : "Dispatched just now"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
