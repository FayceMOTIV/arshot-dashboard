"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Eye, ScanLine, Trash2, Copy, Check, Download, Clapperboard, ExternalLink } from "lucide-react";
import ModelViewerElement from "./model-viewer-element";
import type { ARModel, ModelStatus } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  model: ARModel;
  onDelete?: (id: string) => void;
}

const STATUS_COLORS: Record<ModelStatus, string> = {
  ready: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  processing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function ProductCard({ model, onDelete }: ProductCardProps) {
  const t = useTranslations("products");
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ar.arshot.fr";
  const arUrl = `${appUrl}/v/${model.id}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(arUrl);
      setCopied(true);
      toast.success("Lien AR copié");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  }, [arUrl]);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* Thumbnail / 3D preview */}
      <div className="relative aspect-square bg-muted">
        {model.status === "ready" && model.glbUrl ? (
          <ModelViewerElement src={model.glbUrl} alt={model.name} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              {model.status === "processing" && (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0066FF] border-t-transparent mx-auto mb-2" />
              )}
              <p className="text-sm">{t(model.status)}</p>
            </div>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge className={STATUS_COLORS[model.status]}>{t(model.status)}</Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Name + date */}
        <div>
          <h3 className="font-medium truncate font-[family-name:var(--font-geist)]">{model.name}</h3>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ScanLine className="h-3 w-3" />
              {model.scanCount} {t("scans")}
            </span>
            <span>{fmt(model.createdAt)}</span>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex gap-2">
          <Link href={`/products/${model.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {t("viewProduct")}
            </Button>
          </Link>
          {model.status === "ready" && (
            <a href={arUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 px-2.5">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>

        {/* Quick action icon row */}
        {model.status === "ready" && (
          <div className="flex items-center gap-1 border-t border-border pt-2">
            {/* Copy AR link */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={copyLink}
              title="Copier le lien AR"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>

            {/* Download GLB */}
            {model.glbUrl && (
              <a href={model.glbUrl} download={`${model.name}.glb`} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Télécharger GLB"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}

            {/* Studio */}
            <Link href={`/studio/${model.id}`} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Créer une vidéo"
              >
                <Clapperboard className="h-3.5 w-3.5" />
              </Button>
            </Link>

            {/* Delete */}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(model.id)}
                title="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Delete pour modèles non-ready */}
        {model.status !== "ready" && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(model.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Supprimer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
