"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { ABTest } from "@/types";

interface ABTestCardProps {
  test: ABTest;
  mode?: "compact" | "full";
}

const STATUS_STYLES: Record<string, string> = {
  running: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
};

export function ABTestCard({ test, mode = "compact" }: ABTestCardProps) {
  const t = useTranslations("studio");

  const winner = test.variants.find((v) => v.winner);

  if (mode === "compact") {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#0066FF]" />
            <div>
              <p className="text-sm font-medium">
                {test.variants.map((v) => v.template).join(" vs ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(test.startedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {winner && (
              <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                <Trophy className="h-3 w-3" />
                {winner.template}
              </Badge>
            )}
            <Badge className={STATUS_STYLES[test.status] || ""}>
              {t(`abTest${test.status.charAt(0).toUpperCase() + test.status.slice(1)}` as "abTestRunning" | "abTestCompleted" | "abTestPending")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = test.variants.map((v) => ({
    template: v.template,
    views: v.views,
    engagement: v.engagement,
    qrClicks: v.qrClicks,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-geist)]">
            <TrendingUp className="h-5 w-5 text-[#0066FF]" />
            {test.variants.map((v) => v.template).join(" vs ")}
          </CardTitle>
          <Badge className={STATUS_STYLES[test.status] || ""}>
            {t(`abTest${test.status.charAt(0).toUpperCase() + test.status.slice(1)}` as "abTestRunning" | "abTestCompleted" | "abTestPending")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="template" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#0066FF" name={t("abTestViews")} />
              <Bar dataKey="engagement" fill="#10B981" name={t("abTestEngagement")} />
              <Bar dataKey="qrClicks" fill="#F59E0B" name={t("abTestQrClicks")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {test.variants.map((v) => (
            <div
              key={v.template}
              className={`rounded-lg border p-3 text-center ${
                v.winner ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : "border-border"
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {v.template}
              </p>
              <div className="mt-2 space-y-1">
                <p className="flex items-center justify-center gap-1 text-sm">
                  <Eye className="h-3 w-3" /> {v.views}
                </p>
                <p className="flex items-center justify-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3" /> {v.engagement}%
                </p>
                <p className="flex items-center justify-center gap-1 text-sm">
                  <MousePointerClick className="h-3 w-3" /> {v.qrClicks}
                </p>
              </div>
              {v.winner && (
                <Badge className="mt-2 gap-1 bg-emerald-100 text-emerald-700">
                  <Trophy className="h-3 w-3" />
                  {t("abTestWinner")}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {winner && (
          <p className="rounded-lg bg-[#0066FF]/5 p-3 text-center text-sm text-[#0066FF]">
            {t("abTestRecommendation", { template: winner.template })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
