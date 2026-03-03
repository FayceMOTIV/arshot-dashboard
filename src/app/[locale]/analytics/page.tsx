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

const PIE_COLORS = ["#0066FF", "#10B981", "#F59E0B", "#8B5CF6"];

const MOCK_DEVICE_SPLIT: DeviceSplit[] = [
  { device: "iOS", count: 456, percentage: 52 },
  { device: "Android", count: 312, percentage: 36 },
  { device: "Desktop", count: 105, percentage: 12 },
];

const MOCK_COUNTRY_STATS: CountryStat[] = [
  { country: "France", countryCode: "FR", count: 423 },
  { country: "Allemagne", countryCode: "DE", count: 187 },
  { country: "Espagne", countryCode: "ES", count: 134 },
  { country: "États-Unis", countryCode: "US", count: 89 },
  { country: "Italie", countryCode: "IT", count: 67 },
  { country: "Belgique", countryCode: "BE", count: 45 },
  { country: "Suisse", countryCode: "CH", count: 34 },
  { country: "Canada", countryCode: "CA", count: 21 },
];

const MOCK_TOP_PRODUCTS: ARModel[] = [
  { id: "1", userId: "u1", name: "Lampe scandinave", status: "ready", pipeline: "object_capture", shortId: "a1", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null, qualityScore: 85, scanCount: 342, createdAt: "", updatedAt: "" },
  { id: "2", userId: "u1", name: "Chaise design", status: "ready", pipeline: "flash_vdm", shortId: "a2", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null, qualityScore: 72, scanCount: 198, createdAt: "", updatedAt: "" },
  { id: "3", userId: "u1", name: "Table basse", status: "ready", pipeline: "flash_vdm", shortId: "a3", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null, qualityScore: 91, scanCount: 156, createdAt: "", updatedAt: "" },
  { id: "4", userId: "u1", name: "Vase artisanal", status: "ready", pipeline: "object_capture", shortId: "a4", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null, qualityScore: 68, scanCount: 134, createdAt: "", updatedAt: "" },
  { id: "5", userId: "u1", name: "Étagère murale", status: "ready", pipeline: "flash_vdm", shortId: "a5", modelUrl: null, thumbnailUrl: null, usdzUrl: null, glbUrl: null, qualityScore: 78, scanCount: 89, createdAt: "", updatedAt: "" },
];

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
      try {
        const [devices, countries, top] = await Promise.all([
          getDeviceSplit(user.uid).catch(() => MOCK_DEVICE_SPLIT),
          getCountryStats(user.uid).catch(() => MOCK_COUNTRY_STATS),
          getTopProducts(user.uid).catch(() => MOCK_TOP_PRODUCTS),
        ]);
        setDeviceSplit(devices);
        setCountryStats(countries);
        setTopProducts(top);
      } catch {
        setDeviceSplit(MOCK_DEVICE_SPLIT);
        setCountryStats(MOCK_COUNTRY_STATS);
        setTopProducts(MOCK_TOP_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
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
                <Smartphone className="h-5 w-5 text-[#0066FF]" />
                {t("deviceSplit")}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                          className="h-full rounded-full bg-[#0066FF] transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  <Bar dataKey="scanCount" fill="#0066FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
