import type { Metadata } from "next";
import { ARViewerClient } from "./ar-viewer-client";

interface ARPageProps {
  params: Promise<{ shortId: string }>;
}

export async function generateMetadata({ params }: ARPageProps): Promise<Metadata> {
  const { shortId } = await params;
  return {
    title: "ARShot — Voir en AR",
    description: "Visualisez ce produit en réalité augmentée",
    openGraph: {
      title: "Voir ce produit en AR",
      description: "Visualisez ce produit dans votre espace avec ARShot",
      url: `https://ar.arshot.fr/p/${shortId}`,
    },
  };
}

export default async function ARViewerPage({ params }: ARPageProps) {
  const { shortId } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.arshot.fr";

  // Validate shortId: only alphanumeric characters allowed
  if (!/^[a-zA-Z0-9]+$/.test(shortId)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <p>Lien invalide</p>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#FAFAFA",
        color: "#0A0A0A",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* model-viewer script */}
      <script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        async
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <ARViewerClient shortId={shortId} apiUrl={apiUrl} />
      </div>

      <div style={{ textAlign: "center", padding: 16, color: "#9CA3AF", fontSize: 12 }}>
        Propulsé par <a href="https://arshot.fr" style={{ color: "#0066FF", textDecoration: "none" }}>ARShot</a>
      </div>
    </div>
  );
}
