"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-gov-blue via-gov-blue-dark to-ai-purple-dark opacity-95" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-white/90">
            <Bot className="w-4 h-4" />
            Join the Governance Revolution
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Ready to Transform
            <br />
            <span className="text-trust-green-light">Citizen Grievance Resolution?</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Experience AI-powered governance that actually works. File complaints in Hindi,
            get updates automatically, and see real resolution — not just promises.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/citizen">
              <Button
                size="lg"
                className="relative overflow-hidden z-10 bg-white text-gov-blue-dark shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-12 px-8 text-base font-semibold group cursor-pointer before:absolute before:inset-0 before:z-[-1] before:bg-linear-to-r before:from-blue-600 before:via-violet-600 before:to-pink-600 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-500 hover:text-white hover:border-0 border-0"
              >
                <Shield className="w-5 h-5 mr-2" />
                File a Complaint Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden z-10 border-2 border-white/30 bg-transparent text-white hover:text-white hover:border-white/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-12 px-8 text-base cursor-pointer before:absolute before:inset-0 before:z-[-1] before:bg-white/15 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-500"
              >
                View Analytics
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-sm text-white/50">
            <span>✓ Free for Citizens</span>
            <span>✓ 24/7 AI Active</span>
            <span>✓ Multilingual</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
