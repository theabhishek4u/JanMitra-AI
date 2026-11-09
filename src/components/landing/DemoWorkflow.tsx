"use client";

import { useState } from "react";
import {
  Mic,
  Brain,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  MapPin,
  FileCheck2,
} from "lucide-react";

interface WorkflowStep {
  step: string;
  stage: string;
  title: string;
  description: string;
  icon: any;
  meta: string;
  docketSnippet: {
    label: string;
    value: string;
  }[];
}

const steps: WorkflowStep[] = [
  {
    step: "01",
    stage: "Intake",
    title: "Citizen grievance reporting",
    description:
      "Citizen submits report in Hindi, Hinglish, or English via voice dictation, photo attachment, or web form. Location coordinates are captured automatically.",
    icon: Mic,
    meta: "Multimodal ingestion",
    docketSnippet: [
      { label: "Input format", value: "Acoustic voice (Hinglish)" },
      { label: "Transcript", value: "Gomti Nagar Mithai Chauraha ke paas pipeline leak hai..." },
      { label: "Ward", value: "Ward 42, Lucknow" },
    ],
  },
  {
    step: "02",
    stage: "Analysis",
    title: "Automated triage & urgency grading",
    description:
      "The NLP engine parses the grievance, identifies municipal jurisdiction, computes statutory SLA countdown, and checks against recent duplicate reports.",
    icon: Brain,
    meta: "SLA calculation",
    docketSnippet: [
      { label: "Category", value: "Water Supply & Distribution" },
      { label: "Priority", value: "High (Clean drinking water wastage)" },
      { label: "SLA target", value: "48 hours (Statutory mandate)" },
    ],
  },
  {
    step: "03",
    stage: "Dispatch",
    title: "Nodal department assignment",
    description:
      "Grievance is routed directly to the designated zonal executive engineer. SMS docket confirmation is dispatched to citizen with tracking link.",
    icon: Building2,
    meta: "Nodal assignment",
    docketSnippet: [
      { label: "Department", value: "Uttar Pradesh Jal Nigam (Zone 1)" },
      { label: "Designated officer", value: "Er. Alok Srivastava (EE)" },
      { label: "Docket number", value: "UP-JM-2026-0948" },
    ],
  },
  {
    step: "04",
    stage: "Resolution",
    title: "Field repair & citizen verification",
    description:
      "Field maintenance crew executes physical repair and uploads geo-tagged photo evidence. Ticket resolves only when citizen verifies resolution.",
    icon: CheckCircle2,
    meta: "Verified closure",
    docketSnippet: [
      { label: "Repair logged", value: "150mm pipeline joint welded & pressure-tested" },
      { label: "Evidence", value: "Geo-stamped repair photograph" },
      { label: "Status", value: "Resolved & Citizen Verified" },
    ],
  },
];

export function DemoWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-20 border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0e14] transition-colors" id="workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-12 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Resolution Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            How a grievance progresses from report to verified repair
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Four disciplined milestones ensure transparent public accountability without delays, misrouting, or dropped tickets.
          </p>
        </div>

        {/* 4-Column Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={st.step}
                onClick={() => setActiveStep(idx)}
                className={`rounded-xl border p-5 text-left space-y-4 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-50 dark:bg-[#12151e] border-blue-500/50 shadow-sm"
                    : "bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/6 pb-3">
                  <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                    Step {st.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {st.stage}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{st.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                {/* Micro Docket Metadata Snapshot */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/6 space-y-1.5 font-mono text-[11px]">
                  {st.docketSnippet.map((item, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-slate-800 dark:text-slate-300 text-xs truncate">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="mt-8 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12151e] p-5 sm:p-6 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Active Stage Focus: Step {steps[activeStep].step} — {steps[activeStep].stage}
            </span>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {steps[activeStep].description}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 shrink-0">
            <span>UP Jansunwai Telemetry Protocol</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </section>
  );
}
