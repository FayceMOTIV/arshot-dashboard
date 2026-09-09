"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { getProducts } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter, ArrowUpDown, PackageOpen, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ARModel, ModelStatus } from "@/types";

type SortKey = "date" | "scans" | "name" | "quality";
type FilterKey = "all" | ModelStatus;

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
        const data = await getProducts();
        setModels(data);
      } catch {
        setModels([]);
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
        <div className="anim-fade-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="display-tight text-3xl font-bold">{t("title")}</h1>
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
              <Button className="bg-brand-gradient hover:opacity-90 gap-2 border-0 text-white glow-primary">
                <Plus className="h-4 w-4" />
                {t("addProduct")}
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="glass anim-scale-in relative flex flex-col items-center justify-center overflow-hidden rounded-3xl p-14 text-center">
            <div className="bg-aurora absolute inset-0" />
            <div className="relative space-y-4">
              <div className="bg-brand-gradient anim-float mx-auto flex h-20 w-20 items-center justify-center rounded-3xl glow-primary">
                {models.length === 0 ? (
                  <Sparkles className="h-9 w-9 text-white" />
                ) : (
                  <PackageOpen className="h-9 w-9 text-white" />
                )}
              </div>
              <h3 className="display-tight text-xl font-bold">{t("noProducts")}</h3>
              {models.length === 0 && (
                <Link href="/products/new">
                  <Button className="bg-brand-gradient hover:opacity-90 mt-2 gap-2 border-0 text-white glow-primary">
                    <Plus className="h-4 w-4" />
                    {t("addProduct")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSorted.map((model, i) => (
              <div
                key={model.id}
                className="anim-fade-up"
                style={{ animationDelay: `${Math.min(i, 9) * 60}ms` }}
              >
                <ProductCard model={model} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
