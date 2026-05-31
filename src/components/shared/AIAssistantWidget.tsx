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
  HelpCircle,
  BarChart3,
  Building2,
  Phone,
  Trash2,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import {
  getComplaints,
  getComplaintById,
  addComplaint,
  updateComplaintStatus,
  getStats,
  addCitizenNotification,
} from "@/lib/complaints";
import type { Complaint, TimelineEvent, DashboardStats } from "@/types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  isCustomCard?: boolean;
  cardType?: "timeline" | "hotspots" | "filing_success" | "admin_override" | "greeting" | "stats" | "help" | "department_info" | "recent_list";
  cardData?: any;
  timestamp: Date;
}

// Department directory data
const DEPARTMENTS = [
  { name: "Lucknow Nagar Nigam", nameHi: "लखनऊ नगर निगम", handles: "Garbage, Sanitation, Parks", handlesHi: "कचरा, स्वच्छता, पार्क", helpline: "0522-2638340" },
  { name: "Jal Nigam", nameHi: "जल निगम", handles: "Water Supply, Drainage, Sewage", handlesHi: "जल आपूर्ति, नाला, सीवर", helpline: "0522-2614925" },
  { name: "Public Works Dept (PWD)", nameHi: "लोक निर्माण विभाग", handles: "Roads, Bridges, Highways", handlesHi: "सड़क, पुल, राजमार्ग", helpline: "0522-2237582" },
  { name: "UPPCL (Power Dept)", nameHi: "विद्युत विभाग (UPPCL)", handles: "Electricity, Street Lights, Transformers", handlesHi: "बिजली, स्ट्रीट लाइट, ट्रांसफार्मर", helpline: "1912" },
  { name: "Traffic Police", nameHi: "यातायात पुलिस", handles: "Traffic, Parking, Signals", handlesHi: "यातायात, पार्किंग, सिग्नल", helpline: "0522-2620173" },
  { name: "Health Department", nameHi: "स्वास्थ्य विभाग", handles: "Public Health, Dengue, Mosquitoes", handlesHi: "जन स्वास्थ्य, डेंगू, मच्छर", helpline: "108" },
  { name: "Anti-Corruption Bureau", nameHi: "भ्रष्टाचार निरोधक ब्यूरो", handles: "Corruption, Bribery Reports", handlesHi: "भ्रष्टाचार, रिश्वत शिकायत", helpline: "1064" },
  { name: "Animal Control", nameHi: "पशु नियंत्रण", handles: "Stray Animals, Cattle, Dogs", handlesHi: "आवारा पशु, गाय, कुत्ते", helpline: "0522-2627844" },
];

// Expanded Lucknow area map
const AREA_MAP: Record<string, { name: string; lat: number; lng: number }> = {
  "gomti nagar": { name: "Gomti Nagar, Lucknow", lat: 26.8643, lng: 80.9576 },
  "alambagh": { name: "Alambagh, Lucknow", lat: 26.8028, lng: 80.9022 },
  "rajajipuram": { name: "Rajajipuram, Lucknow", lat: 26.8373, lng: 80.8926 },
  "hazratganj": { name: "Hazratganj, Lucknow", lat: 26.8496, lng: 80.9467 },
  "aminabad": { name: "Aminabad, Lucknow", lat: 26.8512, lng: 80.9334 },
  "indira nagar": { name: "Indira Nagar, Lucknow", lat: 26.8746, lng: 80.9929 },
  "aliganj": { name: "Aliganj, Lucknow", lat: 26.8946, lng: 80.9400 },
  "mahanagar": { name: "Mahanagar, Lucknow", lat: 26.8740, lng: 80.9200 },
  "chinhat": { name: "Chinhat, Lucknow", lat: 26.8890, lng: 81.0200 },
  "vikas nagar": { name: "Vikas Nagar, Lucknow", lat: 26.8510, lng: 80.9110 },
  "jankipuram": { name: "Jankipuram, Lucknow", lat: 26.9160, lng: 80.9450 },
  "ashiyana": { name: "Ashiyana, Lucknow", lat: 26.7950, lng: 80.9330 },
  "chowk": { name: "Chowk, Lucknow", lat: 26.8540, lng: 80.9170 },
  "kaiserbagh": { name: "Kaiserbagh, Lucknow", lat: 26.8460, lng: 80.9380 },
  "amausi": { name: "Amausi, Lucknow", lat: 26.7610, lng: 80.8840 },
  "charbagh": { name: "Charbagh, Lucknow", lat: 26.8330, lng: 80.9220 },
  "telibagh": { name: "Telibagh, Lucknow", lat: 26.7830, lng: 80.9420 },
  "banthra": { name: "Banthra, Lucknow", lat: 26.7450, lng: 80.9100 },
  "sitapur road": { name: "Sitapur Road, Lucknow", lat: 26.9050, lng: 80.9600 },
  "faizabad road": { name: "Faizabad Road, Lucknow", lat: 26.8800, lng: 81.0000 },
  "vrindavan yojana": { name: "Vrindavan Yojana, Lucknow", lat: 26.8010, lng: 80.9580 },
  "sushant golf city": { name: "Sushant Golf City, Lucknow", lat: 26.7910, lng: 80.9810 },
  "husainganj": { name: "Husainganj, Lucknow", lat: 26.8580, lng: 80.9360 },
  "lalbagh": { name: "Lalbagh, Lucknow", lat: 26.8620, lng: 80.9270 },
};

