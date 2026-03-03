// ARShot Dashboard Types

export type Locale = "fr" | "en" | "es" | "de";

export type Currency = "EUR" | "USD";

export type ModelStatus = "pending" | "processing" | "ready" | "failed";

export type PipelineType = "object_capture" | "flash_vdm";

export type PlanTier = "starter" | "pro" | "business" | "enterprise";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  locale: Locale;
  currency: Currency;
  plan: PlanTier;
  createdAt: string;
}

export interface ARModel {
  id: string;
  userId: string;
  name: string;
  status: ModelStatus;
  pipeline: PipelineType;
  shortId: string;
  modelUrl: string | null;
  thumbnailUrl: string | null;
  usdzUrl: string | null;
  glbUrl: string | null;
  qualityScore: number | null;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScanEvent {
  id: string;
  modelId: string;
  device: "ios" | "android" | "desktop";
  country: string;
  city: string;
  timestamp: string;
}

export interface DashboardStats {
  totalProducts: number;
  scansThisMonth: number;
  currentPlan: PlanTier;
  arScore: number;
  arScoreSuggestions: string[];
}

export interface ScansByDay {
  date: string;
  count: number;
}

export interface DeviceSplit {
  device: string;
  count: number;
  percentage: number;
}

export interface CountryStat {
  country: string;
  countryCode: string;
  count: number;
}

export interface PlanLimits {
  maxProducts: number;
  maxScansPerMonth: number;
  variations: boolean;
  analytics: boolean;
  customBranding: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  starter: {
    maxProducts: 3,
    maxScansPerMonth: 100,
    variations: false,
    analytics: false,
    customBranding: false,
  },
  pro: {
    maxProducts: 15,
    maxScansPerMonth: 1000,
    variations: true,
    analytics: true,
    customBranding: false,
  },
  business: {
    maxProducts: 50,
    maxScansPerMonth: 10000,
    variations: true,
    analytics: true,
    customBranding: true,
  },
  enterprise: {
    maxProducts: Infinity,
    maxScansPerMonth: Infinity,
    variations: true,
    analytics: true,
    customBranding: true,
  },
};

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface GenerateModelRequest {
  name: string;
  pipeline: PipelineType;
  files: File[];
}
