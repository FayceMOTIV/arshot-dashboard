"use client";

import { useEffect, useState } from "react";
import { getProductBreakouts } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clapperboard, Loader2, Play, TrendingUp } from "lucide-react";
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
}

export function BreakoutVideosSection({ productId, productName: _ }: { productId: string; productName?: string }) {
  const [breakouts, setBreakouts] = useState<Breakout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductBreakouts(productId)
      .then(setBreakouts)
      .catch(() => setBreakouts([]))
      .finally(() => setLoading(false));
  }, [productId]);

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
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune vidéo générée pour ce produit.
          </p>
        ) : (
          <div className="space-y-3">
            {breakouts.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                {b.thumbnailUrl ? (
                  <img
                    src={b.thumbnailUrl}
                    alt={b.template}
                    className="h-12 w-20 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-20 rounded bg-muted flex items-center justify-center">
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium capitalize">{b.template.replace(/_/g, " ")}</span>
                    {b.trending && (
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.views.toLocaleString()} vues · {b.engagement}% engagement
                  </p>
                </div>
                <Badge
                  variant={b.status === "done" ? "default" : "secondary"}
                  className="text-xs shrink-0"
                >
                  {b.status === "done" ? "Prête" : b.status === "processing" ? "En cours" : b.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
