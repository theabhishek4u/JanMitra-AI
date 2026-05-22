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

  useEffect(() => {
    setMounted(true);
    
    // Clear any previous bad session state on load
    // but keep valid ones intact
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

  const roles = [
    {
      id: "citizen",
      title: "Citizen Portal",
      titleHi: "नागरिक पोर्टल",
      description: "File multi-lingual grievances, trigger holographic hazard scanning, and monitor real-time AI resolution progress.",
      href: "/citizen",
      icon: User,
      color: "#3B82F6",
      glowClass: "shadow-[0_0_20px_-5px_rgba(59,130,246,0.45)] border-gov-blue/30 hover:border-gov-blue",
      badge: "Public Access",
    },
    {
      id: "officer",
      title: "Officer Console",
      titleHi: "अधिकारी कंसोल",
      description: "Manage city-wide queues, override route assignments, inspect STT transcripts, and join Consolidated Action Files.",
      href: "/officer",
      icon: Shield,
      color: "#F59E0B",
      glowClass: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.45)] border-warning-amber/30 hover:border-warning-amber",
      badge: "Official Credentials Required",
    },
    {
      id: "admin",
      title: "Admin Panel",
      titleHi: "प्रशासक पैनल",
      description: "Audit department performance metrics, monitor SLA escalations, and review predictive municipal diagnostics.",
      href: "/admin",
      icon: BarChart3,
      color: "#7C3AED",
      glowClass: "shadow-[0_0_20px_-5px_rgba(124,58,237,0.45)] border-ai-purple/30 hover:border-ai-purple",
      badge: "Secretariat & CAG Audit",
    },
  ];

  // Handle Role Selection Click
  const handleRoleSelect = (roleId: string, href: string) => {
    if (roleId === "citizen") {
      router.push(href);
      return;
    }

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

  // Form Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTriggerShake(false);

    if (!email.trim() || !password.trim()) {
      setError("Please fill out all credentials fields.");
      setTriggerShake(true);
      return;
    }

    setLoading(true);

    // Simulate cryptographic mainframe decryption verification
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      let isValid = false;

      if (activeLoginForm === "officer") {
        // Support officer@gmail.com and officers@gmail.com gracefully
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
    }, 1000);
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
      {/* Background Holographic HUD Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
      
      {/* Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gov-blue/10 filter blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-ai-purple/10 filter blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-4xl w-full z-10 space-y-8 text-center px-2">
        <AnimatePresence mode="wait">
          {!activeLoginForm ? (
            // ================== ROLE SELECTION SCREEN ==================
            <motion.div
              key="role-selector"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Brand Header */}
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gov-blue via-primary to-ai-purple flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-trust-green rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  JanMitra AI — Autonomous Governance Platform
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-semibold max-w-lg leading-relaxed">
                  Welcome to Uttar Pradesh&apos;s next-generation smart grievance system. Choose your operational access portal below.
                </p>

                <Badge variant="outline" className="gap-1.5 px-3 py-1 font-extrabold border-primary/30 bg-primary/5 text-primary animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Empowered by Gemini 2.5 Flash
                </Badge>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {roles.map((role, i) => {
                  const isHovered = hoveredRole === role.id;
                  const isActiveSession = activeSessionRole === role.id;
                  
                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      onMouseEnter={() => setHoveredRole(role.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                      onClick={() => handleRoleSelect(role.id, role.href)}
                    >
                      <div className="block group">
                        <Card
                          className={`h-full glass-premium border relative overflow-hidden transition-all duration-300 hover:scale-[1.03] text-left cursor-pointer flex flex-col justify-between ${
                            isActiveSession
                              ? role.id === "officer"
                                ? "shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)] border-warning-amber/80"
                                : "shadow-[0_0_20px_-3px_rgba(124,58,237,0.5)] border-ai-purple/80"
                              : isHovered
                              ? role.glowClass
                              : "border-border/30 shadow-md"
                          }`}
                        >
                          {/* Corner accents */}
                          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/20 group-hover:border-primary/50 transition-colors" />
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/20 group-hover:border-primary/50 transition-colors" />
                          
                          <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-4">
                              {/* Role Icon */}
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                                style={{
                                  background: isHovered || isActiveSession ? `${role.color}15` : "rgba(255, 255, 255, 0.02)",
                                  borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <role.icon className="w-6 h-6 transition-transform duration-300" style={{ color: isHovered || isActiveSession ? role.color : "var(--muted-foreground)" }} />
                              </div>

                              {/* Text */}
                              <div className="space-y-1">
                                {isActiveSession ? (
                                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 border-trust-green bg-trust-green/10 text-trust-green animate-pulse gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-trust-green" />
                                    Active Session
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0">
                                    {role.badge}
                                  </Badge>
                                )}
                                <h3 className="text-lg font-extrabold text-white group-hover:text-primary transition-colors flex items-center gap-1.5 mt-2">
                                  {role.title}
                                </h3>
                                <span className="text-[10px] text-muted-foreground font-bold block">
                                  {role.titleHi}
                                </span>
                                <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed pt-1.5">
                                  {role.description}
                                </p>
                              </div>
                            </div>

                            {/* Link Action */}
                            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors border-t border-border/20 pt-4 mt-auto ${
                              isActiveSession ? "text-trust-green" : "text-white group-hover:text-primary"
                            }`}>
                              <span>{isActiveSession ? "Resume Dashboard Session" : "Enter Accessway"}</span>
                              <ArrowRight className={`w-3.5 h-3.5 ${
                                isActiveSession ? "translate-x-0.5" : "group-hover:translate-x-1"
                              } transition-transform`} />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Public Security Footer Notice */}
              <motion.div
                className="text-[11px] text-muted-foreground font-semibold flex items-center justify-center gap-1.5 bg-slate-900/50 border border-border/20 px-4 py-2.5 rounded-full w-fit mx-auto mt-4 shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Lock className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>Demo environment loaded with active secure credential gates. Unauthorized bypass restricted.</span>
              </motion.div>
            </motion.div>
          ) : (
            // ================== ROLE LOGIN FORM SCREEN ==================
            <motion.div
              key="role-login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full mx-auto"
            >
              {/* Back to Portal Selector */}
              <button
                onClick={() => {
                  setActiveLoginForm(null);
                  setError(null);
                  setTriggerShake(false);
                }}
                className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white mb-6 transition-colors bg-slate-900/40 hover:bg-slate-900 border border-border/10 px-3.5 py-2 rounded-full cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Portals Grid</span>
              </button>

              {/* Login Card Container */}
              <motion.div
                variants={shakeVariants}
                animate={triggerShake ? "shake" : "default"}
              >
                <Card
                  className="glass-premium border-2 shadow-2xl relative overflow-hidden text-left"
                  style={{
                    borderColor: currentRoleConfig ? `${currentRoleConfig.color}40` : "rgba(255,255,255,0.1)",
                    boxShadow: currentRoleConfig ? `0 0 30px -10px ${currentRoleConfig.color}25` : "none",
                  }}
                >
                  {/* Corner accents */}
                  <div
                    className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2"
                    style={{ borderColor: currentRoleConfig?.color }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2"
                    style={{ borderColor: currentRoleConfig?.color }}
                  />

                  <CardContent className="p-8 space-y-6">
                    {/* Form Header */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner"
                        style={{
                          background: `${currentRoleConfig?.color}15`,
                          borderColor: currentRoleConfig?.color,
                        }}
                      >
                        {currentRoleConfig && (
                          <currentRoleConfig.icon
                            className="w-6 h-6 animate-pulse"
                            style={{ color: currentRoleConfig.color }}
                          />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5">
                          {currentRoleConfig?.title} Access
                        </h2>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                          {currentRoleConfig?.titleHi} • MAIN FRAME GATEWAY
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-medium leading-relaxed border-b border-border/20 pb-4">
                      Enter official security credentials to decrypt municipal dashboard arrays and launch command tools.
                    </p>

                    {/* Form fields */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      {/* Email Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          Official Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. name@up.gov.in"
                            className="w-full bg-slate-900/60 border border-border/20 focus:border-primary/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                            required
                            disabled={loading || success}
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                            Security Passkey / Code
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                            className="w-full bg-slate-900/60 border border-border/20 focus:border-primary/50 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium tracking-widest"
                            required
                            disabled={loading || success}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                            disabled={loading || success}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Error Box */}
                      {error && (
                        <motion.div
                          className="bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2.5 shadow-sm animate-pulse"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {/* Actions */}
                      <div className="space-y-3 pt-2">
                        <Button
                          type="submit"
                          disabled={loading || success}
                          className="w-full text-white cursor-pointer py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                          style={{
                            background: success
                              ? "#10B981"
                              : `linear-gradient(135deg, ${currentRoleConfig?.color}, #3B82F6)`,
                            boxShadow: `0 4px 20px -5px ${currentRoleConfig?.color}40`,
                          }}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              <span>Verifying Cryptographic Array...</span>
                            </>
                          ) : success ? (
                            <>
                              <CheckCircle className="w-4.5 h-4.5 text-white animate-bounce" />
                              <span>Authorization Cleared</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-white" />
                              <span>Authorize & Enter</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Specific Default Credentials Neon Banner */}
              <motion.div
                className="mt-5 text-[11px] font-semibold text-left glass border border-white/5 p-4 rounded-2xl space-y-2 relative overflow-hidden"
                style={{
                  boxShadow: `inset 0 0 12px ${currentRoleConfig?.color}08`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldAlert
                    className="w-4 h-4 animate-pulse"
                    style={{ color: currentRoleConfig?.color }}
                  />
                  <span className="text-white text-xs font-bold">Default Demo Credentials:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">EMAIL ADDRESS:</span>
                    <code className="text-xs text-white bg-slate-900 border border-border/10 px-1.5 py-0.5 rounded font-mono font-extrabold select-all">
                      {activeLoginForm === "officer" ? "officers@gmail.com" : "admin@gmail.com"}
                    </code>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">SECURITY KEY:</span>
                    <code className="text-xs text-white bg-slate-900 border border-border/10 px-1.5 py-0.5 rounded font-mono font-extrabold select-all">
                      {activeLoginForm === "officer" ? "1122" : "1234"}
                    </code>
                  </div>
                </div>
                {activeLoginForm === "officer" && (
                  <p className="text-[10px] text-muted-foreground/80 pt-1 leading-relaxed border-t border-border/10">
                    * Tip: <code className="font-mono text-white select-all">officer@gmail.com</code> is also accepted gracefully.
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

