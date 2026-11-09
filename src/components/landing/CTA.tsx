"use client";

import Link from "next/link";
import { ArrowRight, Shield, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0c0e14] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] p-8 sm:p-12 text-left relative overflow-hidden shadow-xs">
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/8 px-3 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Government of Uttar Pradesh Civic Gateway</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Report a civic issue or access administrative command
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Citizens can file reports without registration. Zonal municipal officers and secretariat administrators can log in to monitor ward SLAs and dispatch resolution teams.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link href="/citizen">
                <Button className="h-11 px-5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>File a grievance</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-11 px-5 rounded-lg text-sm font-medium border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Landmark className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
                  <span>Portal login (Citizen / Officer / Admin)</span>
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
