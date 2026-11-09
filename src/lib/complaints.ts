import { Complaint, ComplaintStatus, DashboardStats, AnalyticsData, Priority, Notification, ResolutionProof, CitizenVerification, TimelineEvent } from "@/types";
import { supabase } from "./supabaseClient";
import { getDepartmentById, getDepartmentForCategory } from "@/data/departments";
import { analyzeComplaintTrust } from "@/lib/fakeDetection";
import { mockComplaints } from "@/data/complaints";

const isClient = typeof window !== "undefined";
const CITIZEN_NOTIF_KEY = "janmitra_citizen_notifications";
const OFFICER_NOTIF_KEY = "janmitra_officer_notifications";
const COMPLAINTS_STORAGE_KEY = "janmitra_complaints_v2";

// In-memory store fallback for SSR and Node.js test runs
let memoryComplaints: Complaint[] = JSON.parse(JSON.stringify(mockComplaints));

// ============================================
// Local Storage & Hybrid Persistence Helpers
// ============================================
export function getLocalComplaintsStore(): Complaint[] {
  if (!isClient) {
    return memoryComplaints;
  }
  try {
    const raw = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(mockComplaints));
      return JSON.parse(JSON.stringify(mockComplaints));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(mockComplaints));
    return JSON.parse(JSON.stringify(mockComplaints));
  } catch (err) {
    console.warn("Failed reading local complaints store, using default mock data:", err);
    return JSON.parse(JSON.stringify(mockComplaints));
  }
}

export function saveLocalComplaintsStore(complaints: Complaint[]) {
  if (!isClient) {
    memoryComplaints = complaints;
    return;
  }
  try {
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.warn("Failed saving local complaints store:", err);
  }
}

