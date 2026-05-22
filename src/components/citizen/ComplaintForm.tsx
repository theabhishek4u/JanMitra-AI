"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  MapPin,
  Upload,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { classifyComplaint, simulateAIProcessing } from "@/lib/ai";
import type { AIClassification } from "@/types";

export function ComplaintForm() {
  const [step, setStep] = useState<"input" | "processing" | "result">("input");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; area: string } | null>(null);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  const detectLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            area: "Gomti Nagar, Lucknow", // Simulated reverse geocode
          });
        },
        () => {
          setLocation({ lat: 26.8567, lng: 80.9462, area: "Lucknow, UP" });
        }
      );
    } else {
      setLocation({ lat: 26.8567, lng: 80.9462, area: "Lucknow, UP" });
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice input
      setText("Gomti Nagar is full of garbage. There has been no sanitation cleaning for the past week.");
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setText("Gomti Nagar is full of garbage. There has been no sanitation cleaning for the past week.");
      }, 3000);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setStep("processing");
    setProcessingStep(0);

    // Simulate AI processing with visual steps
    const steps = [
      () => setProcessingStep(1), // Understanding text
      () => setProcessingStep(2), // Detecting category
      () => setProcessingStep(3), // Assessing priority
      () => setProcessingStep(4), // Routing department
      () => setProcessingStep(5), // Generating summary
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      steps[i]();
    }

    await new Promise((r) => setTimeout(r, 400));

    const result = classifyComplaint(text);
    setClassification(result);
    setStep("result");
  };

  const reset = () => {
    setStep("input");
    setText("");
    setClassification(null);
    setProcessingStep(0);
  };

  const processingSteps = [
    { label: "Understanding complaint text..." },
    { label: "Detecting complaint category..." },
    { label: "Assessing priority & urgency..." },
    { label: "Routing to department..." },
    { label: "Generating officer summary..." },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Complaint text */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Describe Your Complaint</h3>
                <span className="text-xs text-muted-foreground">(English Supported)</span>
              </div>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your complaint here..."
                className="min-h-[120px] text-base resize-none border-2 focus:border-primary/40 transition-colors"
              />

              {/* Voice & Upload row */}
              <div className="flex items-center gap-3">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                  className="gap-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span className="animate-pulse">Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Voice Input
                    </>
                  )}
                </Button>

                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 ml-auto"
                  onClick={detectLocation}
                >
                  <MapPin className="w-4 h-4" />
                  {location ? location.area : "Detect Location"}
                </Button>
              </div>

              {location && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 text-sm text-trust-green"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Location detected: {location.area}
                </motion.div>
              )}
            </div>

            {/* Personal details */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Your Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-2 focus:border-primary/40"
                />
                <Input
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-2 focus:border-primary/40"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="w-full h-12 bg-gradient-to-r from-gov-blue to-gov-blue-light text-white shadow-lg shadow-gov-blue/25 text-base font-semibold group"
            >
              <Brain className="w-5 h-5 mr-2" />
              Submit & Analyze with AI
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: AI Processing Animation */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl p-8 text-center space-y-6"
          >
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-ai-purple/20 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-10 h-10 text-ai-purple" />
            </motion.div>

            <div>
              <h3 className="text-xl font-bold mb-1">AI is Analyzing Your Complaint</h3>
              <p className="text-sm text-muted-foreground">Classifying categories, detecting urgency & routing in real-time...</p>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              {processingSteps.map((s, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                    processingStep > i
                      ? "text-trust-green"
                      : processingStep === i
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {processingStep > i ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : processingStep === i ? (
                    <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current flex-shrink-0" />
                  )}
                  <span>{s.label}</span>
                </motion.div>
              ))}
            </div>

            <Progress value={(processingStep / 5) * 100} className="h-2 max-w-md mx-auto" />
          </motion.div>
        )}

        {/* Step 3: Classification Result */}
        {step === "result" && classification && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Success banner */}
            <motion.div
              className="glass-card rounded-2xl p-6 border-trust-green/30 bg-trust-green/5"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-trust-green/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-trust-green" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Complaint Registered Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: JM-2026-011 • Track your complaint status anytime
                  </p>
                </div>
              </div>
            </motion.div>

            {/* AI Classification Details */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-ai-purple" />
                <h3 className="font-semibold">AI Classification Results</h3>
                <Badge variant="outline" className="ml-auto text-xs">
                  {Math.round(classification.confidence * 100)}% Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</div>
                  <div className="font-semibold">{classification.category}</div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Priority</div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold priority-${classification.priority}`}>
                      {classification.priority === "high" && <AlertTriangle className="w-3 h-3" />}
                      {classification.priority === "medium" && <Clock className="w-3 h-3" />}
                      {classification.priority === "low" && <CheckCircle2 className="w-3 h-3" />}
                      {classification.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Department</div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gov-blue" />
                    {classification.department}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Est. Resolution</div>
                  <div className="font-semibold">{classification.predictedResolutionDays} days</div>
                  <div className="text-xs text-muted-foreground">{classification.urgency}</div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-ai-purple" />
                <h3 className="font-semibold">AI Officer Summary</h3>
              </div>
              <div className="bg-ai-purple/5 rounded-xl p-4 border border-ai-purple/15 text-sm leading-relaxed">
                {classification.summary}
              </div>
            </div>

            {/* Citizen notification */}
            <div className="glass-card rounded-2xl p-5 border-gov-blue/20 bg-gov-blue/5">
              <div className="flex items-center gap-2 text-sm">
                <Send className="w-4 h-4 text-gov-blue" />
                <span className="font-medium">Notification sent:</span>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">
                &ldquo;Your complaint has been successfully forwarded to {classification.department}. Complaint ID: JM-2026-011&rdquo;
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1">
                File Another Complaint
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-gov-blue to-gov-blue-light text-white">
                Track This Complaint
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
