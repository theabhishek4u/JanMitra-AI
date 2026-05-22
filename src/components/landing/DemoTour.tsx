"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Play,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  HelpCircle,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoTour() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [autofilled, setAutofilled] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Auto-set steps based on pathname
  useEffect(() => {
    if (pathname.includes("/citizen")) {
      setCurrentStep(1);
    } else if (pathname.includes("/officer")) {
      setCurrentStep(2);
    } else if (pathname.includes("/admin")) {
      setCurrentStep(3);
    } else {
      setCurrentStep(0); // On landing page or elsewhere
    }
  }, [pathname]);

  if (!isDemo) {
    // Show a floating "Try AI Demo" pulsing badge to invite the judge to explore
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => router.push("/citizen?demo=true")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-gov-blue via-ai-purple to-gov-blue-light border border-primary/40 rounded-full text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(124,58,237,0.35)] cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 group"
          animate={{
            boxShadow: [
              "0 0 15px rgba(124,58,237,0.3)",
              "0 0 25px rgba(124,58,237,0.6)",
              "0 0 15px rgba(124,58,237,0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-4 h-4 text-white animate-spin-slow group-hover:rotate-12 transition-transform" />
          <span>Interactive AI Tour</span>
        </motion.button>
      </div>
    );
  }

  if (!isVisible) return null;

  const triggerAutofill = () => {
    window.dispatchEvent(new CustomEvent("janmitra-autofill"));
    setAutofilled(true);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      router.push("/officer?demo=true");
    } else if (currentStep === 2) {
      router.push("/admin?demo=true");
    } else if (currentStep === 3) {
      router.push("/?demo=false");
      setIsVisible(false);
    }
  };

  const getStepConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Citizen Portal Tour",
          avatar: "🤖",
          advisorName: "Mitra AI — Citizen Guide",
          instruction: autofilled 
            ? "Fabulous! The visual hazard scanning laser is analyzing the Gomti Nagar garbage pile. Review the classified tags, then scroll down to press the 'Submit & Analyze with AI' button!"
            : "Welcome, Judge! Let's simulate a live citizen complaint. Click the button below to auto-fill a real garbage disposal complaint in Gomti Nagar, Lucknow.",
          actionText: autofilled ? "Waiting for submission..." : "Auto-Fill Demo Data",
          action: triggerAutofill,
          disabled: autofilled,
          nextPath: "/officer?demo=true",
          nextText: "Go to Officer Console",
        };
      case 2:
        return {
          title: "Officer Dashboard Tour",
          avatar: "👮",
          advisorName: "Mitra AI — Governance Console",
          instruction: "Look! Your newly filed Gomti Nagar garbage ticket is sitting at the top of the queue. Select it, inspect the visual laser markers, add notes, and advance its status to 'In Progress'.",
          actionText: "Advance to Admin Board",
          action: () => router.push("/admin?demo=true"),
          disabled: false,
          nextPath: "/admin?demo=true",
          nextText: "View Admin Analytics",
        };
      case 3:
        return {
          title: "Executive Admin Portal",
          avatar: "📊",
          advisorName: "Mitra AI — Insights Core",
          instruction: "Stunning! Observe how the stats counts, resolution dials, Lucknow heatmap pins, and Recharts performance modules automatically synchronized in real-time with zero database lag.",
          actionText: "Finish Tour",
          action: () => {
            router.push("/?demo=false");
            setIsVisible(false);
          },
          disabled: false,
          nextPath: "/",
          nextText: "Return to Home",
        };
      default:
        return {
          title: "JanMitra AI Guided Tour",
          avatar: "🤖",
          advisorName: "Mitra AI — Master Guide",
          instruction: "Let's explore JanMitra's end-to-end autonomous flow. Click below to enter the Citizen Portal and file an AI-classified complaint.",
          actionText: "Start Citizen Demo",
          action: () => router.push("/citizen?demo=true"),
          disabled: false,
          nextPath: "/citizen?demo=true",
          nextText: "Go to Citizen Page",
        };
    }
  };

  const config = getStepConfig();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence>
        {minimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setMinimized(false)}
            className="ml-auto flex items-center gap-2 px-3 py-2 bg-card/95 border border-primary/30 rounded-xl text-primary font-bold text-xs uppercase shadow-2xl backdrop-blur-xl cursor-pointer"
          >
            <Bot className="w-4 h-4 animate-bounce text-primary" />
            <span>Restore Guide</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="glass-card premium-glow-border rounded-3xl p-5 shadow-2xl bg-card/95 backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Holographic background cyber grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-full filter blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gov-blue/10 rounded-full filter blur-xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-border/50 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-pulse">{config.avatar}</span>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    {config.title}
                  </h4>
                  <p className="text-[10px] font-bold text-primary tracking-wider -mt-0.5">
                    {config.advisorName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/40 transition-colors cursor-pointer text-xs font-semibold"
                >
                  Min
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 text-muted-foreground hover:text-danger-red rounded-lg hover:bg-danger-red/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="py-4 space-y-3 relative z-10">
              <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                {config.instruction}
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {currentStep === 1 && !autofilled ? (
                  <Button
                    onClick={config.action}
                    disabled={config.disabled}
                    className="w-full justify-center bg-gradient-to-r from-gov-blue to-ai-purple text-white rounded-xl py-5 font-extrabold shadow-lg shadow-gov-blue/20 hover:scale-[1.01] transition-transform cursor-pointer relative overflow-hidden"
                  >
                    <div className="holo-scanline" />
                    <Sparkles className="w-4 h-4 mr-2 text-white animate-pulse" />
                    {config.actionText}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-trust-green bg-trust-green/5 border border-trust-green/20 rounded-xl px-3 py-2.5">
                    <CheckCircle2 className="w-4 h-4 text-trust-green flex-shrink-0 animate-bounce" />
                    <span>
                      {currentStep === 1
                        ? "Autofill Active! Scanner engaged. Submit below!"
                        : currentStep === 2
                        ? "Interactive queue item live-updated."
                        : "Analytics recalculated instantly!"}
                    </span>
                  </div>
                )}

                {/* Progress Indicators */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                          currentStep === s
                            ? "bg-gradient-to-r from-gov-blue to-ai-purple w-8"
                            : currentStep > s
                            ? "bg-trust-green"
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={nextStep}
                    className="text-xs font-extrabold text-primary hover:text-primary-hover hover:bg-primary/5 p-0 pr-1 cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{config.nextText}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Achievement Footer Badge */}
            <div className="mt-1 pt-2 border-t border-border/40 flex items-center gap-2 text-[10px] text-muted-foreground/80 font-semibold relative z-10">
              <Award className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              <span>Hackathon Judge Mode Activated</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
