"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  User,
  Shield,
  BarChart3,
  Bot,
  ArrowRight,
  Sparkles,
  Lock,
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  
  // Login Gate States
  const [activeLoginForm, setActiveLoginForm] = useState<"officer" | "admin" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [triggerShake, setTriggerShake] = useState(false);
  const [activeSessionRole, setActiveSessionRole] = useState<string | null>(null);

  // Track field focus for high-fidelity animations
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Clear any previous bad session state on load
    const session = localStorage.getItem("janmitra_auth");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role === "officer" || parsed.role === "admin") {
          setActiveSessionRole(parsed.role);
        }
      } catch (e) {
        localStorage.removeItem("janmitra_auth");
      }
    }

    // Parse role from query string
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "officer" || roleParam === "admin") {
        setActiveLoginForm(roleParam);
      }
    }
  }, []);

  // Officer & Admin roles list (Citizen removed for direct access)
  const roles = [
    {
      id: "officer",
      title: "Officer Console",
      titleHi: "अधिकारी कंसोल",
      description: "Access municipal command controls, override route assignments, inspect real-time STT transcripts, and coordinate action plans.",
      href: "/officer",
      icon: Shield,
      color: "#F59E0B",
      glowClass: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] border-amber-500/40 hover:border-amber-400",
      badge: "Official Credentials Required",
      roleKey: "UP-GOV-OFFICER",
      district: "Lucknow Central",
    },
    {
      id: "admin",
      title: "Admin Panel",
      titleHi: "प्रशासक पैनल",
      description: "Audit cross-departmental performance metrics, manage SLA auto-escalations, and review predictive municipal diagnostics.",
      href: "/admin",
      icon: BarChart3,
      color: "#7C3AED",
      glowClass: "shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)] border-purple-500/40 hover:border-purple-400",
      badge: "Secretariat & CAG Audit",
      roleKey: "UP-GOV-SECRETARIAT",
      district: "UP Headquarters",
    },
  ];

  // Helper to retrieve color details for selected console
  const getThemeColors = (roleId: string | null) => {
    if (roleId === "officer") {
      return {
        solid: "#F59E0B",
        glow: "rgba(245, 158, 11, 0.15)",
        glowStrong: "rgba(245, 158, 11, 0.45)",
        badgeBg: "rgba(245, 158, 11, 0.1)",
        text: "text-amber-500",
        border: "border-amber-500/25",
        gradient: "from-amber-500 via-amber-600 to-yellow-500",
      };
    }
    if (roleId === "admin") {
      return {
        solid: "#7C3AED",
        glow: "rgba(124, 58, 237, 0.15)",
        glowStrong: "rgba(124, 58, 237, 0.45)",
        badgeBg: "rgba(124, 58, 237, 0.1)",
        text: "text-purple-500",
        border: "border-purple-500/25",
        gradient: "from-purple-500 via-purple-600 to-indigo-600",
      };
    }
    // Default brand blend colors
    return {
      solid: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.12)",
      glowStrong: "rgba(59, 130, 246, 0.35)",
      badgeBg: "rgba(59, 130, 246, 0.08)",
      text: "text-blue-500",
      border: "border-blue-500/20",
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
    };
  };

  const activeRole = activeLoginForm || hoveredRole;
  const theme = getThemeColors(activeRole);

  const handleRoleSelect = (roleId: string, href: string) => {
    // Check if session already exists for this role
    const session = localStorage.getItem("janmitra_auth");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role === roleId) {
          setLoading(true);
          setSuccess(true);
          setTimeout(() => {
            router.push(href);
          }, 600);
          return;
        }
      } catch (e) {
        localStorage.removeItem("janmitra_auth");
      }
    }

    // Otherwise, transition to Login Form
    setEmail("");
    setPassword("");
    setError(null);
    setShowPassword(false);
    setActiveLoginForm(roleId as "officer" | "admin");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTriggerShake(false);

    if (!email.trim() || !password.trim()) {
      setError("Please enter security credentials.");
      setTriggerShake(true);
      return;
    }

    setLoading(true);

    // Simulate cryptographic mainframe decryption verification
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      let isValid = false;

      if (activeLoginForm === "officer") {
        if ((normalizedEmail === "officer@gmail.com" || normalizedEmail === "officers@gmail.com") && password === "1122") {
          isValid = true;
        }
      } else if (activeLoginForm === "admin") {
        if (normalizedEmail === "admin@gmail.com" && password === "1234") {
          isValid = true;
        }
      }

      if (isValid) {
        // Save session
        const authData = {
          role: activeLoginForm,
          email: normalizedEmail,
          authenticatedAt: new Date().toISOString(),
        };
        localStorage.setItem("janmitra_auth", JSON.stringify(authData));
        
        // Dispatch event so layout and navbar sync instantly
        window.dispatchEvent(new Event("storage"));
        
        setSuccess(true);
        setLoading(false);
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push(activeLoginForm === "officer" ? "/officer" : "/admin");
        }, 800);
      } else {
        setLoading(false);
        setError("Cryptographic verification failed. Check credentials and keycodes.");
        setTriggerShake(true);
      }
    }, 1200);
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  };

  if (!mounted) return null;

  const currentRoleConfig = roles.find((r) => r.id === activeLoginForm);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Global CSS Style tag for highly reliable performance-friendly animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes panGrid {
          0% { background-position: 0px 0px; }
          100% { background-position: 64px 64px; }
        }
        .animate-pan-grid {
          animation: panGrid 20s linear infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 40s linear infinite;
        }
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow-reverse {
          animation: spinSlowReverse 50s linear infinite;
        }
        @keyframes laser-sweep {
          0% { top: -5%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        .animate-laser-sweep {
          animation: laser-sweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />

      {/* 1. Endless Scrolling Grid Background Matrix */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_75%,transparent_100%)] opacity-20 pointer-events-none animate-pan-grid"
      />
      
      {/* 2. Rotating Digital HUD Radars */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.06] z-0">
        <svg className="w-[750px] h-[750px] text-white animate-spin-slow" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="95" strokeWidth="0.5" strokeDasharray="3 5" />
          <circle cx="100" cy="100" r="82" strokeWidth="0.25" />
          <circle cx="100" cy="100" r="68" strokeWidth="0.75" strokeDasharray="25 8 5 8" />
          <line x1="100" y1="5" x2="100" y2="195" strokeWidth="0.25" strokeDasharray="2 2" />
          <line x1="5" y1="100" x2="195" y2="100" strokeWidth="0.25" strokeDasharray="2 2" />
        </svg>
        <svg className="absolute w-[500px] h-[500px] text-white animate-spin-slow-reverse" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="90" strokeWidth="0.3" strokeDasharray="1 10" />
          <circle cx="100" cy="100" r="75" strokeWidth="0.5" strokeDasharray="15 30 10 15" />
          <circle cx="100" cy="100" r="50" strokeWidth="0.25" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* 3. Orbiting & Scaling Ambient Blur Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main interactive color orb */}
        <motion.div
          className="absolute rounded-full filter blur-[120px] opacity-25"
          style={{
            width: "500px",
            height: "500px",
            top: "10%",
            left: "15%",
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            backgroundColor: activeRole === "officer" ? "rgba(245, 158, 11, 0.28)" : activeRole === "admin" ? "rgba(124, 58, 237, 0.28)" : "rgba(59, 130, 246, 0.2)",
          }}
          transition={{
            x: { duration: 16, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 16, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 0.6 },
          }}
        />

        {/* Secondary shifting orb */}
        <motion.div
          className="absolute rounded-full filter blur-[130px] opacity-20"
          style={{
            width: "550px",
            height: "550px",
            bottom: "15%",
            right: "10%",
          }}
          animate={{
            x: [0, -45, 50, 0],
            y: [0, 50, -25, 0],
            backgroundColor: activeRole === "officer" ? "rgba(251, 191, 36, 0.16)" : activeRole === "admin" ? "rgba(167, 139, 250, 0.16)" : "rgba(124, 58, 237, 0.15)",
          }}
          transition={{
            x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 0.6 },
          }}
        />

        {/* Fixed green core brand orb */}
        <motion.div
          className="absolute rounded-full filter blur-[100px] opacity-10"
          style={{
            width: "400px",
            height: "400px",
            bottom: "10%",
            left: "25%",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{
            x: { duration: 14, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 14, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </div>

      {/* Main Content Interface Container */}
      <div className="max-w-4xl w-full z-10 space-y-8 text-center px-4 relative">
        <AnimatePresence mode="wait">
          {!activeLoginForm ? (
            
            // ================== HIGH-FIDELITY DUAL SELECTOR ==================
            <motion.div
              key="role-selector"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Core Platform Brand Header */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="relative group">
                  {/* Glowing background ring */}
                  <div 
                    className="absolute -inset-1.5 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-glow"
                    style={{
                      background: `linear-gradient(135deg, ${theme.solid}, #3B82F6)`,
                    }}
                  />
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/50 flex items-center justify-center shadow-2xl">
                    <Bot className="w-9 h-9 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
                  <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    JanMitra AI
                  </h1>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
                    Autonomous Governance & Command Platform
                  </p>
                </div>
                
                <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                  Secured portal gateway for official personnel and platform superintendents. Direct biometric verification enabled.
                </p>

                <Badge variant="outline" className="gap-1.5 px-3 py-1 font-extrabold border-slate-700 bg-slate-900/50 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  Uttar Pradesh Secretariat Administration
                </Badge>
              </div>

              {/* 2-Column Professional Gateway Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mx-auto pt-4">
                {roles.map((role, i) => {
                  const isHovered = hoveredRole === role.id;
                  const isActiveSession = activeSessionRole === role.id;
                  
                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                      onMouseEnter={() => setHoveredRole(role.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                      onClick={() => handleRoleSelect(role.id, role.href)}
                    >
                      <div className="block group h-full">
                        <Card
                          className="h-full glass-premium border relative overflow-hidden transition-all duration-300 hover:scale-[1.03] text-left cursor-pointer flex flex-col justify-between bg-slate-950/40"
                          style={{
                            borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.08)",
                            boxShadow: isActiveSession 
                              ? `0 0 25px -5px ${role.color}50` 
                              : isHovered 
                              ? `0 0 25px -8px ${role.color}40` 
                              : "0 4px 20px -8px rgba(0,0,0,0.5)",
                          }}
                        >
                          {/* Sleek corner accent brackets that dynamically light up */}
                          <div 
                            className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.15)" }} 
                          />
                          <div 
                            className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.15)" }} 
                          />
                          <div 
                            className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.15)" }} 
                          />
                          <div 
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.15)" }} 
                          />
                          
                          <CardContent className="p-6 md:p-8 relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-5">
                              
                              {/* Glowing Icon Hub */}
                              <div className="flex items-center justify-between">
                                <div
                                  className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                                  style={{
                                    background: isHovered || isActiveSession ? `${role.color}15` : "rgba(255, 255, 255, 0.02)",
                                    borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.1)",
                                    boxShadow: isHovered || isActiveSession ? `inset 0 0 10px ${role.color}25` : "none",
                                  }}
                                >
                                  <role.icon 
                                    className="w-7 h-7 transition-transform duration-300" 
                                    style={{ color: isHovered || isActiveSession ? role.color : "#94a3b8" }} 
                                  />
                                </div>

                                <span className="font-mono text-[10px] text-slate-500 font-bold tracking-wider">
                                  {role.roleKey}
                                </span>
                              </div>

                              {/* Titles & Description */}
                              <div className="space-y-1">
                                {isActiveSession ? (
                                  <Badge className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-pulse gap-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Active Session
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 border-slate-800 bg-slate-900/40 text-slate-400 rounded-full">
                                    {role.badge}
                                  </Badge>
                                )}
                                
                                <h3 
                                  className="text-xl font-bold text-white transition-colors pt-2"
                                  style={{ color: isHovered ? role.color : "#ffffff" }}
                                >
                                  {role.title}
                                </h3>
                                <span className="text-[11px] text-slate-400 font-bold block">
                                  {role.titleHi}
                                </span>
                                
                                <p className="text-xs text-slate-400 leading-relaxed pt-2">
                                  {role.description}
                                </p>
                              </div>
                            </div>

                            {/* Link CTA action strip */}
                            <div 
                              className="flex items-center justify-between gap-1.5 text-xs font-bold transition-colors border-t border-slate-900 pt-4 mt-auto"
                              style={{ color: isActiveSession ? "#10b981" : isHovered ? role.color : "#94a3b8" }}
                            >
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-medium">DISTRICT ASSIGNMENT</span>
                                <span className="text-xs text-slate-300 font-bold">{role.district}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{isActiveSession ? "Resume" : "Authorize"}</span>
                                <ArrowRight className={`w-3.5 h-3.5 ${isActiveSession ? "translate-x-0.5" : "group-hover:translate-x-1.5"} transition-transform`} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Secure Notice Footer */}
              <motion.div
                className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-2 bg-slate-900/30 border border-slate-900 px-4 py-2.5 rounded-full w-fit mx-auto mt-4 shadow-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Lock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>Authorized credentials mandatory. Access logs are archived for regulatory audit review.</span>
              </motion.div>
            </motion.div>
          ) : (
            
            // ================== CYBER LOGIN GATEWAY PANEL ==================
            <motion.div
              key="role-login-form"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full mx-auto"
            >
              {/* Futuristic Back Navigation */}
              <button
                onClick={() => {
                  setActiveLoginForm(null);
                  setError(null);
                  setTriggerShake(false);
                }}
                className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors bg-slate-900/50 hover:bg-slate-900 border border-slate-800/40 hover:border-slate-800 px-4 py-2 rounded-full cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Return to Command Console</span>
              </button>

              {/* Login main frame wrapper */}
              <motion.div
                variants={shakeVariants}
                animate={triggerShake ? "shake" : "default"}
              >
                <Card
                  className="glass-premium border shadow-2xl relative overflow-hidden text-left bg-slate-950/60"
                  style={{
                    borderColor: `${theme.solid}40`,
                    boxShadow: `0 0 40px -10px ${theme.solid}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  {/* Laser scan lines sweeping down when decryption is in process */}
                  {loading && (
                    <div 
                      className="absolute left-0 w-full h-[3px] opacity-90 pointer-events-none z-20 animate-laser-sweep"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${theme.solid}, #ffffff, ${theme.solid}, transparent)`,
                        boxShadow: `0 0 15px 4px ${theme.solid}`,
                      }}
                    />
                  )}

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: theme.solid }} />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: theme.solid }} />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: theme.solid }} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: theme.solid }} />

                  <CardContent className="p-8 space-y-6 relative">
                    
                    {/* Header Block */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-300 hover:scale-105"
                        style={{
                          background: `${theme.solid}12`,
                          borderColor: theme.solid,
                          boxShadow: `inset 0 0 8px ${theme.solid}15`,
                        }}
                      >
                        {currentRoleConfig && (
                          <currentRoleConfig.icon
                            className="w-7 h-7 animate-pulse"
                            style={{ color: theme.solid }}
                          />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                          {currentRoleConfig?.title} Access
                        </h2>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                          {currentRoleConfig?.titleHi} • SECURE TERMINAL GATE
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed border-b border-slate-900 pb-4 font-medium">
                      Decrypt your local dashboard files using security clearance keycodes to establish a secure administrative session.
                    </p>

                    {/* Authenticator Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      
                      {/* Email Input Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" style={{ color: emailFocused ? theme.solid : "#64748b" }} />
                          Official Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            placeholder="e.g. name@up.gov.in"
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-medium"
                            style={{
                              borderColor: emailFocused ? theme.solid : "rgba(255, 255, 255, 0.08)",
                              boxShadow: emailFocused ? `0 0 12px ${theme.solid}20` : "none",
                            }}
                            required
                            disabled={loading || success}
                          />
                        </div>
                      </div>

                      {/* Password Input Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-slate-500" style={{ color: passwordFocused ? theme.solid : "#64748b" }} />
                          Security Passkey / Code
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            placeholder="••••"
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl pl-4 pr-10 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-medium tracking-[0.25em]"
                            style={{
                              borderColor: passwordFocused ? theme.solid : "rgba(255, 255, 255, 0.08)",
                              boxShadow: passwordFocused ? `0 0 12px ${theme.solid}20` : "none",
                            }}
                            required
                            disabled={loading || success}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            disabled={loading || success}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Error Box Notice */}
                      {error && (
                        <motion.div
                          className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2.5 shadow-md animate-pulse"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {/* Decryption status tracker */}
                      {loading && (
                        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-900 pt-2 animate-pulse">
                          <span>[CLEARANCE SHA-256 PARSING]</span>
                          <span>EST. DELAY ~ 0.4S</span>
                        </div>
                      )}

                      {/* Submit Actions */}
                      <div className="space-y-3 pt-2">
                        <Button
                          type="submit"
                          disabled={loading || success}
                          className="w-full text-white cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all hover:brightness-110"
                          style={{
                            background: success
                              ? "#10B981"
                              : `linear-gradient(135deg, ${theme.solid}, #3B82F6)`,
                            boxShadow: `0 4px 20px -5px ${theme.solid}50`,
                          }}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              <span>Verifying Digital Core...</span>
                            </>
                          ) : success ? (
                            <>
                              <CheckCircle className="w-4.5 h-4.5 text-white animate-bounce" />
                              <span>Authorization Handshake Cleared</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-white" />
                              <span>Authorize & Enter Mainframe</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Redesigned Premium Demo Credentials Terminal Display Card */}
              <motion.div
                className="mt-6 text-[11px] font-semibold text-left glass-premium border border-slate-900 p-4 rounded-2xl space-y-2 relative overflow-hidden"
                style={{
                  boxShadow: `inset 0 0 16px ${theme.solid}06`,
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert
                      className="w-4.5 h-4.5 animate-pulse"
                      style={{ color: theme.solid }}
                    />
                    <span className="text-white text-xs font-bold font-mono">ADMINISTRATIVE SECURITY TOKEN</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] tracking-widest font-mono text-slate-500 border-slate-800 uppercase px-1.5 py-0">
                    TEST MODE
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-slate-400 pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold font-mono">TOKEN ADDRESS:</span>
                    <code className="text-xs text-white bg-slate-950 border border-slate-800/60 px-2 py-0.5 rounded font-mono font-bold select-all block mt-0.5 truncate w-full text-center">
                      {activeLoginForm === "officer" ? "officers@gmail.com" : "admin@gmail.com"}
                    </code>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold font-mono">CLEARANCE KEY:</span>
                    <code className="text-xs text-white bg-slate-950 border border-slate-800/60 px-2 py-0.5 rounded font-mono font-bold select-all block mt-0.5 text-center">
                      {activeLoginForm === "officer" ? "1122" : "1234"}
                    </code>
                  </div>
                </div>
                
                {activeLoginForm === "officer" && (
                  <p className="text-[10px] text-slate-500 pt-1 leading-relaxed border-t border-slate-900/60">
                    * Alternate clearance email: <code className="font-mono text-slate-300 select-all font-bold">officer@gmail.com</code> is also accepted.
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
