// ============================================
// JanMitra AI — TypeScript Type Definitions
// ============================================

export type ComplaintStatus =
  | "submitted"
  | "ai_analyzing"
  | "department_assigned"
  | "officer_reviewing"
  | "action_in_progress"
  | "resolved"
  | "escalated";

export type Priority = "high" | "medium" | "low";

export type Language = "en" | "hi" | "ur";

export type UserRole = "citizen" | "officer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  district?: string;
}

export interface Department {
  id: string;
  name: string;
  nameHi: string;
  officerName: string;
  officerTitle: string;
  avgResolutionDays: number;
  activeComplaints: number;
  icon: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  departmentId: string;
  keywords: string[];
  keywordsHi: string[];
}

export interface AIClassification {
  category: string;
  categoryHi: string;
  priority: Priority;
  urgency: string;
  department: string;
  departmentHi: string;
  summary: string;
  summaryHi: string;
  confidence: number;
  fraudRisk: number;
  duplicateOf?: string;
  predictedResolutionDays: number;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  message: string;
  messageHi: string;
  timestamp: string;
  isActive: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: string;
  categoryHi: string;
  priority: Priority;
  status: ComplaintStatus;
  department: string;
  departmentHi: string;
  latitude: number;
  longitude: number;
  area: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  imageUrl?: string;
  voiceUrl?: string;
  aiSummary: string;
  aiSummaryHi: string;
  aiConfidence: number;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  escalationLevel: number;
  assignedOfficer?: string;
  isHotspot?: boolean;
  hotspotCount?: number;
}

export interface DashboardStats {
  total: number;
  pending: number;
  resolved: number;
  highPriority: number;
  avgResolutionHours: number;
  satisfactionRate: number;
  aiAccuracy: number;
  escalated: number;
}

export interface AnalyticsData {
  complaintTrends: { date: string; count: number; resolved: number }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  departmentEfficiency: { department: string; resolved: number; pending: number; avgDays: number }[];
  areaWiseData: { area: string; complaints: number; lat: number; lng: number }[];
  resolutionSpeed: { month: string; avgHours: number }[];
  priorityBreakdown: { priority: string; count: number; color: string }[];
}

export interface Notification {
  id: string;
  type: "update" | "escalation" | "reminder" | "resolution";
  message: string;
  messageHi: string;
  complaintId: string;
  timestamp: string;
  read: boolean;
}
