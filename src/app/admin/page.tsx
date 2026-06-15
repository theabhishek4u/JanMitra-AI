"use client";

import { useState, useEffect } from "react";
import { getAuthSession, clearAuthSession } from "@/lib/auth";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Building2,
  Brain,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Coins,
  Zap,
  Sliders,
  Plus,
  ShieldCheck,
  LayoutDashboard,
  Layers,
  MapPin,
  Fingerprint,
  User,
  LogOut,
  Settings,
  Bell,
  Trash2,
  Inbox,
  X,
  FileText,
  Users,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/shared/Navbar";
import { getStats, getAnalytics, getComplaints } from "@/lib/complaints";
import { getAdminTokenConfig, setAdminTokenConfig, grantExtraTokens, getCitizenFrequencyReport } from "@/lib/tokenSystem";
import { getRegisteredCitizens } from "@/lib/auth";
import type { DashboardStats, AnalyticsData, Complaint } from "@/types";

// Dynamic import to avoid SSR issues with recharts
const AnalyticsCharts = dynamic(() => import("@/components/admin/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="skeleton h-[300px] rounded-2xl bg-card/40 animate-pulse border border-border/10" />
      <div className="grid grid-cols-2 gap-6">
        <div className="skeleton h-[300px] rounded-2xl bg-card/40 animate-pulse border border-border/10" />
        <div className="skeleton h-[300px] rounded-2xl bg-card/40 animate-pulse border border-border/10" />
      </div>
    </div>
  ),
});

