# ARShot Dashboard — SaaS AR B2B

## Projet
Dashboard multilingue (FR/EN/ES/DE) pour e-commerçants.
Permet de créer des expériences AR pour leurs produits.

## Stack
- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS + shadcn/ui
- next-intl (i18n) + next-themes (dark mode)
- Firebase Auth (email/password, Google, Apple)
- Recharts (graphiques), qrcode.react (QR)
- Framer Motion (animations)

## Pages — COMPLÉTÉES
- [x] `/[locale]/login` — Auth Firebase (email, Google, Apple)
- [x] `/[locale]/dashboard` — Stats, AR Score, graphique scans
- [x] `/[locale]/products` — Grille responsive, filtres, tri
- [x] `/[locale]/products/[id]` — Preview 3D, QR code, embed codes
- [x] `/[locale]/products/new` — Upload drag & drop, polling statut
- [x] `/[locale]/analytics` — Pie chart devices, stats pays, top 10
- [x] `/[locale]/settings` — Profil, langue, thème, Stripe Portal
- [x] `/ar/[shortId]` — Viewer AR public ultra-léger

## Architecture
```
src/
  app/
    [locale]/        → Pages authentifiées (next-intl)
    ar/[shortId]/    → Viewer AR public
  components/
    layout/          → Sidebar, Header, AppShell
    dashboard/       → StatsCards, ARScore, ScansChart
    products/        → ProductCard, ModelViewerElement
    ui/              → shadcn/ui components
  hooks/useAuth.ts   → Firebase auth hook
  lib/
    api.ts           → API client (backend FastAPI)
    firebase.ts      → Firebase config + auth
    i18n.ts          → Locale/devise utils
  types/index.ts     → Tous les types
  i18n/              → next-intl config
  middleware.ts      → i18n routing middleware
messages/            → fr.json, en.json, es.json, de.json
```

## Backend (ne pas modifier)
- FastAPI dans ../arshot-backend
- GET /models/user/{userId}
- POST /models/generate
- GET /models/{id}
- POST /scans/track

## Design
- Primary: #0066FF
- Fond clair: #FAFAFA / Fond sombre: #0A0A0A
- Fonts: Geist (titres) + Inter (corps)
