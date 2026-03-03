"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ScanLine, CreditCard, Sparkles } from "lucide-react";
import type { DashboardStats, PlanTier } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const PLAN_COLORS: Record<PlanTier, string> = {
  starter: "text-gray-600",
  pro: "text-[#0066FF]",
  business: "text-purple-600",
  enterprise: "text-amber-600",
};

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("dashboard");
  const tPlans = useTranslations("plans");

  const cards = [
    {
      label: t("totalProducts"),
      value: stats.totalProducts,
      icon: Package,
      color: "text-[#0066FF]",
      bg: "bg-[#0066FF]/10",
    },
    {
      label: t("scansThisMonth"),
      value: stats.scansThisMonth,
      icon: ScanLine,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: t("currentPlan"),
      value: tPlans(stats.currentPlan),
      icon: CreditCard,
      color: PLAN_COLORS[stats.currentPlan],
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: t("arScore"),
      value: `${stats.arScore}/100`,
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-lg p-3 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold font-[family-name:var(--font-geist)]">
                {card.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
