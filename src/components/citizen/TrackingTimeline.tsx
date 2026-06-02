"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Brain,
  Building2,
  Eye,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
} from "lucide-react";
import type { TimelineEvent, ComplaintStatus } from "@/types";

const statusConfig: Record<
  ComplaintStatus,
  { icon: React.ElementType; color: string; label: string; labelHi: string }
> = {
  submitted: { icon: FileText, color: "#3B82F6", label: "Complaint Submitted", labelHi: "शिकायत दर्ज" },
  ai_analyzing: { icon: Brain, color: "#7C3AED", label: "AI Analysis Complete", labelHi: "AI विश्लेषण पूर्ण" },
  department_assigned: { icon: Building2, color: "#F59E0B", label: "Department Assigned", labelHi: "विभाग आवंटित" },
  officer_reviewing: { icon: Eye, color: "#06B6D4", label: "Officer Reviewing", labelHi: "अधिकारी समीक्षा" },
  action_in_progress: { icon: Wrench, color: "#F97316", label: "Action In Progress", labelHi: "कार्य प्रगति पर" },
  pending_citizen_confirmation: { icon: Clock, color: "#F59E0B", label: "Awaiting Your Confirmation", labelHi: "आपकी पुष्टि की प्रतीक्षा" },
  resolved: { icon: CheckCircle2, color: "#10B981", label: "Resolved", labelHi: "शिकायत का निवारण" },
  escalated: { icon: AlertTriangle, color: "#EF4444", label: "Escalated", labelHi: "उच्चाधिकारी को प्रेषित" },
  reopened: { icon: RotateCcw, color: "#EF4444", label: "Reopened", labelHi: "पुनः खोली गई" },
};

export function TrackingTimeline({
  events,
  language = "en",
}: {
  events: TimelineEvent[];
  language?: "en" | "hi";
}) {
  const isHi = language === "hi";

  return (
    <div className="relative pl-2">
      {/* Premium Thick Neon Trace Pipe */}
      <div className="absolute left-[27px] top-2 bottom-2 w-[3px] rounded-full bg-linear-to-b from-gov-blue via-ai-purple to-trust-green opacity-90 shadow-[0_0_12px_rgba(124,58,237,0.35)]" />

      <div className="space-y-8">
        {events.map((event, i) => {
          const config = statusConfig[event.status];
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              className="relative flex gap-5 items-start"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
            >
              {/* Pulse & Glow Timeline Node */}
              <div className="relative z-10 shrink-0">
                <motion.div
                  className="w-[38px] h-[38px] rounded-xl flex items-center justify-center transition-shadow shadow-lg"
                  style={{
                    background: event.isActive
                      ? `linear-gradient(135deg, ${config.color}, ${config.color}CC)`
                      : `var(--card)`,
                    border: `2px solid ${event.isActive ? 'transparent' : config.color + '40'}`,
                  }}
                  animate={
                    event.isActive
                      ? { 
                          scale: [1, 1.08, 1],
                          boxShadow: [
                            `0 0 0 0px ${config.color}40`,
                            `0 0 0 10px ${config.color}15`,
                            `0 0 0 0px ${config.color}40`
                          ]
                        }
                      : {}
                  }
                  transition={
                    event.isActive 
                      ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } 
                      : {}
                  }
                >
                  <Icon
                    className={`w-[18px] h-[18px] ${event.isActive ? 'animate-pulse' : ''}`}
                    style={{ color: event.isActive ? "white" : config.color }}
                  />
                </motion.div>
              </div>

              {/* High-Fidelity Glassmorphic Detail Card */}
              <div
                className={`flex-1 rounded-2xl p-4.5 transition-all duration-300 transform premium-glow-border ${
                  event.isActive
                    ? "glass-premium border-l-[5px] active active-glow"
                    : "glass-card hover:bg-muted/10"
                }`}
                style={event.isActive ? { borderLeftColor: config.color } : {}}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span
                    className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border"
                    style={{
                      background: `${config.color}0D`,
                      color: config.color,
                      borderColor: `${config.color}25`,
                    }}
                  >
                    {isHi ? config.labelHi : config.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground/80">
                    {new Date(event.timestamp).toLocaleString(isHi ? "hi-IN" : "en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                  {isHi ? event.messageHi : event.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
