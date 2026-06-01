"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Brain,
  Building2,
  FileSearch,
  Send,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Mic,
    step: "01",
    title: "Citizen Submits",
    titleHi: "Citizen Submits",
    description: "Submit via text, voice, or photo. Auto-detects location via GPS.",
    color: "#3B82F6",
    prefix: "INPUT",
    example: '"Gomti Nagar is full of garbage, it is not being collected."',
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes",
    titleHi: "AI Analyzes",
    description: "AI classifies category (Garbage), detects priority (High), and generates officer summary.",
    color: "#7C3AED",
    prefix: "VERDICT",
    example: "Category: Garbage/Sanitation → Priority: High → Urgency: Immediate",
  },
  {
    icon: Building2,
    step: "03",
    title: "Smart Routing",
    titleHi: "Smart Routing",
    description: "Automatically assigns to Lucknow Nagar Nigam with AI-generated action summary.",
    color: "#F59E0B",
    prefix: "ROUTE",
    example: "Assigned: Lucknow Nagar Nigam → Officer: Shri Rajesh Kumar",
  },
  {
    icon: FileSearch,
    step: "04",
    title: "Officer Reviews",
    titleHi: "Officer Reviews",
    description: "Officer gets AI summary, priority tag, and recommended actions on their dashboard.",
    color: "#06B6D4",
    prefix: "SUGGESTION",
    example: "Deploy sanitation crew to Sector 12, Gomti Nagar",
  },
  {
    icon: Send,
    step: "05",
    title: "Citizen Notified",
    titleHi: "Citizen Notified",
    description: "Citizen receives real-time update: \"Your complaint has been successfully forwarded to Lucknow Nagar Nigam.\"",
    color: "#10B981",
    prefix: "NOTIF",
    example: "SMS: \"Your complaint has been successfully forwarded to Lucknow Nagar Nigam.\"",
  },
  {
    icon: CheckCircle2,
    step: "06",
    title: "Auto Follow-Up",
    titleHi: "Auto Follow-Up",
    description: "If unresolved in 3 days, AI auto-escalates to senior officer. Citizen stays informed.",
    color: "#EF4444",
    prefix: "ESCALATION",
    example: "Day 3: Auto-reminder sent → Day 7: Escalated to Commissioner",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 110, 
      damping: 16,
    }
  },
};