// Notifications Helpers
export function getCitizenNotifications(): Notification[] {
  if (!isClient) return [];
  try {
    const data = localStorage.getItem(CITIZEN_NOTIF_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getOfficerNotifications(): Notification[] {
  if (!isClient) return [];
  try {
    const data = localStorage.getItem(OFFICER_NOTIF_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addCitizenNotification(
  type: "update" | "escalation" | "reminder" | "resolution",
  message: string,
  messageHi: string,
  complaintId: string
): Notification {
  const notifs = getCitizenNotifications();
  const newNotif: Notification = {
    id: `notif-cit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    message,
    messageHi,
    complaintId,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifs.unshift(newNotif);
  if (isClient) {
    try {
      localStorage.setItem(CITIZEN_NOTIF_KEY, JSON.stringify(notifs));
    } catch {
      // ignore
    }
  }
  return newNotif;
}

export function addOfficerNotification(
  type: "update" | "escalation" | "reminder" | "resolution",
  message: string,
  messageHi: string,
  complaintId: string
): Notification {
  const notifs = getOfficerNotifications();
  const newNotif: Notification = {
    id: `notif-off-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    message,
    messageHi,
    complaintId,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifs.unshift(newNotif);
  if (isClient) {
    try {
      localStorage.setItem(OFFICER_NOTIF_KEY, JSON.stringify(notifs));
    } catch {
      // ignore
    }
  }
  return newNotif;
}

export function markNotificationAsRead(id: string, role: "citizen" | "officer") {
  const key = role === "citizen" ? CITIZEN_NOTIF_KEY : OFFICER_NOTIF_KEY;
  const notifs = role === "citizen" ? getCitizenNotifications() : getOfficerNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  if (isClient) {
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export function clearNotifications(role: "citizen" | "officer") {
  const key = role === "citizen" ? CITIZEN_NOTIF_KEY : OFFICER_NOTIF_KEY;
  if (isClient) {
    try {
      localStorage.setItem(key, JSON.stringify([]));
    } catch {
      // ignore
    }
  }
}

function mapComplaint(row: any, updates: any[] = []): Complaint {
  const dept = getDepartmentById(row.department_id);
  return {
    id: row.id,
    title: row.title,
    titleHi: row.title_hi || row.title,
    description: row.description,
    descriptionHi: row.description_hi || row.description,
    category: row.category,
    categoryHi: row.category_hi || row.category,
    priority: row.priority as Priority,
    status: row.status as ComplaintStatus,
    department: dept?.name || "Unknown Department",
    departmentHi: dept?.nameHi || "अज्ञात विभाग",
    latitude: row.latitude,
    longitude: row.longitude,
    area: row.area,
    citizenId: row.citizen_id,
    citizenName: row.citizen_name,
    citizenPhone: row.citizen_phone,
    imageUrl: row.image_url,
    voiceUrl: row.voice_url,
    aiSummary: row.ai_summary,
    aiSummaryHi: row.ai_summary_hi || row.ai_summary,
    aiConfidence: row.ai_confidence,
    timeline: (updates || []).map(u => ({
      id: u.id,
      status: u.status as ComplaintStatus,
      message: u.message,
      messageHi: u.message_hi || u.message,
      timestamp: u.created_at || u.timestamp || new Date().toISOString(),
      isActive: true,
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    resolvedAt: row.resolved_at,
    escalationLevel: row.escalation_level || 0,
    assignedOfficer: row.assigned_officer,
    trustAnalysis: row.trust_analysis,
    resolutionProof: row.resolution_proof,
    citizenVerification: row.citizen_verification,
  };
}

export async function getComplaints(citizenId?: string): Promise<Complaint[]> {
  let rawList: Complaint[] = [];

  // Try Supabase first if available
  try {
    let query = supabase.from("complaints").select("*");
    if (citizenId) {
      query = query.eq("citizen_id", citizenId);
    }
    const { data: complaints, error: cErr } = await query;
    if (!cErr && complaints && complaints.length > 0) {
      const { data: updates } = await supabase.from("complaint_updates").select("*");
      const updatesByComplaint = (updates || []).reduce((acc: any, u: any) => {
        if (!acc[u.complaint_id]) acc[u.complaint_id] = [];
        acc[u.complaint_id].push(u);
        return acc;
      }, {});
      rawList = complaints.map(c => mapComplaint(c, updatesByComplaint[c.id] || []));
    }
  } catch (err) {
    // Supabase unreachable or network failure; continue to local fallback
  }

  // If Supabase didn't provide rows, use local store
  if (rawList.length === 0) {
    const localStore = getLocalComplaintsStore();
    if (citizenId) {
      rawList = localStore.filter(c => c.citizenId === citizenId);
    } else {
      rawList = [...localStore];
    }
  }

  // Clustering logic for hotspots
  const activeGroups: Record<string, number> = {};
  rawList.forEach((c) => {
    if (c.status !== "resolved") {
      const key = `${(c.area || "").toLowerCase().trim()}_${(c.category || "").toLowerCase().trim()}`;
      activeGroups[key] = (activeGroups[key] || 0) + 1;
    }
  });

  const processed = rawList.map((c) => {
    if (c.status !== "resolved") {
      const key = `${(c.area || "").toLowerCase().trim()}_${(c.category || "").toLowerCase().trim()}`;
      const count = activeGroups[key] || 0;
      if (count >= 2) {
        return {
          ...c,
          isHotspot: true,
          hotspotCount: count,
          priority: "high" as Priority,
        };
      }
    }
    return { ...c, isHotspot: false, hotspotCount: 0 };
  });

  return processed.sort((a, b) => {
    const aActive = a.status !== "resolved";
    const bActive = b.status !== "resolved";
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    if (aActive && bActive) {
      const aHot = !!a.isHotspot;
      const bHot = !!b.isHotspot;
      if (aHot && !bHot) return -1;
      if (!aHot && bHot) return 1;
      const weights: any = { high: 3, medium: 2, low: 1 };
      const aWeight = weights[a.priority] || 2;
      const bWeight = weights[b.priority] || 2;
      if (aWeight !== bWeight) return bWeight - aWeight;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getComplaintById(id: string): Promise<Complaint | undefined> {
  // Try Supabase first
  try {
    const { data, error } = await supabase.from("complaints").select("*").eq("id", id).single();
    if (!error && data) {
      const { data: updates } = await supabase.from("complaint_updates").select("*").eq("complaint_id", id);
      return mapComplaint(data, updates || []);
    }
  } catch {
    // ignore
  }

  // Local fallback
  const localList = getLocalComplaintsStore();
  return localList.find(c => c.id.toUpperCase() === id.toUpperCase());
}

export async function addComplaint(complaintData: Partial<Complaint>): Promise<Complaint | null> {
  const year = new Date().getFullYear();
  const currentLocal = getLocalComplaintsStore();
  const index = String(currentLocal.length + 1).padStart(3, "0");
  const id = complaintData.id || `JM-${year}-${index}-${Math.floor(Math.random() * 1000)}`;

  const dept = complaintData.category 
    ? getDepartmentForCategory(complaintData.category as any)
    : undefined;

  const trustAnalysis = analyzeComplaintTrust(complaintData as any, currentLocal);

  const initialTimeline: TimelineEvent[] = [
    {
      id: `t1-${Date.now()}`,
      status: "submitted",
      message: "Complaint submitted successfully by citizen.",
      messageHi: "नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।",
      timestamp: new Date().toISOString(),
      isActive: false,
    },
    {
      id: `t2-${Date.now()}`,
      status: "ai_analyzing",
      message: "AI Classification Complete",
      messageHi: "AI विश्लेषण पूर्ण",
      timestamp: new Date().toISOString(),
      isActive: false,
    },
    {
      id: `t3-${Date.now()}`,
      status: "department_assigned",
      message: `Routed to ${dept?.name || "department"} automatically.`,
      messageHi: `${dept?.nameHi || "विभाग"} को स्वचालित रूप से आवंटित।`,
      timestamp: new Date().toISOString(),
      isActive: true,
    },
  ];

  const newComplaint: Complaint = {
    id,
    title: complaintData.title || "Civic Issue Reported",
    titleHi: complaintData.titleHi || "नागरिक समस्या दर्ज",
    description: complaintData.description || "",
    descriptionHi: complaintData.descriptionHi || "",
    category: complaintData.category || "Garbage / Sanitation",
    categoryHi: complaintData.categoryHi || "कचरा / स्वच्छता",
    priority: complaintData.priority || "medium",
    status: complaintData.status || "submitted",
    department: dept?.name || "Lucknow Nagar Nigam",
    departmentHi: dept?.nameHi || "लखनऊ नगर निगम",
    latitude: complaintData.latitude || 26.8467,
    longitude: complaintData.longitude || 80.9462,
    area: complaintData.area || "Gomti Nagar, Lucknow",
    citizenId: complaintData.citizenId || "cit-demo",
    citizenName: complaintData.citizenName || "Demo Citizen",
    citizenPhone: complaintData.citizenPhone || "+91 99999 88888",
    imageUrl: complaintData.imageUrl,
    voiceUrl: complaintData.voiceUrl,
    aiSummary: complaintData.aiSummary || "Awaiting AI summarization.",
    aiSummaryHi: complaintData.aiSummaryHi || "AI सारांश लंबित।",
    aiConfidence: complaintData.aiConfidence || 0.90,
    timeline: initialTimeline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    escalationLevel: 0,
    assignedOfficer: dept?.officerName || "Shri Rajesh Kumar",
    trustAnalysis,
  };

  // Always save to local store first for instant UI response and offline safety
  saveLocalComplaintsStore([newComplaint, ...currentLocal]);

  // Attempt to sync to Supabase in the background
  try {
    const newRow = {
      id,
      title: newComplaint.title,
      title_hi: newComplaint.titleHi,
      description: newComplaint.description,
      description_hi: newComplaint.descriptionHi,
      category: newComplaint.category,
      category_hi: newComplaint.categoryHi,
      priority: newComplaint.priority,
      status: newComplaint.status,
      department_id: dept?.id || "nagar-nigam",
      latitude: newComplaint.latitude,
      longitude: newComplaint.longitude,
      area: newComplaint.area,
      citizen_id: newComplaint.citizenId,
      citizen_name: newComplaint.citizenName,
      citizen_phone: newComplaint.citizenPhone,
      image_url: newComplaint.imageUrl,
      voice_url: newComplaint.voiceUrl,
      ai_summary: newComplaint.aiSummary,
      ai_summary_hi: newComplaint.aiSummaryHi,
      ai_confidence: newComplaint.aiConfidence,
      trust_analysis: trustAnalysis,
      trust_score: trustAnalysis.trustScore / 100,
      escalation_level: 0,
      assigned_officer: newComplaint.assignedOfficer,
    };

    const { error: insErr } = await supabase.from("complaints").insert(newRow);
    if (!insErr) {
      const updates = [
        { complaint_id: id, status: "submitted", message: "Complaint submitted successfully by citizen.", message_hi: "नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।" },
        { complaint_id: id, status: "ai_analyzing", message: `AI Classification Complete`, message_hi: `AI विश्लेषण पूर्ण` },
        { complaint_id: id, status: "department_assigned", message: `Routed to department automatically.`, message_hi: `स्वचालित रूप से आवंटित।` },
      ];
      await supabase.from("complaint_updates").insert(updates);
    }
  } catch (err) {
    // Supabase unavailable; local storage has the complaint safely
  }

  if (isClient) {
    window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  }

  addOfficerNotification("update", `New grievance filed: ${newComplaint.id}`, `नई शिकायत दर्ज: ${newComplaint.id}`, newComplaint.id);

  return newComplaint;
}

export async function updateComplaintStatus(
  id: string, 
  status: ComplaintStatus, 
  officerName?: string, 
  noteEn?: string, 
  noteHi?: string
): Promise<Complaint | undefined> {
  const localList = getLocalComplaintsStore();
  const index = localList.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return undefined;

  const c = localList[index];
  let defaultMsgEn = `Status updated to ${status.replace(/_/g, " ")}.`;
  let defaultMsgHi = `स्थिति बदलकर ${status} कर दी गई है।`;
  let resolvedAt = c.resolvedAt;
  let escLevel = c.escalationLevel;

  if (status === "officer_reviewing") {
    defaultMsgEn = `Officer ${officerName || c.assignedOfficer} has begun reviewing the grievance.`;
    defaultMsgHi = `अधिकारी ${officerName || c.assignedOfficer} ने शिकायत की समीक्षा शुरू कर दी है।`;
  } else if (status === "resolved") {
    defaultMsgEn = `Issue resolved completely. Resolution verified by department.`;
    defaultMsgHi = `समस्या का पूर्ण निवारण हो चुका है। विभाग द्वारा निवारण की पुष्टि की गई है।`;
    resolvedAt = new Date().toISOString();
  } else if (status === "escalated") {
    escLevel = (c.escalationLevel || 0) + 1;
    defaultMsgEn = `Ticket escalated to Level ${escLevel}.`;
    defaultMsgHi = `शिकायत को स्तर ${escLevel} पर प्रेषित किया गया।`;
  }

  const finalMsgEn = noteEn ? `${defaultMsgEn} Note: ${noteEn}` : defaultMsgEn;
  const finalMsgHi = noteHi ? `${defaultMsgHi} टिप्पणी: ${noteHi}` : defaultMsgHi;

  const newTimelineItem: TimelineEvent = {
    id: `t-${Date.now()}`,
    status,
    message: finalMsgEn,
    messageHi: finalMsgHi,
    timestamp: new Date().toISOString(),
    isActive: true,
  };

  const updatedComplaint: Complaint = {
    ...c,
    status,
    resolvedAt,
    escalationLevel: escLevel,
    updatedAt: new Date().toISOString(),
    timeline: [...(c.timeline || []), newTimelineItem],
  };

  localList[index] = updatedComplaint;
  saveLocalComplaintsStore(localList);

  // Background sync with Supabase
  try {
    await supabase.from("complaints").update({ status, resolved_at: resolvedAt, escalation_level: escLevel }).eq("id", id);
    await supabase.from("complaint_updates").insert({ complaint_id: id, status, message: finalMsgEn, message_hi: finalMsgHi });
  } catch {
    // ignore
  }

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  addCitizenNotification(status === "resolved" ? "resolution" : "update", finalMsgEn, finalMsgHi, id);

  return updatedComplaint;
}

export async function mergeDuplicateComplaint(id: string, parentId: string): Promise<Complaint | undefined> {
  const msgEn = `Merged with similar nearby complaint ${parentId}. Action consolidated.`;
  const msgHi = `समान क्षेत्र की शिकायत ${parentId} के साथ एकीकृत किया गया। संयुक्त निवारण कार्यवाही जारी।`;
  
  return updateComplaintStatus(id, "resolved", undefined, msgEn, msgHi);
}

export async function updateComplaintVerdict(id: string, verdict: "safe" | "spam"): Promise<Complaint | undefined> {
  const localList = getLocalComplaintsStore();
  const index = localList.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return undefined;

  const c = localList[index];
  const trustAnalysis = c.trustAnalysis || {
    trustLevel: "medium",
    trustScore: 50,
    flags: [],
    reasons: [],
    analyzedAt: new Date().toISOString(),
    reviewedByOfficer: false,
  };
  trustAnalysis.reviewedByOfficer = true;
  trustAnalysis.officerVerdict = verdict;

  const updatedComplaint: Complaint = {
    ...c,
    trustAnalysis,
    updatedAt: new Date().toISOString(),
  };

  localList[index] = updatedComplaint;
  saveLocalComplaintsStore(localList);

  try {
    await supabase.from("complaints").update({ trust_analysis: trustAnalysis }).eq("id", id);
  } catch {
    // ignore
  }

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  return updatedComplaint;
}

export async function getSuspiciousComplaints(): Promise<Complaint[]> {
  const all = await getComplaints();
  return all.filter((c) => c.trustAnalysis && c.trustAnalysis.trustLevel !== "high" && !c.trustAnalysis.reviewedByOfficer);
}

export async function submitResolutionProof(
  id: string, proofPhotoUrl: string, noteEn: string, noteHi: string, officerName: string
): Promise<Complaint | undefined> {
  const localList = getLocalComplaintsStore();
  const index = localList.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return undefined;

  const proof: ResolutionProof = {
    photoUrl: proofPhotoUrl,
    note: noteEn,
    noteHi,
    submittedAt: new Date().toISOString(),
    officerName
  };

  const msg = `Resolution proof submitted by ${officerName}. "${noteEn}" — Awaiting citizen confirmation.`;
  const msgHi = `${officerName} द्वारा समाधान प्रमाण प्रस्तुत: "${noteHi}" — नागरिक पुष्टि की प्रतीक्षा में।`;

  const newTimelineItem: TimelineEvent = {
    id: `t-${Date.now()}`,
    status: "pending_citizen_confirmation",
    message: msg,
    messageHi: msgHi,
    timestamp: new Date().toISOString(),
    isActive: true,
  };

  const updatedComplaint: Complaint = {
    ...localList[index],
    status: "pending_citizen_confirmation",
    resolutionProof: proof,
    updatedAt: new Date().toISOString(),
    timeline: [...(localList[index].timeline || []), newTimelineItem],
  };

  localList[index] = updatedComplaint;
  saveLocalComplaintsStore(localList);

  try {
    await supabase.from("complaints").update({ status: "pending_citizen_confirmation", resolution_proof: proof }).eq("id", id);
    await supabase.from("complaint_updates").insert({ complaint_id: id, status: "pending_citizen_confirmation", message: msg, message_hi: msgHi });
  } catch {
    // ignore
  }

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  addCitizenNotification("resolution", "🔔 Resolution proof submitted. Please confirm.", "🔔 समाधान प्रमाण प्रस्तुत। पुष्टि करें।", id);
  return updatedComplaint;
}

export async function citizenVerifyResolution(
  id: string, verified: boolean, feedback: string, feedbackHi: string, rejectionPhotoUrl?: string
): Promise<Complaint | undefined> {
  const localList = getLocalComplaintsStore();
  const index = localList.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const ver: CitizenVerification = {
    verified,
    feedback,
    feedbackHi,
    photoUrl: rejectionPhotoUrl,
    submittedAt: now
  };
  const status: ComplaintStatus = verified ? "resolved" : "reopened";
  const msg = verified ? `✅ Citizen confirmed: Issue is resolved. "${feedback}"` : `❌ Citizen REJECTED resolution: "${feedback}"`;
  const msgHi = verified ? `✅ नागरिक द्वारा पुष्टि: समस्या हल हो गई है। "${feedbackHi}"` : `❌ नागरिक ने समाधान अस्वीकार किया: "${feedbackHi}"`;

  const newTimelineItem: TimelineEvent = {
    id: `t-${Date.now()}`,
    status,
    message: msg,
    messageHi: msgHi,
    timestamp: now,
    isActive: true,
  };

  const updatedComplaint: Complaint = {
    ...localList[index],
    status,
    citizenVerification: ver,
    resolvedAt: verified ? now : undefined,
    updatedAt: now,
    timeline: [...(localList[index].timeline || []), newTimelineItem],
  };

  localList[index] = updatedComplaint;
  saveLocalComplaintsStore(localList);

  try {
    const updatePayload: any = { status, citizen_verification: ver };
    if (verified) updatePayload.resolved_at = now;
    await supabase.from("complaints").update(updatePayload).eq("id", id);
    await supabase.from("complaint_updates").insert({ complaint_id: id, status, message: msg, message_hi: msgHi });
  } catch {
    // ignore
  }

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  addOfficerNotification(
    verified ? "resolution" : "update",
    `Citizen feedback received on ${id}: ${verified ? "Confirmed" : "Rejected"}`,
    `शिकायत ${id} पर नागरिक प्रतिक्रिया प्राप्त: ${verified ? "पुष्टि की गई" : "अस्वीकार किया गया"}`,
    id
  );

  return updatedComplaint;
}

export async function getPendingVerificationComplaints(): Promise<Complaint[]> {
  const all = await getComplaints();
  return all.filter((c) => c.status === "pending_citizen_confirmation");
}

export async function getStats(): Promise<DashboardStats> {
  const db = await getComplaints();
  const total = db.length;
  const pending = db.filter((c) => c.status !== "resolved").length;
  const resolved = db.filter((c) => c.status === "resolved").length;
  const highPriority = db.filter((c) => c.priority === "high" && c.status !== "resolved").length;
  const escalated = db.filter((c) => c.status === "escalated" || c.escalationLevel > 0).length;

  return {
    total,
    pending,
    resolved,
    highPriority,
    avgResolutionHours: 24,
    satisfactionRate: total > 0 ? Math.min(99, Math.round((resolved / total) * 30 + 68)) : 94,
    aiAccuracy: 95,
    escalated,
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const db = await getComplaints();
  const categoriesMap: Record<string, { value: number; color: string }> = {
    "Garbage / Sanitation": { value: 0, color: "#3B82F6" },
    "Water Supply": { value: 0, color: "#06B6D4" },
    "Road Damage": { value: 0, color: "#10B981" },
    "Electricity": { value: 0, color: "#F59E0B" },
    "Street Light": { value: 0, color: "#7C3AED" },
    "Illegal Construction": { value: 0, color: "#F97316" },
    "Encroachment": { value: 0, color: "#EC4899" },
    "Corruption": { value: 0, color: "#EF4444" },
    "Public Health": { value: 0, color: "#8B5CF6" },
  };

  const departmentsMap: Record<string, { resolved: number; pending: number; totalDays: number; count: number }> = {};
  const areaMap: Record<string, { count: number; lat: number; lng: number }> = {};
  const priorityMap = { high: 0, medium: 0, low: 0 };

  db.forEach((c) => {
    if (categoriesMap[c.category]) {
      categoriesMap[c.category].value += 1;
    } else {
      categoriesMap["Garbage / Sanitation"].value += 1;
    }

    const dept = c.department || "Lucknow Nagar Nigam";
    if (!departmentsMap[dept]) {
      departmentsMap[dept] = { resolved: 0, pending: 0, totalDays: 0, count: 0 };
    }
    if (c.status === "resolved") {
      departmentsMap[dept].resolved += 1;
    } else {
      departmentsMap[dept].pending += 1;
    }
    departmentsMap[dept].count += 1;

    const areaName = c.area || "Gomti Nagar, Lucknow";
    if (!areaMap[areaName]) {
      areaMap[areaName] = { count: 0, lat: c.latitude || 26.8567, lng: c.longitude || 80.9462 };
    }
    areaMap[areaName].count += 1;
    if (priorityMap[c.priority] !== undefined) {
      priorityMap[c.priority] += 1;
    }
  });

  const categoryDistribution = Object.entries(categoriesMap).map(([name, data]) => ({
    name,
    value: data.value === 0 ? 1 : data.value,
    color: data.color,
  }));

  const departmentEfficiency = Object.entries(departmentsMap).map(([name, data]) => ({
    department: name,
    resolved: data.resolved,
    pending: data.pending || 1,
    avgDays: 3,
  }));

  const areaWiseData = Object.entries(areaMap).map(([area, data]) => ({
    area,
    complaints: data.count,
    lat: data.lat,
    lng: data.lng,
  }));

  return {
    complaintTrends: [
      { date: "May 20", count: 28, resolved: 24 },
      { date: "May 21", count: 43, resolved: 31 },
      { date: "May 22", count: db.length + 10, resolved: db.filter(c => c.status === "resolved").length + 5 },
    ],
    categoryDistribution,
    departmentEfficiency,
    areaWiseData,
    resolutionSpeed: [{ month: "Jan", avgHours: 48 }, { month: "May", avgHours: 24 }],
    priorityBreakdown: [
      { priority: "High", count: priorityMap.high || 3, color: "#EF4444" },
      { priority: "Medium", count: priorityMap.medium || 5, color: "#F59E0B" },
      { priority: "Low", count: priorityMap.low || 2, color: "#10B981" },
    ],
  };
}
