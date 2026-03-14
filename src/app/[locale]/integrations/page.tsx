"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getIntegrationsStatus } from "@/lib/api";
import type { IntegrationsStatus } from "@/types";
import {
  ShoppingBag,
  ShoppingCart,
  Music2,
  Instagram,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformInfo {
  key: keyof Pick<IntegrationsStatus, "shopify" | "woocommerce" | "tiktok" | "instagram">;
  icon: typeof ShoppingBag;
  label: string;
  description: string;
  detail?: string;
}

export default function IntegrationsPage() {
  const t = useTranslations("integrations");
  const [status, setStatus] = useState<IntegrationsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await getIntegrationsStatus();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const platforms: PlatformInfo[] = [
    {
      key: "shopify",
      icon: ShoppingBag,
      label: t("shopify"),
      description: t("shopifyDesc"),
      detail: status?.shopifyShop ?? undefined,
    },
    {
      key: "woocommerce",
      icon: ShoppingCart,
      label: t("woocommerce"),
      description: t("woocommerceDesc"),
    },
    {
      key: "tiktok",
      icon: Music2,
      label: t("tiktok"),
      description: t("tiktokDesc"),
    },
    {
      key: "instagram",
      icon: Instagram,
      label: t("instagram"),
      description: t("instagramDesc"),
      detail: status?.instagramUsername ? `@${status.instagramUsername}` : undefined,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <AlertCircle className="h-10 w-10" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-geist)]">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {platforms.map(({ key, icon: Icon, label, description, detail }) => {
          const connected = status?.[key] ?? false;
          return (
            <Card key={key} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-3 text-base font-semibold">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  {label}
                </CardTitle>
                <Badge
                  variant={connected ? "default" : "secondary"}
                  className={
                    connected
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                      : ""
                  }
                >
                  {connected ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("connected")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {t("disconnected")}
                    </span>
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
                {detail && (
                  <p className="mt-1 text-sm font-medium text-foreground">{detail}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
