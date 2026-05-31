"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Coins,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/lib/complaints";
import { getTokenState } from "@/lib/tokenSystem";
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

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Token System State
  const [tokenState, setTokenState] = useState(() => getTokenState());

  useEffect(() => {
    const handleTokenChange = () => {
      setTokenState(getTokenState());
    };
    window.addEventListener("janmitra-token-change", handleTokenChange);
    return () => window.removeEventListener("janmitra-token-change", handleTokenChange);
  }, []);

  const isHi = language === "hi";

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
    setComplaints(getComplaints());

    const handleSync = () => {
      setComplaints(getComplaints());
    };
    window.addEventListener("janmitra-db-change", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("janmitra-db-change", handleSync);
      window.removeEventListener("storage", handleSync);
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

  const refreshComplaints = () => {
    setComplaints(getComplaints());
  };

  const handleTrackComplaint = (id: string) => {
    refreshComplaints();
    setSelectedComplaint(id);
    setActiveTab("track");
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
          
          {/* Top Info Banner & Telemetry Quick Stats (Floating Row) */}
          <motion.div
            className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-[#090d16]/40 border border-[#1f2937]/30 backdrop-blur-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center shadow-lg shadow-gov-blue/20">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black tracking-tight text-white">
                  {isHi ? "नागरिक शिकायत पोर्टल" : "CITIZEN PORTAL"}
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {isHi ? "अपनी शिकायतें दर्ज करें और ट्रैक करें" : "File & track your complaints"}
                </p>
              </div>
            </div>

            {/* Interactive controls */}
            <div className="flex items-center gap-3 relative justify-end">
              {/* Token Tracker Pill */}
              <div className="flex items-center gap-2 bg-[#090d16] border border-amber-500/20 px-3.5 py-1.5 rounded-xl shadow-inner transition-all duration-300 hover:border-amber-500/35">
                <Coins className="w-4 h-4 text-amber-500 animate-pulse flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500/90 leading-none">
                    {isHi ? "दैनिक कोटा" : "Daily Tokens"}
                  </span>
                  <span className="text-xs font-black text-amber-200 mt-0.5 leading-none">
                    {tokenState.tokensRemaining} / {tokenState.maxTokens}
                  </span>
                </div>
                {/* Visual tiny progress bar */}
                <div className="w-10 h-1 bg-slate-900 rounded-full overflow-hidden ml-1 border border-amber-500/10 hidden sm:block">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${(tokenState.tokensRemaining / tokenState.maxTokens) * 100}%` }}
                  />
                </div>
              </div>

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
          </motion.div>

          {/* Redesigned Hero and Civic Stats Card Section */}
          <motion.div
            className="w-full bg-[#090d16]/30 border border-[#1f2937]/45 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden text-left shadow-lg shadow-black/20"
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-start border-b border-[#1f2937]/30 pb-2">
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
              </TabsList>
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
                          className={`glass-card rounded-2xl p-4.5 cursor-pointer transition-all duration-300 border-l-[4px] premium-glow-border ${
                            isActive
                              ? "active active-glow-primary border-l-primary scale-[1.01] shadow-lg shadow-primary/5 bg-primary/[0.02]"
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
                              <PIcon className="w-3 h-3 mr-1" />
                              {getPriorityLabel(c.priority)}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-sm text-foreground/90 mb-1.5 line-clamp-1 leading-snug">
                            {isHi ? c.titleHi : c.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                              style={{
                                backgroundColor:
                                  c.status === "resolved"
                                    ? "#10B981"
                                    : c.status === "escalated"
                                    ? "#EF4444"
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
          </Tabs>
        </div>
      </main>
    </>
  );
}
