"use client";

import { useState, useCallback, useRef } from "react";
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
  ChevronRight,
  X,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { classifyComplaint } from "@/lib/ai";
import type { AIClassification } from "@/types";

export function ComplaintForm({ language = "en" }: { language?: "en" | "hi" }) {
  const isHi = language === "hi";
  const [step, setStep] = useState<"input" | "processing" | "result">("input");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; area: string } | null>(null);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dict = {
    describeTitle: isHi ? "अपनी शिकायत का विवरण दें" : "Describe Your Complaint",
    voiceRecording: isHi ? "रिकॉर्डिंग चालू है..." : "Recording...",
    voiceInput: isHi ? "आवाज द्वारा इनपुट" : "Voice Input",
    uploadPhoto: isHi ? "तस्वीर अपलोड करें" : "Upload Photo",
    photoAttached: isHi ? "तस्वीर संलग्न है" : "Photo Attached",
    detectLocation: isHi ? "स्थान का पता लगाएं" : "Detect Location",
    pinnedArea: isHi ? "रिवर्स-जियोकोडेड पिन किया गया क्षेत्र" : "Reverse-Geocoded Pinned Area",
    yourDetails: isHi ? "आपका विवरण" : "Your Details",
    namePlaceholder: isHi ? "आपका नाम" : "Your Name",
    phonePlaceholder: isHi ? "फ़ोन नंबर" : "Phone Number",
    submitBtn: isHi ? "जमा करें और AI से विश्लेषण करें" : "Submit & Analyze with AI",
    analyzingTitle: isHi ? "AI आपकी शिकायत का विश्लेषण कर रहा है" : "AI is Analyzing Your Complaint",
    analyzingDesc: isHi ? "वास्तविक समय में श्रेणियों का वर्गीकरण, तात्कालिकता का पता लगाना और विभाग आवंटन..." : "Classifying categories, detecting urgency & routing in real-time...",
    successTitle: isHi ? "शिकायत सफलतापूर्वक दर्ज की गई!" : "Complaint Registered Successfully!",
    trackRealtime: isHi ? "वास्तविक समय में प्रगति को ट्रैक करें" : "Track progress in real-time",
    photoAttachment: isHi ? "फोटो संलग्नक" : "Photo Attachment",
    scannedAI: isHi ? "AI विज़न द्वारा स्कैन किया गया" : "Scanned by AI Vision",
    aiClassification: isHi ? "AI वर्गीकरण परिणाम" : "AI Classification Results",
    confidence: isHi ? "सटीकता" : "Confidence",
    category: isHi ? "श्रेणी" : "Category",
    priority: isHi ? "प्राथमिकता" : "Priority",
    department: isHi ? "विभाग" : "Department",
    estResolution: isHi ? "अनुमानित समाधान समय" : "Est. Resolution",
    days: isHi ? "दिन" : "days",
    aiOfficerSummary: isHi ? "AI अधिकारी सारांश" : "AI Officer Summary",
    notificationSent: isHi ? "नागरिक एसएमएस सूचना प्रेषित:" : "Notification sent:",
    fileAnother: isHi ? "एक और शिकायत दर्ज करें" : "File Another Complaint",
    trackThis: isHi ? "शिकायत ट्रैक करें" : "Track This Complaint",
    placeholderText: isHi ? "समस्या का विस्तार से वर्णन करें (जैसे, गोमती नगर मुख्य मार्ग पर 3 दिनों से स्ट्रीट लाइट खराब है...)" : "Describe the issue in detail (e.g., Streetlight broken on Main Road Gomti Nagar for 3 days...)",
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
        if (!text.trim()) {
          if (isHi) {
            setText(`[AI विज़न स्कैन: फोटो अपलोड (${file.name})] नागरिक समस्या का पता चला। कृपया शीघ्र समाधान करें।`);
          } else {
            setText(`[AI Vision Scan: Photo uploaded (${file.name})] Civic issue detected. Please resolve immediately.`);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const detectLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            area: isHi ? "गोमती नगर, लखनऊ" : "Gomti Nagar, Lucknow", // Simulated reverse geocode
          });
        },
        () => {
          setLocation({ lat: 26.8567, lng: 80.9462, area: isHi ? "लखनऊ, उत्तर प्रदेश" : "Lucknow, UP" });
        }
      );
    } else {
      setLocation({ lat: 26.8567, lng: 80.9462, area: isHi ? "लखनऊ, उत्तर प्रदेश" : "Lucknow, UP" });
    }
  }, [isHi]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice input
      if (isHi) {
        setText("गोमती नगर में चारों तरफ कचरा फैला हुआ है। पिछले एक हफ्ते से सफाई नहीं हुई है और बहुत बदबू आ रही है।");
      } else {
        setText("Gomti Nagar is full of garbage. There has been no sanitation cleaning for the past week. It smells very bad.");
      }
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        if (isHi) {
          setText("गोमती नगर में चारों तरफ कचरा फैला हुआ है। पिछले एक हफ्ते से सफाई नहीं हुई है और बहुत बदबू आ रही है।");
        } else {
          setText("Gomti Nagar is full of garbage. There has been no sanitation cleaning for the past week. It smells very bad.");
        }
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
    removePhoto();
  };

  const processingSteps = isHi
    ? [
        { label: "शिकायत पाठ का विश्लेषण..." },
        { label: "शिकायत श्रेणी की पहचान..." },
        { label: "प्राथमिकता एवं तात्कालिकता का आकलन..." },
        { label: "संबद्ध विभाग को अग्रेषण..." },
        { label: "अधिकारी सारांश का सृजन..." },
      ]
    : [
        { label: "Understanding complaint text..." },
        { label: "Detecting complaint category..." },
        { label: "Assessing priority & urgency..." },
        { label: "Routing to department..." },
        { label: "Generating officer summary..." },
      ];

  const getPriorityLabel = (p: string) => {
    if (p === "high") return isHi ? "उच्च (HIGH)" : "HIGH";
    if (p === "medium") return isHi ? "मध्यम (MEDIUM)" : "MEDIUM";
    return isHi ? "निम्न (LOW)" : "LOW";
  };

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
            <div className="glass-card premium-glow-border rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground/90">{dict.describeTitle}</h3>
                <span className="text-xs text-muted-foreground/80">{isHi ? "(अंग्रेजी भी समर्थित)" : "(Hindi Supported)"}</span>
              </div>

              <div className={`relative rounded-xl transition-all duration-500 p-[1.5px] ${isFocused ? "bg-gradient-to-r from-gov-blue via-ai-purple to-trust-green shadow-[0_0_20px_rgba(124,58,237,0.25)] scale-[1.002]" : "bg-border/40"}`}>
                <Textarea
                  value={text}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={dict.placeholderText}
                  className="min-h-[140px] text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 bg-card/95 w-full rounded-[10.5px] transition-all duration-300 placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handlePhotoChange}
                accept="image/*"
              />

              {/* Photo preview block */}
              {photo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3.5 p-2.5 pr-4 bg-ai-purple/[0.03] border border-ai-purple/20 rounded-2xl w-fit relative overflow-hidden"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-ai-purple/30 bg-black/5 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    <div className="holo-scanline animate-holo-scan" />
                  </div>
                  <div className="flex-1 min-w-[130px] max-w-[220px]">
                    <p className="text-xs font-bold text-foreground/90 truncate">{photoName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-trust-green animate-pulse" />
                      <p className="text-[10px] text-trust-green font-bold uppercase tracking-wider">
                        {isHi ? "AI स्कैन सफल • 1.2 MB" : "AI Scan OK • 1.2 MB"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-1.5 rounded-lg hover:bg-danger-red/10 text-muted-foreground hover:text-danger-red transition-all cursor-pointer relative z-10 active:scale-90"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Voice & Upload row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                  className="gap-2 rounded-xl transition-all font-semibold active:scale-95 cursor-pointer"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 text-white" />
                      <span className="animate-pulse text-white">{dict.voiceRecording}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-primary" />
                      {dict.voiceInput}
                    </>
                  )}
                </Button>

                {isRecording && (
                  <div className="flex items-end gap-1 h-8 px-2.5 pb-2 border border-ai-purple/20 bg-ai-purple/5 rounded-xl animate-fade-in">
                    {[...Array(6)].map((_, i) => (
                      <span key={i} className="soundwave-bar" />
                    ))}
                  </div>
                )}

                <Button 
                  type="button"
                  variant={photo ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={handlePhotoUploadClick}
                  className={`gap-2 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer ${
                    photo ? "border-primary/45 bg-primary/10 text-primary hover:bg-primary/15" : ""
                  }`}
                >
                  <Upload className={`w-4 h-4 ${photo ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  {photo ? dict.photoAttached : dict.uploadPhoto}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 ml-auto rounded-xl font-semibold transition-all hover:bg-primary/5 active:scale-95 cursor-pointer"
                  onClick={detectLocation}
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  {location ? location.area : dict.detectLocation}
                </Button>
              </div>

              {location && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-trust-green/[0.02] border border-trust-green/20 rounded-xl mt-3 animate-fade-in relative overflow-hidden"
                >
                  {/* Dynamic light green highlight */}
                  <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-trust-green/5 rounded-full filter blur-lg pointer-events-none" />
                  
                  <div className="flex items-center gap-3">
                    {/* Pulsing Radar Dot Container */}
                    <div className="w-6 h-6 rounded-full bg-trust-green/20 flex items-center justify-center flex-shrink-0 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-trust-green radar-glow relative" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">{dict.pinnedArea}</span>
                      <span className="text-sm font-bold text-foreground/90">{location.area}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant="outline" className="font-mono text-[10px] border-trust-green/30 text-trust-green bg-trust-green/5 font-bold px-2 py-0.5">
                      LAT: {location.lat.toFixed(4)}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px] border-trust-green/30 text-trust-green bg-trust-green/5 font-bold px-2 py-0.5">
                      LNG: {location.lng.toFixed(4)}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Personal details */}
            <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-4">
              <h3 className="font-bold text-base text-foreground/90 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {dict.yourDetails}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    placeholder={dict.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 border border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/40 rounded-xl bg-background/30 h-11 transition-all duration-300 focus:scale-[1.005]"
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    placeholder={dict.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 border border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/40 rounded-xl bg-background/30 h-11 transition-all duration-300 focus:scale-[1.005]"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-gov-blue via-ai-purple to-gov-blue-light bg-[length:200%_auto] hover:bg-right text-white shadow-xl shadow-gov-blue/25 hover:shadow-gov-blue/45 hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 text-base font-extrabold group cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin-slow text-white" />
                <span>{dict.submitBtn}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          </motion.div>
        )}

        {/* Step 2: AI Processing Animation */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="glass-card rounded-2xl p-8 sm:p-10 text-center space-y-6 scanning-laser-container neon-glow-ai"
          >
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-ai-purple/20 via-primary/10 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center shadow-lg"
              animate={{ 
                rotate: 360,
                boxShadow: ["0 0 0 0px rgba(124, 58, 237, 0.2)", "0 0 0 12px rgba(124, 58, 237, 0)", "0 0 0 0px rgba(124, 58, 237, 0.2)"]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Brain className="w-10 h-10 text-ai-purple animate-pulse" />
            </motion.div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gov-blue to-ai-purple bg-clip-text text-transparent">{dict.analyzingTitle}</h3>
              <p className="text-sm text-muted-foreground/80">{dict.analyzingDesc}</p>
            </div>

            <div className="max-w-md mx-auto space-y-3 pt-3">
              {processingSteps.map((s, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 font-medium ${
                    processingStep > i
                      ? "text-trust-green"
                      : processingStep === i
                      ? "text-ai-purple scale-[1.02]"
                      : "text-muted-foreground/35"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {processingStep > i ? (
                    <div className="w-5 h-5 rounded-full bg-trust-green/10 flex items-center justify-center text-trust-green flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : processingStep === i ? (
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-4 h-4 text-ai-purple animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-current/30 flex-shrink-0 flex items-center justify-center" />
                  )}
                  <span>{s.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Glowing Gradient Custom Progress Bar */}
            <div className="max-w-md mx-auto h-2 bg-muted/50 rounded-full overflow-hidden p-0.5 border border-border/20">
              <motion.div 
                className="h-full bg-gradient-to-r from-gov-blue via-ai-purple to-trust-green rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${(processingStep / 5) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Classification Result */}
        {step === "result" && classification && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 animate-fade-in"
          >
            {/* Success banner */}
            <motion.div
              className="glass-premium rounded-2xl p-6 border-l-4 border-l-trust-green neon-glow-success bg-trust-green/5"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-trust-green/10 flex items-center justify-center flex-shrink-0"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-trust-green" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-foreground/90">{dict.successTitle}</h3>
                  <p className="text-sm text-muted-foreground/80">
                    {isHi ? "आईडी:" : "ID:"} <span className="font-mono font-bold text-foreground">JM-2026-011</span> • {dict.trackRealtime}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Photo Attachment receipt */}
            {photo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-border/20 bg-muted/10 relative overflow-hidden"
              >
                <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-trust-green/5 rounded-full filter blur-lg pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Submitted photo" className="w-16 h-16 rounded-xl object-cover border border-border/30 shadow-sm" />
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{dict.photoAttachment}</h4>
                  <p className="text-sm font-semibold text-foreground/80 truncate max-w-[220px]">{photoName}</p>
                  <span className="text-[10px] inline-flex items-center gap-1 font-bold text-trust-green bg-trust-green/10 px-2.5 py-0.5 rounded-full mt-1.5 border border-trust-green/20">
                    <Sparkles className="w-3 h-3 text-trust-green animate-pulse" />
                    {dict.scannedAI}
                  </span>
                </div>
              </motion.div>
            )}

            {/* AI Classification Details */}
            <div className="glass-card premium-glow-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ai-purple animate-pulse" />
                <h3 className="font-bold text-base text-foreground/90">{dict.aiClassification}</h3>
                <Badge variant="outline" className="ml-auto text-xs border-ai-purple/35 text-ai-purple bg-ai-purple/5 font-semibold">
                  {Math.round(classification.confidence * 100)}% {dict.confidence}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-xl p-4 border border-border/20 transition-all hover:bg-muted/40">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{dict.category}</div>
                  <div className="font-bold text-sm text-foreground/90">{isHi ? classification.categoryHi : classification.category}</div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/20 transition-all hover:bg-muted/40">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{dict.priority}</div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold priority-${classification.priority}`}>
                      {classification.priority === "high" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {classification.priority === "medium" && <Clock className="w-3.5 h-3.5" />}
                      {classification.priority === "low" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {getPriorityLabel(classification.priority)}
                    </span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/20 transition-all hover:bg-muted/40">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{dict.department}</div>
                  <div className="font-bold text-sm text-foreground/90 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gov-blue" />
                    {isHi ? classification.departmentHi : classification.department}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/20 transition-all hover:bg-muted/40">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{dict.estResolution}</div>
                  <div className="font-bold text-sm text-foreground/90">{classification.predictedResolutionDays} {dict.days}</div>
                  <div className="text-[11px] text-muted-foreground/80 font-medium">{isHi ? "सामान्य प्रसंस्करण समय सीमा" : classification.urgency}</div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="glass-card rounded-2xl p-6 bg-ai-purple/3 border border-ai-purple/10">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-ai-purple" />
                <h3 className="font-bold text-base text-foreground/90">{dict.aiOfficerSummary}</h3>
              </div>
              <div className="bg-background/40 rounded-xl p-4 border border-ai-purple/15 text-sm leading-relaxed text-foreground/90 font-medium shadow-inner">
                {isHi ? classification.summaryHi : classification.summary}
              </div>
            </div>

            {/* Citizen notification */}
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-gov-blue bg-gov-blue/5">
              <div className="flex items-center gap-2 text-sm text-gov-blue font-bold">
                <Send className="w-4 h-4" />
                <span>{dict.notificationSent}</span>
              </div>
              <p className="text-sm mt-2 text-muted-foreground leading-relaxed font-semibold">
                &ldquo;{isHi ? `आपकी शिकायत सफलतापूर्वक संबंधित विभाग (${classification.departmentHi}) को भेज दी गई है। शिकायत आईडी: JM-2026-011` : `Your complaint has been successfully forwarded to ${classification.department}. Complaint ID: JM-2026-011`}&rdquo;
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="button" onClick={reset} variant="outline" className="flex-1 rounded-xl h-11 font-bold text-sm">
                {dict.fileAnother}
              </Button>
              <Button type="button" className="flex-1 rounded-xl h-11 font-bold text-sm bg-gradient-to-r from-gov-blue to-gov-blue-light text-white shadow-lg shadow-gov-blue/20">
                {dict.trackThis}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
