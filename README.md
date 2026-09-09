# ARShot Dashboard

Frontend SaaS d'**ARShot** : création de modèles 3D produits à partir de photos,
visualisation AR sans app (QR code / lien), dashboard multilingue pour e-commerçants.

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · next-intl (FR/EN/ES/DE) · dark mode par défaut.

## Démarrage

```bash
npm install
# créer .env.local (voir variables ci-dessous)
npm run dev                        # http://localhost:3000
```

## Variables d'environnement (`.env.local`)

| Variable | Rôle | Défaut |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend FastAPI | `https://api.arshot.fr` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | `https://ar.arshot.fr` |
| `NEXT_PUBLIC_FIREBASE_*` (×6) | Auth Firebase | — (requis hors démo) |
| `NEXT_PUBLIC_ARSHOT_DEMO` | `true` → mode démo (données + utilisateur démo, auth bypass) | désactivé |

Sans le flag démo et sans config Firebase, l'auth est fail-closed : redirect `/login`.

## Architecture en 30 secondes

- **Création produit (Studio)** : `src/app/[locale]/products/new/page.tsx` — drop de 4 photos max,
  polling réel `GET /api/v1/jobs/{id}` (backoff 3s→8s, timeout 5 min), révélation `<model-viewer>`,
  QR local via `qrcode.react`.
- **Page produit** : onglets Aperçu / Partager / Export, export Amazon
  `GET /api/v1/products/{id}/export/amazon`.
- **AR public** : `public/ar.html` (Quick Look iOS / Scene Viewer Android) +
  route `/ar/[shortId]` qui résout le produit via le backend puis redirige.
- **API** : appels same-origin via les rewrites de `next.config.ts` (`/api/v1/*` → backend) ;
  client et domaines centralisés dans `src/lib/api.ts`.
- **Design tokens** : `src/app/globals.css` (fond `#050508`, accents `#0066FF → #7C3AED`,
  `.glass`, `.bg-aurora`, `.glow-*`, `anim-*`).

## Déploiement

Vercel. Les rewrites API proxifient le backend, donc pas de configuration CORS.

## Tests

Pas de suite frontend. `tests/test_pipeline.py` est un bench manuel Python de segmentation
(`FAL_API_KEY` requis). Voir `CLAUDE.md` pour le détail et la dette connue.
