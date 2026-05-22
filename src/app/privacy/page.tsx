"use client";

import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, Key, Database, FileCheck, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicyPage() {
  const securityFeatures = [
    {
      icon: Database,
      title: "Row-Level Security (RLS)",
      desc: "All grievance tables implement strict Postgres RLS policies. Citizen accounts can only query, read, or update their own grievance records, verified via cryptographically signed JWTs.",
      color: "from-blue-500 to-gov-blue",
    },
    {
      icon: Key,
      title: "AES-256 Field Encryption",
      desc: "Sensitive identity attributes—such as phone numbers, email addresses, and GPS coordinate strings—are encrypted at rest inside the database using AES-256 GCM encryption before writing to disk.",
      color: "from-purple-500 to-ai-purple",
    },
    {
      icon: EyeOff,
      title: "Zero-Knowledge Nodal Access",
      desc: "Only assigned administrative officers and department heads within the designated circle receive decrypted access to citizen identity files, logging all decryption keys.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: FileCheck,
      title: "DPDP Act 2023 Alignment",
      desc: "Architected around India's Digital Personal Data Protection Act, supporting instant citizen data deletion requests, transparent consent parameters, and immediate security breach alerts.",
      color: "from-emerald-500 to-trust-green",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28 pb-16 bg-background relative overflow-hidden">
        {/* Futuristic glowing blurred background orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gov-blue/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-ai-purple/5 rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs & Header */}
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 border-gov-blue/30 text-gov-blue bg-gov-blue/5 font-bold uppercase tracking-wider px-3 py-1">
                Security & Data Integrity
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground/90"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Privacy Policy
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Learn how JanMitra AI safeguards Uttar Pradesh citizen identity datasets using next-generation cryptographic models and government-grade database compliance policies.
            </motion.p>
          </div>

          {/* Interactive Cryptographic Shield Live Simulator */}
          <motion.div
            className="glass rounded-3xl p-6 md:p-8 mb-12 border border-border/40 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-trust-green/5 rounded-full filter blur-xl pointer-events-none animate-pulse" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-trust-green to-trust-green-dark flex items-center justify-center shadow-lg shadow-trust-green/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground/90">Autonomous Encryption Shield</h3>
                  <p className="text-xs text-muted-foreground">Real-time Aadhaar & GPS protection telemetry active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-trust-green rounded-full animate-pulse" />
                <span className="text-xs font-mono font-bold text-trust-green uppercase tracking-widest">DPDP COMPLIANT</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gov-blue rounded-full" />
                  Database Row Verification
                </h4>
                <div className="bg-muted/40 font-mono rounded-xl p-3 border border-border/20 text-xs text-muted-foreground/90 leading-normal">
                  <p className="text-gov-blue font-bold">// Supabase Row-Level Policy</p>
                  <p className="text-ai-purple font-semibold">CREATE POLICY</p> "Citizen read access"
                  <p className="pl-4">ON public.complaints FOR SELECT</p>
                  <p className="pl-4 text-foreground/80 font-bold">USING (auth.uid() = citizen_id);</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-ai-purple rounded-full" />
                  AES-256 Hash Cloak
                </h4>
                <div className="bg-muted/40 font-mono rounded-xl p-3 border border-border/20 text-xs text-muted-foreground/90 leading-normal">
                  <p className="text-trust-green font-bold">// Encrypted Field Mock Telemetry</p>
                  <p>RAW: <span className="text-danger-red font-semibold">+91 99887 76655</span></p>
                  <p className="text-foreground/90 font-bold">ENCRYPTED: <span className="text-trust-green">aes::gcm::u23b49axb8f2c...</span></p>
                  <p>STATUS: <span className="text-trust-green font-bold">Ciphertext Hardened</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Policy Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {securityFeatures.map((feat, index) => (
              <motion.div
                key={feat.title}
                className="glass-card rounded-2xl p-6 border border-border/20 hover:border-primary/20 transition-all duration-300"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base text-foreground/90 mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Plain Text Policy Content */}
          <motion.div
            className="space-y-8 text-foreground/80 leading-relaxed text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <hr className="border-border/30" />
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gov-blue" />
                1. Data We Collect and Analyze
              </h2>
              <p>
                JanMitra AI process two categories of grievance records:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground/90">Grievance Narrative Metadata:</strong> Description, category classifications, administrative urgency scores, uploaded physical environment images, and geo-coordinates.
                </li>
                <li>
                  <strong className="text-foreground/90">Citizen Identity Attributes:</strong> Full name, verified mobile contact number, registered email, and optional national Aadhaar identifiers to ensure strict accountability.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                <Lock className="w-5 h-5 text-ai-purple" />
                2. Automated Nodal Officer Data Routing
              </h2>
              <p>
                To prevent organizational leakages, our AI agent automatically routes complaints straight to assigned nodal officers. We do not sell or monetize personal datasets to third-party advert groups. Decryption of citizen names and contact records is strictly gatekept and triggered only for the direct investigation of grievances.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-trust-green" />
                3. Global Standards and India DPDP 2023 Compliance
              </h2>
              <p>
                Under Section 6 of the DPDP Act 2023, citizens possess complete authority to revoke consent at any moment. You can trigger complete purging of your contact parameters directly through the JanMitra support desk at <span className="text-gov-blue font-semibold underline">support@janmitra.gov.in</span>.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
