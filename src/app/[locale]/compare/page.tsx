"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getProductStatus } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Scale, Star, Eye } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ARModel } from "@/types";

const DEMO_PRODUCTS: ARModel[] = [
  {
    id: "1",
    userId: "u1",
    name: "Lampe scandinave",
    status: "ready",
    pipeline: "object_capture",
    shortId: "aaa",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    qualityScore: 88,
    scanCount: 342,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    userId: "u1",
    name: "Chaise design Oslo",
    status: "ready",
    pipeline: "flash_vdm",
    shortId: "bbb",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    qualityScore: 76,
    scanCount: 198,
    createdAt: "",
    updatedAt: "",
  },
];

function ModelViewerBasic({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    const viewer = document.createElement("model-viewer") as HTMLElement;
    viewer.setAttribute("src", src);
    viewer.setAttribute("alt", alt);
    viewer.setAttribute("style", "width:100%;height:100%");
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("shadow-intensity", "1");
    viewer.setAttribute("environment-image", "neutral");
    viewer.setAttribute("interaction-prompt", "none");

    container.appendChild(viewer);
    return () => {
      if (container.contains(viewer)) container.removeChild(viewer);
    };
  }, [src, alt]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function getScoreColor(score: number | null): string {
  if (!score) return "bg-gray-100 text-gray-700";
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function ComparePageInner() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").filter(Boolean).slice(0, 3);

  useEffect(() => {
    async function load() {
      if (ids.length === 0) {
        setProducts(DEMO_PRODUCTS);
        setLoading(false);
        return;
      }
      if (!user) return;
      try {
        const results = await Promise.all(
          ids.map((id) => getProductStatus(id).catch(() => null))
        );
        setProducts(results.filter((r): r is ARModel => r !== null));
      } catch {
        setProducts(DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, idsParam]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)] flex items-center gap-2">
                <Scale className="h-6 w-6 text-[#0066FF]" />
                Comparateur 3D
              </h1>
              <p className="text-sm text-muted-foreground">
                {products.length} produit{products.length > 1 ? "s" : ""} en
                comparaison
              </p>
            </div>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Tous les produits
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16">
              <Scale className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun produit à comparer</p>
              <p className="text-xs text-muted-foreground">
                Ajoutez des IDs dans l&apos;URL : /compare?ids=id1,id2
              </p>
              <Link href="/products">
                <Button className="bg-[#0066FF] hover:bg-[#0052CC] text-white gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux produits
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 3D Viewers grid */}
            <div
              className={`grid gap-4 ${
                products.length === 2 ? "grid-cols-2" : "grid-cols-3"
              }`}
            >
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">
                        {product.name}
                      </span>
                      <Badge className={getScoreColor(product.qualityScore)}>
                        <Star className="h-3 w-3 mr-1" />
                        {product.qualityScore ?? "—"}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted">
                      {product.glbUrl ? (
                        <ModelViewerBasic
                          src={product.glbUrl}
                          alt={product.name}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          Modèle non disponible
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-[family-name:var(--font-geist)]">
                  Comparaison détaillée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 pr-4 text-left text-muted-foreground font-medium">
                          Critère
                        </th>
                        {products.map((p) => (
                          <th
                            key={p.id}
                            className="py-2 px-4 text-left font-medium"
                          >
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          AR Score
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="py-2.5 px-4">
                            <Badge className={getScoreColor(p.qualityScore)}>
                              {p.qualityScore ?? "—"}/100
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          Scans totaux
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="py-2.5 px-4 font-medium">
                            {p.scanCount}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          Pipeline
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="py-2.5 px-4 capitalize">
                            {p.pipeline.replace("_", " ")}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          Format GLB
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="py-2.5 px-4">
                            <Badge variant="outline">
                              {p.glbUrl ? "✅ Disponible" : "❌ Absent"}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          Format USDZ
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="py-2.5 px-4">
                            <Badge variant="outline">
                              {p.usdzUrl ? "✅ Disponible" : "❌ Absent"}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          Actions
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="py-2.5 px-4">
                            <Link href={`/products/${p.id}`}>
                              <Button size="sm" variant="outline">
                                Voir
                              </Button>
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        </AppShell>
      }
    >
      <ComparePageInner />
    </Suspense>
  );
}
