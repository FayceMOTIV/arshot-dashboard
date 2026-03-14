import { getIdToken, IS_MOCK } from "@/lib/firebase";

export { IS_MOCK };
import type {
  ARModel,
  AdminStats,
  DashboardStats,
  ScansByDay,
  DeviceSplit,
  CountryStat,
  StudioJob,
  VideoTemplateName,
  TrendData,
  PublishRequest,
  PublishResult,
  ABTest,
  CustomerARCapture,
  StylePreset,
  ColorMatchResult,
  MaterialTransferResult,
  ScheduledPost,
  IntegrationsStatus,
  ShopifyConnectRequest,
  WooConnectRequest,
  Prospect,
  ProspectStats,
  ScraperRun,
} from "@/types";

// API calls go through Next.js rewrites (same origin) — no CORS issues, works on ngrok too
const API_BASE = "";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
}

// ── Backend → Dashboard type mapper ──
// Backend returns: { id, userId, name, status, glbUrl, usdzUrl, spzUrl, thumbnailUrl, arScore, qrCode, ... }
// Dashboard expects ARModel: { shortId, modelUrl, scanCount, pipeline, qualityScore, ... }

function mapBackendProduct(raw: Record<string, unknown>): ARModel {
  return {
    id: (raw.id as string) || "",
    userId: (raw.userId as string) || "",
    name: (raw.name as string) || "",
    status: (raw.status as ARModel["status"]) || "pending",
    pipeline: (raw.pipeline as ARModel["pipeline"]) || "object_capture",
    shortId: (raw.qrCode as string) || (raw.shortId as string) || "",
    modelUrl: (raw.modelUrl as string) || null,
    thumbnailUrl: (raw.thumbnailUrl as string) || null,
    usdzUrl: (raw.usdzUrl as string) || null,
    glbUrl: (raw.glbUrl as string) || null,
    qualityScore: (raw.arScore as number) ?? (raw.qualityScore as number) ?? null,
    scanCount: (raw.scanCount as number) || 0,
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) || new Date().toISOString(),
  };
}

// ── Products (v4 endpoints) ──

export async function getProducts(): Promise<ARModel[]> {
  const raw = await fetchAPI<Record<string, unknown>[]>("/api/v1/products/");
  return raw.map(mapBackendProduct);
}

export async function getProductStatus(productId: string): Promise<ARModel> {
  const raw = await fetchAPI<Record<string, unknown>>(`/api/v1/products/${productId}`);
  return mapBackendProduct(raw);
}

export async function createProduct(data: {
  name: string;
  description?: string;
  platform?: string;
}): Promise<ARModel> {
  const raw = await fetchAPI<Record<string, unknown>>("/api/v1/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapBackendProduct(raw);
}

export async function uploadCapture(
  productId: string,
  file: File
): Promise<{ status: string; jobId: string }> {
  const token = await getIdToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/api/v1/products/${productId}/capture`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Erreur upload" }));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
}

// ── Legacy endpoints (backward compat) ──

export async function getUserModels(userId: string): Promise<ARModel[]> {
  return fetchAPI<ARModel[]>(`/models/user/${userId}`);
}

export async function getModel(id: string): Promise<ARModel> {
  return fetchAPI<ARModel>(`/models/${id}`);
}

export async function generateModel(formData: FormData): Promise<ARModel> {
  const token = await getIdToken();
  const response = await fetch(`${API_BASE}/models/generate`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur upload" }));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
}

// ── Breakout / Studio ──

export async function generateBreakout(
  productId: string,
  templateId: string
): Promise<{ id: string; status: string }> {
  return fetchAPI<{ id: string; status: string }>("/api/v1/breakout/generate", {
    method: "POST",
    body: JSON.stringify({ productId, templateId }),
  });
}

export async function getBreakoutStatus(
  breakoutId: string
): Promise<{ id: string; status: string; videoOutputUrl: string | null }> {
  return fetchAPI<{ id: string; status: string; videoOutputUrl: string | null }>(
    `/api/v1/breakout/${breakoutId}/status`
  );
}

export async function getProductBreakouts(
  productId: string
): Promise<{
  id: string;
  template: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  views: number;
  engagement: number;
  trending: boolean;
  createdAt: string;
}[]> {
  return fetchAPI(`/api/v1/breakout/product/${productId}`);
}

export async function generateStudioVideo(
  productId: string,
  template: VideoTemplateName,
  options?: Record<string, unknown>
): Promise<StudioJob> {
  return fetchAPI<StudioJob>("/studio/generate", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, template, options }),
  });
}

export async function getStudioJob(jobId: string): Promise<StudioJob> {
  return fetchAPI<StudioJob>(`/studio/job/${jobId}`);
}

export async function getStudioTrends(): Promise<TrendData> {
  return fetchAPI<TrendData>("/studio/trends");
}

export async function publishVideo(request: PublishRequest): Promise<PublishResult> {
  return fetchAPI<PublishResult>("/studio/publish", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getABTest(productId: string): Promise<ABTest> {
  return fetchAPI<ABTest>(`/studio/ab-test/${productId}`);
}

export async function getABResults(testId: string): Promise<ABTest> {
  return fetchAPI<ABTest>(`/studio/ab-results/${testId}`);
}

export async function getCustomerARCaptures(productId: string): Promise<CustomerARCapture[]> {
  return fetchAPI<CustomerARCapture[]>(`/studio/customer-ar/${productId}`);
}

export async function generateSocialProofVideo(productId: string): Promise<StudioJob> {
  return fetchAPI<StudioJob>(`/studio/social-proof/${productId}`, { method: "POST" });
}

export async function getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
  return fetchAPI<ScheduledPost[]>(`/studio/schedule/${userId}`);
}

// ── Dashboard / Analytics ──

export async function getDashboardAnalytics(): Promise<{
  totalScans: number;
  arScans: number;
  conversions: number;
  conversionRate: number;
  byDevice: { ios: number; android: number; desktop: number };
}> {
  return fetchAPI("/api/v1/analytics/dashboard");
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>(`/dashboard/stats/${userId}`);
}

export async function getScansByDay(userId: string, days = 30): Promise<ScansByDay[]> {
  return fetchAPI<ScansByDay[]>(`/analytics/scans-by-day/${userId}?days=${days}`);
}

export async function getDeviceSplit(userId: string): Promise<DeviceSplit[]> {
  return fetchAPI<DeviceSplit[]>(`/analytics/device-split/${userId}`);
}

export async function getCountryStats(userId: string): Promise<CountryStat[]> {
  return fetchAPI<CountryStat[]>(`/analytics/countries/${userId}`);
}

export async function getTopProducts(userId: string, limit = 10): Promise<ARModel[]> {
  return fetchAPI<ARModel[]>(`/analytics/top-products/${userId}?limit=${limit}`);
}

// ── Scans (public, no auth) ──

export async function trackScan(modelId: string, device: string, country: string): Promise<void> {
  await fetch(`${API_BASE}/scans/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId, device, country }),
  });
}

