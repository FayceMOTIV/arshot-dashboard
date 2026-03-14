"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { getStripePortalUrl } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/i18n";
import type { Locale } from "@/types";

const locales: Locale[] = ["fr", "en", "es", "de"];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tPlans = useTranslations("plans");
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale: locale as Locale });
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setLoadingPortal(true);
    try {
      const { url } = await getStripePortalUrl(user.uid);
      window.open(url, "_blank");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      toast.error(message);
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-geist)]">
          {t("title")}
        </h1>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
              <User className="h-5 w-5" />
              {t("profile")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                value={user?.displayName || ""}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input
                value={user?.email || ""}
                readOnly
                className="bg-muted"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("language")}</Label>
              <Select onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {LOCALE_FLAGS[loc]} {LOCALE_LABELS[loc]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("theme")}</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  className={theme === "light" ? "gap-2 bg-[#0066FF] text-white" : "gap-2"}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4" />
                  {t("light")}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  className={theme === "dark" ? "gap-2 bg-[#0066FF] text-white" : "gap-2"}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4" />
                  {t("dark")}
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  className={theme === "system" ? "gap-2 bg-[#0066FF] text-white" : "gap-2"}
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-4 w-4" />
                  {t("system")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-[family-name:var(--font-geist)]">
              <CreditCard className="h-5 w-5" />
              {t("subscription")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("currentPlan")}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-[#0066FF]/10 text-[#0066FF]">
                    {tPlans("pro")}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleManageBilling}
                disabled={loadingPortal}
              >
                {loadingPortal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {t("manageSubscription")}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleManageBilling}
                disabled={loadingPortal}
              >
                {loadingPortal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {t("manageBilling")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
