"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { Sun, Moon, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/i18n";
import type { Locale } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const locales: Locale[] = ["fr", "en", "es", "de"];

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, unreadCount, markAllRead } = useNotifications(
    user?.uid
  );

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Keyboard shortcut hint */}
      <button
        className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
        onClick={() => {
          const evt = new KeyboardEvent("keydown", {
            key: "k",
            metaKey: true,
            bubbles: true,
          });
          window.dispatchEvent(evt);
        }}
      >
        <span>Recherche rapide</span>
        <kbd className="rounded border border-border px-1 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      {/* Notifications */}
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open && unreadCount > 0) markAllRead();
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#0066FF] hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Aucune notification
            </p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start gap-0.5 px-3 py-2 cursor-pointer",
                  !n.read && "bg-[#0066FF]/5"
                )}
                onClick={() => router.push(`/products/${n.productId}`)}
              >
                <span className="text-xs font-medium">
                  {n.type === "model_ready" ? "✅" : "❌"} {n.productName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {n.type === "model_ready"
                    ? "Modèle 3D prêt"
                    : "Génération échouée"}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => router.replace(pathname, { locale: loc })}
            >
              {LOCALE_FLAGS[loc]} {LOCALE_LABELS[loc]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {/* User avatar */}
      <Link href="/settings">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.photoURL || undefined} />
          <AvatarFallback className="bg-[#0066FF] text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
