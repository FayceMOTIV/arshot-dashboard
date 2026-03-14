"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, ArrowLeft, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// price_id env vars (vides en dev → mode mock)
const PRICE_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY ?? "",
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL ?? "",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? "",
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL ?? "",
  },
  business: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY ?? "",
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL ?? "",
  },
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: "0€", annual: "0€" },
    desc: "Pour tester ARShot",
    highlight: false,
    features: {
      products: "3 produits",
      generations: "3 générés/mois",
      views: "500 vues/mois",
      branding: "Watermark ARShot",
      analytics: false,
      embed: false,
      support: "Communauté",
      api: false,
    },
    cta: "Commencer gratuitement",
    stripeKey: null as keyof typeof PRICE_IDS | null,
  },
  {
    id: "starter",
    name: "Starter",
    price: { monthly: "29€", annual: "24€" },
    desc: "Pour les indépendants",
    highlight: false,
    features: {
      products: "25 produits",
      generations: "25 générés/mois",
      views: "10 000 vues/mois",
      branding: "Badge ARShot",
      analytics: "Basiques",
      embed: true,
      support: "Email",
      api: false,
    },
    cta: "Choisir Starter",
    stripeKey: "starter" as keyof typeof PRICE_IDS,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: "79€", annual: "66€" },
    desc: "Pour les boutiques e-com",
    highlight: true,
    features: {
      products: "100 produits",
      generations: "100 générés/mois",
      views: "100 000 vues/mois",
      branding: "Sans branding",
      analytics: "Avancées",
      embed: true,
      support: "Prioritaire",
      api: false,
    },
    cta: "Choisir Pro",
    stripeKey: "pro" as keyof typeof PRICE_IDS,
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: "199€", annual: "166€" },
    desc: "Pour les marques établies",
    highlight: false,
    features: {
      products: "500 produits",
      generations: "500 générés/mois",
      views: "1 million vues/mois",
      branding: "White-label",
      analytics: "Avancées + export",
      embed: true,
      support: "Account manager",
      api: true,
    },
    cta: "Choisir Business",
    stripeKey: "business" as keyof typeof PRICE_IDS,
  },
];

const ROWS = [
  { key: "products", label: "Produits actifs" },
  { key: "generations", label: "Générations 3D" },
  { key: "views", label: "Vues viewer AR" },
  { key: "branding", label: "Branding" },
  { key: "analytics", label: "Analytics" },
  { key: "embed", label: "Embed codes" },
  { key: "support", label: "Support" },
  { key: "api", label: "Accès API" },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === false) return <X className="h-4 w-4 text-white/20 mx-auto" />;
  if (value === true) return <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />;
  return <span className="text-sm text-white/70">{value}</span>;
}

