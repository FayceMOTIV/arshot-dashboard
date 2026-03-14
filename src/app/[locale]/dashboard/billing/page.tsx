"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, getStripePortalUrl } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Loader2, Package, Zap, Eye } from "lucide-react";
import { toast } from "sonner";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

const PLAN_PRICES: Record<string, string> = {
  free: "0€/mois",
  starter: "29€/mois",
  pro: "79€/mois",
  business: "199€/mois",
  enterprise: "Sur devis",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-white/10 text-white/60",
  starter: "bg-blue-500/20 text-blue-300",
  pro: "bg-violet-500/20 text-violet-300",
  business: "bg-emerald-500/20 text-emerald-300",
  enterprise: "bg-amber-500/20 text-amber-300",
};

interface UserData {
  uid: string;
  email: string;
  plan: string;
  usage: { products: number; generations: number; views: number; period: string };
  limits: { products: number; generations: number; views: number };
  role: string;
}

function UsageBar({
  label,
  icon: Icon,
  used,
  limit,
}: {
  label: string;
  icon: React.ElementType;
  used: number;
  limit: number;
}) {
  const pct = limit < 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isUnlimited = limit < 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-white/70">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="text-white/50 tabular-nums">
          {used.toLocaleString()}{" "}
          {isUnlimited ? "/ ∞" : `/ ${limit.toLocaleString()}`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={pct}
          className={`h-1.5 ${pct >= 90 ? "[&>div]:bg-red-500" : pct >= 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-violet-500"}`}
        />
      )}
    </div>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // Toast succès après redirection Stripe
  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("Abonnement activé ! Bienvenue sur votre nouveau plan.");
      // Nettoyer l'URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    getCurrentUser().then((data) => {
      setUserData(data as UserData | null);
      setLoading(false);
    });
  }, []);

  const handleStripePortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const { url } = await getStripePortalUrl();
      window.open(url, "_blank");
    } catch {
      toast.error("Impossible d'ouvrir le portail de facturation");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Facturation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez votre abonnement et consultez votre utilisation.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0066FF]" />
          </div>
        ) : (
          <>
            {/* Current plan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#0066FF]" />
                  Plan actuel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-sm font-semibold ${PLAN_COLORS[userData?.plan ?? "free"]}`}
                    >
                      {PLAN_LABELS[userData?.plan ?? "free"] ?? userData?.plan}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      {PLAN_PRICES[userData?.plan ?? "free"] ?? "—"}
                    </span>
                  </div>

                  {userData?.plan !== "free" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStripePortal}
                      disabled={portalLoading}
                      className="gap-2"
                    >
                      {portalLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      Gérer l'abonnement
                    </Button>
                  )}
                </div>

                {userData?.plan === "free" && (
                  <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-4">
                    <p className="text-sm text-violet-300 font-medium mb-1">
                      Passez à la vitesse supérieure
                    </p>
                    <p className="text-xs text-white/50 mb-3">
                      Débloquez plus de produits, analytics avancées et supprimez le watermark.
                    </p>
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-500 border-0 text-white"
                      onClick={() => window.open("/fr/pricing", "_blank")}
                    >
                      Voir les plans →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#0066FF]" />
                  Utilisation ce mois
                  {userData?.usage.period && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({userData.usage.period})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageBar
                  label="Produits actifs"
                  icon={Package}
                  used={userData?.usage.products ?? 0}
                  limit={userData?.limits.products ?? 3}
                />
                <UsageBar
                  label="Générations 3D"
                  icon={Zap}
                  used={userData?.usage.generations ?? 0}
                  limit={userData?.limits.generations ?? 3}
                />
                <UsageBar
                  label="Vues viewer AR"
                  icon={Eye}
                  used={userData?.usage.views ?? 0}
                  limit={userData?.limits.views ?? 500}
                />
              </CardContent>
            </Card>

            {/* Account info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{userData?.email ?? user?.email ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rôle</span>
                  <span className="capitalize">{userData?.role ?? "user"}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
