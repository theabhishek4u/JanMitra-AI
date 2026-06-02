"use client";

import { useState, useEffect } from "react";
import { getAuthSession, clearAuthSession } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileText,
  MessageSquare,
  Activity,
  Layers,
  Sparkle,
  Bell,
  Trash2,
  Inbox,
  Droplet,
  X,
  Eye,
  Ban,
  Fingerprint,
  Route,
  Lightbulb,
  Scale,
  Camera,
  Upload,
  UserCheck,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/shared/Navbar";
import {
  getComplaints,
  getStats,
  updateComplaintStatus,
  mergeDuplicateComplaint,
  getOfficerNotifications,
  markNotificationAsRead,
  clearNotifications,
  getSuspiciousComplaints,
  updateComplaintVerdict,
  submitResolutionProof,
} from "@/lib/complaints";
import type { Complaint, ComplaintStatus, DashboardStats, Notification, TrustLevel } from "@/types";

// Dynamically import Leaflet heatmap to avoid SSR error
const ComplaintHeatmap = dynamic(
  () => import("@/components/citizen/ComplaintHeatmap"),
  { ssr: false }
);

export default function OfficerDashboard() {
  const [mounted, setMounted] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"queue" | "map">("queue");

  // Sidebar Layout State
  const [activeSidebarTab, setActiveSidebarTab] = useState<"dashboard" | "fraud" | "portal" | "map">("dashboard");

  // Notes state
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Suspicious complaint detection state
  const [suspiciousComplaints, setSuspiciousComplaints] = useState<Complaint[]>([]);
  const [showSuspiciousSection, setShowSuspiciousSection] = useState(true);
  const [directiveLang, setDirectiveLang] = useState<"en" | "hi">("en");

  // Interactive scanner state overrides
  const [scanSpeed, setScanSpeed] = useState<"slow" | "normal" | "hyper">("normal");
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);

  // Proof Based Resolution Modal State
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [proofPhotoName, setProofPhotoName] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Sync notifications whenever complaints update
  useEffect(() => {
    setNotifications(getOfficerNotifications());
    setSuspiciousComplaints(getSuspiciousComplaints());
  }, [complaints]);

  const handleClearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotifications("officer");
    setNotifications([]);
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationAsRead(n.id, "officer");
    setNotifications(getOfficerNotifications());
    setShowNotifications(false);
    setSelectedComplaintId(n.complaintId);
    setActiveSubTab("queue");
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

  const getAIClusterDirective = (category: string) => {
    const norm = category.toLowerCase().trim();
    if (norm.includes("garbage") || norm.includes("sanitation")) {
      return {
        rootEn: "Systemic garbage accumulation due to a dysfunctional localized dump container, causing waste overflows, stray animal concentration, and public health hazards in this block.",
        rootHi: "स्थानीय कचरा पात्र के निष्क्रिय होने के कारण क्षेत्र में कचरे का भारी संचय, आवारा पशुओं का जमावड़ा और गंभीर सार्वजनिक स्वास्थ्य संबंधी खतरे उत्पन्न हो रहे हैं।",
        actionEn: "1. Dispatch 3 additional heavy garbage containment vehicles immediately.\n2. Re-route Nagar Nigam sanitation trucks to clear the junction twice daily.\n3. Install a new automated smart waste container with a solar-powered compaction sensor.",
        actionHi: "1. तुरंत 3 अतिरिक्त भारी कचरा संग्रह वाहनों को मौके पर भेजें।\n2. जंक्शन को दिन में दो बार साफ करने के लिए नगर निगम के स्वच्छता ट्रकों का मार्ग बदलें।\n3. सौर-ऊर्जा संचालित संघनन सेंसर के साथ एक नया स्वचालित स्मार्ट कचरा पात्र स्थापित करें।"
      };
    }
    if (norm.includes("water")) {
      return {
        rootEn: "Sub-junction distribution pipeline rupture combined with severe sewer-water infiltration, resulting in highly contaminated local water discharge.",
        rootHi: "उप-जंक्शन वितरण पाइपलाइन फटने और सीवर-पानी के गंभीर प्रवेश के संयोजन के कारण, अत्यधिक दूषित स्थानीय जल की आपूर्ति हो रही है।",
        actionEn: "1. Issue urgent excavation and welding orders for the ruptured pipeline casing.\n2. Dispatch a repair squad to weld the pressure casing within 24 hours.\n3. Mobilize 4 clean drinking water tankers to provide immediate clean water relief.",
        actionHi: "1. फटी पाइपलाइन आवरण के लिए तत्काल खुदाई और वेल्डिंग के आदेश जारी करें।\n2. 24 घंटे के भीतर प्रेशर केसिंग की मरम्मत के लिए एक विशेष दल रवाना करें।\n3. तत्काल स्वच्छ पेयजल राहत प्रदान करने के लिए 4 स्वच्छ जल टैंकरों को काम पर लगाएं।"
      };
    }
    if (norm.includes("road") || norm.includes("damage")) {
      return {
        rootEn: "Sub-surface concrete base erosion from recent waterlogging, resulting in compounding active asphalt structural collapse and deep pothole formation.",
        rootHi: "हाल ही में हुए जलभराव के कारण उप-सतह कंक्रीट बेस का क्षरण, जिसके परिणामस्वरूप संयुक्त रूप से सक्रिय डामर संरचनात्मक रूप से ढह गई है और गहरे गड्ढे बन गए हैं।",
        actionEn: "1. Initiate localized quick-set asphalt paving and pothole patchwork within 12 hours.\n2. Direct PWD resources to clear sub-surface drainage blocks to prevent future water damage.\n3. Request budget allocation for complete road re-carpeting in the next fiscal sprint.",
        actionHi: "1. 12 घंटे के भीतर स्थानीय स्तर पर त्वरित-सेट डामर बिछाने और गड्ढों को भरने का कार्य शुरू करें।\n2. भविष्य में जल क्षति को रोकने के लिए पीडब्ल्यूडी संसाधनों को उप-सतह जल निकासी ब्लॉकों को साफ करने का निर्देश दें।\n3. अगले वित्तीय चक्र में सड़क के पूर्ण पुनर्निर्माण के लिए बजट आवंटन का अनुरोध करें।"
      };
    }
    return {
      rootEn: "Cumulative civic asset deterioration and infrastructure capacity breach due to dense residential load in this urban micro-zone.",
      rootHi: "इस शहरी सूक्ष्म क्षेत्र में सघन आवासीय भार के कारण संचयी नागरिक संपत्ति का ह्रास और बुनियादी ढांचे की क्षमता का उल्लंघन।",
      actionEn: "1. Conduct an immediate zone-level inspection and structural audit.\n2. Dispatch maintenance crews to repair physical assets and secure safety boundaries.\n3. Present a preventive structural maintenance protocol within 48 hours.",
      actionHi: "1. तत्काल क्षेत्र-स्तरीय निरीक्षण और संरचनात्मक ऑडिट करें।\n2. भौतिक संपत्तियों की मरम्मत और सुरक्षा सीमाओं को सुरक्षित करने के लिए रखरखाव दल भेजें।\n3. 48 घंटे के भीतर एक सुरक्षात्मक संरचनात्मक रखरखाव प्रोटोकॉल प्रस्तुत करें।"
    };
  };

  // Load complaints and stats and listen to real-time local storage edits
  useEffect(() => {
    // Client-side secure route guard
    const checkAuth = () => {
      const session = getAuthSession();
      if (!session) {
        window.location.href = "/login?role=officer";
        return false;
      }
      if (session.role !== "officer") {
        // Safely redirect to their active matching dashboard rather than clearing the session
        window.location.href = session.role === "admin" ? "/admin" : "/login?role=officer";
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    setMounted(true);
    setComplaints(getComplaints());
    setStats(getStats());

    const handleSync = () => {
      setComplaints(getComplaints());
      setStats(getStats());
    };

    const handleTabSync = () => {
      checkAuth();
    };

    window.addEventListener("janmitra-db-change", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleTabSync);
    window.addEventListener("visibilitychange", handleTabSync);

    return () => {
      window.removeEventListener("janmitra-db-change", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleTabSync);
      window.removeEventListener("visibilitychange", handleTabSync);
    };
  }, []);

  const refreshData = () => {
    const freshComplaints = getComplaints();
    setComplaints(freshComplaints);
    setStats(getStats());
    setSuspiciousComplaints(getSuspiciousComplaints());
  };

  // Fake Detection verdict handlers
  const handleMarkSafe = (id: string) => {
    updateComplaintVerdict(id, "safe");
    refreshData();
  };

  const handleConfirmSpam = (id: string) => {
    updateComplaintVerdict(id, "spam");
    refreshData();
  };

  const getTrustLevelConfig = (level: TrustLevel) => {
    switch (level) {
      case "high":
        return { label: "High Trust", emoji: "✅", color: "#10B981", bgClass: "trust-badge-high", icon: ShieldCheck };
      case "medium":
        return { label: "Medium Risk", emoji: "⚠️", color: "#F59E0B", bgClass: "trust-badge-medium", icon: ShieldAlert };
      case "low":
        return { label: "Potential Spam", emoji: "🚨", color: "#EF4444", bgClass: "trust-badge-low", icon: ShieldX };
    }
  };

  const getFlagLabel = (flag: string): string => {
    switch (flag) {
      case "duplicate": return "Duplicate Suspected";
      case "rapid_submission": return "Rapid Submission";
      case "spam_text": return "Spam Text";
      case "low_confidence": return "Low Confidence";
      case "abuse_irrelevant": return "Abusive Content";
      case "similar_text": return "Similar Text";
      default: return flag;
    }
  };

  if (!mounted || !stats) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gov-blue/20 via-primary/10 to-ai-purple/20 border border-ai-purple/30 flex items-center justify-center shadow-lg animate-spin">
          <Sparkles className="w-6 h-6 text-ai-purple" />
        </div>
        <span className="text-sm font-bold mt-4 tracking-wider">LOADING COMMAND CONSOLE...</span>
      </div>
    );
  }

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "all" || c.priority === selectedPriority;
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId);

  // Setup adjacent duplicate detection for active selected complaint
  const duplicateComplaints = selectedComplaint
    ? complaints.filter(
        (c) =>
          c.id !== selectedComplaint.id &&
          c.status !== "resolved" &&
          c.category === selectedComplaint.category &&
          (c.area.toLowerCase().includes(selectedComplaint.area.toLowerCase()) ||
            selectedComplaint.area.toLowerCase().includes(c.area.toLowerCase()))
      )
    : [];

  // Advancing status mappings
  const getNextStatusText = (status: ComplaintStatus): string => {
    switch (status) {
      case "submitted":
        return "Execute AI Diagnostic Hazard Scan";
      case "ai_analyzing":
        return "Route & Assign Public Department";
      case "department_assigned":
        return "Commence Officer Verification Review";
      case "officer_reviewing":
        return "Dispatch Technical Field Force";
      case "action_in_progress":
        return "Submit Resolution Proof \u0026 Request Citizen Confirmation";
      case "escalated":
        return "Commence Officer Verification Review";
      case "reopened":
        return "Dispatch Technical Field Force";
      default:
        return "";
    }
  };

  const getNextStatus = (status: ComplaintStatus): ComplaintStatus | null => {
    switch (status) {
      case "submitted":
        return "ai_analyzing";
      case "ai_analyzing":
        return "department_assigned";
      case "department_assigned":
        return "officer_reviewing";
      case "officer_reviewing":
        return "action_in_progress";
      case "action_in_progress":
        return "pending_citizen_confirmation"; // Now goes to proof flow
      case "escalated":
        return "officer_reviewing";
      case "reopened":
        return "action_in_progress";
      default:
        return null;
    }
  };

  const handleAdvanceStatus = () => {
    if (!selectedComplaint) return;

    // If current status is action_in_progress, open proof modal instead
    if (selectedComplaint.status === "action_in_progress") {
      setShowProofModal(true);
      return;
    }

    const next = getNextStatus(selectedComplaint.status);
    if (!next) return;

    updateComplaintStatus(
      selectedComplaint.id,
      next,
      "Shri Rajesh Kumar",
      `Advanced automatically to ${next.replace(/_/g, " ")} by command console control.`,
      `कमांड कंसोल नियंत्रण द्वारा स्थिति स्वचालित रूप से ${next} में परिवर्तित की गई।`
    );
    refreshData();
  };

  const handleSubmitProof = () => {
    if (!selectedComplaint || !proofNote.trim()) return;
    setIsSubmittingProof(true);

    submitResolutionProof(
      selectedComplaint.id,
      proofPhoto || "",
      proofNote,
      `अधिकारी टिप्पणी: ${proofNote}`,
      "Shri Rajesh Kumar"
    );

    setShowProofModal(false);
    setProofPhoto(null);
    setProofPhotoName("");
    setProofNote("");
    setIsSubmittingProof(false);
    refreshData();
  };

  const handleProofPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProofPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleManualEscalate = () => {
    if (!selectedComplaint) return;
    updateComplaintStatus(
      selectedComplaint.id,
      "escalated",
      "Shri Rajesh Kumar",
      "Manual priority SLA escalation override triggered by Municipal Commissioner.",
      "नगर आयुक्त द्वारा मैन्युअल प्राथमिकता एसएलए एस्केलेशन ओवरराइड सक्रिय किया गया।"
    );
    refreshData();
  };

  const handleAddOfficialLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !noteText.trim()) return;

    setIsSubmittingNote(true);
    updateComplaintStatus(
      selectedComplaint.id,
      selectedComplaint.status,
      "Shri Rajesh Kumar",
      noteText,
      `अधिकारी नोट: ${noteText}`
    );

    setNoteText("");
    setIsSubmittingNote(false);
    refreshData();
  };

  const handleJoinDuplicate = (duplicateId: string) => {
    if (!selectedComplaint) return;
    mergeDuplicateComplaint(duplicateId, selectedComplaint.id);
    refreshData();
  };

  // Stat Card metadata
  const statCards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: LayoutDashboard,
      color: "#3B82F6",
      change: "+12%",
      up: true,
      glowClass: "border-gov-blue/20 hover:border-gov-blue/40",
    },
    {
      title: "Pending Resolution",
      value: stats.pending,
      icon: Clock,
      color: "#F59E0B",
      change: "-8%",
      up: false,
      glowClass: "border-warning-amber/20 hover:border-warning-amber/40 active-glowing-card-amber",
    },
    {
      title: "Resolved Grievances",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "#10B981",
      change: "+23%",
      up: true,
      glowClass: "border-trust-green/20 hover:border-trust-green/40",
    },
    {
      title: "High Priority Active",
      value: stats.highPriority,
      icon: AlertTriangle,
      color: "#EF4444",
      change: "+5%",
      up: true,
      glowClass: "border-danger-red/20 hover:border-danger-red/40 active-glowing-card-red",
    },
  ];

  const categoriesList = [
    { name: "Garbage / Sanitation", label: "Sanitation", icon: Trash2, color: "#3B82F6", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] border-blue-500/20 shadow-blue-500/5", bg: "bg-blue-500/5" },
    { name: "Water Supply", label: "Water", icon: Droplet, color: "#06B6D4", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] border-cyan-500/20 shadow-cyan-500/5", bg: "bg-cyan-500/5" },
    { name: "Road Damage", label: "Roads", icon: Route, color: "#10B981", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] border-emerald-500/20 shadow-emerald-500/5", bg: "bg-emerald-500/5" },
    { name: "Electricity", label: "Power", icon: Zap, color: "#F59E0B", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] border-amber-500/20 shadow-amber-500/5", bg: "bg-amber-500/5" },
    { name: "Street Light", label: "Lights", icon: Lightbulb, color: "#7C3AED", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(124,58,237,0.3)] border-violet-500/20 shadow-violet-500/5", bg: "bg-violet-500/5" },
    { name: "Illegal Construction", label: "Civic Construction", icon: Building2, color: "#F97316", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)] border-orange-500/20 shadow-orange-500/5", bg: "bg-orange-500/5" },
    { name: "Encroachment", label: "Encroach", icon: Layers, color: "#EC4899", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)] border-pink-500/20 shadow-pink-500/5", bg: "bg-pink-500/5" },
    { name: "Corruption", label: "Vigilance", icon: Scale, color: "#EF4444", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] border-red-500/20 shadow-red-500/5", bg: "bg-red-500/5" },
    { name: "Public Health", label: "Health", icon: Activity, color: "#8B5CF6", glowClass: "hover:shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] border-purple-500/20 shadow-purple-500/5", bg: "bg-purple-500/5" },
  ];

  const categoryStats = complaints.reduce((acc, c) => {
    const cat = c.category;
    if (!acc[cat]) {
      acc[cat] = { total: 0, active: 0 };
    }
    acc[cat].total += 1;
    if (c.status !== "resolved") {
      acc[cat].active += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number }>);

  const maxActive = Math.max(...categoriesList.map(c => categoryStats[c.name]?.active || 0), 1);

  return (
    <>
    <div className="min-h-screen flex bg-[#060b14]">
      <aside className="w-[260px] bg-[#0a1120] border-r border-border/10 hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-border/10 shrink-0">
          <span className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            JanMitra
          </span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase px-3 pb-2">
            Console Modules
          </p>
          {[
            { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
            { id: "portal", label: "Grievance Portal", icon: Layers },
            { id: "map", label: "Live Telemetry Map", icon: MapPin },
            { id: "fraud", label: "Fraud Detection", icon: Fingerprint, alert: suspiciousComplaints.length > 0 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSidebarTab(item.id as "map" | "dashboard" | "fraud" | "portal")}
              className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer group relative overflow-hidden ${
                activeSidebarTab === item.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {activeSidebarTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-md" />
              )}
              <div className="flex items-center gap-3">
                <item.icon className={`w-4.5 h-4.5 ${activeSidebarTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                {item.label}
              </div>
              {item.alert && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              )}
            </button>
          ))}
        </div>
        
        {/* User profile at bottom of sidebar */}
        <div className="p-4 border-t border-border/10 shrink-0 bg-white/2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">Shri Rajesh Kumar</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Commissioner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================ */}
      {/* MAIN CONTENT AREA                            */}
      {/* ============================================ */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen relative w-full">
        
        {/* TOP HEADER */}
        <header className="h-16 border-b border-border/10 bg-[#060b14]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
             <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
               {activeSidebarTab === "dashboard" && "Dashboard Overview"}
               {activeSidebarTab === "portal" && "Grievance Portal"}
               {activeSidebarTab === "map" && "Live Telemetry Map"}
               {activeSidebarTab === "fraud" && "Fraud Detection Engine"}
             </h1>
          </div>
          
           <div className="flex items-center gap-3 relative">
             {/* Officer Notification Bell Dropdown */}
             <div className="relative">
               <button
                 type="button"
                 onClick={() => setShowNotifications(!showNotifications)}
                 className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                   showNotifications 
                     ? "bg-primary/10 text-primary border-primary/30" 
                     : "bg-muted/30 border-border/30 hover:bg-muted/50 hover:text-foreground text-muted-foreground"
                 }`}
                 aria-label="System Alerts"
               >
                 <Bell className="w-4.5 h-4.5" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background animate-pulse shadow-md">
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
                   <div className="absolute right-0 mt-3 w-[360px] max-h-[460px] overflow-y-auto z-50 glass-card rounded-2xl p-4.5 border border-white/8 bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-250 select-none">
                     <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-3.5">
                       <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                         <h4 className="font-black text-xs uppercase tracking-wider text-gray-200">
                           System Alerts
                         </h4>
                       </div>
                       <div className="flex items-center gap-3">
                         {notifications.length > 0 && (
                           <button
                             type="button"
                             onClick={handleClearAllNotifications}
                             className="text-[10px] font-extrabold uppercase text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                             Clear All
                           </button>
                         )}
                         <button
                           type="button"
                           onClick={() => setShowNotifications(false)}
                           className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                           aria-label="Close alerts"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     </div>

                     {notifications.length === 0 ? (
                       <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500 gap-3">
                         <Inbox className="w-8 h-8 opacity-30 animate-bounce" />
                         <p className="text-xs font-bold uppercase tracking-wider">
                           No active alerts
                         </p>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {notifications.map((n) => (
                           <div
                             key={n.id}
                             onClick={() => handleNotificationClick(n)}
                             className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                               n.read
                                 ? "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/8"
                                 : "bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/30"
                             }`}
                           >
                             <div className="flex items-start justify-between gap-1.5">
                               <span className="text-[10px] font-mono font-black text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                 {n.complaintId}
                               </span>
                               <span className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wide">
                                 {formatTime(n.timestamp)}
                               </span>
                             </div>
                             <p className="text-xs font-semibold text-white/90 leading-relaxed">
                               {n.message}
                             </p>
                             {!n.read && (
                               <span className="text-[9.5px] font-black text-cyan-400 self-end animate-pulse uppercase tracking-wider">
                                 ● New Alert
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

             <a href="/" className="p-2 rounded-xl border border-border/30 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center active:scale-95">
               <LogOut className="w-4 h-4 ml-0.5" />
             </a>
          </div>
        </header>

        {/* CONTENT TABS */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {/* TAB 1: DASHBOARD OVERVIEW                    */}
          {/* ============================================ */}
          {activeSidebarTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card 
                  className={`glass-premium border premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group ${stat.glowClass}`}
                  style={{
                    background: `radial-gradient(circle at 100% 100%, ${stat.color}0c 0%, transparent 60%)`
                  }}
                >
                  <div
                    className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500"
                    style={{ backgroundColor: stat.color }}
                  />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-20 shadow-sm"
                        style={{
                          background: `${stat.color}15`,
                          border: `1px solid ${stat.color}25`,
                        }}
                      >
                        <stat.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: stat.color }} />
                      </div>
                      <span
                        className={`text-xs font-black flex items-center gap-0.5 ${
                          stat.up ? "text-trust-green" : "text-danger-red"
                        }`}
                      >
                        {stat.up ? (
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[3px]" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 stroke-[3px]" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">{stat.value.toLocaleString()}</div>
                    <div className="text-xs font-bold tracking-wide uppercase text-muted-foreground mt-2 transition-colors">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Interactive Category Breakdown Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary rounded-full" />
                <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                  Category Distribution Matrix
                </h2>
              </div>
              {selectedCategory !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2.5 rounded-lg border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer font-bold flex items-center gap-1.5 active:scale-95 animate-pulse"
                  onClick={() => setSelectedCategory("all")}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filter: {selectedCategory.replace(" / ", " & ")}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-9 gap-4">
              {categoriesList.map((cat) => {
                const total = categoryStats[cat.name]?.total || 0;
                const active = categoryStats[cat.name]?.active || 0;
                const pct = Math.round((active / maxActive) * 100);
                const isSelected = selectedCategory === cat.name;

                return (
                  <motion.div
                    key={cat.name}
                    className={`glass-premium border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                      isSelected
                        ? "scale-[1.03] shadow-xl ring-1"
                        : `border-border/10 ${cat.glowClass} hover:scale-[1.02] active:scale-[0.98] bg-muted/10`
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: `${cat.color}75`,
                            background: `radial-gradient(circle at 100% 100%, ${cat.color}15 0%, transparent 80%)`,
                            boxShadow: `0 8px 30px ${cat.color}20`,
                            color: cat.color,
                          }
                        : {}
                    }
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategory("all");
                      } else {
                        setSelectedCategory(cat.name);
                      }
                    }}
                  >
                    {/* Glowing Accent Spot */}
                    <div
                      className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full filter blur-lg opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500 animate-pulse"
                      style={{ backgroundColor: cat.color }}
                    />

                    <div className="flex items-start justify-between mb-2 relative z-10">
                      <div
                        className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:rotate-12 ${cat.bg} group-hover:scale-105`}
                        style={{ borderColor: `${cat.color}25` }}
                      >
                        <cat.icon className="w-4.5 h-4.5" style={{ color: cat.color }} />
                      </div>
                      
                      <div className="text-right">
                        <span className="text-lg font-black text-foreground leading-none block group-hover:scale-110 transition-transform">
                          {active}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block mt-0.5">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 relative z-10">
                      <h3 className="text-xs font-black text-foreground/90 group-hover:text-primary transition-colors leading-tight">
                        {cat.label}
                      </h3>
                      <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1.5 mt-1">
                        Total: <strong className="text-foreground/75 font-extrabold">{total}</strong>
                      </span>
                    </div>

                    {/* Progress Bar relative to maxActive */}
                    <div className="mt-3.5 w-full bg-slate-950/60 border border-white/5 h-2 rounded-full overflow-hidden relative z-10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${cat.color}bb, ${cat.color})`,
                          boxShadow: `0 0 8px ${cat.color}80`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* TAB 4: FRAUD DETECTION                       */}
          {/* ============================================ */}
          {activeSidebarTab === "fraud" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
          {/* ============================================ */}
          {/* AI Fraud Detection — Suspicious Complaints   */}
          {/* ============================================ */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-danger-red rounded-full" />
                <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-danger-red" />
                  AI Fraud Detection — Suspicious Complaints
                </h2>
                {suspiciousComplaints.length > 0 && (
                  <Badge className="bg-danger-red/15 text-danger-red border-danger-red/30 font-extrabold text-[10px] animate-pulse">
                    {suspiciousComplaints.length} flagged
                  </Badge>
                )}
              </div>
              {suspiciousComplaints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSuspiciousSection(!showSuspiciousSection)}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                >
                  {showSuspiciousSection ? "Collapse" : "Expand"}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showSuspiciousSection ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSuspiciousSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {suspiciousComplaints.length === 0 ? (
                    <Card className="glass-premium border border-trust-green/20 bg-trust-green/2">
                      <CardContent className="p-6 flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-trust-green/10 border border-trust-green/25 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-trust-green" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-trust-green">All Clear — No Suspicious Complaints</h4>
                          <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                            AI fraud detection engine is actively monitoring all incoming complaints.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {suspiciousComplaints.map((sc, i) => {
                        const trust = sc.trustAnalysis!;
                        const config = getTrustLevelConfig(trust.trustLevel);
                        const TrustIcon = config.icon;

                        return (
                          <motion.div
                            key={sc.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, ease: "easeOut" }}
                          >
                            <Card className={`glass-premium border overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] group relative suspicious-section-glow ${
                              trust.trustLevel === "low"
                                ? "border-danger-red/30 hover:border-danger-red/50 shadow-[0_4px_25px_rgba(239,68,68,0.05)]"
                                : "border-warning-amber/30 hover:border-warning-amber/50 shadow-[0_4px_25px_rgba(245,158,11,0.05)]"
                            }`}>
                              <CardContent className="p-5 space-y-4">
                                {/* Header: ID + Trust Badge */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                      {sc.id}
                                    </span>
                                    <Badge className={`${config.bgClass} text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 flex items-center gap-1 border border-white/5`}>
                                      <TrustIcon className="w-3 h-3" />
                                      {config.emoji} {config.label}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Trust Score Bar */}
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[11px] font-black">
                                    <span className="text-gray-400">Trust Score</span>
                                    <span style={{ color: config.color }} className="font-extrabold">{trust.trustScore}/100</span>
                                  </div>
                                  <div className="h-2 bg-slate-950/60 border border-white/5 rounded-full overflow-hidden relative">
                                    <motion.div
                                      className="h-full rounded-full"
                                      style={{
                                        background: `linear-gradient(90deg, ${config.color}bb, ${config.color})`,
                                        boxShadow: `0 0 8px ${config.color}80`,
                                      }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${trust.trustScore}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                  </div>
                                </div>

                                {/* Flag Badges */}
                                {trust.flags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {trust.flags.map((flag) => (
                                      <span
                                        key={flag}
                                        className="text-[8.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/5 bg-white/5 text-gray-300 shadow-sm"
                                      >
                                        {getFlagLabel(flag)}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Primary Reason */}
                                 <p className="text-xs font-semibold text-foreground/90 leading-relaxed line-clamp-2 bg-muted/30 dark:bg-white/2 border border-border/40 dark:border-white/4 p-3 rounded-xl">
                                  {trust.reasons[0] || "Suspicious activity detected"}
                                </p>

                                {/* Meta: Time + Category */}
                                <div className="flex items-center gap-2 text-[9.5px] text-gray-400 font-bold tracking-wide uppercase">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span>{new Date(sc.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                                  <span className="text-white/10">•</span>
                                  <span className="truncate bg-white/5 px-2 py-0.5 rounded text-[8px] tracking-wider text-gray-300 font-extrabold border border-white/5">
                                    {sc.category}
                                  </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                  <Button
                                    size="sm"
                                    className="flex-1 text-[10px] h-8 rounded-lg bg-sky-500/10 hover:bg-sky-500 hover:text-black text-sky-400 border border-sky-500/20 hover:border-transparent font-black uppercase cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all duration-200"
                                    onClick={() => {
                                      setSelectedComplaintId(sc.id);
                                      setActiveSubTab("queue");
                                    }}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Review
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 text-[10px] h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/20 hover:border-transparent font-black uppercase cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all duration-200"
                                    onClick={() => handleMarkSafe(sc.id)}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Mark Safe
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 text-[10px] h-8 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 hover:border-transparent font-black uppercase cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all duration-200"
                                    onClick={() => handleConfirmSpam(sc.id)}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                    Spam
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* TAB 3: GRIEVANCE PORTAL                      */}
          {/* ============================================ */}
          {activeSidebarTab === "portal" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
            {/* Left Column: Complaint Queue (Col 5) */}
            <div className={`lg:col-span-5 flex flex-col h-[700px] lg:h-[780px] w-full ${selectedComplaintId ? "hidden lg:flex" : "flex"}`}>
              <Card className="glass-premium border border-border/30 h-full relative overflow-hidden flex flex-col shadow-xl shadow-black/5">
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
                
                <CardHeader className="pb-3 relative z-10 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-lg flex items-center gap-2 font-extrabold text-foreground/90">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      Grievance Portal
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="font-semibold">{filteredComplaints.length} tickets</Badge>
                      {selectedCategory !== "all" && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-bold capitalize text-[10px] animate-pulse">
                          {selectedCategory.split(" / ")[0]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Queue Filters */}
                  <div className="flex flex-col gap-2 mt-1">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search ID, Area, Issue..."
                          className="pl-9 h-9 text-sm glass-premium border-border/40 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {["all", "high", "medium", "low"].map((p) => (
                          <Button
                            key={p}
                            variant={selectedPriority === p ? "default" : "outline"}
                            size="sm"
                            className={`text-xs h-8 px-2.5 capitalize transition-all duration-300 shrink-0 cursor-pointer ${
                              selectedPriority === p
                                ? "bg-linear-to-r from-gov-blue via-primary to-ai-purple border-0 text-white font-bold shadow-md shadow-primary/20"
                                : "glass-premium hover:bg-muted/60 border-border/40 text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setSelectedPriority(p)}
                          >
                            {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-4 pt-1 flex flex-col">
                  <div className="h-full overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar flex-1">
                        {filteredComplaints.length === 0 ? (
                          <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                            <span>No active grievances match current filter.</span>
                            {(selectedCategory !== "all" || searchQuery !== "" || selectedPriority !== "all") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 px-3 rounded-xl border-primary/30 text-primary cursor-pointer hover:bg-primary/5 font-bold transition-all active:scale-95"
                                onClick={() => {
                                  setSelectedCategory("all");
                                  setSearchQuery("");
                                  setSelectedPriority("all");
                                }}
                              >
                                Reset All Filters
                              </Button>
                            )}
                          </div>
                        ) : (
                          filteredComplaints.map((c, i) => {
                            const isSelected = selectedComplaintId === c.id;
                            return (
                              <motion.div
                                key={c.id}
                                className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer border transition-all duration-300 group ${
                                  isSelected
                                    ? "bg-primary/4 border-primary/45 scale-[1.01]"
                                    : "bg-muted/15 border-border/10 hover:border-primary/25 hover:bg-primary/1"
                                }`}
                                onClick={() => setSelectedComplaintId(c.id)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
                              >
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse mt-1.5"
                                  style={{
                                    backgroundColor:
                                      c.priority === "high"
                                        ? "#EF4444"
                                        : c.priority === "medium"
                                        ? "#F59E0B"
                                        : "#10B981",
                                  }}
                                />
                                <div className="flex-1 min-w-0 space-y-2">
                                  {/* Upper line: ID & Status */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-black text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                      {c.id}
                                    </span>
                                    <span className="text-[8.5px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/20 border border-sky-500/20 px-2 py-0.5 rounded-md">
                                      {c.status.replace(/_/g, " ")}
                                    </span>
                                  </div>

                                  {/* Second line: Specific Threat Badges */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge
                                      variant="outline"
                                      className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 priority-${c.priority} border-transparent`}
                                    >
                                      {c.priority} priority
                                    </Badge>
                                    {c.escalationLevel > 0 && (
                                      <span className="bg-orange-500/10 border border-orange-500/25 text-orange-500 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase animate-pulse flex items-center gap-0.5">
                                        ⚠️ ESCALATED (L{c.escalationLevel})
                                      </span>
                                    )}
                                    <span className="bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase flex items-center gap-0.5">
                                      👤 {c.assignedOfficer || "Local Officer"}
                                    </span>
                                    {c.isHotspot && (
                                      <span className="bg-red-500/10 border border-red-500/25 text-red-500 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase animate-pulse flex items-center gap-0.5">
                                        🔥 HOTSPOT
                                      </span>
                                    )}
                                    {c.trustAnalysis && c.trustAnalysis.trustLevel !== "high" && (
                                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase flex items-center gap-0.5 ${
                                        c.trustAnalysis.trustLevel === "low"
                                          ? "bg-danger-red/10 border border-danger-red/25 text-danger-red animate-pulse"
                                          : "bg-warning-amber/10 border border-warning-amber/25 text-warning-amber"
                                      }`}>
                                        {c.trustAnalysis.trustLevel === "low" ? "🚨 FLAGGED" : "⚠️ RISK"}
                                      </span>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                                    {c.title}
                                  </div>

                                  {/* Bottom line: Meta details */}
                                  <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wide">
                                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="truncate">{c.area}</span>
                                    <span className="text-white/10">•</span>
                                    <span className="bg-white/5 border border-white/5 text-gray-300 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase truncate max-w-[100px]">
                                      {c.category}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 mt-1" />
                              </motion.div>
                            );
                          })
                        )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: High-Tech Detail Inspection Terminal (Col 7) */}
            <div className={`lg:col-span-7 flex flex-col h-[700px] lg:h-[780px] w-full ${!selectedComplaintId ? "hidden lg:flex" : "flex"}`}>
              <Card className="glass-premium border border-border/30 h-full overflow-hidden flex flex-col shadow-xl shadow-black/5 relative">
                {/* Visual Scanner laser track boundary */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-cyan-400 to-transparent" />
                
                {selectedComplaint ? (
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Header bar */}
                    <div className="p-4 border-b border-border/25 bg-muted/10 shrink-0 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Mobile Back Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComplaintId(null)}
                          className="lg:hidden h-8 px-2 rounded-xl text-primary border-primary/20 hover:bg-primary/5 cursor-pointer font-bold flex items-center gap-1 mr-1.5"
                        >
                          ← Back
                        </Button>
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {selectedComplaint.id}
                        </span>
                        <Badge className={`priority-${selectedComplaint.priority} font-extrabold text-[10px] uppercase px-2 py-0.5`}>
                          {selectedComplaint.priority} priority
                        </Badge>
                        <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary text-[10px] uppercase font-bold">
                          {selectedComplaint.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-trust-green rounded-full animate-pulse" />
                        Live Monitoring Active
                      </div>
                    </div>

                    {/* Scrollable details */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                      {/* Hotspot Warning Banner */}
                      {selectedComplaint.isHotspot && (
                        <motion.div
                          className="bg-linear-to-r from-red-500/15 via-red-500/5 to-transparent border border-red-500/25 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-md hover:shadow-red-500/5 transition-all active-glow-danger"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/35 flex items-center justify-center shrink-0 animate-pulse">
                            <AlertTriangle className="w-5.5 h-5.5 text-red-500" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-red-500 uppercase tracking-wide flex items-center gap-1.5">
                              🔥 AI Hotspot Detected
                            </h4>
                            <p className="text-xs font-semibold text-foreground/80 leading-normal">
                              Warning: <span className="text-red-500 font-bold underline">{selectedComplaint.hotspotCount} active complaints</span> have been filed in this precise area ({selectedComplaint.area}) regarding {selectedComplaint.category}!
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Title & Description */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-foreground/90 leading-tight">
                          {selectedComplaint.title}
                        </h2>
                        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{selectedComplaint.area}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-muted-foreground/60">{selectedComplaint.department}</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/10 border border-border/10 rounded-xl p-3.5 mt-2">
                          {selectedComplaint.description}
                        </p>
                      </div>

                      {/* AI Intelligence HUD: Spam risk index, Resolution Est, Confidence */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card border border-ai-purple/15 bg-ai-purple/3 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-4 h-4 text-ai-purple animate-pulse" />
                            <span className="text-xs font-bold text-foreground">AI Diagnostics Suite</span>
                          </div>
                          
                          <div className="space-y-3.5">
                            {/* Trust Index */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Trust Index Score</span>
                                <span className="text-trust-green">{Math.round(selectedComplaint.aiConfidence * 100)}%</span>
                              </div>
                              <div className="h-1.5 bg-trust-green/10 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-linear-to-r from-trust-green to-trust-green-light rounded-full transition-all duration-300"
                                  style={{ width: `${selectedComplaint.aiConfidence * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* Spam Risk */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-muted-foreground">Spam & Fraud Risk</span>
                                <span className="text-danger-red">{Math.round((1 - selectedComplaint.aiConfidence) * 100)}%</span>
                              </div>
                              <div className="h-1.5 bg-danger-red/10 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-linear-to-r from-danger-red to-danger-red-light rounded-full transition-all duration-300"
                                  style={{ width: `${(1 - selectedComplaint.aiConfidence) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Estimated Duration SLA */}
                        <Card className="glass-card border border-border/20 bg-muted/15 p-4 flex flex-col justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-gov-blue" />
                            <span className="text-xs font-bold text-foreground">SLA Threshold Monitor</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                              <span>Estimated Resolution:</span>
                              <span className="text-foreground">36 Hours</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                              <span>Escalation Level:</span>
                              <span className={selectedComplaint.escalationLevel > 0 ? "text-danger-red" : "text-trust-green"}>
                                Level {selectedComplaint.escalationLevel}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 text-[10px] text-muted-foreground leading-normal border-t border-border/10 pt-2 flex items-center gap-1 font-bold">
                            <Clock className="w-3.5 h-3.5 text-warning-amber" />
                            <span>Day 1-3-5 Auto-Escalation triggers active.</span>
                          </div>
                        </Card>
                      </div>

                      {/* Complaint Trust Score Analysis (Fake Detection) */}
                      {selectedComplaint.trustAnalysis && (
                        <motion.div
                          className={`border rounded-2xl p-4.5 space-y-3 ${
                            selectedComplaint.trustAnalysis.trustLevel === "high"
                              ? "border-trust-green/20 bg-trust-green/2"
                              : selectedComplaint.trustAnalysis.trustLevel === "medium"
                              ? "border-warning-amber/20 bg-warning-amber/2"
                              : "border-danger-red/25 bg-danger-red/2 suspicious-section-glow"
                          }`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Fingerprint className="w-4 h-4" style={{ color: getTrustLevelConfig(selectedComplaint.trustAnalysis.trustLevel).color }} />
                              <span className="text-xs font-extrabold text-foreground">Complaint Trust Score</span>
                            </div>
                            <Badge className={`${getTrustLevelConfig(selectedComplaint.trustAnalysis.trustLevel).bgClass} text-[9px] font-extrabold uppercase px-2 py-0.5 flex items-center gap-1`}>
                              {getTrustLevelConfig(selectedComplaint.trustAnalysis.trustLevel).emoji} {getTrustLevelConfig(selectedComplaint.trustAnalysis.trustLevel).label}
                            </Badge>
                          </div>

                          {/* Score Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-muted-foreground">Trust Score</span>
                              <span style={{ color: getTrustLevelConfig(selectedComplaint.trustAnalysis.trustLevel).color }}>
                                {selectedComplaint.trustAnalysis.trustScore}/100
                              </span>
                            </div>
                            <div className="h-2 bg-border/20 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: getTrustLevelConfig(selectedComplaint.trustAnalysis.trustLevel).color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedComplaint.trustAnalysis.trustScore}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>

                          {/* Flags & Reasons */}
                          {selectedComplaint.trustAnalysis.flags.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {selectedComplaint.trustAnalysis.flags.map((flag) => (
                                  <span
                                    key={flag}
                                    className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                      selectedComplaint.trustAnalysis!.trustLevel === "low"
                                        ? "bg-danger-red/10 border-danger-red/20 text-danger-red"
                                        : "bg-warning-amber/10 border-warning-amber/20 text-warning-amber"
                                    }`}
                                  >
                                    {getFlagLabel(flag)}
                                  </span>
                                ))}
                              </div>
                              <div className="space-y-1.5">
                                {selectedComplaint.trustAnalysis.reasons.map((reason, idx) => (
                                  <p key={idx} className="text-[11px] text-foreground/80 font-semibold leading-normal flex items-start gap-1.5">
                                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: getTrustLevelConfig(selectedComplaint.trustAnalysis!.trustLevel).color }} />
                                    {reason}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Officer Verdict Actions */}
                          {selectedComplaint.trustAnalysis.trustLevel !== "high" && !selectedComplaint.trustAnalysis.reviewedByOfficer && (
                            <div className="flex items-center gap-2 pt-2 border-t border-border/15">
                              <Button
                                size="sm"
                                className="flex-1 text-[10px] h-8 rounded-lg bg-trust-green/10 text-trust-green border border-trust-green/25 hover:bg-trust-green/20 font-bold cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all"
                                onClick={() => handleMarkSafe(selectedComplaint.id)}
                              >
                                <ShieldCheck className="w-3 h-3" />
                                Mark as Verified Safe ✅
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 text-[10px] h-8 rounded-lg bg-danger-red/10 text-danger-red border border-danger-red/25 hover:bg-danger-red/20 font-bold cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all"
                                onClick={() => handleConfirmSpam(selectedComplaint.id)}
                              >
                                <Ban className="w-3 h-3" />
                                Confirm Spam 🚫
                              </Button>
                            </div>
                          )}

                          {/* Show verdict if already reviewed */}
                          {selectedComplaint.trustAnalysis.reviewedByOfficer && (
                            <div className={`flex items-center gap-2 pt-2 border-t border-border/15 text-xs font-bold ${
                              selectedComplaint.trustAnalysis.officerVerdict === "safe" ? "text-trust-green" : "text-danger-red"
                            }`}>
                              {selectedComplaint.trustAnalysis.officerVerdict === "safe" ? (
                                <><ShieldCheck className="w-4 h-4" /> Officer verified: Legitimate complaint</>
                              ) : (
                                <><ShieldX className="w-4 h-4" /> Officer confirmed: Spam / Fake complaint</>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Multimodal evidence scanner (Image/Audio laser scanner HUD) */}
                      {(selectedComplaint.imageUrl || selectedComplaint.voiceUrl) && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              Multimodal Evidence Audit
                            </span>
                            {selectedComplaint.imageUrl && (
                              <div className="flex items-center gap-1.5 bg-muted/40 border border-border/25 p-0.5 rounded-lg">
                                <span className="text-[9px] text-muted-foreground font-bold px-1.5">Scan Speed:</span>
                                {(["slow", "normal", "hyper"] as const).map((speed) => (
                                  <button
                                    key={speed}
                                    type="button"
                                    onClick={() => setScanSpeed(speed)}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all ${
                                      scanSpeed === speed
                                        ? "bg-cyan-500 text-black shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {speed.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedComplaint.imageUrl && (
                              <div className="relative rounded-2xl overflow-hidden border border-border/40 h-44 bg-slate-950/80 group">
                                {/* Visual laser scanner bar */}
                                <motion.div
                                  className="absolute left-0 right-0 h-[2.5px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.85)] z-20"
                                  animate={{ top: ["0%", "100%", "0%"] }}
                                  transition={{
                                    duration: scanSpeed === "slow" ? 6 : scanSpeed === "normal" ? 3 : 0.8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                                
                                <img
                                  src={selectedComplaint.imageUrl}
                                  alt="Evidence Preview"
                                  className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-300"
                                />

                                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-2.5 py-1.5">
                                  <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-wider animate-pulse flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    AI SCANNER ACTIVE ({scanSpeed.toUpperCase()})
                                  </span>
                                  <Badge className="bg-trust-green text-white font-extrabold text-[8px]">
                                    {Math.round(selectedComplaint.aiConfidence * 100)}% Match
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {selectedComplaint.voiceUrl && (
                              <div className="rounded-2xl border border-primary/20 bg-primary/2 p-4 flex flex-col justify-center h-44 relative group">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider animate-pulse flex items-center gap-1">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Speech-to-Text Equalizer
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                                    className={`px-2 py-0.5 text-[9px] font-bold rounded cursor-pointer transition-all border ${
                                      isAudioPlaying
                                        ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(124,58,237,0.2)]"
                                        : "bg-muted text-muted-foreground border-border"
                                    }`}
                                  >
                                    {isAudioPlaying ? "PAUSE" : "PLAY"}
                                  </button>
                                </div>
                                
                                <div className="flex items-center gap-1 h-14 justify-center">
                                  {[...Array(15)].map((_, i) => (
                                    <motion.span
                                      key={i}
                                      className="w-1 bg-linear-to-t from-primary to-ai-purple rounded-full"
                                      animate={{ height: isAudioPlaying ? [6, 38, 6] : 6 }}
                                      transition={{ duration: 0.7 + i * 0.04, repeat: Infinity, ease: "easeInOut" }}
                                      style={{ height: 12 }}
                                    />
                                  ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground text-center font-bold tracking-wide mt-2 truncate">
                                  {isAudioPlaying ? "🔊 Playback Active — Transcribed" : "🔇 Playback Paused — Transcribed"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* AI Summary Synopsis */}
                      <div className="bg-ai-purple/2 border border-ai-purple/15 p-4 rounded-2xl relative">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <Brain className="w-4 h-4 text-ai-purple animate-pulse" />
                          <span className="text-xs font-extrabold text-foreground">AI Predictive Summary</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground/80 leading-relaxed font-sans">
                          {selectedComplaint.aiSummary}
                        </p>
                      </div>

                      {/* AI Cluster Pattern & Resolution Directive Panel */}
                      {selectedComplaint.isHotspot && (
                        <motion.div
                          className="border border-cyan-500/25 bg-cyan-950/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >

                          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">AI Cluster Directive Panel</span>
                            </div>
                            
                            {/* Local Language Toggler inside Directive Panel */}
                            <div className="flex items-center gap-0.5 bg-cyan-950/40 border border-cyan-500/20 p-0.5 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setDirectiveLang("en")}
                                className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-colors ${
                                  directiveLang === "en"
                                    ? "bg-cyan-500 text-black shadow-sm"
                                    : "text-cyan-400/70 hover:text-cyan-400"
                                }`}
                              >
                                English
                              </button>
                              <button
                                type="button"
                                onClick={() => setDirectiveLang("hi")}
                                className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-colors ${
                                  directiveLang === "hi"
                                    ? "bg-cyan-500 text-black shadow-sm"
                                    : "text-cyan-400/70 hover:text-cyan-400"
                                }`}
                              >
                                हिन्दी
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="space-y-4 relative z-10">
                            <div>
                              <span className="text-[9px] font-bold uppercase text-cyan-400/70 tracking-wider">Root Cause Analysis</span>
                              <p className="text-xs text-foreground/90 font-medium leading-relaxed mt-1">
                                {directiveLang === "en" 
                                  ? getAIClusterDirective(selectedComplaint.category).rootEn 
                                  : getAIClusterDirective(selectedComplaint.category).rootHi}
                              </p>
                            </div>

                            <div className="border-t border-cyan-500/10 pt-3">
                              <span className="text-[9px] font-bold uppercase text-cyan-400/70 tracking-wider">Actionable Administrative Recommendation</span>
                              <div className="text-xs text-foreground/80 font-semibold leading-relaxed mt-2 whitespace-pre-line bg-cyan-950/20 border border-cyan-500/10 p-3 rounded-xl">
                                {directiveLang === "en" 
                                  ? getAIClusterDirective(selectedComplaint.category).actionEn 
                                  : getAIClusterDirective(selectedComplaint.category).actionHi}
                              </div>
                            </div>

                            <div className="border-t border-cyan-500/10 pt-3 flex items-center justify-between text-[9px] text-cyan-400/60 font-bold">
                              <span>Consolidated Hotspot Protocol active.</span>
                              <span className="animate-pulse">● Scanning Lucknow Zone</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Interactive Status Transition timeline */}
                      <div className="space-y-4">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Grievance Step Status Control (7 Stages)</span>
                        <div className="flex items-center justify-between relative px-2">
                          {/* Progress bar line */}
                          <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-border/20 -translate-y-1/2 z-0" />
                          
                          {/* 7 status states */}
                          {(["submitted", "ai_analyzing", "department_assigned", "officer_reviewing", "action_in_progress", "pending_citizen_confirmation", "resolved"] as ComplaintStatus[]).map((st, i) => {
                            const statuses = ["submitted", "ai_analyzing", "department_assigned", "officer_reviewing", "action_in_progress", "pending_citizen_confirmation", "resolved"];
                            const currentStatus = selectedComplaint.status === "reopened" ? "action_in_progress" : selectedComplaint.status;
                            const currentIdx = statuses.indexOf(currentStatus);
                            const thisIdx = statuses.indexOf(st);
                            
                            const isCompleted = thisIdx < currentIdx || selectedComplaint.status === "resolved";
                            const isActive = st === currentStatus;
                            const isPending = st === "pending_citizen_confirmation";

                            return (
                              <div key={st} className="flex flex-col items-center z-10 relative">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isCompleted
                                      ? "bg-trust-green border-trust-green text-white"
                                      : isActive && isPending
                                      ? "bg-warning-amber border-warning-amber text-black scale-110 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse"
                                      : isActive
                                      ? "bg-primary border-primary text-white scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                      : "bg-card border-border text-muted-foreground"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : isPending && isActive ? (
                                    <UserCheck className="w-3 h-3" />
                                  ) : (
                                    <span className="text-[9px] font-bold font-mono">{i + 1}</span>
                                  )}
                                </div>
                                <span className={`text-[7px] font-extrabold capitalize mt-1.5 tracking-wider hidden sm:block max-w-[60px] text-center leading-tight ${
                                  isActive ? (isPending ? "text-warning-amber font-black" : "text-primary font-black") : "text-muted-foreground"
                                }`}>
                                  {st === "pending_citizen_confirmation" ? "Citizen Confirm" : st.replace(/_/g, " ")}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Status Advancer Actions Panel */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-muted/20 border border-border/10 p-3.5 rounded-2xl">
                          {selectedComplaint.status === "resolved" ? (
                            <div className="w-full flex items-center justify-center gap-2 py-2 text-trust-green font-bold text-sm bg-trust-green/5 border border-trust-green/20 rounded-xl">
                              <CheckCircle2 className="w-4 h-4" />
                              Grievance Completely Resolved & Citizen Verified ✅
                            </div>
                          ) : selectedComplaint.status === "pending_citizen_confirmation" ? (
                            <div className="w-full flex flex-col items-center gap-2 py-3 text-warning-amber font-bold text-sm bg-warning-amber/5 border border-warning-amber/20 rounded-xl">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 animate-pulse" />
                                Awaiting Citizen Confirmation
                              </div>
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                Resolution proof has been submitted. Citizen must verify if the issue is fixed.
                              </span>
                            </div>
                          ) : selectedComplaint.status === "reopened" ? (
                            <>
                              <div className="flex-1 flex items-center gap-2 py-2 text-danger-red font-bold text-xs bg-danger-red/5 border border-danger-red/20 rounded-xl px-3">
                                <AlertTriangle className="w-4 h-4 animate-bounce" />
                                <div>
                                  <div>Citizen Rejected Resolution — Complaint Reopened</div>
                                  <span className="text-[10px] text-muted-foreground font-semibold">Auto-escalated to Senior Officer for re-investigation.</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="text-xs h-10 rounded-xl bg-linear-to-r from-gov-blue via-primary to-ai-purple text-white font-extrabold shadow-md cursor-pointer hover:shadow-primary/30"
                                onClick={handleAdvanceStatus}
                              >
                                <Zap className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                                {getNextStatusText(selectedComplaint.status)}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 text-xs h-10 rounded-xl bg-linear-to-r from-gov-blue via-primary to-ai-purple text-white font-extrabold shadow-md cursor-pointer hover:shadow-primary/30"
                                onClick={handleAdvanceStatus}
                              >
                                {selectedComplaint.status === "action_in_progress" ? (
                                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                                ) : (
                                  <Zap className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                                )}
                                {getNextStatusText(selectedComplaint.status)}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-10 border-danger-red/35 hover:bg-danger-red/5 text-danger-red font-extrabold rounded-xl cursor-pointer"
                                onClick={handleManualEscalate}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                Escalation Override
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Official Custom Note Logger */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Log Administrative Notes</span>
                        <form onSubmit={handleAddOfficialLog} className="space-y-3">
                          <Textarea
                            placeholder="Enter official resolution notes, inspection decisions, or department directives..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="text-xs min-h-[75px] rounded-xl border border-border/40 focus-visible:ring-1 focus-visible:ring-primary/45"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmittingNote || !noteText.trim()}
                            className="bg-card hover:bg-muted text-foreground border border-border/40 font-bold text-xs h-9 px-4.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Log Note Entry
                          </Button>
                        </form>
                      </div>

                      {/* Duplicate mitigation joined console */}
                      {duplicateComplaints.length > 0 && (
                        <div className="border border-warning-amber/15 bg-warning-amber/2 rounded-2xl p-4.5 space-y-3">
                          <div className="flex items-center gap-1.5 text-warning-amber font-extrabold text-xs">
                            <AlertTriangle className="w-4 h-4 animate-bounce" />
                            <span>{duplicateComplaints.length} Nearby Match Grievances (Potential Duplicates)</span>
                          </div>
                          
                          <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                            Our AI spatial cluster engine has detected adjacent complaints reported under the same category. You can merge consolidated files below to unify resolution action.
                          </p>

                          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                            {duplicateComplaints.map((dup) => (
                              <div
                                key={dup.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-border/20 text-xs gap-3 group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                    <span className="font-mono text-muted-foreground text-[10px]">{dup.id}</span>
                                    <span className="truncate text-foreground/80">{dup.title}</span>
                                  </div>
                                  <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-muted-foreground/50" />
                                    {dup.area}
                                  </span>
                                </div>
                                <Button
                                  size="xs"
                                  className="bg-warning-amber hover:bg-warning-amber/90 text-black font-extrabold text-[10px] h-7 px-3 rounded-lg shrink-0 cursor-pointer shadow-sm shadow-warning-amber/20"
                                  onClick={() => handleJoinDuplicate(dup.id)}
                                >
                                  <Layers className="w-3 h-3 mr-1" />
                                  Join & Merge
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Timeline Tracking (read-only for logs) */}
                      <div className="space-y-4 border-t border-border/15 pt-5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Administrative Investigation logs</span>
                        <div className="space-y-3.5 pl-3 border-l-[1.5px] border-border/30">
                          {selectedComplaint.timeline.map((event) => (
                            <div key={event.id} className="relative pl-4 flex flex-col gap-0.5">
                              {/* Glowing timeline node bullet */}
                              <div
                                className={`absolute left-0 translate-x-[-22.5px] top-1.5 w-3 h-3 rounded-full border border-card ${
                                  event.isActive
                                    ? "bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse"
                                    : "bg-muted-foreground/60"
                                }`}
                              />
                              <span className="text-[9px] font-mono text-muted-foreground font-semibold">
                                {new Date(event.timestamp).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-extrabold text-foreground/90 capitalize">
                                {event.status.replace(/_/g, " ")}
                              </span>
                              <p className="text-[11px] text-muted-foreground/90 font-medium leading-normal mt-0.5">
                                {event.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-center mb-6 shadow-inner">
                      <Search className="w-10 h-10 text-primary/40" />
                    </div>
                    <h3 className="text-xl font-extrabold text-foreground/80 mb-2">No Grievance Selected</h3>
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Please select a grievance from the active queue on the left to view detailed analysis, timeline, and AI insights.
                    </p>
                  </div>
                )}
              </Card>
            </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* TAB 4: LIVE MAP                              */}
          {/* ============================================ */}
          {activeSidebarTab === "map" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-[800px] w-full glass-premium border border-border/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-border/25 bg-muted/10 shrink-0 flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-trust-green/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-trust-green" />
                  </div>
                  <span className="text-lg font-extrabold text-foreground/90">Live Telemetry Map</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-trust-green bg-trust-green/10 border border-trust-green/20 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
                  Real-time GPS Tracking
                </div>
              </div>
              <div className="flex-1 w-full h-full relative z-0">
                <ComplaintHeatmap
                  onSelectComplaint={(id) => {
                    setSelectedComplaintId(id);
                    setActiveSidebarTab("portal");
                    setActiveSubTab("queue");
                  }}
                />
              </div>
              <div className="px-4 pb-3 pt-3 shrink-0 bg-[#0a0e17] border-t border-border/10">
                <p className="text-[10px] text-muted-foreground font-semibold text-center leading-normal">
                  Click any marker on the map to inspect the grievance details • Select a complaint to jump to Portal
                </p>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>

      {/* Proof Based Resolution Modal Overlay */}
      <AnimatePresence>
        {showProofModal && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProofModal(false)}
          >
            <motion.div
              className="bg-[#0a0e17] border border-primary/25 rounded-3xl w-full max-w-lg p-7 space-y-5 shadow-2xl shadow-primary/10 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative glow */}
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/5 rounded-full filter blur-[80px] pointer-events-none" />
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-trust-green/20 to-primary/20 border border-trust-green/30 flex items-center justify-center shadow-lg">
                  <Camera className="w-5 h-5 text-trust-green" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Submit Resolution Proof</h3>
                  <p className="text-[10px] text-gray-400 font-bold">Anti-corruption evidence protocol • Citizen must confirm</p>
                </div>
              </div>

              {/* Complaint Reference */}
              {selectedComplaint && (
                <div className="bg-white/3 border border-white/8 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-[10px] font-mono font-black text-gray-500 bg-white/5 px-2 py-1 rounded-lg border border-white/10">{selectedComplaint.id}</span>
                  <span className="text-xs font-bold text-gray-300 truncate">{selectedComplaint.title}</span>
                </div>
              )}

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Upload Resolution Photo (Proof of Work Done)
                </label>
                
                {proofPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-trust-green/30 h-44">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofPhoto} alt="Resolution Proof" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
                      <span className="text-[9px] font-bold text-trust-green truncate">{proofPhotoName}</span>
                      <button
                        type="button"
                        onClick={() => { setProofPhoto(null); setProofPhotoName(""); }}
                        className="text-[9px] font-black text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-white/10 bg-white/2 hover:bg-white/4 hover:border-primary/25 transition-all cursor-pointer group">
                    <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary/60 transition-colors mb-2" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-400">Click to upload photo evidence</span>
                    <span className="text-[10px] text-gray-600 mt-0.5">JPG, PNG • Max 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofPhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Resolution Note */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Resolution Description (Required)
                </label>
                <Textarea
                  placeholder="Describe what was done to resolve the issue. e.g., 'Manhole covered with concrete slab, drainage cleared, area sanitized...'"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  className="text-xs min-h-[80px] rounded-xl bg-white/3 border border-white/10 focus-visible:ring-1 focus-visible:ring-primary/45 text-gray-200 placeholder:text-gray-600"
                />
              </div>

              {/* Info Card */}
              <div className="bg-warning-amber/5 border border-warning-amber/15 rounded-xl p-3 flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-warning-amber shrink-0 mt-0.5" />
                <div className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                  <span className="text-warning-amber font-black">Anti-Corruption Protocol:</span> After submission, the citizen will receive a notification to confirm whether the issue is actually fixed. If rejected, the complaint will be automatically reopened and escalated.
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProofModal(false)}
                  className="flex-1 text-xs h-11 rounded-xl border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!proofNote.trim() || isSubmittingProof}
                  onClick={handleSubmitProof}
                  className="flex-1 text-xs h-11 rounded-xl bg-linear-to-r from-trust-green via-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-trust-green/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 hover:shadow-trust-green/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Proof & Request Confirmation
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
