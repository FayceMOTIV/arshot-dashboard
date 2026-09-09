import { getIdToken } from "@/lib/firebase";
import type {
  ARModel,
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
} from "@/types";

// API calls go through Next.js rewrites (same origin) — no CORS issues
const API_BASE = "";

/** Single source of truth for public-facing domains. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ar.arshot.fr";

export function getArLink(shortId: string): string {
  const base =
    typeof window !== "undefined" ? window.location.origin : APP_URL;
  return `${base}/ar/${shortId}`;
}

/** Demo mode is opt-in only — mocks never leak into production. */
export const IS_DEMO = process.env.NEXT_PUBLIC_ARSHOT_DEMO === "true";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Never leak backend error detail to the user — generic FR messages. */
function friendlyError(status: number): string {
  if (status === 401) return "Session expirée — reconnectez-vous.";
  if (status === 403) return "Accès refusé.";
  if (status === 404) return "Ressource introuvable.";
  if (status === 409) return "Cette ressource existe déjà.";
  if (status === 413) return "Fichier trop volumineux.";
  if (status === 429) return "Trop de requêtes — réessayez dans un instant.";
  if (status >= 500) return "Service temporairement indisponible — réessayez dans un instant.";
  return "Une erreur est survenue — réessayez.";
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });
  } catch (err) {
    console.error(`[api] network error ${options?.method || "GET"} ${path}`, err);
    throw new Error("Connexion impossible — vérifiez votre réseau.");
  }

  if (!response.ok) {
    const detail = await response
      .json()
      .then((b) => b?.detail)
      .catch(() => null);
    console.error(`[api] ${response.status} ${options?.method || "GET"} ${path}`, detail);
    throw new Error(friendlyError(response.status));
  }

  return response.json();
}

/**
 * Fetch with demo fallback — READ operations only.
 * The fallback is returned ONLY when NEXT_PUBLIC_ARSHOT_DEMO=true.
 */
async function fetchWithFallback<T>(
  path: string,
  fallback: T,
  options?: RequestInit,
): Promise<T> {
  try {
    return await fetchAPI<T>(path, options);
  } catch (err) {
    if (IS_DEMO) {
      console.debug(`[DEMO] ${options?.method || "GET"} ${path}`);
      return fallback;
    }
    throw err;
  }
}

// ── Backend → Dashboard type mapper ──

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

// ── Demo / Mock data (NEXT_PUBLIC_ARSHOT_DEMO=true only) ──

const DEMO_PRODUCTS: ARModel[] = [
  {
    id: "demo-shoe-001",
    userId: "demo",
    name: "Sneaker Nike Air",
    status: "ready",
    pipeline: "object_capture",
    shortId: "SHOE0001",
    modelUrl: null,
    thumbnailUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    usdzUrl: null,
    glbUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
    qualityScore: 92,
    scanCount: 847,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-01T14:30:00Z",
  },
  {
    id: "demo-chair-002",
    userId: "demo",
    name: "Chaise Design Scandinave",
    status: "ready",
    pipeline: "flash_vdm",
    shortId: "CHAIR002",
    modelUrl: null,
    thumbnailUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop",
    usdzUrl: null,
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
    qualityScore: 78,
    scanCount: 312,
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-02-28T16:00:00Z",
  },
  {
    id: "demo-helmet-003",
    userId: "demo",
    name: "Casque Aviateur Vintage",
    status: "ready",
    pipeline: "object_capture",
    shortId: "HELM0003",
    modelUrl: null,
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    usdzUrl: null,
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    qualityScore: 85,
    scanCount: 156,
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
  },
  {
    id: "demo-astro-004",
    userId: "demo",
    name: "Figurine Astronaute",
    status: "ready",
    pipeline: "object_capture",
    shortId: "ASTR0004",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    qualityScore: 95,
    scanCount: 2340,
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-03-06T12:00:00Z",
  },
];

const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalProducts: 4,
  scansThisMonth: 1247,
  currentPlan: "pro",
  arScore: 78,
  arScoreSuggestions: [
    "Ajoutez 5 produits pour +20 points",
    "Activez l'embed Shopify pour +15 points",
  ],
};

const MOCK_SCANS_BY_DAY: ScansByDay[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
  count: Math.floor(Math.random() * 80) + 10,
}));

