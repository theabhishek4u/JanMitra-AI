"use client";

import { motion } from "framer-motion";
import { Scale, Clock, ShieldAlert, Award, FileText, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";

export default function TermsOfServicePage() {
  const slaThresholds = [
    {
      level: "CRITICAL Priority",
      time: "Within 24 Hours",
      escalation: "Auto-escalates to Chief Engineer / Commissioner",
      desc: "Water line ruptures, high-voltage spark events, and massive public safety disruptions.",
      borderColor: "border-danger-red/20 hover:border-danger-red/40",
      badgeColor: "bg-danger-red/10 text-danger-red border-danger-red/20",
    },
    {
      level: "HIGH Priority",
      time: "Within 48 Hours",
      escalation: "Auto-escalates to Ward Nodal Officer",
      desc: "Open sewage lines, dangerous road potholes, and localized municipal garbage heaps.",
      borderColor: "border-warning-amber/20 hover:border-warning-amber/40",
      badgeColor: "bg-warning-amber/10 text-warning-amber border-warning-amber/20",
    },
    {
      level: "MEDIUM Priority",
      time: "Within 72 Hours",
      escalation: "Auto-escalates to Circle Assistant Engineer",
      desc: "Dysfunctional sector streetlights, general administrative delays, and water pressure concerns.",
      borderColor: "border-gov-blue/20 hover:border-gov-blue/40",
      badgeColor: "bg-gov-blue/10 text-gov-blue border-gov-blue/20",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28 pb-16 bg-background relative overflow-hidden">
        {/* Glowing visual backdrop */}
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-gov-blue/5 rounded-full filter blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-ai-purple/5 rounded-full filter blur-[130px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 border-ai-purple/30 text-ai-purple bg-ai-purple/5 font-bold uppercase tracking-wider px-3 py-1">
                Platform Rules & Service SLAs
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground/90"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Terms of Service
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Understand our rigid service level agreements (SLAs), operational boundaries, escalation workflows, and legal citizen reporting rules.
            </motion.p>
          </div>

          {/* Service Level Agreement (SLA) Matrix */}
          <motion.div
            className="glass rounded-3xl p-6 md:p-8 mb-12 border border-border/40"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-border/30">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center shadow-lg shadow-gov-blue/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground/90">Autonomous SLA Escalation Matrix</h3>
                <p className="text-xs text-muted-foreground">Rigid automated reminders mapped strictly to urgency markers</p>
              </div>
            </div>

            <div className="space-y-6">
              {slaThresholds.map((sla, i) => (
                <div
                  key={sla.level}
                  className={`glass-card rounded-2xl p-5 border ${sla.borderColor} transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 ${sla.badgeColor}`}>
                        {sla.level}
                      </Badge>
                      <span className="text-xs font-mono font-bold text-muted-foreground">SLA Deadline: {sla.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-semibold">{sla.desc}</p>
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Escalation path</div>
                    <span className="text-xs font-bold text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg inline-block">
                      {sla.escalation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Core Terms Sections */}
          <motion.div
            className="space-y-8 text-foreground/80 leading-relaxed text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <hr className="border-border/30" />

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                <Scale className="w-5 h-5 text-gov-blue" />
                1. Citizen Code of Conduct
              </h2>
              <p>
                JanMitra AI is designed solely for public welfare and civic grievance reporting. Citizens must strictly avoid:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Filing duplicate or fraudulent complaints at identical coordinate points.
                </li>
                <li>
                  Using inflammatory, aggressive, or politically motivated narrative copy in complaint descriptions.
                </li>
                <li>
                  Uploading unrelated digital assets or falsified image evidence designed to deceive administrative checks.
                </li>
              </ul>
              <p className="text-xs text-muted-foreground font-semibold italic bg-muted/30 rounded-xl p-3 border border-border/10">
                Warning: Multiple false declarations will lead to automated warning alerts and possible device fingerprint blocking under UP e-governance administrative penal codes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-ai-purple" />
                2. Autonomous AI Classification & Dispatching
              </h2>
              <p>
                By using JanMitra AI, you acknowledge that our neural pipeline (utilizing Gemini models) automatically reads raw inputs, determines severity tags, assigns administrative departments, and extracts summary points for human officers. While the pipeline maintains a high classification precision range, users can trigger category modifications if they feel a dispatch was routed to an incorrect municipal branch.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                <Award className="w-5 h-5 text-trust-green" />
                3. SLA Response Standards
              </h2>
              <p>
                Government department units strive to complete and resolve tickets in accordance with our stated SLA timeline matrix. However, extremely complex infrastructure challenges—such as complete roadway structural refitting or municipal sewage pipe repairs—may extend compliance terms, in which case the assigned officer will publish progressive timeline status updates directly onto the citizen timeline tracking view.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
