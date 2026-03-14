"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Plus,
  RefreshCw,
  ExternalLink,
  Mail,
  Box,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Trash2,
  Eye,
} from "lucide-react";
import {
  listProspects,
  createProspect,
  getProspectStats,
  updateProspect,
  deleteProspect,
  generateProspectDemo,
  sendProspectEmail,
  runScraper,
  getScraperStatus,
} from "@/lib/api";
import type { Prospect, ProspectStatus, ProspectStats, ScraperRun } from "@/types";

// ── Pipeline columns ──────────────────────────────────────────────────────────

const PIPELINE: { status: ProspectStatus; label: string; color: string; dot: string }[] = [
  { status: "scraped",        label: "Scrapé",      color: "bg-slate-100 dark:bg-slate-800",   dot: "bg-slate-400" },
  { status: "demo_generated", label: "Démo 3D",     color: "bg-blue-50 dark:bg-blue-950",      dot: "bg-blue-500" },
  { status: "contacted",      label: "Contacté",    color: "bg-yellow-50 dark:bg-yellow-950",  dot: "bg-yellow-500" },
  { status: "replied",        label: "Répondu",     color: "bg-orange-50 dark:bg-orange-950",  dot: "bg-orange-500" },
  { status: "signed_up",      label: "Inscrit",     color: "bg-purple-50 dark:bg-purple-950",  dot: "bg-purple-500" },
  { status: "converted",      label: "Converti ✓",  color: "bg-green-50 dark:bg-green-950",    dot: "bg-green-500" },
  { status: "lost",           label: "Perdu",       color: "bg-red-50 dark:bg-red-950",        dot: "bg-red-400" },
];

const SOURCE_LABELS: Record<string, string> = {
  scraper: "Scraper",
  alex: "Alex",
  instagram: "Instagram",
  manual: "Manuel",
};

// ── Prospect Card ─────────────────────────────────────────────────────────────

