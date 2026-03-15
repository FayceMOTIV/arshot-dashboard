"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Smartphone, Globe } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ProductAnalyticsProps {
  productId: string;
  scanCount: number;
}

type TimeRange = "7d" | "30d" | "90d";

function generateMockTimeSeries(days: number, totalScans: number) {
  const data = [];
  const today = new Date();
  // Use a seeded-ish approach so values are deterministic per render
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    });
    const base = Math.max(1, Math.floor(totalScans / days));
    // pseudo-random but bounded variance
    const seed = (i * 7 + days * 3) % 17;
    const variance = Math.floor((seed / 17) * base * 0.8);
    const views3d = base + variance;
    const viewsAr = Math.floor(views3d * 0.35);
    const qrScans = Math.floor(views3d * 0.18);
    data.push({
      date: label,
      "Vue 3D": views3d,
      "Vue AR": viewsAr,
      "Scan QR": qrScans,
    });
  }
  return data;
}

const MOCK_DEVICE_SPLIT = [
  { name: "iOS", value: 52, color: "#0066FF" },
  { name: "Android", value: 36, color: "#10B981" },
  { name: "Desktop", value: 12, color: "#F59E0B" },
];

const MOCK_REFERRERS = [
  { source: "Instagram", visits: 423, percentage: 45 },
  { source: "TikTok", visits: 234, percentage: 25 },
  { source: "Direct / QR", visits: 187, percentage: 20 },
  { source: "WhatsApp", visits: 89, percentage: 9 },
  { source: "Autre", visits: 10, percentage: 1 },
];

export function ProductAnalytics({
  productId: _productId,
  scanCount,
}: ProductAnalyticsProps) {
  const [range, setRange] = useState<TimeRange>("30d");
  const [data, setData] = useState(() =>
    generateMockTimeSeries(30, scanCount || 120)
  );

  useEffect(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    setData(generateMockTimeSeries(days, scanCount || 120));
  }, [range, scanCount]);

  const totalViews = data.reduce(
    (acc, d) => acc + (d["Vue 3D"] as number),
    0
  );
  const totalAR = data.reduce(
    (acc, d) => acc + (d["Vue AR"] as number),
    0
  );
  const conversionRate =
    totalViews > 0 ? ((totalAR / totalViews) * 100).toFixed(1) : "0";
  const avgDuration = 42; // seconds mock

  return (
    <div className="space-y-4">
      {/* Time range tabs */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-sm">
          <BarChart3 className="h-4 w-4 text-[#0066FF]" />
          Analytiques du produit
        </h3>
        <Tabs
          value={range}
          onValueChange={(v) => setRange(v as TimeRange)}
        >
          <TabsList className="h-7">
            <TabsTrigger value="7d" className="text-xs px-2 h-6">
              7j
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2 h-6">
              30j
            </TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2 h-6">
              90j
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-[#0066FF]">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Vues 3D</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">
            {conversionRate}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">3D → AR</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{avgDuration}s</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Durée moy.
          </p>
        </div>
      </div>

      {/* Line chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: string) =>
                range === "90d" ? v.split(" ")[1] || v : v
              }
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            <Line
              type="monotone"
              dataKey="Vue 3D"
              stroke="#0066FF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Vue AR"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Scan QR"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-full bg-[#0066FF] inline-block" />{" "}
          Vue 3D
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-full bg-emerald-500 inline-block" />{" "}
          Vue AR
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-full bg-amber-500 inline-block" />{" "}
          Scan QR
        </span>
      </div>

      {/* Device split + Referrers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Device split */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-[#0066FF]" />
            Appareils
          </p>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DEVICE_SPLIT}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_DEVICE_SPLIT.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1">
            {MOCK_DEVICE_SPLIT.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between text-[10px]"
              >
                <span className="flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full inline-block"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.name}
                </span>
                <span className="text-muted-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referrers */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <p className="text-xs font-medium flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-emerald-500" />
            Provenance
          </p>
          <div className="space-y-2">
            {MOCK_REFERRERS.map((ref) => (
              <div key={ref.source} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span>{ref.source}</span>
                  <span className="text-muted-foreground">
                    {ref.percentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#0066FF] transition-all"
                    style={{ width: `${ref.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
