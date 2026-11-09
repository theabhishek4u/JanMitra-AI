"use client";

import { ShieldCheck, CheckCircle2, MapPin } from "lucide-react";

interface Testimonial {
  name: string;
  ward: string;
  docketId: string;
  department: string;
  timeToResolve: string;
  quote: string;
}

const verifiedReports: Testimonial[] = [
  {
    name: "Rahul Sharma",
    ward: "Gomti Nagar, Ward 42",
    docketId: "UP-JM-2026-0948",
    department: "UP Jal Nigam",
    timeToResolve: "14 hours",
    quote:
      "Reported a burst water main overflowing onto the road. JanMitra identified the pipeline jurisdiction and dispatched the Jal Nigam maintenance team without me having to visit any office.",
  },
  {
    name: "Priya Verma",
    ward: "Aliganj, Ward 15",
    docketId: "UP-JM-2026-0812",
    department: "Lucknow Nagar Nigam",
    timeToResolve: "24 hours",
    quote:
      "Dictated my complaint in Hindi using the voice feature. The garbage dump near our sector school was cleared and the zonal officer uploaded photo verification for my confirmation.",
  },
  {
    name: "Amit Yadav",
    ward: "Vrindavan Yojana, Ward 31",
    docketId: "UP-JM-2026-0745",
    department: "UPPCL Power Dept",
    timeToResolve: "18 hours",
    quote:
      "Transformer spark issue was categorized as high priority. The SLA countdown kept the field crew accountable, and I received automatic SMS updates at every milestone.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0e14] transition-colors" id="verification">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-12 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Public Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Citizen redressal cases verified on the ground
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every grievance closes only when the citizen verifies the repair with photographic evidence and digital sign-off.
          </p>
        </div>

        {/* 3 Verified Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {verifiedReports.map((item) => (
            <div
              key={item.docketId}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12151e] p-6 text-left space-y-4 shadow-xs transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/6 pb-3">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Resolution</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    SLA: {item.timeToResolve}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/6 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </span>
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                    {item.docketId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{item.ward}</span>
                  <span className="font-mono text-[10px]">{item.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