export function DemoWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [coords, setCoords] = useState<{ x: number; y: number }[]>([]);

  const updateCoords = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords = [];
    for (let i = 0; i < 6; i++) {
      const ref = stepRefs.current[i];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        newCoords.push({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        });
      } else {
        newCoords.push({ x: 0, y: 0 });
      }
    }
    setCoords(newCoords);
  };

  useEffect(() => {
    updateCoords();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateCoords);
      
      let observer: ResizeObserver | null = null;
      if ("ResizeObserver" in window && containerRef.current) {
        observer = new ResizeObserver(() => {
          updateCoords();
        });
        observer.observe(containerRef.current);
      }

      // Safeguard interval to ensure coordinates are synchronized as page loads/animations settle
      const interval = setInterval(updateCoords, 250);

      return () => {
        window.removeEventListener("resize", updateCoords);
        if (observer) observer.disconnect();
        clearInterval(interval);
      };
    }
  }, []);

  const generatePath = () => {
    if (coords.length < 6) return "";
    const [p0, p1, p2, p3, p4, p5] = coords;

    // Dynamic Snake Timeline Layout Math (S-curves down the center gap channel on desktop)
    // Step 01 -> Step 02 (Straight horizontal across the gap)
    let d = `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;

    // Step 02 -> Step 03 (Graceful center vertical S-curve)
    d += ` C ${p1.x} ${p1.y + 70}, ${p2.x} ${p2.y - 70}, ${p2.x} ${p2.y}`;

    // Step 03 -> Step 04 (Straight horizontal across the gap)
    d += ` L ${p3.x} ${p3.y}`;

    // Step 04 -> Step 05 (Graceful center vertical S-curve)
    d += ` C ${p3.x} ${p3.y + 70}, ${p4.x} ${p4.y - 70}, ${p4.x} ${p4.y}`;

    // Step 05 -> Step 06 (Straight horizontal across the gap)
    d += ` L ${p5.x} ${p5.y}`;

    return d;
  };

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden" id="demo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gov-blue/8 border border-gov-blue/15 text-xs font-semibold text-gov-blue uppercase tracking-wider mb-4 animate-pulse">
            Live Demo Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            See How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            From voice input to automated resolution — in under 5 seconds.
          </p>
        </motion.div>

        {/* Timeline wrapper */}
        <div ref={containerRef} className="relative font-sans">
          
          {/* Mobile vertical line rail (only visible on mobile collapse) */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-[3px] bg-linear-to-b from-blue-500 via-violet-500 to-red-500 rounded-full opacity-35 blur-[1px] md:hidden" />
          <div className="absolute left-[25px] sm:left-[33px] top-0 bottom-0 w-px bg-slate-800/40 md:hidden" />

          {/* Desktop dynamic glowing SVG snake pipeline */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            style={{ zIndex: 0 }}
          >
            <defs>
              <linearGradient id="snake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
                <stop offset="20%" stopColor="#7C3AED" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#10B981" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.85" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {coords.length >= 6 && (
              <>
                {/* Thick underlay route line */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                />
                <path
                  d={generatePath()}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-30"
                />
                {/* Glowing neon pathway line */}
                <motion.path
                  d={generatePath()}
                  fill="none"
                  stroke="url(#snake-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                />
              </>
            )}
          </svg>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-20 relative z-10"
          >
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.step}
                  variants={itemVariants}
                  onAnimationComplete={updateCoords}
                  className={`relative flex gap-4 sm:gap-6 group w-full ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  {/* Step circle container */}
                  <div className="relative z-10 shrink-0">
                    <motion.div
                      ref={(el) => {
                        stepRefs.current[index] = el;
                      }}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-[#090d16]/90 border backdrop-blur-md transition-all duration-300 relative cursor-default"
                      style={{
                        borderColor: `${step.color}35`,
                        background: `radial-gradient(120% 120% at 50% 10%, #090d16 60%, ${step.color}15 100%)`,
                      }}
                      whileHover={{ 
                        scale: 1.08, 
                        rotate: isEven ? 2 : -2,
                        borderColor: step.color,
                      }}
                    >
                      {/* Active Pulse Aura behind Icon */}
                      <span className="absolute -inset-1 rounded-2xl opacity-10 group-hover:opacity-25 transition-opacity blur-xs" style={{ backgroundColor: step.color }} />
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: step.color }} />
                    </motion.div>
                  </div>

                  {/* Content Card with Left Colored Border */}
                  <motion.div 
                    className="glass-card rounded-2xl p-4 sm:p-5 flex-1 relative overflow-hidden transition-all duration-300 hover:bg-slate-900/35 border-l-4 shadow-none border border-slate-900"
                    style={{ borderLeftColor: step.color }}
                    whileHover={{ 
                      y: -4, 
                      scale: 1.005,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded border tracking-wider"
                        style={{
                          background: `${step.color}12`,
                          color: step.color,
                          borderColor: `${step.color}25`
                        }}
                      >
                        STEP {step.step}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors duration-300">{step.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Monospace Command line / Diagnostic console badge box */}
                    <div className="bg-slate-950/80 border border-slate-900/80 rounded-xl p-3.5 text-[10px] sm:text-xs font-mono text-slate-300 flex items-start gap-2.5 shadow-inner relative overflow-hidden group/console">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[14px_24px] pointer-events-none" />
                      <span className="font-bold select-none tracking-wider shrink-0" style={{ color: step.color }}>
                        [{step.prefix}] &gt;
                      </span>
                      <span className="wrap-break-word font-medium text-slate-300 relative z-10 leading-relaxed">{step.example}</span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
