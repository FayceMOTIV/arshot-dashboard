"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { LOCALE_LABELS, LOCALE_FLAGS, type LOCALES } from "@/lib/i18n";
import type { Locale } from "@/types";

const locales: Locale[] = ["fr", "en", "es", "de"];

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const initials = user?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
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
