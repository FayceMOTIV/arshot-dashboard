"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_KEY = "arshot_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-background/95 backdrop-blur-sm shadow-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">🍪 Cookies</span>{" "}
          Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic.{" "}
          <a href="/fr/legal/privacy" className="underline hover:text-foreground">
            En savoir plus
          </a>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            Refuser
          </Button>
          <Button size="sm" onClick={accept}>
            Accepter
          </Button>
        </div>
        <button
          onClick={decline}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground sm:hidden"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
