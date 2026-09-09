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
  Clapperboard,
  Plug,
  X,
} from "lucide-react";
import { signOut } from "@/lib/firebase";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
const NAV_ITEMS = [
  { key: "dashboard" as const, href: "/dashboard", icon: LayoutDashboard },
  { key: "products" as const, href: "/products", icon: Package },
  { key: "studio" as const, href: "/studio", icon: Clapperboard },
  { key: "integrations" as const, href: "/integrations", icon: Plug },
  { key: "analytics" as const, href: "/analytics", icon: BarChart3 },
  { key: "settings" as const, href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const nav = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <span className="display-tight text-2xl">
          ARShot<span className="text-[var(--electric)]">.</span>
        </span>
        {onClose && (
          <button
            className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-4 py-5">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors duration-300",
                isActive
                  ? "border-[var(--electric)] bg-accent/60 font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors duration-300",
                  isActive && "text-[var(--electric)]"
                )}
              />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {tAuth("logout")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        {nav}
      </aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-500 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
      >
        {nav}
      </aside>
    </>
  );
}
