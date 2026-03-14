"use client";

import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Clock } from "lucide-react";
import type { StudioJobStatus } from "@/types";

interface JobProgressProps {
  status: StudioJobStatus;
  progress: number;
}

const STATUS_CONFIG: Record<
  StudioJobStatus,
  { icon: React.ElementType; color: string; badgeClass: string }
> = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  processing: {
    icon: Loader2,
    color: "text-[#0066FF]",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  done: {
    icon: Check,
    color: "text-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  failed: {
    icon: X,
    color: "text-red-500",
    badgeClass: "bg-red-100 text-red-700",
  },
};

export function JobProgress({ status, progress }: JobProgressProps) {
  const t = useTranslations("studio");
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${config.color} ${
              status === "processing" ? "animate-spin" : ""
            }`}
          />
          <Badge className={config.badgeClass}>
            {t(status as "pending" | "processing" | "done" | "failed")}
          </Badge>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
