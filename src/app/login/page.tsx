"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  BarChart3,
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Landmark,
  User,
  Phone,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { getAuthSession, setAuthSession, loginCitizen, registerCitizen } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const isHi = language === "hi";

  const [activeRole, setActiveRole] = useState<"citizen" | "officer" | "admin">("citizen");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getAuthSession();
    if (session) {
      if (session.role === "citizen") router.replace("/citizen");
      else if (session.role === "officer") router.replace("/officer");
      else if (session.role === "admin") router.replace("/admin");
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "officer" || roleParam === "admin" || roleParam === "citizen") {
        setActiveRole(roleParam);
      }
    }
  }, [router]);

  // Autofill demo accounts based on selected role
  useEffect(() => {
    setError(null);
    setIsRegisterMode(false);
    if (activeRole === "citizen") {
      setEmailOrPhone("rahul@gmail.com");
      setPassword("1234");
    } else if (activeRole === "officer") {
      setEmailOrPhone("officers@gmail.com");
      setPassword("1122");
    } else if (activeRole === "admin") {
      setEmailOrPhone("admin@gmail.com");
      setPassword("1234");
    }
  }, [activeRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const identifier = emailOrPhone.trim();

    try {
      if (activeRole === "citizen") {
        if (isRegisterMode) {
          if (!name.trim() || !mobile.trim()) {
            setError(isHi ? "कृपया अपना नाम और मोबाइल नंबर दर्ज करें।" : "Please enter your full name and mobile number.");
            setLoading(false);
            return;
          }
          const regResult = await registerCitizen(name, identifier, mobile, password);
          if (!regResult.success) {
            setError(regResult.error || (isHi ? "पंजीकरण विफल रहा।" : "Registration failed."));
            setLoading(false);
            return;
          }
          if (regResult.session) {
            setAuthSession(regResult.session);
            setSuccess(true);
            setTimeout(() => {
              router.push("/citizen");
            }, 300);
          }
        } else {
          const loginResult = await loginCitizen(identifier, password);
          if (!loginResult.success) {
            setError(loginResult.error || (isHi ? "ईमेल अथवा पासवर्ड अमान्य है।" : "Invalid credentials."));
            setLoading(false);
            return;
          }
          if (loginResult.session) {
            setAuthSession(loginResult.session);
            setSuccess(true);
            setTimeout(() => {
              router.push("/citizen");
            }, 300);
          }
        }
      } else if (activeRole === "officer") {
        const normEmail = identifier.toLowerCase();
        if (normEmail === "officers@gmail.com" && password === "1122") {
          setAuthSession({
            role: "officer",
            email: normEmail,
            authenticatedAt: new Date().toISOString(),
            name: "Shri Rajesh Kumar",
          });
          setSuccess(true);
          setTimeout(() => {
            router.push("/officer");
          }, 300);
        } else {
          setError(isHi ? "अमान्य अधिकारी क्रेडेंशियल्स।" : "Invalid credentials. Please verify your official email and passcode.");
          setLoading(false);
        }
      } else if (activeRole === "admin") {
        const normEmail = identifier.toLowerCase();
        if (normEmail === "admin@gmail.com" && password === "1234") {
          setAuthSession({
            role: "admin",
            email: normEmail,
            authenticatedAt: new Date().toISOString(),
            name: "UP Secretariat Admin",
          });
          setSuccess(true);
          setTimeout(() => {
            router.push("/admin");
          }, 300);
        } else {
          setError(isHi ? "अमान्य व्यवस्थापक क्रेडेंशियल्स।" : "Invalid admin credentials. Please verify your passcode.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Authentication error.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-6 text-left">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/6 pb-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs mb-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHi ? "मुख्य पृष्ठ पर वापस" : "Return to JanMitra Home"}</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                  {isHi ? "जनमित्र प्रवेश पोर्टल" : "JanMitra Portal Login"}
                </h1>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isHi ? "उत्तर प्रदेश नगर निकाय सेवा" : "Government of Uttar Pradesh"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Language Switch */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181c24] border border-slate-200 dark:border-white/10 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  language === "en" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  language === "hi" ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151c] p-6 space-y-5 shadow-xs">
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isHi ? "प्रवेश श्रेणी चुनें" : "Select designated access role"}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveRole("citizen")}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  activeRole === "citizen"
                    ? "bg-blue-50 dark:bg-white/10 border-blue-500/50 text-blue-900 dark:text-white font-medium"
                    : "bg-slate-50 dark:bg-[#181c24] border-slate-200 dark:border-white/6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>{isHi ? "नागरिक" : "Citizen"}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{isHi ? "शिकायत दर्ज" : "Grievance"}</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole("officer")}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  activeRole === "officer"
                    ? "bg-blue-50 dark:bg-white/10 border-blue-500/50 text-blue-900 dark:text-white font-medium"
                    : "bg-slate-50 dark:bg-[#181c24] border-slate-200 dark:border-white/6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHi ? "अधिकारी" : "Officer"}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{isHi ? "निवारण" : "Redressal"}</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole("admin")}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  activeRole === "admin"
                    ? "bg-blue-50 dark:bg-white/10 border-blue-500/50 text-blue-900 dark:text-white font-medium"
                    : "bg-slate-50 dark:bg-[#181c24] border-slate-200 dark:border-white/6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>{isHi ? "प्रशासक" : "Admin"}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{isHi ? "निगरानी" : "Audit"}</div>
              </button>
            </div>
          </div>

          {/* Quick Demo Pre-fill Notice */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#181c24] border border-slate-200 dark:border-white/6 rounded-lg text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {isHi ? "डेमो क्रेडेंशियल:" : "Demo credentials:"}
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
              {activeRole === "citizen" ? "rahul@gmail.com / 1234" : activeRole === "officer" ? "officers@gmail.com / 1122" : "admin@gmail.com / 1234"}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {activeRole === "citizen" && isRegisterMode && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isHi ? "पूरा नाम" : "Full Name"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isHi ? "उदा. राहुल शर्मा" : "e.g. Rahul Sharma"}
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isHi ? "मोबाइल नंबर" : "Mobile Number"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {activeRole === "citizen" 
                  ? (isHi ? "ईमेल पता अथवा मोबाइल" : "Email address or Mobile") 
                  : (isHi ? "विभागीय ईमेल पता" : "Official email address")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={activeRole === "citizen" ? "rahul@gmail.com" : "officers@gmail.com"}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isHi ? "पासकोड / पासवर्ड" : "Passcode / Password"}
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full h-10 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : success ? (
                <span className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isHi ? "सत्यापित हुआ" : "Authenticated"}
                </span>
              ) : (
                <span>
                  {activeRole === "citizen" 
                    ? (isRegisterMode ? (isHi ? "नागरिक खाता बनाएं" : "Create Citizen Account") : (isHi ? "नागरिक लॉगिन" : "Sign In as Citizen"))
                    : activeRole === "officer"
                    ? (isHi ? "अधिकारी कंसोल में प्रवेश" : "Enter Officer Console")
                    : (isHi ? "प्रशासक ऑडिट में प्रवेश" : "Enter Admin Audit")}
                </span>
              )}
            </Button>
          </form>

          {/* Citizen Toggle Sign In / Register */}
          {activeRole === "citizen" && (
            <div className="pt-3 border-t border-slate-200 dark:border-white/6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError(null);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isRegisterMode ? (
                  <span>{isHi ? "पहले से खाता है? लॉगिन करें" : "Already registered? Sign in instead"}</span>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isHi ? "नया नागरिक पंजीकरण करें" : "New citizen? Create an account"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 text-center font-mono">
          {isHi 
            ? "सत्यापित सत्र • नगर निगम एवं विभागीय ऑडिट सुरक्षा प्रोटोकॉल सक्रिय" 
            : "Authorized session • Municipal cyber security protocol active"}
        </p>
      </div>
    </main>
  );
}
