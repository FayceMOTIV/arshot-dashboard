import { redirect } from "next/navigation";
import { headers } from "next/headers";

interface ARPageProps {
  params: Promise<{ shortId: string }>;
}

interface ProductData {
  id: string;
  name: string;
  glbUrl: string | null;
  usdzUrl: string | null;
  thumbnailUrl: string | null;
}

function detectDevice(userAgent: string): "ios" | "android" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("android")) return "android";
  return "desktop";
}

async function resolveProductId(shortId: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.arshot.fr";
  try {
    const resp = await fetch(`${apiUrl}/api/v1/qr/${shortId}`, {
      redirect: "manual",
    });
    const location = resp.headers.get("location");
    if (!location) return null;
    // Extract product ID from redirect URL (last path segment)
    const segments = location.replace(/\/$/, "").split("/");
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}

async function fetchProductData(shortId: string): Promise<ProductData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.arshot.fr";

  // Try direct call first (shortId might be a product ID)
  try {
    const resp = await fetch(`${apiUrl}/api/v1/ar/${shortId}/data`, {
      cache: "no-store",
    });
    if (resp.ok) return await resp.json();
  } catch {
    // continue to QR resolution
  }

  // Resolve shortId → productId via QR endpoint
  const productId = await resolveProductId(shortId);
  if (!productId) return null;

  try {
    const resp = await fetch(`${apiUrl}/api/v1/ar/${productId}/data`, {
      cache: "no-store",
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export default async function ARViewerPage({ params }: ARPageProps) {
  const { shortId } = await params;

  if (!/^[a-zA-Z0-9-]+$/.test(shortId)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <p>Lien invalide</p>
      </div>
    );
  }

  const DEMO_GLB = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  const DEMO_NAME = "Astronaute — Démo ARShot";

  let product = await fetchProductData(shortId);

  // Fallback démo quand le backend est injoignable (Vercel sans backend)
  if (!product || !product.glbUrl) {
    product = { id: shortId, name: DEMO_NAME, glbUrl: DEMO_GLB, usdzUrl: null, thumbnailUrl: null };
  }

  // Smart redirect: iOS → USDZ direct (AR Quick Look instant), others → ar.html
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const device = detectDevice(userAgent);

  if (device === "ios" && product.usdzUrl) {
    redirect(product.usdzUrl);
  }

  // Android / Desktop → static AR page with model-viewer
  const qs = new URLSearchParams({
    glb: product.glbUrl ?? "",
    name: product.name,
    ...(product.usdzUrl ? { usdz: product.usdzUrl } : {}),
  });

  redirect(`/ar.html?${qs.toString()}`);
}
