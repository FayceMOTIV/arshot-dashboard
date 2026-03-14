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

// ── Admin Business Stats ──

export interface AdminStats {
  mrr_total: number;
  users_by_plan: Record<string, number>;
  total_users: number;
  paying_users: number;
  new_this_week: number;
  new_this_month: number;
  churn_rate: number;
  total_revenue_cumulative: number;
  mrr_history: { date: string; mrr: number }[];
}

// ── Prospection ──

export type ProspectStatus =
  | "scraped"
  | "demo_generated"
  | "contacted"
  | "replied"
  | "signed_up"
  | "converted"
  | "lost";

export type ProspectSource = "scraper" | "alex" | "instagram" | "manual";

export type ContactChannel = "email" | "whatsapp" | "sms" | "instagram_dm";

export type ContactStatus = "sent" | "opened" | "replied" | "bounced";

export interface DemoModel {
  glb_url: string;
  viewer_url: string;
  qr_url: string;
  product_name: string;
  source_image_url: string | null;
  generated_at: string | null;
}

export interface ContactEvent {
  channel: ContactChannel;
  sent_at: string;
  message: string;
  status: ContactStatus;
}

export interface Prospect {
  id: string;
  company_name: string;
  website: string;
  email: string;
  phone: string;
  source: ProspectSource;
  status: ProspectStatus;
  scraped_images: string[];
  demo_models: DemoModel[];
  contacts: ContactEvent[];
  converted_user_id: string | null;
  revenue: number;
  tags: string[];
  notes: string;
  assigned_to: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProspectStats {
  total: number;
  by_status: { status: string; count: number }[];
  by_source: { source: string; count: number }[];
  converted_mrr: number;
  demos_generated_today: number;
  contacts_sent_today: number;
  conversion_rate: number;
}

export interface ScraperRun {
  id: string;
  status: "running" | "completed" | "failed" | "never_run";
  startedAt: string | null;
  finishedAt: string | null;
  config: { limit: number; platforms: string[] };
  results: { scraped: number; created: number; skipped: number; errors: number };
  message?: string;
}

// ── ARShot Studio ──

export type StudioJobStatus = "pending" | "processing" | "done" | "failed";

export type VideoTemplateName =
  | "unboxing"
  | "levitation"
  | "transform"
  | "before_after"
  | "360_hype"
  | "asmr_closeup"
  | "quiet_luxury"
  | "pov_unboxing";

export interface VideoTemplate {
  id: VideoTemplateName;
  label: string;
  description: string;
  previewUrl: string | null;
  trending: boolean;
}

export interface StudioJob {
  id: string;
  productId: string;
  template: VideoTemplateName;
  status: StudioJobStatus;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  progress: number;
  createdAt: string;
  completedAt: string | null;
}

export interface TrendData {
  recommendedTemplate: VideoTemplateName;
  trendName: string;
  trendScore: number;
}

export type PublishPlatform = "tiktok" | "instagram" | "pinterest";

export type ScheduleType = "now" | "best_time" | "custom";

export interface PublishRequest {
  jobId: string;
  platforms: PublishPlatform[];
  description: string;
  hashtags: string[];
  socialProof: boolean;
  scheduleType: ScheduleType;
  scheduledAt: string | null;
}

export interface PublishResult {
  id: string;
  jobId: string;
  platforms: PublishPlatform[];
  status: "queued" | "published" | "failed";
  scheduledAt: string | null;
  publishedAt: string | null;
}

export interface ABTest {
  id: string;
  productId: string;
  variants: ABTestVariant[];
  status: "running" | "completed" | "pending";
  startedAt: string;
  completedAt: string | null;
}

export interface ABTestVariant {
  template: VideoTemplateName;
  views: number;
  engagement: number;
  qrClicks: number;
  winner: boolean;
}

export interface CustomerARCapture {
  id: string;
  productId: string;
  imageUrl: string;
  capturedAt: string;
  device: "ios" | "android" | "desktop";
  country: string;
}

export interface ScheduledPost {
  id: string;
  jobId: string;
  productName: string;
  platform: PublishPlatform;
  scheduledAt: string;
  status: "scheduled" | "published" | "failed";
}

// ── Style Match ──

export type StylePresetName = "scandinavian" | "industrial" | "luxury" | "bohemian";

export interface StylePreset {
  id: StylePresetName;
  label: string;
  icon: string;
  baseColor: string;
  metalness: number;
  roughness: number;
}

export interface ColorMatchResult {
  dominantColor: string;
  palette: string[];
  metalness: number;
  roughness: number;
}

export interface MaterialTransferResult {
  textureUrl: string;
  metalness: number;
  roughness: number;
}

// ── Integrations ──

export interface IntegrationsStatus {
  shopify: boolean;
  woocommerce: boolean;
  tiktok: boolean;
  instagram: boolean;
  shopifyShop?: string;
  instagramUsername?: string;
}

export interface ShopifyConnectRequest {
  shop: string;
  accessToken: string;
}

export interface WooConnectRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// ── Plan Video Limits ──

export const PLAN_VIDEO_LIMITS: Record<PlanTier, number> = {
  starter: 2,
  pro: 10,
  business: 50,
  enterprise: Infinity,
};