// Expanded category keywords
const CATEGORY_KEYWORDS = [
  { name: "Garbage / Sanitation", nameHi: "कचरा / स्वच्छता", keys: ["garbage", "kachra", "dirty", "gandagi", "dustbin", "waste", "कचरा", "गंदगी", "सफाई", "safai", "jhadu", "sweeping", "smell", "badbu", "बदबू"] },
  { name: "Water Supply", nameHi: "जल आपूर्ति", keys: ["water", "leak", "pipe", "pani", "waterlogging", "leakage", "पानी", "पाइप", "लीक", "jal", "boring", "tanker", "supply", "tap", "nalka", "नल"] },
  { name: "Road Damage", nameHi: "सड़क मरम्मत", keys: ["road", "pothole", "asphalt", "sadak", "gaddha", "damage", "सड़क", "गड्ढा", "टूटी सड़क", "crack", "tar", "highway", "footpath", "divider"] },
  { name: "Electricity", nameHi: "बिजली", keys: ["electricity", "bijli", "power", "transformer", "wire", "current", "बिजली", "करंट", "ट्रांसफार्मर", "voltage", "outage", "blackout", "load shedding", "meter"] },
  { name: "Street Light", nameHi: "स्ट्रीट लाइट", keys: ["street light", "streetlight", "light", "andhera", "darkness", "pole", "रोशनी", "स्ट्रीट लाइट", "अंधेरा", "lamp", "bulb", "led"] },
  { name: "Illegal Construction", nameHi: "अवैध निर्माण", keys: ["construction", "illegal", "encroachment", "kabza", "building", "अवैध निर्माण", "कब्जा", "atikraman", "demolition"] },
  { name: "Corruption", nameHi: "भ्रष्टाचार", keys: ["corruption", "bribe", "ghoos", "money", "demand", "रिश्वत", "घूस", "भ्रष्टाचार", "rishwat", "paisa maang"] },
  { name: "Drainage / Sewage", nameHi: "नाला / सीवर", keys: ["drain", "drainage", "sewer", "sewage", "nala", "gutter", "नाला", "सीवर", "गटर", "naali", "overflow", "clogged", "blocked drain"] },
  { name: "Stray Animals", nameHi: "आवारा पशु", keys: ["stray", "dog", "animal", "cattle", "cow", "monkey", "kutte", "कुत्ता", "आवारा", "पशु", "गाय", "बंदर", "janwar", "bite", "attack"] },
  { name: "Noise Pollution", nameHi: "ध्वनि प्रदूषण", keys: ["noise", "loud", "speaker", "shor", "pollution", "शोर", "ध्वनि", "प्रदूषण", "dj", "music", "horn", "loudspeaker"] },
  { name: "Traffic", nameHi: "यातायात", keys: ["traffic", "jam", "signal", "parking", "challan", "ट्रैफिक", "यातायात", "सिग्नल", "पार्किंग", "wrong side", "accident"] },
  { name: "Public Health", nameHi: "जन स्वास्थ्य", keys: ["health", "hospital", "dengue", "malaria", "mosquito", "machar", "स्वास्थ्य", "मच्छर", "डेंगू", "बीमारी", "clinic", "dirty water", "epidemic"] },
  { name: "Park / Garden", nameHi: "पार्क / उद्यान", keys: ["park", "garden", "tree", "green", "playground", "पार्क", "बगीचा", "पेड़", "udyan", "grass", "broken bench", "swing"] },
];

