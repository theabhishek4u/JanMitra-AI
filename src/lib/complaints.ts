import { Complaint, ComplaintStatus, DashboardStats, AnalyticsData, Priority, Notification, ResolutionProof, CitizenVerification } from "@/types";
import { supabase } from "./supabaseClient";
import { getDepartmentById, getDepartmentForCategory } from "@/data/departments";
import { analyzeComplaintTrust } from "@/lib/fakeDetection";

const isClient = typeof window !== "undefined";
const CITIZEN_NOTIF_KEY = "janmitra_citizen_notifications";
const OFFICER_NOTIF_KEY = "janmitra_officer_notifications";

// Notifications Helpers
export function getCitizenNotifications(): Notification[] {
  if (!isClient) return [];
  const data = localStorage.getItem(CITIZEN_NOTIF_KEY);
  return data ? JSON.parse(data) : [];
}

export function getOfficerNotifications(): Notification[] {
  if (!isClient) return [];
  const data = localStorage.getItem(OFFICER_NOTIF_KEY);
  return data ? JSON.parse(data) : [];
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
    localStorage.setItem(CITIZEN_NOTIF_KEY, JSON.stringify(notifs));
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
    localStorage.setItem(OFFICER_NOTIF_KEY, JSON.stringify(notifs));
  }
  return newNotif;
}

export function markNotificationAsRead(id: string, role: "citizen" | "officer") {
  const key = role === "citizen" ? CITIZEN_NOTIF_KEY : OFFICER_NOTIF_KEY;
  const notifs = role === "citizen" ? getCitizenNotifications() : getOfficerNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  if (isClient) {
    localStorage.setItem(key, JSON.stringify(updated));
  }
}

