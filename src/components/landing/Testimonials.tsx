"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rahul Sharma",
    location: "Gomti Nagar, Lucknow",
    avatar: "RS",
    rating: 5,
    textEn: "My complaint about delayed garbage collection was resolved in 2 days! JanMitra's AI automatically escalated the ticket directly to Nagar Nigam.",
    color: "#3B82F6",
    imgUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Priya Verma",
    location: "Aliganj, Lucknow",
    avatar: "PV",
    rating: 5,
    textEn: "Reported broken street lights by speaking in Hindi. Super easy! I received automatic WhatsApp progress notifications at every step of resolution.",
    color: "#7C3AED",
    imgUrl: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Amit Yadav",
    location: "Vrindavan Yojna, Lucknow",
    avatar: "AY",
    rating: 4,
    textEn: "Sewer water logging in our sector was solved within 36 hours. I uploaded a photo, AI categorized the issue, and instantly notified the local junior engineer.",
    color: "#F59E0B",
    imgUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Sanjay Tiwari",
    location: "Chinhat, Lucknow",
    avatar: "ST",
    rating: 4,
    textEn: "Excellent escalation feature! If local officers delay taking action, JanMitra auto-reminds them and escalates to the senior commissioner for real accountability.",
    color: "#06B6D4",
    imgUrl: "https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Meena Devi",
    location: "Chowk, Lucknow",
    avatar: "MD",
    rating: 3,
    textEn: "Snapped a photo of a dangerous pothole near the busy Chowk market. The AI auto-recognized the road damage and logged the complaint without me typing a word!",
    color: "#10B981",
    imgUrl: "https://images.unsplash.com/photo-1619194617062-5a61b9c6a049?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Vikramaditya Singh",
    location: "Indira Nagar, Lucknow",
    avatar: "VS",
    rating: 5,
    textEn: "Filed a complaint about illegal commercial waste dumping in the public park. The interactive live GPS mapping proved exactly when the cleanup crew completed it.",
    color: "#EF4444",
    imgUrl: "https://images.unsplash.com/photo-1618015358954-115ef1ed1751?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Kiran Mishra",
    location: "Rajajipuram, Lucknow",
    avatar: "KM",
    rating: 4,
    textEn: "Reported stray animal hazard blocking the main intersection. Nagar Nigam's special control team responded quickly. Very impressive safety support!",
    color: "#EC4899",
    imgUrl: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Anand Maurya",
    location: "Hazratganj, Lucknow",
    avatar: "AM",
    rating: 3,
    textEn: "Commercial noise pollution issue at midnight handled extremely tactfully. JanMitra classified it under public safety and auto-notified the municipal inspectors.",
    color: "#14B8A6",
    imgUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&h=120&q=80",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Dynamic Keyframe Injection & Style Overrides for Flat Interactive Layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .animate-marquee-slow {
          animation: marquee-ltr 38s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
        .testimonial-card-override {
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        .testimonial-card-override:hover {
          box-shadow: none !important;
          transform: translateY(-4px) !important;
        }
        .stroke-dash-rect {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          transition: stroke-dashoffset 0.8s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .group:hover .stroke-dash-rect {
          stroke-dashoffset: 0;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-slate-850 dark:text-slate-100">
            Trusted by <span className="gradient-text">Citizens</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Real stories from real people across Uttar Pradesh.
          </p>
        </motion.div>

        {/* Scrolling marquee container with linear gradient mask vignette fade */}
        <div 
          className="relative overflow-hidden w-full py-4"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)'
          }}
        >
          <div className="flex gap-6 w-max animate-marquee-slow">
            {/* Duplicated array elements for infinite loop */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="glass-card testimonial-card-override rounded-2xl p-5 w-[290px] sm:w-[340px] shrink-0 flex flex-col justify-between border border-slate-200 dark:border-slate-900/60 relative overflow-hidden cursor-default select-none border-l-4 group"
                style={{ borderLeftColor: t.color }}
              >
                {/* Dynamic Rounded Border Tracing SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                  <rect
                    x="1.5"
                    y="1.5"
                    width="calc(100% - 3px)"
                    height="calc(100% - 3px)"
                    rx="16"
                    fill="none"
                    stroke={t.color}
                    strokeWidth="2"
                    className="stroke-dash-rect"
                  />
                </svg>

                {/* Glow aura inside card on hover */}
                <span className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur-xs pointer-events-none" style={{ backgroundColor: t.color }} />

                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Quote className="w-6 h-6 shrink-0 mt-0.5" style={{ color: `${t.color}40` }} />
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      &ldquo;{t.textEn}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-2 border-t border-slate-200 dark:border-slate-900/80 pt-3 relative z-10">
                    <Avatar className="w-9 h-9 border" style={{ borderColor: `${t.color}30` }}>
                      <AvatarImage src={t.imgUrl} alt={t.name} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-950 font-semibold text-xs" style={{ color: t.color }}>
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-slate-100">{t.name}</span>
                      <span className="text-[10px] sm:text-xs text-slate-550 dark:text-slate-400 font-medium">{t.location}</span>
                    </div>
                    <div className="ml-auto flex gap-0.5 bg-slate-100/60 dark:bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-900/50">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-3 h-3 fill-warning-amber text-warning-amber"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
