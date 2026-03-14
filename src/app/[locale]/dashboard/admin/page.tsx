"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getAdminStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  UserPlus,
  AlertTriangle,
  Euro,
  Target,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminStats } from "@/types";

// ── Plan config ──────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<string, { label: string; color: string; mrr: number }> = {
  free:       { label: "Free",       color: "#94a3b8", mrr: 0 },
  starter:    { label: "Starter",    color: "#3b82f6", mrr: 29 },
  pro:        { label: "Pro",        color: "#8b5cf6", mrr: 79 },
  business:   { label: "Business",   color: "#f59e0b", mrr: 199 },
  enterprise: { label: "Enterprise", color: "#10b981", mrr: 499 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtEur(n: number) {
  if (n >= 1_000_000) return `${fmt(n / 1_000_000, 1)} M€`;
  if (n >= 1_000) return `${fmt(n / 1_000, 1)} k€`;
  return `${fmt(n)} €`;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className={`text-2xl font-bold ${accent ?? ""}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="rounded-lg bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminCockpitPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getAdminStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center p-6">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="font-semibold">Accès réservé aux admins</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          {error ?? "Impossible de charger les stats. Vérifiez votre rôle Firebase."}
        </p>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  // Préparer les données plan pour le bar chart
  const planData = Object.entries(stats.users_by_plan)
    .filter(([, count]) => count > 0)
    .map(([plan, count]) => ({
      plan: PLAN_CONFIG[plan]?.label ?? plan,
      count,
      mrr: count * (PLAN_CONFIG[plan]?.mrr ?? 0),
      color: PLAN_CONFIG[plan]?.color ?? "#94a3b8",
    }));

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/10 p-2">
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cockpit Business</h1>
            <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="MRR"
          value={fmtEur(stats.mrr_total)}
          sub="Mensuel récurrent"
          accent="text-[#0066FF]"
        />
        <KpiCard
          icon={Euro}
          label="CA cumulatif"
          value={fmtEur(stats.total_revenue_cumulative)}
          sub="Estimation 12 mois"
        />
        <KpiCard
          icon={Users}
          label="Clients actifs"
          value={fmt(stats.paying_users)}
          sub={`${fmt(stats.total_users)} inscrits au total`}
        />
        <KpiCard
          icon={UserPlus}
          label="Nouveaux / semaine"
          value={`+${stats.new_this_week}`}
          sub={`+${stats.new_this_month} ce mois`}
          accent={stats.new_this_week > 0 ? "text-green-600 dark:text-green-400" : ""}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Churn rate"
          value={`${stats.churn_rate} %`}
          sub="30 derniers jours"
          accent={stats.churn_rate > 5 ? "text-red-500" : stats.churn_rate > 2 ? "text-amber-500" : "text-green-600 dark:text-green-400"}
        />
        <Link href="/dashboard/prospection" className="block">
          <Card className="h-full border-dashed border-[#0066FF]/40 hover:border-[#0066FF] hover:bg-[#0066FF]/5 transition-colors cursor-pointer">
            <CardContent className="pt-5 pb-4 h-full flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Pipeline
                </p>
                <p className="text-2xl font-bold text-[#0066FF] flex items-center gap-1">
                  <Target className="h-5 w-5" />
                  Prospection
                </p>
              </div>
              <p className="text-xs text-[#0066FF]/70 flex items-center gap-1 mt-2">
                Ouvrir le Kanban <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* MRR evolution — 2/3 width */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Évolution MRR — 30 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.mrr_history} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}€`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  formatter={(v: number | undefined) => [`${fmt(v ?? 0, 2)} €`, "MRR"]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#0066FF"
                  strokeWidth={2}
                  fill="url(#mrrGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clients par plan — 1/3 width */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Clients par plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={planData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="plan"
                  type="category"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  formatter={(v: number | undefined) => [v ?? 0, "clients"]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {planData.map((entry) => (
                    <Cell key={entry.plan} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Table récap */}
            <div className="space-y-1.5 pt-1">
              {planData.map((d) => (
                <div key={d.plan} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: d.color }}
                    />
                    <span className="font-medium">{d.plan}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{d.count} clients</span>
                    <span className="w-16 text-right font-mono text-xs">
                      {fmtEur(d.mrr)}/m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            href: "/dashboard/prospection",
            label: "Pipeline Prospection",
            desc: "Kanban leads + démos 3D",
            icon: Target,
            color: "text-[#0066FF]",
          },
          {
            href: "/analytics",
            label: "Analytics AR",
            desc: "Scans, devices, pays",
            icon: TrendingUp,
            color: "text-purple-600",
          },
          {
            href: "/dashboard/billing",
            label: "Facturation",
            desc: "Plans Stripe, webhooks",
            icon: Euro,
            color: "text-green-600",
          },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-4 pb-4 flex items-center gap-4">
                <div className="rounded-lg bg-muted p-2.5 group-hover:bg-muted/70 transition-colors">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