export function clearNotifications(role: "citizen" | "officer") {
  const key = role === "citizen" ? CITIZEN_NOTIF_KEY : OFFICER_NOTIF_KEY;
  if (isClient) {
    localStorage.setItem(key, JSON.stringify([]));
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
    timeline: updates.map(u => ({
      id: u.id,
      status: u.status as ComplaintStatus,
      message: u.message,
      messageHi: u.message_hi || u.message,
      timestamp: u.created_at,
      isActive: true, // Will compute active based on logic if needed
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    escalationLevel: row.escalation_level,
    assignedOfficer: row.assigned_officer,
    trustAnalysis: row.trust_analysis,
    resolutionProof: row.resolution_proof,
    citizenVerification: row.citizen_verification,
  };
}

export async function getComplaints(): Promise<Complaint[]> {
  const { data: complaints, error: cErr } = await supabase
    .from("complaints")
    .select("*");
    
  if (cErr || !complaints) return [];

  const { data: updates, error: uErr } = await supabase
    .from("complaint_updates")
    .select("*");
    
  const updatesByComplaint = (updates || []).reduce((acc: any, u: any) => {
    if (!acc[u.complaint_id]) acc[u.complaint_id] = [];
    acc[u.complaint_id].push(u);
    return acc;
  }, {});

  const mapped = complaints.map(c => mapComplaint(c, updatesByComplaint[c.id] || []));
  
  // Clustering logic for hotspots
  const activeGroups: Record<string, number> = {};
  mapped.forEach((c) => {
    if (c.status !== "resolved") {
      const key = `${c.area.toLowerCase().trim()}_${c.category.toLowerCase().trim()}`;
      activeGroups[key] = (activeGroups[key] || 0) + 1;
    }
  });

  const processed = mapped.map((c) => {
    if (c.status !== "resolved") {
      const key = `${c.area.toLowerCase().trim()}_${c.category.toLowerCase().trim()}`;
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
  const { data, error } = await supabase.from("complaints").select("*").eq("id", id).single();
  if (error || !data) return undefined;
  const { data: updates } = await supabase.from("complaint_updates").select("*").eq("complaint_id", id);
  return mapComplaint(data, updates || []);
}

export async function addComplaint(complaintData: Partial<Complaint>): Promise<Complaint | null> {
  const year = new Date().getFullYear();
  // Instead of counting locally, we use UUID or generate a random short ID for simplicity, 
  // or fetch count from DB.
  const { count } = await supabase.from("complaints").select("*", { count: "exact", head: true });
  const index = String((count || 0) + 1).padStart(3, "0");
  const id = `JM-${year}-${index}-${Math.floor(Math.random() * 1000)}`;
  
  const dept = complaintData.category 
    ? getDepartmentForCategory(complaintData.category as any)
    : undefined;

  const trustAnalysis = analyzeComplaintTrust(complaintData as any, []); // Simplified for now
  
  const newRow = {
    id,
    title: complaintData.title || "Civic Issue Reported",
    title_hi: complaintData.titleHi || "नागरिक समस्या दर्ज",
    description: complaintData.description || "",
    description_hi: complaintData.descriptionHi || "",
    category: complaintData.category || "Garbage / Sanitation",
    category_hi: complaintData.categoryHi || "कचरा / स्वच्छता",
    priority: complaintData.priority || "medium",
    status: complaintData.status || "submitted",
    department_id: dept?.id || "nagar-nigam",
    latitude: complaintData.latitude || 26.8467,
    longitude: complaintData.longitude || 80.9462,
    area: complaintData.area || "Gomti Nagar, Lucknow",
    citizen_id: complaintData.citizenId || null,
    citizen_name: complaintData.citizenName || "Demo Citizen",
    citizen_phone: complaintData.citizenPhone || "+91 99999 88888",
    image_url: complaintData.imageUrl,
    voice_url: complaintData.voiceUrl,
    ai_summary: complaintData.aiSummary || "Awaiting AI summarization.",
    ai_summary_hi: complaintData.aiSummaryHi || "AI सारांश लंबित।",
    ai_confidence: complaintData.aiConfidence || 0.90,
    trust_analysis: trustAnalysis,
    trust_score: trustAnalysis.trustScore / 100,
    escalation_level: 0,
    assigned_officer: dept?.officerName || "Shri Rajesh Kumar",
  };

  const { data, error } = await supabase.from("complaints").insert(newRow).select().single();
  
  if (error || !data) {
    console.error("Error inserting complaint:", error ? JSON.stringify(error) : 'No data returned');
    console.error("Error details:", error?.message, error?.details, error?.hint);
    return null;
  }

  // Insert timeline updates
  const updates = [
    { complaint_id: id, status: "submitted", message: "Complaint submitted successfully by citizen.", message_hi: "नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।" },
    { complaint_id: id, status: "ai_analyzing", message: `AI Classification Complete`, message_hi: `AI विश्लेषण पूर्ण` },
    { complaint_id: id, status: "department_assigned", message: `Routed to department automatically.`, message_hi: `स्वचालित रूप से आवंटित।` },
  ];
  await supabase.from("complaint_updates").insert(updates);

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));

  addOfficerNotification("update", `New grievance filed: ${newRow.id}`, `नई शिकायत दर्ज: ${newRow.id}`, newRow.id);
  
  return (await getComplaintById(id)) || null;
}

export async function updateComplaintStatus(
  id: string, 
  status: ComplaintStatus, 
  officerName?: string, 
  noteEn?: string, 
  noteHi?: string
): Promise<Complaint | undefined> {
  const { data: c } = await supabase.from("complaints").select("*").eq("id", id).single();
  if (!c) return undefined;

  let defaultMsgEn = `Status updated to ${status.replace(/_/g, " ")}.`;
  let defaultMsgHi = `स्थिति बदलकर ${status} कर दी गई है।`;
  let resolvedAt = c.resolved_at;
  let escLevel = c.escalation_level;

  if (status === "officer_reviewing") {
    defaultMsgEn = `Officer ${officerName || c.assigned_officer} has begun reviewing the grievance.`;
    defaultMsgHi = `अधिकारी ${officerName || c.assigned_officer} ने शिकायत की समीक्षा शुरू कर दी है।`;
  } else if (status === "resolved") {
    defaultMsgEn = `Issue resolved completely. Resolution verified by department.`;
    defaultMsgHi = `समस्या का पूर्ण निवारण हो चुका है। विभाग द्वारा निवारण की पुष्टि की गई है।`;
    resolvedAt = new Date().toISOString();
  } else if (status === "escalated") {
    escLevel = c.escalation_level + 1;
    defaultMsgEn = `Ticket escalated to Level ${escLevel}.`;
    defaultMsgHi = `शिकायत को स्तर ${escLevel} पर प्रेषित किया गया।`;
  }

  const finalMsgEn = noteEn ? `${defaultMsgEn} Note: ${noteEn}` : defaultMsgEn;
  const finalMsgHi = noteHi ? `${defaultMsgHi} टिप्पणी: ${noteHi}` : defaultMsgHi;

  await supabase.from("complaints").update({ status, resolved_at: resolvedAt, escalation_level: escLevel }).eq("id", id);
  await supabase.from("complaint_updates").insert({ complaint_id: id, status, message: finalMsgEn, message_hi: finalMsgHi });

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  addCitizenNotification(status === "resolved" ? "resolution" : "update", finalMsgEn, finalMsgHi, id);

  return getComplaintById(id);
}

export async function mergeDuplicateComplaint(id: string, parentId: string): Promise<Complaint | undefined> {
  const msgEn = `Merged with similar nearby complaint ${parentId}. Action consolidated.`;
  const msgHi = `समान क्षेत्र की शिकायत ${parentId} के साथ एकीकृत किया गया। संयुक्त निवारण कार्यवाही जारी।`;
  
  await supabase.from("complaints").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
  await supabase.from("complaint_updates").insert({ complaint_id: id, status: "resolved", message: msgEn, message_hi: msgHi });

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  return getComplaintById(id);
}

export async function updateComplaintVerdict(id: string, verdict: "safe" | "spam"): Promise<Complaint | undefined> {
  const { data: c } = await supabase.from("complaints").select("*").eq("id", id).single();
  if (!c) return undefined;
  
  const trustAnalysis = c.trust_analysis || {};
  trustAnalysis.reviewedByOfficer = true;
  trustAnalysis.officerVerdict = verdict;

  await supabase.from("complaints").update({ trust_analysis: trustAnalysis }).eq("id", id);
  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  return getComplaintById(id);
}

export async function getSuspiciousComplaints(): Promise<Complaint[]> {
  const all = await getComplaints();
  return all.filter((c) => c.trustAnalysis && c.trustAnalysis.trustLevel !== "high" && !c.trustAnalysis.reviewedByOfficer);
}

export async function submitResolutionProof(
  id: string, proofPhotoUrl: string, noteEn: string, noteHi: string, officerName: string
): Promise<Complaint | undefined> {
  const proof = { photoUrl: proofPhotoUrl, note: noteEn, noteHi, submittedAt: new Date().toISOString(), officerName };
  const msg = `Resolution proof submitted by ${officerName}. "${noteEn}" — Awaiting citizen confirmation.`;
  const msgHi = `${officerName} द्वारा समाधान प्रमाण प्रस्तुत: "${noteHi}" — नागरिक पुष्टि की प्रतीक्षा में।`;
  
  await supabase.from("complaints").update({ status: "pending_citizen_confirmation", resolution_proof: proof }).eq("id", id);
  await supabase.from("complaint_updates").insert({ complaint_id: id, status: "pending_citizen_confirmation", message: msg, message_hi: msgHi });

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  addCitizenNotification("resolution", "🔔 Resolution proof submitted. Please confirm.", "🔔 समाधान प्रमाण प्रस्तुत। पुष्टि करें।", id);
  return getComplaintById(id);
}

export async function citizenVerifyResolution(
  id: string, verified: boolean, feedback: string, feedbackHi: string, rejectionPhotoUrl?: string
): Promise<Complaint | undefined> {
  const now = new Date().toISOString();
  const ver = { verified, feedback, feedbackHi, photoUrl: rejectionPhotoUrl, submittedAt: now };
  const status = verified ? "resolved" : "reopened";
  const msg = verified ? `✅ Citizen confirmed: Issue is resolved. "${feedback}"` : `❌ Citizen REJECTED resolution: "${feedback}"`;
  const msgHi = verified ? `✅ नागरिक द्वारा पुष्टि: समस्या हल हो गई है। "${feedbackHi}"` : `❌ नागरिक ने समाधान अस्वीकार किया: "${feedbackHi}"`;

  const updatePayload: any = { status, citizen_verification: ver };
  if (verified) updatePayload.resolved_at = now;

  await supabase.from("complaints").update(updatePayload).eq("id", id);
  await supabase.from("complaint_updates").insert({ complaint_id: id, status, message: msg, message_hi: msgHi });

  if (isClient) window.dispatchEvent(new CustomEvent("janmitra-db-change"));
  return getComplaintById(id);
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
    total, pending, resolved, highPriority,
    avgResolutionHours: 24,
    satisfactionRate: Math.round((resolved / (total || 1)) * 30 + 68),
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
    if (categoriesMap[c.category]) categoriesMap[c.category].value += 1;
    else categoriesMap["Garbage / Sanitation"].value += 1;

    const dept = c.department || "Lucknow Nagar Nigam";
    if (!departmentsMap[dept]) departmentsMap[dept] = { resolved: 0, pending: 0, totalDays: 0, count: 0 };
    if (c.status === "resolved") departmentsMap[dept].resolved += 1;
    else departmentsMap[dept].pending += 1;
    departmentsMap[dept].count += 1;

    if (!areaMap[c.area]) areaMap[c.area] = { count: 0, lat: c.latitude || 26.8567, lng: c.longitude || 80.9462 };
    areaMap[c.area].count += 1;
    priorityMap[c.priority] += 1;
  });

  const categoryDistribution = Object.entries(categoriesMap).map(([name, data]) => ({ name, value: data.value === 0 ? 1 : data.value, color: data.color }));
  const departmentEfficiency = Object.entries(departmentsMap).map(([name, data]) => ({ department: name, resolved: data.resolved, pending: data.pending || 1, avgDays: 3 }));
  const areaWiseData = Object.entries(areaMap).map(([area, data]) => ({ area, complaints: data.count, lat: data.lat, lng: data.lng }));

  return {
    complaintTrends: [
      { date: "May 20", count: 28, resolved: 24 },
      { date: "May 21", count: 43, resolved: 31 },
      { date: "May 22", count: db.length + 10, resolved: db.filter(c => c.status === "resolved").length + 5 },
    ],
    categoryDistribution, departmentEfficiency, areaWiseData,
    resolutionSpeed: [{ month: "Jan", avgHours: 48 }, { month: "May", avgHours: 24 }],
    priorityBreakdown: [
      { priority: "High", count: priorityMap.high || 3, color: "#EF4444" },
      { priority: "Medium", count: priorityMap.medium || 5, color: "#F59E0B" },
      { priority: "Low", count: priorityMap.low || 2, color: "#10B981" },
    ],
  };
}
