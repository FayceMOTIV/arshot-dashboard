"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/app-shell";
import { ABTestCard } from "@/components/studio/ab-test-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, FlaskConical, Loader2, Beaker } from "lucide-react";
import type { ABTest } from "@/types";
import { getProducts, IS_MOCK } from "@/lib/api";

const MOCK_AB_TESTS: ABTest[] = [
  {
    id: "ab1",
    productId: "1",
    variants: [
      { template: "quiet_luxury", views: 1200, engagement: 4.5, qrClicks: 34, winner: true },
      { template: "pov_unboxing", views: 890, engagement: 3.2, qrClicks: 21, winner: false },
      { template: "360_hype", views: 650, engagement: 2.1, qrClicks: 12, winner: false },
    ],
    status: "completed",
    startedAt: "2025-02-28T10:00:00Z",
    completedAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "ab2",
    productId: "2",
    variants: [
      { template: "unboxing", views: 340, engagement: 5.1, qrClicks: 18, winner: false },
      { template: "levitation", views: 560, engagement: 6.3, qrClicks: 29, winner: true },
      { template: "asmr_closeup", views: 420, engagement: 4.8, qrClicks: 15, winner: false },
    ],
    status: "running",
    startedAt: "2025-03-02T08:00:00Z",
    completedAt: null,
  },
  {
    id: "ab3",
    productId: "3",
    variants: [
      { template: "transform", views: 0, engagement: 0, qrClicks: 0, winner: false },
      { template: "before_after", views: 0, engagement: 0, qrClicks: 0, winner: false },
      { template: "quiet_luxury", views: 0, engagement: 0, qrClicks: 0, winner: false },
    ],
    status: "pending",
    startedAt: "2025-03-03T10:00:00Z",
    completedAt: null,
  },
];

export default function ABTestsPage() {
  const t = useTranslations("studio");
  const { user } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      if (!user) return;
      if (IS_MOCK) {
        setTests(MOCK_AB_TESTS);
        setLoading(false);
        return;
      }
      // No bulk AB-test endpoint yet — try to fetch per-product tests for ready products
      try {
        const products = await getProducts();
        const readyIds = products.filter((p) => p.status === "ready").map((p) => p.id);
        // Endpoint GET /studio/ab-results/{testId} requires a testId, not productId.
        // Until a bulk endpoint exists, show empty list (no mock data in prod).
        void readyIds; // reserved for future bulk endpoint
        setTests([]);
      } catch {
        setTests([]);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, [user]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/studio">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
              {t("abTestTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("abTestSubtitle")}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <Beaker className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">{t("abTestPending")}</h3>
            <Link href="/studio" className="mt-4">
              <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                <FlaskConical className="h-4 w-4" />
                {t("abTestLaunch")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <ABTestCard key={test.id} test={test} mode="full" />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
