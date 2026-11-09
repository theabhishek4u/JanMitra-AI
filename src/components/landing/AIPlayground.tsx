"use client";

import { useState, useEffect } from "react";
import {
  Building,
  CheckCircle,
  FileText,
  MapPin,
  Clock,
  UserCheck,
  Undo2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    lang: "Hindi",
    category: "Sanitation & Waste Management",
    priority: "HIGH",
    dept: "Lucknow Nagar Nigam (Zone 4)",
    officer: "Shri Rajesh Kumar (Chief Sanitation Inspector)",
    summaryHi: "गोमती नगर में कचरे के ढेर और उससे फैलने वाली बदबू के कारण स्वच्छता की गंभीर समस्या है।",
    summaryEn: "Severe sanitation concern in Gomti Nagar due to accumulation of garbage heaps and foul odor.",
    actions: [
      "Alert dispatched to Ward Inspector",
      "Sanitation pickup vehicle routed for priority clearance",
      "Automated SMS notification sent to zonal officer",
      "Auto-escalation scheduled if unaddressed within 48h",
    ],
  },
  {
    text: "Hazratganj main crossing ke pass water pipeline leak ho gayi hai, subah se hazaron gallon peene ka paani sadak par beh raha hai.",
    lang: "Hinglish",
    category: "Water Supply & Sewage Management",
    priority: "CRITICAL",
    dept: "Lucknow Jal Nigam (Zone 1)",
    officer: "Er. Alok Srivastava (Executive Engineer)",
    summaryHi: "हज़रतगंज मुख्य चौराहे के पास पेयजल पाइपलाइन फटने से भारी जल बर्बादी की आपातकालीन स्थिति।",
    summaryEn: "Critical drinking water pipeline burst near Hazratganj intersection causing extensive wastage.",
    actions: [
      "Zonal water gate valve isolation triggered",
      "Emergency engineering crew #04 dispatched with suction pumps",
      "Citizen acknowledged with direct ticket tracking link",
      "Executive Engineer escalation active with 24h SLA",
    ],
  },
  {
    text: "Aliganj Sector C me street lights pichhle 5 din se band padi hain, raat me andhera rehta hai aur aane jaane me darr lagta hai.",
    lang: "Hinglish",
    category: "Street Lighting & Electrical",
    priority: "MEDIUM",
    dept: "Madhyanchal Vidyut Vitaran Nigam / LMC",
    officer: "Shri R. P. Singh (Assistant Engineer)",
    summaryHi: "अलीगंज सेक्टर C में स्ट्रीट लाइट खराब होने से नागरिकों की सुरक्षा को खतरा।",
    summaryEn: "Streetlight outage for 5 consecutive days in Aliganj Sector C causing nighttime security hazards.",
    actions: [
      "Feeder pillar line check scheduled",
      "Electrical maintenance team assigned for luminaire replacement",
      "Ward councilor office auto-notified",
      "Resolution target: 48 hours",
    ],
  },
];

export function AIPlayground() {
  const [inputText, setInputText] = useState(presets[0].text);
  const [customText, setCustomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<PresetComplaint | null>(presets[0]);

  const handlePresetSelect = (preset: PresetComplaint) => {
    setInputText(preset.text);
    setCustomText("");
    setResult(preset);
    setStep(0);
  };

  const runAnalysis = () => {
    const currentText = (customText.trim() || inputText.trim()).toLowerCase();
    if (!currentText) return;

    let matchedResult: PresetComplaint = presets[0];

    if (currentText.includes("water") || currentText.includes("paani") || currentText.includes("leak") || currentText.includes("pipe") || currentText.includes("जल")) {
      matchedResult = presets[1];
    } else if (currentText.includes("light") || currentText.includes("bijli") || currentText.includes("current") || currentText.includes("wire") || currentText.includes("तार") || currentText.includes("लाइट")) {
      matchedResult = presets[2];
    } else {
      matchedResult = presets[0];
    }

    setIsAnalyzing(true);
    setStep(1);

    const timer1 = setTimeout(() => setStep(2), 500);
    const timer2 = setTimeout(() => setStep(3), 1000);
    const timer3 = setTimeout(() => {
      setIsAnalyzing(false);
      setResult(matchedResult);
      setStep(4);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "MEDIUM":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0c0e14] border-b border-slate-200 dark:border-white/[0.06] transition-colors" id="ai-engine">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-12 space-y-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Routing Sandbox
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Test grievance categorization in real-time
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Select a sample complaint or write your own to verify department assignment, designated nodal officer matching, and automated SLA sequence.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Presets & Custom Input */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] p-5 space-y-4 text-left shadow-sm">
              
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select sample complaint
                </span>
                <div className="space-y-1.5">
                  {presets.map((p, idx) => {
                    const isSelected = !customText && inputText === p.text;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 dark:bg-white/[0.06] border-blue-500/40 text-blue-900 dark:text-slate-100 font-medium"
                            : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {p.category.split(" (")[0]}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {p.lang}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-400">{p.text}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Or write a report
                  </span>
                  {customText && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomText("");
                        setInputText(presets[0].text);
                        setResult(presets[0]);
                      }}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="e.g. Gomti Nagar Sector 4 me kal se bijli supply cut hai aur transformer se aawaz aa rahi hai..."
                  className="min-h-[100px] text-xs rounded-lg resize-none bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    setInputText(e.target.value);
                  }}
                />
              </div>

              <Button
                className="w-full h-10 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                disabled={isAnalyzing || (!inputText && !customText)}
                onClick={runAnalysis}
              >
                <span>{isAnalyzing ? "Processing..." : "Run routing analysis"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Column: Diagnostic Docket Result */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12151e] p-6 text-left space-y-5 shadow-sm">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                    Routing Diagnostics
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Jansunwai Engine</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {isAnalyzing ? "Analyzing..." : "Ready"}
                </span>
              </div>

              {result && (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Category
                      </span>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {result.category}
                      </div>
                      <span
                        className={`inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border mt-1 ${getPriorityBadge(
                          result.priority
                        )}`}
                      >
                        {result.priority}
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Department
                      </span>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {result.dept}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <UserCheck className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span className="truncate">{result.officer.split(" (")[0]}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Language
                      </span>
                      <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                        {result.lang}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                        Confidence 98.6%
                      </div>
                    </div>
                  </div>

                  {/* Dual-language Abstract */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Summary Excerpt
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                      <div className="rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">
                          English
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">&ldquo;{result.summaryEn}&rdquo;</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-3 space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">
                          हिंदी
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">&ldquo;{result.summaryHi}&rdquo;</p>
                      </div>
                    </div>
                  </div>

                  {/* Automated Dispatch Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Autonomous Workflow Sequence
                    </span>
                    <div className="space-y-1.5">
                      {result.actions.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 px-3 py-2 rounded-lg"
                        >
                          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                            0{i + 1}
                          </span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
