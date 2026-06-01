"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
  Brain,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building,
  CheckCircle,
  FileText,
  Volume2,
  MapPin,
  Clock,
  UserCheck,
  AlertCircle,
  Undo2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PresetComplaint {
  text: string;
  lang: string;
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  dept: string;
  officer: string;
  summaryHi: string;
  summaryEn: string;
  actions: string[];
}

const presets: PresetComplaint[] = [
  {
    text: "गोमती नगर में सड़क के किनारे कचरे का ढेर लगा है, बदबू आ रही है और आवारा जानवर घूम रहे हैं। कोई उठाने नहीं आ रहा।",
    lang: "Hindi / Devanagari",
    category: "Sanitation & Waste Management",
    priority: "HIGH",
    dept: "Lucknow Nagar Nigam (Zone 4)",
    officer: "Shri Rajesh Kumar (Chief Sanitation Inspector)",
    summaryHi: "गोमती नगर में कचरे के ढेर और उससे फैलने वाली बदबू के कारण स्वच्छता की गंभीर समस्या है।",
    summaryEn: "Severe sanitation concern in Gomti Nagar due to accumulation of garbage heaps and foul odor.",
    actions: [
      "Alert sent to Ward Inspector (Smt. Rekha Devi)",
      "Sanitation pickup vehicle (UP-32-EG-4521) routed for immediate dispatch",
      "SMS alert triggered to Nodal Officer",
      "Scheduled auto-escalation to Ward Commissioner in 48 hours if unresolved"
    ]
  },
  {
    text: "Hazratganj main crossing ke pass water pipeline leak ho gayi hai, subah se hazaron gallon peene ka paani sadak par beh raha hai.",
    lang: "Hinglish / Roman Hindi",
    category: "Water Supply & Sewage Management",
    priority: "CRITICAL",
    dept: "Lucknow Jal Nigam (Zone 1)",
    officer: "Er. Alok Srivastava (Executive Engineer)",
    summaryHi: "हज़रतगंज चौराहे के पास मुख्य पेयजल पाइपलाइन लीक होने से भारी जलभराव और पानी की बर्बादी हो रही है।",
    summaryEn: "Drinking water leakage near Hazratganj crossing causing severe flooding and massive water wastage.",
    actions: [
      "Water valve shutoff command issued to Hazratganj pumping station",
      "Emergency pipeline repair unit dispatched",
      "Traffic control department notified regarding water logging",
      "Auto-escalated to Chief Engineer Lucknow Jal Sansthan directly due to high wastage volume"
    ]
  },
  {
    text: "Sector 14 streetlights have been completely dark for 5 days. It is very unsafe for women and children to walk after 7 PM.",
    lang: "English / Pure English",
    category: "Public Safety & Infrastructure",
    priority: "MEDIUM",
    dept: "Madhyanchal Vidyut Vitran Nigam (MVVNL)",
    officer: "Shri V. P. Singh (Assistant Engineer, Sector 14)",
    summaryHi: "सेक्टर 14 में पिछले 5 दिनों से स्ट्रीट लाइट खराब होने से सुरक्षा की समस्या उत्पन्न हो गई है।",
    summaryEn: "Streetlights dysfunctional in Sector 14 for the past 5 days, raising public safety concerns.",
    actions: [
      "Maintenance order generated for Sector 14 light pole maintenance",
      "Contractor notified with 24-hour compliance deadline",
      "Citizen safety alert tagged for patrolling route enhancement",
      "Auto-reminder scheduled for Executive Engineer in 72 hours"
    ]
  }
];

