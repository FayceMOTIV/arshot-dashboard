"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getDeviceSplit, getCountryStats, getTopProducts } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Map,
  Smartphone,
  Trophy,
  Loader2,
  BarChart3,
  Globe,
} from "lucide-react";
import type { DeviceSplit, CountryStat, ARModel } from "@/types";

const PIE_COLORS = ["#0071E3", "#10B981", "#F59E0B", "#8B5CF6"];

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const { user } = useAuth();
  const [deviceSplit, setDeviceSplit] = useState<DeviceSplit[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [topProducts, setTopProducts] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const [devices, countries, top] = await Promise.all([
        getDeviceSplit(user.uid).catch(() => [] as DeviceSplit[]),
        getCountryStats(user.uid).catch(() => [] as CountryStat[]),
        getTopProducts(user.uid).catch(() => [] as ARModel[]),
      ]);
      setDeviceSplit(devices);
      setCountryStats(countries);
      setTopProducts(top);
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071E3]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
          {t("title")}
        </h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Device Split Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
                <Smartphone className="h-5 w-5 text-[#0071E3]" />
                {t("deviceSplit")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deviceSplit.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  {t("noData")}
                </div>
              ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="device"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {deviceSplit.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Country Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
                <Globe className="h-5 w-5 text-emerald-500" />
                {t("scanMap")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {countryStats.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  {t("noData")}
                </div>
              ) : (
              <div className="space-y-3">
                {countryStats.slice(0, 8).map((stat, i) => {
                  const maxCount = countryStats[0]?.count || 1;
                  const width = (stat.count / maxCount) * 100;
                  return (
                    <div key={stat.countryCode} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                          {stat.country}
                        </span>
                        <span className="font-medium">{stat.count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#0071E3] transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
              <Trophy className="h-5 w-5 text-amber-500" />
              {t("topProducts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                {t("noData")}
              </div>
            ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    className="text-xs"
                    tickFormatter={(value: string) =>
                      value.length > 20 ? `${value.slice(0, 20)}...` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="scanCount" fill="#0071E3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
