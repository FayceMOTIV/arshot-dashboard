import type { Metadata } from "next";
import { ViewerClient } from "./viewer-client";

interface Props {
  params: Promise<{ id: string }>;
}

interface ViewerData {
  model_id: string;
  name: string;
  status: string;
  glb_url: string | null;
  usdz_url: string | null;
  thumbnail_url: string | null;
  branding: "watermark" | "badge" | "none";
  app_url: string;
  viewer_settings: { auto_rotate: boolean; ar: boolean; bg_color: string };
}

async function fetchViewerData(id: string): Promise<ViewerData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.arshot.fr";
  try {
    const res = await fetch(`${apiUrl}/api/v1/viewer/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchViewerData(id);
  const title = data?.name ? `${data.name} — Vue en 3D & AR` : "Produit en Réalité Augmentée";
  const image = data?.thumbnail_url ?? undefined;

  return {
    title,
    description: "Visualisez ce produit en 3D et en Réalité Augmentée directement depuis votre navigateur — sans application.",
    openGraph: {
      title,
      description: "Expérience AR immersive — aucune app requise",
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: image ? [image] : [],
    },
  };
}

export default async function ViewerPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchViewerData(id);

  if (!data || data.status !== "ready" || !data.glb_url) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-lg font-medium mb-2">Produit non disponible</p>
          <p className="text-sm">Ce lien est invalide ou le modèle n&apos;est pas encore prêt.</p>
        </div>
      </div>
    );
  }

  return <ViewerClient data={data} modelId={id} />;
}
