"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Eye, ScanLine, Trash2 } from "lucide-react";
import ModelViewerElement from "./model-viewer-element";
import type { ARModel, ModelStatus } from "@/types";

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

export function ProductCard({ model, onDelete }: ProductCardProps) {
  const t = useTranslations("products");

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
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
          <Badge className={STATUS_COLORS[model.status]}>
            {t(model.status)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium truncate font-[family-name:var(--font-geist)]">
          {model.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <ScanLine className="h-3.5 w-3.5" />
          <span>
            {model.scanCount} {t("scans")}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/products/${model.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {t("viewProduct")}
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(model.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
