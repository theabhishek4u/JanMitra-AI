"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp, Search, Info, MapPin, Sparkles, Send } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the AI classify my grievance and assign the department?",
      answer: "When you submit a complaint via text or voice, JanMitra's AI pipeline (utilizing state-of-the-art LLMs) processes your description. It analyzes key contextual tokens (e.g. 'leakage', 'pothole', 'refuse heap') to understand your issue, determines the appropriate department (e.g. PWD, Jal Nigam, Power Corporation), and extracts a detailed briefing summary for the designated administrative team.",
      category: "AI & Dispatching",
    },
    {
      question: "What should I do if my complaint is routed to the wrong department?",
      answer: "Our system has an automated feedback loop. If a department feels a grievance does not belong in their division, the Nodal Officer can suggest a re-routing request. The system also permits you to click the 'Request Category Edit' indicator to correct the department assignment.",
      category: "Re-routing & Corrections",
    },
    {
      question: "How does the GPS geo-pinning system work on the map?",
      answer: "When filing a new complaint, JanMitra AI automatically captures your device's GPS coordinates (subject to standard web browser permissions) to pinpoint the exact location on our OpenStreetMap/Leaflet integration. You can also manually adjust the coordinates on the interactive visual map during step 2 of submission.",
      category: "GPS & Map Navigation",
    },
    {
      question: "What is the Nodal Officer response SLA structure?",
      answer: "Grievances are tracked against high-fidelity SLA deadlines: Critical urgency (24 hours), High urgency (48 hours), and Medium/Low urgency (72 hours). If no action is recorded before the deadline, the AI engine triggers a notification directly to higher-tier officers, such as the Sub-Divisional Magistrate (SDM) or District Commissioner.",
      category: "Escalations & SLAs",
    },
    {
      question: "Can I submit voice records or images in local Hindi dialects?",
      answer: "Yes! The voice transcription layer seamlessly translates Hindi, Hinglish, Urdu, and regional dialects into highly structured English briefs for government officers, ensuring that language is never a barrier to fast governance.",
      category: "Languages & Dialects",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28 pb-16 bg-background relative overflow-hidden">
        {/* Soft atmospheric background glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-gov-blue/5 rounded-full filter blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-ai-purple/5 rounded-full filter blur-[140px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 border-gov-blue/30 text-gov-blue bg-gov-blue/5 font-bold uppercase tracking-wider px-3 py-1">
                Citizen Help Desk
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground/90"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Help Center
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Have a question about the JanMitra AI platform? Browse our list of frequently asked questions below or search using the dynamic filter.
            </motion.p>
          </div>

          {/* Search Input Bar */}
          <motion.div
            className="relative mb-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 h-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search help topics, departments, or AI workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-6 bg-muted/30 border border-border/40 focus:border-primary/50 rounded-2xl shadow-inner text-sm font-semibold transition-all"
            />
          </motion.div>

          {/* Interactive FAQs Accordion */}
          <motion.div
            className="space-y-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {filteredFaqs.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-border/20">
                <Info className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="font-bold text-base text-foreground/80 mb-1">No matching topics found</h4>
                <p className="text-xs text-muted-foreground">Try using simpler keywords like 'SLA', 'GPS', or 'Hindi'.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => {
                const isExpanded = expandedIndex === i;
                return (
                  <div
                    key={faq.question}
                    className="glass rounded-2xl border border-border/30 overflow-hidden transition-all duration-300 shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base hover:bg-muted/20 transition-colors cursor-pointer text-foreground/90"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-gov-blue/80 flex-shrink-0" />
                        {faq.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-border/10">
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold">
                              {faq.answer}
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/20 bg-primary/5">
                                {faq.category}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold">Was this helpful? Yes / No</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </motion.div>

          {/* Quick Guide Visual Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {[
              { title: "1. File Complaint", desc: "Speak or type your grievance and upload environment photo.", icon: Send },
              { title: "2. Real-time GPS", desc: "Validate and pin coordinates on the interactive visual map.", icon: MapPin },
              { title: "3. Auto Dispatch", desc: "Our AI classifies and alerts the circle engineer instantly.", icon: Sparkles },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                className="glass-card rounded-2xl p-5 border border-border/20 text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
                  <step.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground/90 mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
