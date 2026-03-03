import { getIdToken } from "@/lib/firebase";
import type { ARModel, DashboardStats, ScansByDay, DeviceSplit, CountryStat, APIResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.arshot.fr";

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  return {
    "Content-Type": "application/json",
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

// Models
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

// Dashboard
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>(`/dashboard/stats/${userId}`);
}

export async function getScansByDay(userId: string, days = 30): Promise<ScansByDay[]> {
  return fetchAPI<ScansByDay[]>(`/analytics/scans-by-day/${userId}?days=${days}`);
}

// Analytics
export async function getDeviceSplit(userId: string): Promise<DeviceSplit[]> {
  return fetchAPI<DeviceSplit[]>(`/analytics/device-split/${userId}`);
}

export async function getCountryStats(userId: string): Promise<CountryStat[]> {
  return fetchAPI<CountryStat[]>(`/analytics/countries/${userId}`);
}

export async function getTopProducts(userId: string, limit = 10): Promise<ARModel[]> {
  return fetchAPI<ARModel[]>(`/analytics/top-products/${userId}?limit=${limit}`);
}

// Scans (public, no auth)
export async function trackScan(modelId: string, device: string, country: string): Promise<void> {
  await fetch(`${API_BASE}/scans/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelId, device, country }),
  });
}

// Stripe
export async function getStripePortalUrl(userId: string): Promise<{ url: string }> {
  return fetchAPI<{ url: string }>(`/billing/portal/${userId}`, { method: "POST" });
}
