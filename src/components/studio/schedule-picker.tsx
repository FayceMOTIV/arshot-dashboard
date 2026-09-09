"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Clock, Sparkles, Calendar } from "lucide-react";
import type { ScheduleType } from "@/types";

interface SchedulePickerProps {
  scheduleType: ScheduleType;
  scheduledAt: string;
  onTypeChange: (type: ScheduleType) => void;
  onDateChange: (date: string) => void;
}

export function SchedulePicker({
  scheduleType,
  scheduledAt,
  onTypeChange,
  onDateChange,
}: SchedulePickerProps) {
  const t = useTranslations("studio");

  const options: { id: ScheduleType; label: string; icon: React.ElementType; description: string }[] = [
    { id: "now", label: t("scheduleNow"), icon: Clock, description: "" },
    { id: "best_time", label: t("scheduleBestTime"), icon: Sparkles, description: "" },
    { id: "custom", label: t("scheduleCustom"), icon: Calendar, description: "" },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{t("scheduleType")}</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTypeChange(id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all",
              scheduleType === id
                ? "border-[#0066FF] bg-[#0066FF]/5"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
      {scheduleType === "custom" && (
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("scheduledAt")}
          </label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}
    </div>
  );
}
