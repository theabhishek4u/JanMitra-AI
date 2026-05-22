// ============================================
// JanMitra AI — Dynamic Persistence Engine
// ============================================
// Simulates SQL queries in browser memory and local storage.
// Connects Citizen submissions, Officer decisions, and Admin metrics.

import { Complaint, ComplaintStatus, DashboardStats, AnalyticsData, Priority, Notification } from "@/types";
import { mockComplaints } from "@/data/complaints";
import { getDepartmentById, getDepartmentForCategory } from "@/data/departments";

const LOCAL_STORAGE_KEY = "janmitra_complaints_db";
const CITIZEN_NOTIF_KEY = "janmitra_citizen_notifications";
const OFFICER_NOTIF_KEY = "janmitra_officer_notifications";

// Helper to check if running in browser
const isClient = typeof window !== "undefined";

// ============================================
// Notifications Storage Helpers
// ============================================
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

// 1. Initialise database with standard seeds if empty
export function initDatabase() {
  if (!isClient) return;
  const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockComplaints));
  }
}

// 2. Fetch all complaints
export function getComplaints(): Complaint[] {
  if (!isClient) return mockComplaints;
  initDatabase();
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  const rawComplaints: Complaint[] = data ? JSON.parse(data) : mockComplaints;

  // Perform dynamic hotspot clustering
  // Group active (non-resolved) complaints by area + category
  const activeGroups: Record<string, number> = {};
  
  rawComplaints.forEach((c) => {
    if (c.status !== "resolved") {
      const key = `${c.area.toLowerCase().trim()}_${c.category.toLowerCase().trim()}`;
      activeGroups[key] = (activeGroups[key] || 0) + 1;
    }
  });

  const processed = rawComplaints.map((c) => {
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
    return {
      ...c,
      isHotspot: false,
      hotspotCount: 0,
    };
  });

  // Sort: active hotspots first, followed by other active complaints, followed by resolved complaints
  // Sorted by createdAt descending within their respective tier
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

      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aWeight = priorityWeight[a.priority] || 2;
      const bWeight = priorityWeight[b.priority] || 2;
      if (aWeight !== bWeight) {
        return bWeight - aWeight;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

// 3. Find single complaint
export function getComplaintById(id: string): Complaint | undefined {
  const db = getComplaints();
  return db.find((c) => c.id === id);
}

// 4. Save entire database
export function saveDatabase(db: Complaint[]) {
  if (!isClient) return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

// 5. Add a new complaint (Citizen submission)
export function addComplaint(complaintData: Partial<Complaint>): Complaint {
  const db = getComplaints();
  
  const year = new Date().getFullYear();
  const index = String(db.length + 1).padStart(3, "0");
  const id = `JM-${year}-${index}`;

  const now = new Date().toISOString();
  
  // Set up dynamic department assigned
  const dept = complaintData.category 
    ? getDepartmentForCategory(complaintData.category === "Garbage / Sanitation" ? "garbage" : 
                               complaintData.category === "Water Supply" ? "water-supply" : 
                               complaintData.category === "Road Damage" ? "road-damage" : 
                               complaintData.category === "Electricity" ? "electricity" : 
                               complaintData.category === "Street Light" ? "street-light" : 
                               complaintData.category === "Illegal Construction" ? "illegal-construction" : 
                               complaintData.category === "Encroachment" ? "encroachment" : 
                               complaintData.category === "Corruption" ? "corruption" : "health")
    : undefined;

  const newComplaint: Complaint = {
    id,
    title: complaintData.title || "Civic Issue Reported",
    titleHi: complaintData.titleHi || "नागरिक समस्या दर्ज",
    description: complaintData.description || "",
    descriptionHi: complaintData.descriptionHi || "",
    category: complaintData.category || "Garbage / Sanitation",
    categoryHi: complaintData.categoryHi || "कचरा / स्वच्छता",
    priority: (complaintData.priority as Priority) || "medium",
    status: (complaintData.status as ComplaintStatus) || "submitted",
    department: dept?.name || complaintData.department || "Lucknow Nagar Nigam",
    departmentHi: dept?.nameHi || complaintData.departmentHi || "लखनऊ नगर निगम",
    latitude: complaintData.latitude || 26.8467,
    longitude: complaintData.longitude || 80.9462,
    area: complaintData.area || "Gomti Nagar, Lucknow",
    citizenId: complaintData.citizenId || "cit-999",
    citizenName: complaintData.citizenName || "Demo Citizen",
    citizenPhone: complaintData.citizenPhone || "+91 99999 88888",
    imageUrl: complaintData.imageUrl,
    voiceUrl: complaintData.voiceUrl,
    aiSummary: complaintData.aiSummary || "Awaiting AI summarization.",
    aiSummaryHi: complaintData.aiSummaryHi || "AI सारांश लंबित।",
    aiConfidence: complaintData.aiConfidence || 0.90,
    timeline: complaintData.timeline || [
      {
        id: "t1",
        status: "submitted",
        message: "Complaint submitted successfully by citizen.",
        messageHi: "नागरिक द्वारा शिकायत सफलतापूर्वक दर्ज की गई।",
        timestamp: now,
        isActive: false,
      },
      {
        id: "t2",
        status: "ai_analyzing",
        message: `AI Classification Complete — Confidence: ${Math.round((complaintData.aiConfidence || 0.90) * 100)}%`,
        messageHi: `AI विश्लेषण पूर्ण — सटीकता: ${Math.round((complaintData.aiConfidence || 0.90) * 100)}%`,
        timestamp: new Date(Date.now() + 5000).toISOString(),
        isActive: false,
      },
      {
        id: "t3",
        status: "department_assigned",
        message: `Routed to ${dept?.name || "Lucknow Nagar Nigam"} automatically.`,
        messageHi: `स्वचालित रूप से ${dept?.nameHi || "लखनऊ नगर निगम"} को आवंटित।`,
        timestamp: new Date(Date.now() + 10000).toISOString(),
        isActive: true,
      }
    ],
    createdAt: now,
    updatedAt: now,
    escalationLevel: 0,
    assignedOfficer: dept?.officerName || "Shri Rajesh Kumar",
  };

  db.unshift(newComplaint);
  saveDatabase(db);

  // Trigger Officer Notification
  addOfficerNotification(
    "update",
    `New grievance filed: ${newComplaint.id} - ${newComplaint.title} in ${newComplaint.area}`,
    `नई शिकायत दर्ज: ${newComplaint.id} - ${newComplaint.titleHi} (${newComplaint.area}) में`,
    newComplaint.id
  );

  return newComplaint;
}

// 6. Update complaint status & log (Officer console)
export function updateComplaintStatus(
  id: string, 
  status: ComplaintStatus, 
  officerName?: string, 
  noteEn?: string, 
  noteHi?: string
): Complaint | undefined {
  const db = getComplaints();
  const index = db.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const complaint = db[index];

  // Disable other active timeline elements
  const updatedTimeline = complaint.timeline.map((item) => ({
    ...item,
    isActive: false,
  }));

  const timelineId = `t-${Date.now()}`;
  
  let defaultMsgEn = `Status updated to ${status.replace(/_/g, " ")}.`;
  let defaultMsgHi = `स्थिति बदलकर ${status} कर दी गई है।`;

  if (status === "officer_reviewing") {
    defaultMsgEn = `Officer ${officerName || complaint.assignedOfficer} has begun reviewing the grievance.`;
    defaultMsgHi = `अधिकारी ${officerName || complaint.assignedOfficer} ने शिकायत की समीक्षा शुरू कर दी है।`;
  } else if (status === "action_in_progress") {
    defaultMsgEn = `Action is in progress. Field technicians have been dispatched to resolve the issue.`;
    defaultMsgHi = `कार्य प्रगति पर है। समस्या के समाधान हेतु तकनीकी दल रवाना कर दिया गया है।`;
  } else if (status === "resolved") {
    defaultMsgEn = `Issue resolved completely. Resolution verified by department.`;
    defaultMsgHi = `समस्या का पूर्ण निवारण हो चुका है। विभाग द्वारा निवारण की पुष्टि की गई है।`;
    complaint.resolvedAt = now;
  } else if (status === "escalated") {
    const nextLevel = complaint.escalationLevel + 1;
    let escalatedTo = "Senior Officer";
    if (nextLevel === 2) escalatedTo = "Department Commissioner";
    if (nextLevel >= 3) escalatedTo = "Uttar Pradesh Secretariat";
    
    defaultMsgEn = `Ticket escalated to Level ${nextLevel} (${escalatedTo}) due to SLA threshold breach.`;
    defaultMsgHi = `SLA सीमा उल्लंघन के कारण शिकायत को स्तर ${nextLevel} (${escalatedTo}) पर प्रेषित किया गया।`;
    complaint.escalationLevel = nextLevel;
  }

  // If officer left custom notes, prepend/append them
  const finalMsgEn = noteEn ? `${defaultMsgEn} Note: ${noteEn}` : defaultMsgEn;
  const finalMsgHi = noteHi ? `${defaultMsgHi} टिप्पणी: ${noteHi}` : defaultMsgHi;

  updatedTimeline.push({
    id: timelineId,
    status,
    message: finalMsgEn,
    messageHi: finalMsgHi,
    timestamp: now,
    isActive: true,
  });

  complaint.status = status;
  complaint.timeline = updatedTimeline;
  complaint.updatedAt = now;

  db[index] = complaint;
  saveDatabase(db);

  // Trigger Citizen Notification
  let notifMessageEn = `Your grievance ${complaint.id} status has been updated to "${status.replace(/_/g, " ")}" by Officer.`;
  let notifMessageHi = `आपकी शिकायत ${complaint.id} की स्थिति अधिकारी द्वारा "${status}" में अपडेट की गई है।`;

  if (status === "officer_reviewing") {
    notifMessageEn = `Officer ${officerName || complaint.assignedOfficer} has started reviewing your grievance ${complaint.id}.`;
    notifMessageHi = `अधिकारी ${officerName || complaint.assignedOfficer} ने आपकी शिकायत ${complaint.id} की समीक्षा शुरू की है।`;
  } else if (status === "action_in_progress") {
    notifMessageEn = `Field action started for your grievance ${complaint.id}. Resolution team has been dispatched.`;
    notifMessageHi = `आपकी शिकायत ${complaint.id} पर मैदानी कार्रवाई शुरू हो गई है। समाधान दल रवाना कर दिया गया है।`;
  } else if (status === "resolved") {
    notifMessageEn = `Excellent news! Your grievance ${complaint.id} has been fully resolved. Note: ${noteEn || "Issue fixed."}`;
    notifMessageHi = `शानदार खबर! आपकी शिकायत ${complaint.id} का पूर्ण निवारण कर दिया गया है। टिप्पणी: ${noteHi || "समस्या हल।"}`;
  } else if (status === "escalated") {
    notifMessageEn = `Your grievance ${complaint.id} has been escalated to Level ${complaint.escalationLevel} for senior review.`;
    notifMessageHi = `आपकी शिकायत ${complaint.id} को वरिष्ठ समीक्षा के लिए स्तर ${complaint.escalationLevel} पर प्रेषित किया गया है।`;
  }

  addCitizenNotification(
    status === "resolved" ? "resolution" : status === "escalated" ? "escalation" : "update",
    notifMessageEn,
    notifMessageHi,
    complaint.id
  );

  return complaint;
}

// 7. Merge duplicate complaint into existing ticket
export function mergeDuplicateComplaint(id: string, parentId: string): Complaint | undefined {
  const db = getComplaints();
  const index = db.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const complaint = db[index];
  const now = new Date().toISOString();

  // Disable active timeline elements
  const updatedTimeline = complaint.timeline.map((item) => ({
    ...item,
    isActive: false,
  }));

  updatedTimeline.push({
    id: `t-merge-${Date.now()}`,
    status: "resolved",
    message: `Merged with similar nearby complaint ${parentId}. Action consolidated.`,
    messageHi: `समान क्षेत्र की शिकायत ${parentId} के साथ एकीकृत किया गया। संयुक्त निवारण कार्यवाही जारी।`,
    timestamp: now,
    isActive: true,
  });

  complaint.status = "resolved";
  complaint.timeline = updatedTimeline;
  complaint.updatedAt = now;
  complaint.resolvedAt = now;

  db[index] = complaint;
  saveDatabase(db);
  return complaint;
}

// 8. Generate dynamic aggregated statistics for Dashboard
export function getStats(): DashboardStats {
  const db = getComplaints();
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
    avgResolutionHours: 24, // Bounded mock avg
    satisfactionRate: Math.round((resolved / (total || 1)) * 30 + 68), // Rises with resolutions!
    aiAccuracy: 95,
    escalated,
  };
}

// 9. Generate dynamic Recharts analytical datasets based on current DB
export function getAnalytics(): AnalyticsData {
  const db = getComplaints();
  
  // A. Category Distribution
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

  db.forEach((c) => {
    if (categoriesMap[c.category]) {
      categoriesMap[c.category].value += 1;
    } else {
      categoriesMap["Garbage / Sanitation"].value += 1;
    }
  });

  const categoryDistribution = Object.entries(categoriesMap)
    .map(([name, data]) => ({
      name,
      value: data.value === 0 ? 1 : data.value, // Keep minimum 1 for beautiful visual charts
      color: data.color,
    }));

  // B. Department Performance
  const departmentsMap: Record<string, { resolved: number; pending: number; totalDays: number; count: number }> = {
    "Lucknow Nagar Nigam": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Jal Nigam": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Public Works Department": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Power Department (UPPCL)": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Municipal Authority": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Anti-Corruption Bureau": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Lucknow Municipal Corporation": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
    "Health Department": { resolved: 0, pending: 0, totalDays: 0, count: 0 },
  };

  db.forEach((c) => {
    const dept = c.department || "Lucknow Nagar Nigam";
    if (departmentsMap[dept]) {
      if (c.status === "resolved") {
        departmentsMap[dept].resolved += 1;
      } else {
        departmentsMap[dept].pending += 1;
      }
      departmentsMap[dept].count += 1;
      departmentsMap[dept].totalDays += c.resolvedAt 
        ? Math.round((new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 3;
    }
  });

  const departmentEfficiency = Object.entries(departmentsMap)
    .map(([name, data]) => ({
      department: name.replace("Department", "Dept"),
      resolved: data.resolved,
      pending: data.pending || 1, // Visual spacer
      avgDays: data.count > 0 ? Math.max(Math.round(data.totalDays / data.count), 2) : getDepartmentById(name.toLowerCase().replace(/ /g, "-"))?.avgResolutionDays || 4,
    }));

  // C. Area Wise Map Clusters
  const areaMap: Record<string, { count: number; lat: number; lng: number }> = {};
  db.forEach((c) => {
    if (!areaMap[c.area]) {
      areaMap[c.area] = {
        count: 0,
        lat: c.latitude || 26.8567,
        lng: c.longitude || 80.9462,
      };
    }
    areaMap[c.area].count += 1;
  });

  const areaWiseData = Object.entries(areaMap).map(([area, data]) => ({
    area,
    complaints: data.count,
    lat: data.lat,
    lng: data.lng,
  }));

  // D. Complaint Trends (Mock-linked dates)
  const complaintTrends = [
    { date: "May 16", count: 18, resolved: 14 },
    { date: "May 17", count: 24, resolved: 19 },
    { date: "May 18", count: 21, resolved: 15 },
    { date: "May 19", count: 32, resolved: 22 },
    { date: "May 20", count: 28, resolved: 24 },
    { date: "May 21", count: 43, resolved: 31 },
    { date: "May 22", count: db.length + 10, resolved: db.filter(c => c.status === "resolved").length + 5 },
  ];

  // E. Resolution Speed
  const resolutionSpeed = [
    { month: "Jan", avgHours: 48 },
    { month: "Feb", avgHours: 42 },
    { month: "Mar", avgHours: 38 },
    { month: "Apr", avgHours: 35 },
    { month: "May", avgHours: 24 },
  ];

  // F. Priority Breakdown
  const priorityMap = { high: 0, medium: 0, low: 0 };
  db.forEach((c) => {
    priorityMap[c.priority] += 1;
  });

  const priorityBreakdown = [
    { priority: "High", count: priorityMap.high || 3, color: "#EF4444" },
    { priority: "Medium", count: priorityMap.medium || 5, color: "#F59E0B" },
    { priority: "Low", count: priorityMap.low || 2, color: "#10B981" },
  ];

  return {
    complaintTrends,
    categoryDistribution,
    departmentEfficiency,
    areaWiseData,
    resolutionSpeed,
    priorityBreakdown,
  };
}