export function AIPlayground() {
  const [inputText, setInputText] = useState("");
  const [customText, setCustomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<PresetComplaint | null>(null);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayIndex, setAutoplayIndex] = useState(0);

  // Handle preset selection
  const handlePresetSelect = (preset: PresetComplaint) => {
    setIsAutoplay(false); // Stop autoplay when user manually selects
    setInputText(preset.text);
    setCustomText(preset.text);
    setResult(null);
    setIsAnalyzing(false);
    setStep(0);
  };

  // Run simulated AI analysis
  const runAnalysis = () => {
    setIsAutoplay(false); // Stop autoplay when user manually triggers
    const currentText = inputText || customText;
    if (!currentText) return;
    
    // Fallback if custom text was typed
    let matchedResult = presets.find((p) => p.text === currentText);
    if (!matchedResult) {
      // Generate a mock dynamic response based on custom text
      const lower = currentText.toLowerCase();
      let category = "General Grievance";
      let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
      let dept = "Lucknow District Administration";
      let officer = "Shri Anand Vardhan (SDM Lucknow)";
      let summaryHi = "नागरिक द्वारा दर्ज शिकायत का त्वरित समाधान प्रेषित है।";
      let summaryEn = "Grievance registered and sent to administrative cell for review.";
      let actions = [
        "Complaint categorized under standard priority routing",
        "Dispatched notification to local circle officer",
        "Citizen dashboard tracking link generated"
      ];

      if (lower.includes("sadak") || lower.includes("road") || lower.includes("pothole") || lower.includes("gaddha")) {
        category = "Roads & Infrastructure";
        priority = "HIGH";
        dept = "Public Works Department (PWD UP)";
        officer = "Shri K. K. Yadav (Chief Engineer)";
        summaryHi = "सड़क मरम्मत और गड्ढों के कारण यातायात अवरोध एवं सुरक्षा संबंधी शिकायत।";
        summaryEn = "Road repair and pothole grievance causing safety and transport issues.";
        actions = [
          "Assigned to PWD Lucknow Circle 2 inspector",
          "Geo-tagged road coordinates sent for asphalt scheduling",
          "Scheduled review by Sub-Divisional Engineer"
        ];
      } else if (lower.includes("bijli") || lower.includes("light") || lower.includes("electricity") || lower.includes("wire")) {
        category = "Power & Electricity";
        priority = "HIGH";
        dept = "UP Power Corporation Limited (UPPCL)";
        officer = "Shri S. K. Dwivedi (Sub-Station Officer)";
        summaryHi = "विद्युत तारों या बिजली आपूर्ति बाधित होने के संबंध में शिकायत।";
        summaryEn = "Electricity disruption or hazardous hanging wire complaint.";
        actions = [
          "Lineman crew dispatched for structural check",
          "Sub-station transformer load analysis triggered",
          "Citizen notified of power interruption schedule"
        ];
      }

      matchedResult = {
        text: currentText,
        lang: lower.match(/[\u0900-\u097F]/) ? "Hindi / Devanagari" : "English / Mixed",
        category,
        priority,
        dept,
        officer,
        summaryHi,
        summaryEn,
        actions
      };
    }

    setIsAnalyzing(true);
    setStep(1);

    // Simulated progress steps
    const timer1 = setTimeout(() => setStep(2), 1000);
    const timer2 = setTimeout(() => setStep(3), 2200);
    const timer3 = setTimeout(() => {
      setIsAnalyzing(false);
      setResult(matchedResult);
      setStep(4);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Autoplay loop controller
  useEffect(() => {
    if (!isAutoplay) return;

    let timer: NodeJS.Timeout;

    if (step === 0) {
      // Wait 2.5 seconds before starting the next preset analysis
      timer = setTimeout(() => {
        const nextPreset = presets[autoplayIndex];
        setInputText(nextPreset.text);
        setCustomText(nextPreset.text);
        
        // Start simulation
        setIsAnalyzing(true);
        setStep(1);
      }, 2500);
    } else if (step === 1) {
      timer = setTimeout(() => setStep(2), 1000);
    } else if (step === 2) {
      timer = setTimeout(() => setStep(3), 1200);
    } else if (step === 3) {
      timer = setTimeout(() => {
        setIsAnalyzing(false);
        const currentPreset = presets[autoplayIndex];
        setResult(currentPreset);
        setStep(4);
      }, 1300);
    } else if (step === 4) {
      // Show results for 6 seconds, then reset and advance to next preset
      timer = setTimeout(() => {
        setResult(null);
        setStep(0);
        setInputText("");
        setCustomText("");
        setAutoplayIndex((prev) => (prev + 1) % presets.length);
      }, 6000);
    }

    return () => clearTimeout(timer);
  }, [isAutoplay, step, autoplayIndex]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "text-danger-red bg-danger-red/10 border-danger-red/25";
      case "HIGH": return "text-warning-amber bg-warning-amber/10 border-warning-amber/25";
      case "MEDIUM": return "text-gov-blue-light bg-gov-blue/10 border-gov-blue/25";
      default: return "text-trust-green bg-trust-green/10 border-trust-green/25";
    }
  };

  return (
    <section className="py-24 relative radial-mesh-light border-y border-border/30 overflow-hidden" id="ai-engine">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ai-purple/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-purple/10 border border-ai-purple/20 text-xs font-bold text-ai-purple uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Simulation
            </span>
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                isAutoplay
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-300"
              }`}
              title={isAutoplay ? "Click to pause autoplay" : "Click to resume autoplay"}
            >
              <span className={`w-2 h-2 rounded-full ${isAutoplay ? "bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981]" : "bg-slate-500"}`} />
              Autoplay: {isAutoplay ? "ON" : "OFF"}
            </button>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Test the <span className="gradient-text">JanMitra AI Engine</span> Live
          </h2>
          <p className="text-muted-foreground text-lg">
            Experience our neural router. Type a complaint in Hindi, Hinglish, or English, or click a preset below to see AI analysis in under 5 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl p-6 premium-glow-border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gov-blue" />
                Citizen Input Portal
              </h3>

              {/* Preset buttons */}
              <div className="space-y-2.5 mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select a Sample Complaint
                </label>
                <div className="flex flex-col gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetSelect(p)}
                      className={`text-left p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                        inputText === p.text
                          ? "bg-primary/5 border-primary/40 font-medium text-foreground"
                          : "bg-muted/40 border-border/60 hover:bg-muted/90 hover:border-border text-muted-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-primary">{p.category.split(" (")[0]}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground">
                          {p.lang}
                        </span>
                      </div>
                      <p className="line-clamp-2">{p.text}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Or Write Your Own Complaint
                  </label>
                  {customText && (
                    <button 
                      onClick={() => { setCustomText(""); setInputText(""); setResult(null); }}
                      className="text-xs font-medium text-destructive hover:underline flex items-center gap-1"
                    >
                      <Undo2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="e.g., Gomti Nagar Sector 4 me kal se bijli ki supply cut hai aur transformer se aawaz aa rahi hai..."
                  className={`min-h-[120px] text-sm rounded-xl resize-none ${
                    isAnalyzing ? "pointer-events-none opacity-60" : ""
                  } ${customText ? "ai-active-glow" : ""}`}
                  value={customText}
                  onChange={(e) => {
                    setIsAutoplay(false); // Stop autoplay when user manually writes
                    setCustomText(e.target.value);
                    setInputText(e.target.value);
                  }}
                />
                
                {/* Voice button indicator mock */}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">Hindi & Voice Supported</span>
                  <div className="w-8 h-8 rounded-full bg-ai-purple/10 flex items-center justify-center hover:bg-ai-purple/20 cursor-pointer transition-colors text-ai-purple">
                    <Volume2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  className="w-full bg-linear-to-r from-gov-blue to-ai-purple text-white shadow-lg shadow-gov-blue/20 h-12 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={isAnalyzing || (!inputText && !customText)}
                  onClick={runAnalysis}
                >
                  <Brain className="w-4 h-4" />
                  {isAnalyzing ? "Processing..." : "Trigger AI Diagnostics"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Diagnostic Terminal */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl p-6 min-h-[460px] flex flex-col justify-between premium-glow-border relative overflow-hidden bg-slate-950/20">
              {/* Terminal top control bar */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground ml-2">
                    janmitra-ai://neural-router/diagnostics
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-trust-green rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-trust-green uppercase tracking-widest font-semibold">
                    AI Online
                  </span>
                </div>
              </div>

              {/* State 1: Idle state */}
              {!isAnalyzing && !result && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground animate-float">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-base">Awaiting Grievance Input</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Choose one of the sample tickets on the left or write custom complaints to trigger the AI-Router diagnostics simulation.
                    </p>
                  </div>
                </div>
              )}

              {/* State 2: Analyzing state */}
              {isAnalyzing && (
                <div className="flex-1 flex flex-col justify-center space-y-8 py-8">
                  {/* Text pulse indicator */}
                  <div className="space-y-2 text-center">
                    <div className="text-xs font-mono text-ai-purple uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-ai-purple animate-ping" />
                      Neural Analysis in Progress
                    </div>
                    <p className="text-sm font-semibold max-w-md mx-auto line-clamp-1 italic text-muted-foreground">
                      &ldquo;{inputText || customText}&rdquo;
                    </p>
                  </div>

                  {/* Analysis Timeline simulation */}
                  <div className="max-w-md mx-auto w-full space-y-6">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        step >= 1
                          ? "bg-ai-purple/20 border-ai-purple text-ai-purple-light shadow-[0_0_12px_rgba(124,58,237,0.25)] animate-pulse"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}>
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${step >= 1 ? "text-slate-100" : "text-slate-500"}`}>
                            Language Parsing & Sentiment
                          </span>
                          {step === 1 ? (
                            <span className="text-[9px] font-mono text-ai-purple-light animate-pulse font-bold">ACTIVE</span>
                          ) : step > 1 ? (
                            <span className="text-[9px] font-mono text-trust-green font-bold flex items-center gap-0.5">✓ READY</span>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-600 font-bold">QUEUED</span>
                          )}
                        </div>
                        <div className="h-1.5 bg-slate-900/60 border border-slate-800/40 rounded-full mt-1.5 overflow-hidden">
                          {step >= 1 && (
                            <motion.div 
                              className="h-full bg-linear-to-r from-ai-purple to-violet-500 shadow-[0_0_8px_#7c3aed]" 
                              initial={{ width: 0 }} 
                              animate={{ width: step === 1 ? "65%" : "100%" }}
                              transition={{ duration: 1 }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                          {step === 1 ? "Extracting semantic structure and vocabulary NLP tokens..." : step > 1 ? "Parsed successfully (Confidence: 99.4%)" : "Awaiting thread trigger..."}
                        </span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        step >= 2
                          ? "bg-gov-blue/20 border-gov-blue text-gov-blue-light shadow-[0_0_12px_rgba(29,78,216,0.25)] animate-pulse"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}>
                        <Brain className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${step >= 2 ? "text-slate-100" : "text-slate-500"}`}>
                            Grievance Categorization & Urgency Analysis
                          </span>
                          {step === 2 ? (
                            <span className="text-[9px] font-mono text-gov-blue-light animate-pulse font-bold">ACTIVE</span>
                          ) : step > 2 ? (
                            <span className="text-[9px] font-mono text-trust-green font-bold flex items-center gap-0.5">✓ READY</span>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-600 font-bold">QUEUED</span>
                          )}
                        </div>
                        <div className="h-1.5 bg-slate-900/60 border border-slate-800/40 rounded-full mt-1.5 overflow-hidden">
                          {step >= 2 && (
                            <motion.div 
                              className="h-full bg-linear-to-r from-gov-blue to-blue-500 shadow-[0_0_8px_#1d4ed8]" 
                              initial={{ width: 0 }} 
                              animate={{ width: step === 2 ? "65%" : "100%" }}
                              transition={{ duration: 1.2 }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                          {step === 2 ? "Evaluating threat levels, incident severity, and intent category..." : step > 2 ? "Categorized and classified successfully" : "Awaiting predecessor completion..."}
                        </span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        step >= 3
                          ? "bg-trust-green/20 border-trust-green text-trust-green-light shadow-[0_0_12px_rgba(16,185,129,0.25)] animate-pulse"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}>
                        <Building className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${step >= 3 ? "text-slate-100" : "text-slate-500"}`}>
                            Smart Department Jurisdiction Matching
                          </span>
                          {step === 3 ? (
                            <span className="text-[9px] font-mono text-trust-green-light animate-pulse font-bold">ACTIVE</span>
                          ) : step > 3 ? (
                            <span className="text-[9px] font-mono text-trust-green font-bold flex items-center gap-0.5">✓ READY</span>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-600 font-bold">QUEUED</span>
                          )}
                        </div>
                        <div className="h-1.5 bg-slate-900/60 border border-slate-800/40 rounded-full mt-1.5 overflow-hidden">
                          {step >= 3 && (
                            <motion.div 
                              className="h-full bg-linear-to-r from-trust-green to-emerald-500 shadow-[0_0_8px_#10b981]" 
                              initial={{ width: 0 }} 
                              animate={{ width: step === 3 ? "70%" : "100%" }}
                              transition={{ duration: 1.3 }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                          {step === 3 ? "Performing geodesic database routing and mapping officers..." : step > 3 ? "Nodal officer dispatch route successfully built" : "Awaiting predecessor completion..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* State 3: Result Showcase */}
              {!isAnalyzing && result && (
                <div className="flex-1 flex flex-col justify-between space-y-6 animate-scale-in">
                  {/* High-Tech Diagnostic Verdict Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Card 1: Classification & Severity */}
                    <div className="glass-premium border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DIAGNOSTIC CATEGORY</span>
                        <Brain className="w-3.5 h-3.5 text-ai-purple animate-pulse" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-black text-slate-850 dark:text-white line-clamp-1">{result.category}</div>
                        <Badge 
                          className={`font-black border text-[9px] px-2 py-0.5 ${getPriorityColor(result.priority)}`}
                          variant="outline"
                        >
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          {result.priority} SEVERITY
                        </Badge>
                      </div>
                    </div>

                    {/* Card 2: Jurisdiction & Nodal Officer */}
                    <div className="glass-premium border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ROUTING JURISDICTION</span>
                        <MapPin className="w-3.5 h-3.5 text-gov-blue" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-black text-slate-850 dark:text-white line-clamp-1">{result.dept}</div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-trust-green" />
                          {result.officer.split(" (")[0]}
                        </div>
                      </div>
                    </div>

                    {/* Card 3: NLP Telemetry & Accuracy */}
                    <div className="glass-premium border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ENGINE METRICS</span>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">Accuracy: 99.1%</div>
                        <div className="text-[9px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">{result.lang}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-language Abstract & Translation */}
                  <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Grievance Abstract (Dual-Language Summary)</span>
                      <span className="text-[9px] font-mono text-ai-purple dark:text-ai-purple-light font-black border border-ai-purple/20 bg-ai-purple/5 px-2 py-0.5 rounded">NATURAL LANGUAGE NLP</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-xl p-3">
                        <div className="text-[9.5px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span>English Translation</span>
                          <span className="text-[8px] font-mono text-slate-500">ISO-EN</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed italic">
                          &ldquo;{result.summaryEn}&rdquo;
                        </p>
                      </div>

                      <div className="bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-xl p-3">
                        <div className="text-[9.5px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span>हिंदी सारांश (Hindi Summary)</span>
                          <span className="text-[8px] font-mono text-slate-500">ISO-HI</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed italic">
                          &ldquo;{result.summaryHi}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Action Execution Checklist */}
                  <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-warning-amber" />
                      AI Autonomous Execution Sequence
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.actions.map((act, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900/60 px-3.5 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200/50 dark:hover:bg-slate-900/25">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)] text-[9px] font-mono">
                            0{i + 1}
                          </div>
                          <span className="line-clamp-1 text-slate-700 dark:text-slate-300">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom reset actions */}
              {!isAnalyzing && result && (
                <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-gov-blue" />
                    Simulated ticket has been registered in the sandbox database.
                  </span>
                  <button
                    onClick={() => {
                      setInputText("");
                      setCustomText("");
                      setResult(null);
                    }}
                    className="text-xs font-semibold text-primary hover:underline hover:text-primary-foreground transition-colors"
                  >
                    Reset & Try Another
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