export default function PricingPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCTA = async (plan: typeof PLANS[number]) => {
    // Free → signup/login
    if (plan.stripeKey === null) {
      router.push(`/${locale}/login`);
      return;
    }

    // Non connecté → login d'abord
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const priceId = PRICE_IDS[plan.stripeKey][period];

    // Mode dev sans price_id → dashboard
    if (!priceId) {
      toast.info("Stripe non configuré en dev — redirection vers le dashboard");
      router.push(`/${locale}/dashboard`);
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const { url } = await createCheckoutSession(priceId, period);
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur Stripe");
    } finally {
      setLoadingPlan(null);
    }
  };

  const CTAButton = ({
    plan,
    highlight,
    fullWidth = true,
    size = "sm" as "sm" | "lg",
  }: {
    plan: typeof PLANS[number];
    highlight: boolean;
    fullWidth?: boolean;
    size?: "sm" | "lg";
  }) => (
    <Button
      size={size}
      variant={highlight ? "default" : "outline"}
      disabled={loadingPlan === plan.id}
      onClick={() => handleCTA(plan)}
      className={`${fullWidth ? "w-full" : ""} ${
        highlight
          ? "bg-violet-600 hover:bg-violet-500 border-0 text-white"
          : "border-white/20 text-white hover:bg-white/5"
      }`}
    >
      {loadingPlan === plan.id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        plan.cta
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-10">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-4">Tarifs simples et transparents</h1>
          <p className="text-white/50 text-lg">Commencez gratuitement. Évoluez sans friction.</p>
          <p className="text-xs text-white/30 mt-2">
            Tous les prix sont HT · TVA française applicable
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center gap-1 mt-6 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === "monthly" ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setPeriod("annual")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === "annual" ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Annuel
              <span className="ml-1.5 text-xs text-emerald-400 font-semibold">-20%</span>
            </button>
          </div>
        </div>

        {/* Cards mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-violet-500/50 bg-violet-500/8 ring-1 ring-violet-500/30"
                  : "border-white/8 bg-white/3"
              }`}
            >
              {plan.highlight && (
                <Badge className="self-start mb-3 bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                  Populaire
                </Badge>
              )}
              <p className="text-sm text-white/40 mb-1">{plan.name}</p>
              <p className="text-3xl font-extrabold">
                {plan.price[period]}
                <span className="text-sm font-normal text-white/30">/mois</span>
              </p>
              {period === "annual" && plan.stripeKey && (
                <p className="text-xs text-emerald-400 mb-1">Économisez 20%</p>
              )}
              <p className="text-sm text-white/50 mb-5">{plan.desc}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {ROWS.map((row) => {
                  const val = plan.features[row.key as keyof typeof plan.features];
                  if (val === false) return null;
                  return (
                    <li key={row.key} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-white/60">
                        {row.label} : {val === true ? "✓" : val}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <CTAButton plan={plan} highlight={plan.highlight} />
            </div>
          ))}
        </div>

        {/* Table desktop */}
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-white/8 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left p-5 text-white/40 font-medium w-48">Fonctionnalité</th>
                {PLANS.map((plan) => (
                  <th key={plan.name} className="p-5 text-center">
                    <div className={`rounded-xl p-4 ${plan.highlight ? "bg-violet-500/10 border border-violet-500/30" : ""}`}>
                      {plan.highlight && (
                        <Badge className="mb-2 bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                          Populaire
                        </Badge>
                      )}
                      <p className="font-bold text-base">{plan.name}</p>
                      <p className="text-2xl font-extrabold mt-1">
                        {plan.price[period]}
                        <span className="text-xs font-normal text-white/30">/mois</span>
                      </p>
                      {period === "annual" && plan.stripeKey && (
                        <p className="text-xs text-emerald-400 mt-0.5">Économisez 20%</p>
                      )}
                      <div className="mt-3">
                        <CTAButton plan={plan} highlight={plan.highlight} />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.key} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/1" : ""}`}>
                  <td className="p-4 text-white/50 font-medium">{row.label}</td>
                  {PLANS.map((plan) => (
                    <td key={plan.name} className="p-4 text-center">
                      <FeatureValue value={plan.features[row.key as keyof typeof plan.features]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold mb-6 text-center">Questions fréquentes</h2>
          {[
            {
              q: "Faut-il une carte bancaire pour le plan Free ?",
              a: "Non. Le plan Free est gratuit sans engagement et sans carte bancaire.",
            },
            {
              q: "Puis-je changer de plan à tout moment ?",
              a: "Oui, upgrade ou downgrade à tout moment depuis votre espace facturation.",
            },
            {
              q: "La génération 3D fonctionne avec n'importe quel type de produit ?",
              a: "Oui — meubles, chaussures, bijoux, électronique, alimentaire... Notre IA s'adapte à tous les types de produits.",
            },
            {
              q: "Les modèles 3D sont-ils compatibles avec Shopify ?",
              a: "Oui. Vous pouvez exporter vos modèles en GLB directement dans Shopify Admin.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-white/8 bg-white/3 p-5">
              <p className="font-medium mb-2">{q}</p>
              <p className="text-sm text-white/50">{a}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/20 mt-12">
          ARShot SAS · SIRET en cours · TVA FR · Support : support@arshot.fr
        </p>
      </div>
    </div>
  );
}
