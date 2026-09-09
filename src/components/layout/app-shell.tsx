"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Box } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
      <Sidebar />
      <div className="relative pl-64">
        <Header />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
