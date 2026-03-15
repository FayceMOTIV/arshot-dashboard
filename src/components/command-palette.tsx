"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Clapperboard,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  products?: { id: string; name: string }[];
}

export function CommandPalette({ products = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const staticItems: CommandItem[] = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      action: () => router.push("/dashboard"),
      shortcut: "⌘D",
    },
    {
      id: "products",
      label: "Mes produits",
      icon: Package,
      action: () => router.push("/products"),
    },
    {
      id: "new-product",
      label: "Nouveau produit",
      description: "Créer un nouveau produit AR",
      icon: Plus,
      action: () => router.push("/products/new"),
      shortcut: "⌘N",
    },
    {
      id: "studio",
      label: "ARShot Studio",
      icon: Clapperboard,
      action: () => router.push("/studio"),
    },
    {
      id: "analytics",
      label: "Analytiques",
      icon: BarChart3,
      action: () => router.push("/analytics"),
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      action: () => router.push("/settings"),
    },
  ];

  const productItems: CommandItem[] = products.map((p) => ({
    id: `product-${p.id}`,
    label: p.name,
    description: "Voir le produit",
    icon: Package,
    action: () => router.push(`/products/${p.id}`),
  }));

  const allItems = [...staticItems, ...productItems];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : staticItems;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((item: CommandItem) => {
    item.action();
    setOpen(false);
    setQuery("");
  }, []);

  // Global keyboard shortcuts (when palette is closed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n" && !open) {
        e.preventDefault();
        router.push("/products/new");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && !open) {
        e.preventDefault();
        router.push("/dashboard");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, router]);

  // Navigation keyboard shortcuts (when palette is open)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelect(filtered[selectedIndex]);
      } else if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex, handleSelect]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Rechercher une page ou un produit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat
            </p>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                    i === selectedIndex
                      ? "bg-[#0066FF]/10 text-[#0066FF]"
                      : "text-foreground hover:bg-accent"
                  )}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      i === selectedIndex
                        ? "bg-[#0066FF] text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.shortcut && (
                    <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>↑↓ Naviguer</span>
          <span>↵ Sélectionner</span>
          <span>⌘K Fermer</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
