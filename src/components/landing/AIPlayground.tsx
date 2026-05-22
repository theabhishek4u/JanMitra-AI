"use client";

import { useState } from "react";
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

  // Handle preset selection
  const handlePresetSelect = (preset: PresetComplaint) => {
    setInputText(preset.text);
    setCustomText(preset.text);
    setResult(null);
    setIsAnalyzing(false);
    setStep(0);
  };

  // Run simulated AI analysis
  const runAnalysis = () => {
    if (!inputText && !customText) return;
    
    // Fallback if custom text was typed
    let matchedResult = presets.find((p) => p.text === (inputText || customText));
    if (!matchedResult) {
      // Generate a mock dynamic response based on custom text
      const lower = (inputText || customText).toLowerCase();
      let category = "General Grievance (सामान्य शिकायत)";
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
        category = "Roads & Infrastructure (सड़क एवं लोक निर्माण)";
        priority = "HIGH";
        dept = "Public Works Department (PWD UP) - लोक निर्माण विभाग";
        officer = "Shri K. K. Yadav (Chief Engineer)";
        summaryHi = "सड़क मरम्मत और गड्ढों के कारण यातायात अवरोध एवं सुरक्षा संबंधी शिकायत।";
        summaryEn = "Road repair and pothole grievance causing safety and transport issues.";
        actions = [
          "Assigned to PWD Lucknow Circle 2 inspector",
          "Geo-tagged road coordinates sent for asphalt scheduling",
          "Scheduled review by Sub-Divisional Engineer"
        ];
      } else if (lower.includes("bijli") || lower.includes("light") || lower.includes("electricity") || lower.includes("wire")) {
        category = "Power & Electricity (विद्युत विभाग)";
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
        text: inputText || customText,
        lang: lower.match(/[\u0900-\u097F]/) ? "Hindi / देवनागरी" : "English / Mixed",
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-purple/10 border border-ai-purple/20 text-xs font-bold text-ai-purple uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Simulation
          </span>
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
                  className="w-full bg-gradient-to-r from-gov-blue to-ai-purple text-white shadow-lg shadow-gov-blue/20 hover:shadow-gov-blue/40 h-12 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={isAnalyzing || (!inputText && !customText)}
                  onClick={runAnalysis}
                >
                  <Brain className="w-4 h-4" />
                  {isAnalyzing ? "Processing..." : "Trigger AI Diagnostics"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* AI stats badge */}
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-trust-green/10 flex items-center justify-center text-trust-green">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">NLP Engine Accuracy</div>
                  <div className="text-sm font-bold">98.4% Precision Score</div>
                </div>
              </div>
              <div className="text-xs text-right">
                <span className="font-mono text-ai-purple font-bold">ResNet-101 / BERT</span>
                <div className="text-[10px] text-muted-foreground">75 UP Districts Active</div>
              </div>
            </div>
          </div>

          {/* Results Diagnostic Terminal */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl p-6 min-h-[460px] flex flex-col justify-between premium-glow-border scanning-laser-container relative overflow-hidden bg-slate-950/20">
              {/* Laser beam scan active during analysis */}
              {isAnalyzing && <div className="holo-scanline" />}

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
                    <div className="text-xs font-mono text-ai-purple uppercase tracking-widest font-bold">
                      Neural Analysis in Progress
                    </div>
                    <p className="text-sm font-semibold max-w-md mx-auto line-clamp-1 italic text-muted-foreground">
                      &ldquo;{inputText || customText}&rdquo;
                    </p>
                  </div>

                  {/* Analysis Timeline simulation */}
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                        step >= 1 ? "bg-ai-purple border-ai-purple text-white shadow-lg shadow-ai-purple/30" : "border-border text-muted-foreground"
                      }`}>
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-semibold ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                            Language Parsing & Sentiment
                          </span>
                          {step === 1 && <span className="text-[10px] font-mono text-ai-purple animate-pulse">Running...</span>}
                        </div>
                        <div className="h-1 bg-border rounded-full mt-1 overflow-hidden">
                          {step >= 1 && (
                            <motion.div 
                              className="h-full bg-ai-purple" 
                              initial={{ width: 0 }} 
                              animate={{ width: step === 1 ? "60%" : "100%" }}
                              transition={{ duration: 1 }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                        step >= 2 ? "bg-gov-blue border-gov-blue text-white shadow-lg shadow-gov-blue/30" : "border-border text-muted-foreground"
                      }`}>
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-semibold ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                            Grievance Categorization & Urgency Analysis
                          </span>
                          {step === 2 && <span className="text-[10px] font-mono text-gov-blue animate-pulse">Running...</span>}
                        </div>
                        <div className="h-1 bg-border rounded-full mt-1 overflow-hidden">
                          {step >= 2 && (
                            <motion.div 
                              className="h-full bg-gov-blue" 
                              initial={{ width: 0 }} 
                              animate={{ width: step === 2 ? "65%" : "100%" }}
                              transition={{ duration: 1.2 }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                        step >= 3 ? "bg-trust-green border-trust-green text-white shadow-lg shadow-trust-green/30" : "border-border text-muted-foreground"
                      }`}>
                        3
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-semibold ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                            Smart Department Jurisdiction Matching
                          </span>
                          {step === 3 && <span className="text-[10px] font-mono text-trust-green animate-pulse">Routing...</span>}
                        </div>
                        <div className="h-1 bg-border rounded-full mt-1 overflow-hidden">
                          {step >= 3 && (
                            <motion.div 
                              className="h-full bg-trust-green" 
                              initial={{ width: 0 }} 
                              animate={{ width: step === 3 ? "70%" : "100%" }}
                              transition={{ duration: 1.3 }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* State 3: Result Showcase */}
              {!isAnalyzing && result && (
                <div className="flex-1 flex flex-col justify-between space-y-6">
                  {/* Top diagnostics layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left details */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          Detected Category
                        </div>
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-ai-purple" />
                          {result.category}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          Smart-Routed Jurisdiction
                        </div>
                        <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground/90">
                          <MapPin className="w-4 h-4 text-gov-blue" />
                          {result.dept}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          Assigned Nodal Officer
                        </div>
                        <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground/90">
                          <UserCheck className="w-4 h-4 text-trust-green" />
                          {result.officer}
                        </div>
                      </div>
                    </div>

                    {/* Right details */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          Threat Level / Severity
                        </div>
                        <Badge 
                          className={`font-semibold border text-xs px-2.5 py-1 ${getPriorityColor(result.priority)}`}
                          variant="outline"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                          {result.priority} SEVERITY
                        </Badge>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          Detected Language
                        </div>
                        <div className="text-xs font-mono bg-muted/60 border border-border/50 rounded-lg px-2.5 py-1 inline-block font-semibold">
                          {result.lang}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                          AI Diagnostics Score
                        </div>
                        <div className="text-xs font-mono text-trust-green font-bold">
                          ✓ 99.1% Categorization Match Accuracy
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary / Translations */}
                  <div className="border-t border-border/40 pt-4 space-y-3.5">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex justify-between">
                        <span>AI Grievance Abstract (English)</span>
                        <span className="text-[9px] font-mono text-ai-purple font-semibold">Automatic Translation</span>
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/30 border border-border/30 rounded-lg p-2.5 font-sans leading-relaxed">
                        {result.summaryEn}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex justify-between">
                        <span>AI शिकायत संक्षेप (Hindi)</span>
                        <span className="text-[9px] font-mono text-ai-purple font-semibold">स्वचालित संक्षेपण</span>
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/30 border border-border/30 rounded-lg p-2.5 font-sans leading-relaxed">
                        {result.summaryHi}
                      </p>
                    </div>
                  </div>

                  {/* AI Action Execution Checklist */}
                  <div className="border-t border-border/40 pt-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-warning-amber" />
                      AI Autonomous Execution Sequence
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.actions.map((act, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground/80 leading-normal">
                          <CheckCircle className="w-3.5 h-3.5 text-trust-green mt-0.5 flex-shrink-0" />
                          <span>{act}</span>
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
