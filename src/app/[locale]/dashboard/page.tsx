"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardStats, getScansByDay, IS_MOCK } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ARScore } from "@/components/dashboard/ar-score";
import { ScansChart } from "@/components/dashboard/scans-chart";
import { OnboardingWizard, shouldShowOnboarding } from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Plus, Loader2, PackageOpen, AlertTriangle } from "lucide-react";
import type { DashboardStats, ScansByDay } from "@/types";
import { PLAN_LIMITS } from "@/types";

// Mock data for development
const MOCK_STATS: DashboardStats = {
  totalProducts: 5,
  scansThisMonth: 342,
  currentPlan: "pro",
  arScore: 72,
  arScoreSuggestions: [
    "Ajoutez des photos sous plusieurs angles",
    "Utilisez un éclairage uniforme",
    "Évitez les surfaces réfléchissantes",
  ],
};

function generateMockScans(): ScansByDay[] {
  const data: ScansByDay[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 30) + 5,
    });
  }
  return data;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scansData, setScansData] = useState<ScansByDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Affiche l'onboarding pour les nouveaux users (localStorage)
  useEffect(() => {
    if (shouldShowOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      if (IS_MOCK) {
        setStats(MOCK_STATS);
        setScansData(generateMockScans());
        setLoading(false);
        return;
      }
      try {
        const [statsResult, scansResult] = await Promise.all([
          getDashboardStats(user.uid),
          getScansByDay(user.uid),
        ]);
        setStats(statsResult);
        setScansData(scansResult);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Erreur de connexion au backend");
        setStats(MOCK_STATS);
        setScansData(generateMockScans());
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <>
    {showOnboarding && (
      <OnboardingWizard onDone={() => setShowOnboarding(false)} />
    )}
    <AppShell>
      <div className="space-y-6">
        {apiError && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Backend inaccessible — données de démo affichées. ({apiError})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
            {t("title")}
          </h1>
          {stats && stats.totalProducts < PLAN_LIMITS[stats.currentPlan].maxProducts && (
            <Link href="/products/new">
              <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                <Plus className="h-4 w-4" />
                {t("createProduct")}
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        ) : stats ? (
          <>
            <StatsCards stats={stats} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ScansChart data={scansData} />
              </div>
              <ARScore
                score={stats.arScore}
                suggestions={stats.arScoreSuggestions}
              />
            </div>

            {stats.totalProducts === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t("noProducts")}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {t("getStarted")}
                </p>
                <Link href="/products/new">
                  <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                    <Plus className="h-4 w-4" />
                    {t("createProduct")}
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AppShell>
    </>
  );
}
