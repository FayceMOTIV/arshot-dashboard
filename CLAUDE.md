# ARShot Dashboard — Guide agent (Claude Code)

> Point d'entrée pour les agents IA. Décrit le code RÉEL de ce repo, pas la vision.
> Si ce fichier contredit le code, le code gagne — corrige la ligne.

## Ce que c'est

Frontend SaaS du produit **ARShot** : les commerçants uploadent des photos de produit,
le backend génère un modèle 3D, et le client final le visualise en AR via QR code / lien
(sans app à installer — AR Quick Look iOS, Scene Viewer Android).

- Repo : `github.com/FayceMOTIV/arshot-dashboard` — branche par défaut : `main`.
  Une vieille lignée est archivée sous la branche `archive/legacy-master`.
- Dev local : `~/dev/arshot-dashboard`, `npm install`, `npm run dev` (port 3000).
- Déploiement : Vercel (les rewrites API de `next.config.ts` proxifient le backend).

## Stack réelle

- **Next.js 16.1.6** (App Router, Turbopack) + **React 19** + TypeScript strict
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) + `tw-animate-css`
- **shadcn/ui** (radix-ui, cva, clsx, tailwind-merge) — composants dans `src/components/ui/`
- **next-intl v4** — locales FR/EN/ES/DE (`messages/{fr,en,es,de}.json`,
  config `src/i18n/request.ts`). FR/EN complets ; ES/DE partiellement en fallback EN.
- **next-themes** — dark mode PAR DÉFAUT
- Geist (next/font), framer-motion, sonner (toasts), qrcode.react, recharts,
  lucide-react, `@ffmpeg/ffmpeg` (Studio), `@google/model-viewer` chargé côté pages produit/AR

## Design system

Tokens centralisés dans `src/app/globals.css` (Tailwind v4 `@theme`) :

- Fond sombre `#050508`, accents dégradé `#0066FF` → `#7C3AED`
- Utilitaires maison : `.glass`, `.bg-aurora`, `.bg-grid`, `.bg-noise`, `.glow-*`,
  animations `anim-*`
- **Ne pas disperser de couleurs en dur** dans les composants : utiliser les tokens.

## Parcours clés (code réel)

- **Création produit en 1 écran (Studio)** : `src/app/[locale]/products/new/page.tsx`
  - Drop multi-photos (4 max), nom auto-suggéré
  - Progression réelle branchée sur `GET /api/v1/jobs/{id}` — polling backoff 3s → ×1.35,
    cap 8s, timeout dur 5 min
  - Révélation du modèle via `<model-viewer>`
  - QR généré en local avec `qrcode.react` (plus d'API QR externe)
- **Page produit** : `src/app/[locale]/products/[id]/page.tsx`
  - Onglets Aperçu / Partager / Export
  - Export Amazon : `GET /api/v1/products/{id}/export/amazon`, avec warnings de specs
- **Viewer AR public** : `public/ar.html`
  - Paramètres `?glb= ?usdz= ?name= ?id=`, QR desktop généré en JS inline,
    tracking de scan, Quick Look iOS / Scene Viewer Android
  - Route `/ar/[shortId]` (`src/app/ar/[shortId]/page.tsx`) : résout le produit via
    `GET /api/v1/qr/{shortId}` côté backend puis redirect vers `ar.html`.
    Pages d'erreur brandées.
- **Mode démo** : `NEXT_PUBLIC_ARSHOT_DEMO=true` → données démo + utilisateur démo
  (bypass auth, `IS_DEMO` dans `src/lib/api.ts`). SANS ce flag : mocks désactivés et
  auth **fail-closed** — pas de config Firebase → redirect `/login` avec bannière.

## Backend attendu

FastAPI sur `NEXT_PUBLIC_API_URL` (défaut `https://api.arshot.fr`). Les appels passent par
les rewrites same-origin de `next.config.ts` (`/api/v1/:path*` → backend), donc pas de CORS.
Endpoints `/api/v1/*` : products, jobs, ar, qr, analytics, studio, style, integrations…
Domaines publics centralisés dans `src/lib/api.ts` (`APP_URL`, `getArLink()`).

## Variables d'environnement (`.env.local` requis)

```env
NEXT_PUBLIC_API_URL=            # défaut https://api.arshot.fr
NEXT_PUBLIC_APP_URL=            # défaut https://ar.arshot.fr
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ARSHOT_DEMO=        # "true" pour activer le mode démo
```

## Structure

```
src/
├── app/
│   ├── globals.css            # tokens design (source unique)
│   ├── [locale]/              # dashboard, products, products/new, products/[id],
│   │                          # analytics, integrations, settings, studio, login
│   └── ar/[shortId]/          # résolution shortId → redirect ar.html
├── components/                # ui/ (shadcn), layout/, products/, studio/, style-match/
├── i18n/                      # config next-intl
├── lib/                       # api.ts (client API + domaines), firebase.ts, i18n.ts, utils.ts
├── hooks/, types/
└── middleware.ts              # routing locales
public/ar.html                 # viewer AR public autonome
messages/                      # fr/en/es/de.json
```

## Tests

- **Pas de suite de tests frontend.**
- `tests/test_pipeline.py` : script manuel Python de bench segmentation
  (BRIA RMBG-2.0 vs BiRefNet, `FAL_API_KEY` via env). Résultats : `tests/RAPPORT.md`.
- Playwright possible via le workspace MO (tests manuels, captures dans `/tmp`).

## Dette connue (honnête)

- `tsc --noEmit` non revérifié depuis la refonte UX du 08-09/09/2026
  (node_modules indisponible à ce moment-là)
- i18n ES/DE à compléter (fallback EN partiel)
- Pas de tests E2E automatisés
- `.env.local` requis en local (aucun `.env.example` versionné)

## Règles

- Conventional Commits (`feat:`, `fix:`, `docs:`…)
- Zéro `any` TypeScript
- Erreurs API : messages FR génériques côté client (`friendlyError` dans `src/lib/api.ts`),
  détail en console uniquement
- Noms internes jamais exposés au client final
