"use client";

import { useEffect } from "react";

// Stores the current locale in a cookie so server components can read it
export function SetLocale({ locale }: { locale: string }) {
  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
  }, [locale]);

  return null;
}