const predictions = [
  {
    area: "Rajajipuram",
    prediction: "Drainage overflow likely due to monsoon patterns",
    confidence: 86,
    risk: "high",
  },
  {
    area: "Gomti Nagar",
    prediction: "Increased garbage complaints expected next week",
    confidence: 79,
    risk: "medium",
  },
  {
    area: "Alambagh",
    prediction: "Power grid strain — potential outage risk",
    confidence: 72,
    risk: "medium",
  },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState("analytics");
  const [citizens, setCitizens] = useState<any[]>([]);
  const [citizenSearchQuery, setCitizenSearchQuery] = useState("");

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };
  
  // Header Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Token System states
  const [maxTokens, setMaxTokens] = useState(3);
  const [report, setReport] = useState({
    totalComplaintsToday: 0,
    emergencyBypassesToday: 0,
    tokensRemaining: 3,
    maxTokens: 3,
    lastReset: new Date().toISOString(),
    hoursUntilReset: 24,
  });

  const handleLimitChange = (newVal: number) => {
    const clamped = Math.max(1, Math.min(10, newVal));
    setAdminTokenConfig(clamped);
    setMaxTokens(clamped);
    setReport(getCitizenFrequencyReport());
  };

  const handleGrantTokens = (amount: number) => {
    grantExtraTokens(amount);
    setReport(getCitizenFrequencyReport());
  };

  useEffect(() => {
    // Client-side secure route guard
    const checkAuth = () => {
      const session = getAuthSession();
      if (!session) {
        window.location.href = "/login?role=admin";
        return false;
      }
      if (session.role !== "admin") {
        // Safely redirect to their active matching dashboard rather than clearing the session
        window.location.href = session.role === "officer" ? "/officer" : "/login?role=admin";
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    setMounted(true);
    
    // Initial fetch
    Promise.all([
      getStats(),
      getAnalytics(),
      getComplaints(),
      getRegisteredCitizens()
    ]).then(([statsData, analyticsData, complaintsData, citizensData]) => {
      setStats(statsData);
      setAnalytics(analyticsData);
      setComplaints(complaintsData);
      setCitizens(citizensData);
    });

    setMaxTokens(getAdminTokenConfig());
    setReport(getCitizenFrequencyReport());

    const handleTabSync = () => {
      checkAuth();
    };

    const handleSync = async () => {
      setComplaints(await getComplaints());
      setStats(await getStats());
      setAnalytics(await getAnalytics());
      setCitizens(await getRegisteredCitizens());
      setReport(getCitizenFrequencyReport());
    };

    window.addEventListener("focus", handleTabSync);
    window.addEventListener("visibilitychange", handleTabSync);
    window.addEventListener("janmitra-db-change", handleSync);
    window.addEventListener("storage", handleSync);

    // Initial notifications load
    // Using empty array as placeholder until backend notification system is implemented
    const notifs: any[] = [];
    setNotifications(notifs);
    setUnreadCount(0);

    return () => {
      window.removeEventListener("focus", handleTabSync);
      window.removeEventListener("visibilitychange", handleTabSync);
      window.removeEventListener("janmitra-db-change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleNotificationClick = (notification: any) => {
    // Placeholder for mark as read functionality
    setShowNotifications(false);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!mounted || !stats || !analytics) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-ai-purple/20 via-primary/10 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center shadow-lg animate-spin">
          <Sparkles className="w-6 h-6 text-ai-purple" />
        </div>
        <span className="text-sm font-bold mt-4 tracking-wider">LOADING ADMIN INSIGHTS PORTAL...</span>
      </div>
    );
  }

  // Calculate dynamic stats cards
  const resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) + "%" : "0%";

  const filteredCitizens = citizens.filter((citizen) => {
    const query = citizenSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (citizen.name && citizen.name.toLowerCase().includes(query)) ||
      (citizen.email && citizen.email.toLowerCase().includes(query)) ||
      (citizen.mobile && citizen.mobile.includes(query))
    );
  });

  const adminStats = [
    { label: "Total Complaints", value: stats.total.toLocaleString(), icon: BarChart3, color: "#3B82F6", change: "+12%", up: true },
    { label: "Resolution Rate", value: resolutionRate, icon: TrendingUp, color: "#10B981", change: "+5.2%", up: true },
    { label: "Avg Resolution", value: `${stats.avgResolutionHours}h`, icon: Clock, color: "#7C3AED", change: "-18%", up: false },
    { label: "Escalated", value: stats.escalated.toLocaleString(), icon: AlertTriangle, color: "#EF4444", change: "-3%", up: false },
  ];

  return (
    <div className="min-h-screen flex bg-[#060b14]">
      {/* ============================================ */}
      {/* FULL HEIGHT LEFT SIDEBAR                     */}
      <aside className="w-[260px] bg-[#0a1120] border-r border-border/10 hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-border/10 shrink-0">
          <span className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 bg-linear-to-br from-ai-purple to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-ai-purple/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            JanMitra <span className="text-ai-purple text-[10px] uppercase ml-1 border border-ai-purple/30 px-1.5 py-0.5 rounded">Admin</span>
          </span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase px-3 pb-2">
            Admin Modules
          </p>
          {[
            { id: "analytics", label: "Dashboard Analytics", icon: BarChart3 },
            { id: "insights", label: "Predictive Insights", icon: Sparkles },
            { id: "tokens", label: "Token Controls", icon: Coins },
            { id: "registry", label: "Nodal Registry", icon: FileText },
            { id: "users", label: "Registered Citizens", icon: Users },
            { id: "settings", label: "System Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSidebarTab(item.id)}
              className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer group relative overflow-hidden ${
                activeSidebarTab === item.id
                  ? "bg-ai-purple text-white shadow-md shadow-ai-purple/20"
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
            </button>
          ))}
        </div>
        
        {/* User profile at bottom of sidebar */}
        <div className="p-4 border-t border-border/10 shrink-0 bg-white/2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-ai-purple/20 flex items-center justify-center border border-ai-purple/30 shrink-0">
              <User className="w-4 h-4 text-ai-purple" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">System Admin</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">Superuser</span>
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
               {activeSidebarTab === "analytics" && "Dashboard Analytics"}
               {activeSidebarTab === "insights" && "Predictive Insights"}
               {activeSidebarTab === "tokens" && "Token Controls"}
               {activeSidebarTab === "registry" && "Nodal Grievance Registry"}
               {activeSidebarTab === "users" && "Registered Citizens Directory"}
               {activeSidebarTab === "settings" && "System Settings"}
             </h1>
          </div>
          
          <div className="flex items-center gap-3 relative">
             {/* Admin Notification Bell Dropdown */}
             <div className="relative">
               <button
                 type="button"
                 onClick={() => setShowNotifications(!showNotifications)}
                 className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                   showNotifications 
                     ? "bg-ai-purple/10 text-ai-purple border-ai-purple/30" 
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
                                 Just now
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

              <button onClick={handleLogout} className="p-2 rounded-xl border border-border/30 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center active:scale-95">
                <LogOut className="w-4 h-4 ml-0.5" />
              </button>
          </div>
        </header>

        {/* CONTENT TABS */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {activeSidebarTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {adminStats.map((stat, i) => {
                  const glowClass = 
                    stat.label === "Total Complaints" ? "hover:neon-glow-primary border-gov-blue/20 hover:border-gov-blue/40" :
                    stat.label === "Resolution Rate" ? "hover:neon-glow-success border-trust-green/20 hover:border-trust-green/40" :
                    stat.label === "Avg Resolution" ? "hover:neon-glow-ai border-ai-purple/20 hover:border-ai-purple/40" :
                    "hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.35)] border-danger-red/20 hover:border-danger-red/40";
                  
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Card className={`glass-premium border premium-glow-border relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group ${glowClass}`}>
                        <div
                          className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500"
                      style={{ backgroundColor: stat.color }}
                    />
                    <CardContent className="p-5 relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-opacity-20"
                          style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
                        >
                          <stat.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: stat.color }} />
                        </div>
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${stat.label === "Escalated" ? "text-danger-red" : "text-trust-green"}`}>
                          {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-foreground/90">{stat.value}</div>
                      <div className="text-xs font-semibold text-muted-foreground mt-1.5">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Dynamic Charts Hookup */}
          <AnalyticsCharts data={analytics} />
          </motion.div>
          )}

          {activeSidebarTab === "insights" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
          {/* Department Efficiency + Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance */}
            <Card className="glass-premium border border-border/30 relative overflow-hidden shadow-xl shadow-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                  <div className="w-7 h-7 rounded-lg bg-gov-blue/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gov-blue-light" />
                  </div>
                  Department Performance Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                {analytics.departmentEfficiency.map((dept, i) => {
                  const total = dept.resolved + dept.pending;
                  const pctResolved = total > 0 ? (dept.resolved / total) * 100 : 0;
                  const pctPending = total > 0 ? (dept.pending / total) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={dept.department}
                      className="space-y-2.5 p-3 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-foreground/90">{dept.department}</span>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className="text-trust-green">{dept.resolved} resolved</span>
                          <span className="text-warning-amber">{dept.pending} pending</span>
                          <span className="text-muted-foreground">Avg: {dept.avgDays} days</span>
                        </div>
                      </div>
                      {/* Multi-segmented custom progress bar track */}
                      <div className="flex gap-1 h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-trust-green to-trust-green-light rounded-l-full transition-all duration-500"
                          style={{ width: `${pctResolved || 5}%` }}
                        />
                        <div
                          className="h-full bg-linear-to-r from-warning-amber to-warning-amber-light rounded-r-full transition-all duration-500"
                          style={{ width: `${pctPending || 5}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Predictive Insights */}
            <Card className="glass-premium border border-border/30 relative overflow-hidden shadow-xl shadow-black/5">
              <div className="absolute right-0 top-0 w-24 h-24 bg-linear-to-bl from-ai-purple/10 to-transparent pointer-events-none rounded-bl-full" />
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-lg flex items-center gap-2 font-bold text-foreground/90">
                  <div className="w-7 h-7 rounded-lg bg-ai-purple/10 flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles className="w-4 h-4 text-ai-purple" />
                  </div>
                  Predictive Civic Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4 relative z-10">
                {predictions.map((p, i) => {
                  const isHigh = p.risk === "high";
                  return (
                    <motion.div
                      key={p.area}
                      className={`p-4 rounded-xl border transition-all duration-300 shadow-sm group hover:scale-[1.01] ${
                        isHigh
                          ? "bg-danger-red/2 border-danger-red/15 hover:border-danger-red/40 hover:shadow-[0_0_15px_-4px_rgba(239,68,68,0.25)]"
                          : "bg-warning-amber/2 border-warning-amber/15 hover:border-warning-amber/40 hover:shadow-[0_0_15px_-4px_rgba(245,158,11,0.25)]"
                      }`}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isHigh ? "bg-danger-red/10 text-danger-red" : "bg-warning-amber/10 text-warning-amber"}`}>
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <span className="font-extrabold text-sm text-foreground/90">{p.area}</span>
                        <Badge
                          variant="outline"
                          className={`ml-auto text-[9px] uppercase font-extrabold tracking-wider ${
                            isHigh ? "priority-high px-2 py-0.5 animate-pulse" : "priority-medium px-2 py-0.5"
                          }`}
                        >
                          {p.risk} risk
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground/90 mb-3 leading-relaxed">{p.prediction}</p>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden flex items-center">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? "bg-linear-to-r from-danger-red to-warning-amber" : "bg-linear-to-r from-warning-amber to-trust-green"
                            }`}
                            style={{ width: `${p.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-extrabold tabular-nums ${isHigh ? "text-danger-red" : "text-warning-amber"}`}>
                          {p.confidence}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                <div className="p-3 rounded-xl bg-ai-purple/5 border border-ai-purple/15 text-center mt-2">
                  <p className="text-xs text-ai-purple/70 font-semibold flex items-center justify-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    Predictions based on real-time spatial trends & AI telemetry
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          </motion.div>
          )}

          {activeSidebarTab === "tokens" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
          {/* Daily Complaint Token System Controls */}
          <div>
            <Card className="glass-premium border border-amber-500/20 relative overflow-hidden shadow-xl shadow-black/5 hover:shadow-amber-500/3 transition-all duration-300">
              <div className="absolute right-0 top-0 w-32 h-32 bg-linear-to-bl from-amber-500/5 to-transparent pointer-events-none rounded-bl-full" />
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-lg flex items-center gap-2.5 font-bold text-foreground/90">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Coins className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
                  </div>
                  <div>
                    <span>Daily Complaint Token System Controls</span>
                    <p className="text-[11px] font-medium text-muted-foreground/80 mt-0.5">
                      Prevent spam and fake complaints while ensuring fair citizen access
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Config Limit */}
                  <div className="space-y-4 bg-muted/20 border border-border/20 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 mb-1">
                      <Sliders className="w-4 h-4 text-gov-blue" />
                      <span>Adjust Daily Token Limit</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Configure the maximum number of complaints a standard citizen can submit per 24 hours.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => handleLimitChange(maxTokens - 1)}
                        disabled={maxTokens <= 1}
                        className="w-10 h-10 rounded-xl bg-card border border-border/40 hover:bg-muted/80 disabled:opacity-40 text-lg font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center bg-card border border-border/40 py-2 rounded-xl">
                        <span className="text-2xl font-black text-foreground">{maxTokens}</span>
                        <span className="text-[10px] text-muted-foreground block font-bold">TOKENS / DAY</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLimitChange(maxTokens + 1)}
                        disabled={maxTokens >= 10}
                        className="w-10 h-10 rounded-xl bg-card border border-border/40 hover:bg-muted/80 disabled:opacity-40 text-lg font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Grant Tokens */}
                  <div className="space-y-4 bg-muted/20 border border-border/20 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 mb-1">
                      <Plus className="w-4 h-4 text-trust-green" />
                      <span>Grant Extra Tokens</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Instantly credit the active citizen session with extra complaint tokens for diagnostic testing or high-volume submission.
                    </p>
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      {[1, 3, 5].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleGrantTokens(amount)}
                          className="bg-linear-to-br from-card to-muted hover:from-amber-500/10 hover:to-amber-500/20 border border-border/40 hover:border-amber-500/30 py-3 rounded-xl text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 group"
                        >
                          <span className="text-sm font-black text-foreground group-hover:text-amber-300">+{amount}</span>
                          <span className="text-[9px] font-bold text-muted-foreground group-hover:text-amber-400 uppercase tracking-wider">Tokens</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Live Frequency Report */}
                  <div className="space-y-4 bg-muted/20 border border-border/20 p-5 rounded-2xl md:col-span-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 mb-1">
                      <TrendingUp className="w-4 h-4 text-ai-purple" />
                      <span>Live Citizen Usage Report</span>
                    </div>
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs border-b border-border/10 pb-1.5">
                        <span className="font-semibold text-muted-foreground">Total Submissions Today:</span>
                        <span className="font-extrabold text-foreground">{report.totalComplaintsToday} complaints</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-b border-border/10 pb-1.5">
                        <span className="font-semibold text-muted-foreground">Emergency Bypasses Triggered:</span>
                        <span className="font-extrabold text-amber-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          {report.emergencyBypassesToday} used
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-0.5">
                        <span className="font-semibold text-muted-foreground">Active User Token Balance:</span>
                        <span className="font-extrabold text-trust-green">{report.tokensRemaining} / {report.maxTokens}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/80 font-medium text-center pt-2">
                        Automatic token refresh in: <span className="font-extrabold text-foreground">{report.hoursUntilReset} hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </motion.div>
          )}

          {activeSidebarTab === "registry" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
          {/* Nodal Grievance Registry (Complaint List) */}
          {/* Nodal Grievance Registry (Premium Full-Width) */}
          <div className="flex flex-col min-h-[calc(100vh-140px)] -mx-6 lg:-mx-8">
            <div className="px-6 lg:px-8 pb-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-ai-purple/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                  <Building2 className="w-6 h-6 text-primary relative z-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    Nodal Grievance Registry
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest ml-2 px-2 py-0.5">
                      Live Ledger
                    </Badge>
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1 tracking-wide">
                    Consolidated citizen ticket ledger with dynamic department mapping & priority monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#090d16]/95 backdrop-blur-xl border-y border-border/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 sticky top-0 z-10">
                    <th className="py-5 px-6 lg:px-8 whitespace-nowrap">Complaint ID</th>
                    <th className="py-5 px-4">Citizen Identity</th>
                    <th className="py-5 px-4 w-[25%]">Category & Subject</th>
                    <th className="py-5 px-4">Assigned Authority</th>
                    <th className="py-5 px-4">Priority Level</th>
                    <th className="py-5 px-6 lg:px-8 text-right">Status Tracker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-sm font-bold text-muted-foreground">
                        No registered complaints found in system ledger.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-white/2 transition-all duration-300 text-xs font-semibold group cursor-pointer">
                        <td className="py-5 px-6 lg:px-8 font-mono font-black text-foreground/90 whitespace-nowrap">
                          <span className="bg-muted/30 border border-border/20 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-colors px-3 py-1.5 rounded-lg">
                            {c.id}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-foreground group-hover:text-white transition-colors">{c.citizenName}</span>
                            <span className="text-[10px] text-muted-foreground mt-1 tracking-wider">{c.citizenPhone}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-300 leading-relaxed group-hover:text-white transition-colors">{c.title}</span>
                            <span className="text-[9px] mt-1.5 font-black uppercase tracking-widest text-ai-purple flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-ai-purple animate-pulse" />
                              {c.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-300">{c.department}</span>
                            <span className={`text-[10px] mt-1.5 font-bold tracking-wide ${c.escalationLevel > 0 ? "text-danger-red" : "text-muted-foreground"}`}>
                              {c.escalationLevel > 0 ? `ESCALATED: ${c.assignedOfficer}` : `Assigned: ${c.assignedOfficer}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <Badge variant="outline" className={`priority-${c.priority} font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5`}>
                              {c.priority}
                            </Badge>
                            {c.escalationLevel > 0 && (
                              <Badge variant="outline" className="bg-danger-red/10 border-danger-red/30 text-danger-red font-extrabold uppercase text-[8px] tracking-widest px-1.5">
                                Lvl {c.escalationLevel} Escalation
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6 lg:px-8 text-right">
                          <Badge className={`font-extrabold uppercase text-[9px] px-2.5 py-1 tracking-wider border ${
                            c.status === "resolved" 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : c.status === "escalated"
                              ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}>
                            {c.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </motion.div>
          )}

          {activeSidebarTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-premium border border-border/20 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:neon-glow-primary hover:border-gov-blue/30 group bg-[#070b15]/40">
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500 bg-ai-purple" />
                  <CardContent className="p-5 flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-ai-purple/10 border border-ai-purple/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-ai-purple" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-white">{citizens.length}</span>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Registered Citizens</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-premium border border-border/20 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:neon-glow-success hover:border-trust-green/30 group bg-[#070b15]/40">
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500 bg-trust-green" />
                  <CardContent className="p-5 flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-trust-green/10 border border-trust-green/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-trust-green" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-white">Active</span>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Authentication Core</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-premium border border-border/20 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:neon-glow-ai hover:border-ai-purple/30 group bg-[#070b15]/40">
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full filter blur-xl opacity-15 pointer-events-none group-hover:scale-125 transition-transform duration-500 bg-gov-blue" />
                  <CardContent className="p-5 flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gov-blue/10 border border-gov-blue/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-gov-blue-light animate-pulse" />
                    </div>
                    <div>
                      <span className="text-2xl font-black text-white">Live Sync</span>
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">State Telemetry</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <div className="flex flex-col -mx-6 lg:-mx-8">
                <div className="px-6 lg:px-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                      Registered Citizen Directory
                      <Badge variant="outline" className="bg-ai-purple/10 text-ai-purple border-ai-purple/20 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                        {citizens.length} nodes
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Inspect citizen profiles, registered phone coordinates, and database entry logs.
                    </p>
                  </div>
                  
                  {/* Search box */}
                  <div className="relative w-full sm:w-72 shrink-0">
                    <input
                      type="text"
                      value={citizenSearchQuery}
                      onChange={(e) => setCitizenSearchQuery(e.target.value)}
                      placeholder="Search name, email, or mobile..."
                      className="w-full bg-[#030712]/60 border border-border/20 rounded-full py-2.5 pl-4 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-purple/55 transition-all font-semibold"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <Search className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full border-t border-border/10">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#090d16]/95 border-b border-border/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/85">
                        <th className="py-4.5 px-6 lg:px-8">Citizen Identity</th>
                        <th className="py-4.5 px-4">Citizen ID</th>
                        <th className="py-4.5 px-4">Official Email</th>
                        <th className="py-4.5 px-4">Mobile Number</th>
                        <th className="py-4.5 px-6 lg:px-8 text-right">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                      {filteredCitizens.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-16 text-xs font-bold text-muted-foreground">
                            {citizenSearchQuery ? "No matching citizens found in search filter." : "No registered citizens found in database."}
                          </td>
                        </tr>
                      ) : (
                        filteredCitizens.map((c) => (
                          <tr key={c.id} className="hover:bg-white/2 transition-colors duration-200 text-xs font-semibold group">
                            <td className="py-4.5 px-6 lg:px-8">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-ai-purple/15 flex items-center justify-center border border-ai-purple/20 shrink-0">
                                  <User className="w-3.5 h-3.5 text-ai-purple" />
                                </div>
                                <span className="font-extrabold text-foreground group-hover:text-white transition-colors">{c.name}</span>
                              </div>
                            </td>
                            <td className="py-4.5 px-4 font-mono font-bold text-muted-foreground">
                              <span className="bg-muted/30 border border-border/25 px-2.5 py-1 rounded-md text-[10px] text-slate-400">
                                {c.id ? c.id.substring(0, 8) : "N/A"}
                              </span>
                            </td>
                            <td className="py-4.5 px-4 text-slate-300 font-medium">
                              {c.email}
                            </td>
                            <td className="py-4.5 px-4 text-slate-300 font-medium font-mono">
                              {c.mobile || "N/A"}
                            </td>
                            <td className="py-4.5 px-6 lg:px-8 text-right text-muted-foreground font-mono">
                              {c.created_at 
                                ? new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                : "N/A"
                              }
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeSidebarTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-foreground">System Settings</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Global configuration and environment parameters are currently managed by infrastructure administrators.
              </p>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
