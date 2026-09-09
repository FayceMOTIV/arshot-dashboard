"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithApple,
  IS_AUTH_CONFIGURED,
} from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Box, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

/** Generic FR message — never expose raw Firebase/backend errors. */
function toAuthMessage(): string {
  return "Connexion impossible — vérifiez vos identifiants et réessayez.";
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handle = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn();
      router.push("/dashboard");
    } catch (err) {
      console.error("[auth]", err);
      toast.error(
        err instanceof Error && err.message.includes("non configurée")
          ? err.message
          : toAuthMessage()
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-2xl glow-primary">
          <Box className="h-8 w-8 animate-pulse text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Ambient background */}
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="bg-noise pointer-events-none absolute inset-0" />

      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="anim-fade-up flex items-center gap-3">
          <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl glow-primary">
            <Box className="h-5 w-5 text-white" />
          </div>
          <span className="display-tight text-2xl font-bold tracking-tight">ARShot</span>
        </div>
        <div className="anim-fade-up space-y-6" style={{ animationDelay: "120ms" }}>
          <h1 className="display-tight text-5xl font-bold leading-[1.05]">
            {t("heroLine1")}
            <br />
            <span className="text-gradient">{t("heroLine2")}</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">{t("heroSub")}</p>
          <div className="flex gap-8 pt-4">
            {[
              { value: "60s", label: t("heroStat1") },
              { value: "0 app", label: t("heroStat2") },
              { value: "QR", label: t("heroStat3") },
            ].map((s) => (
              <div key={s.label}>
                <p className="display-tight text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ARShot — FaceMedia Tech Group
        </p>
      </div>

      {/* Right panel — form */}
      <div className="relative flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="glass anim-scale-in w-full max-w-md space-y-8 rounded-3xl p-8 sm:p-10">
          <div className="space-y-2 text-center">
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <div className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl">
                <Box className="h-5 w-5 text-white" />
              </div>
              <span className="display-tight text-xl font-bold">ARShot</span>
            </div>
            <h2 className="display-tight text-2xl font-bold">
              {isSignUp ? t("createAccount") : t("welcomeBack")}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp ? t("createSubtitle") : t("welcomeSubtitle")}
            </p>
          </div>

          {!IS_AUTH_CONFIGURED && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-amber-600 dark:text-amber-400">{t("notConfigured")}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="outline"
              className="h-11 w-full gap-3"
              onClick={() => handle(signInWithGoogle)}
              disabled={loading || !IS_AUTH_CONFIGURED}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("continueWithGoogle")}
            </Button>

            <Button
              variant="outline"
              className="h-11 w-full gap-3"
              onClick={() => handle(signInWithApple)}
              disabled={loading || !IS_AUTH_CONFIGURED}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {t("continueWithApple")}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase text-muted-foreground">
              {t("orContinueWith")}
            </span>
            <Separator className="flex-1" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handle(() =>
                isSignUp
                  ? signUpWithEmail(email, password)
                  : signInWithEmail(email, password)
              );
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="bg-background/50"
              />
            </div>
            <Button
              type="submit"
              className="bg-brand-gradient hover:opacity-90 h-11 w-full border-0 text-white glow-primary"
              disabled={loading || !IS_AUTH_CONFIGURED}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                t("signup")
              ) : (
                t("login")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? t("hasAccount") : t("noAccount")}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? t("login") : t("signup")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
