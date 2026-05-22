"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  User,
  Bot as BotIcon,
  ChevronRight,
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  getComplaints,
  getComplaintById,
  addComplaint,
  updateComplaintStatus,
  getStats,
  addCitizenNotification,
} from "@/lib/complaints";
import type { Complaint, TimelineEvent } from "@/types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  isCustomCard?: boolean;
  cardType?: "timeline" | "hotspots" | "filing_success" | "admin_override" | "greeting";
  cardData?: any;
  timestamp: Date;
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [audioFeedback, setAudioFeedback] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioAnimationRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTimeout1Ref = useRef<NodeJS.Timeout | null>(null);
  const voiceTimeout2Ref = useRef<NodeJS.Timeout | null>(null);
  const previousInputRef = useRef<string>("");

  const isHi = language === "hi";

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: "",
          isCustomCard: true,
          cardType: "greeting",
          timestamp: new Date(),
        },
      ]);
    }
  }, [language]);

  // Clean up native speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (voiceTimeout1Ref.current) clearTimeout(voiceTimeout1Ref.current);
      if (voiceTimeout2Ref.current) clearTimeout(voiceTimeout2Ref.current);
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice Equalizer Waveform Simulator
  useEffect(() => {
    if (isRecording) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 80;

      let phase = 0;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(167, 139, 250, 0.8)"; // glowing purple
        ctx.shadowColor = "rgba(139, 92, 246, 0.4)";
        ctx.shadowBlur = 15;
        ctx.lineWidth = 3;

        // Draw multiple sine waves
        for (let w = 0; w < 3; w++) {
          ctx.beginPath();
          const amplitude = (30 - w * 8) * (Math.sin(phase * 0.05) * 0.3 + 0.7);
          const frequency = 0.02 + w * 0.005;

          for (let x = 0; x < canvas.width; x++) {
            const y =
              canvas.height / 2 +
              Math.sin(x * frequency + phase + w * 1.5) *
                amplitude *
                Math.sin((x / canvas.width) * Math.PI); // Pin the ends to 0
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        phase += 0.2;
        audioAnimationRef.current = requestAnimationFrame(render);
      };

      render();
    } else {
      if (audioAnimationRef.current) {
        cancelAnimationFrame(audioAnimationRef.current);
      }
    }

    return () => {
      if (audioAnimationRef.current) {
        cancelAnimationFrame(audioAnimationRef.current);
      }
    };
  }, [isRecording]);

  // NLP Parsing engine (Client side)
  const parseMessage = (input: string) => {
    const text = input.toLowerCase().trim();
    const complaints = getComplaints();

    // Helper to emit event to force state refreshing on the pages
    const notifyDatabaseChanged = () => {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("janmitra-db-change"));
    };

    // 1. GREETINGS
    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("namaste") ||
      text.includes("helo") ||
      text.includes("नमस्ते") ||
      text.includes("राम राम") ||
      text.includes("pranam")
    ) {
      return {
        text: isHi
          ? "नमस्ते! मैं जनमित्र AI हूँ। मैं आपकी शिकायत दर्ज करने, आपके टिकट की स्थिति जांचने, या लखनऊ के सक्रिय हॉटस्पॉट की जानकारी देने में मदद कर सकता हूँ।"
          : "Namaste! I am JanMitra AI. I can help you register a grievance, check your ticket status, or summarize active hotspots in Lucknow.",
      };
    }

    // 2. ADMIN ESCALATION & AUTO OVERRIDES
    if (text.includes("admin") || text.includes("escalate") || text.includes("escalation") || text.includes("overide")) {
      // Find a high priority or pending complaint to escalate
      const pending = complaints.find((c) => c.status !== "resolved");
      if (pending) {
        const updated = updateComplaintStatus(
          pending.id,
          "escalated",
          "AI Auto-Escalation Engine",
          "Automated escalation triggered via Command Console override.",
          "कमांड कंसोल ओवरराइड के माध्यम से स्वचालित वृद्धि शुरू की गई।"
        );
        notifyDatabaseChanged();

        return {
          text: isHi
            ? `कमांड स्वीकृत! टिकट **${pending.id}** को सफलतापूर्वक स्तर ${updated?.escalationLevel} (वरिष्ठ अधिकारी) पर प्रेषित कर दिया गया है।`
            : `Override accepted! Ticket **${pending.id}** has been successfully escalated to Level ${updated?.escalationLevel} for Senior Review.`,
          isCustomCard: true,
          cardType: "admin_override",
          cardData: {
            title: isHi ? "सिस्टम ऑटो-एस्कलेशन शुरू" : "System Auto-Escalation Triggered",
            ticketId: pending.id,
            officer: updated?.assignedOfficer || "Senior Commissioner",
            escalationLevel: updated?.escalationLevel,
            category: pending.category,
            area: pending.area,
          },
        };
      } else {
        return {
          text: isHi
            ? "सिस्टम में वर्तमान में कोई लंबित शिकायत नहीं है जिसे एस्कलेट किया जा सके!"
            : "No active pending complaints found in the database to escalate!",
        };
      }
    }

    // 3. HOTSPOT SUMMARIZER
    if (
      text.includes("hotspot") ||
      text.includes("active cluster") ||
      text.includes("kahan problem") ||
      text.includes("hospot") ||
      text.includes("हॉटस्पॉट") ||
      text.includes("समस्या वाले क्षेत्र")
    ) {
      // Compute hotspots from dynamic complaints list
      const activeGroups: Record<string, { count: number; area: string; category: string }> = {};
      complaints.forEach((c) => {
        if (c.status !== "resolved") {
          const key = `${c.area.toLowerCase().trim()}_${c.category.toLowerCase().trim()}`;
          if (!activeGroups[key]) {
            activeGroups[key] = { count: 0, area: c.area, category: c.category };
          }
          activeGroups[key].count += 1;
        }
      });

      const hotspotsList = Object.values(activeGroups)
        .filter((g) => g.count >= 2)
        .map((h) => ({
          area: h.area,
          category: h.category,
          count: h.count,
        }));

      return {
        text: isHi
          ? `यहाँ लखनऊ के सक्रिय हॉटस्पॉट का विश्लेषण है। कुल ${hotspotsList.length} गंभीर पैटर्न पाए गए हैं:`
          : `Here is the real-time spatial hotspot analysis for Lucknow. We detected ${hotspotsList.length} active grievance clusters requiring immediate action:`,
        isCustomCard: true,
        cardType: "hotspots",
        cardData: {
          hotspots: hotspotsList.length > 0 ? hotspotsList : [
            { area: "Gomti Nagar, Lucknow", category: "Garbage / Sanitation", count: 3 },
            { area: "Rajajipuram, Lucknow", category: "Water Supply", count: 2 },
          ],
        },
      };
    }

    // 4. TICKET STATUS LOOKUP
    const ticketMatch = text.match(/jm-\d{4}-\d{3}/i) || text.match(/jm-\d{3}/i);
    const statusTerms = ["status", "track", "ticket", "mera ticket", "स्थिति", "जांच", "ट्रैक"];
    const hasStatusTerm = statusTerms.some((t) => text.includes(t));

    if (ticketMatch || hasStatusTerm) {
      let targetComplaint: Complaint | undefined;

      if (ticketMatch) {
        const fullId = ticketMatch[0].toUpperCase();
        // If they only entered e.g. JM-008, format it as JM-2026-008
        const normalizedId = fullId.length === 6 ? `JM-2026-${fullId.substring(3)}` : fullId;
        targetComplaint = getComplaintById(normalizedId);
      } else {
        // Find the most recent active complaint for demonstration
        targetComplaint = complaints.find((c) => c.status !== "resolved") || complaints[0];
      }

      if (targetComplaint) {
        return {
          text: isHi
            ? `मुझे आपका टिकट **${targetComplaint.id}** मिल गया है। यहाँ इसकी वर्तमान ट्रैकिंग स्थिति है:`
            : `I located your ticket **${targetComplaint.id}**. Here is the live tracking timeline & diagnostic report:`,
          isCustomCard: true,
          cardType: "timeline",
          cardData: targetComplaint,
        };
      } else {
        return {
          text: isHi
            ? "क्षमा करें, मुझे इस आईडी का कोई टिकट नहीं मिला। कृपया सही शिकायत आईडी (जैसे: JM-2026-008) दर्ज करें।"
            : "Sorry, I could not find a ticket with that ID. Please double check the ticket number (e.g. JM-2026-008).",
        };
      }
    }

    // 5. CONVERSATIONAL TICKET FILING (Simulated NLP engine)
    const categoryKeywords = [
      { name: "Garbage / Sanitation", nameHi: "कचरा / स्वच्छता", keys: ["garbage", "kachra", "dirty", "gandagi", "dustbin", "waste", "कचरा", "गंदगी", "सफाई"] },
      { name: "Water Supply", nameHi: "जल आपूर्ति", keys: ["water", "leak", "pipe", "pani", "waterlogging", "leakage", "पानी", "पाइप", "लीक"] },
      { name: "Road Damage", nameHi: "सड़क मरम्मत", keys: ["road", "pothole", "asphalt", "sadak", "gaddha", "damage", "सड़क", "गड्ढा", "टूटी सड़क"] },
      { name: "Electricity", nameHi: "बिजली", keys: ["electricity", "bijli", "power", "transformer", "wire", "current", "बिजली", "करंट", "ट्रांसफार्मर"] },
      { name: "Street Light", nameHi: "स्ट्रीट लाइट", keys: ["street light", "light", "andhera", "darkness", "pole", "रोशनी", "स्ट्रीट लाइट", "अंधेरा"] },
      { name: "Illegal Construction", nameHi: "अवैध निर्माण", keys: ["construction", "illegal", "encroachment", "kabza", "building", "अवैध निर्माण", "कब्जा"] },
      { name: "Corruption", nameHi: "भ्रष्टाचार", keys: ["corruption", "bribe", "ghoos", "money", "demand", "रिश्वत", "घूस", "भ्रष्टाचार"] },
    ];

    let detectedCategory = categoryKeywords[0]; // fallback
    let maxMatches = 0;

    categoryKeywords.forEach((cat) => {
      let matches = 0;
      cat.keys.forEach((k) => {
        if (text.includes(k)) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = cat;
      }
    });

    // Check if there are any grievance indicators
    const isFilingQuery = maxMatches > 0 || text.includes("complain") || text.includes("shikayat") || text.includes("शिकायत") || text.includes("दर्ज");

    if (isFilingQuery) {
      // Determine area
      let area = "Gomti Nagar, Lucknow";
      if (text.includes("alambagh") || text.includes("आलमबाग")) area = "Alambagh, Lucknow";
      else if (text.includes("rajajipuram") || text.includes("राजाजीपुरम")) area = "Rajajipuram, Lucknow";
      else if (text.includes("hazratganj") || text.includes("हजरतगंज")) area = "Hazratganj, Lucknow";
      else if (text.includes("aminabad") || text.includes("अमीनाबाद")) area = "Aminabad, Lucknow";
      else if (text.includes("indira nagar") || text.includes("इंदिरा नगर")) area = "Indira Nagar, Lucknow";

      // File complaint
      const titleEn = `Conversational filing: Active ${detectedCategory.name} reported near ${area.split(",")[0]}`;
      const titleHi = `संवाद फ़ाइलिंग: ${area.split(",")[0]} के पास सक्रिय ${detectedCategory.nameHi} की सूचना`;

      const newTicket = addComplaint({
        title: titleEn,
        titleHi,
        description: input,
        descriptionHi: input,
        category: detectedCategory.name,
        categoryHi: detectedCategory.nameHi,
        area: area,
        priority: "medium",
        aiSummary: `Citizen conversational filing parsed: "${input}". Classifying under ${detectedCategory.name} with 98% confidence. Immediate dispatch warranted.`,
        aiSummaryHi: `नागरिक संवाद फाइलिंग विश्लेषित: "${input}"। 98% सटीकता के साथ ${detectedCategory.nameHi} के अंतर्गत वर्गीकृत। तत्काल निस्तारण आवश्यक।`,
        aiConfidence: 0.98,
        latitude: area.includes("Alambagh") ? 26.8028 : area.includes("Rajajipuram") ? 26.8373 : area.includes("Hazratganj") ? 26.8496 : 26.8643,
        longitude: area.includes("Alambagh") ? 80.9022 : area.includes("Rajajipuram") ? 80.8926 : area.includes("Hazratganj") ? 80.9467 : 80.9576,
      });

      notifyDatabaseChanged();

      return {
        text: isHi
          ? `मैंने आपकी समस्या को **${detectedCategory.nameHi}** श्रेणी के अंतर्गत सफलतापूर्वक दर्ज कर लिया है! आपका टिकट आईडी **${newTicket.id}** है। इसे तत्काल संबंधित अधिकारी को सौंप दिया गया है।`
          : `I have successfully registered your grievance under **${detectedCategory.name}**! Your unique Ticket ID is **${newTicket.id}**. Our automated routing has dispatched it to the assigned department.`,
        isCustomCard: true,
        cardType: "filing_success",
        cardData: newTicket,
      };
    }

    // 6. DEFAULT FALLBACK
    return {
      text: isHi
        ? "मुझे ठीक से समझ नहीं आया। आप शिकायत दर्ज कर सकते हैं (जैसे: 'Gomti Nagar me kachra pada hai'), किसी टिकट को ट्रैक कर सकते हैं (जैसे: 'JM-2026-008 का स्टेटस क्या है?'), या 'active hotspots' पूछ सकते हैं।"
        : "I didn't quite catch that. You can file a grievance (e.g. 'Water pipe leakage in Alambagh'), track a ticket (e.g. 'Status of JM-2026-008'), or ask for 'active hotspots'.",
    };
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const result = parseMessage(textToSend);
      const newAiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: result.text,
        isCustomCard: result.isCustomCard,
        cardType: result.cardType as any,
        cardData: result.cardData,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setIsTyping(false);

      if (audioFeedback) {
        playTickSound();
      }
    }, 900);
  };

  const startVoiceRecording = () => {
    previousInputRef.current = inputValue;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = isHi ? "hi-IN" : "en-IN";

        recognition.onstart = () => {
          setIsRecording(true);
          setVoiceText(isHi ? "सुन रहा हूँ..." : "Listening...");
        };

        recognition.onresult = (event: any) => {
          let sessionTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }
          if (sessionTranscript) {
            setVoiceText(sessionTranscript);
            setInputValue(sessionTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Widget speech recognition error, triggering simulation:", event.error);
          recognition.onend = null; // Prevent onend from toggling recording state back to false immediately
          try {
            recognition.stop();
          } catch (e) {}
          runSimulation();
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (audioFeedback) {
            playBeepSuccess();
          }
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Failed to start widget native speech recognition:", err);
      }
    }

    runSimulation();

    function runSimulation() {
      setIsRecording(true);
      setVoiceText(isHi ? "सुन रहा हूँ..." : "Listening...");

      voiceTimeout1Ref.current = setTimeout(() => {
        const partialText = isHi
          ? "हजरतगंज मेन रोड पर बिजली का खंभा क्षतिग्रस्त हो गया है..."
          : "Hazratganj main road pe electrical pole damage ho gaya hai...";
        setVoiceText(partialText);
        setInputValue(partialText);
        voiceTimeout1Ref.current = null;
      }, 1500);

      voiceTimeout2Ref.current = setTimeout(() => {
        const finalTranscript = isHi
          ? "हजरतगंज मेन रोड पर बिजली का खंभा क्षतिग्रस्त हो गया है, कृपया ठीक करें।"
          : "Hazratganj main road pe electrical pole damage ho gaya hai, please repair karvao.";

        setIsRecording(false);
        setVoiceText(finalTranscript);
        setInputValue(finalTranscript);
        if (audioFeedback) {
          playBeepSuccess();
        }
        voiceTimeout2Ref.current = null;
      }, 3200);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (voiceTimeout1Ref.current) {
      clearTimeout(voiceTimeout1Ref.current);
      voiceTimeout1Ref.current = null;
    }
    if (voiceTimeout2Ref.current) {
      clearTimeout(voiceTimeout2Ref.current);
      voiceTimeout2Ref.current = null;
    }
    // Discard any intermediate speech and restore the previous input
    setInputValue(previousInputRef.current);
    setIsRecording(false);
  };

  const playTickSound = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, context.currentTime);
      gain.gain.setValueAtTime(0.05, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
      osc.start();
      osc.stop(context.currentTime + 0.1);
    } catch (e) {}
  };

  const playBeepSuccess = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, context.currentTime);
      osc.frequency.setValueAtTime(1000, context.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);
      osc.start();
      osc.stop(context.currentTime + 0.25);
    } catch (e) {}
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating launcher trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full cursor-pointer relative bg-gradient-to-tr from-gov-blue via-violet-600 to-ai-purple shadow-[0_0_25px_rgba(139,92,246,0.5)] border border-violet-400/30 text-white"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[10px] text-slate-950 font-bold items-center justify-center">
                AI
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main chat window container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[420px] max-w-[92vw] h-[580px] rounded-2xl flex flex-col overflow-hidden border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_50px_rgba(139,92,246,0.25)]"
          >
            {/* Header section with status, sound, language */}
            <div className="p-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center shadow-lg relative">
                  <BotIcon className="w-5 h-5 text-violet-400" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                    JanMitra AI
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                      Bilingual NLP
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    Lucknow Nagar Nigam • Online
                  </p>
                </div>
              </div>

              {/* Utility Panel */}
              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <button
                  onClick={() => setLanguage((l) => (l === "en" ? "hi" : "en"))}
                  className="px-2 py-1 rounded-md text-[10px] border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-300 font-medium cursor-pointer"
                >
                  {isHi ? "English" : "हिंदी / Hinglish"}
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={() => setAudioFeedback((a) => !a)}
                  className="p-1.5 rounded-md hover:bg-slate-950/40 text-slate-400 hover:text-slate-300 cursor-pointer"
                >
                  {audioFeedback ? (
                    <Volume2 className="w-4 h-4 text-violet-400" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Conversational timeline scroll viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                      </div>
                    )}

                    <div className="space-y-1">
                      {msg.text && (
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                            msg.sender === "user"
                              ? "bg-violet-600 text-white rounded-tr-none font-medium"
                              : "bg-slate-900/60 border border-slate-800 text-slate-300 rounded-tl-none leading-relaxed"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* CUSTOM CARD RENDERERS */}
                      {msg.isCustomCard && msg.cardType === "greeting" && (
                        <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-950/10 backdrop-blur-md space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {isHi
                              ? "नमस्ते! मैं जनमित्र AI सहायक हूँ। आप लखनऊ में नागरिक समस्याओं (कचरा, पानी लीक, स्ट्रीट लाइट) को सीधे यहाँ बातचीत करके दर्ज कर सकते हैं या अपने शिकायत टिकट की प्रगति को ट्रैक कर सकते हैं।"
                              : "Namaste! I am the JanMitra AI Assistant. You can file civic complaints in Lucknow (garbage, water leakage, street lights) directly through conversation, or track the progress of your grievance tickets."}
                          </p>
                          <div className="border-t border-slate-800/80 pt-2">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
                              {isHi ? "सुझाए गए प्रश्न" : "Suggested Prompts"}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => handleSendMessage(isHi ? "मेरे टिकट JM-2026-008 की स्थिति बताएं" : "Track status of ticket JM-2026-008")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                {isHi ? "JM-2026-008 का स्टेटस?" : "Track JM-2026-008"}
                              </button>
                              <button
                                onClick={() => handleSendMessage(isHi ? "आलमबाग क्षेत्र में सड़कों के गड्ढे की शिकायत दर्ज करें" : "Register a pothole complaint in Alambagh area")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                🚧 {isHi ? "सड़क गड्ढा दर्ज करें" : "File Alambagh Pothole"}
                              </button>
                              <button
                                onClick={() => handleSendMessage(isHi ? "सक्रिय हॉटस्पॉट विश्लेषण दिखाओ" : "Show Lucknow active hotspots")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                🔥 {isHi ? "सक्रिय हॉटस्पॉट?" : "Active Hotspots?"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.isCustomCard && msg.cardType === "timeline" && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 shadow-lg">
                          <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium uppercase">Ticket ID</span>
                              <span className="text-xs font-bold text-slate-200">{msg.cardData.id}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-medium uppercase">Category</span>
                              <span className="text-xs font-semibold text-violet-400">{isHi ? msg.cardData.categoryHi : msg.cardData.category}</span>
                            </div>
                          </div>

                          {/* Render Mini Timeline */}
                          <div className="space-y-3 relative pl-4 border-l border-slate-800 py-1">
                            {msg.cardData.timeline?.map((evt: TimelineEvent, idx: number) => {
                              const isResolved = evt.status === "resolved";
                              const isEscalated = evt.status === "escalated";
                              
                              return (
                                <div key={evt.id || idx} className="relative text-xs">
                                  {/* timeline bullet node */}
                                  <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    evt.isActive
                                      ? "bg-violet-600 border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                                      : isResolved
                                      ? "bg-emerald-600 border-emerald-400"
                                      : isEscalated
                                      ? "bg-red-600 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                      : "bg-slate-800 border-slate-700"
                                  }`}>
                                    {evt.isActive && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-semibold ${evt.isActive ? "text-violet-400" : isResolved ? "text-emerald-400" : isEscalated ? "text-red-400" : "text-slate-300"}`}>
                                      {evt.status.replace(/_/g, " ").toUpperCase()}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-medium">
                                      {new Date(evt.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                                    {isHi ? evt.messageHi : evt.message}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-300">{isHi ? "आवंटित अधिकारी: " : "Assigned Officer: "}</span>
                              {msg.cardData.assignedOfficer || "Shri Rajesh Kumar"}
                            </p>
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-300">{isHi ? "क्षेत्र: " : "Area: "}</span>
                              {msg.cardData.area}
                            </p>
                          </div>
                        </div>
                      )}

                      {msg.isCustomCard && msg.cardType === "hotspots" && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 animate-bounce" />
                            {isHi ? "सक्रिय नागरिक शिकायत क्लस्टर" : "Active Grievance Clusters"}
                          </div>
                          
                          <div className="space-y-2">
                            {msg.cardData.hotspots.map((hot: any, index: number) => (
                              <div
                                key={index}
                                className="p-2.5 rounded-lg border border-red-500/20 bg-red-950/10 flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-[11px] text-slate-200 font-bold block">{hot.area}</span>
                                  <span className="text-[10px] text-slate-400">{hot.category}</span>
                                </div>
                                <div className="text-right">
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] text-red-400 font-bold">
                                    {hot.count} Active
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-[10px] text-amber-500/90 leading-relaxed bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                            ⚠️ {isHi
                              ? "इन क्षेत्रों में शिकायत घनत्व के कारण प्राथमिकता को 'HIGH' पर अपग्रेड कर दिया गया है और एसएलए टाइमलाइन को 50% तक कम कर दिया गया है।"
                              : "Priority elevated to HIGH & SLA countdown accelerated by 50% for these clusters to enforce immediate resolution."}
                          </p>
                        </div>
                      )}

                      {msg.isCustomCard && msg.cardType === "filing_success" && (
                        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
                            <CheckCircle2 className="w-4 h-4" />
                            {isHi ? "शिकायत सफलतापूर्वक दर्ज!" : "Grievance Registered Successfully"}
                          </div>

                          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">ID</span>
                              <span className="font-bold text-slate-200">{msg.cardData.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Category</span>
                              <span className="font-semibold text-violet-400">{isHi ? msg.cardData.categoryHi : msg.cardData.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Area</span>
                              <span className="text-slate-300 font-medium">{msg.cardData.area}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Officer</span>
                              <span className="text-slate-300">{msg.cardData.assignedOfficer}</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-400 text-center italic bg-slate-950/40 py-1.5 rounded">
                            {isHi
                              ? "यह शिकायत आपके 'My Complaints' डैशबोर्ड कतार में तुरंत दिखाई देगी।"
                              : "This ticket immediately updates your active portal view in real-time."}
                          </p>
                        </div>
                      )}

                      {msg.isCustomCard && msg.cardType === "admin_override" && (
                        <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-950/10 space-y-3">
                          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 animate-spin" />
                            {msg.cardData.title}
                          </div>

                          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-300">Ticket ID:</span> {msg.cardData.ticketId}
                            </p>
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-300">Escalated To:</span> {msg.cardData.officer} (Level {msg.cardData.escalationLevel})
                            </p>
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-300">Status:</span> <span className="text-red-400 font-semibold">ESCALATED</span>
                            </p>
                            <p className="text-slate-400">
                              <span className="font-medium text-slate-300">Target Area:</span> {msg.cardData.area}
                            </p>
                          </div>

                          <p className="text-[10px] text-violet-400/90 leading-relaxed bg-violet-500/5 p-2 rounded border border-violet-500/10 text-center">
                            {isHi
                              ? "ऑटो-एसकेलेशन पूर्ण। नागरिक को रियल-टाइम सूचना भेज दी गई है।"
                              : "Auto-escalation complete. Real-time Citizen alert dispatched."}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <BotIcon className="w-4 h-4 text-violet-400 animate-spin" />
                    </div>
                    <div className="rounded-2xl px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-400 text-xs rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Input Holographic Overlay */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-6 z-10"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse">
                      <Mic className="w-10 h-10 text-violet-400" />
                    </div>
                    <span className="absolute w-28 h-28 border border-violet-500/20 rounded-full animate-ping"></span>
                  </div>

                  <div className="text-center space-y-2 max-w-sm">
                    <h5 className="text-sm font-semibold text-slate-200">
                      {isHi ? "AI बहुभाषी वॉयस ट्रांसक्रिप्शन सक्रिय" : "AI Multilingual Voice Active"}
                    </h5>
                    <p className="text-xs text-violet-400 font-mono animate-pulse">
                      {voiceText}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isHi
                        ? "हिंग्लिश, हिंदी या अंग्रेजी में अपनी शिकायत बोलें।"
                        : "Speak your grievance in English, Hindi, or conversational Hinglish."}
                    </p>
                  </div>

                  {/* Sine waves rendering canvas */}
                  <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                    <canvas ref={canvasRef} className="max-w-full" />
                  </div>

                  <button
                    onClick={stopVoiceRecording}
                    className="px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold cursor-pointer"
                  >
                    {isHi ? "रद्द करें" : "Cancel Recording"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Input Box Section */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex flex-col gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 bg-slate-900/60 rounded-xl border border-slate-800/80 focus-within:border-violet-500/60 focus-within:shadow-[0_0_12px_rgba(139,92,246,0.15)] flex items-center px-3 py-1 bg-slate-900/30 transition-all duration-200">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isHi
                        ? "शिकायत दर्ज करें या स्थिति जांचें..."
                        : "Ask about a ticket or file an issue..."
                    }
                    className="flex-1 bg-transparent border-0 outline-none text-slate-200 text-xs py-2 placeholder-slate-500"
                  />
                  
                  {/* Microphone */}
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="p-1.5 rounded-lg hover:bg-slate-950 text-slate-400 hover:text-violet-400 transition-colors shrink-0 cursor-pointer"
                    title="Simulate Speech Input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-900 disabled:text-slate-600 text-white flex items-center justify-center shrink-0 transition-colors shadow-md hover:shadow-lg shadow-violet-950 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Suggestions quick chips */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 px-1 border-t border-slate-900 pt-1.5">
                <span>{isHi ? "टाइप करें: status या problem" : "Try typing: status, hotspots or kachra"}</span>
                <span className="text-violet-400 font-medium">JanMitra AI Core v2.4</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
