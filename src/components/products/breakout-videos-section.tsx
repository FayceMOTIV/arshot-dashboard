"use client";

import { useEffect, useState } from "react";
import { getProductBreakouts } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clapperboard, Loader2, Play, TrendingUp, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface Breakout {
  id: string;
  template: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  views: number;
  engagement: number;
  trending: boolean;
  createdAt: string;
  isLocal?: boolean; // généré côté client (sessionStorage)
}

export function BreakoutVideosSection({ productId, productName: _ }: { productId: string; productName?: string }) {
  const [breakouts, setBreakouts] = useState<Breakout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vidéos locales (sessionStorage — générées dans la session courante)
    let localBreakouts: Breakout[] = [];
    try {
      const key = `arshot_studio_${productId}`;
      const stored = JSON.parse(sessionStorage.getItem(key) || "[]") as Array<{
        id: string;
        template: string;
        blobUrl: string;
        createdAt: string;
      }>;
      localBreakouts = stored.map((s) => ({
        id: s.id,
        template: s.template,
        status: "done",
        videoUrl: s.blobUrl,
        thumbnailUrl: null,
        views: 0,
        engagement: 0,
        trending: false,
        createdAt: s.createdAt,
        isLocal: true,
      }));
    } catch {}

    // Vidéos backend
    getProductBreakouts(productId)
      .then((remote) => setBreakouts([...localBreakouts, ...remote]))
      .catch(() => setBreakouts(localBreakouts))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleDownload = (blobUrl: string, template: string) => {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `arshot-${template}-${Date.now()}.webm`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Clapperboard className="h-4 w-4 text-[#0066FF]" />
          Vidéos Studio
        </CardTitle>
        <Link href={`/studio/${productId}`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Créer une vidéo
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {breakouts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune vidéo générée pour ce produit.
            </p>
            <Link href={`/studio/${productId}`}>
              <Button size="sm" className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                <Clapperboard className="h-3.5 w-3.5" />
                Générer ma première vidéo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {breakouts.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                {/* Thumbnail / placeholder */}
                {b.videoUrl && b.isLocal ? (
                  <video
                    src={b.videoUrl}
                    muted
                    playsInline
                    className="h-12 w-20 rounded object-cover bg-muted shrink-0"
                  />
                ) : b.thumbnailUrl ? (
                  <img
                    src={b.thumbnailUrl}
                    alt={b.template}
                    className="h-12 w-20 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-12 w-20 rounded bg-muted flex items-center justify-center shrink-0">
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium capitalize">
                      {b.template.replace(/_/g, " ")}
                    </span>
                    {b.isLocal && (
                      <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                        Local
                      </Badge>
                    )}
                    {b.trending && !b.isLocal && (
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  {!b.isLocal && (
                    <p className="text-xs text-muted-foreground">
                      {b.views.toLocaleString()} vues · {b.engagement}% engagement
                    </p>
                  )}
                  {b.isLocal && (
                    <p className="text-xs text-muted-foreground">
                      Généré en local · valide dans cet onglet
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {b.isLocal && b.videoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleDownload(b.videoUrl!, b.template)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      MP4
                    </Button>
                  )}
                  <Badge
                    variant={b.status === "done" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {b.status === "done" ? "Prête" : b.status === "processing" ? "En cours" : b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
