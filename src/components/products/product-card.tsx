"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ScanLine, Trash2 } from "lucide-react";
import ModelViewerElement from "./model-viewer-element";
import type { ARModel, ModelStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  model: ARModel;
  onDelete?: (id: string) => void;
}

const STATUS_TONES: Record<ModelStatus, string> = {
  ready: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  processing: "border-amber-500/40 bg-amber-500/10 text-amber-500",
  pending: "border-border bg-muted/60 text-muted-foreground",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function ProductCard({ model, onDelete }: ProductCardProps) {
  const t = useTranslations("products");

  return (
    <Link href={`/products/${model.id}`} className="block">
      <div className="glass hover-lift group overflow-hidden rounded-2xl">
        <div className="relative aspect-square overflow-hidden bg-muted/40">
          {model.status === "ready" && model.glbUrl ? (
            <ModelViewerElement src={model.glbUrl} alt={model.name} />
          ) : model.thumbnailUrl ? (
            <img
              src={model.thumbnailUrl}
              alt={model.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                {model.status === "processing" && (
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                <p className="text-sm">{t(model.status)}</p>
              </div>
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge variant="outline" className={cn("backdrop-blur", STATUS_TONES[model.status])}>
              {t(model.status)}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="display-tight truncate font-semibold">{model.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <ScanLine className="h-3.5 w-3.5" />
              {model.scanCount} {t("scans")}
            </span>
            {onDelete && (
              <button
                className="text-muted-foreground transition-colors hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(model.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