function ProspectCard({
  prospect,
  onAction,
}: {
  prospect: Prospect;
  onAction: (action: string, id: string) => void;
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handle = async (action: string) => {
    setLoadingAction(action);
    await onAction(action, prospect.id);
    setLoadingAction(null);
  };

  const hasDemos = prospect.demo_models.length > 0;
  const hasEmail = !!prospect.email;
  const lastContact = prospect.contacts[prospect.contacts.length - 1];

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{prospect.company_name}</p>
          <a
            href={prospect.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#0066FF] truncate"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{prospect.website.replace(/^https?:\/\//, "")}</span>
          </a>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {SOURCE_LABELS[prospect.source] ?? prospect.source}
        </Badge>
      </div>

      {/* Tags */}
      {prospect.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prospect.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block rounded px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Demos count */}
      {hasDemos && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Box className="h-3 w-3" />
          {prospect.demo_models.length} démo{prospect.demo_models.length > 1 ? "s" : ""} 3D
        </p>
      )}

      {/* Last contact */}
      {lastContact && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {lastContact.channel} — {lastContact.status}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-1 pt-1">
        {!hasDemos && prospect.scraped_images.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] px-2"
            disabled={loadingAction === "demo"}
            onClick={() => handle("demo")}
          >
            {loadingAction === "demo" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Box className="h-3 w-3" />
            )}
            Démo
          </Button>
        )}

        {hasDemos && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] px-2"
            onClick={() => window.open(prospect.demo_models[0].viewer_url, "_blank")}
          >
            <Eye className="h-3 w-3" />
            Voir
          </Button>
        )}

        {hasDemos && hasEmail && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] px-2"
            disabled={loadingAction === "email"}
            onClick={() => handle("email")}
          >
            {loadingAction === "email" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Mail className="h-3 w-3" />
            )}
            Email
          </Button>
        )}

        {prospect.status !== "converted" && prospect.status !== "lost" && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[11px] px-2"
            disabled={loadingAction === "advance"}
            onClick={() => handle("advance")}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-[11px] px-2 text-destructive hover:text-destructive"
          onClick={() => handle("delete")}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ── Add Prospect Modal ────────────────────────────────────────────────────────

function AddProspectModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Prospect) => void;
}) {
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    email: "",
    notes: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const prospect = await createProspect({
        company_name: form.company_name,
        website: form.website,
        email: form.email || undefined,
        notes: form.notes || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        source: "manual",
      });
      onCreated(prospect);
      setForm({ company_name: "", website: "", email: "", notes: "", tags: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau prospect</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="company_name">Nom de l&apos;entreprise *</Label>
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              required
              placeholder="ModeBoutique.fr"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="website">Site web *</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              required
              placeholder="https://modeboutique.fr"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email de contact</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="contact@modeboutique.fr"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tags">Tags (séparés par virgule)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="shopify, mode, france"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Rappeler jeudi, très intéressé..."
              rows={2}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const NEXT_STATUS: Record<ProspectStatus, ProspectStatus | null> = {
  scraped: "demo_generated",
  demo_generated: "contacted",
  contacted: "replied",
  replied: "signed_up",
  signed_up: "converted",
  converted: null,
  lost: null,
};

export default function ProspectionPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [stats, setStats] = useState<ProspectStats | null>(null);
  const [scraper, setScraper] = useState<ScraperRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [runningScaper, setRunningScaper] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const [p, s, sc] = await Promise.all([
        listProspects({ limit: 200 }),
        getProspectStats(),
        getScraperStatus().catch(() => null),
      ]);
      setProspects(p);
      setStats(s);
      if (sc) setScraper(sc);
    } catch {
      /* silently fail — mock data shown */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (action: string, id: string) => {
    const p = prospects.find((x) => x.id === id);
    if (!p) return;

    if (action === "delete") {
      if (!confirm(`Supprimer ${p.company_name} ?`)) return;
      await deleteProspect(id).catch(() => {});
      setProspects((ps) => ps.filter((x) => x.id !== id));
      return;
    }

    if (action === "demo") {
      try {
        await generateProspectDemo(id);
        showToast("Génération 3D lancée !");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erreur", false);
      }
      return;
    }

    if (action === "email") {
      try {
        await sendProspectEmail(id);
        showToast("Email envoyé !");
        await load();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erreur", false);
      }
      return;
    }

    if (action === "advance") {
      const next = NEXT_STATUS[p.status];
      if (!next) return;
      try {
        const updated = await updateProspect(id, { status: next });
        setProspects((ps) => ps.map((x) => (x.id === id ? updated : x)));
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erreur", false);
      }
    }
  };

  const handleRunScraper = async () => {
    setRunningScaper(true);
    try {
      await runScraper();
      showToast("Scraper lancé — jusqu'à 200 stores analysés");
      setTimeout(load, 2000);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur scraper", false);
    } finally {
      setRunningScaper(false);
    }
  };

  const filtered = sourceFilter === "all"
    ? prospects
    : prospects.filter((p) => p.source === sourceFilter);

  const byStatus = (status: ProspectStatus) =>
    filtered.filter((p) => p.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm ${
            toast.ok
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
        >
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Prospection</h1>
          <p className="text-sm text-muted-foreground">Pipeline de prospection automatisé</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunScraper}
            disabled={runningScaper}
          >
            {runningScaper ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Lancer scraper
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau prospect
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Démos aujourd'hui" value={stats.demos_generated_today} />
          <StatCard label="Contacts aujourd'hui" value={stats.contacts_sent_today} />
          <StatCard label="MRR converti" value={`${stats.converted_mrr.toFixed(0)} €`} />
          <StatCard label="Taux conversion" value={`${stats.conversion_rate}%`} />
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-xs text-muted-foreground">Scraper</p>
            <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
              {scraper?.status === "running" ? (
                <><Loader2 className="h-3 w-3 animate-spin text-blue-500" /> En cours</>
              ) : scraper?.status === "completed" ? (
                <><CheckCircle2 className="h-3 w-3 text-green-500" /> Prêt</>
              ) : (
                <><AlertCircle className="h-3 w-3 text-muted-foreground" /> {scraper?.status ?? "—"}</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Source filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "scraper", "alex", "instagram", "manual"].map((src) => (
          <button
            key={src}
            onClick={() => setSourceFilter(src)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              sourceFilter === src
                ? "bg-[#0066FF] border-[#0066FF] text-white"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {src === "all" ? "Toutes sources" : SOURCE_LABELS[src] ?? src}
            {src === "all" ? (
              <span className="ml-1.5 opacity-70">{filtered.length}</span>
            ) : (
              <span className="ml-1.5 opacity-70">
                {prospects.filter((p) => p.source === src).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE.map(({ status, label, color, dot }) => {
          const cards = byStatus(status);
          return (
            <div
              key={status}
              className={`flex-shrink-0 w-60 rounded-xl ${color} p-3 space-y-2`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-background rounded-full px-2 py-0.5">
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {cards.map((p) => (
                  <ProspectCard key={p.id} prospect={p} onAction={handleAction} />
                ))}
                {cards.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 opacity-60">
                    Aucun prospect
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      <AddProspectModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={(p) => {
          setProspects((ps) => [p, ...ps]);
          setShowAdd(false);
          showToast(`${p.company_name} ajouté !`);
        }}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}
