"use client";

import { useState, useEffect } from "react";
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
  Fingerprint,
  Cpu,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthSession, setAuthSession } from "@/lib/auth";

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

  // Biometric scanner state
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricMessage, setBiometricMessage] = useState<string | null>(null);

  // Terminal log messages printed during login handshake
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Track field focus for high-fidelity animations
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auto-redirect if session is active
    const session = getAuthSession();
    if (session) {
      setActiveSessionRole(session.role);
      setLoading(true);
      setSuccess(true);
      if (session.role === "officer" || session.role === "admin") {
        setActiveLoginForm(session.role);
      }
      
      const timer = setTimeout(() => {
        router.replace(session.role === "officer" ? "/officer" : "/admin");
      }, 500);
      return () => clearTimeout(timer);
    }

    // Parse role from query string
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "officer" || roleParam === "admin") {
        setActiveLoginForm(roleParam);
      }
    }

    // Real-time tab sync and auto-forwarding
    const handleSync = () => {
      const activeSession = getAuthSession();
      if (activeSession) {
        setLoading(true);
        setSuccess(true);
        if (activeSession.role === "officer" || activeSession.role === "admin") {
          setActiveLoginForm(activeSession.role);
        }
        router.replace(activeSession.role === "officer" ? "/officer" : "/admin");
      }
    };

    window.addEventListener("focus", handleSync);
    window.addEventListener("visibilitychange", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [router]);

  // Auto pre-fill credentials for Officer & Admin
  useEffect(() => {
    if (activeLoginForm === "officer") {
      setEmail("officers@gmail.com");
      setPassword("1122");
    } else if (activeLoginForm === "admin") {
      setEmail("admin@gmail.com");
      setPassword("1234");
    } else {
      setEmail("");
      setPassword("");
    }
    setError(null);
    setTerminalLogs([]);
  }, [activeLoginForm]);

  const activeRole = activeLoginForm || hoveredRole;

  // Background Canvas Particles effect
  useEffect(() => {
    if (!mounted) return;
    const canvas = document.getElementById("canvas-particles") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const particleCount = Math.min(80, Math.floor((width * height) / 25000));
    
    // Decide particle colors based on activeRole
    const getParticleColor = () => {
      if (activeRole === "officer") return "245, 158, 11"; // Amber
      if (activeRole === "admin") return "139, 92, 246"; // Purple
      return "59, 130, 246"; // Blue
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.15,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const currentThemeColor = getParticleColor();
      ctx.strokeStyle = `rgba(${currentThemeColor}, 0.05)`;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentThemeColor}, ${p1.alpha})`;
        ctx.fill();

        // Connect to mouse
        const dxMouse = mouseX - p1.x;
        const dyMouse = mouseY - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 180) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(${currentThemeColor}, ${0.12 * (1 - distMouse / 180)})`;
          ctx.stroke();
        }

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${currentThemeColor}, ${0.08 * (1 - dist / 130)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, [mounted, activeRole]);

  // Officer & Admin roles configuration
  const roles = [
    {
      id: "officer",
      title: "Officer Console",
      titleHi: "अधिकारी कंसोल",
      description: "Access municipal command controls, override route assignments, inspect real-time speech-to-text transcripts, and coordinate local action plans.",
      href: "/officer",
      icon: Shield,
      color: "#F59E0B",
      glowClass: "shadow-[0_0_35px_-5px_rgba(245,158,11,0.35)] border-amber-500/40 hover:border-amber-400",
      badge: "Command Security Clearance Level A",
      roleKey: "UP-GOV-OFFICER",
      district: "Lucknow Central Command",
      tagline: "Secure Telemetry Hub",
    },
    {
      id: "admin",
      title: "Admin Panel",
      titleHi: "प्रशासक पैनल",
      description: "Audit cross-departmental response timelines, manage automatic escalations, configure AI parameters, and review system-wide diagnostics.",
      href: "/admin",
      icon: BarChart3,
      color: "#8B5CF6",
      glowClass: "shadow-[0_0_35px_-5px_rgba(139,92,246,0.35)] border-purple-500/40 hover:border-purple-400",
      badge: "Secretariat Administration & Audits",
      roleKey: "UP-GOV-SECRETARIAT",
      district: "UP State Headquarters",
      tagline: "Autonomous Platform Control",
    },
  ];

  // Colors mapping matching the active console role
  const getThemeColors = (roleId: string | null) => {
    if (roleId === "officer") {
      return {
        solid: "#F59E0B",
        glow: "rgba(245, 158, 11, 0.2)",
        glowStrong: "rgba(245, 158, 11, 0.5)",
        badgeBg: "rgba(245, 158, 11, 0.12)",
        text: "text-amber-500",
        border: "border-amber-500/30",
        gradient: "from-amber-500 via-amber-600 to-yellow-500",
        particles: "245, 158, 11",
      };
    }
    if (roleId === "admin") {
      return {
        solid: "#8B5CF6",
        glow: "rgba(139, 92, 246, 0.2)",
        glowStrong: "rgba(139, 92, 246, 0.5)",
        badgeBg: "rgba(139, 92, 246, 0.12)",
        text: "text-purple-400",
        border: "border-purple-500/30",
        gradient: "from-purple-500 via-purple-600 to-indigo-600",
        particles: "139, 92, 246",
      };
    }
    return {
      solid: "#3B82F6",
      glow: "rgba(59, 130, 246, 0.15)",
      glowStrong: "rgba(59, 130, 246, 0.4)",
      badgeBg: "rgba(59, 130, 246, 0.1)",
      text: "text-blue-400",
      border: "border-blue-500/20",
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      particles: "59, 130, 246",
    };
  };

  const theme = getThemeColors(activeRole);

  const handleRoleSelect = (roleId: string, href: string) => {
    const session = getAuthSession();
    if (session && session.role === roleId) {
      setLoading(true);
      setSuccess(true);
      setTimeout(() => {
        router.push(href);
      }, 600);
      return;
    }

    setError(null);
    setShowPassword(false);
    setActiveLoginForm(roleId as "officer" | "admin");
  };

  // Perform full cryptographic decryption style login execution
  const executeLoginProcess = (targetEmail: string, targetRole: "officer" | "admin") => {
    setLoading(true);
    setError(null);
    setTerminalLogs([]);

    const logSteps = [
      `[SYS] Initializing secure telemetry handshake on port 443...`,
      `[SYS] Encrypted SSL tunnel created with UP command node.`,
      `[AUTH] Loading cryptographic credentials structure...`,
      `[AUTH] Verification token: SHA-256 validation initiated.`,
      `[DEC] Performing biometric bypass / security passkey validation...`,
      `[DEC] Credentials approved. Syncing officer session profile...`,
      `[SYS] Handshake cleared! Forwarding session console gateway.`
    ];

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < logSteps.length) {
        setTerminalLogs((prev) => [...prev, logSteps[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
        
        // Log authorized session in local storage
        const authData = {
          role: targetRole,
          email: targetEmail.toLowerCase().trim(),
          authenticatedAt: new Date().toISOString(),
        };
        setAuthSession(authData);
        window.dispatchEvent(new Event("storage"));

        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
          router.push(targetRole === "officer" ? "/officer" : "/admin");
        }, 700);
      }
    }, 250);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTriggerShake(false);

    if (!email.trim() || !password.trim()) {
      setError("Security credentials missing. Please enter official keycode.");
      setTriggerShake(true);
      return;
    }

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

    if (isValid && activeLoginForm) {
      executeLoginProcess(normalizedEmail, activeLoginForm);
    } else {
      setError("Cryptographic check failed. Invalid console credentials or passkey.");
      setTriggerShake(true);
    }
  };

  // Holographic biometric bypass scanner trigger
  const handleBiometricBypass = () => {
    if (loading || success || biometricScanning) return;
    
    setBiometricScanning(true);
    setBiometricMessage("PLACE RETINA OR INVENT FINGERPRINT TO INITIATE RADAR SCAN...");
    setError(null);

    const scanLogs = [
      "[LIDAR] Directing laser scan array onto biometric sensors...",
      "[LIDAR] Retinal mapping verified successfully. Match rate 99.8%",
      "[AUTH] Official credential keys prefilled from secure database secure vault.",
      "[SYS] Handshake authorized via Biometric Bypass Module."
    ];

    let currentLogIndex = 0;
    const scanInterval = setInterval(() => {
      if (currentLogIndex < scanLogs.length) {
        setTerminalLogs((prev) => [...prev, scanLogs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(scanInterval);
        
        // Auto fill credentials and proceed
        if (activeLoginForm === "officer") {
          setEmail("officers@gmail.com");
          setPassword("1122");
        } else if (activeLoginForm === "admin") {
          setEmail("admin@gmail.com");
          setPassword("1234");
        }

        setBiometricScanning(false);
        setBiometricMessage(null);
        
        // Call login submit directly
        const finalEmail = activeLoginForm === "officer" ? "officers@gmail.com" : "admin@gmail.com";
        if (activeLoginForm) {
          executeLoginProcess(finalEmail, activeLoginForm);
        }
      }
    }, 450);
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
    <main className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      
      {/* Global CSS Style tag for highly reliable performance-friendly animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes panGrid {
          0% { background-position: 0px 0px; }
          100% { background-position: 64px 64px; }
        }
        .animate-pan-grid {
          animation: panGrid 24s linear infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 45s linear infinite;
        }
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow-reverse {
          animation: spinSlowReverse 55s linear infinite;
        }
        @keyframes pulseBorder {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-pulse-border {
          animation: pulseBorder 3s infinite ease-in-out;
        }
        @keyframes scanBiometric {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan-biometric {
          animation: scanBiometric 1.5s infinite linear;
        }
        @keyframes pulseText {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; text-shadow: 0 0 8px rgba(255,255,255,0.4); }
        }
        .animate-pulse-text {
          animation: pulseText 2s infinite ease-in-out;
        }
      `}} />

      {/* Interactive Canvas Background Particles */}
      <canvas 
        id="canvas-particles" 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Endless Scrolling Grid Background Matrix */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1.5px,transparent_1.5px),linear-gradient(to_bottom,#0f172a_1.5px,transparent_1.5px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none animate-pan-grid z-0"
      />
      
      {/* Dynamic Digital HUD Radars */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.08] z-0">
        <svg className="w-[850px] h-[850px] text-white animate-spin-slow" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="95" strokeWidth="0.5" strokeDasharray="3 5" />
          <circle cx="100" cy="100" r="82" strokeWidth="0.25" />
          <circle cx="100" cy="100" r="68" strokeWidth="0.75" strokeDasharray="25 8 5 8" />
          <line x1="100" y1="5" x2="100" y2="195" strokeWidth="0.25" strokeDasharray="2 2" />
          <line x1="5" y1="100" x2="195" y2="100" strokeWidth="0.25" strokeDasharray="2 2" />
        </svg>
        <svg className="absolute w-[600px] h-[600px] text-white animate-spin-slow-reverse" viewBox="0 0 200 200" fill="none" stroke="currentColor">
          <circle cx="100" cy="100" r="90" strokeWidth="0.3" strokeDasharray="1 10" />
          <circle cx="100" cy="100" r="75" strokeWidth="0.5" strokeDasharray="15 30 10 15" />
          <circle cx="100" cy="100" r="50" strokeWidth="0.25" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Orbiting Ambient Blur Spotlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Active Role Light Spots */}
        <motion.div
          className="absolute rounded-full filter blur-[130px] opacity-25"
          style={{
            width: "550px",
            height: "550px",
            top: "5%",
            left: "10%",
          }}
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
            backgroundColor: activeRole === "officer" ? "rgba(245, 158, 11, 0.22)" : activeRole === "admin" ? "rgba(139, 92, 246, 0.22)" : "rgba(59, 130, 246, 0.18)",
          }}
          transition={{
            x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 0.5 },
          }}
        />

        <motion.div
          className="absolute rounded-full filter blur-[140px] opacity-20"
          style={{
            width: "600px",
            height: "600px",
            bottom: "10%",
            right: "5%",
          }}
          animate={{
            x: [0, -35, 45, 0],
            y: [0, 45, -35, 0],
            backgroundColor: activeRole === "officer" ? "rgba(251, 191, 36, 0.14)" : activeRole === "admin" ? "rgba(167, 139, 250, 0.14)" : "rgba(124, 58, 237, 0.12)",
          }}
          transition={{
            x: { duration: 22, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 22, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 0.5 },
          }}
        />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full z-10 space-y-8 text-center px-4 relative">
        <AnimatePresence mode="wait">
          {!activeLoginForm ? (
            
            // ================== ROLE SELECTOR ==================
            <motion.div
              key="role-selector"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Brand Header */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  {/* Outer Pulsing Glow */}
                  <div 
                    className="absolute -inset-2 rounded-2xl blur-lg opacity-60 group-hover:opacity-95 transition duration-500 animate-pulse-glow"
                    style={{
                      background: `linear-gradient(135deg, ${theme.solid}, #3B82F6)`,
                    }}
                  />
                  {/* Central Icon */}
                  <div className="relative w-16 h-16 rounded-2xl bg-[#090d16] border border-slate-700/60 flex items-center justify-center shadow-2xl">
                    <Bot className="w-9 h-9 text-slate-100 animate-pulse" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#030712] animate-ping" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#030712]" />
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    JanMitra <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-indigo-400">AI</span>
                  </h1>
                  <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-slate-400">
                    Autonomous Smart Governance Platform
                  </p>
                </div>
                
                <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                  Authorized access gateway for administrative authorities and department superintendents.
                </p>

                <Badge variant="outline" className="gap-1.5 px-3 py-1 font-extrabold border-slate-800 bg-[#0b1329]/50 text-slate-300 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  Government of Uttar Pradesh
                </Badge>
              </div>

              {/* Two Column Gateway Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mx-auto pt-4">
                {roles.map((role, i) => {
                  const isHovered = hoveredRole === role.id;
                  const isActiveSession = activeSessionRole === role.id;
                  
                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
                      onMouseEnter={() => setHoveredRole(role.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                      onClick={() => handleRoleSelect(role.id, role.href)}
                      className="h-full"
                    >
                      <div className="group h-full">
                        <Card
                          className="h-full glass-premium border relative overflow-hidden transition-all duration-300 hover:scale-[1.03] text-left cursor-pointer flex flex-col justify-between bg-[#070b15]/40"
                          style={{
                            borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.06)",
                            boxShadow: isActiveSession 
                              ? `0 0 30px -5px ${role.color}45` 
                              : isHovered 
                              ? `0 0 30px -8px ${role.color}35` 
                              : "0 4px 25px -8px rgba(0,0,0,0.6)",
                          }}
                        >
                          {/* Corner neon brackets */}
                          <div 
                            className="absolute top-0 left-0 w-4 h-4 border-t border-l transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.12)" }} 
                          />
                          <div 
                            className="absolute top-0 right-0 w-4 h-4 border-t border-r transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.12)" }} 
                          />
                          <div 
                            className="absolute bottom-0 left-0 w-4 h-4 border-b border-l transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.12)" }} 
                          />
                          <div 
                            className="absolute bottom-0 right-0 w-4 h-4 border-b border-r transition-colors duration-300" 
                            style={{ borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.12)" }} 
                          />
                          
                          <CardContent className="p-6 md:p-8 relative z-10 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                {/* Glowing Icon Box */}
                                <div
                                  className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                                  style={{
                                    background: isHovered || isActiveSession ? `${role.color}15` : "rgba(255, 255, 255, 0.02)",
                                    borderColor: isHovered || isActiveSession ? role.color : "rgba(255, 255, 255, 0.08)",
                                    boxShadow: isHovered || isActiveSession ? `inset 0 0 12px ${role.color}20` : "none",
                                  }}
                                >
                                  <role.icon 
                                    className="w-7 h-7 transition-transform duration-300" 
                                    style={{ color: isHovered || isActiveSession ? role.color : "#64748b" }} 
                                  />
                                </div>

                                <span className="font-mono text-[9px] text-slate-500 font-bold tracking-widest bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                                  {role.roleKey}
                                </span>
                              </div>

                              {/* Title labels */}
                              <div className="space-y-1 pt-2">
                                {isActiveSession ? (
                                  <Badge className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-pulse gap-1 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Active Session
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 border-slate-800 bg-[#0e172a]/60 text-slate-400 rounded-full w-fit">
                                    {role.badge}
                                  </Badge>
                                )}
                                
                                <h3 
                                  className="text-xl font-bold text-white transition-colors pt-1.5"
                                  style={{ color: isHovered ? role.color : "#ffffff" }}
                                >
                                  {role.title}
                                </h3>
                                <span className="text-xs text-slate-400 font-semibold block">
                                  {role.titleHi}
                                </span>
                                
                                <p className="text-xs text-slate-400 leading-relaxed pt-2">
                                  {role.description}
                                </p>
                              </div>
                            </div>

                            {/* bottom banner */}
                            <div 
                              className="flex items-center justify-between gap-1.5 text-xs font-bold transition-colors border-t border-slate-900 pt-4 mt-auto"
                              style={{ color: isActiveSession ? "#10b981" : isHovered ? role.color : "#64748b" }}
                            >
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-500 font-medium tracking-wider">COMMAND NODE</span>
                                <span className="text-xs text-slate-300 font-bold">{role.district}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{isActiveSession ? "Resume Connection" : "Access Terminal"}</span>
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

              {/* Secure Notice */}
              <motion.div
                className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-2 bg-slate-900/20 border border-slate-900/60 px-4 py-2.5 rounded-full w-fit mx-auto mt-4 shadow-inner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Lock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>Authorized credentials mandatory. Terminal connections and biometric requests are securely archived.</span>
              </motion.div>
            </motion.div>
          ) : (
            
            // ================== LOGIN FORM CONTAINER ==================
            <motion.div
              key="role-login-form"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full mx-auto"
            >
              {/* Back to consoles */}
              <button
                onClick={() => {
                  setActiveLoginForm(null);
                  setError(null);
                  setTriggerShake(false);
                  setTerminalLogs([]);
                }}
                className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors bg-[#0b1329]/60 hover:bg-[#0b1329] border border-slate-800/40 hover:border-slate-800 px-4 py-2 rounded-full cursor-pointer shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Return to Role Gate</span>
              </button>

              <motion.div
                variants={shakeVariants}
                animate={triggerShake ? "shake" : "default"}
              >
                <Card
                  className="glass-premium border shadow-2xl relative overflow-hidden text-left bg-[#070b15]/65"
                  style={{
                    borderColor: `${theme.solid}40`,
                    boxShadow: `0 0 40px -10px ${theme.solid}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  {/* Scanning Laser sweep line on Card when loading */}
                  {loading && (
                    <div 
                      className="absolute left-0 w-full h-[3px] opacity-90 pointer-events-none z-20 animate-laser-sweep"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${theme.solid}, #ffffff, ${theme.solid}, transparent)`,
                        boxShadow: `0 0 15px 4px ${theme.solid}`,
                      }}
                    />
                  )}

                  {/* Aesthetic corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: theme.solid }} />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: theme.solid }} />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: theme.solid }} />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: theme.solid }} />

                  <CardContent className="p-8 space-y-6 relative">
                    
                    {/* Console Header details */}
                    <div className="flex items-start gap-4">
                      <div className="relative group">
                        <div 
                          className="absolute -inset-1.5 rounded-2xl blur-md opacity-35 group-hover:opacity-60 transition duration-300 animate-pulse"
                          style={{ backgroundColor: theme.solid }}
                        />
                        <div
                          className="relative w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-300 hover:scale-105 bg-slate-950"
                          style={{
                            borderColor: theme.solid,
                            boxShadow: `inset 0 0 10px ${theme.solid}20`,
                          }}
                        >
                          {currentRoleConfig && (
                            <currentRoleConfig.icon
                              className="w-7 h-7 animate-pulse"
                              style={{ color: theme.solid }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                          {currentRoleConfig?.title} Authentication
                        </h2>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                          {currentRoleConfig?.titleHi} • SECURE TERMINAL NODE
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed border-b border-slate-900 pb-4 font-medium">
                      Authenticate with pre-registered clearance keys or utilize the biometric scanning gate.
                    </p>

                    {/* Quick Demo Pre-fill Box */}
                    <div className="bg-[#0b1329]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span>Prefilled System Credentials</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Console coordinates are preloaded for quick demo simulation. You may also trigger biometric authentication bypass.
                      </p>
                    </div>

                    {/* Login inputs form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      
                      {/* Email input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                            Official Email ID / Node Identifier
                          </label>
                          {emailFocused && (
                            <motion.span 
                              initial={{ opacity: 0, x: 5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[9px] font-mono font-bold uppercase tracking-wider"
                              style={{ color: theme.solid }}
                            >
                              Scanning port...
                            </motion.span>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10">
                            <Mail 
                              className="w-4 h-4 transition-colors" 
                              style={{ color: emailFocused ? theme.solid : "#475569" }} 
                            />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            placeholder="e.g. name@up.gov.in"
                            className="w-full bg-[#030712]/60 backdrop-blur-md border rounded-full pl-11 pr-4 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all duration-300 font-semibold"
                            style={{
                              borderColor: emailFocused ? theme.solid : "rgba(255, 255, 255, 0.06)",
                              boxShadow: emailFocused 
                                ? `0 0 20px ${theme.solid}20, inset 0 0 10px ${theme.solid}10` 
                                : "inset 0 2px 4px rgba(0,0,0,0.5)",
                            }}
                            required
                            disabled={loading || success || biometricScanning}
                          />
                        </div>
                      </div>

                      {/* Password input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                            Security Passkey / Code
                          </label>
                          {passwordFocused && (
                            <motion.span 
                              initial={{ opacity: 0, x: 5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[9px] font-mono font-bold uppercase tracking-wider"
                              style={{ color: theme.solid }}
                            >
                              Verifying port...
                            </motion.span>
                          )}
                        </div>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 z-10">
                            <KeyRound 
                              className="w-4 h-4 transition-colors" 
                              style={{ color: passwordFocused ? theme.solid : "#475569" }} 
                            />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            placeholder="••••"
                            className="w-full bg-[#030712]/60 backdrop-blur-md border rounded-full pl-11 pr-12 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all duration-300 font-bold tracking-[0.25em]"
                            style={{
                              borderColor: passwordFocused ? theme.solid : "rgba(255, 255, 255, 0.06)",
                              boxShadow: passwordFocused 
                                ? `0 0 20px ${theme.solid}20, inset 0 0 10px ${theme.solid}10` 
                                : "inset 0 2px 4px rgba(0,0,0,0.5)",
                            }}
                            required
                            disabled={loading || success || biometricScanning}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer z-10 p-1"
                            disabled={loading || success || biometricScanning}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Terminal Output Messages */}
                      {terminalLogs.length > 0 && (
                        <div className="bg-[#030712] border border-slate-900 rounded-xl p-3.5 space-y-1 font-mono text-[9px] text-cyan-400 overflow-hidden shadow-inner max-h-[140px] overflow-y-auto">
                          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-1.5 text-slate-400 font-bold">
                            <Terminal className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                            <span>SECURITY CORE TELEMETRY LOGS</span>
                          </div>
                          {terminalLogs.map((log, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="leading-relaxed"
                            >
                              <span className="text-slate-600 mr-1.5">{`>`}</span>
                              {log}
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Error panel */}
                      {error && (
                        <motion.div
                          className="bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs font-semibold px-4 py-3 rounded-xl flex items-start gap-2.5 shadow-md"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {/* Actions Buttons Group */}
                      <div className="space-y-3 pt-2">
                        {/* Interactive Holographic Biometric Scanner Button */}
                        <div className="relative group">
                          {/* Pulsing ring around button */}
                          <div 
                            className={`absolute -inset-1 rounded-full blur opacity-15 group-hover:opacity-25 transition ${biometricScanning ? "opacity-35 animate-pulse" : ""}`}
                            style={{ backgroundColor: theme.solid }}
                          />
                          <Button
                            type="button"
                            onClick={handleBiometricBypass}
                            disabled={loading || success || biometricScanning}
                            className="w-full bg-[#0b1329]/50 hover:bg-[#0b1329] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer py-5.5 rounded-full font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden"
                          >
                            {/* Scanning indicator */}
                            {biometricScanning && (
                              <div 
                                className="absolute left-0 w-full h-[2px] bg-cyan-400 animate-scan-biometric shadow-[0_0_8px_cyan]"
                              />
                            )}
                            
                            <Fingerprint className={`w-4.5 h-4.5 ${biometricScanning ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
                            <span>
                              {biometricScanning 
                                ? "Analyzing Retina ID..." 
                                : "Tap to scan Biometrics (retinal/fingerprint)"}
                            </span>
                          </Button>
                        </div>

                        {/* Standard Authorization Submit Button */}
                        <Button
                          type="submit"
                          disabled={loading || success || biometricScanning}
                          className="w-full text-white cursor-pointer py-6 rounded-full font-extrabold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
                          style={{
                            background: success
                              ? "#10B981"
                              : `linear-gradient(135deg, ${theme.solid}, #3B82F6)`,
                            boxShadow: `0 4px 25px -5px ${theme.solid}50`,
                          }}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              <span>Resolving Handshake Keys...</span>
                            </>
                          ) : success ? (
                            <>
                              <CheckCircle className="w-4.5 h-4.5 text-white animate-bounce" />
                              <span>Command Credentials Cleared</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-white" />
                              <span>Authorize & Launch Console</span>
                            </>
                          )}
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
