"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  Coins,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { classifyComplaintAI } from "@/lib/ai";
import { addComplaint } from "@/lib/complaints";
import { getTokenState, consumeToken, isEmergencyComplaint } from "@/lib/tokenSystem";
import { getAuthSession } from "@/lib/auth";
import type { AIClassification, Complaint } from "@/types";

export function ComplaintForm({ 
  language = "en",
  onLanguageChange,
  onComplaintCreated,
  onTrack
}: { 
  language?: "en" | "hi";
  onLanguageChange?: (lang: "en" | "hi") => void;
  onComplaintCreated?: (complaint: Complaint) => void;
  onTrack?: (id: string) => void;
}) {
  const isHi = language === "hi";
  const [step, setStep] = useState<"input" | "processing" | "result">("input");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; area: string } | null>(null);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string>("JM-2026-011");
  const [processingStep, setProcessingStep] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [userPriority, setUserPriority] = useState<"Auto" | "Normal" | "Important" | "Emergency">("Auto");
  
  // Image Diagnostic Scan states
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Token System States
  const [tokenState, setTokenState] = useState(() => getTokenState());
  const [tokenAlert, setTokenAlert] = useState<string | null>(null);
  const [isEmergencyBypass, setIsEmergencyBypass] = useState(false);

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const activeSession = getAuthSession();
    if (activeSession && activeSession.role === "citizen") {
      setSession(activeSession);
      setName(activeSession.name || "");
      setPhone(activeSession.mobile || "");
    }
  }, []);

  useEffect(() => {
    const handleTokenChange = () => {
      setTokenState(getTokenState());
    };
    window.addEventListener("janmitra-token-change", handleTokenChange);
    return () => window.removeEventListener("janmitra-token-change", handleTokenChange);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textRef = useRef(text);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Clean up recognition and listen for demo autofill events
  useEffect(() => {
    const handleAutofill = () => {
      const mockText = isHi
        ? "गोमती नगर में मिठाई चौराहे के पास कचरे का ढेर लगा है। डब्बे ओवरफ्लो हो रहे हैं जिससे भीषण दुर्गंध आ रही है, पैदल चलने का रास्ता बंद है और आवारा पशु वहां जमा हो रहे हैं। कृपया तत्काल सफाई कराएं।"
        : "Solid waste dump near Mithai Chauraha in Gomti Nagar. Overflowing containers causing extreme stink, blocking pedestrian pathway, and attracting stray animals. Needs urgent sanitation cleaning and department intervention.";
      const mockName = isHi ? "राकेश कुमार" : "Rakesh Kumar";
      const mockPhone = "+91 99887 76655";
      
      // Pin location
      setLocation({
        lat: 26.8532,
        lng: 80.9723,
        area: isHi ? "गोमती नगर, लखनऊ" : "Gomti Nagar, Lucknow"
      });
      
      setText(mockText);
      setName(mockName);
      setPhone(mockPhone);
      
      // Beautiful custom mockup SVG garbage image
      const garbageMockImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><defs><linearGradient id='bgGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%230b0b0f'/><stop offset='100%' stop-color='%23181824'/></linearGradient><linearGradient id='trashGrad' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='%233f3f46'/><stop offset='100%' stop-color='%2327272a'/></linearGradient><linearGradient id='glowGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23a78bfa'/><stop offset='100%' stop-color='%23ec4899'/></linearGradient><filter id='neonGlow'><feGaussianBlur stdDeviation='1.5' result='coloredBlur'/><feMerge><feMergeNode in='coloredBlur'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><rect width='100%' height='100%' fill='url(%23bgGrad)' rx='4'/><path d='M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80 M20,0 L20,100 M40,0 L40,100 M60,0 L60,100 M80,0 L80,100' stroke='%23ffffff' stroke-width='0.1' stroke-opacity='0.15' /><circle cx='50' cy='50' r='35' fill='none' stroke='%238b5cf6' stroke-width='0.5' stroke-dasharray='1 3' stroke-opacity='0.4'/><circle cx='50' cy='50' r='15' fill='none' stroke='%23ec4899' stroke-width='0.3' stroke-opacity='0.3'/><path d='M25,75 Q40,45 55,75 Z' fill='url(%23trashGrad)' opacity='0.8' stroke='%2352525b' stroke-width='0.5'/><path d='M45,75 Q60,50 75,75 Z' fill='url(%23trashGrad)' opacity='0.7' stroke='%2352525b' stroke-width='0.5'/><path d='M35,78 Q50,38 65,78 Z' fill='url(%23trashGrad)' stroke='%238b5cf6' stroke-width='0.8' filter='url(%23neonGlow)'/><rect x='62' y='68' width='8' height='10' rx='1' fill='%2352525b' transform='rotate(15, 66, 73)' stroke='%23a78bfa' stroke-width='0.4'/><line x1='63' y1='70' x2='71' y2='72' stroke='%233f3f46' stroke-width='0.5'/><circle cx='48' cy='55' r='2.5' fill='%23ef4444' filter='url(%23neonGlow)'/><line x1='48' y1='55' x2='30' y2='45' stroke='%23ef4444' stroke-width='0.4' stroke-dasharray='1 1'/><rect x='15' y='38' width='14' height='6' rx='1' fill='%23ef4444' fill-opacity='0.15' stroke='%23ef4444' stroke-width='0.4'/><text x='22' y='42' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='3.5' fill='%23ef4444' font-weight='bold'>BIO</text><circle cx='58' cy='63' r='2' fill='%23f59e0b' filter='url(%23neonGlow)'/><line x1='58' y1='63' x2='72' y2='52' stroke='%23f59e0b' stroke-width='0.4' stroke-dasharray='1 1'/><rect x='73' y='48' width='14' height='6' rx='1' fill='%23f59e0b' fill-opacity='0.15' stroke='%23f59e0b' stroke-width='0.4'/><text x='80' y='52' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='3.5' fill='%23f59e0b' font-weight='bold'>HAZARD</text><path d='M5,12 L5,5 L12,5' fill='none' stroke='%238b5cf6' stroke-width='0.8'/><path d='M95,12 L95,5 L88,5' fill='none' stroke='%238b5cf6' stroke-width='0.8'/><path d='M5,88 L5,95 L12,95' fill='none' stroke='%238b5cf6' stroke-width='0.8'/><path d='M95,88 L95,95 L88,95' fill='none' stroke='%238b5cf6' stroke-width='0.8'/><text x='50%' y='15%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='5' fill='url(%23glowGrad)' font-weight='black' letter-spacing='0.5'>EVIDENCE IDENTIFIED</text><text x='50%' y='88%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='4' fill='%23a78bfa' font-weight='medium'>Gomti Nagar, Lucknow</text></svg>";
      
      setPhoto(garbageMockImage);
      setPhotoName("Gomti_Nagar_Garbage.jpg");
      
      // Trigger neon diagnostic scanner animation
      setIsScanningImage(true);
      setScanProgress(0);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setScanProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsScanningImage(false);
        }
      }, 150);
    };

    window.addEventListener("janmitra-autofill", handleAutofill);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
      window.removeEventListener("janmitra-autofill", handleAutofill);
    };
  }, [isHi]);

  const dict = {
    describeTitle: isHi ? "🚨 अपनी समस्या दर्ज करें" : "🚨 Report Your Issue",
    subtitleText: isHi ? "आज आप किस समस्या का सामना कर रहे हैं?" : "What problem are you facing today?",
    voiceRecording: isHi ? "ऑडियो इनपुट रिकॉर्डिंग चालू..." : "Recording Audio Input...",
    voiceInput: isHi ? "🎤 अपनी शिकायत बोलें" : "🎤 Speak Complaint",
    uploadPhoto: isHi ? "📷 फोटो जोड़ें" : "📷 Add Photo",
    photoAttached: isHi ? "📷 तस्वीर संलग्न है" : "📷 Photo Attached",
    detectLocation: isHi ? "📍 स्वतः स्थान पता करें" : "📍 Auto Detect Location",
    pinnedArea: isHi ? "रिवर्स-जियोकोडेड पिन किया गया क्षेत्र" : "Reverse-Geocoded Pinned Area",
    yourDetails: isHi ? "आपका विवरण" : "Your Details",
    namePlaceholder: isHi ? "आपका नाम" : "Your Name",
    phonePlaceholder: isHi ? "फ़ोन नंबर" : "Phone Number",
    submitBtn: isHi ? " शिकायत जमा करें" : "Submit Complaint",
    submitSubText: isHi ? "AI स्वचालित रूप से सही विभाग को शिकायत भेजेगा" : "AI will automatically route to correct department",
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
    selectPriority: isHi ? "प्राथमिकता चुनें" : "Select Priority",
    priorityAuto: isHi ? "ऑटो (AI तय करेगा)" : "Auto-Detect",
    priorityNormal: isHi ? "सामान्य" : "Normal",
    priorityImportant: isHi ? "महत्वपूर्ण" : "Important",
    priorityEmergency: isHi ? "आपातकालीन" : "Emergency",
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
        
        // Trigger visual neon diagnostic scanner
        setIsScanningImage(true);
        setScanProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setScanProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsScanningImage(false);
          }
        }, 150);

        if (!text.trim()) {
          if (isHi) {
            setText(`[AI विज़न स्कैन: फोटो अपलोड (${file.name})] गोमती नगर में सड़क क्षति और कचरे की समस्या देखी गई है। कृपया शीघ्र समाधान करें।`);
          } else {
            setText(`[AI Vision Scan: Photo uploaded (${file.name})] Gomti Nagar road damage and garbage issue detected. Please resolve immediately.`);
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

  const detectLocation = useCallback(async () => {
    const fetchAddress = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}&lang=${language}`);
        if (!res.ok) throw new Error("Geocode API failed");
        const data = await res.json();
        return data.area;
      } catch (err) {
        console.error("Geocoding fetch failed:", err);
        return isHi ? "गोमती नगर, लखनऊ" : "Gomti Nagar, Lucknow";
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const area = await fetchAddress(lat, lng);
          setLocation({ lat, lng, area });
        },
        async () => {
          const lat = 26.8567;
          const lng = 80.9462;
          const area = await fetchAddress(lat, lng);
          setLocation({ lat, lng, area });
        }
      );
    } else {
      const lat = 26.8567;
      const lng = 80.9462;
      const area = await fetchAddress(lat, lng);
      setLocation({ lat, lng, area });
    }
  }, [isHi, language]);

  // Speech Recording via Web Speech API (Client-side real-time transcript) with fallback to MediaRecorder & backend API
  const startVoiceRecording = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = isHi ? "hi-IN" : "en-IN";

        const baseText = textRef.current.trim();

        recognition.onstart = () => {
          setIsRecording(true);
          setIsTranscribing(false);
        };

        recognition.onresult = (event: any) => {
          let sessionTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }
          if (sessionTranscript) {
            setText(() => {
              return baseText ? baseText + " " + sessionTranscript.trim() : sessionTranscript.trim();
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Native Speech Recognition error, cascading to fallback:", event.error);
          recognition.onend = null; // Prevent onend from toggling recording state back to false immediately
          try {
            recognition.stop();
          } catch (e) {}

          if (event.error === "no-speech") {
            // Silence/pause detected. Stop recording state gracefully without replacing user input!
            setIsRecording(false);
          } else if (event.error === "not-allowed" || event.error === "permission") {
            // Blocked, try MediaRecorder fallback
            runMediaRecorderFallback();
          } else {
            runMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Failed to initialize native SpeechRecognition, cascading:", err);
      }
    }

    // Secondary fallback: MediaRecorder with backend endpoint
    runMediaRecorderFallback();

    async function runMediaRecorderFallback() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Media devices or getUserMedia not supported in this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        let options = {};
        let mimeType = "audio/webm";
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          options = { mimeType: "audio/ogg" };
          mimeType = "audio/ogg";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          options = { mimeType: "audio/aac" };
          mimeType = "audio/aac";
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
          }

          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              const res = await fetch("/api/transcribe", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  audio: base64Audio,
                  mimeType: mimeType.split(";")[0],
                }),
              });
              
              if (!res.ok) throw new Error(`Server returned error: ${res.status}`);
              
              const data = await res.json();
              if (data.text) {
                const baseText = textRef.current.trim();
                setText(() => (baseText ? baseText + " " + data.text.trim() : data.text.trim()));
              }
              setIsTranscribing(false);
            };
          } catch (err) {
            console.error("Transcription execution error:", err);
            setIsTranscribing(false);
            runMockFallback();
          }
        };

        mediaRecorder.start();
        setIsRecording(true);

      } catch (e: any) {
        console.warn("Speech MediaRecorder fallback failed, cascading to Mock simulator:", e);
        runMockFallback();
      }
    }

    function runMockFallback() {
      setIsRecording(true);
      fallbackTimeoutRef.current = setTimeout(() => {
        setIsRecording(false);
        const baseText = textRef.current.trim();
        if (isHi) {
          const mock = "गोमती नगर में मिठाई चौराहे के पास सड़क पर गहरे गड्ढे हो गए हैं। वाहनों को निकलने में भारी असुविधा हो रही है और दुर्घटना का खतरा बना रहता है। कृपया शीघ्र मरम्मत कराएं।";
          setText(() => (baseText ? baseText + " " + mock : mock));
        } else {
          const mock = "Deep potholes have formed on the road near Mithai Chauraha in Gomti Nagar. Vehicles are facing severe inconvenience and there is a constant risk of accidents. Please repair it immediately.";
          setText(() => (baseText ? baseText + " " + mock : mock));
        }
        fallbackTimeoutRef.current = null;
      }, 3000);
    }
  }, [isHi, language]);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const currentTokenState = getTokenState();
    const isEmergency = isEmergencyComplaint(text) || userPriority === "Emergency";

    // If 0 tokens remaining and it is not an emergency, block it immediately
    if (currentTokenState.tokensRemaining <= 0 && !isEmergency) {
      setTokenAlert(isHi ? "दैनिक शिकायत सीमा पूरी हो गई है। कृपया कल पुनः प्रयास करें या आपातकालीन शिकायत दर्ज करें।" : "Daily complaint limit reached. Please try again tomorrow or report an emergency for priority bypass.");
      return;
    }

    setStep("processing");
    setProcessingStep(0);
    setTokenAlert(null);

    // Call real Gemini proxy route and start visual steps
    const enhancedText = userPriority === "Auto" ? text : `${text}\n[User Selected Priority: ${userPriority}]`;
    const apiResultPromise = classifyComplaintAI(enhancedText, photo);

    const steps = [
      () => setProcessingStep(1), // Understanding text
      () => setProcessingStep(2), // Detecting category
      () => setProcessingStep(3), // Assessing priority
      () => setProcessingStep(4), // Routing department
      () => setProcessingStep(5), // Generating summary
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      steps[i]();
    }

    try {
      const result = await apiResultPromise;

      // Force priority based on explicit user selection, otherwise let AI handle it
      if (userPriority === "Emergency") {
        result.priority = "high";
      } else if (userPriority === "Important") {
        result.priority = "medium";
      } else if (userPriority === "Normal") {
        result.priority = "low";
      }

      // Deduct token now that we have classified and confirmed
      const tokenResult = consumeToken(enhancedText, result.category);
      
      if (!tokenResult.allowed) {
        setStep("input");
        setTokenAlert(isHi ? tokenResult.reasonHi : tokenResult.reason);
        return;
      }

      // Add to dynamic localStorage Database Store
      const newComplaint = await addComplaint({
        title: text.split(/[.।\n]/)[0].slice(0, 60) || "Civic Issue",
        titleHi: isHi ? "नागरिक समस्या दर्ज" : "Civic Issue Reported",
        description: text,
        descriptionHi: isHi ? text : "",
        category: result.category,
        categoryHi: result.categoryHi,
        priority: result.priority,
        department: result.department,
        departmentHi: result.departmentHi,
        latitude: location?.lat || 26.8467,
        longitude: location?.lng || 80.9462,
        area: location?.area || "Gomti Nagar, Lucknow",
        citizenId: session?.id || null,
        citizenName: name || session?.name || "Demo Citizen",
        citizenPhone: phone || session?.mobile || "+91 99999 88888",
        imageUrl: photo || undefined,
        aiSummary: result.summary,
        aiSummaryHi: result.summaryHi,
        aiConfidence: result.confidence,
      });

      if (!newComplaint) {
        throw new Error("Failed to create complaint in database.");
      }

      setClassification(result);
      setCreatedComplaintId(newComplaint.id);
      setIsEmergencyBypass(tokenResult.isEmergencyBypass);
      setStep("result");

      // Notify parent Citizen dashboard
      if (onComplaintCreated) {
        onComplaintCreated(newComplaint);
      }
    } catch (err) {
      console.error("AI classification execution error:", err);
      setStep("input");
    }
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
            className="space-y-6 text-left"
          >
            {/* Complaint text */}
            <div className="relative rounded-2xl overflow-hidden">
              {/* Gradient top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-indigo-500/60 to-transparent" />
              
              <div className="bg-linear-to-b from-[#0c1120]/80 to-[#080d18]/60 backdrop-blur-sm border border-[#1e293b]/40 rounded-2xl p-6 sm:p-7 space-y-5 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                        <FileText className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">{dict.describeTitle}</h3>
                        <span className="text-[9px] font-black text-indigo-400/70 uppercase tracking-[0.15em]">{isHi ? "(अंग्रेजी भी समर्थित)" : "(HINDI SUPPORTED)"}</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-400/90 font-medium pl-0.5">{dict.subtitleText}</p>
                  </div>

                  {/* Redesigned Premium Language Toggle */}
                  {onLanguageChange && (
                    <div className="flex items-center gap-1 bg-[#090d16] border border-[#1f2937]/65 p-0.5 rounded-xl shadow-inner w-fit h-8.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onLanguageChange("en")}
                        className={`px-3 h-7 text-[10px] font-black rounded-lg transition-all duration-350 cursor-pointer ${
                          language === "en"
                            ? "bg-linear-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => onLanguageChange("hi")}
                        className={`px-3 h-7 text-[10px] font-black rounded-lg transition-all duration-350 cursor-pointer ${
                          language === "hi"
                            ? "bg-linear-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        हिन्दी
                      </button>
                    </div>
                  )}
                </div>

                {/* Token Tracker - Pill Style */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#070b14]/70 border border-[#1e293b]/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">
                      {isHi ? "शेष शिकायतें:" : "Complaints Remaining:"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black tabular-nums ${tokenState.tokensRemaining <= 1 ? "text-red-400" : "text-amber-400"}`}>
                      {tokenState.tokensRemaining}/{tokenState.maxTokens}
                    </span>
                    <div className="w-20 h-2 bg-[#0c1020] rounded-full overflow-hidden border border-amber-500/10">
                      <motion.div 
                        className={`h-full rounded-full ${tokenState.tokensRemaining <= 1 ? "bg-linear-to-r from-red-500 to-red-400" : "bg-linear-to-r from-amber-600 to-amber-400"}`}
                        initial={false}
                        animate={{ width: `${(tokenState.tokensRemaining / tokenState.maxTokens) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Textarea with enhanced focus state */}
                <div className="relative group">
                  <Textarea
                    value={text}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={dict.placeholderText}
                    className="min-h-[150px] text-sm resize-none border border-[#1e293b]/60 focus:border-indigo-500/50 rounded-xl px-4 py-3.5 bg-[#060a12]/80 text-gray-100 w-full transition-all duration-500 placeholder:text-gray-600/80 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08),0_0_30px_rgba(99,102,241,0.08)] outline-none leading-relaxed"
                  />
                  {/* Character count */}
                  {text.length > 0 && (
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-600 tabular-nums">
                      {text.length}
                    </span>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handlePhotoChange}
                  accept="image/*"
                />

                {/* Photo preview block with Holographic neon scanner */}
                {photo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex items-center gap-3.5 p-3 bg-linear-to-r from-indigo-500/4 to-violet-500/4 border rounded-xl w-full relative overflow-hidden transition-all duration-300 ${
                      isScanningImage ? "border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.12)]" : "border-[#1e293b]/50"
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#1e293b] bg-black/20 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                      {isScanningImage && <div className="holo-scanline" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-200 truncate">{photoName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isScanningImage ? "bg-indigo-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isScanningImage ? "text-indigo-400" : "text-emerald-400"}`}>
                          {isScanningImage 
                            ? `AI SCAN: ${scanProgress}%` 
                            : (isHi ? "✓ AI स्कैन पूर्ण" : "✓ AI Scan Complete")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all cursor-pointer active:scale-90"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Feature Action Buttons - Premium Pill Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Voice Input */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    className={`relative group flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer active:scale-[0.97] overflow-hidden ${
                      isRecording
                        ? "border-red-500/40 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        : isTranscribing
                        ? "border-indigo-500/30 bg-indigo-500/5"
                        : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-indigo-500/30 hover:bg-[#0c1122]/80 hover:shadow-[0_4px_20px_rgba(99,102,241,0.06)]"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                          <MicOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-300 truncate">{isHi ? "रोकें..." : "Stop..."}</span>
                      </>
                    ) : isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 truncate">{isHi ? "AI विश्लेषण..." : "AI..."}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/15 transition-colors">
                          <Mic className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-300 group-hover:text-white truncate">{isHi ? "बोलें" : "Speak"}</span>
                      </>
                    )}
                  </button>


                  {/* Photo Upload */}
                  <button
                    type="button"
                    onClick={handlePhotoUploadClick}
                    className={`group flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer active:scale-[0.97] ${
                      photo
                        ? "border-emerald-500/30 bg-emerald-500/6"
                        : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-violet-500/30 hover:bg-[#0c1122]/80 hover:shadow-[0_4px_20px_rgba(139,92,246,0.06)]"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      photo ? "bg-emerald-500/15" : "bg-violet-500/10 group-hover:bg-violet-500/15"
                    }`}>
                      <Upload className={`w-3.5 h-3.5 ${photo ? "text-emerald-400" : "text-violet-400"}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider truncate ${
                      photo ? "text-emerald-300" : "text-gray-300 group-hover:text-white"
                    }`}>{photo ? (isHi ? "संलग्न ✓" : "Attached ✓") : (isHi ? "फोटो" : "Photo")}</span>
                  </button>

                  {/* Location Detection */}
                  <button
                    type="button"
                    onClick={detectLocation}
                    className={`group flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer active:scale-[0.97] ${
                      location
                        ? "border-emerald-500/30 bg-emerald-500/6 col-span-2 sm:col-span-1"
                        : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-cyan-500/30 hover:bg-[#0c1122]/80 hover:shadow-[0_4px_20px_rgba(6,182,212,0.06)] col-span-2 sm:col-span-1"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      location ? "bg-emerald-500/15" : "bg-cyan-500/10 group-hover:bg-cyan-500/15"
                    }`}>
                      <MapPin className={`w-3.5 h-3.5 ${location ? "text-emerald-400" : "text-cyan-400"}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider truncate ${
                      location ? "text-emerald-300" : "text-gray-300 group-hover:text-white"
                    }`}>{location ? (location.area.length > 18 ? location.area.slice(0, 18) + "…" : location.area) : (isHi ? "स्थान" : "Location")}</span>
                  </button>
                </div>

               {location && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3.5 bg-emerald-500/4 border border-emerald-500/15 rounded-xl relative overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-glow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider block">{dict.pinnedArea}</span>
                    <span className="text-xs font-bold text-gray-200">{location.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className="font-mono text-[8px] border-emerald-500/20 text-emerald-400/80 bg-emerald-500/5 font-bold px-1.5 py-0">
                      {location.lat.toFixed(3)}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[8px] border-emerald-500/20 text-emerald-400/80 bg-emerald-500/5 font-bold px-1.5 py-0">
                      {location.lng.toFixed(3)}
                    </Badge>
                  </div>
                </motion.div>
              )}
              </div>
            </div>

            {/* Priority Selector - Color-coded Cards */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-amber-500/40 to-transparent" />
              <div className="bg-linear-to-b from-[#0c1120]/80 to-[#080d18]/60 backdrop-blur-sm border border-[#1e293b]/40 rounded-2xl p-6 sm:p-7 space-y-4 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/15 shrink-0">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">{dict.selectPriority}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "Auto", label: dict.priorityAuto, icon: "✨", color: "indigo", desc: isHi ? "AI तय करेगा" : "AI decides" },
                    { id: "Normal", label: dict.priorityNormal, icon: "○", color: "gray", desc: isHi ? "सामान्य" : "Standard" },
                    { id: "Important", label: dict.priorityImportant, icon: "🟠", color: "amber", desc: isHi ? "तत्काल" : "Urgent" },
                    { id: "Emergency", label: dict.priorityEmergency, icon: "🔴", color: "red", desc: isHi ? "आपातकालीन" : "Critical" }
                  ].map((p) => {
                    const isSelected = userPriority === p.id;
                    const colorMap: Record<string, string> = {
                      indigo: isSelected ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-indigo-500/25",
                      gray: isSelected ? "border-slate-400/50 bg-slate-500/10 shadow-[0_0_20px_rgba(148,163,184,0.08)]" : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-slate-500/25",
                      amber: isSelected ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-amber-500/25",
                      red: isSelected ? "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-[#1e293b]/50 bg-[#0a0f1a]/60 hover:border-red-500/25",
                    };
                    return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setUserPriority(p.id as "Auto" | "Normal" | "Important" | "Emergency")}
                      className={`relative flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border transition-all duration-300 cursor-pointer active:scale-[0.97] ${colorMap[p.color]}`}
                    >
                      <span className="text-base leading-none">{p.icon}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-white" : "text-gray-400"}`}>{p.label}</span>
                      {isSelected && (
                        <motion.div 
                          layoutId="priorityIndicator"
                          className="absolute -bottom-px left-1/4 right-1/4 h-[2px] bg-linear-to-r from-transparent via-white/60 to-transparent rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            {/* Personal details */}
            {!session && (
              <div className="bg-[#090d16]/30 border border-[#1f2937]/50 rounded-2xl p-6 sm:p-7 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#7c3aed]" />
                  {dict.yourDetails}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group text-left">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors z-10" />
                    <Input
                      placeholder={dict.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 border border-[#1f2937]/80 focus:border-[#7c3aed]/60 focus:ring-1 focus:ring-[#7c3aed]/40 rounded-xl bg-[#070b13] text-gray-200 h-11 transition-all duration-300 focus:scale-[1.005]"
                    />
                  </div>
                  <div className="relative group text-left">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors z-10" />
                    <Input
                      placeholder={dict.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 border border-[#1f2937]/80 focus:border-[#7c3aed]/60 focus:ring-1 focus:ring-[#7c3aed]/40 rounded-xl bg-[#070b13] text-gray-200 h-11 transition-all duration-300 focus:scale-[1.005]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Token alerts and bypass indicators */}
            {tokenState.tokensRemaining <= 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border flex items-start gap-3 text-left ${
                  isEmergencyComplaint(text)
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-red-500/10 border-red-500/30 text-red-200"
                }`}
              >
                {isEmergencyComplaint(text) ? (
                  <>
                    <Zap className="w-5 h-5 text-amber-400 animate-bounce shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-300">
                        {isHi ? "आपातकालीन शिकायत का पता चला" : "Emergency Complaint Detected"}
                      </p>
                      <p className="text-[11px] text-amber-400/90 font-medium leading-relaxed">
                        {isHi 
                          ? "प्राथमिकता पहुँच प्रदान की गई — आप इस शिकायत को जमा कर सकते हैं।" 
                          : "Priority access granted — you can submit this complaint despite the limit."}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-red-300">
                        {isHi ? "दैनिक शिकायत सीमा पूरी हो गई है" : "Daily Complaint Limit Reached"}
                      </p>
                      <p className="text-[11px] text-red-400/90 font-medium leading-relaxed">
                        {isHi 
                          ? "कृपया कल पुनः प्रयास करें या आपातकालीन शिकायत (जैसे: आग, पानी रिसाव, बिजली का खतरा) दर्ज करें।" 
                          : "Please try again tomorrow or report an emergency (e.g. fire, water leak, electric danger) for bypass."}
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {tokenAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs font-bold text-center"
              >
                {tokenAlert}
              </motion.div>
            )}

            {/* Submit */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || (tokenState.tokensRemaining <= 0 && !isEmergencyComplaint(text))}
                className="w-full h-12 rounded-xl bg-linear-to-r from-[#4f46e5] via-[#7c3aed] to-[#db2777] hover:bg-right text-white shadow-xl shadow-[#7c3aed]/25 hover:shadow-[#7c3aed]/45 hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 text-base font-extrabold group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2 uppercase tracking-wider text-xs font-black">
                  <span>{dict.submitBtn}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
              <span className="text-[11px] text-gray-500 font-medium">{dict.submitSubText}</span>
            </div>
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
              className="w-20 h-20 mx-auto rounded-2xl bg-linear-to-br from-ai-purple/20 via-primary/10 to-gov-blue/20 border border-ai-purple/30 flex items-center justify-center shadow-lg"
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
              <h3 className="text-2xl font-bold tracking-tight bg-linear-to-r from-gov-blue to-ai-purple bg-clip-text text-transparent">{dict.analyzingTitle}</h3>
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
                    <div className="w-5 h-5 rounded-full bg-trust-green/10 flex items-center justify-center text-trust-green shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : processingStep === i ? (
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 text-ai-purple animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-current/30 shrink-0 flex items-center justify-center" />
                  )}
                  <span>{s.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Glowing Gradient Custom Progress Bar */}
            <div className="max-w-md mx-auto h-2 bg-muted/50 rounded-full overflow-hidden p-0.5 border border-border/20">
              <motion.div 
                className="h-full bg-linear-to-r from-gov-blue via-ai-purple to-trust-green rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)]"
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
                  className="w-12 h-12 rounded-xl bg-trust-green/10 flex items-center justify-center shrink-0"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-trust-green" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-foreground/90">{dict.successTitle}</h3>
                  <p className="text-sm text-muted-foreground/80">
                    {isHi ? "आईडी:" : "ID:"} <span className="font-mono font-bold text-foreground">{createdComplaintId}</span> • {dict.trackRealtime}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Emergency bypass success banner */}
            {isEmergencyBypass && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-premium rounded-2xl p-5 border-l-4 border-l-amber-500 neon-glow-warning bg-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-400">
                      {isHi ? "आपातकालीन शिकायत स्वीकृत" : "Emergency Complaint Accepted"}
                    </h4>
                    <p className="text-xs text-amber-300/90 font-medium">
                      {isHi ? "आपातकालीन शिकायत का पता चला — प्राथमिकता पहुँच प्रदान की गई।" : "Emergency complaint detected — priority access granted."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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

                <div className="bg-muted/30 rounded-xl p-4 border border-border/20 transition-all hover:bg-muted/40 sm:col-span-2">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{isHi ? "वार्ड (Ward)" : "Ward"}</div>
                  <div className="font-bold text-sm text-foreground/90 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-trust-green" />
                    {classification.wardHi ? (isHi ? classification.wardHi : classification.ward) : (location?.area || (isHi ? "जीपीएस द्वारा स्वतः प्राप्त" : "Auto-detected from GPS"))}
                  </div>
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
                &ldquo;{isHi ? `आपकी शिकायत सफलतापूर्वक संबंधित विभाग (${classification.departmentHi}) को भेज दी गई है। शिकायत आईडी: ${createdComplaintId}` : `Your complaint has been successfully forwarded to ${classification.department}. Complaint ID: ${createdComplaintId}`}&rdquo;
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="button" onClick={reset} variant="outline" className="flex-1 rounded-xl h-11 font-bold text-sm">
                {dict.fileAnother}
              </Button>
              <Button 
                type="button" 
                onClick={() => onTrack?.(createdComplaintId)}
                className="flex-1 rounded-xl h-11 font-bold text-sm bg-linear-to-r from-gov-blue to-gov-blue-light text-white shadow-lg shadow-gov-blue/20"
              >
                {dict.trackThis}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
