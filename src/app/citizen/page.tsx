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

  // Load complaints dynamically on mount
  useEffect(() => {
    setComplaints(getComplaints());
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
      <main className="min-h-screen pt-24 md:pt-28 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isHi ? "नागरिक शिकायत पोर्टल" : "Citizen Portal"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isHi ? "अपनी शिकायतें दर्ज करें और ट्रैक करें" : "File and track your complaints"}
                </p>
              </div>
            </div>

            {/* Header Interactive Controls */}
            <div className="flex items-center gap-3 relative">
              {/* Premium Notification Bell Component */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                    showNotifications 
                      ? "bg-primary/10 text-primary border-primary/30" 
                      : "bg-muted/60 border-border/40 hover:bg-muted/85 hover:text-foreground text-muted-foreground"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background animate-pulse shadow-md">
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
                    <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-y-auto z-50 glass-card rounded-2xl p-4 shadow-xl border border-border/50 bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
                        <h4 className="font-bold text-sm text-foreground">
                          {isHi ? "सूचनाएं" : "Notifications"}
                        </h4>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllNotifications}
                            className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isHi ? "साफ़ करें" : "Clear All"}
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                          <Inbox className="w-8 h-8 opacity-40 animate-bounce" />
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
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                n.read
                                  ? "bg-muted/20 border-border/20 hover:bg-muted/40"
                                  : "bg-primary/[0.04] border-primary/25 hover:bg-primary/[0.07] shadow-sm active-glow-primary hover:border-primary/45"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider font-mono">
                                  {n.complaintId}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-semibold">
                                  {formatTime(n.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-foreground/90 leading-normal">
                                {isHi ? n.messageHi : n.message}
                              </p>
                              {!n.read && (
                                <span className="text-[10px] font-bold text-primary self-end animate-pulse">
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

              {/* Premium Language Toggler */}
              <div className="flex items-center gap-1 bg-muted/60 border border-border/40 p-1 rounded-xl shadow-inner w-fit">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    language === "hi"
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 p-1">
              <TabsTrigger value="new" className="gap-2 data-[state=active]:bg-background">
                <Plus className="w-4 h-4" />
                {dict.newComplaint}
              </TabsTrigger>
              <TabsTrigger value="track" className="gap-2 data-[state=active]:bg-background">
                <Search className="w-4 h-4" />
                {dict.myComplaints}
              </TabsTrigger>
            </TabsList>

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
