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
                    return (
                      <motion.div
                        key={c.id}
                        className={`glass-card rounded-xl p-4 cursor-pointer transition-all ${
                          selectedComplaint === c.id
                            ? "ring-2 ring-primary/40 border-primary/30"
                            : ""
                        }`}
                        onClick={() => setSelectedComplaint(c.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {c.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs priority-${c.priority}`}
                          >
                            <PIcon className="w-3 h-3 mr-1" />
                            {c.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-1 line-clamp-1">
                          {c.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className="w-2 h-2 rounded-full"
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
                          <span className="ml-auto">
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Header card */}
                      <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-sm text-muted-foreground">
                            {complaint.id}
                          </span>
                          <Badge className={`priority-${complaint.priority}`}>
                            {complaint.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <h2 className="text-xl font-bold mb-2">{complaint.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          {complaint.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/40 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground">Department</div>
                            <div className="font-medium text-sm">{complaint.department}</div>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground">Area</div>
                            <div className="font-medium text-sm">{complaint.area}</div>
                          </div>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="w-4 h-4 text-ai-purple" />
                          <span className="font-semibold text-sm">AI Summary</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {Math.round(complaint.aiConfidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
