"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="relative flex h-screen items-center justify-center bg-background">
        <div className="relative flex flex-col items-center gap-4">
          <span className="display-tight text-4xl">
            ARShot<span className="text-[var(--electric)]">.</span>
          </span>
          <span className="h-px w-16 animate-pulse bg-[var(--electric)]" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-noise pointer-events-none fixed inset-0" />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative lg:pl-64">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
