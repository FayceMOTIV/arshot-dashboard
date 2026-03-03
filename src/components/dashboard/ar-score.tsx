"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Lightbulb } from "lucide-react";

interface ARScoreProps {
  score: number;
  suggestions: string[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "[&>div]:bg-emerald-500";
  if (score >= 50) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

export function ARScore({ score, suggestions }: ARScoreProps) {
  const t = useTranslations("dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
          <Sparkles className="h-5 w-5 text-amber-500" />
          {t("arScore")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="mb-1 text-muted-foreground">/100</span>
        </div>
        <Progress value={score} className={`h-3 ${getProgressColor(score)}`} />

        {suggestions.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              {t("suggestions")}
            </p>
            <ul className="space-y-1.5">
              {suggestions.map((suggestion, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-amber-500"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
