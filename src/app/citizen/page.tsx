"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  Bot,
  Bell,
  Trash2,
  Inbox,
  Camera,
  Upload,
  ShieldCheck,
  X as XIcon,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  EyeOff,
  Loader2,
  TrendingUp,
  PlusCircle,
  FileText,
  ArrowLeft,
  Send,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/shared/Navbar";
import { ComplaintForm } from "@/components/citizen/ComplaintForm";
import { TrackingTimeline } from "@/components/citizen/TrackingTimeline";
import { AIAgentFollowUpPanel } from "@/components/citizen/AIAgentFollowUpPanel";
import { AIAssistantWidget } from "@/components/shared/AIAssistantWidget";
import {
  getComplaints,
  getCitizenNotifications,
  markNotificationAsRead,
  clearNotifications,
  citizenVerifyResolution,
  getComplaintById,
} from "@/lib/complaints";
import { supabase } from "@/lib/supabaseClient";
import {
  getAuthSession,
  setAuthSession,
  clearAuthSession,
  registerCitizen,
  loginCitizen,
  resetCitizenPassword,
} from "@/lib/auth";
import type { Complaint, Notification } from "@/types";

const priorityIcon = {
  high: AlertTriangle,
  medium: Clock,
  low: CheckCircle2,
};

export default function CitizenDashboard() {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [activeTab, setActiveTab] = useState("new");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  // Search & Track Tab States
  const [trackSearchId, setTrackSearchId] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState(false);

  // Citizen Verification State
  const [verifyFeedback, setVerifyFeedback] = useState("");
  const [rejectPhoto, setRejectPhoto] = useState<string | null>(null);
  const [rejectPhotoName, setRejectPhotoName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Citizen Auth States
  const [session, setSession] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Inputs
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authMobile, setAuthMobile] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");

  // Recovery States
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [inputOtp, setInputOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showGoogleSimulation, setShowGoogleSimulation] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authMode === "forgot" && forgotStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, forgotStep, otpTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailVal = forgotEmail.toLowerCase().trim();
    if (!emailVal) {
      setAuthError(isHi ? "कृपया अपना ईमेल दर्ज करें।" : "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setAuthError(isHi ? "कृपया एक मान्य ईमेल दर्ज करें।" : "Please enter a valid email address.");
      return;
    }

    setAuthLoading(true);
    try {
      // Check database to verify citizen exists
      const { data: citizen, error } = await supabase
        .from("citizens")
        .select("id")
        .eq("email", emailVal)
        .maybeSingle();

      if (error || !citizen) {
        setAuthError(isHi ? "यह ईमेल आईडी पंजीकृत नहीं है।" : "This email ID is not registered.");
        setAuthLoading(false);
        return;
      }

      // Generate a 6-digit random number code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpTimer(60);

      // Call SMTP email API
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal, otp: code, language }),
      });
      const data = await response.json();

      if (data.fallback) {
        setOtpSentMessage(isHi ? `ओटीपी ${emailVal} पर भेज दिया गया है (सिम्युलेटर सक्रिय)।` : `OTP has been sent to ${emailVal} (Simulator active).`);
        setShowNotification(true);
      } else {
        setOtpSentMessage(isHi ? `ओटीपी सफलतापूर्वक आपके ईमेल ${emailVal} पर भेजा गया है।` : `OTP has been sent to your email at ${emailVal}.`);
        setShowNotification(false);
      }

      setForgotStep(2);
    } catch (err) {
      setAuthError(isHi ? "एक त्रुटि हुई। कृपया पुनः प्रयास करें।" : "An error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (inputOtp.trim() === generatedOtp) {
      setForgotStep(3);
      setOtpVerified(true);
    } else {
      setAuthError(isHi ? "अमान्य ओटीपी कोड। कृपया पुनः प्रयास करें।" : "Invalid OTP code. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (newPassword.length < 4) {
      setAuthError(isHi ? "पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।" : "Password must be at least 4 characters long.");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setAuthError(isHi ? "पासवर्ड मेल नहीं खाते।" : "Passwords do not match.");
      return;
    }
    
    setAuthLoading(true);
    const res = await resetCitizenPassword(forgotEmail, newPassword);
    setAuthLoading(false);
    
    if (res.success) {
      setAuthEmail(forgotEmail);
      setAuthPassword("");
      setAuthMode("login");
      setForgotEmail("");
      setGeneratedOtp(null);
      setInputOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setForgotStep(1);
      setAuthError(isHi ? "पासवर्ड सफलतापूर्वक रीसेट किया गया! अब लॉगिन करें।" : "Password reset successfully! Please log in.");
    } else {
      setAuthError(res.error || (isHi ? "पासवर्ड रीसेट करने में विफल।" : "Failed to reset password."));
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setAuthError(null);
    setAuthLoading(true);
    
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpTimer(60);

      // Call SMTP email API
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: code, language }),
      });
      const data = await response.json();

      if (data.fallback) {
        setOtpSentMessage(isHi ? "नया ओटीपी ईमेल पर भेज दिया गया है (सिम्युलेटर सक्रिय)।" : "A new OTP has been sent to your email (Simulator active).");
        setShowNotification(true);
      } else {
        setOtpSentMessage(isHi ? "नया ओटीपी सफलतापूर्वक आपके ईमेल पर भेजा गया है।" : "A new OTP has been sent to your email.");
        setShowNotification(false);
      }
    } catch (err) {
      setAuthError(isHi ? "ओटीपी भेजने में विफल।" : "Failed to resend OTP.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      setShowGoogleSimulation(true);
    } catch (err) {
      setAuthError(isHi ? "गूगल साइन-इन विफल रहा।" : "Google Sign-In failed.");
      setAuthLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (name: string, email: string, mobile: string) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();
      const cleanMobile = mobile.trim();

      // Check if user already exists in database
      const { data: existingCitizen, error: findError } = await supabase
        .from("citizens")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      let citizen = existingCitizen;

      if (findError) {
        setAuthError(isHi ? "डेटाबेस त्रुटि।" : "Database error.");
        setAuthLoading(false);
        return;
      }

      if (!citizen) {
        // Create new citizen record for Google User
        const { data: newCitizen, error: insertError } = await supabase
          .from("citizens")
          .insert({
            name: name,
            email: cleanEmail,
            mobile: cleanMobile,
            password: `google-oauth-${Math.floor(1000 + Math.random() * 9000)}`,
          })
          .select()
          .single();

        if (insertError || !newCitizen) {
          setAuthError(insertError?.message || (isHi ? "नागरिक पंजीकरण विफल।" : "Failed to register citizen."));
          setAuthLoading(false);
          return;
        }

        citizen = newCitizen;
      }

      // Create session
      const sessionData = {
        role: "citizen" as const,
        email: citizen.email,
        name: citizen.name,
        id: citizen.id,
        mobile: citizen.mobile,
        authenticatedAt: new Date().toISOString(),
      };

      setAuthSession(sessionData);
      setSession(sessionData);
      window.dispatchEvent(new Event("storage"));
      getComplaints(citizen.id).then(setComplaints);
      setShowGoogleSimulation(false);
    } catch (err) {
      setAuthError(isHi ? "गूगल साइन-इन विफल रहा।" : "Google Sign-In failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSearchTrack = (idToSearch?: string) => {
    const queryId = (idToSearch || trackSearchId).trim().toUpperCase();
    if (!queryId) return;
    const found = complaints.find((c) => c.id.toUpperCase() === queryId);
    if (found) {
      setTrackedComplaint(found);
      setTrackError(false);
    } else {
      setTrackedComplaint(null);
      setTrackError(true);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = authEmail.trim();
    const cleanPassword = authPassword;

    if (authMode === "signup") {
      const cleanName = authName.trim();
      const cleanMobile = authMobile.trim();
      const cleanConfirm = authConfirmPassword;

      if (!cleanName || !cleanEmail || !cleanMobile || !cleanPassword) {
        setAuthError("All fields are required.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setAuthError("Please enter a valid email address.");
        return;
      }

      if (cleanMobile.length < 10 || isNaN(Number(cleanMobile))) {
        setAuthError("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (cleanPassword.length < 4) {
        setAuthError("Password must be at least 4 characters long.");
        return;
      }

      if (cleanPassword !== cleanConfirm) {
        setAuthError("Passwords do not match.");
        return;
      }

      setAuthLoading(true);
      const res = await registerCitizen(cleanName, cleanEmail, cleanMobile, cleanPassword);
      setAuthLoading(false);

      if (res.success && res.session) {
        setAuthSession(res.session);
        setSession(res.session);
        window.dispatchEvent(new Event("storage"));
        getComplaints(res.session.id).then(setComplaints);
      } else {
        setAuthError(res.error || "Registration failed.");
      }
    } else {
      if (!cleanEmail || !cleanPassword) {
        setAuthError("Credentials cannot be empty.");
        return;
      }

      setAuthLoading(true);
      const res = await loginCitizen(cleanEmail, cleanPassword);
      setAuthLoading(false);

      if (res.success && res.session) {
        setAuthSession(res.session);
        setSession(res.session);
        window.dispatchEvent(new Event("storage"));
        getComplaints(res.session.id).then(setComplaints);
      } else {
        setAuthError(res.error || "Invalid login credentials.");
      }
    }
  };

  useEffect(() => {
    if (trackSearchId) {
      const found = complaints.find((c) => c.id.toUpperCase() === trackSearchId.trim().toUpperCase());
      if (found) {
        setTrackedComplaint(found);
      }
    }
  }, [complaints, trackSearchId]);

  const isHi = language === "hi";

  // Load language from localStorage on mount and listen to changes
  useEffect(() => {
    const savedLanguage = localStorage.getItem("janmitra-language");
    if (savedLanguage === "hi" || savedLanguage === "en") {
      setLanguage(savedLanguage as "hi" | "en");
    }

    const handleLanguageChange = () => {
      const saved = localStorage.getItem("janmitra-language");
      if (saved === "hi" || saved === "en") {
        setLanguage(saved as "hi" | "en");
      }
    };
    window.addEventListener("janmitra-language-change", handleLanguageChange);
    return () => {
      window.removeEventListener("janmitra-language-change", handleLanguageChange);
    };
  }, []);

  // Listen for track complaint custom events (e.g. from global Navbar notifications)
  useEffect(() => {
    const handleTrackEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleTrackComplaint(customEvent.detail);
      }
    };
    window.addEventListener("janmitra-track-complaint", handleTrackEvent);
    return () => {
      window.removeEventListener("janmitra-track-complaint", handleTrackEvent);
    };
  }, []);

  const handleLanguageChange = (lang: "en" | "hi") => {
    setLanguage(lang);
    localStorage.setItem("janmitra-language", lang);
    window.dispatchEvent(new Event("janmitra-language-change"));
  };

  // Load complaints dynamically on mount and listen to real-time local storage edits
  useEffect(() => {
    const checkSession = () => {
      const activeSession = getAuthSession();
      if (activeSession && activeSession.role === "citizen") {
        setSession(activeSession);
        getComplaints(activeSession.id).then(setComplaints);
      } else {
        setSession(null);
        setComplaints([]);
      }
    };

    checkSession();

    window.addEventListener("janmitra-db-change", checkSession);
    window.addEventListener("storage", checkSession);
    window.addEventListener("focus", checkSession);
    window.addEventListener("visibilitychange", checkSession);

    return () => {
      window.removeEventListener("janmitra-db-change", checkSession);
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("visibilitychange", checkSession);
    };
  }, []);

  // Sync check for url params (e.g. ?demo=true)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      const complaintId = params.get("complaintId");
      if (tab === "track") {
        setActiveTab("track");
      }
      if (complaintId) {
        handleTrackComplaint(complaintId);
      }
    }
  }, []);

  const refreshComplaints = async () => {
    const activeSession = getAuthSession();
    const data = await getComplaints(activeSession && activeSession.role === "citizen" ? activeSession.id : undefined);
    setComplaints(data);
  };

  const handleVerifyResolution = async (complaintId: string, verified: boolean) => {
    if (!verifyFeedback.trim() && !verified) return;
    setIsVerifying(true);
    await citizenVerifyResolution(
      complaintId,
      verified,
      verifyFeedback || (verified ? "Issue is fixed, thank you!" : "Issue not resolved."),
      verifyFeedback || (verified ? "समस्या हल हो गई, धन्यवाद!" : "समस्या अभी हल नहीं हुई।"),
      verified ? undefined : rejectPhoto || undefined
    );
    setVerifyFeedback("");
    setRejectPhoto(null);
    setRejectPhotoName("");
    setIsVerifying(false);
    refreshComplaints();
  };

  const handleRejectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRejectPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRejectPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTrackComplaint = async (id: string) => {
    await refreshComplaints();
    setTrackSearchId(id);
    const found = await getComplaintById(id);
    if (found) {
      setTrackedComplaint(found);
      setTrackError(false);
    } else {
      setTrackedComplaint(null);
      setTrackError(true);
    }
    setActiveTab("search-track");
  };

  const complaint = complaints.find((c) => c.id === selectedComplaint);

  const dict = {
    newComplaint: isHi ? "नई शिकायत" : "New Complaint",
    myComplaints: isHi ? "मेरी शिकायतें" : "My Complaints",
    yourComplaints: isHi ? "आपकी शिकायतें" : "Your Complaints",
    selectComplaint: isHi ? "एक शिकायत चुनें" : "Select a Complaint",
    selectDesc: isHi ? "विवरण और ट्रैकिंग टाइमलाइन देखने के लिए किसी भी शिकायत पर क्लिक करें।" : "Click on any complaint to view details and tracking timeline.",
    priority: isHi ? "प्राथमिकता" : "Priority",
    department: isHi ? "विभाग" : "Department",
    area: isHi ? "क्षेत्र" : "Area",
    aiSummary: isHi ? "AI अधिकारी सारांश" : "AI Officer Summary",
    confidence: isHi ? "सटीकता" : "Confidence",
    trackingTimeline: isHi ? "शिकायत ट्रैकिंग टाइमलाइन" : "Tracking Timeline",
    assignedOfficer: isHi ? "आवंटित अधिकारी" : "Assigned Officer",
  };

  const getPriorityLabel = (p: string) => {
    if (p === "high") return isHi ? "उच्च" : "High";
    if (p === "medium") return isHi ? "मध्यम" : "Medium";
    return isHi ? "निम्न" : "Low";
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "submitted":
        return isHi ? "दर्ज की गई" : "Submitted";
      case "ai_analyzing":
        return isHi ? "AI विश्लेषण पूर्ण" : "AI Analysis Complete";
      case "department_assigned":
        return isHi ? "विभाग आवंटित" : "Department Assigned";
      case "officer_reviewing":
        return isHi ? "समीक्षा जारी" : "Officer Reviewing";
      case "action_in_progress":
        return isHi ? "कार्य प्रगति पर" : "Action In Progress";
      case "resolved":
        return isHi ? "निवारण पूर्ण" : "Resolved";
      case "escalated":
        return isHi ? "उच्चाधिकारी को प्रेषित" : "Escalated";
      case "pending_citizen_confirmation":
        return isHi ? "आपकी पुष्टि की प्रतीक्षा" : "Awaiting Your Confirmation";
      case "reopened":
        return isHi ? "पुनः खोली गई" : "Reopened";
      default:
        return s.replace(/_/g, " ");
    }
  };

  const translateArea = (area: string) => {
    if (!isHi) return area;
    return area
      .replace("Gomti Nagar, Lucknow", "गोमती नगर, लखनऊ")
      .replace("Aliganj, Lucknow", "अलीगंज, लखनऊ")
      .replace("Indira Nagar, Lucknow", "इन्दिरा नगर, लखनऊ")
      .replace("Hazratganj, Lucknow", "हजरतगंज, लखनऊ")
      .replace("Chinhat, Lucknow", "चिनहट, लखनऊ")
      .replace("Alambagh, Lucknow", "आलमबाग, लखनऊ")
      .replace("Chowk, Lucknow", "चौक, लखनऊ")
      .replace("Rajajipuram, Lucknow", "राजाजीपुरम, लखनऊ")
      .replace("Aminabad, Lucknow", "अमीनाबाद, लखनऊ")
      .replace("Mahanagar, Lucknow", "महानगर, लखनऊ");
  };

  const bottomNavItems = [
    { id: "new", label: isHi ? "नई शिकायत" : "New", icon: PlusCircle },
    { id: "track", label: isHi ? "शिकायतें" : "Complaints", icon: FileText },
    { id: "search-track", label: isHi ? "ट्रैक" : "Track", icon: Search },
    { id: "chatbot", label: isHi ? "चैटबॉट" : "Chatbot", icon: Bot },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 md:pt-32 pb-24 sm:pb-12 bg-[#05070f] text-gray-100 relative overflow-hidden">
        {/* Ambient background grids & glowing mesh orbs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#37415112_1px,transparent_1px),linear-gradient(to_bottom,#37415112_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none z-0" />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[140px] animate-pulse duration-10000" />
          <div className="absolute top-60 -right-32 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[120px] animate-pulse duration-8000" />
          <div className="absolute bottom-40 left-1/3 w-[350px] h-[350px] bg-blue-600/6 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {!session && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto space-y-6 pt-4 text-left"
            >
              {/* Logo / Header inside the form */}
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center border border-indigo-500/20 shadow-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {authMode === "login" 
                    ? (isHi ? "नागरिक पोर्टल लॉगिन" : "Citizen Portal Login") 
                    : authMode === "signup"
                    ? (isHi ? "नागरिक पंजीकरण" : "Citizen Registration")
                    : (isHi ? "पासवर्ड पुनर्प्राप्ति" : "Password Recovery")}
                </h2>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  {authMode === "login"
                    ? (isHi ? "शिकायत दर्ज करने और ट्रैक करने के लिए लॉगिन करें" : "Log in to report and track your civic complaints")
                    : authMode === "signup"
                    ? (isHi ? "शिकायत निवारण प्रणाली में शामिल होने के लिए रजिस्टर करें" : "Sign up to join the smart grievance resolution portal")
                    : (isHi ? "अपना पासवर्ड रीसेट करने के लिए सुरक्षा कोड प्राप्त करें" : "Recover your password using a security verification code")}
                </p>
              </div>

              {/* Mode Toggle Selector */}
              {authMode !== "forgot" && (
                <div className="flex bg-[#090d16]/90 border border-[#1f2937]/60 p-1 rounded-xl shadow-inner h-11 relative overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setAuthError(null); }}
                    className="flex-1 text-xs font-bold rounded-lg transition-all cursor-pointer relative h-full flex items-center justify-center"
                  >
                    {authMode === "login" && (
                      <motion.div
                        layoutId="authToggleBg"
                        className="absolute inset-0 bg-[#111827] border border-[#1f2937]/80 rounded-lg"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${authMode === "login" ? "text-white" : "text-gray-400 hover:text-white"}`}>
                      {isHi ? "लॉगिन करें" : "Sign In"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("signup"); setAuthError(null); }}
                    className="flex-1 text-xs font-bold rounded-lg transition-all cursor-pointer relative h-full flex items-center justify-center"
                  >
                    {authMode === "signup" && (
                      <motion.div
                        layoutId="authToggleBg"
                        className="absolute inset-0 bg-[#111827] border border-[#1f2937]/80 rounded-lg"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${authMode === "signup" ? "text-white" : "text-gray-400 hover:text-white"}`}>
                      {isHi ? "नया खाता बनाएं" : "Register"}
                    </span>
                  </button>
                </div>
              )}

              {/* Form Frame */}
              <motion.div 
                layout 
                className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden glass-premium"
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
              >
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#7c3aed]/5 rounded-full filter blur-xl pointer-events-none" />
                
                {authMode === "forgot" ? (
                  <form 
                    onSubmit={
                      forgotStep === 1 
                        ? handleSendOtp 
                        : forgotStep === 2 
                        ? handleVerifyOtp 
                        : handleResetPassword
                    } 
                    className="space-y-4"
                  >
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-bold px-4 py-3 rounded-xl flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </motion.div>
                    )}

                    {forgotStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                            {isHi ? "पंजीकृत ईमेल पता" : "Registered Email Address"}
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <Mail className="w-4 h-4" />
                            </div>
                            <Input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="e.g. amit@gmail.com"
                              className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={() => {
                              setAuthMode("login");
                              setAuthError(null);
                            }}
                            className="flex-1 h-11 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 font-bold cursor-pointer transition-all text-xs uppercase"
                          >
                            {isHi ? "रद्द करें" : "Cancel"}
                          </Button>
                          <Button
                            type="submit"
                            disabled={authLoading}
                            className="flex-1 h-11 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#6366f1] text-white font-bold cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            {authLoading ? (
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            {isHi ? "ओटीपी भेजें" : "Send OTP"}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {forgotStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 text-left"
                      >
                        <div className="bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-3.5 rounded-xl flex items-start gap-2.5">
                          <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <p className="font-bold">{isHi ? "ओटीपी भेजा गया!" : "OTP Sent Successfully!"}</p>
                            <p className="text-[10px] text-indigo-400 mt-0.5">{otpSentMessage}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5 flex justify-between items-center">
                            <span>{isHi ? "सत्यापन कोड (ओटीपी)" : "Verification Code (OTP)"}</span>
                            <span className="font-mono text-indigo-400 font-black">{otpTimer > 0 ? `${otpTimer}s` : ""}</span>
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input
                              type="text"
                              value={inputOtp}
                              onChange={(e) => setInputOtp(e.target.value)}
                              placeholder="e.g. 123456"
                              maxLength={6}
                              className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300 font-mono tracking-widest text-center text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                          <span className="text-gray-500">{isHi ? "कोड नहीं मिला?" : "Didn't receive code?"}</span>
                          <button
                            type="button"
                            disabled={otpTimer > 0 || authLoading}
                            onClick={handleResendOtp}
                            className={`font-black flex items-center gap-1 cursor-pointer transition-colors duration-200 ${
                              otpTimer > 0 
                                ? "text-gray-600 cursor-not-allowed" 
                                : "text-indigo-400 hover:text-indigo-300"
                            }`}
                          >
                            <RefreshCw className={`w-3 h-3 ${authLoading ? "animate-spin" : ""}`} />
                            {isHi ? "पुनः भेजें" : "Resend OTP"}
                          </button>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={() => {
                              setForgotStep(1);
                              setAuthError(null);
                            }}
                            className="flex-1 h-11 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 font-bold cursor-pointer transition-all text-xs uppercase"
                          >
                            {isHi ? "पीछे जाएं" : "Back"}
                          </Button>
                          <Button
                            type="submit"
                            disabled={authLoading}
                            className="flex-1 h-11 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#6366f1] text-white font-bold cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            {isHi ? "ओटीपी सत्यापित करें" : "Verify OTP"}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {forgotStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4 text-left"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                            {isHi ? "नया पासवर्ड" : "New Password"}
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="pl-10.5 pr-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer p-0.5"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                            {isHi ? "पासवर्ड की पुष्टि करें" : "Confirm New Password"}
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="w-full h-11 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#6366f1] text-white hover:from-[#6d28d9] hover:to-[#4f46e5] font-bold cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-wider mt-4 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(124,58,237,0.45)]"
                        >
                          {authLoading ? (
                            <>
                              <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              {isHi ? "पासवर्ड रीसेट किया जा रहा है..." : "Resetting Password..."}
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              {isHi ? "सुरक्षित रीसेट करें" : "Securely Reset Password"}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-bold px-4 py-3 rounded-xl flex items-start gap-2"
                      >
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                      {authMode === "signup" && (
                        <motion.div
                          key="auth-name"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="space-y-1.5 overflow-hidden text-left"
                        >
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                            {isHi ? "आपका नाम" : "Full Name"}
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <User className="w-4 h-4" />
                            </div>
                            <Input
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder={isHi ? "उदा. अमित कुमार" : "e.g. Amit Kumar"}
                              className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                              required
                            />
                          </div>
                        </motion.div>
                      )}

                      <motion.div key="auth-email" layout className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                          {authMode === "login" 
                            ? (isHi ? "ईमेल या मोबाइल नंबर" : "Email ID or Mobile Number")
                            : (isHi ? "ईमेल पता" : "Email Address")}
                        </label>
                        <div className="relative group/input">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                            <Mail className="w-4 h-4" />
                          </div>
                          <Input
                            type="text"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder={authMode === "login"
                              ? (isHi ? "उदा. amit@gmail.com या 9876543210" : "e.g. amit@gmail.com or 9876543210")
                              : (isHi ? "उदा. amit@gmail.com" : "e.g. amit@gmail.com")}
                            className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                            required
                          />
                        </div>
                      </motion.div>

                      {authMode === "signup" && (
                        <motion.div
                          key="auth-mobile"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="space-y-1.5 overflow-hidden text-left"
                        >
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                            {isHi ? "मोबाइल नंबर" : "Mobile Number"}
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <Phone className="w-4 h-4" />
                            </div>
                            <Input
                              type="tel"
                              value={authMobile}
                              onChange={(e) => setAuthMobile(e.target.value)}
                              placeholder="e.g. 9876543210"
                              maxLength={10}
                              className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                              required
                            />
                          </div>
                        </motion.div>
                      )}

                      <motion.div key="auth-password" layout className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                          {isHi ? "सुरक्षा पासवर्ड" : "Password"}
                        </label>
                        <div className="relative group/input">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                            <Lock className="w-4 h-4" />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-10.5 pr-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-655 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer p-0.5"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {authMode === "login" && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode("forgot");
                                setForgotStep(1);
                                setForgotEmail("");
                                setAuthError(null);
                              }}
                              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 cursor-pointer hover:underline"
                            >
                              {isHi ? "पासवर्ड भूल गए?" : "Forgot Password?"}
                            </button>
                          </div>
                        )}
                      </motion.div>

                      {authMode === "signup" && (
                        <motion.div
                          key="auth-confirm"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="space-y-1.5 overflow-hidden text-left"
                        >
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                            {isHi ? "पासवर्ड की पुष्टि करें" : "Confirm Password"}
                          </label>
                          <div className="relative group/input">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/input:text-indigo-400 group-focus-within/input:scale-110 group-focus-within/input:translate-x-0.5 transition-all duration-300">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={authConfirmPassword}
                              onChange={(e) => setAuthConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="pl-10.5 h-11 bg-[#05070f]/80 border-[#1f2937]/80 hover:border-indigo-500/30 hover:bg-[#070c1a]/95 rounded-xl text-gray-100 placeholder:text-gray-655 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.18)] transition-all duration-300"
                              required
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div layout>
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#6366f1] text-white hover:from-[#6d28d9] hover:to-[#4f46e5] font-bold cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-wider mt-4 flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(124,58,237,0.45)]"
                      >
                        {authLoading ? (
                          <>
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            {isHi ? "सत्यापित किया जा रहा है..." : "Authenticating..."}
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            {authMode === "login" 
                              ? (isHi ? "लॉगिन करें और प्रवेश करें" : "Sign In & Enter Portal")
                              : (isHi ? "खाता बनाएं और लॉगिन करें" : "Create Account & Sign In")}
                          </>
                        )}
                      </Button>

                      {/* Google Login Separator & Button */}
                      <div className="relative my-4 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-800/60" />
                        </div>
                        <span className="relative z-10 bg-[#070b15] px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          {isHi ? "या" : "Or"}
                        </span>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={authLoading}
                        className="w-full h-11 rounded-xl bg-[#090d16] hover:bg-[#111827] border border-[#1f2937]/80 hover:border-indigo-500/30 text-gray-300 hover:text-white font-bold cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>{isHi ? "गूगल के साथ साइन इन करें" : "Sign In with Google"}</span>
                      </Button>
                    </motion.div>
                  </form>
                )}
              </motion.div>

              {/* Secure Notice Footer */}
              <div className="text-[10px] text-gray-500 font-semibold text-center flex items-center justify-center gap-1.5 py-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isHi ? "सुरक्षित एसएसएल एन्क्रिप्टेड कनेक्शन" : "Secure SSL encrypted database connection"}</span>
              </div>
            </motion.div>
          )}

          {session && (
            <>
              {/* Decorative Background Orbs */}
              <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-20 -left-32 w-96 h-96 bg-indigo-600/4 rounded-full blur-[120px]" />
                <div className="absolute top-60 -right-32 w-80 h-80 bg-violet-600/3 rounded-full blur-[100px]" />
                <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-blue-600/3 rounded-full blur-[100px]" />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 border-b border-[#1f2937]/30 pb-4">
                  <TabsList className="hidden sm:flex bg-[#070b15]/80 border border-[#1f2937]/65 p-1 rounded-2xl h-12 gap-1.5 shadow-2xl mx-auto backdrop-blur-md">
                    <TabsTrigger
                      value="new"
                      className="gap-2 px-5 h-9.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600/90 data-[state=active]:to-violet-600/90 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-[#111827]/60 text-gray-400 hover:text-gray-200"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      {dict.newComplaint.toUpperCase()}
                    </TabsTrigger>
                    <TabsTrigger
                      value="track"
                      className="gap-2 px-5 h-9.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600/90 data-[state=active]:to-violet-600/90 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-[#111827]/60 text-gray-400 hover:text-gray-200"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      {dict.myComplaints.toUpperCase()}
                    </TabsTrigger>
                    <TabsTrigger
                      value="search-track"
                      className="gap-2 px-5 h-9.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600/90 data-[state=active]:to-violet-600/90 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-[#111827]/60 text-gray-400 hover:text-gray-200"
                    >
                      <Search className="w-4 h-4 shrink-0" />
                      {isHi ? "शिकायत ट्रैक करें" : "TRACK COMPLAINT"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="chatbot"
                      className="gap-2 px-5 h-9.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600/90 data-[state=active]:to-violet-600/90 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:bg-[#111827]/60 text-gray-400 hover:text-gray-200"
                    >
                      <Bot className="w-4 h-4 shrink-0 text-cyan-400" />
                      {isHi ? "AI चैटबॉट" : "AI CHATBOT"}
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    </TabsTrigger>
                  </TabsList>
                </div>

            {/* New Complaint Tab */}
            <TabsContent value="new">
              <ComplaintForm 
                language={language}
                onLanguageChange={handleLanguageChange}
                onComplaintCreated={refreshComplaints} 
                onTrack={handleTrackComplaint}
              />
            </TabsContent>

            {/* Track Complaints Tab */}
            <TabsContent value="track">
              <div className="space-y-6 text-left">
                {/* Merged Profile Section at the top of Complaints */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Digital ID Card Profile Card */}
                  <div className="lg:col-span-3 bg-linear-to-br from-[#0e1726]/60 via-[#070b15]/75 to-[#090d16]/60 border border-indigo-500/25 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-5 group transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.12)] scanning-laser-container">
                    {/* Tech grid overlay inside ID */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf807_1px,transparent_1px),linear-gradient(to_bottom,#818cf807_1px,transparent_1px)] bg-size-[1.5rem_1.5rem] pointer-events-none" />
                    
                    {/* Holographic Glowing Orbs inside ID */}
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#7c3aed]/15 rounded-full filter blur-xl pointer-events-none group-hover:bg-[#7c3aed]/25 transition-all duration-500" />
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-blue-500/10 rounded-full filter blur-xl pointer-events-none" />
                    
                    {/* ID Photo Frame with scanning effect */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-400/40 shadow-2xl relative overflow-hidden p-0.5">
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-500/20 to-transparent animate-pulse" />
                        <div className="w-full h-full rounded-[10px] bg-[#05070f]/90 flex items-center justify-center border border-indigo-500/30">
                          <User className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#05070f] flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-center sm:text-left flex-1 min-w-0 z-10">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-xl font-black text-white leading-none truncate font-sans tracking-wide">
                          {session?.name?.toUpperCase()}
                        </h2>
                        <Badge variant="outline" className="border-indigo-400/40 text-indigo-400 bg-indigo-500/5 font-black uppercase text-[8.5px] px-2 py-0.5 tracking-wider rounded-md animate-pulse">
                          Verified Citizen
                        </Badge>
                      </div>
                      
                      {/* Contact Details with custom icons */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-400 font-bold">
                        <span className="flex items-center gap-1.5 min-w-0 truncate">
                          <Mail className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                          <span className="truncate hover:text-white transition-colors duration-200">{session?.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                          <span className="hover:text-white transition-colors duration-200">{session?.mobile || "+91 96317 06698"}</span>
                        </span>
                      </div>
                      
                      {/* Fake Chip & Barcode design */}
                      <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                        {/* AI Gold Chip */}
                        <div className="w-6 h-5 rounded-sm bg-linear-to-br from-amber-400/70 via-indigo-500/40 to-amber-500/70 border border-amber-300/40 shadow-inner relative flex items-center justify-center">
                          <div className="w-3 h-2.5 border border-white/20 rounded-xs bg-[#05070f]/20" />
                        </div>
                        {/* Barcode representation */}
                        <div className="flex gap-0.5 h-4 opacity-50 hover:opacity-80 transition-opacity">
                          <div className="w-px bg-white h-full" />
                          <div className="w-[2px] bg-white h-full" />
                          <div className="w-px bg-white h-full" />
                          <div className="w-[3px] bg-white h-full" />
                          <div className="w-px bg-white h-full" />
                          <div className="w-[2px] bg-white h-full" />
                          <div className="w-[4px] bg-white h-full" />
                          <div className="w-px bg-white h-full" />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest">
                          JM-{session?.id?.substring(0, 8) || "CIT-2026"}
                        </span>
                      </div>
                    </div>

                    {/* Registration Date Pill */}
                    <div className="text-[10px] font-bold text-gray-400 bg-[#070b13]/80 border border-indigo-500/20 rounded-xl px-3.5 py-2 flex items-center gap-1.5 self-center shrink-0 shadow-md">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        REG: {session?.authenticatedAt ? new Date(session.authenticatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase() : "JUNE 2026"}
                      </span>
                    </div>
                  </div>

                  {/* Profile Stats Grid */}
                  <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                    <div className="bg-[#090d16]/40 border border-[#1f2937]/60 rounded-2xl p-4.5 flex flex-col justify-center text-left transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] group relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-16 h-16 bg-indigo-500/5 rounded-full blur-lg" />
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block">Grievances</span>
                      <span className="text-2.5xl font-black text-white block mt-0.5 group-hover:scale-105 transition-transform duration-300">{complaints.length}</span>
                      <span className="text-[8px] text-gray-400 font-medium mt-0.5 hidden sm:block">Total filed</span>
                    </div>

                    <div className="bg-[#090d16]/40 border border-emerald-500/10 rounded-2xl p-4.5 flex flex-col justify-center text-left transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg" />
                      <span className="text-[9px] text-emerald-400/80 font-black uppercase tracking-wider block">Resolved</span>
                      <span className="text-2.5xl font-black text-emerald-400 block mt-0.5 group-hover:scale-105 transition-transform duration-300">
                        {complaints.filter(c => c.status === "resolved").length}
                      </span>
                      <span className="text-[8px] text-gray-400 font-medium mt-0.5 hidden sm:block">Verified</span>
                    </div>

                    <div className="bg-[#090d16]/40 border border-amber-500/10 rounded-2xl p-4.5 flex flex-col justify-center text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-16 h-16 bg-amber-500/5 rounded-full blur-lg" />
                      <span className="text-[9px] text-amber-400/80 font-black uppercase tracking-wider block">Active</span>
                      <span className="text-2.5xl font-black text-amber-400 block mt-0.5 group-hover:scale-105 transition-transform duration-300">
                        {complaints.filter(c => c.status !== "resolved").length}
                      </span>
                      <span className="text-[8px] text-gray-400 font-medium mt-0.5 hidden sm:block">Processing</span>
                    </div>
                  </div>
                </div>

                {/* Main Complaints List & Tracking Split */}
                <div className="grid grid-cols-1 grid-rows-1 lg:grid-cols-5 gap-6">
                  {/* Complaint List */}
                  <div className={`${selectedComplaint ? "hidden lg:block" : "block"} lg:col-span-2 space-y-3`}>
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                      {dict.yourComplaints} ({complaints.length})
                    </h3>
                  {complaints.length === 0 ? (
                    <p className="text-sm text-muted-foreground/80 font-medium py-4 text-center">
                      {isHi ? "कोई शिकायत नहीं मिली।" : "No complaints found."}
                    </p>
                  ) : (
                    complaints.map((c, i) => {
                      const PIcon = priorityIcon[c.priority] || Clock;
                      const isActive = selectedComplaint === c.id;
                      const statusColor =
                        c.status === "resolved"
                          ? "border-l-emerald-500 shadow-emerald-500/5 hover:shadow-emerald-500/10"
                          : c.status === "escalated" || c.status === "reopened"
                          ? "border-l-red-500 shadow-red-500/5 hover:shadow-red-500/10"
                          : c.status === "pending_citizen_confirmation"
                          ? "border-l-amber-500 shadow-amber-500/5 hover:shadow-amber-500/10"
                          : "border-l-indigo-500 shadow-indigo-500/5 hover:shadow-indigo-500/10";
                      return (
                        <motion.div
                          key={c.id}
                          className={`glass-card rounded-2xl p-4.5 cursor-pointer transition-all duration-300 border-l-4 bg-[#090d16]/30 border border-[#1f2937]/50 ${statusColor} ${
                            isActive
                              ? "scale-[1.02] shadow-lg bg-indigo-950/10 border-indigo-500/40"
                              : "hover:scale-[1.01] hover:bg-[#090d16]/50 hover:border-gray-700/80"
                          }`}
                          onClick={() => setSelectedComplaint(c.id)}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, ease: "easeOut" }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <span className="text-xs font-mono font-bold text-muted-foreground/70">
                              {c.id}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase font-bold tracking-wider priority-${c.priority}`}
                            >
                              <PIcon className="w-3.5 h-3.5 mr-1" />
                              {getPriorityLabel(c.priority)}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-sm text-foreground/90 mb-1.5 line-clamp-1 leading-snug">
                            {isHi ? c.titleHi : c.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                              style={{
                                backgroundColor:
                                  c.status === "resolved"
                                    ? "#10B981"
                                    : c.status === "escalated" || c.status === "reopened"
                                    ? "#EF4444"
                                    : c.status === "pending_citizen_confirmation"
                                    ? "#F59E0B"
                                    : "#F59E0B",
                              }}
                            />
                            <span className="capitalize">
                              {getStatusLabel(c.status)}
                            </span>
                            <span className="ml-auto font-semibold">
                              {translateArea(c.area)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Complaint Detail */}
                <div className={`${!selectedComplaint ? "hidden lg:block" : "block"} lg:col-span-3`}>
                  {complaint ? (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      {/* Premium Mobile-only Back Button */}
                      <div className="lg:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedComplaint(null)}
                          className="gap-1.5 text-xs font-bold bg-muted/65 border border-border/40 hover:bg-muted/90 text-foreground cursor-pointer shadow-sm rounded-xl px-4 py-2 hover:border-primary/20 active:scale-95 transition-all"
                        >
                          {isHi ? "← वापस" : "← Back"}
                        </Button>
                      </div>
                      {/* Header card */}
                      <div className="glass-premium rounded-2xl p-6 relative overflow-hidden">
                        {/* Soft decorative background orb */}
                        <div className="absolute -right-12 -top-12 w-28 h-28 bg-primary/5 rounded-full filter blur-xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-sm font-bold text-muted-foreground/70">
                            {complaint.id}
                          </span>
                          <Badge className={`priority-${complaint.priority} font-bold text-xs uppercase px-2.5 py-0.5`}>
                            {getPriorityLabel(complaint.priority).toUpperCase()} {isHi ? "प्राथमिकता" : "PRIORITY"}
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 mb-3">
                          {isHi ? complaint.titleHi : complaint.title}
                        </h2>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed mb-5">
                          {isHi ? complaint.descriptionHi : complaint.description}
                        </p>

                        {complaint.imageUrl && (
                          <div className="mb-5 rounded-2xl overflow-hidden border border-border/40 max-h-[300px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={complaint.imageUrl} alt="Attached Evidence" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                              {dict.department}
                            </div>
                            <div className="font-bold text-sm text-foreground/90">
                              {isHi ? complaint.departmentHi : complaint.department}
                            </div>
                          </div>
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                              {dict.area}
                            </div>
                            <div className="font-bold text-sm text-foreground/90">
                              {translateArea(complaint.area)}
                            </div>
                          </div>
                        </div>

                        {complaint.assignedOfficer && (
                          <div className="mt-4 bg-muted/20 rounded-xl p-3 border border-border/10 flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {dict.assignedOfficer}:
                            </span>
                            <span className="text-xs font-extrabold text-foreground/80">
                              {complaint.assignedOfficer}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* AI Summary */}
                      <div className="glass-card rounded-2xl p-6 bg-ai-purple/3 border border-ai-purple/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-5 h-5 text-ai-purple animate-pulse" />
                          <span className="font-bold text-sm text-foreground/90">{dict.aiSummary}</span>
                          <Badge variant="outline" className="text-xs ml-auto border-ai-purple/30 text-ai-purple bg-ai-purple/5 font-semibold">
                            {Math.round(complaint.aiConfidence * 100)}% {dict.confidence}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed font-semibold bg-background/40 border border-ai-purple/10 rounded-xl p-4 shadow-inner">
                          {isHi ? complaint.aiSummaryHi : complaint.aiSummary}
                        </p>
                      </div>

                      {/* AI Agent Autonomous Action Panel */}
                      <AIAgentFollowUpPanel complaint={complaint} language={language} />

                      {/* 🚨 Citizen Verification Panel (Proof Based Resolution) */}
                      {complaint.status === "pending_citizen_confirmation" && complaint.resolutionProof && (
                        <motion.div
                          className="rounded-2xl border-2 border-warning-amber/30 bg-warning-amber/3 p-6 space-y-4 relative overflow-hidden"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="absolute -right-16 -top-16 w-40 h-40 bg-warning-amber/5 rounded-full filter blur-[60px] pointer-events-none" />
                          
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-warning-amber animate-pulse" />
                            <span className="font-black text-sm text-white">
                              {isHi ? "🔔 क्या समस्या हल हो गई? पुष्टि करें" : "🔔 Is the issue resolved? Confirm below"}
                            </span>
                          </div>

                          {/* Officer's Proof */}
                          <div className="bg-black/20 border border-white/8 rounded-xl p-4 space-y-3">
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                              {isHi ? "अधिकारी का समाधान प्रमाण" : "Officer's Resolution Proof"}
                            </div>
                            {complaint.resolutionProof.photoUrl && (
                              <div className="rounded-xl overflow-hidden border border-white/10 max-h-[200px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={complaint.resolutionProof.photoUrl} alt="Resolution Proof" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <p className="text-xs text-gray-300 font-semibold leading-relaxed bg-white/3 rounded-lg p-3 border border-white/5">
                              "{complaint.resolutionProof.note}"
                            </p>
                            <div className="text-[10px] text-gray-500 font-semibold">
                              — {complaint.resolutionProof.officerName} • {new Date(complaint.resolutionProof.submittedAt).toLocaleString("en-IN")}
                            </div>
                          </div>

                          {/* Feedback input */}
                          <div className="space-y-2">
                            <textarea
                              placeholder={isHi ? "अपनी प्रतिक्रिया दें (वैकल्पिक)..." : "Your feedback (optional for confirm, required for reject)..."}
                              value={verifyFeedback}
                              onChange={(e) => setVerifyFeedback(e.target.value)}
                              className="w-full text-xs min-h-[60px] rounded-xl bg-white/3 border border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/30 text-gray-200 placeholder:text-gray-600 p-3 outline-none transition-all resize-none"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              disabled={isVerifying}
                              onClick={() => handleVerifyResolution(complaint.id, true)}
                              className="flex-1 text-xs h-11 rounded-xl bg-linear-to-r from-trust-green via-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-trust-green/20 cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-trust-green/30 active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {isHi ? "✅ हाँ, समस्या हल हो गई" : "✅ Yes, Issue is Fixed"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isVerifying || !verifyFeedback.trim()}
                              onClick={() => handleVerifyResolution(complaint.id, false)}
                              className="flex-1 text-xs h-11 rounded-xl border-danger-red/30 text-danger-red hover:bg-danger-red/5 font-black cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              {isHi ? "❌ नहीं, अभी नहीं हुई" : "❌ Not Solved"}
                            </Button>
                          </div>

                          {/* Photo upload for rejection */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-gray-500 font-bold">
                              {isHi ? "अस्वीकार के लिए फोटो प्रमाण अपलोड करें (वैकल्पिक)" : "Upload photo proof for rejection (optional)"}
                            </span>
                            {rejectPhoto ? (
                              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                                <Camera className="w-3.5 h-3.5 text-trust-green" />
                                <span className="text-[10px] text-gray-300 font-bold truncate flex-1">{rejectPhotoName}</span>
                                <button type="button" onClick={() => { setRejectPhoto(null); setRejectPhotoName(""); }} className="text-[9px] text-red-400 font-black cursor-pointer">
                                  {isHi ? "हटाएं" : "Remove"}
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 bg-white/2 hover:bg-white/4 cursor-pointer transition-all text-[10px] text-gray-500 font-bold">
                                <Upload className="w-3.5 h-3.5" />
                                {isHi ? "क्लिक करें और फोटो चुनें" : "Click to attach photo"}
                                <input type="file" accept="image/*" onChange={handleRejectPhotoUpload} className="hidden" />
                              </label>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Citizen Verification Result (if already verified) */}
                      {complaint.citizenVerification && (
                        <div className={`rounded-2xl p-4 border ${
                          complaint.citizenVerification.verified
                            ? "border-trust-green/25 bg-trust-green/3"
                            : "border-danger-red/25 bg-danger-red/3"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {complaint.citizenVerification.verified ? (
                              <CheckCircle2 className="w-4 h-4 text-trust-green" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-danger-red" />
                            )}
                            <span className={`text-xs font-black ${
                              complaint.citizenVerification.verified ? "text-trust-green" : "text-danger-red"
                            }`}>
                              {complaint.citizenVerification.verified
                                ? (isHi ? "✅ आपने पुष्टि की: समस्या हल हो गई" : "✅ You confirmed: Issue is resolved")
                                : (isHi ? "❌ आपने अस्वीकार किया: समस्या अभी हल नहीं हुई" : "❌ You rejected: Issue not yet resolved")}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-semibold">"{complaint.citizenVerification.feedback}"</p>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="glass-card rounded-2xl p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          {dict.trackingTimeline}
                        </h3>
                        <TrackingTimeline events={complaint.timeline} language={language} />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <ArrowUpRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{dict.selectComplaint}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dict.selectDesc}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

            {/* Search and Track Tab */}
            <TabsContent value="search-track">
              <div className="max-w-2xl mx-auto space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Search Bar Block */}
                <div className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                      {isHi ? "अपनी शिकायत ट्रैक करें" : "Track Your Complaint"}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    {isHi 
                      ? "अपनी शिकायत की वास्तविक समय में प्रगति देखने के लिए अपनी विशिष्ट शिकायत संख्या (जैसे, JM-2026-011) दर्ज करें।" 
                      : "Enter your unique complaint number (e.g., JM-2026-011) to track its real-time progress and resolution status."}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="text"
                      value={trackSearchId}
                      onChange={(e) => setTrackSearchId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchTrack();
                      }}
                      placeholder="JM-2026-011"
                      className="flex-1 text-sm border border-[#1f2937]/80 focus:border-[#7c3aed]/60 focus:ring-1 focus:ring-[#7c3aed]/40 rounded-xl px-4 py-3 bg-[#070b13] text-gray-100 placeholder:text-gray-600 outline-none transition-all focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] focus:scale-[1.002]"
                    />
                    <Button
                      type="button"
                      onClick={() => handleSearchTrack()}
                      className="rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] px-6 font-bold cursor-pointer transition-all active:scale-95 py-3 h-auto text-xs uppercase"
                    >
                      {isHi ? "खोजें और ट्रैक करें" : "Search & Track"}
                    </Button>
                  </div>

                  {trackError && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-red-400 pt-1 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                      {isHi 
                        ? "शिकायत संख्या नहीं मिली। कृपया पुनः जांचें और सही नंबर दर्ज करें।" 
                        : "Complaint ID not found. Please double-check and enter a valid ID."}
                    </motion.div>
                  )}
                </div>

                {/* Tracked Results Area */}
                <AnimatePresence mode="wait">
                  {trackedComplaint ? (
                    <motion.div
                      key={trackedComplaint.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-6"
                    >
                      {/* Details Header */}
                      <div className="glass-premium rounded-2xl p-6 relative overflow-hidden border border-[#1f2937]/50 shadow-xl">
                        <div className="absolute -right-12 -top-12 w-28 h-28 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-sm font-bold text-muted-foreground/70">
                            {trackedComplaint.id}
                          </span>
                          <Badge className={`priority-${trackedComplaint.priority} font-bold text-xs uppercase px-2.5 py-0.5`}>
                            {getPriorityLabel(trackedComplaint.priority).toUpperCase()} {isHi ? "प्राथमिकता" : "PRIORITY"}
                          </Badge>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
                          {isHi ? trackedComplaint.titleHi : trackedComplaint.title}
                        </h2>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                          {isHi ? trackedComplaint.descriptionHi : trackedComplaint.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-[#090d16]/30 rounded-xl p-4 border border-[#1f2937]/30">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                              {dict.department}
                            </div>
                            <div className="font-bold text-xs text-white">
                              {isHi ? trackedComplaint.departmentHi : trackedComplaint.department}
                            </div>
                          </div>
                          <div className="bg-[#090d16]/30 rounded-xl p-4 border border-[#1f2937]/30">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                              {isHi ? "क्षेत्र" : "Area"}
                            </div>
                            <div className="font-bold text-xs text-white">
                              {translateArea(trackedComplaint.area)}
                            </div>
                          </div>
                        </div>

                        {trackedComplaint.assignedOfficer && (
                          <div className="mt-4 bg-[#090d16]/20 rounded-xl p-3 border border-[#1f2937]/20 flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                              {dict.assignedOfficer}:
                            </span>
                            <span className="text-xs font-extrabold text-gray-300">
                              {trackedComplaint.assignedOfficer}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* AI Summary */}
                      <div className="glass-card rounded-2xl p-6 bg-indigo-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <span className="font-bold text-sm text-white">{dict.aiSummary}</span>
                          <Badge variant="outline" className="text-xs ml-auto border-indigo-500/30 text-indigo-400 bg-indigo-500/5 font-semibold">
                            {Math.round(trackedComplaint.aiConfidence * 100)}% {dict.confidence}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-semibold bg-black/40 border border-indigo-500/10 rounded-xl p-4 shadow-inner">
                          {isHi ? trackedComplaint.aiSummaryHi : trackedComplaint.aiSummary}
                        </p>
                      </div>

                      {/* AI Agent Autonomous Action Panel */}
                      <AIAgentFollowUpPanel complaint={trackedComplaint} language={language} />

                      {/* 🚨 Citizen Verification Panel (Proof Based Resolution) */}
                      {trackedComplaint.status === "pending_citizen_confirmation" && trackedComplaint.resolutionProof && (
                        <motion.div
                          className="rounded-2xl border-2 border-warning-amber/30 bg-warning-amber/3 p-6 space-y-4 relative overflow-hidden"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="absolute -right-16 -top-16 w-40 h-40 bg-warning-amber/5 rounded-full filter blur-[60px] pointer-events-none" />
                          
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-warning-amber animate-pulse" />
                            <span className="font-black text-sm text-white">
                              {isHi ? "🔔 क्या समस्या हल हो गई? पुष्टि करें" : "🔔 Is the issue resolved? Confirm below"}
                            </span>
                          </div>

                          {/* Officer's Proof */}
                          <div className="bg-black/20 border border-white/8 rounded-xl p-4 space-y-3">
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                              {isHi ? "अधिकारी का समाधान प्रमाण" : "Officer's Resolution Proof"}
                            </div>
                            {trackedComplaint.resolutionProof.photoUrl && (
                              <div className="rounded-xl overflow-hidden border border-white/10 max-h-[200px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={trackedComplaint.resolutionProof.photoUrl} alt="Resolution Proof" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <p className="text-xs text-gray-300 font-semibold leading-relaxed bg-white/3 rounded-lg p-3 border border-white/5">
                              "{trackedComplaint.resolutionProof.note}"
                            </p>
                            <div className="text-[10px] text-gray-500 font-semibold">
                              — {trackedComplaint.resolutionProof.officerName} • {new Date(trackedComplaint.resolutionProof.submittedAt).toLocaleString("en-IN")}
                            </div>
                          </div>

                          {/* Feedback input */}
                          <div className="space-y-2">
                            <textarea
                              placeholder={isHi ? "अपनी प्रतिक्रिया दें (वैकल्पिक)..." : "Your feedback (optional for confirm, required for reject)..."}
                              value={verifyFeedback}
                              onChange={(e) => setVerifyFeedback(e.target.value)}
                              className="w-full text-xs min-h-[60px] rounded-xl bg-white/3 border border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/30 text-gray-200 placeholder:text-gray-600 p-3 outline-none transition-all resize-none"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              disabled={isVerifying}
                              onClick={() => {
                                handleVerifyResolution(trackedComplaint.id, true);
                                // Local state update for immediate feedback on the search tab
                                setTrackedComplaint(prev => prev ? {...prev, status: "resolved"} as any : null);
                              }}
                              className="flex-1 text-xs h-11 rounded-xl bg-linear-to-r from-trust-green via-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-trust-green/20 cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-trust-green/30 active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {isHi ? "✅ हाँ, समस्या हल हो गई" : "✅ Yes, Issue is Fixed"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isVerifying || !verifyFeedback.trim()}
                              onClick={() => {
                                handleVerifyResolution(trackedComplaint.id, false);
                                // Local state update for immediate feedback on the search tab
                                setTrackedComplaint(prev => prev ? {...prev, status: "reopened"} as any : null);
                              }}
                              className="flex-1 text-xs h-11 rounded-xl border-danger-red/30 text-danger-red hover:bg-danger-red/5 font-black cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              {isHi ? "❌ नहीं, अभी नहीं हुई" : "❌ Not Solved"}
                            </Button>
                          </div>

                          {/* Photo upload for rejection */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-gray-500 font-bold">
                              {isHi ? "अस्वीकार के लिए फोटो प्रमाण अपलोड करें (वैकल्पिक)" : "Upload photo proof for rejection (optional)"}
                            </span>
                            {rejectPhoto ? (
                              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                                <Camera className="w-3.5 h-3.5 text-trust-green" />
                                <span className="text-[10px] text-gray-300 font-bold truncate flex-1">{rejectPhotoName}</span>
                                <button type="button" onClick={() => { setRejectPhoto(null); setRejectPhotoName(""); }} className="text-[9px] text-red-400 font-black cursor-pointer">
                                  {isHi ? "हटाएं" : "Remove"}
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/10 bg-white/2 hover:bg-white/4 cursor-pointer transition-all text-[10px] text-gray-500 font-bold">
                                <Upload className="w-3.5 h-3.5" />
                                {isHi ? "क्लिक करें और फोटो चुनें" : "Click to attach photo"}
                                <input type="file" accept="image/*" onChange={handleRejectPhotoUpload} className="hidden" />
                              </label>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Citizen Verification Result (if already verified) */}
                      {trackedComplaint.citizenVerification && (
                        <div className={`rounded-2xl p-4 border ${
                          trackedComplaint.citizenVerification.verified
                            ? "border-trust-green/25 bg-trust-green/3"
                            : "border-danger-red/25 bg-danger-red/3"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {trackedComplaint.citizenVerification.verified ? (
                              <CheckCircle2 className="w-4 h-4 text-trust-green" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-danger-red" />
                            )}
                            <span className={`text-xs font-black ${
                              trackedComplaint.citizenVerification.verified ? "text-trust-green" : "text-danger-red"
                            }`}>
                              {trackedComplaint.citizenVerification.verified
                                ? (isHi ? "✅ आपने पुष्टि की: समस्या हल हो गई" : "✅ You confirmed: Issue is resolved")
                                : (isHi ? "❌ आपने अस्वीकार किया: समस्या अभी हल नहीं हुई" : "❌ You rejected: Issue not yet resolved")}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-semibold">"{trackedComplaint.citizenVerification.feedback}"</p>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="glass-card rounded-2xl p-6 border border-[#1f2937]/50">
                        <h3 className="font-semibold text-sm text-white mb-4 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-indigo-400" />
                          {isHi ? "शिकायत ट्रैकिंग टाइमलाइन" : "Grievance Progress Timeline"}
                        </h3>
                        <TrackingTimeline events={trackedComplaint.timeline} language={language} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-search"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card rounded-2xl p-12 text-center border border-[#1f2937]/30"
                    >
                      <Bot className="w-12 h-12 text-indigo-400/30 mx-auto mb-4 animate-pulse" />
                      <h3 className="font-bold text-base text-gray-300 mb-2">
                        {isHi ? "खोज परिणाम खाली" : "Awaiting Tracking Query"}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold max-w-sm mx-auto leading-relaxed">
                        {isHi 
                          ? "शिकायत की वर्तमान स्थिति और लाइव प्रशासनिक गतिविधियों को देखने के लिए ऊपर अपना नंबर दर्ज करें।" 
                          : "Enter your ticket number above to display its active status and live administrative workflow logs."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* AI Chatbot Tab */}
            <TabsContent value="chatbot">
              <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <AIAssistantWidget inline={true} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Redesigned Hero and Civic Stats Card Section */}
          <motion.div
            className="w-full bg-[#090d16]/30 border border-[#1f2937]/45 rounded-3xl p-6 sm:p-8 mt-8 relative overflow-hidden text-left shadow-lg shadow-black/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Soft decorative background glows inside card */}
            <div className="absolute -right-24 -top-24 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-[100px] pointer-events-none" />
            <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-emerald-600/5 rounded-full filter blur-[100px] pointer-events-none" />

            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-black tracking-wider text-indigo-400 uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-Powered Citizen Governance
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Report Civic Issues Instantly
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl font-semibold leading-relaxed mb-6">
              Powered by AI to automatically classify, prioritize, and route complaints to the correct department in real-time.
            </p>

            {/* AI-Powered Civic Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 w-full">
              {/* Stat 1: Green Clock Card */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-[#090f19]/70 p-5 shadow-[0_0_15px_rgba(16,185,129,0.02)] hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] hover:border-emerald-500/30 transition-all duration-300 group text-left">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <Clock className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="text-2xl font-black text-white group-hover:scale-[1.01] transition-transform duration-300">36 Hours</div>
                <div className="text-xs font-bold text-gray-200 mt-1">Avg Resolution Time</div>
                <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Municipal Standard</div>
              </div>

              {/* Stat 2: Blue Checkmark Card */}
              <div className="relative overflow-hidden rounded-2xl border border-blue-500/10 bg-[#090f19]/70 p-5 shadow-[0_0_15px_rgba(59,130,246,0.02)] hover:shadow-[0_0_25px_rgba(59,130,246,0.08)] hover:border-blue-500/30 transition-all duration-300 group text-left">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-blue-400" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-blue-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="text-2xl font-black text-white group-hover:scale-[1.01] transition-transform duration-300">12,400+</div>
                <div className="text-xs font-bold text-gray-200 mt-1">Complaints Resolved</div>
                <div className="text-[10px] text-gray-500 font-semibold mt-0.5">This Month</div>
              </div>

              {/* Stat 3: Purple Target Card */}
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/10 bg-[#090f19]/70 p-5 shadow-[0_0_15px_rgba(168,85,247,0.02)] hover:shadow-[0_0_25px_rgba(168,85,247,0.08)] hover:border-purple-500/30 transition-all duration-300 group text-left">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    <Search className="w-4.5 h-4.5 text-purple-400" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-purple-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="text-2xl font-black text-white group-hover:scale-[1.01] transition-transform duration-300">95.8%</div>
                <div className="text-xs font-bold text-gray-200 mt-1">AI Routing Accuracy</div>
                <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Automated Dispatch</div>
              </div>

              {/* Stat 4: Orange Building Card */}
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-[#090f19]/70 p-5 shadow-[0_0_15px_rgba(245,158,11,0.02)] hover:shadow-[0_0_25px_rgba(245,158,11,0.08)] hover:border-amber-500/30 transition-all duration-300 group text-left">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="text-2xl font-black text-white group-hover:scale-[1.01] transition-transform duration-300">8 Nodal</div>
                <div className="text-xs font-bold text-gray-200 mt-1">Active Departments</div>
                <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Resolution Partners</div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="fixed bottom-6 left-6 right-6 h-19 z-50 bg-[#070b15]/90 backdrop-blur-2xl border border-indigo-500/15 rounded-2xl flex justify-around items-center px-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] sm:hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-300 group select-none outline-none"
                >
                  {/* Glassmorphic active bubble background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBottomBubble"
                      className="absolute inset-x-2 inset-y-2 rounded-xl bg-linear-to-b from-indigo-500/12 to-indigo-500/2 border border-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.12),inset_0_1px_8px_rgba(99,102,241,0.08)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Animated Content Wrapper */}
                  <motion.div
                    animate={isActive ? { y: -2, scale: 1.05 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center justify-center z-10"
                  >
                    {/* Glowing active icon */}
                    <div className="relative">
                      <Icon
                        className={`w-5.5 h-5.5 transition-all duration-300 ${
                          isActive
                            ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                            : "text-gray-400 group-hover:text-gray-300"
                        }`}
                      />
                    </div>

                    {/* Text Label */}
                    <span
                      className={`text-[9.5px] font-black tracking-wider uppercase mt-1.5 transition-all duration-300 ${
                        isActive
                          ? "text-white opacity-100 font-extrabold"
                          : "text-gray-500 opacity-80 group-hover:text-gray-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>

                  {/* Active bottom accent dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBottomDot"
                      className="absolute bottom-1.5 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          </>)}
        </div>
      </main>

      {/* 4. Simulated Digital Email Inbox Node (Holographic Overlay) */}
      <AnimatePresence>
        {authMode === "forgot" && showNotification && generatedOtp && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 max-w-sm w-full z-50 p-0.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_10px_40px_rgba(99,102,241,0.3)] font-sans"
          >
            <div className="bg-[#070b15] rounded-[14px] p-5 text-left space-y-4 border border-white/5 relative overflow-hidden">
              {/* Decorative scan line */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-indigo-500/30 animate-pulse" />
              
              <div className="flex items-center justify-between border-b border-[#1f2937]/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      {isHi ? "सिम्युलेटेड इनबॉक्स" : "Simulated Inbox"}
                    </h4>
                    <p className="text-[9px] text-gray-500 font-bold">mail.janmitra.gov.in</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotification(false)}
                  className="w-6 h-6 rounded-md hover:bg-slate-900 border border-transparent hover:border-slate-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                  <span>FROM: no-reply@janmitra.gov.in</span>
                  <span>JUST NOW</span>
                </div>
                <p className="font-bold text-white border-l-2 border-indigo-500 pl-2 py-0.5">
                  {isHi ? "जनमित्र सुरक्षा पासकोड सत्यापन" : "JanMitra Security Passcode Verification"}
                </p>
                <div className="bg-[#05070f]/90 border border-[#1f2937]/50 rounded-xl p-3.5 text-center space-y-2">
                  <p className="text-[10px] text-gray-400 font-medium">
                    {isHi ? "आपका नया पासवर्ड बदलने के लिए सत्यापन कोड है:" : "Your verification code to reset security password is:"}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-2xl font-black tracking-widest text-indigo-400 selection:bg-indigo-500/20">
                      {generatedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOtp || "");
                      }}
                      className="text-[10px] font-bold text-gray-550 hover:text-white transition-colors underline cursor-pointer"
                    >
                      {isHi ? "कॉपी करें" : "Copy"}
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-gray-500 italic leading-relaxed">
                  {isHi 
                    ? "नोट: यह सुरक्षा सत्यापन प्रणाली का एक सिम्युलेटेड प्रदर्शन है जो विकास परिवेश के लिए कार्यान्वित किया गया है।" 
                    : "Note: This is a simulated display of the security verification system implemented for the development environment."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Simulated Google Authentication Modal (High-Fidelity) */}
      <AnimatePresence>
        {showGoogleSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans text-gray-800"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200"
            >
              {/* Header with Google logo */}
              <div className="p-6 text-center space-y-4 border-b border-gray-100 flex flex-col items-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">Sign in with Google</h3>
                  <p className="text-xs text-gray-500">to continue to JanMitra AI</p>
                </div>
              </div>

              {/* Account List */}
              <div className="p-6 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Choose an account</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {/* Account 1 */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount("Amit Kumar", "amit@gmail.com", "9876543210")}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-left cursor-pointer transition-all active:scale-[0.99] select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
                      AK
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 truncate">Amit Kumar</p>
                      <p className="text-xs text-gray-500 truncate font-mono">amit@gmail.com</p>
                    </div>
                  </button>

                  {/* Account 2 */}
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount("Abhishek Sharma", "theabhishekyt@gmail.com", "9631706698")}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-left cursor-pointer transition-all active:scale-[0.99] select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 shrink-0">
                      AS
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 truncate">Abhishek Sharma</p>
                      <p className="text-xs text-gray-500 truncate font-mono">theabhishekyt@gmail.com</p>
                    </div>
                  </button>
                </div>

                {/* Footer buttons */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoogleSimulation(false);
                      setAuthLoading(false);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
