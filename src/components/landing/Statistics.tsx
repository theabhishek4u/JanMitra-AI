"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, Clock, ShieldCheck, Activity } from "lucide-react";

const stats = [
  { value: 10247, label: "Complaints Resolved", suffix: "+", color: "#10B981" },
  { value: 98, label: "AI Routing Accuracy", suffix: "%", color: "#7C3AED" },
  { value: 14.5, label: "Avg Resolution Time", suffix: "h", color: "#1D4ED8" },
  { value: 92, label: "Citizen Satisfaction", suffix: "%", color: "#F59E0B" },
];

interface LiveResolution {
  district: string;
  category: string;
  time: string;
  id: string;
}

const mockLiveResolutions: LiveResolution[] = [
  { id: "RES-941", district: "Hazratganj, Lucknow", category: "Water Pipeline Leak", time: "12 hours ago" },
  { id: "RES-942", district: "Gomti Nagar, Lucknow", category: "Garbage Pile Cleanup", time: "8 hours ago" },
  { id: "RES-943", district: "Sector 15, Noida", category: "Streetlight Restoration", time: "16 hours ago" },
  { id: "RES-944", district: "Civil Lines, Prayagraj", category: "Pothole Filling", time: "4 hours ago" },
  { id: "RES-945", district: "Taj Ganj, Agra", category: "Sewage Line Fix", time: "18 hours ago" },
  { id: "RES-946", district: "Sigra, Varanasi", category: "Drainage Cleaning", time: "2 hours ago" },
];

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let animFrame: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      }
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [target, duration, start]);

  return count;
}

function StatCard({
  value,
  label,
  suffix,
  color,
  delay,
}: {
  value: number;
  label: string;
  suffix: string;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 2000, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className="glass-card premium-glow-border rounded-2xl p-6 text-center backdrop-blur-md relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      {/* Dynamic glow background */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-5 pointer-events-none filter blur-xl"
        style={{ backgroundColor: color }}
      />

      <div className="text-4xl sm:text-5xl font-extrabold mb-2 font-mono flex items-center justify-center tracking-tight" style={{ color }}>
        {count.toLocaleString()}
        <span className="text-2xl font-bold ml-0.5">{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

export function Statistics() {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Cycle recent resolution feed items
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % mockLiveResolutions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Display a triplet for continuous motion feed
  const activeResolution = mockLiveResolutions[tickerIndex];
  const nextResolution = mockLiveResolutions[(tickerIndex + 1) % mockLiveResolutions.length];
  const thirdResolution = mockLiveResolutions[(tickerIndex + 2) % mockLiveResolutions.length];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration grid */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-trust-green/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-trust-green/10 border border-trust-green/20 text-xs font-bold text-trust-green uppercase tracking-wider mb-4 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Metrics
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Transforming <span className="gradient-text">Governance</span> at Scale
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Providing transparency, accountabilty, and velocity to citizen complaints across Uttar Pradesh.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.08} />
          ))}
        </div>

        {/* Recent Resolutions Live Activity Ticker Mockup */}
        <motion.div
          className="glass-card premium-glow-border rounded-2xl p-6 md:p-8 backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/50 pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-trust-green/10 flex items-center justify-center text-trust-green radar-glow relative">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">Recent Resolved Grievances</h3>
                <p className="text-xs text-muted-foreground">Auto-Escalation & Resolution Audit Ticker</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/60 border border-border/40 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-trust-green animate-ping" />
              <span>LIVE DATABASE COUNTER</span>
            </div>
          </div>

          {/* Scrolling ticker grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {[activeResolution, nextResolution, thirdResolution].map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  className="bg-muted/30 border border-border/30 rounded-xl p-4.5 flex flex-col justify-between h-[120px] transition-all hover:bg-muted/50 hover:border-border/60"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">TICKET {item.id}</span>
                    <span className="text-[10px] font-bold text-trust-green bg-trust-green/8 border border-trust-green/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-trust-green" /> RESOLVED
                    </span>
                  </div>
                  
                  <div className="my-2">
                    <h4 className="text-xs font-bold text-foreground/90">{item.category}</h4>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gov-blue" />
                      {item.district}
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 pt-1.5 border-t border-border/20">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>Resolution: {item.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
