import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SetLocale } from "@/components/set-locale";
import { CookieBanner } from "@/components/CookieBanner";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <Providers>
      <NextIntlClientProvider messages={messages}>
        <SetLocale locale={locale} />
        {children}
        <Toaster position="top-right" />
        <CookieBanner />
      </NextIntlClientProvider>
    </Providers>
  );
}
