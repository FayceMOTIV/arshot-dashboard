import { redirect } from "next/navigation";
import type { Metadata } from "next";

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

// Demo products for testing when backend is unavailable
const DEMO_AR_PRODUCTS: Record<string, ProductData> = {
  "SHOE0001": {
    id: "demo-shoe-001",
    name: "Sneaker Nike Air",
    glbUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "demo-shoe-001": {
    id: "demo-shoe-001",
    name: "Sneaker Nike Air",
    glbUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "CHAIR002": {
    id: "demo-chair-002",
    name: "Chaise Design Scandinave",
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "demo-chair-002": {
    id: "demo-chair-002",
    name: "Chaise Design Scandinave",
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "HELM0003": {
    id: "demo-helmet-003",
    name: "Casque Aviateur Vintage",
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "demo-helmet-003": {
    id: "demo-helmet-003",
    name: "Casque Aviateur Vintage",
    glbUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "ASTR0004": {
    id: "demo-astro-004",
    name: "Figurine Astronaute",
    glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
  "demo-astro-004": {
    id: "demo-astro-004",
    name: "Figurine Astronaute",
    glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    usdzUrl: null,
    thumbnailUrl: null,
  },
};

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
  if (productId) {
    try {
      const resp = await fetch(`${apiUrl}/api/v1/ar/${productId}/data`, {
        cache: "no-store",
      });
      if (resp.ok) return await resp.json();
    } catch {
      // fall through to demo
    }
  }

  // Fallback: demo products — demo mode only (NEXT_PUBLIC_ARSHOT_DEMO=true)
  if (process.env.NEXT_PUBLIC_ARSHOT_DEMO === "true") {
    return DEMO_AR_PRODUCTS[shortId] || null;
  }
  return null;
}

export async function generateMetadata({ params }: ARPageProps): Promise<Metadata> {
  const { shortId } = await params;
  const product = await fetchProductData(shortId);

  if (!product) {
    return { title: "ARShot — Produit non trouvé" };
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.thumbnailUrl ? { image: product.thumbnailUrl } : {}),
    subjectOf: {
      "@type": "3DModel",
      encoding: [
        ...(product.glbUrl
          ? [
              {
                "@type": "MediaObject",
                contentUrl: product.glbUrl,
                encodingFormat: "model/gltf-binary",
              },
            ]
          : []),
        ...(product.usdzUrl
          ? [
              {
                "@type": "MediaObject",
                contentUrl: product.usdzUrl,
                encodingFormat: "model/vnd.usdz+zip",
              },
            ]
          : []),
      ],
    },
  };

  return {
    title: `${product.name} — Voir en AR | ARShot`,
    description: `Visualisez ${product.name} en réalité augmentée directement dans votre espace. Aucune application requise.`,
    openGraph: {
      title: `${product.name} — AR`,
      description: `Voir ${product.name} en réalité augmentée`,
      ...(product.thumbnailUrl ? { images: [product.thumbnailUrl] } : {}),
    },
    other: {
      "script:ld+json": JSON.stringify(jsonLd),
    },
  };
}

function ArErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "radial-gradient(ellipse at top, #141428 0%, #07070d 60%)",
        color: "#e7e7ef",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            display: "inline-flex",
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          A
        </span>
        <span style={{ fontSize: 20, fontWeight: 700 }}>ARShot</span>
      </div>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{message}</p>
      <p style={{ margin: 0, fontSize: 14, color: "#9a9ab0" }}>
        Vérifiez le lien ou scannez à nouveau le QR code.
      </p>
      <a
        href="https://arshot.fr"
        style={{
          marginTop: 8,
          padding: "12px 24px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Découvrir ARShot
      </a>
    </div>
  );
}

export default async function ARViewerPage({ params }: ARPageProps) {
  const { shortId } = await params;

  if (!/^[a-zA-Z0-9-]+$/.test(shortId)) {
    return <ArErrorState message="Lien invalide" />;
  }

  const product = await fetchProductData(shortId);

  if (!product || !product.glbUrl) {
    return <ArErrorState message="Produit non trouvé" />;
  }

  // All devices → ar.html (model-viewer handles AR Quick Look on iOS natively via ios-src)
  const qs = new URLSearchParams({
    glb: product.glbUrl,
    name: product.name,
    id: shortId,
    ...(product.usdzUrl ? { usdz: product.usdzUrl } : {}),
  });

  redirect(`/ar.html?${qs.toString()}`);
}