const MOCK_DEVICE_SPLIT: DeviceSplit[] = [
  { device: "ios", count: 523, percentage: 52 },
  { device: "android", count: 312, percentage: 31 },
  { device: "desktop", count: 172, percentage: 17 },
];

const MOCK_COUNTRY_STATS: CountryStat[] = [
  { country: "France", countryCode: "FR", count: 487 },
  { country: "United States", countryCode: "US", count: 234 },
  { country: "Germany", countryCode: "DE", count: 156 },
  { country: "Spain", countryCode: "ES", count: 98 },
  { country: "United Kingdom", countryCode: "GB", count: 72 },
];

const MOCK_TREND: TrendData = {
  recommendedTemplate: "quiet_luxury",
  trendName: "Quiet Luxury",
  trendScore: 92,
};

function getDemoProduct(productId: string): ARModel | undefined {
  return DEMO_PRODUCTS.find((p) => p.id === productId || p.shortId === productId);
}

// ── Products (v4 endpoints) ──

export async function getProducts(): Promise<ARModel[]> {
  try {
    const raw = await fetchAPI<Record<string, unknown>[]>("/api/v1/products/");
    return raw.map(mapBackendProduct);
  } catch (err) {
    if (IS_DEMO) return DEMO_PRODUCTS;
    throw err;
  }
}

