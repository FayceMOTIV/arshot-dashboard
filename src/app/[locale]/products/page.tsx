"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getUserModels } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter, ArrowUpDown, Loader2, PackageOpen } from "lucide-react";
import type { ARModel, ModelStatus } from "@/types";

type SortKey = "date" | "scans" | "name" | "quality";
type FilterKey = "all" | ModelStatus;

const MOCK_MODELS: ARModel[] = [
  {
    id: "1",
    userId: "u1",
    name: "Lampe scandinave",
    status: "ready",
    pipeline: "object_capture",
    shortId: "abc123",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: null,
    qualityScore: 85,
    scanCount: 142,
    createdAt: "2025-02-15T10:00:00Z",
    updatedAt: "2025-02-15T12:00:00Z",
  },
  {
    id: "2",
    userId: "u1",
    name: "Chaise design",
    status: "ready",
    pipeline: "flash_vdm",
    shortId: "def456",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: null,
    qualityScore: 72,
    scanCount: 89,
    createdAt: "2025-02-20T10:00:00Z",
    updatedAt: "2025-02-20T12:00:00Z",
  },
  {
    id: "3",
    userId: "u1",
    name: "Table basse",
    status: "processing",
    pipeline: "flash_vdm",
    shortId: "ghi789",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: null,
    qualityScore: null,
    scanCount: 0,
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "4",
    userId: "u1",
    name: "Vase artisanal",
    status: "failed",
    pipeline: "object_capture",
    shortId: "jkl012",
    modelUrl: null,
    thumbnailUrl: null,
    usdzUrl: null,
    glbUrl: null,
    qualityScore: null,
    scanCount: 0,
    createdAt: "2025-03-02T10:00:00Z",
    updatedAt: "2025-03-02T11:00:00Z",
  },
];

export default function ProductsPage() {
  const t = useTranslations("products");
  const { user } = useAuth();
  const [models, setModels] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("date");

  useEffect(() => {
    async function loadModels() {
      if (!user) return;
      try {
        const data = await getUserModels(user.uid);
        setModels(data);
      } catch {
        setModels(MOCK_MODELS);
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, [user]);

  const filteredAndSorted = useMemo(() => {
    let result = [...models];

    if (filter !== "all") {
      result = result.filter((m) => m.status === filter);
    }

    result.sort((a, b) => {
      switch (sort) {
        case "scans":
          return b.scanCount - a.scanCount;
        case "name":
          return a.name.localeCompare(b.name);
        case "quality":
          return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [models, filter, sort]);

  const filterOptions: FilterKey[] = ["all", "ready", "processing", "failed"];
  const sortOptions: SortKey[] = ["date", "scans", "name", "quality"];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
            {t("title")}
          </h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {t("filter")}
                  {filter !== "all" && (
                    <Badge variant="secondary" className="ml-1">
                      {t(filter)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filterOptions.map((f) => (
                  <DropdownMenuItem key={f} onClick={() => setFilter(f)}>
                    {t(f === "all" ? "all" : f)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  {t("sort")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setSort(s)}>
                    {t(`sortBy${s.charAt(0).toUpperCase() + s.slice(1)}` as "sortByDate" | "sortByScans" | "sortByName" | "sortByQuality")}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/products/new">
              <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                <Plus className="h-4 w-4" />
                {t("newProduct")}
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("noProducts")}</h3>
            <Link href="/products/new" className="mt-4">
              <Button className="gap-2 bg-[#0066FF] hover:bg-[#0052CC] text-white">
                <Plus className="h-4 w-4" />
                {t("newProduct")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map((model) => (
              <ProductCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
