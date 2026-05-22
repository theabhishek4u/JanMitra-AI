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
} from "lucide-react";
import type { TimelineEvent, ComplaintStatus } from "@/types";

const statusConfig: Record<ComplaintStatus, { icon: React.ElementType; color: string; label: string }> = {
  submitted: { icon: FileText, color: "#3B82F6", label: "Complaint Submitted" },
  ai_analyzing: { icon: Brain, color: "#7C3AED", label: "AI Analysis Complete" },
  department_assigned: { icon: Building2, color: "#F59E0B", label: "Department Assigned" },
  officer_reviewing: { icon: Eye, color: "#06B6D4", label: "Officer Reviewing" },
  action_in_progress: { icon: Wrench, color: "#F97316", label: "Action In Progress" },
  resolved: { icon: CheckCircle2, color: "#10B981", label: "Resolved" },
  escalated: { icon: AlertTriangle, color: "#EF4444", label: "Escalated" },
};

export function TrackingTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gov-blue via-ai-purple to-trust-green" />

      <div className="space-y-6">
        {events.map((event, i) => {
          const config = statusConfig[event.status];
          const Icon = config.icon;
          const isLast = i === events.length - 1;

          return (
            <motion.div
              key={event.id}
              className="relative flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
            >
              {/* Node */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: event.isActive
                      ? `linear-gradient(135deg, ${config.color}, ${config.color}CC)`
                      : `${config.color}15`,
                    border: `2px solid ${config.color}${event.isActive ? "" : "30"}`,
                  }}
                  animate={
                    event.isActive
                      ? { scale: [1, 1.08, 1], boxShadow: [`0 0 0 0 ${config.color}00`, `0 0 0 8px ${config.color}20`, `0 0 0 0 ${config.color}00`] }
                      : {}
                  }
                  transition={event.isActive ? { duration: 2, repeat: Infinity } : {}}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: event.isActive ? "white" : config.color }}
                  />
                </motion.div>
              </div>

              {/* Content */}
              <div
                className={`flex-1 rounded-xl p-4 transition-all ${
                  event.isActive
                    ? "glass-card border-l-4"
                    : "bg-muted/30 border border-border/30"
                }`}
                style={event.isActive ? { borderLeftColor: config.color } : {}}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: `${config.color}15`,
                      color: config.color,
                    }}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">{event.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
