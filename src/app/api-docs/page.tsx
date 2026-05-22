"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Copy, Check, BookOpen, Send, Layers, Sparkles } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";

export default function ApiDocsPage() {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const curlCode = `curl -X POST "https://api.janmitra.gov.in/v1/grievances/analyze" \\
  -H "Authorization: Bearer YOUR_API_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "rawText": "Sector 14 main road pothole has caused an accident today.",
    "audioUrl": null,
    "imageUrl": "https://storage.janmitra.gov.in/evidence/img-4921.jpg",
    "district": "Lucknow",
    "coordinates": "26.8467, 80.9462"
  }'`;

  const requestPayload = `{
  "rawText": "Water line leak near crossing hazratganj",
  "audioUrl": "https://storage.janmitra.gov.in/voice/audio-9812.mp3",
  "imageUrl": null,
  "district": "Lucknow",
  "coordinates": "26.8504, 80.9496"
}`;

  const responsePayload = `{
  "status": "success",
  "data": {
    "complaintId": "JM-2026-X8A2",
    "detectedLanguage": "English",
    "analysis": {
      "category": "Water Supply & Sewage Management",
      "priority": "CRITICAL",
      "assignedDepartment": "Lucknow Jal Nigam (Zone 1)",
      "assignedOfficer": "Er. Alok Srivastava (Executive Engineer)",
      "confidenceScore": 0.98,
      "aiSummary": "Drinking water leakage near Hazratganj crossing causing severe flooding and massive water wastage."
    },
    "slaDeadline": "2026-05-23T21:47:56.000Z",
    "trackingUrl": "https://janmitra.gov.in/citizen?tab=track&id=JM-2026-X8A2"
  }
}`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28 pb-16 bg-background relative overflow-hidden">
        {/* Soft decorative visual grids and orbs */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-gov-blue/5 rounded-full filter blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-[550px] h-[550px] bg-ai-purple/5 rounded-full filter blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 border-gov-blue/30 text-gov-blue bg-gov-blue/5 font-bold uppercase tracking-wider px-3 py-1">
                Developer Documentation
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground/90"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              API Reference
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Programmatically dispatch grievances, query analysis results, and poll real-time tracking updates directly into custom apps.
            </motion.p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: "API Endpoint", value: "api.janmitra.gov.in", icon: Terminal },
              { label: "Payload Protocol", value: "JSON / REST", icon: Layers },
              { label: "Neural Engine", value: "Gemini 1.5 Pro", icon: Sparkles },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card rounded-2xl p-5 border border-border/20 flex items-center gap-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                  <stat.icon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</div>
                  <div className="text-sm font-bold text-foreground/90 mt-0.5">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-12">
            {/* cURL Section */}
            <motion.section
              className="space-y-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-gov-blue" />
                  1. Analysis Endpoint cURL
                </h2>
                <button
                  onClick={() => copyToClipboard(curlCode, setCopiedCurl)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2.5 py-1 rounded-lg border border-border/30 hover:bg-muted bg-muted/20"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-trust-green" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <div className="bg-muted/40 font-mono rounded-2xl p-4.5 border border-border/20 text-xs text-muted-foreground/90 leading-relaxed overflow-x-auto shadow-inner">
                <pre>{curlCode}</pre>
              </div>
            </motion.section>

            {/* Payloads Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Payload */}
              <motion.section
                className="space-y-4"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground/90 flex items-center gap-2">
                    <Send className="w-4 h-4 text-ai-purple" />
                    Request Schema (JSON)
                  </h3>
                  <button
                    onClick={() => copyToClipboard(requestPayload, setCopiedPayload)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2 py-1 rounded-lg border border-border/20 bg-muted/20"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-trust-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="bg-muted/40 font-mono rounded-2xl p-4 border border-border/20 text-xs text-muted-foreground/90 leading-relaxed overflow-x-auto shadow-inner h-[260px]">
                  <pre>{requestPayload}</pre>
                </div>
              </motion.section>

              {/* Response Payload */}
              <motion.section
                className="space-y-4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground/90 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-trust-green" />
                    Response Schema (JSON)
                  </h3>
                  <button
                    onClick={() => copyToClipboard(responsePayload, setCopiedResponse)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2 py-1 rounded-lg border border-border/20 bg-muted/20"
                  >
                    {copiedResponse ? <Check className="w-3.5 h-3.5 text-trust-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="bg-muted/40 font-mono rounded-2xl p-4 border border-border/20 text-xs text-muted-foreground/90 leading-relaxed overflow-x-auto shadow-inner h-[260px]">
                  <pre>{responsePayload}</pre>
                </div>
              </motion.section>
            </div>

            {/* Field Definitions */}
            <motion.section
              className="space-y-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-lg font-bold text-foreground/90 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-trust-green" />
                Parameters Dictionary
              </h3>
              <div className="glass rounded-2xl overflow-hidden border border-border/40 text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/30 text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
                      <th className="p-4">Key</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {[
                      { key: "rawText", type: "string | null", desc: "Text narrative of the grievance, supporting Hindi, Urdu, Hinglish, and English." },
                      { key: "audioUrl", type: "string | null", desc: "URI location of vocal recordings for our automatic voice-to-text transcript analyzer." },
                      { key: "imageUrl", type: "string | null", desc: "URI location of photographic visual assets to parse street evidence coordinates." },
                      { key: "category", type: "string", desc: "Neutral department classification returned by the AI agent engine." },
                      { key: "priority", type: "enum", desc: "Confidence priority ranking score: CRITICAL, HIGH, MEDIUM, or LOW." },
                    ].map((row) => (
                      <tr key={row.key} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground/95">{row.key}</td>
                        <td className="p-4 font-mono text-xs text-primary/90 font-semibold">{row.type}</td>
                        <td className="p-4 text-xs text-muted-foreground">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
