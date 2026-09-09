"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Box,
  Clapperboard,
  Plug,
} from "lucide-react";
import { signOut } from "@/lib/firebase";
import { useRouter } from "@/i18n/navigation";

const NAV_ITEMS = [
  { key: "dashboard" as const, href: "/dashboard", icon: LayoutDashboard },
  { key: "products" as const, href: "/products", icon: Package },
  { key: "studio" as const, href: "/studio", icon: Clapperboard },
  { key: "integrations" as const, href: "/integrations", icon: Plug },
  { key: "analytics" as const, href: "/analytics", icon: BarChart3 },
  { key: "settings" as const, href: "/settings", icon: Settings },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="glass fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-y-0 border-l-0">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-lg glow-primary">
          <Box className="h-4 w-4 text-white" />
        </div>
        <span className="display-tight text-xl font-bold tracking-tight">
          AR<span className="text-gradient">Shot</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--electric)_30%,transparent)]"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  isActive && "drop-shadow-[0_0_6px_color-mix(in_srgb,var(--electric)_60%,transparent)]"
                )}
              />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {tAuth("logout")}
        </button>
      </div>
    </aside>
  );
}