export async function getProductStatus(productId: string): Promise<ARModel> {
  try {
    const raw = await fetchAPI<Record<string, unknown>>(`/api/v1/products/${productId}`);
    return mapBackendProduct(raw);
  } catch (err) {
    if (IS_DEMO) {
      const demo = getDemoProduct(productId);
      if (demo) return demo;
    }
    throw err;
  }
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/products/${productId}/capture`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch (err) {
    console.error(`[api] upload capture ${productId}`, err);
    throw new Error("Connexion impossible — vérifiez votre réseau.");
  }

  if (!response.ok) {
    console.error(`[api] ${response.status} capture ${productId}`);
    throw new Error(friendlyError(response.status));
  }

  return response.json();
}

// ── Generation jobs ──

export interface GenerationJob {
  id: string;
  productId?: string;
  status: "queued" | "processing" | "done" | "failed" | string;
  stage?: string | null;
  progress?: number | null;
  error?: string | null;
}

export async function getJobs(): Promise<GenerationJob[]> {
  return fetchAPI<GenerationJob[]>("/api/v1/jobs");
}

export async function getJob(jobId: string): Promise<GenerationJob> {
  return fetchAPI<GenerationJob>(`/api/v1/jobs/${jobId}`);
}

// ── Marketplace exports ──

export interface AmazonExportResult {
  url: string | null;
  warnings: string[];
}

export async function exportAmazon(productId: string): Promise<AmazonExportResult> {
  const raw = await fetchAPI<Record<string, unknown>>(
    `/api/v1/products/${productId}/export/amazon`
  );
  const url =
    (raw.url as string) ||
    (raw.downloadUrl as string) ||
    (raw.fileUrl as string) ||
    null;
  const warnings = Array.isArray(raw.warnings)
    ? (raw.warnings as unknown[]).map(String)
    : [];
  return { url, warnings };
}

// ── Legacy endpoints (backward compat) ──

export async function getUserModels(userId: string): Promise<ARModel[]> {
  return fetchWithFallback(`/models/user/${userId}`, DEMO_PRODUCTS);
}

export async function getModel(id: string): Promise<ARModel> {
  const demo = getDemoProduct(id);
  return fetchWithFallback(`/models/${id}`, demo || DEMO_PRODUCTS[0]);
}

export async function generateModel(formData: FormData): Promise<ARModel> {
  const token = await getIdToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/models/generate`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch (err) {
    console.error("[api] models/generate network error", err);
    throw new Error("Connexion impossible — vérifiez votre réseau.");
  }

  if (!response.ok) {
    console.error(`[api] ${response.status} models/generate`);
    throw new Error(friendlyError(response.status));
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
  return fetchWithFallback(`/api/v1/breakout/product/${productId}`, []);
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

// Mock job timestamps — demo mode only
const mockJobTimestamps: Record<string, number> = {};

function getMockJobProgress(jobId: string): StudioJob {
  if (!mockJobTimestamps[jobId]) {
    mockJobTimestamps[jobId] = Date.now();
  }
  const elapsed = (Date.now() - mockJobTimestamps[jobId]) / 1000;

  if (elapsed > 15) {
    return {
      id: jobId,
      productId: "",
      template: "quiet_luxury",
      status: "done",
      videoUrl: "https://assets.mixkit.co/videos/4880/4880-720.mp4",
      thumbnailUrl: null,
      progress: 100,
      createdAt: new Date(mockJobTimestamps[jobId]).toISOString(),
      completedAt: new Date().toISOString(),
    };
  }
  const progress = elapsed > 10 ? 90 : elapsed > 5 ? 60 : 20;
  return {
    id: jobId, productId: "", template: "quiet_luxury",
    status: "processing", videoUrl: null, thumbnailUrl: null,
    progress, createdAt: new Date(mockJobTimestamps[jobId]).toISOString(), completedAt: null,
  };
}

export async function getStudioJob(jobId: string): Promise<StudioJob> {
  if (IS_DEMO && jobId.startsWith("mock-")) {
    return getMockJobProgress(jobId);
  }
  return fetchAPI<StudioJob>(`/studio/job/${jobId}`);
}

export async function getStudioTrends(): Promise<TrendData> {
  return fetchWithFallback("/studio/trends", MOCK_TREND);
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
  return fetchWithFallback<CustomerARCapture[]>(`/studio/customer-ar/${productId}`, []);
}

export async function generateSocialProofVideo(productId: string): Promise<StudioJob> {
  return fetchAPI<StudioJob>(`/studio/social-proof/${productId}`, { method: "POST" });
}

export async function getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
  return fetchWithFallback<ScheduledPost[]>(`/studio/schedule/${userId}`, []);
}

// ── Dashboard / Analytics ──

export async function getDashboardAnalytics(): Promise<{
  totalScans: number;
  arScans: number;
  conversions: number;
  conversionRate: number;
  byDevice: { ios: number; android: number; desktop: number };
}> {
  return fetchWithFallback("/api/v1/analytics/dashboard", {
    totalScans: 1007,
    arScans: 743,
    conversions: 89,
    conversionRate: 8.8,
    byDevice: { ios: 523, android: 312, desktop: 172 },
  });
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  return fetchWithFallback(`/dashboard/stats/${userId}`, MOCK_DASHBOARD_STATS);
}

export async function getScansByDay(userId: string, days = 30): Promise<ScansByDay[]> {
  return fetchWithFallback(`/analytics/scans-by-day/${userId}?days=${days}`, MOCK_SCANS_BY_DAY);
}

export async function getDeviceSplit(userId: string): Promise<DeviceSplit[]> {
  return fetchWithFallback(`/analytics/device-split/${userId}`, MOCK_DEVICE_SPLIT);
}

export async function getCountryStats(userId: string): Promise<CountryStat[]> {
  return fetchWithFallback(`/analytics/countries/${userId}`, MOCK_COUNTRY_STATS);
}

export async function getTopProducts(userId: string, limit = 10): Promise<ARModel[]> {
  return fetchWithFallback(
    `/analytics/top-products/${userId}?limit=${limit}`,
    DEMO_PRODUCTS.slice(0, limit),
  );
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
  return fetchWithFallback("/api/v1/integrations/status", {
    shopify: false,
    woocommerce: false,
    tiktok: false,
    instagram: false,
  });
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

export async function getStripePortalUrl(userId: string): Promise<{ url: string }> {
  return fetchAPI<{ url: string }>(`/billing/portal/${userId}`, { method: "POST" });
}

// ── Style Match ──

export async function getStylePresets(): Promise<StylePreset[]> {
  return fetchWithFallback<StylePreset[]>("/style/presets", [
    { id: "scandinavian", label: "Scandinave", icon: "mountain", baseColor: "#E8DCC8", metalness: 0.1, roughness: 0.8 },
    { id: "industrial", label: "Industriel", icon: "settings", baseColor: "#4A4A4A", metalness: 0.7, roughness: 0.3 },
    { id: "luxury", label: "Luxe", icon: "crown", baseColor: "#C9A96E", metalness: 0.5, roughness: 0.2 },
    { id: "bohemian", label: "Bohème", icon: "leaf", baseColor: "#8B6F47", metalness: 0.1, roughness: 0.9 },
  ]);
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
