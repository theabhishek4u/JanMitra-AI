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
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  ShieldCheck,
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
  Sliders,
  Plus,
  Landmark,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { getStats, getAnalytics, getComplaints } from "@/lib/complaints";
import { getAdminTokenConfig, setAdminTokenConfig, grantExtraTokens, getCitizenFrequencyReport } from "@/lib/tokenSystem";
import { getRegisteredCitizens } from "@/lib/auth";
import type { DashboardStats, AnalyticsData, Complaint } from "@/types";

const AnalyticsCharts = dynamic(() => import("@/components/admin/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="h-[280px] rounded-xl bg-[#12151c] animate-pulse border border-white/5" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-[240px] rounded-xl bg-[#12151c] animate-pulse border border-white/5" />
        <div className="h-[240px] rounded-xl bg-[#12151c] animate-pulse border border-white/5" />
      </div>
    </div>
  ),
});

const predictions = [
  {
    area: "Rajajipuram",
    prediction: "Drainage overflow risk flagged due to monsoon catchment telemetry",
    confidence: 86,
    risk: "high",
  },
  {
    area: "Gomti Nagar",
    prediction: "Increased solid waste volume forecasted across commercial nodes",
    confidence: 79,
    risk: "medium",
  },
  {
    area: "Alambagh",
    prediction: "Substation load variance indicating localized power distribution strain",
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
    const checkAuth = () => {
      const session = getAuthSession();
      if (!session) {
        window.location.href = "/login?role=admin";
        return false;
      }
      if (session.role !== "admin") {
        window.location.href = session.role === "officer" ? "/officer" : "/login?role=admin";
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    setMounted(true);
    
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

    return () => {
      window.removeEventListener("focus", handleTabSync);
      window.removeEventListener("visibilitychange", handleTabSync);
      window.removeEventListener("janmitra-db-change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleNotificationClick = (notification: any) => {
    setShowNotifications(false);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!mounted || !stats || !analytics) {
    return (
      <div className="min-h-screen bg-[#0c0e14] flex flex-col items-center justify-center text-slate-400">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-spin">
          <Landmark className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-xs font-mono mt-4 tracking-wider">LOADING SECRETARIAT AUDIT CONSOLE...</span>
      </div>
    );
  }

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
    { label: "Total Complaints", value: stats.total.toLocaleString(), icon: BarChart3, change: "+12%", up: true },
    { label: "Resolution Rate", value: resolutionRate, icon: TrendingUp, change: "+5.2%", up: true },
    { label: "Mean Resolution SLA", value: `${stats.avgResolutionHours}h`, icon: Clock, change: "-18%", up: false },
    { label: "Escalated Cases", value: stats.escalated.toLocaleString(), icon: AlertTriangle, change: "-3%", up: false },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white dark:bg-[#12151c] border-r border-slate-200 dark:border-white/8 hidden lg:flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/8 shrink-0">
          <span className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600/15 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-500 dark:text-blue-400">
              <Landmark className="w-4 h-4" />
            </div>
            JanMitra
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </span>
        </div>
        
        <div className="flex-1 py-5 flex flex-col gap-1 px-3 overflow-y-auto">
          <p className="text-[11px] font-mono tracking-wider text-slate-500 dark:text-slate-400 uppercase px-3 pb-2">
            Audit Modules
          </p>
          {[
            { id: "analytics", label: "Dashboard Analytics", icon: BarChart3 },
            { id: "insights", label: "Predictive Insights", icon: TrendingUp },
            { id: "tokens", label: "Token Quota System", icon: Coins },
            { id: "registry", label: "Nodal Grievance Ledger", icon: FileText },
            { id: "users", label: "Registered Citizens", icon: Users },
            { id: "settings", label: "System Parameters", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSidebarTab(item.id)}
              className={`flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeSidebarTab === item.id
                  ? "bg-blue-50 dark:bg-white/10 text-blue-700 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* User profile at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-white/8 shrink-0 bg-slate-50 dark:bg-[#0e1017]">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-900 dark:text-white truncate">UP Secretariat Admin</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">Audit Superuser</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-h-screen relative w-full">
        
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-200 dark:border-white/8 bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
             <h1 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
               {activeSidebarTab === "analytics" && "Dashboard Analytics"}
               {activeSidebarTab === "insights" && "Predictive Civic Insights"}
               {activeSidebarTab === "tokens" && "Token Quota System Controls"}
               {activeSidebarTab === "registry" && "Nodal Grievance Ledger"}
               {activeSidebarTab === "users" && "Registered Citizens Directory"}
               {activeSidebarTab === "settings" && "System Configuration Parameters"}
             </h1>
          </div>
          
          <div className="flex items-center gap-2.5 relative">
             <ThemeToggle />
             {/* Admin Notification Bell Dropdown */}
             <div className="relative">
               <button
                 type="button"
                 onClick={() => setShowNotifications(!showNotifications)}
                 className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12151c] hover:bg-slate-100 dark:hover:bg-[#181c24] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-center relative"
                 aria-label="System Alerts"
               >
                 <Bell className="w-4 h-4" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] font-mono font-bold text-white rounded-full flex items-center justify-center">
                     {unreadCount}
                   </span>
                 )}
               </button>

               {showNotifications && (
                 <>
                   <div 
                     className="fixed inset-0 z-40 cursor-default" 
                     onClick={() => setShowNotifications(false)} 
                   />
                   <div className="absolute right-0 mt-2 w-[340px] max-h-[420px] overflow-y-auto z-50 rounded-xl p-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151c] shadow-2xl">
                     <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/8 pb-2.5 mb-3">
                       <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                         System Alerts
                       </h4>
                       <div className="flex items-center gap-3">
                         {notifications.length > 0 && (
                           <button
                             type="button"
                             onClick={handleClearAllNotifications}
                             className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                           >
                             <Trash2 className="w-3 h-3" />
                             Clear
                           </button>
                         )}
                         <button
                           type="button"
                           onClick={() => setShowNotifications(false)}
                           className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                         >
                           <X className="w-3.5 h-3.5" />
                         </button>
                       </div>
                     </div>

                     {notifications.length === 0 ? (
                       <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 gap-2">
                         <Inbox className="w-6 h-6 opacity-40" />
                         <p className="text-xs">No active alerts</p>
                       </div>
                     ) : (
                       <div className="space-y-2">
                         {notifications.map((n) => (
                           <div
                             key={n.id}
                             onClick={() => handleNotificationClick(n)}
                             className="p-2.5 rounded-lg border border-white/6 bg-[#181c24] hover:bg-[#1e232e] transition-colors cursor-pointer text-xs"
                           >
                             <div className="flex items-start justify-between gap-1 text-[10px] font-mono text-slate-400 mb-1">
                               <span>{n.complaintId}</span>
                               <span>Just now</span>
                             </div>
                             <p className="text-slate-200">{n.message}</p>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </>
               )}
             </div>

             <button 
               onClick={handleLogout} 
               className="p-2 rounded-lg border border-white/10 bg-[#12151c] hover:bg-[#181c24] text-slate-300 transition-colors cursor-pointer flex items-center justify-center"
               title="Sign out"
             >
                <LogOut className="w-4 h-4" />
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
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {adminStats.map((stat, i) => (
                  <Card key={stat.label} className="bg-[#12151c] border border-white/10 rounded-xl relative overflow-hidden transition-colors hover:border-white/20">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <stat.icon className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className={`text-xs font-mono font-medium flex items-center gap-0.5 ${stat.label.includes("Escalated") ? "text-amber-400" : "text-emerald-400"}`}>
                          {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-mono font-semibold text-white">{stat.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
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
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Performance */}
                <Card className="bg-[#12151c] border border-white/10 rounded-xl">
                  <CardHeader className="pb-3 border-b border-white/6 mb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                      <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      Departmental resolution performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {analytics.departmentEfficiency.map((dept) => {
                      const total = dept.resolved + dept.pending;
                      const pctResolved = total > 0 ? (dept.resolved / total) * 100 : 0;
                      
                      return (
                        <div
                          key={dept.department}
                          className="space-y-2 p-3 rounded-lg bg-[#181c24] border border-white/5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-200">{dept.department}</span>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                              <span className="text-emerald-400">{dept.resolved} resolved</span>
                              <span className="text-amber-400">{dept.pending} pending</span>
                              <span>Avg: {dept.avgDays}d</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-[#0c0e14] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${pctResolved || 5}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Predictive Insights */}
                <Card className="bg-[#12151c] border border-white/10 rounded-xl">
                  <CardHeader className="pb-3 border-b border-white/6 mb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                      Predictive civic risk forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {predictions.map((p) => {
                      const isHigh = p.risk === "high";
                      return (
                        <div
                          key={p.area}
                          className="p-3.5 rounded-lg bg-[#181c24] border border-white/5 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{p.area}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                                isHigh 
                                  ? "border-amber-500/30 text-amber-400 bg-amber-500/10" 
                                  : "border-slate-500/30 text-slate-400 bg-slate-500/10"
                              }`}
                            >
                              {p.risk} risk
                            </Badge>
                          </div>
                          <p className="text-slate-400 leading-relaxed">{p.prediction}</p>
                          <div className="flex items-center gap-3 pt-1">
                            <div className="h-1.5 flex-1 bg-[#0c0e14] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${isHigh ? "bg-amber-500" : "bg-blue-500"}`}
                                style={{ width: `${p.confidence}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {p.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
              <Card className="bg-[#12151c] border border-white/10 rounded-xl">
                <CardHeader className="pb-3 border-b border-white/6 mb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                    <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span>Daily complaint token quota controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Config Limit */}
                    <div className="space-y-3 bg-[#181c24] border border-white/6 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        <span>Daily Citizen Quota</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Configure the maximum complaints an individual citizen can lodge within a rolling 24-hour cycle.
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleLimitChange(maxTokens - 1)}
                          disabled={maxTokens <= 1}
                          className="w-9 h-9 rounded-lg bg-[#0c0e14] border border-white/10 hover:bg-white/5 disabled:opacity-40 text-sm font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center bg-[#0c0e14] border border-white/10 py-1.5 rounded-lg">
                          <span className="text-xl font-mono font-semibold text-white">{maxTokens}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">TOKENS / DAY</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLimitChange(maxTokens + 1)}
                          disabled={maxTokens >= 10}
                          className="w-9 h-9 rounded-lg bg-[#0c0e14] border border-white/10 hover:bg-white/5 disabled:opacity-40 text-sm font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Column 2: Grant Tokens */}
                    <div className="space-y-3 bg-[#181c24] border border-white/6 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Grant Auxiliary Quota</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Instantly allocate additional tokens to active citizen sessions for high-priority civic verifications.
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {[1, 3, 5].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => handleGrantTokens(amount)}
                            className="bg-[#0c0e14] border border-white/10 hover:border-white/20 py-2.5 rounded-lg text-center cursor-pointer"
                          >
                            <span className="text-xs font-mono font-semibold text-white block">+{amount}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Tokens</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Live Frequency Report */}
                    <div className="space-y-3 bg-[#181c24] border border-white/6 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <TrendingUp className="w-4 h-4 text-slate-300" />
                        <span>Daily Intake Telemetry</span>
                      </div>
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="flex items-center justify-between border-b border-white/6 pb-1.5">
                          <span className="text-slate-400">Total Submissions Today:</span>
                          <span className="font-mono font-medium text-white">{report.totalComplaintsToday}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/6 pb-1.5">
                          <span className="text-slate-400">Emergency Bypasses:</span>
                          <span className="font-mono font-medium text-amber-400">{report.emergencyBypassesToday} used</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">User Token Balance:</span>
                          <span className="font-mono font-medium text-slate-200">{report.tokensRemaining} / {report.maxTokens}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSidebarTab === "registry" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Nodal Grievance Ledger
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Consolidated record of citizen complaints, ward allocations, and departmental progression
                  </p>
                </div>
                <Badge variant="outline" className="border-white/10 text-slate-300 text-xs font-mono">
                  {complaints.length} Records
                </Badge>
              </div>

              <div className="overflow-x-auto w-full bg-[#12151c] border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                  <thead>
                    <tr className="bg-[#181c24] border-b border-white/8 text-[11px] font-mono text-slate-400 uppercase">
                      <th className="py-3 px-4">Docket ID</th>
                      <th className="py-3 px-4">Citizen</th>
                      <th className="py-3 px-4 w-[28%]">Subject & Category</th>
                      <th className="py-3 px-4">Department & Officer</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          No registered grievances in ledger.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                            {c.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200">{c.citizenName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{c.citizenPhone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 line-clamp-1">{c.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.category}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200">{c.department}</div>
                            <div className="text-[11px] text-slate-400">{c.assignedOfficer}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              c.priority === "high" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              c.priority === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                              c.status === "resolved" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                              c.status === "escalated" ? "text-red-400 bg-red-500/10 border border-red-500/20" :
                              "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                            }`}>
                              {c.status.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
              {/* Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#12151c] border border-white/10 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-semibold text-white">{citizens.length}</span>
                      <span className="text-[10px] text-slate-400 block font-mono uppercase">Registered Citizens</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#12151c] border border-white/10 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-semibold text-emerald-400">Active</span>
                      <span className="text-[10px] text-slate-400 block font-mono uppercase">Auth Service</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#12151c] border border-white/10 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Landmark className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <span className="text-xl font-mono font-semibold text-white">Live Sync</span>
                      <span className="text-[10px] text-slate-400 block font-mono uppercase">State Telemetry</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <div className="bg-[#12151c] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Registered Citizen Directory
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspect citizen identification, contact coordinates, and entry records
                    </p>
                  </div>
                  
                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={citizenSearchQuery}
                      onChange={(e) => setCitizenSearchQuery(e.target.value)}
                      placeholder="Search citizen or mobile..."
                      className="w-full bg-[#0c0e14] border border-white/10 rounded-lg py-1.5 pl-3 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                    <thead>
                      <tr className="border-b border-white/8 text-[11px] font-mono text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Citizen Name</th>
                        <th className="py-2.5 px-3">Citizen ID</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Mobile</th>
                        <th className="py-2.5 px-3 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCitizens.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-500">
                            {citizenSearchQuery ? "No matching citizens found." : "No registered citizens found in store."}
                          </td>
                        </tr>
                      ) : (
                        filteredCitizens.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3 font-medium text-slate-200">
                              {c.name}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                              {c.id ? c.id.substring(0, 10) : "N/A"}
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {c.email}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-300">
                              {c.mobile || "N/A"}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                              {c.created_at || c.createdAt
                                ? new Date(c.created_at || c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
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
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">System Configuration Parameters</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Global environmental parameters and API endpoints are managed by UP municipal infrastructure.
              </p>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
