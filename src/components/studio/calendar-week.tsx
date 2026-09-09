"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import type { ScheduledPost } from "@/types";

interface CalendarWeekProps {
  posts: ScheduledPost[];
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "bg-black text-white",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  pinterest: "bg-red-600 text-white",
};

export function CalendarWeek({ posts }: CalendarWeekProps) {
  const t = useTranslations("studio");

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + 1 + i);
    return date;
  });

  const getPostsForDate = (date: Date) =>
    posts.filter((p) => {
      const postDate = new Date(p.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });

  const formatDay = (date: Date) =>
    date.toLocaleDateString(undefined, { weekday: "short" });

  const formatDayNum = (date: Date) => date.getDate();

  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-geist)]">
          <Calendar className="h-4 w-4" />
          {t("scheduledPosts")} — {t("thisWeek")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date) => {
            const dayPosts = getPostsForDate(date);
            return (
              <div
                key={date.toISOString()}
                className={`flex flex-col items-center rounded-lg p-2 text-center ${
                  isToday(date)
                    ? "bg-[#0066FF]/10 ring-1 ring-[#0066FF]/30"
                    : "bg-muted/50"
                }`}
              >
                <span className="text-xs text-muted-foreground">
                  {formatDay(date)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isToday(date) ? "text-[#0066FF]" : ""
                  }`}
                >
                  {formatDayNum(date)}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayPosts.map((post) => (
                    <Badge
                      key={post.id}
                      className={`h-1.5 w-full rounded-full px-0 ${
                        PLATFORM_COLORS[post.platform] || "bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {posts.length === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Clock className="mr-1 inline h-3 w-3" />
            {t("noProducts")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
