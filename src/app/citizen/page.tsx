"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/shared/Navbar";
import { ComplaintForm } from "@/components/citizen/ComplaintForm";
import { TrackingTimeline } from "@/components/citizen/TrackingTimeline";
import { mockComplaints } from "@/data/complaints";

const priorityIcon = {
  high: AlertTriangle,
  medium: Clock,
  low: CheckCircle2,
};

export default function CitizenDashboard() {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const complaint = mockComplaints.find((c) => c.id === selectedComplaint);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gov-blue to-ai-purple flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Citizen Portal</h1>
                <p className="text-sm text-muted-foreground">
                  File and track your complaints
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="new" className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 p-1">
              <TabsTrigger value="new" className="gap-2 data-[state=active]:bg-background">
                <Plus className="w-4 h-4" />
                New Complaint
              </TabsTrigger>
              <TabsTrigger value="track" className="gap-2 data-[state=active]:bg-background">
                <Search className="w-4 h-4" />
                My Complaints
              </TabsTrigger>
            </TabsList>

            {/* New Complaint Tab */}
            <TabsContent value="new">
              <ComplaintForm />
            </TabsContent>

            {/* Track Complaints Tab */}
            <TabsContent value="track">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Complaint List */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                    Your Complaints ({mockComplaints.length})
                  </h3>
                  {mockComplaints.map((c, i) => {
                    const PIcon = priorityIcon[c.priority];
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
                            {c.priority}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-foreground/90 mb-1.5 line-clamp-1 leading-snug">
                          {c.title}
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
                            {c.status.replace(/_/g, " ")}
                          </span>
                          <span className="ml-auto font-semibold">
                            {c.area}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
 
                {/* Complaint Detail */}
                <div className="lg:col-span-3">
                  {complaint ? (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      {/* Header card */}
                      <div className="glass-premium rounded-2xl p-6 relative overflow-hidden">
                        {/* Soft decorative background orb */}
                        <div className="absolute -right-12 -top-12 w-28 h-28 bg-primary/5 rounded-full filter blur-xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-sm font-bold text-muted-foreground/70">
                            {complaint.id}
                          </span>
                          <Badge className={`priority-${complaint.priority} font-bold text-xs uppercase px-2.5 py-0.5`}>
                            {complaint.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground/90 mb-3">{complaint.title}</h2>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed mb-5">
                          {complaint.description}
                        </p>
 
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Department</div>
                            <div className="font-bold text-sm text-foreground/90">{complaint.department}</div>
                          </div>
                          <div className="bg-muted/30 rounded-xl p-4 border border-border/20">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Area</div>
                            <div className="font-bold text-sm text-foreground/90">{complaint.area}</div>
                          </div>
                        </div>
                      </div>
 
                      {/* AI Summary */}
                      <div className="glass-card rounded-2xl p-6 bg-ai-purple/3 border border-ai-purple/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-5 h-5 text-ai-purple animate-pulse" />
                          <span className="font-bold text-sm text-foreground/90">AI Officer Summary</span>
                          <Badge variant="outline" className="text-xs ml-auto border-ai-purple/30 text-ai-purple bg-ai-purple/5 font-semibold">
                            {Math.round(complaint.aiConfidence * 100)}% Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed font-semibold bg-background/40 border border-ai-purple/10 rounded-xl p-4 shadow-inner">
                          {complaint.aiSummary}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="glass-card rounded-2xl p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-primary" />
                          Tracking Timeline
                        </h3>
                        <TrackingTimeline events={complaint.timeline} />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <ArrowUpRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Select a Complaint</h3>
                      <p className="text-sm text-muted-foreground">
                        Click on any complaint to view details and tracking timeline.
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