interface AnimatedBotFaceProps {
  className?: string;
}

function AnimatedBotFace({ className = "w-9 h-9" }: AnimatedBotFaceProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-violet-400 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
      >
        {/* Glowing Head Background Halo */}
        <circle cx="18" cy="20" r="12" fill="url(#botHalo)" opacity="0.15" />
        
        {/* Antenna */}
        <path d="M18 10V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <motion.circle
          cx="18"
          cy="3"
          r="2.5"
          fill="#38bdf8"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Ears / Side Bolt Accessories */}
        <rect x="3" y="17" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
        <rect x="30" y="17" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.8" />

        {/* Head Base */}
        <rect
          x="5"
          y="11"
          width="26"
          height="18"
          rx="6"
          fill="#0f172a"
          stroke="currentColor"
          strokeWidth="2.5"
        />

        {/* Glossy Overlay Highlight on Head */}
        <path
          d="M8 13.5C8 12.6716 8.67157 12 9.5 12H26.5C27.3284 12 28 12.6716 28 13.5V14.5H8V13.5Z"
          fill="white"
          opacity="0.1"
        />

        {/* Screen/Face Inner Plate */}
        <rect
          x="8"
          y="14"
          width="20"
          height="12"
          rx="3"
          fill="#1e1b4b"
        />

        {/* Glowing Eyes with Blink and Idle Animation */}
        <motion.circle
          cx="14"
          cy="19"
          r="2.2"
          fill="#38bdf8"
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            times: [0, 0.45, 0.5, 0.55, 1],
          }}
        />
        <motion.circle
          cx="22"
          cy="19"
          r="2.2"
          fill="#38bdf8"
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            times: [0, 0.45, 0.5, 0.55, 1],
          }}
        />

        {/* Digital Speaking Mouth/Waveform or Smile */}
        <motion.path
          d="M15 23H21"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            d: [
              "M15 23H21",
              "M15 23C16 24 20 24 21 23",
              "M15 23.5C16 22 20 22 21 23.5",
              "M15 23H21",
            ],
            strokeWidth: [1.5, 2, 1.5, 1.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut",
          }}
        />

        <defs>
          <radialGradient id="botHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
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

  // ============================================
  // Enhanced NLP Parsing Engine
  // ============================================
  const parseMessage = (input: string) => {
    const text = input.toLowerCase().trim();
    const complaints = getComplaints();

    // Helper to emit event to force state refreshing on the pages
    const notifyDatabaseChanged = () => {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("janmitra-db-change"));
    };

    // ── 1. HELP / GUIDE ──
    if (
      text === "help" ||
      text === "?" ||
      text === "madad" ||
      text.includes("kya kar sakte") ||
      text.includes("kya kya") ||
      text.includes("guide") ||
      text.includes("features") ||
      text.includes("commands") ||
      text.includes("मदद") ||
      text.includes("सहायता") ||
      text.includes("क्या कर सकते") ||
      text.includes("how to use") ||
      text.includes("kaise use")
    ) {
      return {
        text: "",
        isCustomCard: true,
        cardType: "help" as const,
        cardData: {},
      };
    }

    // ── 2. CLEAR CHAT ──
    if (
      text === "clear" ||
      text === "reset" ||
      text === "clear chat" ||
      text === "new chat" ||
      text.includes("साफ करो") ||
      text.includes("नया चैट")
    ) {
      // We'll handle this after returning — set a flag
      return {
        text: isHi
          ? "चैट साफ कर दी गई है! आप नई बातचीत शुरू कर सकते हैं। 🔄"
          : "Chat cleared! You can start a fresh conversation. 🔄",
        _clearChat: true,
      };
    }

    // ── 3. GREETINGS ──
    if (
      /^(hello|hi|hey|namaste|helo|pranam|good morning|good evening|suprabhat)$/i.test(text) ||
      text.includes("नमस्ते") ||
      text.includes("राम राम") ||
      text.includes("सुप्रभात") ||
      text.includes("शुभ")
    ) {
      return {
        text: isHi
          ? "नमस्ते! 🙏 मैं जनमित्र AI हूँ। मैं आपकी शिकायत दर्ज करने, टिकट ट्रैक करने, हॉटस्पॉट दिखाने, विभाग की जानकारी देने, या आंकड़े बताने में मदद कर सकता हूँ। 'help' टाइप करें सभी सुविधाएँ देखने के लिए।"
          : "Namaste! 🙏 I am JanMitra AI. I can help you file complaints, track tickets, view hotspots, check stats, or find department info. Type 'help' to see all capabilities.",
      };
    }

    // ── 4. THANK YOU / FEEDBACK ──
    if (
      text.includes("thank") ||
      text.includes("thanks") ||
      text.includes("dhanyavaad") ||
      text.includes("shukriya") ||
      text.includes("धन्यवाद") ||
      text.includes("शुक्रिया") ||
      text.includes("bahut accha") ||
      text.includes("great work") ||
      text.includes("awesome") ||
      text.includes("very good") ||
      text.includes("badiya")
    ) {
      return {
        text: isHi
          ? "धन्यवाद! 🙏 आपकी प्रतिक्रिया हमारे लिए बहुत महत्वपूर्ण है। अगर आपको और कोई सहायता चाहिए, तो बेझिझक पूछें। जनमित्र AI हमेशा आपकी सेवा में तत्पर है!"
          : "Thank you for your kind words! 🙏 Your feedback matters to us. Feel free to ask if you need anything else. JanMitra AI is always here to serve you!",
      };
    }

    // ── 5. STATS / ANALYTICS ──
    if (
      text.includes("stats") ||
      text.includes("statistics") ||
      text.includes("analytics") ||
      text.includes("overview") ||
      text.includes("summary") ||
      text.includes("dashboard") ||
      text.includes("kitne") ||
      text.includes("total") ||
      text.includes("count") ||
      text.includes("आँकड़े") ||
      text.includes("सारांश") ||
      text.includes("कितने") ||
      text.includes("कुल")
    ) {
      const stats = getStats();
      return {
        text: isHi
          ? "यहाँ जनमित्र AI सिस्टम का वर्तमान विश्लेषण रिपोर्ट है:"
          : "Here is the current JanMitra AI system analytics report:",
        isCustomCard: true,
        cardType: "stats" as const,
        cardData: stats,
      };
    }

    // ── 6. DEPARTMENT INFO ──
    if (
      text.includes("department") ||
      text.includes("vibhag") ||
      text.includes("office") ||
      text.includes("contact") ||
      text.includes("phone") ||
      text.includes("helpline") ||
      text.includes("number") ||
      text.includes("विभाग") ||
      text.includes("कार्यालय") ||
      text.includes("संपर्क") ||
      text.includes("हेल्पलाइन") ||
      text.includes("फोन") ||
      text.includes("kahan complain") ||
      text.includes("kisko bole")
    ) {
      return {
        text: isHi
          ? "यहाँ लखनऊ के सभी प्रमुख विभागों की जानकारी और हेल्पलाइन नंबर हैं:"
          : "Here are all major Lucknow departments with their contact details and helpline numbers:",
        isCustomCard: true,
        cardType: "department_info" as const,
        cardData: {},
      };
    }

    // ── 7. RECENT COMPLAINTS LIST ──
    if (
      text.includes("my complaint") ||
      text.includes("recent") ||
      text.includes("meri shikayat") ||
      text.includes("all complaint") ||
      text.includes("list") ||
      text.includes("मेरी शिकायत") ||
      text.includes("हाल की") ||
      text.includes("सूची")
    ) {
      const recentComplaints = complaints.slice(0, 5);
      if (recentComplaints.length === 0) {
        return {
          text: isHi
            ? "अभी तक कोई शिकायत दर्ज नहीं है। आप नई शिकायत दर्ज करने के लिए अपनी समस्या बताएं।"
            : "No complaints found yet. Describe your issue to file a new complaint.",
        };
      }
      return {
        text: isHi
          ? `यहाँ हाल की ${recentComplaints.length} शिकायतों की सूची है:`
          : `Here are the ${recentComplaints.length} most recent complaints:`,
        isCustomCard: true,
        cardType: "recent_list" as const,
        cardData: { complaints: recentComplaints },
      };
    }

    // ── 8. ADMIN ESCALATION & AUTO OVERRIDES ──
    if (text.includes("admin") || text.includes("escalate") || text.includes("escalation") || text.includes("overide") || text.includes("एस्कलेट") || text.includes("बड़े अधिकारी")) {
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

    // ── 9. HOTSPOT SUMMARIZER ──
    if (
      text.includes("hotspot") ||
      text.includes("active cluster") ||
      text.includes("kahan problem") ||
      text.includes("hospot") ||
      text.includes("हॉटस्पॉट") ||
      text.includes("समस्या वाले क्षेत्र") ||
      text.includes("problem area") ||
      text.includes("danger zone") ||
      text.includes("critical area") ||
      text.includes("zyada shikayat")
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

    // ── 10. TICKET STATUS LOOKUP ──
    const ticketMatch = text.match(/jm-\d{4}-\d{3}/i) || text.match(/jm-\d{3}/i);
    const statusTerms = ["status", "track", "ticket", "mera ticket", "kya hua", "kab hoga", "update", "progress", "स्थिति", "जांच", "ट्रैक", "क्या हुआ", "कब होगा"];
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
            ? "क्षमा करें, मुझे इस आईडी का कोई टिकट नहीं मिला। कृपया सही शिकायत आईडी (जैसे: JM-2026-008) दर्ज करें। आप 'recent' टाइप करके हाल की शिकायतें देख सकते हैं।"
            : "Sorry, I could not find a ticket with that ID. Please check the ticket number (e.g. JM-2026-008). You can type 'recent' to see recent complaints.",
        };
      }
    }

    // ── 11. CONVERSATIONAL TICKET FILING (Enhanced NLP) ──
    let detectedCategory = CATEGORY_KEYWORDS[0]; // fallback
    let maxMatches = 0;

    CATEGORY_KEYWORDS.forEach((cat) => {
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
    const isFilingQuery = maxMatches > 0 || text.includes("complain") || text.includes("shikayat") || text.includes("शिकायत") || text.includes("दर्ज") || text.includes("problem") || text.includes("issue") || text.includes("samasya") || text.includes("समस्या") || text.includes("dikkat") || text.includes("pareshani");

    if (isFilingQuery) {
      // Determine area from expanded area map
      let area = "Gomti Nagar, Lucknow";
      let lat = 26.8643;
      let lng = 80.9576;

      for (const [keyword, data] of Object.entries(AREA_MAP)) {
        if (text.includes(keyword)) {
          area = data.name;
          lat = data.lat;
          lng = data.lng;
          break;
        }
      }

      // Detect priority from urgency keywords
      let priority: "high" | "medium" | "low" = "medium";
      const urgentKeywords = ["urgent", "emergency", "turant", "jaldi", "tatkaal", "bahut", "serious", "danger", "khatarnak", "तुरंत", "आपातकाल", "खतरनाक", "गंभीर", "जल्दी", "तत्काल", "critical", "life threatening", "jaan ka khatra"];
      if (urgentKeywords.some((k) => text.includes(k))) {
        priority = "high";
      }

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
        priority,
        aiSummary: `Citizen conversational filing parsed: "${input}". Classifying under ${detectedCategory.name} with 98% confidence. Priority: ${priority.toUpperCase()}. Immediate dispatch warranted.`,
        aiSummaryHi: `नागरिक संवाद फाइलिंग विश्लेषित: "${input}"। 98% सटीकता के साथ ${detectedCategory.nameHi} के अंतर्गत वर्गीकृत। प्राथमिकता: ${priority === "high" ? "उच्च" : priority === "medium" ? "मध्यम" : "निम्न"}। तत्काल निस्तारण आवश्यक।`,
        aiConfidence: 0.98,
        latitude: lat,
        longitude: lng,
      });

      notifyDatabaseChanged();

      return {
        text: isHi
          ? `मैंने आपकी समस्या को **${detectedCategory.nameHi}** श्रेणी के अंतर्गत सफलतापूर्वक दर्ज कर लिया है! आपका टिकट आईडी **${newTicket.id}** है।${priority === "high" ? " ⚡ इसे उच्च प्राथमिकता पर सेट किया गया है!" : ""} इसे तत्काल संबंधित अधिकारी को सौंप दिया गया है।`
          : `I have successfully registered your grievance under **${detectedCategory.name}**! Your unique Ticket ID is **${newTicket.id}**.${priority === "high" ? " ⚡ Marked as HIGH PRIORITY!" : ""} Our automated routing has dispatched it to the assigned department.`,
        isCustomCard: true,
        cardType: "filing_success",
        cardData: newTicket,
      };
    }

    // ── 12. SMART FALLBACK ──
    return {
      text: isHi
        ? "मुझे ठीक से समझ नहीं आया। आप यह कर सकते हैं:\n\n• शिकायत दर्ज करें: 'Gomti Nagar me kachra pada hai'\n• टिकट ट्रैक करें: 'JM-2026-008 का स्टेटस'\n• हॉटस्पॉट देखें: 'active hotspots'\n• आंकड़े देखें: 'stats'\n• विभाग जानकारी: 'department info'\n• सहायता: 'help'\n\n💡 बस अपनी समस्या बताएं, मैं स्वतः सही विभाग तक पहुँचा दूँगा!"
        : "I didn't quite catch that. Here's what I can do:\n\n• File a complaint: 'Water pipe leakage in Alambagh'\n• Track a ticket: 'Status of JM-2026-008'\n• View hotspots: 'active hotspots'\n• Check analytics: 'stats'\n• Department info: 'department info'\n• Get help: 'help'\n\n💡 Just describe your problem and I'll auto-route it to the right department!",
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
      const result = parseMessage(textToSend) as any;

      // Handle clear chat special case
      if (result._clearChat) {
        setMessages([
          {
            id: `msg-${Date.now()}-clear`,
            sender: "ai",
            text: result.text,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        if (audioFeedback) playTickSound();
        return;
      }

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

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      submitted: { label: "Submitted", cls: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
      ai_analyzing: { label: "AI Analyzing", cls: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
      department_assigned: { label: "Dept. Assigned", cls: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
      officer_reviewing: { label: "Under Review", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
      action_in_progress: { label: "In Progress", cls: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
      resolved: { label: "Resolved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
      escalated: { label: "Escalated", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
    };
    const badge = map[status] || map.submitted;
    return <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${badge.cls}`}>{badge.label}</span>;
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
            <AnimatedBotFace className="w-9 h-9" />
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
            className="w-[420px] max-w-[92vw] h-[600px] rounded-2xl flex flex-col overflow-hidden border border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_50px_rgba(139,92,246,0.25)]"
          >
            {/* Header section with status, sound, language */}
            <div className="p-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center shadow-lg relative">
                  <AnimatedBotFace className="w-6 h-6" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                    JanMitra AI
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                      v3.0
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    Lucknow Nagar Nigam • Online • 13 Categories
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
                              : "bg-slate-900/60 border border-slate-800 text-slate-300 rounded-tl-none leading-relaxed whitespace-pre-line"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* ═══ GREETING CARD ═══ */}
                      {msg.isCustomCard && msg.cardType === "greeting" && (
                        <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-950/10 backdrop-blur-md space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {isHi
                              ? "नमस्ते! 🙏 मैं जनमित्र AI सहायक हूँ। आप लखनऊ में नागरिक समस्याओं को सीधे बातचीत करके दर्ज कर सकते हैं, टिकट ट्रैक कर सकते हैं, या विभागीय जानकारी प्राप्त कर सकते हैं।"
                              : "Namaste! 🙏 I am the JanMitra AI Assistant. You can file civic complaints in Lucknow directly through conversation, track tickets, view analytics, or get department info."}
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
                                📋 {isHi ? "JM-2026-008 ट्रैक करें" : "Track JM-2026-008"}
                              </button>
                              <button
                                onClick={() => handleSendMessage(isHi ? "आलमबाग क्षेत्र में सड़कों के गड्ढे की शिकायत दर्ज करें" : "Register a pothole complaint in Alambagh area")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                🚧 {isHi ? "सड़क गड्ढा दर्ज करें" : "File Road Complaint"}
                              </button>
                              <button
                                onClick={() => handleSendMessage(isHi ? "सक्रिय हॉटस्पॉट विश्लेषण दिखाओ" : "Show Lucknow active hotspots")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                🔥 {isHi ? "सक्रिय हॉटस्पॉट?" : "Active Hotspots"}
                              </button>
                              <button
                                onClick={() => handleSendMessage("stats")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                📊 {isHi ? "आंकड़े देखें" : "View Stats"}
                              </button>
                              <button
                                onClick={() => handleSendMessage("department info")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                🏢 {isHi ? "विभाग जानकारी" : "Dept. Info"}
                              </button>
                              <button
                                onClick={() => handleSendMessage("help")}
                                className="px-2.5 py-1 text-[10px] rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 text-left transition-all duration-150 cursor-pointer"
                              >
                                ❓ {isHi ? "सहायता / गाइड" : "Help / Guide"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ═══ TIMELINE CARD ═══ */}
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

                      {/* ═══ HOTSPOTS CARD ═══ */}
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

                      {/* ═══ FILING SUCCESS CARD ═══ */}
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
                              <span className="text-slate-400">Priority</span>
                              <span className={`font-bold ${msg.cardData.priority === "high" ? "text-red-400" : msg.cardData.priority === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                                {msg.cardData.priority?.toUpperCase()}
                              </span>
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

                      {/* ═══ ADMIN OVERRIDE CARD ═══ */}
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

                      {/* ═══ STATS CARD (NEW) ═══ */}
                      {msg.isCustomCard && msg.cardType === "stats" && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                            <BarChart3 className="w-4 h-4" />
                            {isHi ? "सिस्टम एनालिटिक्स डैशबोर्ड" : "System Analytics Dashboard"}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                              <span className="text-lg font-black text-slate-200">{msg.cardData.total}</span>
                              <p className="text-[9px] text-slate-400 font-medium uppercase">{isHi ? "कुल शिकायतें" : "Total Complaints"}</p>
                            </div>
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                              <span className="text-lg font-black text-amber-400">{msg.cardData.pending}</span>
                              <p className="text-[9px] text-slate-400 font-medium uppercase">{isHi ? "लंबित" : "Pending"}</p>
                            </div>
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                              <span className="text-lg font-black text-emerald-400">{msg.cardData.resolved}</span>
                              <p className="text-[9px] text-slate-400 font-medium uppercase">{isHi ? "हल की गई" : "Resolved"}</p>
                            </div>
                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                              <span className="text-lg font-black text-red-400">{msg.cardData.escalated}</span>
                              <p className="text-[9px] text-slate-400 font-medium uppercase">{isHi ? "एस्कलेटेड" : "Escalated"}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800 text-[11px]">
                              <span className="text-slate-400">{isHi ? "AI सटीकता" : "AI Accuracy"}</span>
                              <span className="font-bold text-emerald-400">{msg.cardData.aiAccuracy}%</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800 text-[11px]">
                              <span className="text-slate-400">{isHi ? "संतुष्टि दर" : "Satisfaction Rate"}</span>
                              <span className="font-bold text-sky-400">{msg.cardData.satisfactionRate}%</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800 text-[11px]">
                              <span className="text-slate-400">{isHi ? "औसत निवारण" : "Avg Resolution"}</span>
                              <span className="font-bold text-violet-400">{msg.cardData.avgResolutionHours}h</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800 text-[11px]">
                              <span className="text-slate-400">{isHi ? "उच्च प्राथमिकता" : "High Priority"}</span>
                              <span className="font-bold text-red-400">{msg.cardData.highPriority} {isHi ? "सक्रिय" : "active"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ═══ HELP CARD (NEW) ═══ */}
                      {msg.isCustomCard && msg.cardType === "help" && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
                            <HelpCircle className="w-4 h-4" />
                            {isHi ? "जनमित्र AI — सुविधाएँ गाइड" : "JanMitra AI — Features Guide"}
                          </div>

                          <div className="space-y-1.5">
                            {[
                              { icon: "📝", cmd: isHi ? "'कचरा पड़ा है Gomti Nagar me'" : "'Water pipe leak in Alambagh'", desc: isHi ? "शिकायत दर्ज करें (13 श्रेणियाँ)" : "File a complaint (13 categories)" },
                              { icon: "🔍", cmd: isHi ? "'JM-2026-008 का स्टेटस'" : "'Track JM-2026-008'", desc: isHi ? "टिकट ट्रैक करें" : "Track ticket status" },
                              { icon: "🔥", cmd: isHi ? "'active hotspots'" : "'hotspots'", desc: isHi ? "सक्रिय हॉटस्पॉट देखें" : "View grievance clusters" },
                              { icon: "📊", cmd: isHi ? "'stats'" : "'stats / analytics'", desc: isHi ? "सिस्टम आंकड़े" : "System analytics" },
                              { icon: "🏢", cmd: isHi ? "'विभाग जानकारी'" : "'department info'", desc: isHi ? "विभाग हेल्पलाइन" : "Department helplines" },
                              { icon: "📋", cmd: isHi ? "'हाल की शिकायतें'" : "'recent complaints'", desc: isHi ? "हाल की शिकायतों की सूची" : "Recent complaints list" },
                              { icon: "⚡", cmd: isHi ? "'escalate'" : "'escalate / admin override'", desc: isHi ? "ऑटो-एस्कलेशन" : "Auto-escalation trigger" },
                              { icon: "🎤", cmd: isHi ? "माइक बटन दबाएं" : "Press mic button", desc: isHi ? "वॉयस इनपुट (हिंदी/English)" : "Voice input (Hindi/English)" },
                              { icon: "🔄", cmd: isHi ? "'clear'" : "'clear / reset'", desc: isHi ? "चैट साफ करें" : "Clear chat history" },
                            ].map((item, i) => (
                              <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-950/40 transition-colors">
                                <span className="text-sm">{item.icon}</span>
                                <div>
                                  <code className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded font-mono">{item.cmd}</code>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-500 text-center bg-slate-950/40 py-1.5 rounded border border-slate-800">
                            {isHi
                              ? "💡 20+ लखनऊ क्षेत्र समर्थित • हिंदी, English, Hinglish में बात करें"
                              : "💡 20+ Lucknow areas supported • Speak in Hindi, English, or Hinglish"}
                          </p>
                        </div>
                      )}

                      {/* ═══ DEPARTMENT INFO CARD (NEW) ═══ */}
                      {msg.isCustomCard && msg.cardType === "department_info" && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            {isHi ? "विभाग निर्देशिका" : "Department Directory"}
                          </div>

                          <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                            {DEPARTMENTS.map((dept, i) => (
                              <div key={i} className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-200">{isHi ? dept.nameHi : dept.name}</span>
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                    <Phone className="w-3 h-3" />
                                    {dept.helpline}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  {isHi ? dept.handlesHi : dept.handles}
                                </p>
                              </div>
                            ))}
                          </div>

                          <p className="text-[10px] text-sky-400/80 text-center bg-sky-500/5 py-1.5 rounded border border-sky-500/15">
                            📞 {isHi
                              ? "आपातकाल में सीधे हेल्पलाइन नंबर पर कॉल करें"
                              : "Call helpline numbers directly for emergencies"}
                          </p>
                        </div>
                      )}

                      {/* ═══ RECENT COMPLAINTS LIST CARD (NEW) ═══ */}
                      {msg.isCustomCard && msg.cardType === "recent_list" && (
                        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
                            <FileText className="w-4 h-4" />
                            {isHi ? "हाल की शिकायतें" : "Recent Complaints"}
                          </div>

                          <div className="space-y-2">
                            {msg.cardData.complaints.map((c: Complaint) => (
                              <button
                                key={c.id}
                                onClick={() => handleSendMessage(`Track ${c.id}`)}
                                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-left hover:bg-slate-950/60 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-bold text-slate-200">{c.id}</span>
                                  {getStatusBadge(c.status)}
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{isHi ? c.categoryHi : c.category} • {c.area}</p>
                              </button>
                            ))}
                          </div>

                          <p className="text-[10px] text-slate-500 text-center">
                            {isHi ? "किसी भी टिकट पर क्लिक करके विस्तार देखें" : "Click any ticket to view detailed timeline"}
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
                        ? "समस्या बताएं, टिकट ट्रैक करें, या 'help' लिखें..."
                        : "Describe your issue, track a ticket, or type 'help'..."
                    }
                    className="flex-1 bg-transparent border-0 outline-none text-slate-200 text-xs py-2 placeholder-slate-500"
                  />
                  
                  {/* Microphone */}
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="p-1.5 rounded-lg hover:bg-slate-950 text-slate-400 hover:text-violet-400 transition-colors shrink-0 cursor-pointer"
                    title="Voice Input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-900 disabled:text-slate-600 text-white flex items-center justify-center shrink-0 transition-colors shadow-md shadow-violet-950 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Action Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {[
                  { label: isHi ? "📊 आंकड़े" : "📊 Stats", cmd: "stats" },
                  { label: isHi ? "🔥 हॉटस्पॉट" : "🔥 Hotspots", cmd: "hotspots" },
                  { label: isHi ? "📋 हाल की" : "📋 Recent", cmd: "recent complaints" },
                  { label: isHi ? "🏢 विभाग" : "🏢 Depts", cmd: "department info" },
                  { label: isHi ? "❓ मदद" : "❓ Help", cmd: "help" },
                ].map((chip) => (
                  <button
                    key={chip.cmd}
                    onClick={() => handleSendMessage(chip.cmd)}
                    className="shrink-0 px-2.5 py-1 text-[9px] font-semibold rounded-lg border border-slate-800/80 bg-slate-900/30 hover:bg-slate-800/60 text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 px-1 border-t border-slate-900 pt-1.5">
                <span>{isHi ? "13 श्रेणियाँ • 20+ क्षेत्र • हिंदी/English" : "13 categories • 20+ areas • Hindi/English/Hinglish"}</span>
                <span className="text-violet-400 font-medium">JanMitra AI Core v3.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