// ── Integrations ──

export async function getIntegrationsStatus(): Promise<IntegrationsStatus> {
  return fetchAPI<IntegrationsStatus>("/api/v1/integrations/status");
}

export async function connectShopify(data: ShopifyConnectRequest): Promise<{ status: string; shopName: string }> {
  return fetchAPI<{ status: string; shopName: string }>("/api/v1/integrations/shopify/connect", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function syncShopifyCatalog(): Promise<{ imported: number; productIds: string[] }> {
  return fetchAPI<{ imported: number; productIds: string[] }>("/api/v1/integrations/shopify/sync", {
    method: "POST",
  });
}

export async function connectWooCommerce(data: WooConnectRequest): Promise<{ status: string; url: string }> {
  return fetchAPI<{ status: string; url: string }>("/api/v1/integrations/woo/connect", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function syncWooCommerceCatalog(): Promise<{ imported: number; productIds: string[] }> {
  return fetchAPI<{ imported: number; productIds: string[] }>("/api/v1/integrations/woo/sync", {
    method: "POST",
  });
}

export async function connectTikTok(data: {
  accessToken: string;
  openId: string;
}): Promise<{ status: string; openId: string }> {
  return fetchAPI<{ status: string; openId: string }>("/api/v1/integrations/tiktok/connect", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function connectInstagram(data: {
  accessToken: string;
  userId: string;
}): Promise<{ status: string; username: string }> {
  return fetchAPI<{ status: string; username: string }>("/api/v1/integrations/instagram/connect", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Stripe ──

export async function createCheckoutSession(
  priceId: string,
  billingPeriod: "monthly" | "annual" = "monthly"
): Promise<{ url: string; session_id: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return fetchAPI<{ url: string; session_id: string }>("/api/v1/billing/create-checkout", {
    method: "POST",
    body: JSON.stringify({
      price_id: priceId,
      billing_period: billingPeriod,
      success_url: `${appUrl}/fr/dashboard/billing?success=1`,
      cancel_url: `${appUrl}/fr/pricing?canceled=1`,
    }),
  });
}

export async function getStripePortalUrl(_userId?: string): Promise<{ url: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return fetchAPI<{ url: string }>("/api/v1/billing/create-portal", {
    method: "POST",
    body: JSON.stringify({ return_url: `${appUrl}/fr/dashboard/billing` }),
  });
}

export async function getBillingPlans(): Promise<
  { id: string; name: string; price_monthly: number; price_annual: number; currency: string; stripe_monthly?: string; stripe_annual?: string; features: Record<string, unknown> }[]
> {
  return fetchAPI("/api/v1/billing/plans");
}

// ── Jobs (generic) ──

export async function getJobs(): Promise<{ id: string; status: string; type: string; createdAt: string }[]> {
  return fetchAPI("/api/v1/jobs");
}

export async function getJob(id: string): Promise<{ id: string; status: string; type: string; result: unknown; createdAt: string }> {
  return fetchAPI(`/api/v1/jobs/${id}`);
}

export async function uploadProduct(file: File): Promise<{ jobId: string; status: string }> {
  const token = await getIdToken();
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/api/v1/products/upload`, {
    method: "POST",
    headers: {
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur upload" }));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }
  return response.json();
}

export async function getARLink(jobId: string): Promise<{ arUrl: string; glbUrl: string | null; usdzUrl: string | null }> {
  return fetchAPI(`/api/v1/ar/${jobId}`);
}

// ── Viewer public (pas d'auth) ──

export async function getViewerData(modelId: string): Promise<{
  model_id: string;
  name: string;
  status: string;
  glb_url: string | null;
  usdz_url: string | null;
  thumbnail_url: string | null;
  branding: "watermark" | "badge" | "none";
  app_url: string;
  viewer_settings: { auto_rotate: boolean; ar: boolean; bg_color: string };
}> {
  const res = await fetch(`/api/v1/viewer/${modelId}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Modèle introuvable (${res.status})`);
  return res.json();
}

export async function trackAnalyticsEvent(
  modelId: string,
  event: "view" | "ar" | "embed" | "qr",
  referrer?: string
): Promise<void> {
  await fetch("/api/v1/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: modelId, event, referrer: referrer ?? "" }),
  }).catch(() => {});
}

export async function getModelAnalytics(
  modelId: string,
  days = 30
): Promise<{
  model_id: string;
  period_days: number;
  totals: { views: number; ar_views: number; embed_views: number; qr_scans: number };
  daily: { date: string; views: number; ar_views: number; embed_views: number; qr_scans: number }[];
  devices: { mobile: number; desktop: number };
  top_referrers: { domain: string; count: number }[];
}> {
  return fetchAPI(`/api/v1/analytics/${modelId}?days=${days}`);
}

// ── User / Plan ──

export async function getCurrentUser(): Promise<{
  uid: string;
  email: string;
  plan: string;
  usage: { products: number; generations: number; views: number; period: string };
  limits: { products: number; generations: number; views: number };
  role: string;
} | null> {
  try {
    return await fetchAPI("/api/v1/user/me");
  } catch {
    return null;
  }
}

// ── Style Match ──

export async function getStylePresets(): Promise<StylePreset[]> {
  return fetchAPI<StylePreset[]>("/style/presets");
}

export async function matchColor(imageBase64: string): Promise<ColorMatchResult> {
  return fetchAPI<ColorMatchResult>("/style/match-color", {
    method: "POST",
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
}

export async function transferMaterial(
  imageBase64: string,
  productId: string
): Promise<MaterialTransferResult> {
  return fetchAPI<MaterialTransferResult>("/style/transfer-material", {
    method: "POST",
    body: JSON.stringify({ image_base64: imageBase64, product_id: productId }),
  });
}

// ── Admin cockpit ──

export async function getAdminStats(): Promise<AdminStats> {
  return fetchAPI<AdminStats>("/api/v1/admin/stats");
}

// ── Prospection (admin) ──

export async function listProspects(params?: {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): Promise<Prospect[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.source) q.set("source", params.source);
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  if (params?.offset !== undefined) q.set("offset", String(params.offset));
  const qs = q.toString();
  return fetchAPI<Prospect[]>(`/api/v1/admin/prospects${qs ? `?${qs}` : ""}`);
}

export async function createProspect(data: {
  company_name: string;
  website: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  notes?: string;
}): Promise<Prospect> {
  return fetchAPI<Prospect>("/api/v1/admin/prospects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProspectStats(): Promise<ProspectStats> {
  return fetchAPI<ProspectStats>("/api/v1/admin/prospects/stats");
}

export async function updateProspect(
  id: string,
  data: { status?: string; notes?: string; tags?: string[]; email?: string }
): Promise<Prospect> {
  return fetchAPI<Prospect>(`/api/v1/admin/prospects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProspect(id: string): Promise<void> {
  await fetchAPI(`/api/v1/admin/prospects/${id}`, { method: "DELETE" });
}

export async function generateProspectDemo(id: string): Promise<{
  status: string;
  images_count: number;
  message: string;
}> {
  return fetchAPI(`/api/v1/admin/prospects/${id}/generate-demo`, {
    method: "POST",
  });
}

export async function sendProspectEmail(
  id: string,
  data?: { subject?: string; message_override?: string }
): Promise<{ status: string; email: string; subject: string }> {
  return fetchAPI(`/api/v1/admin/prospects/${id}/send-email`, {
    method: "POST",
    body: JSON.stringify(data ?? {}),
  });
}

export async function runScraper(
  limit = 200,
  platforms = "shopify,woocommerce,prestashop"
): Promise<{ status: string; run_id: string; config: { limit: number; platforms: string[] } }> {
  return fetchAPI(
    `/api/v1/admin/scraper/run?limit=${limit}&platforms=${encodeURIComponent(platforms)}`,
    { method: "POST" }
  );
}

export async function getScraperStatus(): Promise<ScraperRun> {
  return fetchAPI<ScraperRun>("/api/v1/admin/scraper/status");
}
