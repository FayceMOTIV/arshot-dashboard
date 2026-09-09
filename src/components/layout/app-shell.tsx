"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Box } from "lucide-react";

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
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-brand-gradient relative flex h-16 w-16 items-center justify-center rounded-2xl glow-primary">
          <Box className="h-8 w-8 animate-pulse text-white" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-aurora pointer-events-none fixed inset-0" />
      <div className="bg-noise pointer-events-none fixed inset-0" />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative lg:pl-64">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
