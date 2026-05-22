"use client";

import { motion } from "framer-motion";
import { Bot, ShieldAlert, CheckCircle2, MessageSquare, Clock, Zap } from "lucide-react";
import type { Complaint } from "@/types";

interface AgentLog {
  day: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  icon: React.ElementType;
  color: string;
  type: "success" | "warning" | "info" | "action";
}

export function AIAgentFollowUpPanel({ complaint, language }: { complaint: Complaint; language: "en" | "hi" }) {
  const isHi = language === "hi";

  // Dynamic simulation logs based on complaint status
  const getAgentLogs = (c: Complaint): AgentLog[] => {
    const logs: AgentLog[] = [
      {
        day: "Day 1 (0h)",
        title: "Grievance Auto-Classification",
        titleHi: "शिकायत स्वतः-वर्गीकरण",
        description: `AI Agent parsed text, categorized under "${c.category}" with ${Math.round(c.aiConfidence * 100)}% confidence, and assigned to ${c.department}.`,
        descriptionHi: `AI एजेंट ने विवरण का विश्लेषण कर इसे ${Math.round(c.aiConfidence * 100)}% सटीकता के साथ "${c.categoryHi}" श्रेणी में वर्गीकृत कर ${c.departmentHi} को आवंटित किया।`,
        icon: Bot,
        color: "#7C3AED",
        type: "success"
      }
    ];

    if (c.imageUrl) {
      logs.push({
        day: "Day 1 (0.1h)",
        title: "AI Vision Scan & Evidence Extraction",
        titleHi: "AI विज़न स्कैन एवं साक्ष्य निष्कर्षण",
        description: "Vision model analyzed uploaded photo. Confirmed visual evidence of civic issue. Metadata tagged for department inspection.",
        descriptionHi: "विज़न मॉडल ने अपलोड की गई तस्वीर का विश्लेषण किया। समस्या के दृश्य साक्ष्यों की पुष्टि कर विभाग हेतु टैग किया गया।",
        icon: Zap,
        color: "#10B981",
        type: "success"
      });
    }

    logs.push({
      day: "Day 1 (0.5h)",
      title: "Vernacular SMS Status Sent",
      titleHi: "हिंदी एसएमएस स्टेटस प्रेषित",
      description: `Dispatched auto-SMS to citizen: "आपकी शिकायत ${c.departmentHi} को भेज दी गई है..."`,
      descriptionHi: `नागरिक को स्वचालित एसएमएस प्रेषित: "आपकी शिकायत ${c.departmentHi} को भेज दी गई है..."`,
      icon: MessageSquare,
      color: "#3B82F6",
      type: "info"
    });

    if (c.status !== "submitted" && c.status !== "ai_analyzing") {
      logs.push({
        day: "Day 2 (24h)",
        title: "Autonomous Officer Push & Reminder",
        titleHi: "अधिकारी को स्वचालित अलर्ट प्रेषित",
        description: `Agent tracked SLA. Sent automated priority push notification to assigned officer ${c.assignedOfficer || "concerned officer"}.`,
        descriptionHi: `एजेंट ने समयावधि (SLA) की निगरानी की। संबंधित अधिकारी ${c.assignedOfficer || "संबंधित अधिकारी"} को त्वरित समाधान हेतु अलर्ट भेजा।`,
        icon: Clock,
        color: "#F59E0B",
        type: "action"
      });
    }

    if (c.escalationLevel > 0 || c.status === "escalated" || c.status === "officer_reviewing" || c.status === "action_in_progress" || c.status === "resolved") {
      logs.push({
        day: "Day 3 (48h)",
        title: "SLA Threshold Audit & Warning",
        titleHi: "SLA समय-सीमा ऑडिट एवं चेतावनी",
        description: "No corrective resolution uploaded. AI Agent autonomously generated escalation warning alert to ward commissioner.",
        descriptionHi: "समाधान अपलोड नहीं होने के कारण, AI एजेंट ने वार्ड कमिश्नर को स्वचालित एस्केलेशन चेतावनी भेजी।",
        icon: ShieldAlert,
        color: "#EF4444",
        type: "warning"
      });
    }

    if (c.status === "action_in_progress" || c.status === "resolved") {
      logs.push({
        day: "Day 4 (72h)",
        title: "Field Progress Verified",
        titleHi: "धरातलीय प्रगति का सत्यापन",
        description: "AI Agent captured department telemetry: Action initiated on site. Dispatched citizen vernacular SMS update.",
        descriptionHi: "AI एजेंट ने विभाग से विवरण प्राप्त किया: धरातल पर काम शुरू हो चुका है। नागरिक को हिंदी में प्रगति अपडेट भेजा गया।",
        icon: Zap,
        color: "#06B6D4",
        type: "action"
      });
    }

    if (c.status === "resolved") {
      logs.push({
        day: "Day 5 (96h)",
        title: "AI Vision Resolution Verification",
        titleHi: "AI विज़न समाधान सत्यापन",
        description: "Officer resolution photo analyzed using AI Vision. Confirmed issue resolved. Sent final Hindi status report and closure code to citizen.",
        descriptionHi: "अधिकारी द्वारा अपलोड समाधान तस्वीर का विज़न मॉडल से सत्यापन किया गया। निवारण की पुष्टि के बाद अंतिम रिपोर्ट व क्लोजर कोड भेजा गया।",
        icon: CheckCircle2,
        color: "#10B981",
        type: "success"
      });
    }

    return logs;
  };

  const logs = getAgentLogs(complaint);

  return (
    <div className="glass-card premium-glow-border rounded-2xl p-6 space-y-4 text-left">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-ai-purple/10 flex items-center justify-center border border-ai-purple/20">
          <Bot className="w-4 h-4 text-ai-purple animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground/90">
            {isHi ? "एजेंट स्वायत्त अनुवर्ती फीड" : "AI Agent Autonomous Follow-up Feed"}
          </h3>
          <p className="text-[10px] text-muted-foreground/80 font-medium">
            {isHi ? "स्वचालित ट्रैकिंग, अलर्ट एवं नागरिक सूचनाएं" : "Real-time background audits, status pings & citizen updates"}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {logs.map((log, idx) => {
          const Icon = log.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-start gap-3 text-xs leading-relaxed"
            >
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                style={{
                  backgroundColor: `${log.color}15`,
                  borderColor: `${log.color}25`,
                  color: log.color
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-bold text-foreground/90">{isHi ? log.titleHi : log.title}</span>
                  <span className="font-mono text-[9px] text-muted-foreground font-semibold flex-shrink-0 bg-muted/60 px-1.5 py-0.5 rounded-md">{log.day}</span>
                </div>
                <p className="text-muted-foreground font-medium text-[11px]">
                  {isHi ? log.descriptionHi : log.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
