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
  CreditCard,
  Target,
  ShieldAlert,
  Scale,
  Store,
} from "lucide-react";
import { signOut } from "@/lib/firebase";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { key: "dashboard" as const, href: "/dashboard", icon: LayoutDashboard },
  { key: "products" as const, href: "/products", icon: Package },
  { key: "studio" as const, href: "/studio", icon: Clapperboard },
  { key: "prospection" as const, href: "/dashboard/prospection", icon: Target },
  { key: "integrations" as const, href: "/integrations", icon: Plug },
  { key: "analytics" as const, href: "/analytics", icon: BarChart3 },
  { key: "compare" as const, href: "/compare", icon: Scale },
  { key: "billing" as const, href: "/dashboard/billing", icon: CreditCard },
  { key: "settings" as const, href: "/settings", icon: Settings },
];

const ADMIN_ITEMS = [
  { key: "admin" as const, href: "/dashboard/admin", icon: ShieldAlert },
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Box className="h-7 w-7 text-[#0066FF]" />
        <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-geist)]">
          ARShot
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#0066FF]/10 text-[#0066FF]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 pt-3 pb-1 space-y-1">
        {ADMIN_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-amber-600/70 dark:text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(key)}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {tAuth("logout")}
        </Button>
      </div>
    </aside>
  );
}
