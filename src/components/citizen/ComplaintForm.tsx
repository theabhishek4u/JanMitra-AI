"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  MapPin,
  Upload,
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
  ShieldCheck,
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
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; area: string } | null>(null);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string>("JM-2026-011");
  const [processingStep, setProcessingStep] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("");
  const [userPriority, setUserPriority] = useState<"Auto" | "Normal" | "Important" | "Emergency">("Auto");
  
  // Image scan state
  const [isScanningImage, setIsScanningImage] = useState(false);

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
      
      setLocation({
        lat: 26.8532,
        lng: 80.9723,
        area: isHi ? "गोमती नगर, लखनऊ" : "Gomti Nagar, Lucknow"
      });
      
      setText(mockText);
      setName(mockName);
      setPhone(mockPhone);
      
      const garbageMockImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%2312151c'/><path d='M20,70 L50,30 L80,70 Z' fill='%232a303c' stroke='%233f4756' stroke-width='1'/><circle cx='50' cy='45' r='12' fill='%23e0e7ff' fill-opacity='0.15'/><text x='50' y='85' fill='%2394a3b8' font-size='5' text-anchor='middle' font-family='monospace'>EVIDENCE ATTACHMENT</text></svg>";
      
      setPhoto(garbageMockImage);
      setPhotoName("Gomti_Nagar_Evidence.jpg");
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
    describeTitle: isHi ? "शिकायत दर्ज करें" : "Report grievance",
    subtitleText: isHi ? "नागरिक समस्या का विवरण दर्ज करें। एआई सीधे संबंधित विभाग को अग्रेषित करेगा।" : "Detail your municipal issue. The system verifies and routes directly to the department.",
    voiceRecording: isHi ? "ध्वनि इनपुट रिकॉर्डिंग जारी..." : "Recording audio input...",
    voiceInput: isHi ? "बोलकर दर्ज करें" : "Speak grievance",
    uploadPhoto: isHi ? "फोटो संलग्न करें" : "Attach photo",
    photoAttached: isHi ? "फोटो संलग्न है" : "Photo attached",
    detectLocation: isHi ? "स्थान पहचानें" : "Auto-detect location",
    pinnedArea: isHi ? "निर्धारित क्षेत्र" : "Identified Ward / Area",
    yourDetails: isHi ? "नागरिक विवरण" : "Citizen particulars",
    namePlaceholder: isHi ? "नागरिक का नाम" : "Full name",
    phonePlaceholder: isHi ? "मोबाइल नंबर" : "Phone number",
    submitBtn: isHi ? "शिकायत प्रेषित करें" : "Submit grievance",
    submitSubText: isHi ? "सत्यापन एवं विभागीय आवंटन स्वचालित रूप से होगा" : "Verified docket is generated and dispatched to the field authority",
    analyzingTitle: isHi ? "शिकायत का सत्यापन एवं विश्लेषण" : "Processing municipal docket",
    analyzingDesc: isHi ? "श्रेणी वर्गीकरण, तात्कालिकता निर्धारण एवं विभागीय आवंटन..." : "Classifying grievance, calculating SLA, and assigning nodal department...",
    successTitle: isHi ? "शिकायत सफलतापूर्वक पंजीकृत" : "Grievance registered successfully",
    trackRealtime: isHi ? "स्थिति एवं निवारण प्रगति ट्रैक करें" : "Track field action and resolution timeline",
    photoAttachment: isHi ? "संलग्न साक्ष्य" : "Attached evidence",
    scannedAI: isHi ? "साक्ष्य सत्यापित" : "Evidence verified",
    aiClassification: isHi ? "विभागीय आवंटन विवरण" : "Docket dispatch details",
    confidence: isHi ? "सटीकता" : "confidence",
    category: isHi ? "श्रेणी" : "Category",
    priority: isHi ? "प्राथमिकता" : "Priority",
    department: isHi ? "संबद्ध विभाग" : "Nodal Department",
    estResolution: isHi ? "समाधान समय सीमा" : "Standard SLA",
    days: isHi ? "दिन" : "days",
    aiOfficerSummary: isHi ? "प्राधिकृत अधिकारी हेतु सारांश" : "Authorized officer briefing",
    notificationSent: isHi ? "एसएमएस पावती प्रेषित:" : "SMS acknowledgment sent:",
    fileAnother: isHi ? "अन्य शिकायत दर्ज करें" : "File another grievance",
    trackThis: isHi ? "शिकायत ट्रैक करें" : "Track grievance",
    placeholderText: isHi ? "समस्या का विवरण दर्ज करें (उदा. गोमती नगर मुख्य मार्ग पर स्ट्रीट लाइट खराब है और गड्ढे बने हैं...)" : "Provide clear details of the issue (e.g., Streetlight dysfunctional and overflowing storm drain on Main Road, Ward 12...)",
    selectPriority: isHi ? "प्राथमिकता स्तर" : "Priority level",
    priorityAuto: isHi ? "स्वचालित (सिस्टम)" : "System (Auto)",
    priorityNormal: isHi ? "सामान्य" : "Standard",
    priorityImportant: isHi ? "महत्वपूर्ण" : "Urgent",
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
        setIsScanningImage(false);

        if (!text.trim()) {
          if (isHi) {
            setText(`[संलग्न साक्ष्य: ${file.name}] क्षेत्र में नागरिक समस्या की सूचना। कृपया तत्काल निरीक्षण कर समाधान कराएं।`);
          } else {
            setText(`[Attached photo: ${file.name}] Civic issue reported in Lucknow municipal ward. Immediate departmental resolution requested.`);
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
          recognition.onend = null;
          try {
            recognition.stop();
          } catch (e) {}

          if (event.error === "no-speech") {
            setIsRecording(false);
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
                headers: { "Content-Type": "application/json" },
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

    if (currentTokenState.tokensRemaining <= 0 && !isEmergency) {
      setTokenAlert(isHi ? "दैनिक शिकायत सीमा पूरी हो गई है। कृपया कल पुनः प्रयास करें या आपातकालीन शिकायत दर्ज करें।" : "Daily grievance quota reached. Please try again tomorrow or flag as emergency for bypass.");
      return;
    }

    setStep("processing");
    setProcessingStep(0);
    setTokenAlert(null);

    const enhancedText = userPriority === "Auto" ? text : `${text}\n[User Selected Priority: ${userPriority}]`;
    const apiResultPromise = classifyComplaintAI(enhancedText, photo);

    const steps = [
      () => setProcessingStep(1),
      () => setProcessingStep(2),
      () => setProcessingStep(3),
      () => setProcessingStep(4),
      () => setProcessingStep(5),
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      steps[i]();
    }

    try {
      const result = await apiResultPromise;

      if (userPriority === "Emergency") {
        result.priority = "high";
      } else if (userPriority === "Important") {
        result.priority = "medium";
      } else if (userPriority === "Normal") {
        result.priority = "low";
      }

      const tokenResult = consumeToken(enhancedText, result.category);
      
      if (!tokenResult.allowed) {
        setStep("input");
        setTokenAlert(isHi ? tokenResult.reasonHi : tokenResult.reason);
        return;
      }

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
        citizenName: name || session?.name || "Citizen",
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

      if (onComplaintCreated) {
        onComplaintCreated(newComplaint);
      }
    } catch (err) {
      console.error("AI classification execution error:", err);
      setTokenAlert(isHi ? "शिकायत दर्ज करने में समस्या आई। कृपया पुनः प्रयास करें।" : "Failed to process grievance. Please try again.");
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
        { label: "शिकायत पाठ का सिंटैक्स विश्लेषण..." },
        { label: "नगर निगम श्रेणी एवं कार्यक्षेत्र पहचान..." },
        { label: "प्राथमिकता एवं समय सीमा (SLA) गणना..." },
        { label: "संबद्ध क्षेत्रीय अधिकारी को अग्रेषण..." },
        { label: "डिजिटल पावती एवं डॉकेट सृजन..." },
      ]
    : [
        { label: "Syntactic complaint parsing..." },
        { label: "Municipal category & jurisdiction mapping..." },
        { label: "SLA calculation & urgency grading..." },
        { label: "Nodal officer dispatch routing..." },
        { label: "Docket generation & SMS acknowledgment..." },
      ];

  const getPriorityLabel = (p: string) => {
    if (p === "high") return isHi ? "उच्च (High)" : "High";
    if (p === "medium") return isHi ? "मध्यम (Medium)" : "Medium";
    return isHi ? "सामान्य (Standard)" : "Standard";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6 text-left"
          >
            {/* Complaint Form Box */}
            <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-7 space-y-5 shadow-xs transition-colors">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/6 pb-5">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    {dict.describeTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {dict.subtitleText}
                  </p>
                </div>

                {onLanguageChange && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181c24] border border-slate-200 dark:border-white/10 p-0.5 rounded-lg text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => onLanguageChange("en")}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        language === "en"
                          ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => onLanguageChange("hi")}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        language === "hi"
                          ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                )}
              </div>

              {/* Token Allowance Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-[#181c24] border border-slate-200 dark:border-white/6 rounded-lg text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                  <span>{isHi ? "दैनिक शिकायत कोटा:" : "Daily grievance quota:"}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className={tokenState.tokensRemaining <= 1 ? "text-amber-500 dark:text-amber-400 font-semibold" : "text-slate-700 dark:text-slate-200 font-semibold"}>
                    {tokenState.tokensRemaining} / {tokenState.maxTokens}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={dict.placeholderText}
                  className="min-h-[140px] text-sm resize-none border border-slate-200 dark:border-white/10 rounded-lg p-3.5 bg-slate-50/50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 outline-none leading-relaxed"
                />
                {text.length > 0 && (
                  <span className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {text.length} chars
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

              {/* Photo preview block */}
              {photo && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#181c24] border border-slate-200 dark:border-white/10 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Attached Evidence" className="w-12 h-12 rounded object-cover border border-slate-200 dark:border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{photoName}</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{dict.photoAttached}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* Voice Input */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isRecording
                      ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300"
                      : isTranscribing
                      ? "border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181c24] hover:bg-slate-100 dark:hover:bg-[#1e232e] text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                      <span>{isHi ? "रिकॉर्डिंग रोकें" : "Stop recording"}</span>
                    </>
                  ) : isTranscribing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 dark:text-slate-300" />
                      <span>{isHi ? "रूपांतरण..." : "Transcribing..."}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{dict.voiceInput}</span>
                    </>
                  )}
                </button>

                {/* Photo Upload */}
                <button
                  type="button"
                  onClick={handlePhotoUploadClick}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    photo
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181c24] hover:bg-slate-100 dark:hover:bg-[#1e232e] text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{photo ? (isHi ? "साक्ष्य संलग्न" : "Evidence added") : dict.uploadPhoto}</span>
                </button>

                {/* Location Detection */}
                <button
                  type="button"
                  onClick={detectLocation}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    location
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                      : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181c24] hover:bg-slate-100 dark:hover:bg-[#1e232e] text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="truncate">
                    {location ? location.area.split(",")[0] : dict.detectLocation}
                  </span>
                </button>
              </div>

              {location && (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#181c24] border border-slate-200 dark:border-white/8 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="font-medium">{location.area}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {/* Priority Selector */}
            <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3 shadow-xs">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-300 tracking-tight">
                {dict.selectPriority}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "Auto", label: dict.priorityAuto },
                  { id: "Normal", label: dict.priorityNormal },
                  { id: "Important", label: dict.priorityImportant },
                  { id: "Emergency", label: dict.priorityEmergency }
                ].map((p) => {
                  const isSelected = userPriority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setUserPriority(p.id as any)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                        isSelected
                          ? "border-blue-500/50 bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-white font-semibold"
                          : "border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#181c24] hover:bg-slate-100 dark:hover:bg-[#1e232e] text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Citizen Details (if guest) */}
            {!session && (
              <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3 shadow-xs">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-300 tracking-tight">
                  {dict.yourDetails}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder={dict.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-200 text-xs rounded-lg"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder={dict.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-200 text-xs rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {tokenAlert && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs font-medium">
                {tokenAlert}
              </div>
            )}

            {/* Submit Action */}
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || (tokenState.tokensRemaining <= 0 && !isEmergencyComplaint(text))}
                className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                <span>{dict.submitBtn}</span>
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
              <p className="text-[11px] text-slate-500 text-center">
                {dict.submitSubText}
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Processing Docket */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-white/10 rounded-xl p-8 text-center space-y-6 shadow-sm"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                {dict.analyzingTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {dict.analyzingDesc}
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2.5 text-left pt-2">
              {processingSteps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs ${
                    processingStep > i
                      ? "text-slate-800 dark:text-slate-200"
                      : processingStep === i
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {processingStep > i ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : processingStep === i ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="max-w-md mx-auto h-1.5 bg-slate-100 dark:bg-[#181c24] rounded-full overflow-hidden border border-slate-200 dark:border-white/6">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${(processingStep / 5) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Municipal Case Docket */}
        {step === "result" && classification && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Header Docket Slip */}
            <div className="bg-white dark:bg-[#12151c] border border-slate-200 dark:border-white/10 rounded-xl p-6 space-y-5 text-left shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/6 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-mono font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Official Docket Created
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {dict.successTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Docket ID:</span>
                  <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                    {createdComplaintId}
                  </span>
                </div>
              </div>

              {/* Departmental Routing Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-[#181c24] p-3 rounded-lg border border-slate-200 dark:border-white/6">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">{dict.category}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {isHi ? classification.categoryHi : classification.category}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#181c24] p-3 rounded-lg border border-slate-200 dark:border-white/6">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">{dict.department}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    {isHi ? classification.departmentHi : classification.department}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#181c24] p-3 rounded-lg border border-slate-200 dark:border-white/6">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">{dict.priority}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {getPriorityLabel(classification.priority)}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#181c24] p-3 rounded-lg border border-slate-200 dark:border-white/6">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">{dict.estResolution}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {classification.predictedResolutionDays} {dict.days}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-[#181c24] p-3 rounded-lg border border-slate-200 dark:border-white/6 sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">{isHi ? "वार्ड / क्षेत्रीय कार्यक्षेत्र" : "Jurisdiction Ward / Area"}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {classification.wardHi ? (isHi ? classification.wardHi : classification.ward) : (location?.area || "Gomti Nagar, Lucknow")}
                  </span>
                </div>
              </div>

              {/* AI Briefing for Field Officer */}
              <div className="bg-slate-50 dark:bg-[#181c24] p-3.5 rounded-lg border border-slate-200 dark:border-white/6 space-y-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                  {dict.aiOfficerSummary}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isHi ? classification.summaryHi : classification.summary}
                </p>
              </div>

              {/* Citizen SMS notification notice */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/15 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                <Send className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {isHi 
                    ? `पावती एसएमएस प्रेषित: शिकायत संख्या ${createdComplaintId} संबंधित विभाग (${classification.departmentHi}) को अग्रेषित की जा चुकी है।` 
                    : `Notification sent: Grievance ${createdComplaintId} dispatched to ${classification.department}. Official SLA tracking initiated.`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button 
                  type="button" 
                  onClick={reset} 
                  variant="outline" 
                  className="flex-1 rounded-lg h-10 text-xs font-medium border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  {dict.fileAnother}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => onTrack?.(createdComplaintId)}
                  className="flex-1 rounded-lg h-10 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                >
                  {dict.trackThis}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
