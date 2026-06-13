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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/shared/Navbar";
import { ComplaintForm } from "@/components/citizen/ComplaintForm";
import { TrackingTimeline } from "@/components/citizen/TrackingTimeline";
import { AIAgentFollowUpPanel } from "@/components/citizen/AIAgentFollowUpPanel";
import {
  getComplaints,
  getCitizenNotifications,
  markNotificationAsRead,
  clearNotifications,
  citizenVerifyResolution,
  getComplaintById,
} from "@/lib/complaints";
import {
  getAuthSession,
  setAuthSession,
  clearAuthSession,
  registerCitizen,
  loginCitizen,
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
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Inputs
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authMobile, setAuthMobile] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");

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

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync notifications whenever complaints update
  useEffect(() => {
    setNotifications(getCitizenNotifications());
  }, [complaints]);

  const handleClearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotifications("citizen");
    setNotifications([]);
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationAsRead(n.id, "citizen");
    setNotifications(getCitizenNotifications());
    setShowNotifications(false);
    handleTrackComplaint(n.complaintId);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      if (params.get("tab") === "track") {
        setActiveTab("track");
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 md:pt-32 pb-12 bg-[#05070f] text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!session && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto space-y-6 pt-4 text-left"
            >
              {/* Logo / Header inside the form */}
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center border border-indigo-500/20 shadow-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {authMode === "login" 
                    ? (isHi ? "नागरिक पोर्टल लॉगिन" : "Citizen Portal Login") 
                    : (isHi ? "नागरिक पंजीकरण" : "Citizen Registration")}
                </h2>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  {authMode === "login"
                    ? (isHi ? "शिकायत दर्ज करने और ट्रैक करने के लिए लॉगिन करें" : "Log in to report and track your civic complaints")
                    : (isHi ? "शिकायत निवारण प्रणाली में शामिल होने के लिए रजिस्टर करें" : "Sign up to join the smart grievance resolution portal")}
                </p>
              </div>

              {/* Mode Toggle Selector */}
              <div className="flex bg-[#090d16] border border-[#1f2937]/60 p-1 rounded-xl shadow-inner h-11">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(null); }}
                  className={`flex-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "login"
                      ? "bg-[#111827] text-white border border-[#1f2937]/80"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isHi ? "लॉगिन करें" : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthError(null); }}
                  className={`flex-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "signup"
                      ? "bg-[#111827] text-white border border-[#1f2937]/80"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isHi ? "नया खाता बनाएं" : "Register"}
                </button>
              </div>

              {/* Form Frame */}
              <div className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#7c3aed]/5 rounded-full filter blur-xl pointer-events-none" />
                
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

                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                        {isHi ? "आपका नाम" : "Full Name"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          type="text"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder={isHi ? "उदा. अमित कुमार" : "e.g. Amit Kumar"}
                          className="pl-10.5 h-11 bg-[#05070f] border-[#1f2937]/80 rounded-xl text-gray-100 placeholder:text-gray-600 focus:border-[#7c3aed]/60"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                      {authMode === "login" 
                        ? (isHi ? "ईमेल या मोबाइल नंबर" : "Email ID or Mobile Number")
                        : (isHi ? "ईमेल पता" : "Email Address")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="text"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder={authMode === "login"
                          ? (isHi ? "उदा. amit@gmail.com या 9876543210" : "e.g. amit@gmail.com or 9876543210")
                          : (isHi ? "उदा. amit@gmail.com" : "e.g. amit@gmail.com")}
                        className="pl-10.5 h-11 bg-[#05070f] border-[#1f2937]/80 rounded-xl text-gray-100 placeholder:text-gray-600 focus:border-[#7c3aed]/60"
                        required
                      />
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                        {isHi ? "मोबाइल नंबर" : "Mobile Number"}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          type="tel"
                          value={authMobile}
                          onChange={(e) => setAuthMobile(e.target.value)}
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className="pl-10.5 h-11 bg-[#05070f] border-[#1f2937]/80 rounded-xl text-gray-100 placeholder:text-gray-600 focus:border-[#7c3aed]/60"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                      {isHi ? "सुरक्षा पासवर्ड" : "Password"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10.5 pr-10.5 h-11 bg-[#05070f] border-[#1f2937]/80 rounded-xl text-gray-100 placeholder:text-gray-600 focus:border-[#7c3aed]/60"
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

                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1.5">
                        {isHi ? "पासवर्ड की पुष्टि करें" : "Confirm Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={authConfirmPassword}
                          onChange={(e) => setAuthConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10.5 h-11 bg-[#05070f] border-[#1f2937]/80 rounded-xl text-gray-100 placeholder:text-gray-600 focus:border-[#7c3aed]/60"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-11 rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] font-bold cursor-pointer transition-all active:scale-95 text-xs uppercase tracking-wider mt-4 flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                </form>
              </div>

              {/* Secure Notice Footer */}
              <div className="text-[10px] text-gray-500 font-semibold text-center flex items-center justify-center gap-1.5 py-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isHi ? "सुरक्षित एसएसएल एन्क्रिप्टेड कनेक्शन" : "Secure SSL encrypted database connection"}</span>
              </div>
            </motion.div>
          )}

          {session && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1f2937]/30 pb-2">
              <TabsList className="bg-[#090d16] border border-[#1f2937]/45 p-1 rounded-xl h-11 gap-1.5 shadow-lg shadow-black/10">
                <TabsTrigger
                  value="new"
                  className="gap-2 px-4 h-8.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer data-[state=active]:bg-[#111827] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#1f2937]/80 hover:bg-slate-900/60 text-gray-400"
                >
                  <Plus className="w-4 h-4" />
                  {dict.newComplaint.toUpperCase()}
                </TabsTrigger>
                <TabsTrigger
                  value="track"
                  className="gap-2 px-4 h-8.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer data-[state=active]:bg-[#111827] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#1f2937]/80 hover:bg-slate-900/60 text-gray-400"
                >
                  <Search className="w-4 h-4" />
                  {dict.myComplaints.toUpperCase()}
                </TabsTrigger>
                <TabsTrigger
                  value="search-track"
                  className="gap-2 px-4 h-8.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer data-[state=active]:bg-[#111827] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#1f2937]/80 hover:bg-slate-900/60 text-gray-400"
                >
                  <Search className="w-4 h-4" />
                  {isHi ? "शिकायत ट्रैक करें" : "TRACK COMPLAINT"}
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="gap-2 px-4 h-8.5 rounded-lg text-xs font-black transition-all duration-200 cursor-pointer data-[state=active]:bg-[#111827] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#1f2937]/80 hover:bg-slate-900/60 text-gray-400"
                >
                  <User className="w-4 h-4" />
                  {isHi ? "मेरी प्रोफ़ाइल" : "MY PROFILE"}
                </TabsTrigger>
              </TabsList>

              {/* Utility Panel: Notifications & Language Toggle */}
              <div className="flex items-center gap-3 relative justify-end">
                {/* Notification Bell Component */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 h-9 w-9 ${
                      showNotifications 
                        ? "bg-primary/10 text-primary border-primary/30" 
                        : "bg-[#090d16] border-[#1f2937]/60 hover:bg-slate-900 hover:text-white text-gray-400"
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-[9px] font-black text-white rounded-full flex items-center justify-center border border-background animate-pulse shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setShowNotifications(false)} 
                      />
                      <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-y-auto z-50 rounded-2xl p-4 shadow-xl border border-[#1f2937]/80 bg-[#090d16] backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="flex items-center justify-between border-b border-[#1f2937]/50 pb-3 mb-3">
                          <h4 className="font-bold text-xs text-white">
                            {isHi ? "सूचनाएं" : "Notifications"}
                          </h4>
                          {notifications.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearAllNotifications}
                              className="text-[10px] font-black text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {isHi ? "साफ़ करें" : "Clear All"}
                            </button>
                          )}
                        </div>

                        {notifications.length === 0 ? (
                          <div className="py-8 flex flex-col items-center justify-center text-center text-gray-500 gap-2">
                            <Inbox className="w-8 h-8 opacity-40" />
                            <p className="text-xs font-semibold">
                              {isHi ? "कोई नई सूचना नहीं" : "No new notifications"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 text-left ${
                                  n.read
                                    ? "bg-slate-950/40 border-[#1f2937]/50 hover:bg-slate-900/30"
                                    : "bg-indigo-500/5 border-indigo-500/25 hover:bg-indigo-500/10 shadow-sm active-glow-primary hover:border-indigo-500/45"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-gray-400 uppercase tracking-wider font-mono">
                                    {n.complaintId}
                                  </span>
                                  <span className="text-[9px] text-gray-500 font-semibold">
                                    {formatTime(n.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-gray-300 leading-normal">
                                  {isHi ? n.messageHi : n.message}
                                </p>
                                {!n.read && (
                                  <span className="text-[9px] font-black text-indigo-400 self-end animate-pulse">
                                    {isHi ? "● नया" : "● New"}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Language Toggler */}
                <div className="flex items-center gap-1 bg-[#090d16] border border-[#1f2937]/60 p-1 rounded-xl shadow-inner w-fit h-9">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-3.5 h-7 text-[10px] font-black rounded transition-all cursor-pointer ${
                      language === "en"
                        ? "bg-[#111827] text-white border border-[#1f2937]/80"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("hi")}
                    className={`px-3.5 h-7 text-[10px] font-black rounded transition-all cursor-pointer ${
                      language === "hi"
                        ? "bg-[#111827] text-white border border-[#1f2937]/80"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>

            {/* New Complaint Tab */}
            <TabsContent value="new">
              <ComplaintForm 
                language={language} 
                onComplaintCreated={refreshComplaints} 
                onTrack={handleTrackComplaint}
              />
            </TabsContent>

            {/* Track Complaints Tab */}
            <TabsContent value="track">
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
                      return (
                        <motion.div
                          key={c.id}
                          className={`glass-card rounded-2xl p-4.5 cursor-pointer transition-all duration-300 border-l-4 premium-glow-border ${
                            isActive
                              ? "active active-glow-primary border-l-primary scale-[1.01] shadow-lg shadow-primary/5 bg-primary/2"
                              : "border-l-transparent hover:border-l-border"
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

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Profile Overview Card */}
                <div className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                  <div className="absolute -right-16 -top-16 w-36 h-36 bg-[#7c3aed]/10 rounded-full filter blur-xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center border border-indigo-500/20 shadow-2xl relative">
                      <User className="w-8 h-8 text-white" />
                      <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-[#05070f] flex items-center justify-center">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="text-2xl font-black text-white leading-none">
                          {session?.name}
                        </h2>
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 font-black uppercase text-[9.5px] px-2.5 py-0.5 tracking-wider rounded-md">
                          Verified Citizen
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-bold flex items-center justify-center sm:justify-start gap-1.5 pt-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        {session?.email}
                      </p>
                      <p className="text-xs text-gray-400 font-bold flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        {session?.mobile || "+91 99999 88888"}
                      </p>
                    </div>

                    <div className="text-xs font-bold text-gray-400 bg-[#070b13]/60 border border-[#1f2937]/50 rounded-xl px-4 py-2.5 flex items-center gap-2 self-center">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>
                        Registered: {session?.authenticatedAt ? new Date(session.authenticatedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "June 2026"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-5 hover:border-indigo-500/20 transition-all text-left">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block">Total Grievances</span>
                    <span className="text-3xl font-black text-white block mt-1">{complaints.length}</span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Filed via portal</span>
                  </div>

                  <div className="bg-[#090d16]/30 border border-emerald-500/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all text-left">
                    <span className="text-[10px] text-emerald-400/80 font-black uppercase tracking-wider block">Resolved Grievances</span>
                    <span className="text-3xl font-black text-emerald-400 block mt-1">
                      {complaints.filter(c => c.status === "resolved").length}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Verified resolutions</span>
                  </div>

                  <div className="bg-[#090d16]/30 border border-amber-500/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all text-left">
                    <span className="text-[10px] text-amber-400/80 font-black uppercase tracking-wider block">Active Unresolved</span>
                    <span className="text-3xl font-black text-amber-400 block mt-1">
                      {complaints.filter(c => c.status !== "resolved").length}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5 font-sans">In queue / processing</span>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-6 sm:p-7 space-y-4">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Recent Citizen Activity Log
                  </h3>
                  {complaints.length === 0 ? (
                    <p className="text-xs text-gray-500 font-semibold py-2">No activity recorded yet.</p>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {complaints.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center justify-between border-b border-[#1f2937]/30 pb-2.5 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {c.id}
                            </span>
                            <span className="text-xs font-bold text-gray-200 ml-2.5">
                              {isHi ? c.titleHi : c.title}
                            </span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-extrabold uppercase px-2 py-0.5 ${c.status === "resolved" ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-amber-500/20 text-amber-400 bg-amber-500/5"}`}>
                            {getStatusLabel(c.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
          </>)}
        </div>
      </main>
    </>
  );
}
