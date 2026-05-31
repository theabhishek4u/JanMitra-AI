"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Bot, Code2, Cpu, Layers, Layout, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom premium inline SVG icons to prevent lucide dependency import issues
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const team = [
  {
    name: "Abhishek Kumar",
    role: "Full Stack Developer",
    bio: "Engineered robust full-stack workflows, reactive Next.js web application views, client state management systems, and interactive interface math.",
    color: "#3B82F6",
    avatar: "AK",
    imgUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abhishek&accessories=prescription02&top=shortHair&hairColor=black&mouth=smile",
    skills: ["Next.js", "System Arch", "Node.js", "TailwindCSS"],
    icon: Code2,
    contributions: [
      "Full-Stack Workflow Architectures",
      "Next.js App Router Page Views",
      "Client State & UI Integrations",
      "Responsive Flex & Grid Math",
    ],
  },
  {
    name: "Rajeshwar Tiwari",
    role: "UI/UX Designer",
    bio: "Created beautiful design systems, futuristic dark glassmorphic layouts, consistent color palettes, typography rules, and animated visual assets.",
    color: "#7C3AED",
    avatar: "RT",
    imgUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajeshwar&top=curly&hairColor=brown&mouth=smile",
    skills: ["UI/UX Design", "Color Tokens", "Marquee Layouts", "Aesthetics"],
    icon: Layout,
    contributions: [
      "Glassmorphic Design Frameworks",
      "Premium Color & Design Tokens",
      "Interactive Layout Animations",
      "Visual Brand Assets & Marquees",
    ],
  },
  {
    name: "Aman Maurya",
    role: "Backend Developer",
    bio: "Built robust FastAPI route APIs, clean relational database schemas in PostgreSQL, server controllers, and optimized background process workflows.",
    color: "#10B981",
    avatar: "AM",
    imgUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman&top=shortHair&hairColor=black&mouth=smile",
    skills: ["FastAPI", "PostgreSQL", "APIs", "Voice Integration"],
    icon: Cpu,
    contributions: [
      "FastAPI API Router Endpoints",
      "PostgreSQL Schema & Queries",
      "Server Business Logic Controls",
      "Database Optimization & Crons",
    ],
  },
  {
    name: "Saksham Bajpai",
    role: "Research, Documentation & Git Manager",
    bio: "Conducted extensive legal framework compliance research, compiled technical project documents, and governed version control Git systems.",
    color: "#F59E0B",
    avatar: "SB",
    imgUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saksham&accessories=prescription01&top=frizzle&hairColor=black&mouth=smile",
    skills: ["Git Control", "Legal Research", "Technical Docs", "Analytics"],
    icon: Layers,
    contributions: [
      "Legal & Policy Research Audits",
      "GitHub Version Control & Pulls",
      "Technical Documentation & Wikis",
      "Team Workflow Standardizations",
    ],
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

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 15 },
  },
};

export default function DevelopersPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans pb-12">
      {/* Decorative space glow backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gov-blue/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-ai-purple/5 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Header Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center relative">
              <span className="absolute -inset-1 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple opacity-20 blur-[2px] group-hover:opacity-40 transition-opacity" />
              <Bot className="w-5 h-5 text-white relative z-10" />
            </div>
            <div>
              <div className="font-bold text-base gradient-text-blue leading-none">JanMitra</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                AI Governance
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 flex flex-col justify-center relative z-10 w-full">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-purple/8 border border-ai-purple/15 text-[10px] font-semibold text-ai-purple uppercase tracking-widest mb-4">
            The Engineering Minds
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-slate-100">
            Meet the <span className="gradient-text-blue">Developers</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            The core team that conceptualized, coded, and engineered JanMitra's next-generation AI Smart Governance platform.
          </p>
        </div>

        {/* Developers 2-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto w-full"
        >
          {team.map((dev) => {
            const IconComponent = dev.icon;
            return (
              <motion.div
                key={dev.name}
                variants={cardVariants}
                className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 border border-slate-900 relative overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-2 shadow-xl"
                style={{
                  background: `radial-gradient(circle at 90% 10%, ${dev.color}0d, transparent 50%), rgba(15, 23, 42, 0.45)`,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                {/* Subtle colored accent strip on the left side of the card */}
                <div className="absolute top-0 left-0 w-[4px] h-full" style={{ backgroundColor: dev.color }} />

                {/* Left Side: Avatar, Role Badge, Social Nodes */}
                <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-5 relative z-10 w-full md:w-auto shrink-0">
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div 
                      className="w-20 h-20 rounded-full border-2 p-0.5 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                      style={{ 
                        borderColor: `${dev.color}40`,
                        boxShadow: `0 0 20px ${dev.color}1a`
                      }}
                    >
                      <Avatar className="w-full h-full border-none">
                        <AvatarImage src={dev.imgUrl} alt={dev.name} className="object-cover animate-fade-in" />
                        <AvatarFallback className="bg-slate-950 font-bold text-xl" style={{ color: dev.color }}>
                          {dev.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="text-center md:text-left">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-100 group-hover:text-white transition-colors duration-300 leading-tight">
                        {dev.name}
                      </h3>
                      <p className="text-[10px] font-bold tracking-wider uppercase mt-1 leading-tight" style={{ color: dev.color }}>
                        {dev.role}
                      </p>
                    </div>
                  </div>

                  {/* Links and Role Indicator Icon */}
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg bg-slate-950 border flex items-center justify-center transition-all duration-300"
                      style={{ borderColor: `${dev.color}15` }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color: dev.color }} />
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="#"
                        className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 flex items-center justify-center transition-all duration-300 hover:bg-slate-900"
                      >
                        <GithubIcon className="w-3.5 h-3.5 text-slate-400 hover:text-white transition-colors" />
                      </a>
                      <a
                        href="#"
                        className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 flex items-center justify-center transition-all duration-300 hover:bg-slate-900"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5 text-slate-400 hover:text-white transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Side: Bio, Key Contributions List, and Skill Tags */}
                <div className="flex-1 flex flex-col justify-between gap-5 relative z-10 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-900/60 md:pl-6 sm:pl-8">
                  <div className="space-y-4">
                    <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed">
                      {dev.bio}
                    </p>

                    {/* Highly Premium Contributions Checklist Block */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Key Contributions
                      </h4>
                      <ul className="space-y-1.5 pt-1">
                        {dev.contributions.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-300 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: dev.color }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Skills Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {dev.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[9px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider"
                        style={{
                          background: `${dev.color}08`,
                          color: `${dev.color}cc`,
                          borderColor: `${dev.color}15`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer Block */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-8 relative z-10 w-full flex justify-center mt-12">
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          © 2026 JanMitra AI — Government of Uttar Pradesh. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
